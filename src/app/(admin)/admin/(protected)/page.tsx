import type { Metadata } from "next";
import { formatEventDate } from "@/lib/format";
import { getActiveEvent } from "@/server/services/events";
import { getLiveState } from "@/server/services/live";
import { listPosts } from "@/server/services/posts";
import { listProgramItemsFresh } from "@/server/services/program";
import { listSongs } from "@/server/services/songs";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Dashboard — Sound of Revival",
};

export default async function AdminDashboardPage() {
  const event = await getActiveEvent();

  if (!event) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Dashboard</h1>
        <div className={styles.card}>
          <p className={styles.cardLabel}>No active event</p>
          <p className={styles.meta}>
            Seed the database with <code>yarn db:seed</code> to get started.
          </p>
        </div>
      </div>
    );
  }

  const [items, songs, posts, live] = await Promise.all([
    listProgramItemsFresh(event.id, { includeHidden: true }),
    listSongs(event.id, { includeHidden: true }),
    listPosts(event.id, { includeHidden: true }),
    getLiveState(event.id),
  ]);

  const currentItem = live?.programItemId
    ? items.find((item) => item.id === live.programItemId)
    : null;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.grid}>
        <section className={styles.card}>
          <p className={styles.cardLabel}>Event</p>
          <p className={styles.eventTitle}>{event.title}</p>
          <p className={styles.meta}>
            {event.startsAt ? formatEventDate(event.startsAt) : null}
            {event.venue ? ` · ${event.venue}` : null}
          </p>
          <p className={styles.counts}>
            {items.length} program items · {songs.length} songs · {posts.length}{" "}
            posts
          </p>
        </section>

        <section className={styles.card}>
          <p className={styles.cardLabel}>Live now</p>
          <p className={styles.liveValue}>
            {liveLabel(live?.mode ?? "idle", currentItem?.title)}
          </p>
          <p className={styles.meta}>
            The audience program page and the projector follow this
            automatically.
          </p>
        </section>
      </div>

      <p className={styles.note}>
        Program, song, and post management screens land here next.
      </p>
    </div>
  );
}

function liveLabel(
  mode: "idle" | "program" | "post" | "song" | "qr",
  currentItemTitle?: string,
): string {
  switch (mode) {
    case "program":
      return currentItemTitle ? `Program — ${currentItemTitle}` : "Program";
    case "post":
      return "Social post";
    case "song":
      return "Song";
    case "qr":
      return "Song QR codes";
    default:
      return "Idle";
  }
}
