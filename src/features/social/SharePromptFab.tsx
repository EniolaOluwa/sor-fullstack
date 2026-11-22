"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import styles from "./SharePromptFab.module.css";

const HASHTAGS = [
  "#MySORExperience",
  "#SoundmeetsRevival",
  "#SoundOfRevival2026",
  "#SoundOfRevivalConcert",
];

const SEEN_KEY = "sor:sharePromptSeen";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  try {
    return localStorage.getItem(SEEN_KEY) !== "1";
  } catch {
    return true;
  }
}

function getServerSnapshot() {
  return true;
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Storage unavailable — the badge simply reappears on the next visit.
  }
  listeners.forEach((listener) => listener());
}

/**
 * Floating prompt shown across the audience surface. Tapping the info button
 * opens a sheet inviting guests to post their photos and gratitude on
 * Instagram with the event hashtags. An unread badge is dismissed once opened.
 *
 * The button is keyed on the pathname so the gold "radiate" animation replays
 * on each page visit (the audience layout itself persists across navigations).
 */
export default function SharePromptFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const unread = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

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

  function openPrompt() {
    markSeen();
    setOpen(true);
  }

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
        onClick={openPrompt}
        aria-label={
          unread
            ? "How to share your experience on Instagram (1 unread)"
            : "How to share your experience on Instagram"
        }
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
        {unread && (
          <span className={styles.badge} aria-hidden="true">
            1
          </span>
        )}
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
