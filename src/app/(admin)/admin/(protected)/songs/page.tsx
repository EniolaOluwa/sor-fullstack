import type { Metadata } from "next";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import formStyles from "@/components/ui/form.module.css";
import { clearLiveStateAction } from "@/features/live/actions";
import {
  createSongAction,
  setCurrentSongAction,
  toggleSongVisibilityAction,
} from "@/features/songs/actions";
import { getActiveEvent } from "@/server/services/events";
import { getLiveState } from "@/server/services/live";
import { listSongsFresh } from "@/server/services/songs";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Songs — Admin",
};

export default async function AdminSongsPage() {
  const event = await getActiveEvent();

  if (!event) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Songs</h1>
        <p className={styles.empty}>
          No active event. Seed the database with <code>yarn db:seed</code>.
        </p>
      </div>
    );
  }

  const [songs, live] = await Promise.all([
    listSongsFresh(event.id, { includeHidden: true }),
    getLiveState(event.id),
  ]);

  const currentSong =
    live?.mode === "song" && live.songId
      ? songs.find((song) => song.id === live.songId)
      : undefined;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Songs</h1>
          <p className={styles.status}>
            {currentSong ? (
              <>
                Live: <strong>{currentSong.title}</strong>
              </>
            ) : (
              "Not live — press “Set current” while a song is being ministered."
            )}
          </p>
        </div>
        <div className={styles.headerActions}>
          {currentSong && (
            <form action={clearLiveStateAction}>
              <Button variant="secondary" size="sm" type="submit">
                Stop live
              </Button>
            </form>
          )}
          <Link href="/admin/songs/qr-sheet" className={styles.sheetLink}>
            QR sheet
          </Link>
          <Link href="/songs" className={styles.viewLink} target="_blank">
            View public page ↗
          </Link>
        </div>
      </header>

      <section className={styles.createCard}>
        <h2 className={styles.sectionTitle}>Add song</h2>
        <form action={createSongAction} className={styles.createForm}>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Title</span>
            <input
              className={formStyles.input}
              name="title"
              placeholder="e.g. Days of Elijah"
              required
            />
          </label>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Author / choir</span>
            <input
              className={formStyles.input}
              name="author"
              placeholder="Optional"
            />
          </label>
          <div>
            <Button type="submit">Add song</Button>
          </div>
        </form>
      </section>

      {songs.length === 0 ? (
        <p className={styles.empty}>No songs yet — add the first one above.</p>
      ) : (
        <ol className={styles.list}>
          {songs.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;

            return (
              <li key={song.id} className={styles.row}>
                <span className={styles.position}>{index + 1}</span>

                <div className={styles.info}>
                  <div className={styles.titleRow}>
                    <p className={styles.songTitle}>{song.title}</p>
                    {isCurrent && <Badge tone="gold">Now</Badge>}
                    {!song.isVisible && <Badge tone="neutral">Hidden</Badge>}
                  </div>
                  <p className={styles.songMeta}>
                    {song.author ?? "Unknown author"}
                    {song.songKey ? ` · Key ${song.songKey}` : ""} ·{" "}
                    {song.lyrics.length} sections
                  </p>
                </div>

                <div className={styles.controls}>
                  <form action={toggleSongVisibilityAction}>
                    <input type="hidden" name="id" value={song.id} />
                    <input
                      type="hidden"
                      name="nextIsVisible"
                      value={String(!song.isVisible)}
                    />
                    <Button variant="ghost" size="sm" type="submit">
                      {song.isVisible ? "Hide" : "Show"}
                    </Button>
                  </form>
                  <form action={setCurrentSongAction}>
                    <input type="hidden" name="id" value={song.id} />
                    <Button
                      variant="secondary"
                      size="sm"
                      type="submit"
                      disabled={isCurrent}
                    >
                      Set current
                    </Button>
                  </form>
                  <Link
                    href={`/admin/songs/${song.id}`}
                    className={styles.editLink}
                  >
                    Edit
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
