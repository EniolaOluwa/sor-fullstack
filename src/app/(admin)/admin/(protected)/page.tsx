import type { Metadata } from "next";
import { Suspense } from "react";
import { formatEventDate } from "@/lib/format";
import {
  getVisitStats,
  type Breakdown,
} from "@/server/services/analytics";
import { getActiveEvent } from "@/server/services/events";
import { getLiveState } from "@/server/services/live";
import { listProgramItemsFresh } from "@/server/services/program";
import { listSongs } from "@/server/services/songs";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Dashboard — Sound of Revival",
};

export default async function AdminDashboardPage() {
  const event = await getActiveEvent();

  if (!event) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Dashboard</h1>
        <div className={styles.card}>
          <p className={styles.cardLabel}>No active event</p>
          <p className={styles.meta}>
            Seed the database with <code>yarn db:seed</code> to get started.
          </p>
        </div>
      </div>
    );
  }

  const [items, songs, live] = await Promise.all([
    listProgramItemsFresh(event.id, { includeHidden: true }),
    listSongs(event.id, { includeHidden: true }),
    getLiveState(event.id),
  ]);

  const currentItem = live?.programItemId
    ? items.find((item) => item.id === live.programItemId)
    : null;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.grid}>
        <section className={styles.card}>
          <p className={styles.cardLabel}>Event</p>
          <p className={styles.eventTitle}>{event.title}</p>
          <p className={styles.meta}>
            {event.startsAt ? formatEventDate(event.startsAt) : null}
            {event.venue ? ` · ${event.venue}` : null}
          </p>
          <p className={styles.counts}>
            {items.length} program items · {songs.length} songs
          </p>
        </section>

        <section className={styles.card}>
          <p className={styles.cardLabel}>Live now</p>
          <p className={styles.liveValue}>
            {liveLabel(live?.mode ?? "idle", currentItem?.title)}
          </p>
          <p className={styles.meta}>
            The audience program page follows this automatically.
          </p>
        </section>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Analytics</h2>
        <Suspense fallback={<AnalyticsFallback />}>
          <AnalyticsSection />
        </Suspense>
      </section>

      <p className={styles.note}>
        Program, song, and social graphic tools are available from the sidebar.
      </p>
    </div>
  );
}

async function AnalyticsSection() {
  const stats = await getVisitStats();

  return (
    <>
      <div className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Page views</p>
          <p className={styles.statValue}>{stats.pageViews}</p>
          <p className={styles.meta}>{stats.pageViews7d} in the last 7 days</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Unique visitors</p>
          <p className={styles.statValue}>{stats.visitors}</p>
          <p className={styles.meta}>{stats.visitors7d} in the last 7 days</p>
        </div>
      </div>

      <div className={styles.grid}>
        <BreakdownCard title="Devices" rows={stats.byDeviceType} />
        <BreakdownCard title="Operating systems" rows={stats.byOs} />
        <BreakdownCard title="Browsers" rows={stats.byBrowser} />
      </div>
    </>
  );
}

function AnalyticsFallback() {
  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <p className={styles.cardLabel}>Page views</p>
        <p className={styles.statValue}>—</p>
      </div>
      <div className={styles.card}>
        <p className={styles.cardLabel}>Unique visitors</p>
        <p className={styles.statValue}>—</p>
      </div>
    </div>
  );
}

function BreakdownCard({ title, rows }: { title: string; rows: Breakdown[] }) {
  return (
    <section className={styles.card}>
      <p className={styles.cardLabel}>{title}</p>
      {rows.length === 0 ? (
        <p className={styles.meta}>No data yet.</p>
      ) : (
        <ul className={styles.breakdown}>
          {rows.map((row) => (
            <li key={row.label} className={styles.breakdownRow}>
              <span className={styles.breakdownLabel}>{row.label}</span>
              <span className={styles.breakdownCount}>
                {row.pageViews}
                <span className={styles.breakdownSub}>
                  {" "}
                  · {row.visitors} uniq
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function liveLabel(
  mode: "idle" | "program" | "song" | "qr",
  currentItemTitle?: string,
): string {
  switch (mode) {
    case "program":
      return currentItemTitle ? `Program — ${currentItemTitle}` : "Program";
    case "song":
      return "Song";
    case "qr":
      return "Song QR codes";
    default:
      return "Idle";
  }
}
