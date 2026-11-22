import { z } from "zod";
import { isBot, parseDevice } from "@/lib/device";
import { recordVisit } from "@/server/services/analytics";

/**
 * First-party page-view beacon. Called from the audience surface only.
 * No IP addresses are stored.
 */

const bodySchema = z.object({
  path: z.string().trim().min(1).max(300).startsWith("/"),
  visitorId: z.string().uuid(),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return new Response(null, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  if (isBot(userAgent)) {
    return new Response(null, { status: 204 });
  }

  const { deviceType, os, browser } = parseDevice(userAgent);

  try {
    await recordVisit({
      visitorId: parsed.data.visitorId,
      path: parsed.data.path,
      deviceType,
      os,
      browser,
      userAgent,
    });
  } catch {
    // Analytics must never break the page.
  }

  return new Response(null, { status: 204 });
}
