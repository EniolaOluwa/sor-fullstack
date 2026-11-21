"use client";

import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { useLiveState } from "@/features/projection/useLiveState";
import { songQrPath } from "@/lib/urls";
import styles from "./SongsList.module.css";

export type SongListItem = {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  songKey: string | null;
};

type SongsListProps = {
  eventId: string;
  songs: SongListItem[];
};

export default function SongsList({ eventId, songs }: SongsListProps) {
  const live = useLiveState(eventId, null);
  const currentSongId = live?.mode === "song" ? live.songId : null;

  return (
    <ul className={styles.list}>
      {songs.map((song) => (
        <li key={song.id}>
          <Link href={`/songs/${song.slug}`} className={styles.card}>
            <Image
              src={songQrPath(song.slug)}
              alt={`QR code for ${song.title}`}
              width={88}
              height={88}
              unoptimized
              className={styles.qr}
            />
            <div className={styles.info}>
              <div className={styles.titleRow}>
                <span className={styles.title}>{song.title}</span>
                {song.id === currentSongId && <Badge tone="gold">Now singing</Badge>}
              </div>
              <span className={styles.meta}>
                {[song.author, song.songKey && `Key ${song.songKey}`]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              <span className={styles.hint}>Sing along →</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
