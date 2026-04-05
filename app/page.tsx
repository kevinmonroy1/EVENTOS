import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
            Panel principal
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-stone-900">
            Recuerdos Boda
          </h1>

          <p className="mt-3 max-w-2xl text-stone-600">
            Desde aquí puedes administrar tus eventos, entrar rápido al panel y
            revisar la parte pública del proyecto.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/admin/events"
            className="rounded-3xl border bg-white p-6 shadow-sm transition hover:bg-stone-100"
          >
            <p className="text-sm uppercase tracking-[0.15em] text-stone-500">
              Administración
            </p>
            <h2 className="mt-2 text-xl font-semibold text-stone-900">
              Ver eventos
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Entra al listado completo de eventos y administra cada uno.
            </p>
          </Link>

          <Link
            href="/admin/events/new"
            className="rounded-3xl border bg-white p-6 shadow-sm transition hover:bg-stone-100"
          >
            <p className="text-sm uppercase tracking-[0.15em] text-stone-500">
              Nuevo
            </p>
            <h2 className="mt-2 text-xl font-semibold text-stone-900">
              Crear evento
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Crea un nuevo evento con su nombre, slug y configuración inicial.
            </p>
          </Link>

          <Link
            href="/admin"
            className="rounded-3xl border bg-white p-6 shadow-sm transition hover:bg-stone-100"
          >
            <p className="text-sm uppercase tracking-[0.15em] text-stone-500">
              Acceso rápido
            </p>
            <h2 className="mt-2 text-xl font-semibold text-stone-900">
              Ir al panel
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Abre directamente el panel administrativo principal.
            </p>
          </Link>

          <Link
            href="/admin/events"
            className="rounded-3xl border bg-white p-6 shadow-sm transition hover:bg-stone-100"
          >
            <p className="text-sm uppercase tracking-[0.15em] text-stone-500">
              Invitados
            </p>
            <h2 className="mt-2 text-xl font-semibold text-stone-900">
              Ver usuarios
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Entra a un evento y desde allí revisa o elimina invitados
              registrados.
            </p>
          </Link>
        </section>

        <section className="mt-6 rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-stone-900">
            Cómo usar este panel
          </h2>

          <div className="mt-4 space-y-3 text-stone-600">
            <p>1. Entra a “Ver eventos”.</p>
            <p>2. Selecciona el evento que quieres administrar.</p>
            <p>3. Desde allí puedes ver resumen, álbum, QR, invitados y ajustes.</p>
          </div>
        </section>
      </div>
    </main>
  );
}