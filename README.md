# trove-web

Everything served at `trovecollections.app` for [Trove](https://github.com/RylanLoukusa/trove-app) (the "save anything, together" mobile app): the legal pages, and the web-side handlers for links the app opens outside itself.

> This repo used to be `trove-app-legal`, a static GitHub Pages site with just `privacy.html`/`terms.html`. It's being renamed to `trove-web` since it now also handles auth redirects, invite fallbacks, and the public folder viewer — all of which need a real server (dynamic per-request metadata, not just static files).

## Routes

| Route | Purpose |
| --- | --- |
| `/privacy`, `/terms` | Legal pages. |
| `/shared/[token]` | Read-only viewer for a folder shared via Trove's public-link feature. Fetches from the `get-public-folder` Supabase edge function (same one the mobile app calls) and server-renders it, with dynamic OG tags for link unfurling and an "Open in Trove" link back to the app. |
| `/auth/callback` | Redirect target for Google/Apple sign-in, email confirmation, and password reset (`AUTH_CALLBACK_URL` in `trove-app/src/auth/authRedirect.ts`). Forwards whatever Supabase attaches (`?code=...` or `#access_token=...`) to `trove://auth/callback`. |
| `/share-invite/[token]` | Fallback for folder-invite links opened without the app installed/foregrounded. Redirects to `trove://share-invite/:token`, matching the `AcceptFolderInvite` route in `trove-app/App.tsx`'s linking config. |
| `/.well-known/apple-app-site-association` | Lets iOS open the routes above directly in the Trove app (Associated Domains / universal links) instead of this site, when the app is installed. |

## Local development

```bash
npm install
npm run dev
```

Requires a `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=<same value as trove-app's EXPO_PUBLIC_SUPABASE_URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<same value as trove-app's EXPO_PUBLIC_SUPABASE_ANON_KEY>
```

Both are safe to expose client-side — the anon key has no special privileges for the `/shared/[token]` feature; `get-public-folder` validates the link token itself server-side using the service-role key, which never appears in this repo.

## Deployment (Cloudflare)

Deployed as a Cloudflare Worker via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare):

```bash
npm run preview   # build + run locally against the Workers runtime (wrangler)
npm run deploy    # build + deploy
```

Set the same two env vars as secrets/vars on the Worker (`wrangler.jsonc` or the Cloudflare dashboard), and point `trovecollections.app` at it as a custom domain in the Cloudflare dashboard.

**Before the domain can move here:** the custom domain currently needs to be removed from this repo's old GitHub Pages settings first (GitHub won't let it be attached to Pages and a Worker at the same time) — see [Managing a custom domain for your GitHub Pages site](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Apple App Site Association

The Team ID and bundle ID in `app/.well-known/apple-app-site-association/route.ts` are real (`9YNCQGQ47P` / `com.rylanloukusa.trove`), carried over from this repo's previous static AASA file. Universal links still won't actually work until `trove-app/app.json` has `"associatedDomains": ["applinks:trovecollections.app"]` added under `ios`, and the app is rebuilt with that entitlement (see the TODO comment in the route file).
