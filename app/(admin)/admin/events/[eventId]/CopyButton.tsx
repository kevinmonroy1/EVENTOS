"use client";

export default function CopyButton({ text }: { text: string }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Link copiado");
    } catch (error) {
      alert("Error al copiar");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="rounded-xl border px-4 py-2"
    >
      Copiar link
    </button>
  );
}