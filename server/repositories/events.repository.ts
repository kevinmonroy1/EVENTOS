import { createClient } from "@/lib/supabase/server";

export async function getAllEvents() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getEventById(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error) return null;

  return data;
}

export async function updateEventStatus(eventId: string, isActive: boolean) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function updateEventDetails(
  eventId: string,
  input: {
    name: string;
    coupleNames: string;
    slug: string;
    maxPhotosPerGuest: number;
    sharedGalleryEnabled: boolean;
    isActive: boolean;
  }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .update({
      name: input.name,
      couple_names: input.coupleNames,
      slug: input.slug,
      max_photos_per_guest: input.maxPhotosPerGuest,
      shared_gallery_enabled: input.sharedGalleryEnabled,
      is_active: input.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function setEventDriveFolder(
  eventId: string,
  folderId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .update({
      drive_folder_id: folderId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  if (error) throw new Error(error.message);
}
export function getDriveFolderUrl(folderId: string) {
  return `https://drive.google.com/drive/folders/${folderId}`;
}