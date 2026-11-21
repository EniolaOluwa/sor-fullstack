import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Single source of truth for the database.
 * Types (`$inferSelect` / `$inferInsert`) and zod schemas (`src/server/validation.ts`)
 * are derived from this file — never hand-write duplicates.
 */

export const liveModeValues = ["idle", "program", "post", "song", "qr"] as const;
export const liveModeEnum = pgEnum("live_mode", liveModeValues);

export type LyricSection = {
  type: "verse" | "chorus" | "bridge" | "tag" | "intro" | "outro" | "recitation";
  label?: string;
  lines: string[];
};

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  tagline: text("tagline"),
  venue: text("venue"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  coverImageUrl: text("cover_image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const programItems = pgTable(
  "program_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
    title: text("title").notNull(),
    description: text("description"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    isVisible: boolean("is_visible").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("program_items_event_position_idx").on(t.eventId, t.position)],
);

export const songs = pgTable(
  "songs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    songKey: text("song_key"),
    author: text("author"),
    lyrics: jsonb("lyrics").$type<LyricSection[]>().notNull().default([]),
    position: integer("position").notNull().default(0),
    isVisible: boolean("is_visible").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("songs_event_slug_idx").on(t.eventId, t.slug),
    index("songs_event_position_idx").on(t.eventId, t.position),
  ],
);

export const socialPosts = pgTable(
  "social_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    instagramUrl: text("instagram_url").notNull(),
    shortcode: text("shortcode"),
    caption: text("caption"),
    imageUrl: text("image_url"),
    position: integer("position").notNull().default(0),
    isVisible: boolean("is_visible").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("social_posts_event_position_idx").on(t.eventId, t.position),
  ],
);

export const liveState = pgTable("live_state", {
  eventId: uuid("event_id")
    .primaryKey()
    .references(() => events.id, { onDelete: "cascade" }),
  mode: liveModeEnum("mode").notNull().default("idle"),
  programItemId: uuid("program_item_id").references(() => programItems.id, {
    onDelete: "set null",
  }),
  songId: uuid("song_id").references(() => songs.id, { onDelete: "set null" }),
  postId: uuid("post_id").references(() => socialPosts.id, {
    onDelete: "set null",
  }),
  message: text("message"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const eventsRelations = relations(events, ({ many, one }) => ({
  programItems: many(programItems),
  songs: many(songs),
  socialPosts: many(socialPosts),
  liveState: one(liveState),
}));

export const programItemsRelations = relations(programItems, ({ one }) => ({
  event: one(events, {
    fields: [programItems.eventId],
    references: [events.id],
  }),
}));

export const songsRelations = relations(songs, ({ one }) => ({
  event: one(events, { fields: [songs.eventId], references: [events.id] }),
}));

export const socialPostsRelations = relations(socialPosts, ({ one }) => ({
  event: one(events, {
    fields: [socialPosts.eventId],
    references: [events.id],
  }),
}));

export const liveStateRelations = relations(liveState, ({ one }) => ({
  event: one(events, {
    fields: [liveState.eventId],
    references: [events.id],
  }),
  programItem: one(programItems, {
    fields: [liveState.programItemId],
    references: [programItems.id],
  }),
  song: one(songs, {
    fields: [liveState.songId],
    references: [songs.id],
  }),
  post: one(socialPosts, {
    fields: [liveState.postId],
    references: [socialPosts.id],
  }),
}));

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type ProgramItem = typeof programItems.$inferSelect;
export type NewProgramItem = typeof programItems.$inferInsert;
export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;
export type SocialPost = typeof socialPosts.$inferSelect;
export type NewSocialPost = typeof socialPosts.$inferInsert;
export type LiveState = typeof liveState.$inferSelect;
export type NewLiveState = typeof liveState.$inferInsert;
export type LiveMode = (typeof liveModeValues)[number];
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
