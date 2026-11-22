import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
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

export const liveModeValues = ["idle", "program", "song", "qr"] as const;
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

/**
 * Admin-curated membership of songs in a program item (e.g. a performance set).
 * Order is taken from `songs.position`, so no position column is needed here.
 */
export const programItemSongs = pgTable(
  "program_item_songs",
  {
    programItemId: uuid("program_item_id")
      .notNull()
      .references(() => programItems.id, { onDelete: "cascade" }),
    songId: uuid("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.programItemId, t.songId] })],
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

/**
 * Lightweight first-party analytics. One row per audience page view; unique
 * visitors are counted by `visitorId` (a random id kept in localStorage).
 * No IP addresses are stored.
 */
export const visits = pgTable(
  "visits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    visitorId: uuid("visitor_id").notNull(),
    path: text("path").notNull(),
    deviceType: text("device_type").notNull(),
    os: text("os"),
    browser: text("browser"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("visits_created_at_idx").on(t.createdAt),
    index("visits_visitor_idx").on(t.visitorId),
  ],
);

export const eventsRelations = relations(events, ({ many, one }) => ({
  programItems: many(programItems),
  songs: many(songs),
  liveState: one(liveState),
}));

export const programItemsRelations = relations(programItems, ({ one, many }) => ({
  event: one(events, {
    fields: [programItems.eventId],
    references: [events.id],
  }),
  songs: many(programItemSongs),
}));

export const songsRelations = relations(songs, ({ one, many }) => ({
  event: one(events, { fields: [songs.eventId], references: [events.id] }),
  programItems: many(programItemSongs),
}));

export const programItemSongsRelations = relations(
  programItemSongs,
  ({ one }) => ({
    programItem: one(programItems, {
      fields: [programItemSongs.programItemId],
      references: [programItems.id],
    }),
    song: one(songs, {
      fields: [programItemSongs.songId],
      references: [songs.id],
    }),
  }),
);

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
}));

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type ProgramItem = typeof programItems.$inferSelect;
export type NewProgramItem = typeof programItems.$inferInsert;
export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;
export type ProgramItemSong = typeof programItemSongs.$inferSelect;
export type NewProgramItemSong = typeof programItemSongs.$inferInsert;
export type LiveState = typeof liveState.$inferSelect;
export type NewLiveState = typeof liveState.$inferInsert;
export type LiveMode = (typeof liveModeValues)[number];
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Visit = typeof visits.$inferSelect;
export type NewVisit = typeof visits.$inferInsert;
