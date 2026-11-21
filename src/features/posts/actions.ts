"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { z } from "zod";
import { extractInstagramShortcode } from "@/lib/instagram";
import { requireAdmin } from "@/server/auth/guards";
import { getActiveEvent } from "@/server/services/events";
import { resolveInstagramPost } from "@/server/instagram";
import { deleteMedia, saveUpload } from "@/server/media";
import { setLiveState } from "@/server/services/live";
import {
  createPost,
  deletePost,
  getPostByIdFresh,
  postsTag,
  updatePost,
} from "@/server/services/posts";
import { postInsertSchema, postUpdateSchema } from "@/server/validation";

const idSchema = z.string().uuid();
const updateSchema = postUpdateSchema.pick({ caption: true, isVisible: true });

async function activeEventId() {
  const event = await getActiveEvent();
  if (!event) throw new Error("No active event");
  return event.id;
}

export async function createPostAction(formData: FormData) {
  await requireAdmin();
  const eventId = await activeEventId();

  const parsed = postInsertSchema
    .pick({ instagramUrl: true })
    .safeParse({ instagramUrl: formData.get("instagramUrl") });
  if (!parsed.success) throw new Error("Enter a valid Instagram post URL.");

  const instagramUrl = parsed.data.instagramUrl;
  const shortcode = extractInstagramShortcode(instagramUrl);
  if (!shortcode) {
    throw new Error(
      "That doesn't look like an Instagram post, reel, or TV link.",
    );
  }

  // Optional oEmbed auto-fill when IG_OEMBED_TOKEN is configured.
  const resolved = await resolveInstagramPost(instagramUrl);

  const post = await createPost({
    eventId,
    instagramUrl,
    shortcode,
    caption: resolved?.caption ?? null,
    imageUrl: resolved?.imagePath ?? null,
  });

  updateTag(postsTag(eventId));
  redirect(`/admin/posts/${post.id}`);
}

export async function updatePostAction(formData: FormData) {
  await requireAdmin();
  const eventId = await activeEventId();
  const id = idSchema.parse(formData.get("id"));

  const parsed = updateSchema.safeParse({
    caption: formData.get("caption") || null,
    isVisible: formData.get("isVisible") === "on",
  });
  if (!parsed.success) throw new Error("Could not save the post.");

  await updatePost(eventId, id, parsed.data);
  updateTag(postsTag(eventId));
  redirect("/admin/posts");
}

export async function uploadPostImageAction(formData: FormData) {
  await requireAdmin();
  const eventId = await activeEventId();
  const id = idSchema.parse(formData.get("id"));

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose an image file to upload.");
  }

  const imagePath = await saveUpload(file);

  const existing = await getPostByIdFresh(eventId, id);
  await updatePost(eventId, id, { imageUrl: imagePath });
  if (existing?.imageUrl) {
    await deleteMedia(existing.imageUrl);
  }

  updateTag(postsTag(eventId));
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();
  const eventId = await activeEventId();
  const id = idSchema.parse(formData.get("id"));

  const existing = await getPostByIdFresh(eventId, id);
  await deletePost(eventId, id);
  if (existing?.imageUrl) {
    await deleteMedia(existing.imageUrl);
  }

  updateTag(postsTag(eventId));
  redirect("/admin/posts");
}

export async function togglePostVisibilityAction(formData: FormData) {
  await requireAdmin();
  const eventId = await activeEventId();
  const id = idSchema.parse(formData.get("id"));

  await updatePost(eventId, id, {
    isVisible: formData.get("nextIsVisible") === "true",
  });
  updateTag(postsTag(eventId));
}

export async function setCurrentPostAction(formData: FormData) {
  await requireAdmin();
  const eventId = await activeEventId();
  const id = idSchema.parse(formData.get("id"));

  await setLiveState(eventId, {
    mode: "post",
    postId: id,
    programItemId: null,
    songId: null,
    message: null,
  });
}
