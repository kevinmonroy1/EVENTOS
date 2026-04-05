export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <main className="mx-auto min-h-screen w-full max-w-md px-4 py-6">
        {children}
      </main>
    </div>
  );
}
