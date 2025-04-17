// Enhanced Service Worker for full offline functionality
const CACHE_NAME = "expense-tracker-v2"
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-144x144.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-192x192-maskable.png",
  "/icons/icon-512x512-maskable.png",
  "/icons/apple-touch-icon.png",
  "/icons/favicon.ico",
]

// Install event - cache the app shell
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing Service Worker...")
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching App Shell")
      return cache.addAll(APP_SHELL)
    }),
  )
  // Activate immediately
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating Service Worker...")
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", key)
            return caches.delete(key)
          }
        }),
      )
    }),
  )
  // Claim clients so the service worker is in control immediately
  return self.clients.claim()
})

// Fetch event with network-first strategy for dynamic content, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // For navigation requests (HTML), use network-first strategy
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the latest version
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
          return response
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request).then((response) => {
            if (response) {
              return response
            }
            // If not in cache, serve the offline page
            return caches.match("/")
          })
        }),
    )
    return
  }

  // For static assets, use cache-first strategy
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".json")
  ) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response
        }

        // If not in cache, fetch from network and cache
        return fetch(event.request).then((networkResponse) => {
          const responseClone = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
          return networkResponse
        })
      }),
    )
    return
  }

  // For API requests or other dynamic content, use network-first
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response
      })
      .catch(() => {
        return caches.match(event.request)
      }),
  )
})

// Handle offline data synchronization when coming back online
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    console.log("[Service Worker] Syncing data")
    // Here you would implement logic to sync data with a server
    // For this local app, we don't need server sync
  }
})

// Listen for messages from the client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
