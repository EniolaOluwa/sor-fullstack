"use client";

import { useLiveState } from "@/features/projection/useLiveState";
import Badge from "@/components/ui/Badge";

type NowSingingBadgeProps = {
  eventId: string;
  songId: string;
};

export default function NowSingingBadge({
  eventId,
  songId,
}: NowSingingBadgeProps) {
  const live = useLiveState(eventId, null);

  if (live?.mode !== "song" || live.songId !== songId) return null;

  return <Badge tone="gold">Now singing</Badge>;
}
