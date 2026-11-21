import type { Metadata } from "next";
import Image from "next/image";
import { getActiveEvent } from "@/server/services/events";
import { listPosts } from "@/server/services/posts";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Posts — Sound of Revival",
};

export default async function PostsPage() {
  const event = await getActiveEvent();

  if (!event) {
    return <p className={styles.empty}>Posts will appear here soon.</p>;
  }

  const posts = await listPosts(event.id);

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <p className={styles.kicker}>From our Instagram</p>
        <h1 className={styles.title}>Posts</h1>
        <p className={styles.intro}>
          Highlights and announcements from the Sound of Revival community.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className={styles.empty}>Posts will appear here soon.</p>
      ) : (
        <ul className={styles.grid}>
          {posts.map((post) => (
            <li key={post.id} className={styles.card}>
              {post.imageUrl ? (
                <Image
                  src={post.imageUrl}
                  alt={post.caption ?? "Instagram post"}
                  width={480}
                  height={600}
                  unoptimized
                  className={styles.image}
                />
              ) : (
                <div className={styles.imageEmpty}>Instagram post</div>
              )}
              {post.caption && (
                <p className={styles.caption}>{post.caption}</p>
              )}
              <a
                href={post.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                View on Instagram ↗
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
