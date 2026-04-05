"use client";

import Image from "next/image";
import { useState } from "react";

interface PhotoPreviewModalProps {
  imageUrl: string | null;
  filename?: string | null;
  guestName?: string | null;
  uploadedAt?: string | null;
}

export default function PhotoPreviewModal({
  imageUrl,
  filename,
  guestName,
  uploadedAt,
}: PhotoPreviewModalProps) {
  const [open, setOpen] = useState(false);

  if (!imageUrl) {
    return (
      <div className="flex h-40 w-full items-center justify-center text-xs text-stone-500">
        Sin imagen
      </div>
    );
  }

  return (
    <>
      <div
        className="relative h-40 w-full cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Image
          src={imageUrl}
          alt={filename || "Foto"}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-[500px] w-full bg-black">
              <Image
                src={imageUrl}
                alt={filename || "Foto"}
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            <div className="space-y-2 p-4 text-sm">
              <p className="font-semibold">
                {filename || "Sin nombre"}
              </p>

              <p className="text-stone-600">
                Invitado: {guestName || "Sin nombre"}
              </p>

              <p className="text-stone-500">
                {uploadedAt
                  ? new Intl.DateTimeFormat("es-GT", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(uploadedAt))
                  : "Sin fecha"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-sm shadow"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}