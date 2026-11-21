import type { Metadata } from "next";
import Link from "next/link";
import QrCode from "@/components/ui/QrCode";
import PrintButton from "@/features/songs/PrintButton";
import { getActiveEvent } from "@/server/services/events";
import { listSongsFresh } from "@/server/services/songs";
import { songUrl } from "@/lib/urls";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Song QR sheet — Admin",
};

export default async function QrSheetPage() {
  const event = await getActiveEvent();

  if (!event) {
    return <p>No active event.</p>;
  }

  const songs = await listSongsFresh(event.id);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Song QR sheet</h1>
          <p className={styles.hint}>
            {songs.length} songs · print or project this sheet so the
            congregation can scan and sing along.
          </p>
        </div>
        <div className={styles.actions}>
          <Link href="/admin/songs" className={styles.backLink}>
            ← Back to songs
          </Link>
          <PrintButton />
        </div>
      </header>

      <ul className={styles.grid}>
        {songs.map((song) => (
          <li key={song.id} className={styles.card}>
            <QrCode
              slug={song.slug}
              size={180}
              className={styles.qr}
              alt={`QR code for ${song.title}`}
            />
            <p className={styles.songTitle}>{song.title}</p>
            <p className={styles.songMeta}>{songUrl(song.slug)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
