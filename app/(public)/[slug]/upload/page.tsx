import Image from "next/image";
import Link from "next/link";
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

  const progress =
    maxAllowed > 0
      ? Math.round((uploadedCount / maxAllowed) * 100)
      : 0;

  return (
    <div className="wedding-shell">
      <div className="wedding-container space-y-6">

        {/* 💎 HERO */}
        <section className="wedding-card wedding-hero wedding-section-glow p-7">
          <p className="wedding-label">{event.couple_names}</p>

          <h1 className="mt-4 text-4xl font-semibold wedding-title">
            Hola, {guest.display_name} 👋
          </h1>

          <div className="wedding-divider mt-5" />

          <p className="mt-5 leading-8 wedding-muted">
            Estás formando parte de un momento único.  
            Comparte tus recuerdos en <strong>{event.name}</strong> 💚
          </p>

          <div className="mt-6 wedding-mini-note px-4 py-4">
            <p className="text-sm wedding-soft">
              Cada fotografía que subas será parte de este recuerdo colectivo.
            </p>
          </div>

          {/* 🔥 BOTÓN */}
          <Link
            href={`/${slug}/shared?guestId=${guest.id}`}
            className="wedding-button-secondary mt-6 w-full"
          >
            Ver álbum compartido
          </Link>
        </section>

        {/* 📸 SUBIR */}
        <section className="wedding-card p-7">
          <h2 className="text-2xl font-semibold wedding-title">
            Subir fotos
          </h2>

          <div className="wedding-divider mt-3" />

          <p className="mt-5 text-sm wedding-muted">
            Puedes elegir imágenes desde tu galería o capturar nuevos momentos.
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

        {/* 📊 PROGRESO */}
        <section className="wedding-card p-7">
          <h2 className="text-2xl font-semibold wedding-title">
            Tu participación
          </h2>

          <div className="wedding-divider mt-3" />

          <div className="mt-6">
            <div className="wedding-progress-track">
              <div
                className="wedding-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-3 flex justify-between text-sm wedding-muted">
              <span>{uploadedCount} fotos</span>
              <span>{maxAllowed} máximo</span>
            </div>

            <p className="mt-4 text-sm wedding-muted">
              {uploadedCount === 0
                ? "Aún no has comenzado a subir tus recuerdos."
                : uploadedCount < maxAllowed
                ? `Te faltan ${remainingCount} foto(s) para completar tu participación.`
                : "Ya completaste tu participación ✨"}
            </p>
          </div>
        </section>

        {/* 📷 GALERÍA */}
        <section className="wedding-card p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold wedding-title">
              Tus fotos
            </h2>

            <span className="wedding-chip">
              {uploadedPhotos.length}
            </span>
          </div>

          <div className="wedding-divider mt-3" />

          {uploadedPhotos.length === 0 ? (
            <div className="wedding-empty mt-5 px-4 py-5 text-sm wedding-muted">
              Aún no has subido fotos.
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {uploadedPhotos.map((photo) => (
                <div key={photo.id} className="wedding-photo-frame">
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
    </div>
  );
}