import { createClient } from "@/lib/supabase/server";

export async function getPublicEventBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("is_deleted", false)
    .single();

  if (error) {
    return null;
  }

  return data;
}