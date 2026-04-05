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
      <section className="wedding-card p-7">
        <p className="wedding-label">{event.couple_names}</p>

        <h1 className="mt-3 text-3xl font-semibold wedding-title">
          {event.name}
        </h1>

        <div className="wedding-divider mt-4" />

        <p className="mt-4 text-sm wedding-muted">
          Un espacio especial para conservar los recuerdos de este día.
        </p>
      </section>

      <section className="wedding-card p-7">
        <h2 className="text-2xl font-semibold wedding-title">
          Bienvenida del evento
        </h2>

        <div className="wedding-divider mt-3" />

        <p className="mt-5 leading-7 wedding-muted">
          {event.welcome_message ||
            "Cada sonrisa, cada abrazo y cada instante hacen de este día un recuerdo inolvidable."}
        </p>

        <div className="mt-8 space-y-3">
          <Link
            href={`/${event.slug}/enter`}
            className="wedding-button-primary inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 transition"
          >
            Subir mis fotos
          </Link>

          <Link
            href={`/${event.slug}/shared`}
            className="wedding-button-secondary inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 transition"
          >
            Ver recuerdos compartidos
          </Link>
        </div>
      </section>
    </div>
  );
}