import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "@/components/ui/Button";
import ConfirmForm from "@/components/ui/ConfirmForm";
import QrCode from "@/components/ui/QrCode";
import formStyles from "@/components/ui/form.module.css";
import { deleteSongAction, updateSongAction } from "@/features/songs/actions";
import { formatLyrics } from "@/lib/lyrics";
import { getActiveEvent } from "@/server/services/events";
import { getSongByIdFresh } from "@/server/services/songs";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Edit song — Admin",
};

export default async function EditSongPage({
  params,
}: PageProps<"/admin/songs/[id]">) {
  const { id } = await params;

  const event = await getActiveEvent();
  if (!event) notFound();

  const song = await getSongByIdFresh(event.id, id);
  if (!song) notFound();

  return (
    <div className={styles.page}>
      <Link href="/admin/songs" className={styles.backLink}>
        ← Back to songs
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>Edit song</h1>
        <div className={styles.qrBox}>
          <QrCode slug={song.slug} size={96} alt={`QR code for ${song.title}`} />
          <div className={styles.qrMeta}>
            <Link
              href={`/songs/${song.slug}`}
              className={styles.publicLink}
              target="_blank"
            >
              /songs/{song.slug} ↗
            </Link>
            <p className={styles.qrHint}>QR opens the public lyrics page.</p>
          </div>
        </div>
      </div>

      <form action={updateSongAction} className={styles.form}>
        <input type="hidden" name="id" value={song.id} />

        <div className={styles.fieldRow}>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Title</span>
            <input
              className={formStyles.input}
              name="title"
              defaultValue={song.title}
              required
            />
          </label>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Author / choir</span>
            <input
              className={formStyles.input}
              name="author"
              defaultValue={song.author ?? ""}
            />
          </label>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Key</span>
            <input
              className={formStyles.input}
              name="songKey"
              defaultValue={song.songKey ?? ""}
              placeholder="e.g. G"
            />
          </label>
        </div>

        <label className={formStyles.field}>
          <span className={formStyles.label}>Lyrics</span>
          <textarea
            className={styles.lyricsInput}
            name="lyrics"
            rows={24}
            defaultValue={formatLyrics(song.lyrics)}
            spellCheck={false}
          />
          <span className={formStyles.hint}>
            Section headers in square brackets — [Verse 1], [Chorus], [Bridge],
            [Outro]. Anything else becomes a custom heading, e.g. [Chants] or
            [Recitation by Michael].
          </span>
        </label>

        <label className={formStyles.checkboxRow}>
          <input
            type="checkbox"
            name="isVisible"
            defaultChecked={song.isVisible}
          />
          Visible to the audience
        </label>

        <div>
          <Button type="submit">Save changes</Button>
        </div>
      </form>

      <div className={styles.dangerZone}>
        <p className={styles.dangerLabel}>Danger zone</p>
        <ConfirmForm
          action={deleteSongAction}
          message={`Delete "${song.title}"? This cannot be undone.`}
        >
          <input type="hidden" name="id" value={song.id} />
          <Button variant="danger" size="sm" type="submit">
            Delete song
          </Button>
        </ConfirmForm>
      </div>
    </div>
  );
}
