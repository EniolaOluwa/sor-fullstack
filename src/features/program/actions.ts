"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/guards";
import { getActiveEvent } from "@/server/services/events";
import { setLiveState } from "@/server/services/live";
import {
  createProgramItem,
  deleteProgramItem,
  moveProgramItem,
  programTag,
  updateProgramItem,
} from "@/server/services/program";
import {
  programItemInsertSchema,
  programItemUpdateSchema,
} from "@/server/validation";

const idSchema = z.string().uuid();
const createSchema = programItemInsertSchema.pick({
  title: true,
  description: true,
});
const updateSchema = programItemUpdateSchema.pick({
  title: true,
  description: true,
  isVisible: true,
});

async function activeEventId() {
  const event = await getActiveEvent();
  if (!event) throw new Error("No active event");
  return event.id;
}

export async function createProgramItemAction(formData: FormData) {
  await requireAdmin();
  const eventId = await activeEventId();

  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || null,
  });
  if (!parsed.success) throw new Error("A title is required.");

  await createProgramItem({
    eventId,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
  });
  updateTag(programTag(eventId));
}

export async function updateProgramItemAction(formData: FormData) {
  await requireAdmin();
  const eventId = await activeEventId();
  const id = idSchema.parse(formData.get("id"));

  const parsed = updateSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || null,
    isVisible: formData.get("isVisible") === "on",
  });
  if (!parsed.success) throw new Error("A title is required.");

  await updateProgramItem(eventId, id, parsed.data);
  updateTag(programTag(eventId));
  redirect("/admin/program");
}

export async function deleteProgramItemAction(formData: FormData) {
  await requireAdmin();
  const eventId = await activeEventId();
  const id = idSchema.parse(formData.get("id"));

  await deleteProgramItem(eventId, id);
  updateTag(programTag(eventId));
  redirect("/admin/program");
}

export async function moveProgramItemAction(formData: FormData) {
  await requireAdmin();
  const eventId = await activeEventId();
  const id = idSchema.parse(formData.get("id"));
  const direction = formData.get("direction") === "up" ? "up" : "down";

  await moveProgramItem(eventId, id, direction);
  updateTag(programTag(eventId));
}

export async function toggleProgramItemVisibilityAction(formData: FormData) {
  await requireAdmin();
  const eventId = await activeEventId();
  const id = idSchema.parse(formData.get("id"));

  await updateProgramItem(eventId, id, {
    isVisible: formData.get("nextIsVisible") === "true",
  });
  updateTag(programTag(eventId));
}

export async function setCurrentProgramItemAction(formData: FormData) {
  await requireAdmin();
  const eventId = await activeEventId();
  const id = idSchema.parse(formData.get("id"));

  await setLiveState(eventId, {
    mode: "program",
    programItemId: id,
    songId: null,
    postId: null,
    message: null,
  });
}
