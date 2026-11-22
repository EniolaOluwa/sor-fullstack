import type { Metadata } from "next";
import QrList, { type QrListItem } from "@/features/qr/QrList";
import { setLyricsUrl, setQrPath, siteQrPath, siteUrl } from "@/lib/urls";
import { getActiveEvent } from "@/server/services/events";
import {
  listProgramItemIdsWithSongs,
  listProgramItems,
} from "@/server/services/program";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "QR codes — Sound of Revival",
};

export default async function ListQrPage() {
  const event = await getActiveEvent();

  if (!event) {
    return <p className={styles.empty}>QR codes will appear here soon.</p>;
  }

  const [items, idsWithSongs] = await Promise.all([
    listProgramItems(event.id),
    listProgramItemIdsWithSongs(event.id),
  ]);
  const withSongs = new Set(idsWithSongs);

  const list: QrListItem[] = [
    {
      id: "site",
      title: "Sound of Revival — Home",
      url: siteUrl(),
      qrSrc: siteQrPath(),
    },
    ...items
      .filter((item) => withSongs.has(item.id))
      .map((item) => ({
        id: item.id,
        title: item.title,
        url: setLyricsUrl(item.id),
        qrSrc: setQrPath(item.id),
      })),
  ];

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <p className={styles.kicker}>Scan</p>
        <h1 className={styles.title}>QR codes</h1>
        <p className={styles.intro}>Tap a code to reveal what it opens.</p>
      </header>

      <QrList items={list} />
    </div>
  );
}
