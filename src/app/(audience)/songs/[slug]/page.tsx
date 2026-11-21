import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Lyrics from "@/features/songs/Lyrics";
import NowSingingBadge from "@/features/songs/NowSingingBadge";
import { getActiveEvent } from "@/server/services/events";
import { getSongBySlug, listSongs } from "@/server/services/songs";
import styles from "./page.module.css";

/**
 * Song pages are prerendered for every visible song at build time. A song
 * added after a deploy is served the app shell immediately and upgraded in
 * the background (ISR with Partial Prefetching), which is why the content
 * awaits `params` inside `<Suspense>`.
 */
export async function generateStaticParams() {
  const event = await getActiveEvent();
  if (!event) return [];

  const songs = await listSongs(event.id);
  return songs.map((song) => ({ slug: song.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/songs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await getActiveEvent();
  if (!event) return {};

  const song = await getSongBySlug(event.id, slug);
  return { title: song ? `${song.title} — Sound of Revival` : "Song" };
}

export default function SongPage({ params }: PageProps<"/songs/[slug]">) {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <p className={styles.loading}>Loading lyrics…</p>
        </div>
      }
    >
      <SongContent params={params} />
    </Suspense>
  );
}

async function SongContent({ params }: Pick<PageProps<"/songs/[slug]">, "params">) {
  const { slug } = await params;

  const event = await getActiveEvent();
  if (!event) notFound();

  const song = await getSongBySlug(event.id, slug);
  if (!song || !song.isVisible) notFound();

  return (
    <article className={styles.page}>
      <Link href="/songs" className={styles.backLink}>
        ← All songs
      </Link>

      <header className={styles.heading}>
        <h1 className={styles.title}>{song.title}</h1>
        {(song.author || song.songKey) && (
          <p className={styles.meta}>
            {[song.author, song.songKey && `Key ${song.songKey}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        <div>
          <NowSingingBadge eventId={event.id} songId={song.id} />
        </div>
      </header>

      {song.lyrics.length === 0 ? (
        <p className={styles.empty}>Lyrics coming soon.</p>
      ) : (
        <Lyrics sections={song.lyrics} />
      )}
    </article>
  );
}
