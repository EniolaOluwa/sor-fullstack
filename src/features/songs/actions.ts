"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/guards";
import { parseLyrics } from "@/lib/lyrics";
import { slugify } from "@/lib/slug";
import { getActiveEvent } from "@/server/services/events";
import { setLiveState } from "@/server/services/live";
import {
  createSong,
  deleteSong,
  listSongsFresh,
  songsTag,
  updateSong,
} from "@/server/services/songs";
import { lyricsSchema, songUpdateSchema } from "@/server/validation";

const idSchema = z.string().uuid();
const updateSchema = songUpdateSchema.pick({
  title: true,
  author: true,
  songKey: true,
  isVisible: true,
});

async function activeEventId() {
  const event = await getActiveEvent();
  if (!event) throw new Error("No active event");
  return event.id;
}

export async function createSongAction(formData: FormData) {
  await requireAdmin();
  const eventId = await activeEventId();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("A title is required.");
  const author = String(formData.get("author") ?? "").trim();

  const existing = await listSongsFresh(eventId, { includeHidden: true });
  const base = slugify(title) || "song";
  let slug = base;
  for (let i = 2; existing.some((song) => song.slug === slug); i++) {
    slug = `${base}-${i}`;
  }

  await createSong({
    eventId,
    slug,
    title,
    author: author || null,
    lyrics: [],
  });
  updateTag(songsTag(eventId));
}

export async function updateSongAction(formData: FormData) {
  await requireAdmin();
  const eventId = await activeEventId();
  const id = idSchema.parse(formData.get("id"));

  const parsed = updateSchema.safeParse({
    title: formData.get("title"),
    author: formData.get("author") || null,
    songKey: formData.get("songKey") || null,
    isVisible: formData.get("isVisible") === "on",
  });
  if (!parsed.success) throw new Error("A title is required.");

  const lyrics = lyricsSchema.safeParse(
    parseLyrics(String(formData.get("lyrics") ?? "")),
  );
  if (!lyrics.success) {
    throw new Error("Lyrics are empty — add at least one section or line.");
  }

  await updateSong(eventId, id, { ...parsed.data, lyrics: lyrics.data });
  updateTag(songsTag(eventId));
  redirect("/admin/songs");
}

export async function deleteSongAction(formData: FormData) {
  await requireAdmin();
  const eventId = await activeEventId();
  const id = idSchema.parse(formData.get("id"));

  await deleteSong(eventId, id);
  updateTag(songsTag(eventId));
  redirect("/admin/songs");
}

export async function toggleSongVisibilityAction(formData: FormData) {
  await requireAdmin();
  const eventId = await activeEventId();
  const id = idSchema.parse(formData.get("id"));

  await updateSong(eventId, id, {
    isVisible: formData.get("nextIsVisible") === "true",
  });
  updateTag(songsTag(eventId));
}

export async function setCurrentSongAction(formData: FormData) {
  await requireAdmin();
  const eventId = await activeEventId();
  const id = idSchema.parse(formData.get("id"));

  await setLiveState(eventId, {
    mode: "song",
    songId: id,
    programItemId: null,
    postId: null,
    message: null,
  });
}
