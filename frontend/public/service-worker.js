// POISON PILL SERVICE WORKER
// Replaces old PWA SW - immediately unregisters itself and clears all caches.

self.addEventListener("install", function(e) {
  self.skipWaiting();
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    Promise.all([
      caches.keys().then(function(keys) {
        return Promise.all(keys.map(function(k) { return caches.delete(k); }));
      }),
      self.clients.claim()
    ]).then(function() {
      return self.registration.unregister();
    })
  );
});

self.addEventListener("fetch", function(e) {
  e.respondWith(fetch(e.request));
});
