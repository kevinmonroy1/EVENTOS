"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { uploadGuestPhotosAction } from "@/app/(public)/[slug]/upload/actions";
import { createClient } from "@/lib/supabase/client";

interface SelectedImage {
  id: string;
  file: File;
  previewUrl: string;
}

interface PhotoUploadClientProps {
  slug: string;
  guestId: string;
  maxAllowed: number;
  uploadedCount: number;
  guestName: string;
}

function getFileExtension(filename: string) {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return "";
  return filename.slice(lastDotIndex + 1).toLowerCase();
}

export default function PhotoUploadClient({
  slug,
  guestId,
  maxAllowed,
  uploadedCount,
  guestName,
}: PhotoUploadClientProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const remainingCount = Math.max(maxAllowed - uploadedCount, 0);
  const totalSelected = selectedImages.length;
  const availableToSelect = Math.max(remainingCount - totalSelected, 0);

  const helperText = useMemo(() => {
    if (remainingCount <= 0) {
      return "Ya alcanzaste el máximo de fotos permitido.";
    }

    if (totalSelected === 0) {
      return `Puedes subir hasta ${remainingCount} foto(s) más.`;
    }

    return `Has seleccionado ${totalSelected} foto(s). Aún puedes agregar ${availableToSelect} más.`;
  }, [remainingCount, totalSelected, availableToSelect]);

  function handleOpenPicker() {
    inputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const incomingFiles = Array.from(files);

    const imageFiles = incomingFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    const allowedFiles = imageFiles.slice(0, availableToSelect);

    const mappedFiles: SelectedImage[] = allowedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((prev) => [...prev, ...mappedFiles]);
    setMessage(null);
    event.target.value = "";
  }

  function handleRemoveImage(imageId: string) {
    setSelectedImages((prev) => {
      const imageToRemove = prev.find((image) => image.id === imageId);

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }

      return prev.filter((image) => image.id !== imageId);
    });
  }

  async function uploadSingleFile(
    supabase: any,
    file: File
  ): Promise<{
    name: string;
    type: string;
    size: number;
    storagePath: string;
    publicUrl: string;
  }> {
    const extension = getFileExtension(file.name);
    const safeExtension = extension ? `.${extension}` : "";
    const fileName = `${crypto.randomUUID()}${safeExtension}`;

    const storagePath = `${slug}/${guestId}/${fileName}`;

    const { error } = await supabase.storage
      .from("event-photos")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(
        `Error subiendo "${file.name}": ${error.message}`
      );
    }

    const { data } = supabase.storage
      .from("event-photos")
      .getPublicUrl(storagePath);

    if (!data?.publicUrl) {
      throw new Error("No se pudo obtener publicUrl.");
    }

    return {
      name: file.name,
      type: file.type,
      size: file.size,
      storagePath,
      publicUrl: data.publicUrl,
    };
  }

  function handleSubmit() {
    if (selectedImages.length === 0) return;

    setMessage(null);

    startTransition(async () => {
      const supabase = createClient();

      try {
        const filesData = [];

        // 🔥 SUBIDA SECUENCIAL (más estable en móvil)
        for (const image of selectedImages) {
          const result = await uploadSingleFile(
            supabase,
            image.file
          );
          filesData.push(result);
        }

        // 🔥 registrar en backend
        await uploadGuestPhotosAction(slug, guestId, filesData);

        // limpiar previews
        selectedImages.forEach((image) => {
          URL.revokeObjectURL(image.previewUrl);
        });

        setSelectedImages([]);

        setMessage(
          `${guestName}, se subieron ${filesData.length} foto(s) correctamente.`
        );

      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error al subir fotos.";

        setMessage(errorMessage);
      }
    });
  }

  return (
    <div className="space-y-5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="rounded-2xl border border-dashed bg-stone-50 p-5">
        <p className="text-sm font-medium text-stone-800">
          Selección de fotografías
        </p>

        <p className="mt-2 text-sm text-stone-600">{helperText}</p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleOpenPicker}
            disabled={remainingCount <= 0 || availableToSelect <= 0 || isPending}
            className="rounded-2xl bg-stone-900 px-4 py-3 text-white disabled:opacity-50"
          >
            Elegir fotos
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedImages.length === 0 || isPending}
            className="rounded-2xl border px-4 py-3 text-stone-800 disabled:opacity-50"
          >
            {isPending ? "Subiendo..." : "Subir fotos"}
          </button>
        </div>

        {message && (
          <p className="mt-4 rounded-xl bg-stone-100 px-3 py-2 text-sm">
            {message}
          </p>
        )}
      </div>

      {selectedImages.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {selectedImages.map((image) => (
            <div key={image.id} className="rounded-2xl border overflow-hidden">
              <img
                src={image.previewUrl}
                className="h-32 w-full object-cover"
              />

              <div className="p-2">
                <button
                  onClick={() => handleRemoveImage(image.id)}
                  className="w-full text-sm border rounded-xl py-1"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}