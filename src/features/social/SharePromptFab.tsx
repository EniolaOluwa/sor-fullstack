"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./SharePromptFab.module.css";

const HASHTAGS = [
  "#MySORExperience",
  "#SoundmeetsRevival",
  "#SoundOfRevival2026",
  "#SoundOfRevivalConcert",
];

/**
 * Floating prompt shown across the audience surface. Tapping the info button
 * opens a sheet inviting guests to post their photos and gratitude on
 * Instagram with the event hashtags.
 *
 * The button is keyed on the pathname so the gold "radiate" animation replays
 * on each page visit (the audience layout itself persists across navigations).
 */
export default function SharePromptFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  async function copyHashtags() {
    try {
      await navigator.clipboard.writeText(HASHTAGS.join(" "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the hashtags stay visible to type manually.
    }
  }

  return (
    <>
      <button
        key={pathname}
        type="button"
        className={`${styles.fab} ${styles.pulse}`}
        onClick={() => setOpen(true)}
        aria-label="How to share your experience on Instagram"
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          aria-hidden="true"
          focusable="false"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="12"
            y1="11"
            x2="12"
            y2="17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="7.5" r="1.3" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          className={styles.backdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-prompt-title"
          onClick={() => setOpen(false)}
        >
          <div
            className={styles.panel}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="share-prompt-title" className={styles.title}>
              Share your experience
            </h2>
            <p className={styles.body}>
              Post your favourite pictures from Sound of Revival on Instagram
              and tell us what you&apos;re thankful for. Add these hashtags so we
              can find you:
            </p>

            <ul className={styles.tags}>
              {HASHTAGS.map((tag) => (
                <li key={tag} className={styles.tag}>
                  {tag}
                </li>
              ))}
            </ul>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.copy}
                onClick={copyHashtags}
              >
                {copied ? "Copied ✓" : "Copy hashtags"}
              </button>
              <button
                type="button"
                className={styles.close}
                autoFocus
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
