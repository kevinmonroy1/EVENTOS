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
        <h1 className="text-3xl font-semibold text-stone-900">
          {event.name}
        </h1>
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