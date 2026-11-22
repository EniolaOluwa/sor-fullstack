import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SetLyricsView from "@/features/program/SetLyricsView";
import { getActiveEvent } from "@/server/services/events";
import {
  getProgramItem,
  listProgramItemSongs,
} from "@/server/services/program";
import styles from "./page.module.css";

export async function generateMetadata({
  params,
}: PageProps<"/program/[id]/lyrics">): Promise<Metadata> {
  const { id } = await params;
  const event = await getActiveEvent();
  if (!event) return {};

  const item = await getProgramItem(event.id, id);
  return { title: item ? `${item.title} — Lyrics` : "Lyrics" };
}

export default function SetLyricsPage({
  params,
}: PageProps<"/program/[id]/lyrics">) {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <p className={styles.loading}>Loading lyrics…</p>
        </div>
      }
    >
      <SetContent params={params} />
    </Suspense>
  );
}

async function SetContent({
  params,
}: Pick<PageProps<"/program/[id]/lyrics">, "params">) {
  const { id } = await params;

  const event = await getActiveEvent();
  if (!event) notFound();

  const item = await getProgramItem(event.id, id);
  if (!item || !item.isVisible) notFound();

  const songs = await listProgramItemSongs(event.id, id);
  if (songs.length === 0) notFound();

  return (
    <article className={styles.page}>
      <Link href="/program" className={styles.backLink}>
        ← Order of service
      </Link>

      <header className={styles.heading}>
        <p className={styles.kicker}>Lyrics</p>
        <h1 className={styles.title}>{item.title}</h1>
        <p className={styles.intro}>
          {songs.length} {songs.length === 1 ? "song" : "songs"} in this set.
          Tap a song to read its lyrics.
        </p>
      </header>

      <SetLyricsView
        setId={item.id}
        songs={songs.map((song) => ({
          id: song.id,
          slug: song.slug,
          title: song.title,
          author: song.author,
          songKey: song.songKey,
          lyrics: song.lyrics,
        }))}
      />
    </article>
  );
}
