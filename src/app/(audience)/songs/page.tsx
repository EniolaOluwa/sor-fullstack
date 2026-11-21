import type { Metadata } from "next";
import { getActiveEvent } from "@/server/services/events";
import { listSongs } from "@/server/services/songs";
import SongsList from "@/features/songs/SongsList";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Songs — Sound of Revival",
};

export default async function SongsPage() {
  const event = await getActiveEvent();

  if (!event) {
    return <p className={styles.empty}>The songbook will appear here soon.</p>;
  }

  const songs = await listSongs(event.id);

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <p className={styles.kicker}>Participant Songbook</p>
        <h1 className={styles.title}>Songs</h1>
        <p className={styles.intro}>
          Scan a QR code with your phone camera to open the lyrics and sing
          along.
        </p>
      </header>

      {songs.length === 0 ? (
        <p className={styles.empty}>The songbook will appear here soon.</p>
      ) : (
        <SongsList eventId={event.id} songs={songs} />
      )}
    </div>
  );
}
