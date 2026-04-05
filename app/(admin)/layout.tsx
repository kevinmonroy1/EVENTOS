export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}