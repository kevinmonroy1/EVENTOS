import { notFound } from "next/navigation";
import { getPublicEventBySlug } from "@/server/repositories/public-events.repository";
import { resolveGuestEntryAction } from "./actions";

interface EnterPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EnterPage({ params }: EnterPageProps) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const submitAction = resolveGuestEntryAction.bind(null, slug);

  return (
    <div className="wedding-shell">
      <div className="wedding-container space-y-6">
        <section className="wedding-card wedding-hero wedding-section-glow p-7">
          <p className="wedding-label">{event.couple_names}</p>

          <h1 className="mt-4 text-4xl font-semibold leading-tight wedding-title">
            Ingresa tu nombre
          </h1>

          <div className="wedding-divider mt-5" />

          <p className="mt-5 text-base leading-8 wedding-muted">
            Escribe tu nombre para comenzar a compartir tus fotografías y formar
            parte de los recuerdos de este día tan especial.
          </p>

          <div className="mt-6 wedding-mini-note px-4 py-4">
            <p className="text-sm leading-6 wedding-soft">
              Tu nombre nos ayudará a organizar mejor las imágenes que compartas
              durante el evento.
            </p>
          </div>
        </section>

        <section className="wedding-card p-7">
          <form action={submitAction} className="space-y-6">
            <div className="space-y-3">
              <label
                htmlFor="guestName"
                className="text-sm font-medium text-[var(--color-primary)]"
              >
                Tu nombre
              </label>

              <input
                id="guestName"
                name="guestName"
                type="text"
                placeholder="Ejemplo: Kevin"
                className="wedding-input"
                required
                minLength={2}
              />
            </div>

            <button
              type="submit"
              className="wedding-button-primary w-full px-4 py-3 text-base"
            >
              Continuar
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}