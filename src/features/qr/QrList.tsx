"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./QrList.module.css";

export type QrListItem = {
  id: string;
  title: string;
  url: string;
  href: string;
  qrSrc: string;
};

type QrListProps = {
  items: QrListItem[];
};

/**
 * Accordion of scannable QR codes. Each row shows the code; tapping it expands
 * to reveal what it opens.
 */
export default function QrList({ items }: QrListProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const open = openId === item.id;
        const panelId = `qr-panel-${item.id}`;

        return (
          <li key={item.id} className={styles.item}>
            <button
              type="button"
              className={styles.summary}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenId(open ? null : item.id)}
            >
              <Image
                src={item.qrSrc}
                alt=""
                width={140}
                height={140}
                unoptimized
                className={styles.qr}
              />
              <span
                className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
                aria-hidden="true"
              >
                ▾
              </span>
            </button>

            <div id={panelId} className={styles.panel} hidden={!open}>
              <p className={styles.title}>{item.title}</p>
              <Link href={item.href} className={styles.link}>
                {item.url}
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
