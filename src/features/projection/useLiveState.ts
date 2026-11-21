"use client";

import { useEffect, useState } from "react";
import type { LiveStateData } from "./live-state";

/**
 * Polls the live projection state. Shared by the audience program page,
 * the display surface, and admin previews. Pauses while the tab is hidden
 * and resumes immediately when it becomes visible again.
 */

const DEFAULT_INTERVAL_MS = 2000;

export function useLiveState(
  eventId: string,
  initialState: LiveStateData | null,
  options: { intervalMs?: number } = {},
) {
  const { intervalMs = DEFAULT_INTERVAL_MS } = options;
  const [state, setState] = useState<LiveStateData | null>(initialState);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
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
        // Network hiccup — keep the last known state and retry next tick.
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") void poll();
    }

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void poll();
    }, intervalMs);

    document.addEventListener("visibilitychange", onVisibilityChange);
    void poll();

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [eventId, intervalMs]);

  return state;
}
