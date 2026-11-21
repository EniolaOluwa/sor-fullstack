import "server-only";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { and, asc, eq, sql } from "drizzle-orm";
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

async function nextPosition(eventId: string) {
  const [row] = await db
    .select({
      max: sql<number>`coalesce(max(${programItems.position}), -1)`,
    })
    .from(programItems)
    .where(eq(programItems.eventId, eventId));

  return (row?.max ?? -1) + 1;
}
