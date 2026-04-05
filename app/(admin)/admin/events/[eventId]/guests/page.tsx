import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/server/repositories/events.repository";
import { getGuestsByEvent } from "@/server/repositories/guests.repository";
import { deleteGuestAction } from "./[guestId]/actions";

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

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-stone-900">
          Invitados - {event.name}
        </h1>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        {guests.length === 0 ? (
          <p>No hay invitados.</p>
        ) : (
          <div className="grid gap-3">
            {guests.map((guest) => {
              const uploadedCount = guest.uploaded_count ?? 0;
              const maxAllowed =
                guest.max_allowed ?? event.max_photos_per_guest;

              return (
                <div
                  key={guest.id}
                  className="rounded-2xl border bg-stone-50 p-4 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{guest.display_name}</p>

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs ${getStatusClasses(
                          guest.status
                        )}`}
                      >
                        {getStatusLabel(guest.status)}
                      </span>
                    </div>

                    <div className="text-sm text-right">
                      <p>
                        {uploadedCount} / {maxAllowed}
                      </p>
                      <p className="text-xs text-stone-400">
                        {formatDate(guest.last_activity_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/events/${event.id}/guests/${guest.id}`}
                      className="rounded-xl border px-3 py-2 text-sm"
                    >
                      Ver
                    </Link>

                    <form
                      action={deleteGuestAction.bind(
                        null,
                        event.id,
                        guest.id
                      )}
                    >
                      <button
                        type="submit"
                        className="rounded-xl bg-red-500 text-white px-3 py-2 text-sm"
                      >
                        Eliminar
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