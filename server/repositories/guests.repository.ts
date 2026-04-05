import { createClient } from "@/lib/supabase/server";

function normalizeGuestName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export async function findGuestByName(eventId: string, name: string) {
  const supabase = await createClient();
  const normalizedName = normalizeGuestName(name);

  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("event_id", eventId)
    .eq("normalized_name", normalizedName)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function createGuest(
  eventId: string,
  name: string,
  maxAllowed: number
) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("El nombre del invitado es obligatorio.");
  }

  const supabase = await createClient();
  const normalizedName = normalizeGuestName(trimmedName);

  const { data, error } = await supabase
    .from("guests")
    .insert({
      event_id: eventId,
      display_name: trimmedName,
      normalized_name: normalizedName,
      max_allowed: maxAllowed,
      status: "empty",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`No se pudo crear el invitado: ${error.message}`);
  }

  return data;
}

export async function findOrCreateGuest(
  eventId: string,
  name: string,
  maxAllowed: number
) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("El nombre del invitado es obligatorio.");
  }

  const existingGuest = await findGuestByName(eventId, trimmedName);

  if (existingGuest) {
    return existingGuest;
  }

  return createGuest(eventId, trimmedName, maxAllowed);
}

export async function getGuestById(guestId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("id", guestId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function updateGuestUploadProgress(
  guestId: string,
  uploadedCount: number,
  maxAllowed: number
) {
  const supabase = await createClient();

  const nextStatus =
    uploadedCount <= 0
      ? "empty"
      : uploadedCount >= maxAllowed
      ? "complete"
      : "incomplete";

  const { data, error } = await supabase
    .from("guests")
    .update({
      uploaded_count: uploadedCount,
      status: nextStatus,
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", guestId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `No se pudo actualizar el progreso del invitado: ${error.message}`
    );
  }

  return data;
}

export async function countGuestsByEvent(eventId: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("guests")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  if (error) {
    throw new Error(`No se pudo contar los invitados del evento: ${error.message}`);
  }

  return count ?? 0;
}

export async function getGuestsByEvent(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron obtener los invitados del evento: ${error.message}`);
  }

  return data ?? [];
}

export async function countGuestsByStatus(
  eventId: string,
  status: "empty" | "incomplete" | "complete"
) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("guests")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", status);

  if (error) {
    throw new Error(`No se pudo contar invitados por estado: ${error.message}`);
  }

  return count ?? 0;
}