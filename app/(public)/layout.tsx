export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <main className="mx-auto min-h-screen w-full max-w-md px-4 py-8">
        {children}
      </main>
    </div>
  );
}