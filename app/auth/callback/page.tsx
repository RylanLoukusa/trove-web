"use client";

import { useEffect } from "react";

// Redirect target for Google/Apple sign-in, email confirmation, and password
// reset (see AUTH_CALLBACK_URL in trove-app/src/auth/authRedirect.ts). Supabase
// appends the session as a query string (?code=...) or hash fragment
// (#access_token=...), neither of which is readable server-side, so this has
// to run client-side: forward whatever Supabase attached straight through to
// the app's custom URL scheme.
export default function AuthCallbackPage() {
  useEffect(() => {
    const appUrl = `trove://auth/callback${window.location.search}${window.location.hash}`;
    window.location.replace(appUrl);
  }, []);

  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm flex flex-col gap-2">
        <h1 className="text-xl font-bold">Continue in Trove</h1>
        <p className="opacity-70">This sign-in link is meant to be opened on your iPhone with Trove installed.</p>
        <p className="text-sm opacity-50">If Trove didn&apos;t open automatically, return to the app and try again.</p>
      </div>
    </main>
  );
}
