import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ConfirmForm from "@/components/ui/ConfirmForm";
import formStyles from "@/components/ui/form.module.css";
import { clearLiveStateAction } from "@/features/live/actions";
import {
  deletePostAction,
  setCurrentPostAction,
  updatePostAction,
  uploadPostImageAction,
} from "@/features/posts/actions";
import { instagramEmbedUrl } from "@/lib/instagram";
import { getActiveEvent } from "@/server/services/events";
import { getLiveState } from "@/server/services/live";
import { getPostByIdFresh } from "@/server/services/posts";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Edit post — Admin",
};

export default async function EditPostPage({
  params,
}: PageProps<"/admin/posts/[id]">) {
  const { id } = await params;

  const event = await getActiveEvent();
  if (!event) notFound();

  const [post, live] = await Promise.all([
    getPostByIdFresh(event.id, id),
    getLiveState(event.id),
  ]);
  if (!post) notFound();

  const isCurrent = live?.mode === "post" && live.postId === post.id;
  const embedUrl = post.shortcode ? instagramEmbedUrl(post.shortcode) : null;

  return (
    <div className={styles.page}>
      <Link href="/admin/posts" className={styles.backLink}>
        ← Back to posts
      </Link>

      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Edit post</h1>
          {isCurrent && <Badge tone="gold">On screen</Badge>}
        </div>
        <div className={styles.headerActions}>
          {isCurrent ? (
            <form action={clearLiveStateAction}>
              <Button variant="secondary" size="sm" type="submit">
                Stop live
              </Button>
            </form>
          ) : (
            <form action={setCurrentPostAction}>
              <input type="hidden" name="id" value={post.id} />
              <Button
                size="sm"
                type="submit"
                disabled={!post.imageUrl}
                title={
                  post.imageUrl
                    ? undefined
                    : "Upload the projection image first"
                }
              >
                Project this post
              </Button>
            </form>
          )}
        </div>
      </header>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Instagram preview</h2>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="Instagram embed"
              className={styles.embed}
              loading="lazy"
            />
          ) : (
            <p className={styles.hint}>No shortcode available.</p>
          )}
          <a
            href={post.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.url}
          >
            {post.instagramUrl}
          </a>
        </section>

        <div className={styles.column}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Projection image</h2>
            {post.imageUrl ? (
              <Image
                src={post.imageUrl}
                alt="Projection image"
                width={480}
                height={480}
                unoptimized
                className={styles.image}
              />
            ) : (
              <div className={styles.imageEmpty}>
                No image yet — the projector will show a placeholder.
              </div>
            )}
            <form
              action={uploadPostImageAction}
              className={styles.uploadForm}
            >
              <input type="hidden" name="id" value={post.id} />
              <input
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                required
                className={styles.fileInput}
              />
              <Button variant="secondary" size="sm" type="submit">
                {post.imageUrl ? "Replace image" : "Upload image"}
              </Button>
            </form>
            <p className={formStyles.hint}>
              Save the post from Instagram and upload it here — this is what
              gets projected (up to 10 MB).
            </p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Caption & visibility</h2>
            <form action={updatePostAction} className={styles.editForm}>
              <input type="hidden" name="id" value={post.id} />
              <label className={formStyles.field}>
                <span className={formStyles.label}>Caption</span>
                <textarea
                  className={formStyles.textarea}
                  name="caption"
                  rows={3}
                  defaultValue={post.caption ?? ""}
                  placeholder="Shown under the image on the projector"
                />
              </label>
              <label className={formStyles.checkboxRow}>
                <input
                  type="checkbox"
                  name="isVisible"
                  defaultChecked={post.isVisible}
                />
                Visible in the public gallery
              </label>
              <div>
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </section>

          <div className={styles.dangerZone}>
            <p className={styles.dangerLabel}>Danger zone</p>
            <ConfirmForm
              action={deletePostAction}
              message="Delete this post? The uploaded image is removed too."
            >
              <input type="hidden" name="id" value={post.id} />
              <Button variant="danger" size="sm" type="submit">
                Delete post
              </Button>
            </ConfirmForm>
          </div>
        </div>
      </div>
    </div>
  );
}
