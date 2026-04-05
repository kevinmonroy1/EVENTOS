"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getGuestById } from "@/server/repositories/guests.repository";

export async function deleteGuestAction(
  eventId: string,
  guestId: string
) {
  const supabase = await createClient();

  const guest = await getGuestById(guestId);

  if (!guest) {
    throw new Error("El invitado no existe.");
  }

  // 🔥 obtener todas las fotos del invitado
  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("guest_id", guestId);

  // 🔥 eliminar archivos del storage
  if (photos && photos.length > 0) {
    const paths = photos
      .filter((p) => p.storage_path)
      .map((p) => p.storage_path);

    if (paths.length > 0) {
      await supabase.storage
        .from("event-photos")
        .remove(paths);
    }
  }

  // 🔥 eliminar fotos de DB
  await supabase
    .from("photos")
    .delete()
    .eq("guest_id", guestId);

  // 🔥 eliminar invitado
  await supabase
    .from("guests")
    .delete()
    .eq("id", guestId);

  // 🔥 refrescar vistas
  revalidatePath(`/admin/events/${eventId}/guests`);
  revalidatePath(`/admin/events/${eventId}`);
}