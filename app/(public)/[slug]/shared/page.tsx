import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getPublicEventBySlug } from "@/server/repositories/public-events.repository";
import { getGuestById } from "@/server/repositories/guests.repository";
import {
  countUploadedPhotosByEvent,
  getUploadedPhotosByEventPaginated,
  getUploadedPhotosByGuest,
} from "@/server/repositories/photos.repository";
import SharedGalleryModal from "@/components/public/shared-gallery-modal";

interface SharedPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ guestId?: string; offset?: string }>;
}

const PHOTOS_PER_PAGE = 20;

export default async function SharedPage({
  params,
  searchParams,
}: SharedPageProps) {
  const { slug } = await params;
  const { guestId, offset } = await searchParams;

  const event = await getPublicEventBySlug(slug);

  if (!event) notFound();

  if (!event.is_active) {
    redirect(`/${slug}/closed`);
  }

  if (!event.shared_gallery_enabled) {
    return (
      <div className="wedding-shell">
        <div className="wedding-container space-y-6">
          <section className="wedding-card p-7">
            <h1 className="text-2xl wedding-title">
              Recuerdos no disponibles
            </h1>
            <p className="mt-3 wedding-muted">
              La galería compartida aún no está disponible para este evento.
            </p>
          </section>
        </div>
      </div>
    );
  }

  const parsedOffset = Number(offset ?? "0");
  const currentOffset =
    Number.isNaN(parsedOffset) || parsedOffset < 0 ? 0 : parsedOffset;

  let guest = null;
  let guestUploadedPhotos: Awaited<ReturnType<typeof getUploadedPhotosByGuest>> =
    [];

  if (guestId) {
    guest = await getGuestById(guestId);

    if (guest && guest.event_id === event.id) {
      guestUploadedPhotos = await getUploadedPhotosByGuest(guest.id);
    } else {
      guest = null;
    }
  }

  const totalPhotos = await countUploadedPhotosByEvent(event.id);

  const photos = await getUploadedPhotosByEventPaginated(
    event.id,
    PHOTOS_PER_PAGE,
    currentOffset
  );

  const nextOffset = currentOffset + PHOTOS_PER_PAGE;
  const hasMorePhotos = nextOffset < totalPhotos;

  const nextPhotosHref = guestId
    ? `/${slug}/shared?guestId=${guestId}&offset=${nextOffset}`
    : `/${slug}/shared?offset=${nextOffset}`;

  return (
    <div className="wedding-shell">
      <div className="wedding-container space-y-6">
        <section className="wedding-card wedding-hero p-7">
          <p className="wedding-label">{event.couple_names}</p>

          <h1 className="mt-4 text-4xl wedding-title">
            {guest
              ? `Gracias, ${guest.display_name} ✨`
              : "Recuerdos compartidos"}
          </h1>

          <div className="wedding-divider mt-5" />

          <p className="mt-5 wedding-muted leading-8">
            {guest
              ? `Hemos guardado ${guestUploadedPhotos.length} recuerdo(s) de tu parte. Gracias por formar parte de este momento tan especial.`
              : "Cada fotografía es un fragmento de este día. Explora los recuerdos compartidos por todos los invitados."}
          </p>
        </section>

        {guest && (
          <section className="wedding-card p-7">
            <h2 className="text-2xl wedding-title">
              Tu participación
            </h2>

            <div className="wedding-divider mt-3" />

            <div className="mt-5 grid grid-cols-2 gap-4 text-sm wedding-muted">
              <div>
                <p className="wedding-soft">Invitado</p>
                <p className="font-medium">{guest.display_name}</p>
              </div>

              <div>
                <p className="wedding-soft">Fotos</p>
                <p className="font-medium">
                  {guestUploadedPhotos.length}
                </p>
              </div>

              <div>
                <p className="wedding-soft">Estado</p>
                <p className="font-medium">{guest.status}</p>
              </div>
            </div>
          </section>
        )}

        <section className="wedding-card p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl wedding-title">
              Galería del evento
            </h2>

            <span className="wedding-chip">
              {totalPhotos}
            </span>
          </div>

          <div className="wedding-divider mt-3" />

          {photos.length === 0 ? (
            <div className="wedding-empty mt-5 px-4 py-5 text-sm wedding-muted">
              Aún no hay fotos compartidas en este evento.
            </div>
          ) : (
            <>
              <SharedGalleryModal photos={photos} />

              {hasMorePhotos && (
                <div className="mt-8 flex justify-center">
                  <Link
                    href={nextPhotosHref}
                    className="wedding-button-secondary px-6 py-3"
                  >
                    Ver más recuerdos
                  </Link>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}