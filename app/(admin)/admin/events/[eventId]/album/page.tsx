import Link from "next/link";
import { notFound } from "next/navigation";

import { getEventById } from "@/server/repositories/events.repository";
import { getUploadedPhotosByEventPaginatedWithGuest } from "@/server/repositories/photos.repository";
import { deleteEventAlbumPhotoAction } from "./actions";
import DeletePhotoButton from "./delete-photo-button";
import PhotoPreviewModal from "./photo-preview-modal";

interface PageProps {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function EventAlbumPage({
  params,
  searchParams,
}: PageProps) {
  const { eventId } = await params;
  const { page: pageParam, search: searchParam } = await searchParams;

  const parsedPage = Number(pageParam ?? "1");
  const currentPage =
    Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  const search = (searchParam ?? "").trim();

  const limit = 24;
  const offset = (currentPage - 1) * limit;

  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  const { photos, total } = await getUploadedPhotosByEventPaginatedWithGuest(
    eventId,
    limit,
    offset,
    search
  );

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const buildAlbumUrl = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", String(page));

    if (search) {
      params.set("search", search);
    }

    return `/admin/events/${event.id}/album?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
          Álbum del evento
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-stone-900">
          {event.name}
        </h1>

        <p className="mt-3 text-stone-600">
          Todas las fotos subidas por los invitados.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/admin/events/${event.id}`}
            className="rounded-2xl border px-4 py-2 text-sm text-stone-800"
          >
            ← Volver al evento
          </Link>

          <a
            href={`/api/download-event-photos/${event.id}`}
            className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Descargar todas las fotos
          </a>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-4 shadow-sm">
        <form className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Buscar por invitado..."
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />

          <button
            type="submit"
            className="rounded-xl bg-stone-900 px-4 py-2 text-sm text-white"
          >
            Buscar
          </button>

          {search ? (
            <Link
              href={`/admin/events/${event.id}/album`}
              className="rounded-xl border px-4 py-2 text-center text-sm text-stone-700"
            >
              Limpiar
            </Link>
          ) : null}
        </form>
      </section>

      {photos.length === 0 ? (
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-stone-600">
            {search
              ? `No se encontraron fotos para "${search}".`
              : "Este evento todavía no tiene fotos subidas."}
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => {
            const deleteAction = deleteEventAlbumPhotoAction.bind(
              null,
              event.id,
              photo.guest_id,
              photo.id
            );

            return (
              <div
                key={photo.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                <div className="bg-stone-100">
                  <PhotoPreviewModal
                    imageUrl={photo.public_url}
                    filename={photo.original_filename}
                    guestName={photo.guests?.display_name}
                    uploadedAt={photo.uploaded_at}
                  />
                </div>

                <div className="space-y-2 p-3">
                  <p className="line-clamp-1 text-xs text-stone-700">
                    {photo.original_filename || "Sin nombre"}
                  </p>

                  <p className="text-xs text-stone-500">
                    Invitado: {photo.guests?.display_name || "Sin nombre"}
                  </p>

                  <p className="text-xs text-stone-400">
                    {photo.uploaded_at
                      ? new Intl.DateTimeFormat("es-GT", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(photo.uploaded_at))
                      : "Sin fecha"}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/events/${event.id}/guests/${photo.guest_id}`}
                      className="text-xs text-blue-600"
                    >
                      Ver invitado
                    </Link>

                    <form action={deleteAction}>
                      <DeletePhotoButton />
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {totalPages > 1 && (
        <section className="flex items-center justify-center gap-3">
          <Link
            href={buildAlbumUrl(Math.max(currentPage - 1, 1))}
            className="rounded-xl border px-4 py-2 text-sm"
          >
            ← Anterior
          </Link>

          <p className="text-sm text-stone-600">
            Página {currentPage} de {totalPages}
          </p>

          <Link
            href={buildAlbumUrl(Math.min(currentPage + 1, totalPages))}
            className="rounded-xl border px-4 py-2 text-sm"
          >
            Siguiente →
          </Link>
        </section>
      )}
    </div>
  );
}