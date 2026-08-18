import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-black">Trove</h1>
          <p className="opacity-70">Save anything, together.</p>
        </div>
        <div className="flex items-center justify-center gap-4 text-sm underline opacity-70">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Use</Link>
        </div>
      </div>
    </main>
  );
}
