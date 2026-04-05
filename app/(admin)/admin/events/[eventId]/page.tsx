import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/server/repositories/events.repository";
import { countGuestsByEvent } from "@/server/repositories/guests.repository";
import { countUploadedPhotosByEvent } from "@/server/repositories/photos.repository";
import { toggleEventStatusAction } from "./actions";
import CopyButton from "./CopyButton";

interface AdminEventDetailPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function AdminEventDetailPage({
  params,
}: AdminEventDetailPageProps) {
  const { eventId } = await params;

  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  const totalGuests = await countGuestsByEvent(event.id);
  const totalPhotos = await countUploadedPhotosByEvent(event.id);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  const publicEventUrl = `${baseUrl}/${event.slug}`;
  const enterEventUrl = `${baseUrl}/${event.slug}/enter`;

  // 🔥 QR ahora apunta a la BIENVENIDA
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    publicEventUrl
  )}`;

  const toggleStatusAction = toggleEventStatusAction.bind(
    null,
    event.id,
    !event.is_active
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
          Panel del evento
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-stone-900">
          {event.name}
        </h1>

        <p className="mt-3 text-stone-600">
          Administración general del evento y acceso rápido a sus recursos.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <form action={toggleStatusAction}>
            <button
              type="submit"
              className="rounded-2xl bg-black px-4 py-3 text-white"
            >
              {event.is_active ? "Desactivar evento" : "Activar evento"}
            </button>
          </form>

          <Link
            href={`/admin/events/${event.id}/summary`}
            className="rounded-2xl border px-4 py-3 text-sm text-stone-800"
          >
            Ver resumen
          </Link>

          <Link
            href={`/admin/events/${event.id}/settings`}
            className="rounded-2xl border px-4 py-3 text-sm text-stone-800"
          >
            Configuración
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Invitados</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">
            {totalGuests}
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Fotos</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">
            {totalPhotos}
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Estado</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">
            {event.is_active ? "Activo" : "Inactivo"}
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Galería compartida</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">
            {event.shared_gallery_enabled ? "Activa" : "Desactivada"}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-900">
          Acceso por QR
        </h2>

        <p className="mt-3 text-stone-600">
          Comparte este código QR con tus invitados para que entren al evento.
        </p>

        <div className="mt-5 grid gap-6 lg:grid-cols-[240px,1fr] lg:items-start">
          <div className="rounded-3xl border bg-stone-50 p-4">
            <img
              src={qrUrl}
              alt={`QR del evento ${event.name}`}
              className="mx-auto h-[220px] w-[220px]"
            />
          </div>

          <div className="space-y-4 text-sm text-stone-700">
            <div>
              <p className="font-medium text-stone-900">URL pública</p>
              <p className="mt-1 break-all rounded-2xl bg-stone-50 px-3 py-2">
                {publicEventUrl}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={publicEventUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border px-4 py-3 text-stone-800"
              >
                Abrir enlace
              </a>

              <CopyButton text={publicEventUrl} />

              <a
                href={qrUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border px-4 py-3 text-stone-800"
              >
                Abrir QR
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}