import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/server/repositories/events.repository";
import { getGuestById } from "@/server/repositories/guests.repository";
import { getUploadedPhotosByGuest } from "@/server/repositories/photos.repository";
import { deleteGuestPhotoAction } from "./actions";

interface AdminGuestDetailPageProps {
  params: Promise<{ eventId: string; guestId: string }>;
}

function formatDate(dateValue: string | null) {
  if (!dateValue) {
    return "Sin actividad";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Fecha inválida";
  }

  return new Intl.DateTimeFormat("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminGuestDetailPage({
  params,
}: AdminGuestDetailPageProps) {
  const { eventId, guestId } = await params;

  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  const guest = await getGuestById(guestId);

  if (!guest || guest.event_id !== event.id) {
    notFound();
  }

  const photos = await getUploadedPhotosByGuest(guest.id);
  const uploadedCount = guest.uploaded_count ?? 0;
  const maxAllowed = guest.max_allowed ?? event.max_photos_per_guest;
  const remainingCount = Math.max(maxAllowed - uploadedCount, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
          Detalle del invitado
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-stone-900">
          {guest.display_name}
        </h1>

        <p className="mt-3 text-stone-600">
          Seguimiento individual del progreso de carga de fotografías.
        </p>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-stone-900">
              Información del invitado
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Evento: {event.name}
            </p>
          </div>

          <Link
            href={`/admin/events/${event.id}/guests`}
            className="rounded-2xl border px-4 py-3 text-sm font-medium text-stone-800"
          >
            Volver a invitados
          </Link>
        </div>

        <div className="mt-6 space-y-3 text-stone-700">
          <p>
            <span className="font-medium">Nombre:</span> {guest.display_name}
          </p>
          <p>
            <span className="font-medium">Fotos subidas:</span> {uploadedCount}
          </p>
          <p>
            <span className="font-medium">Máximo permitido:</span> {maxAllowed}
          </p>
          <p>
            <span className="font-medium">Restantes:</span> {remainingCount}
          </p>
          <p>
            <span className="font-medium">Estado:</span> {guest.status}
          </p>
          <p>
            <span className="font-medium">Última actividad:</span>{" "}
            {formatDate(guest.last_activity_at)}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-stone-900">
            Fotos del invitado
          </h2>
          <span className="text-sm text-stone-500">
            {photos.length} foto(s)
          </span>
        </div>

        {photos.length === 0 ? (
          <p className="mt-4 text-stone-600">
            Este invitado aún no ha subido fotos.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo) => {
              const deleteAction = deleteGuestPhotoAction.bind(
                null,
                event.id,
                guest.id,
                photo.id
              );

              return (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-2xl border bg-stone-50"
                >
                  <div className="relative h-36 w-full bg-stone-100">
                    {photo.public_url ? (
                      <Image
                        src={photo.public_url}
                        alt={photo.original_filename || "Foto del invitado"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-stone-500">
                        Esta foto no tiene URL pública disponible
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 p-3">
                    <p className="line-clamp-2 text-xs text-stone-700">
                      {photo.original_filename || "Sin nombre de archivo"}
                    </p>

                    <form action={deleteAction}>
                      <button
                        type="submit"
                        className="w-full rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700"
                      >
                        Eliminar foto
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}