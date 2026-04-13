import JSZip from "jszip";
import { getUploadedPhotosByEvent } from "@/server/repositories/photos.repository";

interface RouteContext {
  params: Promise<{ eventId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { eventId } = await context.params;

  const photos = await getUploadedPhotosByEvent(eventId);

  if (!photos || photos.length === 0) {
    return Response.json(
      { error: "No hay fotos para descargar." },
      { status: 404 }
    );
  }

  const zip = new JSZip();

  for (const photo of photos) {
    try {
      const response = await fetch(photo.public_url);

      if (!response.ok) {
        continue;
      }

      const fileBuffer = await response.arrayBuffer();
      const safeName =
        photo.original_filename?.trim() || `foto-${photo.id}.jpg`;

      zip.file(safeName, fileBuffer);
    } catch (error) {
      console.error(`Error descargando foto ${photo.id}:`, error);
    }
  }

  const zipArrayBuffer = await zip.generateAsync({ type: "arraybuffer" });

  const zipBlob = new Blob([zipArrayBuffer], {
    type: "application/zip",
  });

  return new Response(zipBlob, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="album-evento.zip"',
      "Cache-Control": "no-store",
    },
  });
}