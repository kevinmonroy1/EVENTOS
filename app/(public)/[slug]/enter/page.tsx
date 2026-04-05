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
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
          {event.couple_names}
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-stone-900">
          Ingresa tu nombre
        </h1>

        <p className="mt-3 text-stone-600">
          Escribe tu nombre para comenzar a compartir tus fotografías del evento.
        </p>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <form action={submitAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="guestName" className="text-sm font-medium text-stone-700">
              Tu nombre
            </label>

            <input
              id="guestName"
              name="guestName"
              type="text"
              placeholder="Ejemplo: Kevin"
              className="w-full rounded-2xl border px-4 py-3 outline-none"
              required
              minLength={2}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-stone-900 px-4 py-3 text-white"
          >
            Continuar
          </button>
        </form>
      </section>
    </div>
  );
}