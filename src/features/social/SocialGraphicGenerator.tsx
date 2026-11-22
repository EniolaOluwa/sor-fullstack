"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import formStyles from "@/components/ui/form.module.css";
import { extractInstagramShortcode } from "@/lib/instagram";
import styles from "./SocialGraphicGenerator.module.css";

/**
 * Paste an Instagram link, generate a branded graphic, then download it for
 * projection. The graphic is rendered on demand by /admin/social/graphic.
 */
export default function SocialGraphicGenerator() {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [src, setSrc] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!extractInstagramShortcode(url)) {
      setError("Enter a valid Instagram post, reel, or TV link.");
      setSrc(null);
      return;
    }

    setError(null);
    const params = new URLSearchParams({ url: url.trim() });
    if (caption.trim()) params.set("caption", caption.trim());
    setSrc(`/admin/social/graphic?${params.toString()}`);
  }

  return (
    <div className={styles.wrap}>
      <section className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Instagram link</span>
            <input
              className={formStyles.input}
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://www.instagram.com/p/..."
              required
            />
          </label>

          <label className={formStyles.field}>
            <span className={formStyles.label}>Caption (optional)</span>
            <textarea
              className={formStyles.textarea}
              rows={3}
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Shown on the graphic"
            />
            <span className={formStyles.hint}>
              The post image is pulled automatically when Instagram oEmbed is
              configured; otherwise a branded placeholder is used.
            </span>
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div>
            <Button type="submit">Generate graphic</Button>
          </div>
        </form>
      </section>

      {src && (
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Preview</h2>
          <Image
            src={src}
            alt="Generated social graphic"
            width={540}
            height={540}
            unoptimized
            className={styles.preview}
          />
          <a href={src} download="sound-of-revival.png" className={styles.download}>
            Download PNG
          </a>
        </section>
      )}
    </div>
  );
}
