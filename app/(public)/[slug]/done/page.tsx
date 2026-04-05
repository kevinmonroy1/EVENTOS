import AnimatedWrapper from "@/components/ui/AnimatedWrapper";

export default function DonePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <AnimatedWrapper>
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-3xl font-semibold text-emerald-700">
            Gracias por compartir 💚
          </h1>

          <p className="text-stone-600">
            Tus recuerdos ahora forman parte de este momento especial.
          </p>

          <div className="text-sm text-stone-400">
            Puedes cerrar esta página
          </div>
        </div>
      </AnimatedWrapper>
    </div>
  );
}