"use server";

import { revalidatePath } from "next/cache";
import { updateEventDetails } from "@/server/repositories/events.repository";

export async function updateEventSettingsAction(
  eventId: string,
  formData: FormData
) {
  const name = formData.get("name") as string;
  const coupleNames = formData.get("coupleNames") as string;
  const slug = formData.get("slug") as string;
  const maxPhotosPerGuest = Number(formData.get("maxPhotosPerGuest"));
  const sharedGalleryEnabled = formData.get("sharedGalleryEnabled") === "on";
  const isActive = formData.get("isActive") === "on";

  await updateEventDetails(eventId, {
    name,
    coupleNames,
    slug,
    maxPhotosPerGuest,
    sharedGalleryEnabled,
    isActive,
  });

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}/settings`);
}