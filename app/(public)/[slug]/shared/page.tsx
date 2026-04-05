import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getPublicEventBySlug } from "@/server/repositories/public-events.repository";
import { getGuestById } from "@/server/repositories/guests.repository";
import {
  countUploadedPhotosByEvent,
  getUploadedPhotosByEventPaginated,
  getUploadedPhotosByGuest,
} from "@/server/repositories/photos.repository";

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

  if (!event) {
    notFound();
  }

  if (!event.is_active) {
    redirect(`/${slug}/closed`);
  }

  if (!event.shared_gallery_enabled) {
    return (
      <div className="space-y-6">
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-stone-900">
            Recuerdos compartidos desactivados
          </h1>
          <p className="mt-3 text-stone-600">
            Este evento no tiene activa la galería compartida por el momento.
          </p>
        </section>
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
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
          {event.couple_names}
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-stone-900">
          {guest
            ? `Gracias por compartir tus recuerdos, ${guest.display_name}`
            : "Recuerdos compartidos"}
        </h1>

        <p className="mt-3 text-stone-600">
          {guest
            ? `Hemos registrado ${guestUploadedPhotos.length} foto(s) de tu parte. Gracias por ser parte de este momento especial.`
            : "Entre sonrisas, abrazos y alegría, cada fotografía conserva un recuerdo inolvidable."}
        </p>
      </section>

      {guest ? (
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-stone-900">
            Tu participación
          </h2>

          <div className="mt-4 space-y-3 text-stone-700">
            <p>
              <span className="font-medium">Invitado:</span> {guest.display_name}
            </p>
            <p>
              <span className="font-medium">Fotos compartidas:</span>{" "}
              {guestUploadedPhotos.length}
            </p>
            <p>
              <span className="font-medium">Estado:</span> {guest.status}
            </p>
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-stone-900">
            Galería del evento
          </h2>
          <span className="text-sm text-stone-500">
            {totalPhotos} foto(s)
          </span>
        </div>

        {photos.length === 0 ? (
          <p className="mt-4 text-stone-600">
            Aún no hay fotos compartidas en este evento.
          </p>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo) => (
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
                </div>
              ))}
            </div>

            {hasMorePhotos ? (
              <div className="mt-6 flex justify-center">
                <Link
                  href={nextPhotosHref}
                  className="rounded-2xl border px-4 py-3 text-sm font-medium text-stone-800"
                >
                  Ver más fotos
                </Link>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}