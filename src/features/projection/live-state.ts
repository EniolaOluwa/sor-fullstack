import type { LiveMode } from "@/server/db/schema";

/**
 * Serializable live-state shape shared by the polling endpoint, the
 * `useLiveState` hook, and server components that pass an initial value.
 * Dates are ISO strings so the same type works over JSON and RSC.
 */

export type LiveStateData = {
  eventId: string;
  mode: LiveMode;
  programItemId: string | null;
  songId: string | null;
  postId: string | null;
  message: string | null;
  updatedAt: string;
};

export function toLiveStateData(
  state: {
    eventId: string;
    mode: LiveMode;
    programItemId: string | null;
    songId: string | null;
    postId: string | null;
    message: string | null;
    updatedAt: Date;
  } | null,
): LiveStateData | null {
  if (!state) return null;

  return { ...state, updatedAt: state.updatedAt.toISOString() };
}
