import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "@/components/ui/Button";
import ConfirmForm from "@/components/ui/ConfirmForm";
import formStyles from "@/components/ui/form.module.css";
import {
  deleteProgramItemAction,
  setProgramItemSongsAction,
  updateProgramItemAction,
} from "@/features/program/actions";
import { getActiveEvent } from "@/server/services/events";
import {
  getProgramItemFresh,
  listProgramItemSongsFresh,
} from "@/server/services/program";
import { listSongsFresh } from "@/server/services/songs";
import { setLyricsPath } from "@/lib/urls";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Edit program item — Admin",
};

export default async function EditProgramItemPage({
  params,
}: PageProps<"/admin/program/[id]">) {
  const { id } = await params;

  const event = await getActiveEvent();
  if (!event) notFound();

  const item = await getProgramItemFresh(event.id, id);
  if (!item) notFound();

  const [songs, assigned] = await Promise.all([
    listSongsFresh(event.id, { includeHidden: true }),
    listProgramItemSongsFresh(event.id, id),
  ]);
  const assignedIds = new Set(assigned.map((song) => song.id));

  return (
    <div className={styles.page}>
      <Link href="/admin/program" className={styles.backLink}>
        ← Back to order of service
      </Link>

      <h1 className={styles.title}>Edit item</h1>

      {assigned.length > 0 && (
        <Link
          href={setLyricsPath(item.id)}
          className={styles.backLink}
          target="_blank"
        >
          View lyrics page ↗
        </Link>
      )}

      <form action={updateProgramItemAction} className={styles.form}>
        <input type="hidden" name="id" value={item.id} />

        <label className={formStyles.field}>
          <span className={formStyles.label}>Title</span>
          <input
            className={formStyles.input}
            name="title"
            defaultValue={item.title}
            required
          />
        </label>

        <label className={formStyles.field}>
          <span className={formStyles.label}>Details</span>
          <textarea
            className={formStyles.textarea}
            name="description"
            rows={6}
            defaultValue={item.description ?? ""}
          />
          <span className={formStyles.hint}>
            One line per sub-item — lines render as a bulleted list.
          </span>
        </label>

        <label className={formStyles.checkboxRow}>
          <input
            type="checkbox"
            name="isVisible"
            defaultChecked={item.isVisible}
          />
          Visible to the audience
        </label>

        <div>
          <Button type="submit">Save changes</Button>
        </div>
      </form>

      <section className={styles.songsCard}>
        <div>
          <h2 className={styles.sectionTitle}>Songs in this set</h2>
          <p className={styles.sectionHint}>
            Pick the songs sung during this item. They appear together on a
            public lyrics page (with its own QR code) linked from the order of
            service.
          </p>
        </div>

        {songs.length === 0 ? (
          <p className={styles.sectionHint}>
            No songs in the songbook yet — add songs first.
          </p>
        ) : (
          <form action={setProgramItemSongsAction} className={styles.songsForm}>
            <input type="hidden" name="id" value={item.id} />
            <ul className={styles.songList}>
              {songs.map((song) => (
                <li key={song.id}>
                  <label className={styles.songOption}>
                    <input
                      type="checkbox"
                      name="songIds"
                      value={song.id}
                      defaultChecked={assignedIds.has(song.id)}
                    />
                    <span className={styles.songTitle}>{song.title}</span>
                    {!song.isVisible && (
                      <span className={styles.songHidden}>Hidden</span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
            <div>
              <Button type="submit">Save songs</Button>
            </div>
          </form>
        )}
      </section>

      <div className={styles.dangerZone}>
        <p className={styles.dangerLabel}>Danger zone</p>
        <ConfirmForm
          action={deleteProgramItemAction}
          message={`Delete "${item.title}"? This cannot be undone.`}
        >
          <input type="hidden" name="id" value={item.id} />
          <Button variant="danger" size="sm" type="submit">
            Delete item
          </Button>
        </ConfirmForm>
      </div>
    </div>
  );
}
