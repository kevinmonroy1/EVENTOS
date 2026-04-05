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

  if (!event) {
    notFound();
  }

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

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
          {event.couple_names}
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-stone-900">
          Hola, {guest.display_name}
        </h1>

        <p className="mt-3 text-stone-600">
          Ya estás dentro del evento <strong>{event.name}</strong>.
        </p>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-900">Tu progreso</h2>

        <div className="mt-4 space-y-3 text-stone-700">
          <p>
            <span className="font-medium">Fotos subidas:</span> {uploadedCount}
          </p>
          <p>
            <span className="font-medium">Máximo permitido:</span> {maxAllowed}
          </p>
          <p>
            <span className="font-medium">Fotos restantes:</span> {remainingCount}
          </p>
          <p>
            <span className="font-medium">Estado:</span> {guest.status}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-900">
          Subida de fotos
        </h2>

        <p className="mt-3 text-stone-600">
          Selecciona tus imágenes y revisa tus miniaturas antes de enviarlas.
        </p>

        <div className="mt-5">
          <PhotoUploadClient
            slug={slug}
            guestId={guest.id}
            maxAllowed={maxAllowed}
            uploadedCount={uploadedCount}
            guestName={guest.display_name}
          />
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-stone-900">
            Tus fotos registradas
          </h2>
          <span className="text-sm text-stone-500">
            {uploadedPhotos.length} foto(s)
          </span>
        </div>

        {uploadedPhotos.length === 0 ? (
          <p className="mt-4 text-stone-600">
            Aún no has registrado fotos en este evento.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {uploadedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-2xl border bg-stone-50"
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

                <div className="space-y-1 p-3">
                  <p className="line-clamp-2 text-xs text-stone-700">
                    {photo.original_filename}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}