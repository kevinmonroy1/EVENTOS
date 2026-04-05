"use server";

import { revalidatePath } from "next/cache";
import { updateEventStatus } from "@/server/repositories/events.repository";

// 🔥 ACTIVAR / DESACTIVAR EVENTO
export async function toggleEventStatusAction(
  eventId: string,
  nextIsActive: boolean
) {
  await updateEventStatus(eventId, nextIsActive);

  revalidatePath(`/admin/events/${eventId}`);
}