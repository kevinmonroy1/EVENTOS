"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface GalleryPhoto {
  id: string;
  public_url: string;
  original_filename: string;
}

interface SharedGalleryModalProps {
  photos: GalleryPhoto[];
}

export default function SharedGalleryModal({
  photos,
}: SharedGalleryModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const selectedPhoto = useMemo(() => {
    if (selectedIndex === null) return null;
    return photos[selectedIndex] ?? null;
  }, [photos, selectedIndex]);

  function openModal(index: number) {
    setSelectedIndex(index);
    setZoomed(false);
  }

  function closeModal() {
    setSelectedIndex(null);
    setZoomed(false);
  }

  function showPrev() {
    if (selectedIndex === null || photos.length === 0) return;
    setZoomed(false);
    setSelectedIndex((prev) => {
      if (prev === null) return null;
      return prev === 0 ? photos.length - 1 : prev - 1;
    });
  }

  function showNext() {
    if (selectedIndex === null || photos.length === 0) return;
    setZoomed(false);
    setSelectedIndex((prev) => {
      if (prev === null) return null;
      return prev === photos.length - 1 ? 0 : prev + 1;
    });
  }

  function toggleZoom() {
    setZoomed((prev) => !prev);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    touchEndXRef.current = event.changedTouches[0]?.clientX ?? null;

    if (
      touchStartXRef.current === null ||
      touchEndXRef.current === null ||
      zoomed
    ) {
      return;
    }

    const deltaX = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 50;

    if (deltaX > minSwipeDistance) {
      showNext();
    } else if (deltaX < -minSwipeDistance) {
      showPrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (selectedIndex === null) return;

      if (event.key === "Escape") {
        closeModal();
      }

      if (event.key === "ArrowLeft") {
        showPrev();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, photos.length]);

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => openModal(index)}
            className="wedding-photo-frame group text-left"
          >
            <div className="relative h-40 w-full overflow-hidden rounded-[inherit]">
              <Image
                src={photo.public_url}
                alt={photo.original_filename}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedPhoto && selectedIndex !== null ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Cerrar"
              onClick={closeModal}
              className="absolute inset-0 cursor-default"
            />

            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative z-10 w-full max-w-5xl"
            >
              <div className="overflow-hidden rounded-[30px] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white sm:px-6">
                  <div>
                    <p className="text-sm font-medium">
                      Recuerdo {selectedIndex + 1} de {photos.length}
                    </p>
                    <p className="mt-1 text-xs text-white/70">
                      {zoomed
                        ? "Toca la imagen para volver al tamaño normal"
                        : "Desliza para cambiar de foto o toca para acercar"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm transition hover:bg-white/20"
                  >
                    Cerrar
                  </button>
                </div>

                <div
                  className="relative flex items-center justify-center overflow-hidden bg-black/20"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  {!zoomed && (
                    <button
                      type="button"
                      onClick={showPrev}
                      className="absolute left-3 z-20 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-lg text-white transition hover:bg-white/20 sm:left-5"
                    >
                      ‹
                    </button>
                  )}

                  <div className="relative h-[60vh] w-full overflow-auto sm:h-[72vh]">
                    <button
                      type="button"
                      onClick={toggleZoom}
                      className="relative block h-full w-full cursor-zoom-in"
                    >
                      <motion.div
                        key={selectedPhoto.id}
                        initial={{ opacity: 0.92, scale: 0.98 }}
                        animate={{
                          opacity: 1,
                          scale: zoomed ? 1.8 : 1,
                        }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className={`relative h-full w-full ${
                          zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                        }`}
                      >
                        <Image
                          src={selectedPhoto.public_url}
                          alt={selectedPhoto.original_filename}
                          fill
                          className="object-contain select-none"
                          unoptimized
                          draggable={false}
                        />
                      </motion.div>
                    </button>
                  </div>

                  {!zoomed && (
                    <button
                      type="button"
                      onClick={showNext}
                      className="absolute right-3 z-20 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-lg text-white transition hover:bg-white/20 sm:right-5"
                    >
                      ›
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-4 text-white sm:px-6">
                  <p className="line-clamp-1 text-sm text-white/85">
                    {selectedPhoto.original_filename}
                  </p>

                  <button
                    type="button"
                    onClick={toggleZoom}
                    className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs transition hover:bg-white/20"
                  >
                    {zoomed ? "Reducir" : "Acercar"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}