// Serves the Apple App Site Association file that lets iOS open trovecollections.app
// links directly in the Trove app (Associated Domains / universal links) instead of
// falling through to this website, when the app is installed.
//
// The previous static version of this file (this repo's old GitHub Pages content)
// only listed /auth/callback and /share-invite/*; /shared/* was added for the
// public-folder-link feature. If you add another deep-linked route in trove-app's
// App.tsx linking config, add its path here too.
//
// Still needed before universal links actually work: add
// "associatedDomains": ["applinks:trovecollections.app"] to the "ios" block in
// trove-app/app.json, then rebuild -- this file alone isn't enough, the app side
// needs the matching entitlement.
const APPLE_APP_SITE_ASSOCIATION = {
  applinks: {
    details: [
      {
        appIDs: ["9YNCQGQ47P.com.rylanloukusa.trove"],
        paths: ["/auth/callback", "/share-invite/*", "/shared/*"],
      },
    ],
  },
};

export const GET = () =>
  Response.json(APPLE_APP_SITE_ASSOCIATION, {
    headers: { "Content-Type": "application/json" },
  });
