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

export async function deleteGuestPhotoAction(
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

  revalidatePath(`/admin/events/${eventId}/guests/${guestId}`);
  revalidatePath(`/admin/events/${eventId}/guests`);
  revalidatePath(`/admin/events/${eventId}`);
}

export async function deleteGuestAction(eventId: string, guestId: string) {
  const supabase = await createClient();

  const guest = await getGuestById(guestId);

  if (!guest) {
    throw new Error("El invitado no existe.");
  }

  const { data: photos, error: photosError } = await supabase
    .from("photos")
    .select("*")
    .eq("guest_id", guestId);

  if (photosError) {
    throw new Error(
      `No se pudieron obtener las fotos del invitado: ${photosError.message}`
    );
  }

  if (photos && photos.length > 0) {
    const storageGroups = new Map<string, string[]>();

    for (const photo of photos) {
      if (photo.storage_bucket && photo.storage_path) {
        const currentPaths = storageGroups.get(photo.storage_bucket) ?? [];
        currentPaths.push(photo.storage_path);
        storageGroups.set(photo.storage_bucket, currentPaths);
      }
    }

    for (const [bucket, paths] of storageGroups.entries()) {
      if (paths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from(bucket)
          .remove(paths);

        if (storageError) {
          throw new Error(
            `No se pudieron eliminar archivos del storage: ${storageError.message}`
          );
        }
      }
    }

    const { error: deletePhotosError } = await supabase
      .from("photos")
      .delete()
      .eq("guest_id", guestId);

    if (deletePhotosError) {
      throw new Error(
        `No se pudieron eliminar las fotos del invitado: ${deletePhotosError.message}`
      );
    }
  }

  const { error: deleteGuestError } = await supabase
    .from("guests")
    .delete()
    .eq("id", guestId)
    .eq("event_id", eventId);

  if (deleteGuestError) {
    throw new Error(
      `No se pudo eliminar el invitado: ${deleteGuestError.message}`
    );
  }

  revalidatePath(`/admin/events/${eventId}/guests`);
  revalidatePath(`/admin/events/${eventId}`);
}