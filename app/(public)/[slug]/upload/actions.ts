"use server";

import { revalidatePath } from "next/cache";
import { getPublicEventBySlug } from "@/server/repositories/public-events.repository";
import {
  getGuestById,
  updateGuestUploadProgress,
} from "@/server/repositories/guests.repository";
import {
  countUploadedPhotosByGuest,
  createPhotoRecords,
} from "@/server/repositories/photos.repository";
import { uploadFromUrlToDrive } from "@/lib/google-drive";

function getFileExtension(filename: string) {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return null;
  return filename.slice(lastDotIndex + 1).toLowerCase();
}

export async function uploadGuestPhotosAction(
  slug: string,
  guestId: string,
  filesData: Array<{
    name: string;
    type: string;
    size: number;
    storagePath: string;
    publicUrl: string;
  }>
) {
  if (!filesData || filesData.length === 0) {
    throw new Error("No se recibieron fotos para registrar.");
  }

  const event = await getPublicEventBySlug(slug);

  if (!event) {
    throw new Error("El evento no existe.");
  }

  const guest = await getGuestById(guestId);

  if (!guest || guest.event_id !== event.id) {
    throw new Error("El invitado no pertenece a este evento.");
  }

  const currentUploaded = guest.uploaded_count ?? 0;
  const maxAllowed = guest.max_allowed ?? event.max_photos_per_guest;
  const remainingCount = Math.max(maxAllowed - currentUploaded, 0);

  if (remainingCount <= 0) {
    throw new Error("Ya alcanzaste el máximo de fotos permitido.");
  }

  if (filesData.length > remainingCount) {
    throw new Error(`Solo puedes subir ${remainingCount} foto(s) más.`);
  }

  const records = filesData.map((file) => ({
    eventId: event.id,
    guestId: guest.id,
    originalFilename: file.name,
    storedFilename: file.storagePath.split("/").pop() || file.name,
    mimeType: file.type || null,
    extension: getFileExtension(file.name),
    sizeBytes: typeof file.size === "number" ? file.size : null,
    storageBucket: "event-photos",
    storagePath: file.storagePath,
    publicUrl: file.publicUrl,
  }));

  await createPhotoRecords(records);

  for (const file of filesData) {
    try {
      await uploadFromUrlToDrive(
        file.publicUrl,
        file.name,
        file.type || "image/jpeg"
      );
    } catch (error) {
      console.error(
        `Error subiendo "${file.name}" a Drive:`,
        error
      );
    }
  }

  const nextUploadedCount = await countUploadedPhotosByGuest(guest.id);

  await updateGuestUploadProgress(guest.id, nextUploadedCount, maxAllowed);

  revalidatePath(`/${slug}/upload`);
  revalidatePath(`/${slug}/shared`);
  revalidatePath(`/${slug}`);
}