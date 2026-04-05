import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicEventBySlug } from "@/server/repositories/public-events.repository";


interface EventPublicPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventPublicPage({
  params,
}: EventPublicPageProps) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
          Evento
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-stone-900">
          {event.name}
        </h1>

        <p className="mt-2 text-lg text-stone-700">{event.couple_names}</p>

        <div className="mt-4 space-y-2 text-sm text-stone-600">
          <p>
            <span className="font-medium">Slug:</span> /{event.slug}
          </p>
          <p>
            <span className="font-medium">Estado:</span> {event.status}
          </p>
          <p>
            <span className="font-medium">Máximo de fotos:</span>{" "}
            {event.max_photos_per_guest}
          </p>
          <p>
            <span className="font-medium">Galería compartida:</span>{" "}
            {event.shared_gallery_enabled ? "Activada" : "Desactivada"}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-900">
          Bienvenida del evento
        </h2>

        <p className="mt-3 text-stone-600">
          {event.welcome_message ||
            "Cada sonrisa, cada abrazo y cada instante hacen de este día un recuerdo inolvidable."}
        </p>

         <div className="mt-6 space-y-3">
          <Link
            href={`/${event.slug}/enter`}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-stone-900 px-4 py-3 text-white"
          >
            Subir mis fotos
          </Link>

          <Link
            href={`/${event.slug}/shared`}
            className="inline-flex w-full items-center justify-center rounded-2xl border px-4 py-3 text-stone-900"
          >
            Ver recuerdos compartidos
          </Link>
        </div>
      </section>
    </div>
  );
}