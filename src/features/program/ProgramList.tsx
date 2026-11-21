"use client";

import { useLiveState } from "@/features/projection/useLiveState";
import type { LiveStateData } from "@/features/projection/live-state";
import ProgramItem, {
  type ProgramItemData,
  type ProgramItemState,
} from "./ProgramItem";
import styles from "./ProgramList.module.css";

type ProgramListProps = {
  eventId: string;
  items: ProgramItemData[];
  initialLiveState: LiveStateData | null;
};

export default function ProgramList({
  eventId,
  items,
  initialLiveState,
}: ProgramListProps) {
  const live = useLiveState(eventId, initialLiveState);

  const currentIndex =
    live?.mode === "program" && live.programItemId
      ? items.findIndex((item) => item.id === live.programItemId)
      : -1;

  function stateFor(index: number): ProgramItemState {
    if (currentIndex === -1) return "upcoming";
    if (index < currentIndex) return "done";
    if (index === currentIndex) return "current";
    return "upcoming";
  }

  return (
    <ol className={styles.list}>
      {items.map((item, index) => (
        <ProgramItem
          key={item.id}
          index={index + 1}
          item={item}
          state={stateFor(index)}
        />
      ))}
    </ol>
  );
}
