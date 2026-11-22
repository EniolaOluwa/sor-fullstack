"use client";

import { useEffect, useState } from "react";
import type { LiveStateData } from "./live-state";

/**
 * Subscribes to the live projection state over Server-Sent Events. Shared by
 * the audience program page and the songs list. Falls back to polling where
 * EventSource is unavailable, and re-syncs whenever the tab becomes visible
 * (mobile browsers may suspend the stream in the background).
 */

const FALLBACK_INTERVAL_MS = 2000;

export function useLiveState(
  eventId: string,
  initialState: LiveStateData | null,
) {
  const [state, setState] = useState<LiveStateData | null>(initialState);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const response = await fetch(`/api/live/${eventId}`, {
          cache: "no-store",
        });
        if (!response.ok) return;

        const data = (await response.json()) as {
          state: LiveStateData | null;
        };
        if (!cancelled) setState(data.state);
      } catch {
        // Network hiccup — keep the last known state.
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") void refresh();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    let source: EventSource | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;

    if (typeof EventSource !== "undefined") {
      source = new EventSource(`/api/live/${eventId}/stream`);
      source.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as {
            state: LiveStateData | null;
          };
          if (!cancelled) setState(data.state);
        } catch {
          // ignore malformed events
        }
      };
    } else {
      timer = setInterval(() => {
        if (document.visibilityState === "visible") void refresh();
      }, FALLBACK_INTERVAL_MS);
      void refresh();
    }

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      source?.close();
      if (timer) clearInterval(timer);
    };
  }, [eventId]);

  return state;
}
