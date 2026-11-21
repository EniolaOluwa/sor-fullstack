import type { ReactNode } from "react";
import Link from "next/link";
import { getActiveEvent } from "@/server/services/events";
import { formatEventDate } from "@/lib/format";
import styles from "./layout.module.css";

export default async function AudienceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const event = await getActiveEvent();
  const meta = [
    event?.startsAt ? formatEventDate(event.startsAt) : null,
    event?.venue,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <p className={styles.wordmark}>
          <span className={styles.wordmarkSmall}>Sound of</span>{" "}
          <span className={styles.wordmarkScript}>Revival</span>
        </p>
        {meta && <p className={styles.meta}>{meta}</p>}
        <nav className={styles.nav} aria-label="Pages">
          <Link href="/program" className={styles.navLink}>
            Order of Service
          </Link>
          <Link href="/songs" className={styles.navLink}>
            Songs
          </Link>
          <Link href="/posts" className={styles.navLink}>
            Posts
          </Link>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
