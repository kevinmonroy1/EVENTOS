import { createEventAction } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Crear nuevo evento</CardTitle>
        </CardHeader>

        <CardContent>
          <form action={createEventAction} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre del evento
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Recuerdos de Jaqueline y Allan"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="coupleNames" className="text-sm font-medium">
                Nombres de la pareja
              </label>
              <input
                id="coupleNames"
                name="coupleNames"
                type="text"
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Jaqueline y Allan"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">
                URL pública
              </label>
              <input
                id="slug"
                name="slug"
                type="text"
                className="w-full rounded-lg border px-3 py-2"
                placeholder="jaqueline-y-allan"
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Estado
                </label>
                <select
                  id="status"
                  name="status"
                  className="w-full rounded-lg border px-3 py-2"
                  defaultValue="draft"
                >
                  <option value="draft">Borrador</option>
                  <option value="active">Activo</option>
                  <option value="closed">Cerrado</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="templateStyle" className="text-sm font-medium">
                  Plantilla visual
                </label>
                <select
                  id="templateStyle"
                  name="templateStyle"
                  className="w-full rounded-lg border px-3 py-2"
                  defaultValue="romantic-light"
                >
                  <option value="romantic-light">Romántica clara</option>
                  <option value="romantic-warm">Romántica cálida</option>
                  <option value="romantic-premium">Romántica premium</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="maxPhotosPerGuest"
                className="text-sm font-medium"
              >
                Máximo de fotos por invitado
              </label>
              <input
                id="maxPhotosPerGuest"
                name="maxPhotosPerGuest"
                type="number"
                min={1}
                max={20}
                defaultValue={7}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="sharedGalleryEnabled"
                className="text-sm font-medium"
              >
                Recuerdos compartidos
              </label>
              <select
                id="sharedGalleryEnabled"
                name="sharedGalleryEnabled"
                className="w-full rounded-lg border px-3 py-2"
                defaultValue="true"
              >
                <option value="true">Activado</option>
                <option value="false">Desactivado</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-black px-4 py-3 text-white"
            >
              Crear evento
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}