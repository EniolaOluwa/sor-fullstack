import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import formStyles from "@/components/ui/form.module.css";
import { clearLiveStateAction } from "@/features/live/actions";
import {
  createPostAction,
  setCurrentPostAction,
  togglePostVisibilityAction,
} from "@/features/posts/actions";
import { getActiveEvent } from "@/server/services/events";
import { getLiveState } from "@/server/services/live";
import { listPostsFresh } from "@/server/services/posts";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Posts — Admin",
};

export default async function AdminPostsPage() {
  const event = await getActiveEvent();

  if (!event) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Posts</h1>
        <p className={styles.empty}>
          No active event. Seed the database with <code>yarn db:seed</code>.
        </p>
      </div>
    );
  }

  const [posts, live] = await Promise.all([
    listPostsFresh(event.id, { includeHidden: true }),
    getLiveState(event.id),
  ]);

  const currentPost =
    live?.mode === "post" && live.postId
      ? posts.find((post) => post.id === live.postId)
      : undefined;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Posts</h1>
          <p className={styles.status}>
            {currentPost ? (
              <>
                Live: <strong>{currentPost.caption ?? currentPost.shortcode}</strong>
              </>
            ) : (
              "Paste an Instagram link, upload the post image, then project it."
            )}
          </p>
        </div>
        <div className={styles.headerActions}>
          {currentPost && (
            <form action={clearLiveStateAction}>
              <Button variant="secondary" size="sm" type="submit">
                Stop live
              </Button>
            </form>
          )}
          <Link href="/posts" className={styles.viewLink} target="_blank">
            View public page ↗
          </Link>
        </div>
      </header>

      <section className={styles.createCard}>
        <h2 className={styles.sectionTitle}>Add post</h2>
        <form action={createPostAction} className={styles.createForm}>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Instagram link</span>
            <input
              className={formStyles.input}
              name="instagramUrl"
              type="url"
              placeholder="https://www.instagram.com/p/..."
              required
            />
            <span className={formStyles.hint}>
              Post, reel, or IGTV links all work. Instagram embeds are shown in
              the admin preview only — you upload the image that gets projected.
            </span>
          </label>
          <div>
            <Button type="submit">Add post</Button>
          </div>
        </form>
      </section>

      {posts.length === 0 ? (
        <p className={styles.empty}>No posts yet — add the first one above.</p>
      ) : (
        <ol className={styles.list}>
          {posts.map((post, index) => {
            const isCurrent = currentPost?.id === post.id;

            return (
              <li key={post.id} className={styles.row}>
                <span className={styles.position}>{index + 1}</span>

                {post.imageUrl ? (
                  <Image
                    src={post.imageUrl}
                    alt=""
                    width={56}
                    height={56}
                    unoptimized
                    className={styles.thumb}
                  />
                ) : (
                  <span className={styles.thumbEmpty}>No image</span>
                )}

                <div className={styles.info}>
                  <div className={styles.titleRow}>
                    <p className={styles.caption}>
                      {post.caption ?? post.shortcode ?? "Instagram post"}
                    </p>
                    {isCurrent && <Badge tone="gold">Now</Badge>}
                    {!post.isVisible && <Badge tone="neutral">Hidden</Badge>}
                  </div>
                  <a
                    href={post.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.url}
                  >
                    {post.instagramUrl}
                  </a>
                </div>

                <div className={styles.controls}>
                  <form action={togglePostVisibilityAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <input
                      type="hidden"
                      name="nextIsVisible"
                      value={String(!post.isVisible)}
                    />
                    <Button variant="ghost" size="sm" type="submit">
                      {post.isVisible ? "Hide" : "Show"}
                    </Button>
                  </form>
                  <form action={setCurrentPostAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <Button
                      variant="secondary"
                      size="sm"
                      type="submit"
                      disabled={isCurrent || !post.imageUrl}
                      title={
                        post.imageUrl
                          ? undefined
                          : "Upload the projection image first"
                      }
                    >
                      Project
                    </Button>
                  </form>
                  <Link
                    href={`/admin/posts/${post.id}`}
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
