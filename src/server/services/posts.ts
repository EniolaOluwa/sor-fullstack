import "server-only";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "../db/client";
import { socialPosts, type NewSocialPost, type SocialPost } from "../db/schema";

export function postsTag(eventId: string) {
  return `posts:${eventId}`;
}

export async function listPosts(
  eventId: string,
  options: { includeHidden?: boolean } = {},
): Promise<SocialPost[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("posts", postsTag(eventId));

  return queryPosts(eventId, options);
}

/** Uncached counterpart for admin screens — see `listProgramItemsFresh`. */
export async function listPostsFresh(
  eventId: string,
  options: { includeHidden?: boolean } = {},
): Promise<SocialPost[]> {
  return queryPosts(eventId, options);
}

async function queryPosts(
  eventId: string,
  options: { includeHidden?: boolean } = {},
): Promise<SocialPost[]> {
  const { includeHidden = false } = options;

  return db
    .select()
    .from(socialPosts)
    .where(
      includeHidden
        ? eq(socialPosts.eventId, eventId)
        : and(
            eq(socialPosts.eventId, eventId),
            eq(socialPosts.isVisible, true),
          ),
    )
    .orderBy(asc(socialPosts.position), asc(socialPosts.createdAt));
}

export async function getPostByIdFresh(eventId: string, id: string) {
  const [post] = await db
    .select()
    .from(socialPosts)
    .where(and(eq(socialPosts.id, id), eq(socialPosts.eventId, eventId)))
    .limit(1);

  return post ?? null;
}

export async function createPost(values: NewSocialPost) {
  const position = values.position ?? (await nextPosition(values.eventId));

  const [post] = await db
    .insert(socialPosts)
    .values({ ...values, position })
    .returning();

  revalidateTag(postsTag(values.eventId), "max");
  return post;
}

export async function updatePost(
  eventId: string,
  id: string,
  patch: Partial<NewSocialPost>,
) {
  const [post] = await db
    .update(socialPosts)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(socialPosts.id, id), eq(socialPosts.eventId, eventId)))
    .returning();

  revalidateTag(postsTag(eventId), "max");
  return post;
}

export async function deletePost(eventId: string, id: string) {
  await db
    .delete(socialPosts)
    .where(and(eq(socialPosts.id, id), eq(socialPosts.eventId, eventId)));

  revalidateTag(postsTag(eventId), "max");
}

export async function reorderPosts(eventId: string, orderedIds: string[]) {
  await db.transaction(async (tx) => {
    for (const [position, id] of orderedIds.entries()) {
      await tx
        .update(socialPosts)
        .set({ position, updatedAt: new Date() })
        .where(
          and(eq(socialPosts.id, id), eq(socialPosts.eventId, eventId)),
        );
    }
  });

  revalidateTag(postsTag(eventId), "max");
}

async function nextPosition(eventId: string) {
  const [row] = await db
    .select({ max: sql<number>`coalesce(max(${socialPosts.position}), -1)` })
    .from(socialPosts)
    .where(eq(socialPosts.eventId, eventId));

  return (row?.max ?? -1) + 1;
}
