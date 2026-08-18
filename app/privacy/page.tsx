import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy — Trove" };

export default function PrivacyPage() {
  return (
    <main className="flex-1 max-w-3xl w-full mx-auto p-6 sm:p-10">
      <h1 className="text-3xl font-black mb-1">Privacy Policy</h1>
      <p className="opacity-70 mb-6">
        <strong>Effective date:</strong> June 9, 2026
      </p>

      <p className="mb-4">
        Trove helps you save folders, items, notes, lists, links, and media so you can revisit them later.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">Information We Collect</h2>
      <p className="mb-2">
        When you create an account, we collect your email address and authentication provider information. If you
        use Google or Apple sign-in, we receive basic account information provided by that service.
      </p>
      <p className="mb-4">We store the folders, items, notes, lists, links, and media you choose to save in the app.</p>

      <h2 className="text-xl font-bold mt-6 mb-2">How We Use Information</h2>
      <p className="mb-4">
        We use your information to provide account access, sync your Trove data across devices, store uploaded
        media, and operate the app.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">Third-Party Services</h2>
      <p className="mb-4">
        Trove uses Supabase for authentication, database storage, and media storage. The app may also use Google
        Sign-In and Sign in with Apple for authentication. When you share a folder with someone by email, we use
        Resend to deliver the invite email. If you share a folder with another Trove user, that person can see your
        display name and email as the folder owner or collaborator.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">Account Deletion</h2>
      <p className="mb-4">
        You can delete your account in the app from Settings. Deleting your account removes your account, synced
        Trove data, and uploaded media.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">Contact</h2>
      <p>If you have questions, contact us at: rylanloukusa@gmail.com</p>
    </main>
  );
}
