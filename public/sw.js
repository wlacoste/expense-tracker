// Service worker registration file
// This file will be served from the public directory

const CACHE_NAME = "expense-tracker-v1"
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-144x144.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-192x192-maskable.png",
  "/icons/icon-512x512-maskable.png",
]

// Install event - cache assets
self.addEventListener("install", (event) => {
  // Perform install steps
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache")
        return cache.addAll(urlsToCache)
      })
      .catch((err) => console.error("Cache open failed:", err)),
  )

  // Activate immediately
  self.skipWaiting()
})

// Fetch event - serve from cache, fall back to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response
      }
      return fetch(event.request).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        // Clone the response
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )

  // Claim clients so the service worker is in control immediately
  self.clients.claim()
})
