import "server-only";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { and, asc, desc, eq, gt, lt, sql } from "drizzle-orm";
import { db } from "../db/client";
import {
  programItems,
  type NewProgramItem,
  type ProgramItem,
} from "../db/schema";

export function programTag(eventId: string) {
  return `program:${eventId}`;
}

export async function listProgramItems(
  eventId: string,
  options: { includeHidden?: boolean } = {},
): Promise<ProgramItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("program", programTag(eventId));

  return queryProgramItems(eventId, options);
}

/**
 * Uncached read for admin screens: admin routes render at request time and
 * must show the admin's own writes immediately (no stale-while-revalidate
 * window). Public pages keep the cached variant above.
 */
export async function listProgramItemsFresh(
  eventId: string,
  options: { includeHidden?: boolean } = {},
): Promise<ProgramItem[]> {
  return queryProgramItems(eventId, options);
}

async function queryProgramItems(
  eventId: string,
  options: { includeHidden?: boolean } = {},
): Promise<ProgramItem[]> {
  const { includeHidden = false } = options;

  return db
    .select()
    .from(programItems)
    .where(
      includeHidden
        ? eq(programItems.eventId, eventId)
        : and(
            eq(programItems.eventId, eventId),
            eq(programItems.isVisible, true),
          ),
    )
    .orderBy(asc(programItems.position), asc(programItems.createdAt));
}

export async function getProgramItem(
  eventId: string,
  id: string,
): Promise<ProgramItem | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("program", programTag(eventId));

  return queryProgramItem(eventId, id);
}

/** Uncached counterpart for admin screens — see `listProgramItemsFresh`. */
export async function getProgramItemFresh(
  eventId: string,
  id: string,
): Promise<ProgramItem | null> {
  return queryProgramItem(eventId, id);
}

async function queryProgramItem(
  eventId: string,
  id: string,
): Promise<ProgramItem | null> {
  const [item] = await db
    .select()
    .from(programItems)
    .where(and(eq(programItems.id, id), eq(programItems.eventId, eventId)))
    .limit(1);

  return item ?? null;
}

export async function createProgramItem(values: NewProgramItem) {
  const position = values.position ?? (await nextPosition(values.eventId));

  const [item] = await db
    .insert(programItems)
    .values({ ...values, position })
    .returning();

  revalidateTag(programTag(values.eventId), "max");
  return item;
}

export async function updateProgramItem(
  eventId: string,
  id: string,
  patch: Partial<NewProgramItem>,
) {
  const [item] = await db
    .update(programItems)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(programItems.id, id), eq(programItems.eventId, eventId)))
    .returning();

  revalidateTag(programTag(eventId), "max");
  return item;
}

export async function deleteProgramItem(eventId: string, id: string) {
  await db
    .delete(programItems)
    .where(and(eq(programItems.id, id), eq(programItems.eventId, eventId)));

  revalidateTag(programTag(eventId), "max");
}

export async function reorderProgramItems(
  eventId: string,
  orderedIds: string[],
) {
  await db.transaction(async (tx) => {
    for (const [position, id] of orderedIds.entries()) {
      await tx
        .update(programItems)
        .set({ position, updatedAt: new Date() })
        .where(and(eq(programItems.id, id), eq(programItems.eventId, eventId)));
    }
  });

  revalidateTag(programTag(eventId), "max");
}

/** Swaps an item with its nearest neighbour in the given direction. */
export async function moveProgramItem(
  eventId: string,
  id: string,
  direction: "up" | "down",
) {
  await db.transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(programItems)
      .where(and(eq(programItems.id, id), eq(programItems.eventId, eventId)))
      .limit(1);
    if (!current) return;

    const [neighbor] = await tx
      .select()
      .from(programItems)
      .where(
        and(
          eq(programItems.eventId, eventId),
          direction === "up"
            ? lt(programItems.position, current.position)
            : gt(programItems.position, current.position),
        ),
      )
      .orderBy(
        direction === "up"
          ? desc(programItems.position)
          : asc(programItems.position),
      )
      .limit(1);
    if (!neighbor) return;

    await tx
      .update(programItems)
      .set({ position: neighbor.position, updatedAt: new Date() })
      .where(eq(programItems.id, current.id));
    await tx
      .update(programItems)
      .set({ position: current.position, updatedAt: new Date() })
      .where(eq(programItems.id, neighbor.id));
  });

  revalidateTag(programTag(eventId), "max");
}

async function nextPosition(eventId: string) {
  const [row] = await db
    .select({
      max: sql<number>`coalesce(max(${programItems.position}), -1)`,
    })
    .from(programItems)
    .where(eq(programItems.eventId, eventId));

  return (row?.max ?? -1) + 1;
}
