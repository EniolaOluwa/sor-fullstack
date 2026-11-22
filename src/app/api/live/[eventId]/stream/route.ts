import {
  toLiveStateData,
  type LiveStateData,
} from "@/features/projection/live-state";
import { sql } from "@/server/db/client";
import { getLiveState, LIVE_CHANNEL } from "@/server/services/live";

/**
 * Server-Sent Events stream of the live projection state. One Postgres
 * `LISTEN` per server process fans out to every connected client; each client
 * gets the current snapshot on connect, then updates as they happen.
 */

const listeners = new Set<(payload: string) => void>();
let listening: Promise<void> | null = null;

function ensureListening(): Promise<void> {
  if (!listening) {
    listening = sql
      .listen(LIVE_CHANNEL, (payload) => {
        for (const listener of listeners) listener(payload);
      })
      .then(() => undefined)
      .catch(() => {
        listening = null;
      });
  }
  return listening;
}

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/live/[eventId]/stream">,
) {
  const { eventId } = await ctx.params;
  const encoder = new TextEncoder();
  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;

      const send = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };

      const sendState = (state: LiveStateData | null) =>
        send(`data: ${JSON.stringify({ state })}\n\n`);

      sendState(toLiveStateData(await getLiveState(eventId)));

      const onPayload = (payload: string) => {
        try {
          const data = JSON.parse(payload) as LiveStateData;
          if (data?.eventId !== eventId) return;
          sendState(data);
        } catch {
          // ignore malformed payloads
        }
      };

      await ensureListening();
      listeners.add(onPayload);

      const keepAlive = setInterval(() => send(": keepalive\n\n"), 25000);

      cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(keepAlive);
        listeners.delete(onPayload);
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      request.signal.addEventListener("abort", () => cleanup?.());
    },
    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
