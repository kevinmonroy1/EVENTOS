import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/server/repositories/events.repository";
import {
  countGuestsByEvent,
  countGuestsByStatus,
  getGuestsByEvent,
} from "@/server/repositories/guests.repository";
import {
  countUploadedPhotosByEvent,
  getRecentUploadedPhotosByEvent,
} from "@/server/repositories/photos.repository";

interface AdminEventSummaryPageProps {
  params: Promise<{ eventId: string }>;
}

function formatDate(dateValue: string | null) {
  if (!dateValue) return "Sin fecha";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Fecha inválida";

  return new Intl.DateTimeFormat("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminEventSummaryPage({
  params,
}: AdminEventSummaryPageProps) {
  const { eventId } = await params;

  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  const [
    totalGuests,
    totalPhotos,
    emptyGuests,
    incompleteGuests,
    completeGuests,
    guests,
    recentPhotos,
  ] = await Promise.all([
    countGuestsByEvent(event.id),
    countUploadedPhotosByEvent(event.id),
    countGuestsByStatus(event.id, "empty"),
    countGuestsByStatus(event.id, "incomplete"),
    countGuestsByStatus(event.id, "complete"),
    getGuestsByEvent(event.id),
    getRecentUploadedPhotosByEvent(event.id, 6),
  ]);

  const topGuests = [...guests]
    .sort((a, b) => (b.uploaded_count ?? 0) - (a.uploaded_count ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
          Resumen del evento
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-stone-900">
          {event.name}
        </h1>

        <p className="mt-3 text-stone-600">
          Estado general del evento, actividad y comportamiento de invitados.
        </p>

        <div className="mt-4">
          <Link
            href={`/admin/events/${event.id}`}
            className="rounded-2xl border px-4 py-2 text-sm text-stone-800"
          >
            ← Volver al evento
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Invitados" value={totalGuests} />
        <StatCard label="Fotos" value={totalPhotos} />
        <StatCard label="Vacíos" value={emptyGuests} />
        <StatCard label="Incompletos" value={incompleteGuests} />
        <StatCard label="Completos" value={completeGuests} />
      </section>

      {/* TOP + STATUS */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* TOP */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-stone-900">
              Top invitados
            </h2>

            <Link
              href={`/admin/events/${event.id}/guests`}
              className="text-sm text-stone-600 hover:underline"
            >
              Ver todos
            </Link>
          </div>

          {topGuests.length === 0 ? (
            <p className="mt-4 text-stone-600">
              Aún no hay invitados registrados.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {topGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between rounded-2xl border bg-stone-50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-stone-900">
                      {guest.display_name}
                    </p>
                    <p className="text-sm text-stone-500 capitalize">
                      {guest.status}
                    </p>
                  </div>

                  <p className="text-lg font-semibold text-stone-900">
                    {guest.uploaded_count ?? 0}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* STATUS */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-stone-900">
            Estado del evento
          </h2>

          <div className="mt-4 space-y-3 text-stone-700">
            <p>
              <span className="font-medium">Evento:</span>{" "}
              {event.is_active ? "Activo" : "Inactivo"}
            </p>
            <p>
              <span className="font-medium">Galería:</span>{" "}
              {event.shared_gallery_enabled ? "Activa" : "Desactivada"}
            </p>
            <p>
              <span className="font-medium">Slug:</span> {event.slug}
            </p>
            <p>
              <span className="font-medium">Máx fotos:</span>{" "}
              {event.max_photos_per_guest}
            </p>
          </div>
        </section>
      </section>

      {/* FOTOS RECIENTES */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-stone-900">
            Fotos recientes
          </h2>

          <Link
            href={`/admin/events/${event.id}/album`}
            className="text-sm text-stone-600 hover:underline"
          >
            Ver álbum completo
          </Link>
        </div>

        {recentPhotos.length === 0 ? (
          <p className="mt-4 text-stone-600">
            Aún no hay fotos registradas.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {recentPhotos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-2xl border bg-stone-50"
              >
                <div className="relative h-32 w-full bg-stone-100">
                  {photo.public_url ? (
                    <Image
                      src={photo.public_url}
                      alt="Foto reciente"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-stone-500">
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="p-2 text-[11px] text-stone-500">
                  {formatDate(photo.uploaded_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* 🔥 COMPONENTE REUTILIZABLE */
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-stone-900">
        {value}
      </p>
    </div>
  );
}