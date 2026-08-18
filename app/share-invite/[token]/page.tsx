"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

// Fallback for folder-invite links opened without the app installed or
// backgrounded. Mirrors the "AcceptFolderInvite" route registered at
// share-invite/:token in trove-app/App.tsx's linking config.
export default function ShareInvitePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  useEffect(() => {
    if (!token) return;
    window.location.replace(`trove://share-invite/${encodeURIComponent(token)}`);
  }, [token]);

  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm flex flex-col gap-2">
        <h1 className="text-xl font-bold">Open this invite in Trove</h1>
        <p className="opacity-70">
          Someone shared a Trove folder with you. Open this link on your iPhone with Trove installed to accept it.
        </p>
        <p className="text-sm opacity-50">Don&apos;t have Trove yet? It&apos;s not available yet, check back soon.</p>
      </div>
    </main>
  );
}
