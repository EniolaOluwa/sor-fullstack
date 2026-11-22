import "server-only";
import { count, countDistinct, desc, gte, sql } from "drizzle-orm";
import { db } from "../db/client";
import { visits, type NewVisit } from "../db/schema";

/**
 * First-party analytics reads/writes. Deliberately uncached — the admin
 * dashboard is dynamic and should reflect the latest rows.
 */

export async function recordVisit(values: NewVisit) {
  await db.insert(visits).values(values);
}

export type Breakdown = {
  label: string;
  pageViews: number;
  visitors: number;
};

export type VisitStats = {
  pageViews: number;
  visitors: number;
  pageViews7d: number;
  visitors7d: number;
  byDeviceType: Breakdown[];
  byOs: Breakdown[];
  byBrowser: Breakdown[];
};

function toBreakdown(
  rows: { label: string | null; pageViews: number; visitors: number }[],
): Breakdown[] {
  return rows.map((row) => ({
    label: row.label ?? "Unknown",
    pageViews: Number(row.pageViews),
    visitors: Number(row.visitors),
  }));
}

export async function getVisitStats(): Promise<VisitStats> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totals] = await db
    .select({ pageViews: count(), visitors: countDistinct(visits.visitorId) })
    .from(visits);

  const [recent] = await db
    .select({ pageViews: count(), visitors: countDistinct(visits.visitorId) })
    .from(visits)
    .where(gte(visits.createdAt, since));

  const byDeviceType = await db
    .select({
      label: visits.deviceType,
      pageViews: count(),
      visitors: countDistinct(visits.visitorId),
    })
    .from(visits)
    .groupBy(visits.deviceType)
    .orderBy(desc(count()));

  const byOs = await db
    .select({
      label: sql<string | null>`coalesce(${visits.os}, 'Unknown')`,
      pageViews: count(),
      visitors: countDistinct(visits.visitorId),
    })
    .from(visits)
    .groupBy(sql`coalesce(${visits.os}, 'Unknown')`)
    .orderBy(desc(count()));

  const byBrowser = await db
    .select({
      label: sql<string | null>`coalesce(${visits.browser}, 'Unknown')`,
      pageViews: count(),
      visitors: countDistinct(visits.visitorId),
    })
    .from(visits)
    .groupBy(sql`coalesce(${visits.browser}, 'Unknown')`)
    .orderBy(desc(count()));

  return {
    pageViews: Number(totals?.pageViews ?? 0),
    visitors: Number(totals?.visitors ?? 0),
    pageViews7d: Number(recent?.pageViews ?? 0),
    visitors7d: Number(recent?.visitors ?? 0),
    byDeviceType: toBreakdown(byDeviceType),
    byOs: toBreakdown(byOs),
    byBrowser: toBreakdown(byBrowser),
  };
}
