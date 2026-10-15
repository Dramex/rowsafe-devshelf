/**
 * DevShelf Lightweight Service Worker
 * Enables offline caching and PWA standalone install.
 */

const CACHE_NAME = "devshelf-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/directory.html",
  "/style.css",
  "/tailwind.min.css",
  "/favicon.svg",
  "/favicon.ico",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        // Continue even if some optional assets fail on fresh install
      });
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Network first, falling back to cache
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.headers.get("accept")?.includes("text/html")) {
          return caches.match("/index.html");
        }
      }),
  );
});
