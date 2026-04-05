"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  getGuestById,
  updateGuestUploadProgress,
} from "@/server/repositories/guests.repository";
import {
  countUploadedPhotosByGuest,
  deletePhotoById,
  getPhotoById,
} from "@/server/repositories/photos.repository";

export async function deleteEventAlbumPhotoAction(
  eventId: string,
  guestId: string,
  photoId: string
) {
  const guest = await getGuestById(guestId);

  if (!guest) {
    throw new Error("El invitado no existe.");
  }

  const photo = await getPhotoById(photoId);

  if (!photo) {
    throw new Error("La foto no existe.");
  }

  if (photo.guest_id !== guest.id || photo.event_id !== eventId) {
    throw new Error("La foto no pertenece a este invitado o evento.");
  } 

  const supabase = await createClient();

  if (photo.storage_bucket && photo.storage_path) {
    const { error: storageError } = await supabase.storage
      .from(photo.storage_bucket)
      .remove([photo.storage_path]);

    if (storageError) {
      throw new Error(
        `No se pudo eliminar el archivo del storage: ${storageError.message}`
      );
    }
  }

  await deletePhotoById(photo.id);

  const nextUploadedCount = await countUploadedPhotosByGuest(guest.id);
  const maxAllowed = guest.max_allowed ?? 0;

  await updateGuestUploadProgress(guest.id, nextUploadedCount, maxAllowed);

  revalidatePath(`/admin/events/${eventId}/album`);
  revalidatePath(`/admin/events/${eventId}/guests/${guestId}`);
  revalidatePath(`/admin/events/${eventId}/guests`);
  revalidatePath(`/admin/events/${eventId}/summary`);
  revalidatePath(`/admin/events/${eventId}`);
}