import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getPublicEventBySlug } from "@/server/repositories/public-events.repository";
import { getGuestById } from "@/server/repositories/guests.repository";
import { getUploadedPhotosByGuest } from "@/server/repositories/photos.repository";
import PhotoUploadClient from "@/components/public/photo-upload-client";

interface UploadPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ guestId?: string }>;
}

export default async function UploadPage({
  params,
  searchParams,
}: UploadPageProps) {
  const { slug } = await params;
  const { guestId } = await searchParams;

  const event = await getPublicEventBySlug(slug);
  if (!event) notFound();

  if (!event.is_active) {
    redirect(`/${slug}/closed`);
  }

  if (!guestId) {
    redirect(`/${slug}/enter`);
  }

  const guest = await getGuestById(guestId);
  if (!guest || guest.event_id !== event.id) {
    notFound();
  }

  const uploadedCount = guest.uploaded_count ?? 0;
  const maxAllowed = guest.max_allowed ?? event.max_photos_per_guest;
  const remainingCount = Math.max(maxAllowed - uploadedCount, 0);

  if (uploadedCount >= maxAllowed) {
    redirect(`/${slug}/shared?guestId=${guest.id}`);
  }

  const uploadedPhotos = await getUploadedPhotosByGuest(guest.id);

  const progress = Math.round((uploadedCount / maxAllowed) * 100);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
          {event.couple_names}
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-stone-900">
          Hola, {guest.display_name}
        </h1>

        <p className="mt-2 text-stone-600">
          Estás compartiendo tus recuerdos en{" "}
          <strong>{event.name}</strong>.
        </p>
      </section>

      {/* PROGRESO */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">
          Tu progreso
        </h2>

        <div className="mt-4">
          {/* barra */}
          <div className="h-3 w-full rounded-full bg-stone-200">
            <div
              className="h-3 rounded-full bg-black transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 flex justify-between text-sm text-stone-600">
            <span>{uploadedCount} fotos</span>
            <span>{maxAllowed} máximo</span>
          </div>

          <p className="mt-2 text-sm text-stone-500">
            Te faltan {remainingCount} foto(s)
          </p>
        </div>
      </section>

      {/* UPLOAD */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">
          Subir fotos
        </h2>

        <p className="mt-2 text-sm text-stone-600">
          Puedes elegir desde tu galería o tomar fotos en el momento.
        </p>

        <div className="mt-4">
          <PhotoUploadClient
            slug={slug}
            guestId={guest.id}
            maxAllowed={maxAllowed}
            uploadedCount={uploadedCount}
            guestName={guest.display_name}
          />
        </div>
      </section>

      {/* GALERÍA */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">
            Tus fotos
          </h2>

          <span className="text-sm text-stone-500">
            {uploadedPhotos.length}
          </span>
        </div>

        {uploadedPhotos.length === 0 ? (
          <p className="mt-4 text-sm text-stone-500">
            Aún no has subido fotos.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {uploadedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-2xl border"
              >
                <div className="relative h-36 w-full">
                  <Image
                    src={photo.public_url}
                    alt={photo.original_filename}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}