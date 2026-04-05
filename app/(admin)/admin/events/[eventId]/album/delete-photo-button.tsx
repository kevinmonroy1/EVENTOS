"use client";

interface DeletePhotoButtonProps {
  className?: string;
}

export default function DeletePhotoButton({
  className = "text-xs text-red-600",
}: DeletePhotoButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        const confirmed = window.confirm(
          "¿Seguro que deseas eliminar esta foto? Esta acción no se puede deshacer."
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      Eliminar
    </button>
  );
}