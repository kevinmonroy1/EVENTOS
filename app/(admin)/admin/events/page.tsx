import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAllEvents } from "@/server/repositories/events.repository";

export default async function EventsPage() {
  const events = await getAllEvents();

  const totalEvents = events.length;
  const activeEvents = events.filter((event) => event.is_active).length;
  const inactiveEvents = events.filter((event) => !event.is_active).length;
  const sharedGalleryActive = events.filter(
    (event) => event.shared_gallery_enabled
  ).length;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
              Panel administrativo
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-stone-900">
              Eventos
            </h1>

            <p className="mt-3 text-stone-600">
              Administra todos los eventos, revisa su estado y entra rápido a
              cada panel.
            </p>
          </div>

          <Button asChild>
            <Link href="/admin/events/new">Crear evento</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Total eventos</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">
            {totalEvents}
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Activos</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">
            {activeEvents}
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Inactivos</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">
            {inactiveEvents}
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Galería activa</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">
            {sharedGalleryActive}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        {events.length === 0 ? (
          <p className="text-stone-600">
            No hay eventos registrados todavía.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl border bg-stone-50 p-5 transition hover:bg-stone-100"
              >
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-stone-900">
                    {event.name}
                  </h2>

                  <p className="text-sm text-stone-500">
                    {event.couple_names}
                  </p>

                  <p className="text-xs text-stone-400">
                    /{event.slug}
                  </p>
                </div>

                <div className="mt-4 space-y-2 text-sm text-stone-700">
                  <p>
                    <span className="font-medium">Estado:</span>{" "}
                    {event.is_active ? "Activo" : "Inactivo"}
                  </p>

                  <p>
                    <span className="font-medium">Galería:</span>{" "}
                    {event.shared_gallery_enabled ? "Activa" : "Desactivada"}
                  </p>

                  <p>
                    <span className="font-medium">Máx. fotos:</span>{" "}
                    {event.max_photos_per_guest}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="rounded-xl border bg-white px-3 py-2 text-xs text-stone-800"
                  >
                    Panel
                  </Link>

                  <Link
                    href={`/admin/events/${event.id}/summary`}
                    className="rounded-xl border bg-white px-3 py-2 text-xs text-stone-800"
                  >
                    Resumen
                  </Link>

                  <Link
                    href={`/admin/events/${event.id}/album`}
                    className="rounded-xl border bg-white px-3 py-2 text-xs text-stone-800"
                  >
                    Álbum
                  </Link>

                  <Link
                    href={`/admin/events/${event.id}/guests`}
                    className="rounded-xl border bg-white px-3 py-2 text-xs text-stone-800"
                  >
                    Invitados
                  </Link>

                  <Link
                    href={`/${event.slug}`}
                    target="_blank"
                    className="rounded-xl border bg-white px-3 py-2 text-xs text-stone-800"
                  >
                    Público
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}