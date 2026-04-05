import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/server/repositories/events.repository";
import { getGuestsByEvent } from "@/server/repositories/guests.repository";

interface Props {
  params: Promise<{ eventId: string }>;
}

function formatDate(dateValue: string | null) {
  if (!dateValue) return "Sin actividad";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Fecha inválida";

  return new Intl.DateTimeFormat("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusLabel(status: string | null) {
  switch (status) {
    case "empty":
      return "Vacío";
    case "incomplete":
      return "Incompleto";
    case "complete":
      return "Completo";
    default:
      return status || "Sin estado";
  }
}

function getStatusClasses(status: string | null) {
  switch (status) {
    case "empty":
      return "bg-stone-100 text-stone-700";
    case "incomplete":
      return "bg-amber-100 text-amber-800";
    case "complete":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-stone-100 text-stone-700";
  }
}

export default async function Page({ params }: Props) {
  const { eventId } = await params;

  const event = await getEventById(eventId);

  if (!event) notFound();

  const guests = await getGuestsByEvent(event.id);

  const emptyCount = guests.filter((guest) => guest.status === "empty").length;
  const incompleteCount = guests.filter(
    (guest) => guest.status === "incomplete"
  ).length;
  const completeCount = guests.filter(
    (guest) => guest.status === "complete"
  ).length;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
          Invitados del evento
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-stone-900">
          {event.name}
        </h1>

        <p className="mt-3 text-stone-600">
          Revisa quiénes han entrado, cuántas fotos llevan y su estado actual.
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

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Total invitados</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">
            {guests.length}
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Vacíos</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">
            {emptyCount}
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Incompletos</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">
            {incompleteCount}
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Completos</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">
            {completeCount}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-stone-900">
              Lista de invitados
            </h2>
            <p className="text-sm text-stone-600">
              {guests.length} invitado(s) registrados
            </p>
          </div>

          <Link
            href={`/admin/events/${event.id}/album`}
            className="rounded-2xl border px-4 py-2 text-sm text-stone-800"
          >
            Ver álbum
          </Link>
        </div>

        {guests.length === 0 ? (
          <p className="mt-6 text-stone-600">
            No hay invitados aún.
          </p>
        ) : (
          <div className="mt-6 grid gap-3">
            {guests.map((guest) => {
              const uploadedCount = guest.uploaded_count ?? 0;
              const maxAllowed =
                guest.max_allowed ?? event.max_photos_per_guest;

              return (
                <Link
                  key={guest.id}
                  href={`/admin/events/${event.id}/guests/${guest.id}`}
                  className="rounded-2xl border bg-stone-50 p-4 transition hover:bg-stone-100"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                      <p className="font-medium text-stone-900">
                        {guest.display_name}
                      </p>

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                          guest.status
                        )}`}
                      >
                        {getStatusLabel(guest.status)}
                      </span>
                    </div>

                    <div className="text-sm text-stone-700 sm:text-right">
                      <p>
                        <span className="font-medium">Fotos:</span> {uploadedCount} / {maxAllowed}
                      </p>
                      <p className="text-xs text-stone-400">
                        {formatDate(guest.last_activity_at)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}