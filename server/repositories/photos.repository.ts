import { createClient } from "@/lib/supabase/server";

interface CreatePhotoRecordInput {
  eventId: string;
  guestId: string;
  originalFilename: string;
  storedFilename: string;
  mimeType: string | null;
  extension: string | null;
  sizeBytes: number | null;
  storageBucket: string | null;
  storagePath: string | null;
  publicUrl: string | null;
}

export async function createPhotoRecords(records: CreatePhotoRecordInput[]) {
  const supabase = await createClient();

  const payload = records.map((record) => ({
    event_id: record.eventId,
    guest_id: record.guestId,
    original_filename: record.originalFilename,
    stored_filename: record.storedFilename,
    mime_type: record.mimeType,
    extension: record.extension,
    size_bytes: record.sizeBytes,
    storage_bucket: record.storageBucket,
    storage_path: record.storagePath,
    public_url: record.publicUrl,
    upload_status: "uploaded",
    uploaded_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("photos")
    .insert(payload)
    .select("*");

  if (error) {
    throw new Error(`No se pudieron registrar las fotos: ${error.message}`);
  }

  return data;
}

export async function countUploadedPhotosByGuest(guestId: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("guest_id", guestId)
    .eq("upload_status", "uploaded");

  if (error) {
    throw new Error(`No se pudo contar las fotos del invitado: ${error.message}`);
  }

  return count ?? 0;
}

export async function countUploadedPhotosByEvent(eventId: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("upload_status", "uploaded");

  if (error) {
    throw new Error(`No se pudo contar las fotos del evento: ${error.message}`);
  }

  return count ?? 0;
}

export async function getUploadedPhotosByGuest(guestId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("guest_id", guestId)
    .eq("upload_status", "uploaded")
    .order("uploaded_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron obtener las fotos del invitado: ${error.message}`);
  }

  return data ?? [];
}

export async function getUploadedPhotosByEvent(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("event_id", eventId)
    .eq("upload_status", "uploaded")
    .order("uploaded_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron obtener las fotos del evento: ${error.message}`);
  }

  return data ?? [];
}

export async function getUploadedPhotosByEventPaginated(
  eventId: string,
  limit: number,
  offset: number
) {
  const supabase = await createClient();

  const from = offset;
  const to = offset + limit - 1;

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("event_id", eventId)
    .eq("upload_status", "uploaded")
    .order("uploaded_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`No se pudieron obtener las fotos paginadas del evento: ${error.message}`);
  }

  return data ?? [];
}

export async function getPhotoById(photoId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("id", photoId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function deletePhotoById(photoId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("photos")
    .delete()
    .eq("id", photoId);

  if (error) {
    throw new Error(`No se pudo eliminar la foto: ${error.message}`);
  }

  return true;
}

export async function getRecentUploadedPhotosByEvent(
  eventId: string,
  limit: number
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("event_id", eventId)
    .eq("upload_status", "uploaded")
    .order("uploaded_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(
      `No se pudieron obtener las fotos recientes del evento: ${error.message}`
    );
  }

  return data ?? [];
}

export async function getUploadedPhotosByEventPaginatedWithGuest(
  eventId: string,
  limit: number,
  offset: number,
  search?: string
) {
  const supabase = await createClient();

  const from = offset;
  const to = offset + limit - 1;

  let query = supabase
    .from("photos")
    .select(
      `
        *,
        guests!inner (
          id,
          display_name
        )
      `,
      { count: "exact" }
    )
    .eq("event_id", eventId)
    .eq("upload_status", "uploaded");

  if (search && search.trim() !== "") {
    query = query.ilike("guests.display_name", `%${search.trim()}%`);
  }

  const { data, error, count } = await query
    .order("uploaded_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(
      `No se pudieron obtener las fotos paginadas del evento: ${error.message}`
    );
  }

  return {
    photos: data ?? [],
    total: count ?? 0,
  };
}