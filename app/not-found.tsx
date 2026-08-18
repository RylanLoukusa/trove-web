export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm flex flex-col gap-2">
        <h1 className="text-xl font-bold">Page not found</h1>
        <p className="opacity-70">The page you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    </main>
  );
}
