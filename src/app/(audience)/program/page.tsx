import type { Metadata } from "next";
import { Suspense } from "react";
import { getActiveEvent } from "@/server/services/events";
import {
  listProgramItemIdsWithSongs,
  listProgramItems,
} from "@/server/services/program";
import { getLiveState } from "@/server/services/live";
import { toLiveStateData } from "@/features/projection/live-state";
import ProgramList from "@/features/program/ProgramList";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Order of Service — Sound of Revival",
};

export default async function ProgramPage() {
  const event = await getActiveEvent();

  if (!event) {
    return (
      <p className={styles.empty}>The order of service will appear here soon.</p>
    );
  }

  const [items, lyricsItemIds] = await Promise.all([
    listProgramItems(event.id),
    listProgramItemIdsWithSongs(event.id),
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <p className={styles.kicker}>Order of Service</p>
        <h1 className={styles.title}>Sound of Revival</h1>
        <p className={styles.intro}>
          Follow along as the service unfolds — the current item is highlighted
          live.
        </p>
      </header>

      {items.length === 0 ? (
        <p className={styles.empty}>
          The order of service will appear here soon.
        </p>
      ) : (
        <Suspense
          fallback={
            <ProgramList
              eventId={event.id}
              items={items}
              lyricsItemIds={lyricsItemIds}
              initialLiveState={null}
            />
          }
        >
          <LiveProgram
            eventId={event.id}
            items={items}
            lyricsItemIds={lyricsItemIds}
          />
        </Suspense>
      )}
    </div>
  );
}

async function LiveProgram({
  eventId,
  items,
  lyricsItemIds,
}: {
  eventId: string;
  items: Awaited<ReturnType<typeof listProgramItems>>;
  lyricsItemIds: string[];
}) {
  const state = await getLiveState(eventId);

  return (
    <ProgramList
      eventId={eventId}
      items={items}
      lyricsItemIds={lyricsItemIds}
      initialLiveState={toLiveStateData(state)}
    />
  );
}
