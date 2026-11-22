"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Lyrics from "@/features/songs/Lyrics";
import { setQrPath } from "@/lib/urls";
import type { LyricSection } from "@/server/db/schema";
import styles from "./SetLyricsView.module.css";

export type SetSongView = {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  songKey: string | null;
  lyrics: LyricSection[];
};

type SetLyricsViewProps = {
  setId: string;
  songs: SetSongView[];
};

/**
 * Audience view for a performance set: a tappable QR (expands to a fullscreen
 * projection overlay) above a list of song accordions.
 */
export default function SetLyricsView({ setId, songs }: SetLyricsViewProps) {
  const [openId, setOpenId] = useState<string | null>(songs[0]?.id ?? null);
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    if (!qrOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setQrOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [qrOpen]);

  return (
    <>
      <button
        type="button"
        className={styles.qrCard}
        onClick={() => setQrOpen(true)}
        aria-label="Enlarge the QR code for projection"
      >
        <Image
          src={setQrPath(setId)}
          alt=""
          width={132}
          height={132}
          unoptimized
          className={styles.qr}
        />
        <span className={styles.qrText}>
          <span className={styles.qrTitle}>Scan to open this set</span>
          <span className={styles.qrHint}>Tap to enlarge for projection</span>
        </span>
      </button>

      <div className={styles.songs}>
        {songs.map((song) => {
          const open = openId === song.id;
          const meta = [song.author, song.songKey && `Key ${song.songKey}`]
            .filter(Boolean)
            .join(" · ");
          const panelId = `song-panel-${song.id}`;

          return (
            <div key={song.id} className={styles.song}>
              <button
                type="button"
                className={styles.summary}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : song.id)}
              >
                <span className={styles.summaryText}>
                  <span className={styles.songTitle}>{song.title}</span>
                  {meta && <span className={styles.songMeta}>{meta}</span>}
                </span>
                <span
                  className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>

              <div id={panelId} className={styles.panel} hidden={!open}>
                {song.lyrics.length === 0 ? (
                  <p className={styles.songEmpty}>Lyrics coming soon.</p>
                ) : (
                  <Lyrics sections={song.lyrics} />
                )}
                <Link href={`/songs/${song.slug}`} className={styles.fullLink}>
                  Open full song page ↗
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {qrOpen && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="QR code for this set"
          onClick={() => setQrOpen(false)}
        >
          <div className={styles.overlayInner}>
            <Image
              src={setQrPath(setId)}
              alt="QR code for this set's lyrics"
              width={720}
              height={720}
              unoptimized
              className={styles.qrLarge}
            />
            <p className={styles.overlayHint}>Scan to open this set</p>
          </div>
          <button
            type="button"
            className={styles.close}
            autoFocus
            onClick={() => setQrOpen(false)}
          >
            Close ✕
          </button>
        </div>
      )}
    </>
  );
}
