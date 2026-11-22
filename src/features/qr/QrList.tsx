"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./QrList.module.css";

export type QrListItem = {
  id: string;
  title: string;
  url: string;
  qrSrc: string;
};

type QrListProps = {
  items: QrListItem[];
};

/**
 * List of scannable QR codes. Tapping one opens it fullscreen for scanning or
 * projection.
 */
export default function QrList({ items }: QrListProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = items.find((item) => item.id === openId) ?? null;

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenId(null);
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <button
              type="button"
              className={styles.summary}
              onClick={() => setOpenId(item.id)}
              aria-label={`Enlarge QR code: ${item.title}`}
            >
              <Image
                src={item.qrSrc}
                alt=""
                width={140}
                height={140}
                unoptimized
                className={styles.qr}
              />
              <span className={styles.hint} aria-hidden="true">
                Tap to enlarge
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label={open.title}
          onClick={() => setOpenId(null)}
        >
          <div className={styles.overlayInner}>
            <Image
              src={open.qrSrc}
              alt=""
              width={720}
              height={720}
              unoptimized
              className={styles.qrLarge}
            />
            <p className={styles.overlayTitle}>{open.title}</p>
            <p className={styles.overlayUrl}>{open.url}</p>
          </div>
          <button
            type="button"
            className={styles.close}
            autoFocus
            onClick={() => setOpenId(null)}
          >
            Close ✕
          </button>
        </div>
      )}
    </>
  );
}
