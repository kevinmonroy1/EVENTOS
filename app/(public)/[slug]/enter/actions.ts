"use server";

import { redirect } from "next/navigation";
import { getPublicEventBySlug } from "@/server/repositories/public-events.repository";
import { findOrCreateGuest } from "@/server/repositories/guests.repository";

export async function resolveGuestEntryAction(
  slug: string,
  formData: FormData
) {
  const guestName = String(formData.get("guestName") ?? "").trim();

  if (!guestName) {
    throw new Error("Debes escribir tu nombre para continuar.");
  }

  const event = await getPublicEventBySlug(slug);

  if (!event) {
    throw new Error("El evento no existe.");
  }

  if (!event.is_active) {
    redirect(`/${slug}/closed`);
  }

  const guest = await findOrCreateGuest(
    event.id,
    guestName,
    event.max_photos_per_guest
  );

  const uploadedCount = guest.uploaded_count ?? 0;
  const maxAllowed = guest.max_allowed ?? event.max_photos_per_guest;
  const isCompleted = uploadedCount >= maxAllowed;

  if (isCompleted) {
    redirect(`/${slug}/shared?guestId=${guest.id}`);
  }

  redirect(`/${slug}/upload?guestId=${guest.id}`);
}