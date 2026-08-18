import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Use — Trove" };

export default function TermsPage() {
  return (
    <main className="flex-1 max-w-3xl w-full mx-auto p-6 sm:p-10">
      <h1 className="text-3xl font-black mb-1">Terms of Use</h1>
      <p className="opacity-70 mb-6">
        <strong>Effective date:</strong> June 9, 2026
      </p>

      <p className="mb-4">By using Trove, you agree to these Terms of Use.</p>

      <h2 className="text-xl font-bold mt-6 mb-2">Your Content</h2>
      <p className="mb-4">
        You are responsible for the folders, items, notes, links, lists, and media you save in the app. You retain
        ownership of your content.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">Acceptable Use</h2>
      <p className="mb-4">You agree not to use the app to store or share unlawful, harmful, or infringing content.</p>

      <h2 className="text-xl font-bold mt-6 mb-2">Account Deletion</h2>
      <p className="mb-4">
        You may delete your account in Settings. Account deletion removes your account, synced Trove data, and
        uploaded media.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">Service Availability</h2>
      <p className="mb-4">
        The app is provided as-is. We may change, suspend, or discontinue parts of the service at any time.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">Limitation of Liability</h2>
      <p className="mb-4">
        To the fullest extent permitted by law, we are not liable for indirect, incidental, or consequential damages
        arising from use of the app.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">Contact</h2>
      <p>If you have questions, contact us at: rylanloukusa@gmail.com</p>
    </main>
  );
}
