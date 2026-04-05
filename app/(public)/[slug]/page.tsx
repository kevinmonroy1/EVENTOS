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
    <div className="wedding-shell">
      <div className="wedding-container space-y-6">
        <section className="wedding-card wedding-hero wedding-section-glow p-7">
          <p className="wedding-label">{event.couple_names}</p>

          <h1 className="mt-4 text-4xl font-semibold leading-tight wedding-title">
            {event.name}
          </h1>

          <div className="wedding-divider mt-5" />

          <p className="mt-5 text-base leading-8 wedding-muted">
            Un espacio creado para reunir con cariño las sonrisas, los abrazos y
            los recuerdos más especiales de este día.
          </p>

          <div className="mt-6 wedding-mini-note px-4 py-4">
            <p className="text-sm leading-6 wedding-soft">
              Aquí podrás compartir tus fotografías y descubrir los momentos que
              otros invitados también han querido conservar.
            </p>
          </div>
        </section>

        <section className="wedding-card p-7">
          <h2 className="text-3xl font-semibold leading-tight wedding-title">
            Bienvenida al evento
          </h2>

          <div className="wedding-divider mt-4" />

          <p className="mt-6 text-base leading-8 wedding-muted">
            {event.welcome_message ||
              "Cada sonrisa, cada abrazo y cada instante hacen de este día un recuerdo inolvidable. Gracias por acompañarnos y por ayudarnos a guardar en fotografías los momentos que harán este evento aún más especial."}
          </p>

          <div className="mt-8 grid gap-4">
            <Link
              href={`/${event.slug}/enter`}
              className="wedding-button-primary inline-flex w-full items-center justify-center px-4 py-3 text-base"
            >
              Subir mis fotos
            </Link>

            <Link
              href={`/${event.slug}/shared`}
              className="wedding-button-secondary inline-flex w-full items-center justify-center px-4 py-3 text-base"
            >
              Ver recuerdos compartidos
            </Link>
          </div>

          <p className="mt-5 text-center text-sm wedding-soft">
            Comparte tus momentos y forma parte de este recuerdo colectivo.
          </p>
        </section>
      </div>
    </div>
  );
}