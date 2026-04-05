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
    <div className="space-y-6">
      <section className="wedding-card p-7">
        <p className="wedding-label">{event.couple_names}</p>

        <h1 className="mt-3 text-3xl font-semibold wedding-title">
          Ingresa tu nombre
        </h1>

        <div className="wedding-divider mt-4" />

        <p className="mt-5 leading-7 wedding-muted">
          Escribe tu nombre para comenzar a compartir tus fotografías del
          evento.
        </p>
      </section>

      <section className="wedding-card p-7">
        <form action={submitAction} className="space-y-5">
          <div className="space-y-2">
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
              className="w-full rounded-2xl border border-[var(--color-border-soft)] bg-white px-4 py-3 text-[var(--color-text)] outline-none transition focus:border-[var(--color-gold)]"
              required
              minLength={2}
            />
          </div>

          <button
            type="submit"
            className="wedding-button-primary w-full rounded-2xl px-4 py-3 transition"
          >
            Continuar
          </button>
        </form>
      </section>
    </div>
  );
}