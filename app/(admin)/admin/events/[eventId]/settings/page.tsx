import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/server/repositories/events.repository";
import { updateEventSettingsAction } from "./actions";

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function SettingsPage({ params }: Props) {
  const { eventId } = await params;

  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  const action = updateEventSettingsAction.bind(null, event.id);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
              Configuración del evento
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-stone-900">
              {event.name}
            </h1>

            <p className="mt-3 text-stone-600">
              Edita los datos principales del evento, el slug, el límite de
              fotos y el estado general.
            </p>
          </div>

          <Link
            href={`/admin/events/${event.id}`}
            className="rounded-2xl border px-4 py-2 text-sm text-stone-800"
          >
            ← Volver al evento
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <form action={action} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Nombre del evento
              </label>
              <input
                name="name"
                defaultValue={event.name}
                className="w-full rounded-2xl border px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Nombre de la pareja
              </label>
              <input
                name="coupleNames"
                defaultValue={event.couple_names}
                className="w-full rounded-2xl border px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-400"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Slug (URL)
              </label>
              <input
                name="slug"
                defaultValue={event.slug}
                className="w-full rounded-2xl border px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-400"
              />
              <p className="mt-2 text-xs text-stone-500">
                Este valor se usa en la URL pública del evento.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Máx. fotos por invitado
              </label>
              <input
                type="number"
                name="maxPhotosPerGuest"
                min={1}
                defaultValue={event.max_photos_per_guest}
                className="w-full rounded-2xl border px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-400"
              />
            </div>
          </div>

          <section className="rounded-2xl border bg-stone-50 p-4">
            <h2 className="text-sm font-semibold text-stone-900">
              Estado y visibilidad
            </h2>

            <div className="mt-4 flex flex-col gap-4">
              <label className="flex items-center gap-3 text-sm text-stone-700">
                <input
                  type="checkbox"
                  name="sharedGalleryEnabled"
                  defaultChecked={event.shared_gallery_enabled}
                  className="h-4 w-4 rounded border-stone-300"
                />
                Galería compartida activa
              </label>

              <label className="flex items-center gap-3 text-sm text-stone-700">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={event.is_active}
                  className="h-4 w-4 rounded border-stone-300"
                />
                Evento activo
              </label>
            </div>
          </section>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              className="rounded-2xl bg-black px-6 py-3 text-sm font-medium text-white"
            >
              Guardar cambios
            </button>

            <Link
              href={`/admin/events/${event.id}`}
              className="rounded-2xl border px-6 py-3 text-sm font-medium text-stone-800"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}