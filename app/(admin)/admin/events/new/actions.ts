"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createEventSchema } from "@/lib/validators/event";

export async function createEventAction(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    coupleNames: formData.get("coupleNames"),
    slug: formData.get("slug"),
    status: formData.get("status"),
    templateStyle: formData.get("templateStyle"),
    maxPhotosPerGuest: formData.get("maxPhotosPerGuest"),
    sharedGalleryEnabled: formData.get("sharedGalleryEnabled") === "true",
  };

  const parsed = createEventSchema.safeParse(rawData);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Datos inválidos.");
  }

  const supabase = await createClient();

  const { error } = await supabase.from("events").insert({
    name: parsed.data.name,
    couple_names: parsed.data.coupleNames,
    slug: parsed.data.slug,
    status: parsed.data.status,
    template_style: parsed.data.templateStyle,
    max_photos_per_guest: parsed.data.maxPhotosPerGuest,
    shared_gallery_enabled: parsed.data.sharedGalleryEnabled,
  });

  if (error) {
    throw new Error(`No se pudo crear el evento: ${error.message}`);
  }

  redirect("/admin/events");
}