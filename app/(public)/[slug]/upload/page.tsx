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
  const progress = maxAllowed > 0 ? Math.round((uploadedCount / maxAllowed) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="wedding-card p-7">
        <p className="wedding-label">{event.couple_names}</p>

        <h1 className="mt-3 text-3xl font-semibold wedding-title">
          Hola, {guest.display_name}
        </h1>

        <div className="wedding-divider mt-4" />

        <p className="mt-5 leading-7 wedding-muted">
          Estás compartiendo tus recuerdos en <strong>{event.name}</strong>.
        </p>
      </section>

      <section className="wedding-card p-7">
        <h2 className="text-2xl font-semibold wedding-title">Tu progreso</h2>

        <div className="wedding-divider mt-3" />

        <div className="mt-5">
          <div className="h-3 w-full rounded-full bg-[var(--color-border-soft)]">
            <div
              className="h-3 rounded-full bg-[var(--color-primary)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 flex justify-between text-sm wedding-muted">
            <span>{uploadedCount} fotos</span>
            <span>{maxAllowed} máximo</span>
          </div>

          <p className="mt-3 text-sm wedding-muted">
            Te faltan {remainingCount} foto(s) para completar tu participación.
          </p>
        </div>
      </section>

      <section className="wedding-card p-7">
        <h2 className="text-2xl font-semibold wedding-title">Subir fotos</h2>

        <div className="wedding-divider mt-3" />

        <p className="mt-5 text-sm leading-6 wedding-muted">
          Puedes elegir imágenes desde tu galería o tomar fotos en el momento.
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

      <section className="wedding-card p-7">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold wedding-title">Tus fotos</h2>

          <span className="rounded-full border border-[var(--color-border-soft)] px-3 py-1 text-sm wedding-muted">
            {uploadedPhotos.length}
          </span>
        </div>

        <div className="wedding-divider mt-3" />

        {uploadedPhotos.length === 0 ? (
          <p className="mt-5 text-sm wedding-muted">
            Aún no has subido fotos.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {uploadedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-2xl border border-[var(--color-border-soft)] bg-white"
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