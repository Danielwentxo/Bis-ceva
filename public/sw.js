const VERSION = "2";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// A fetch listener is required for Android install. Do not intercept:
// cross-origin images (flags, posters) break if the worker fetches them.
self.addEventListener("fetch", () => {
  void VERSION;
});
