import { z } from "zod";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { events, liveState, programItems, songs } from "./db/schema";

/**
 * Zod schemas derived from the Drizzle schema (single source of truth).
 * Used by server actions, forms, and route handlers — never hand-write duplicates.
 */

const slug = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers and dashes",
  );

const title = (schema: z.ZodString) => schema.trim().min(1, "Title is required");

/* Events */

export const eventInsertSchema = createInsertSchema(events, { slug, title });
export const eventUpdateSchema = createUpdateSchema(events, { slug, title });

/* Program items */

export const programItemInsertSchema = createInsertSchema(programItems, {
  title,
});
export const programItemUpdateSchema = createUpdateSchema(programItems, {
  title,
});

/* Songs */

export const lyricSectionSchema = z.object({
  type: z.enum([
    "verse",
    "chorus",
    "bridge",
    "tag",
    "intro",
    "outro",
    "recitation",
  ]),
  label: z.string().trim().max(40).optional(),
  lines: z.array(z.string().trim()).min(1, "A section needs at least one line"),
});

export const lyricsSchema = z
  .array(lyricSectionSchema)
  .min(1, "Add at least one lyric line");

export const songInsertSchema = createInsertSchema(songs, { slug, title });
export const songUpdateSchema = createUpdateSchema(songs, { slug, title });

/* Live state */

export const liveStateUpdateSchema = createUpdateSchema(liveState).omit({
  eventId: true,
  updatedAt: true,
});
