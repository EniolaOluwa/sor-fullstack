import Image from "next/image";
import type { DisplayPost } from "./display-types";
import styles from "./DisplayScreen.module.css";

type DisplayPostProps = {
  post: DisplayPost | null;
};

export default function DisplayPostSlide({ post }: DisplayPostProps) {
  return (
    <div className={styles.post}>
      {!post || !post.imageUrl ? (
        <div className={styles.postPlaceholder}>
          <p>No post selected</p>
        </div>
      ) : (
        <Image
          src={post.imageUrl}
          alt={post.caption ?? "Social post"}
          width={1080}
          height={1080}
          unoptimized
          className={styles.postImage}
        />
      )}

      {post?.caption && <p className={styles.postCaption}>{post.caption}</p>}
      <p className={styles.postBrand}>
        Sound of Revival · Baze University Chapel
      </p>
    </div>
  );
}
