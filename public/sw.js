/* Service worker de Zeven Gym.
   SIN skipWaiting/clientsClaim (lección Solucion_Ingreso: evita bucles de sesión en PWA).
   Estrategia: red primero con caché de respaldo → la rutina y la app quedan
   disponibles sin internet (definido en Etapa 10). */

const CACHE = 'zeven-gym-v1'
const APP_SHELL = ['/', '/iconos/icono-192.png', '/iconos/icono-512.png']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET') return
  // Nunca interceptar Firebase/Google: los datos los cachea el propio Firestore
  if (url.origin !== location.origin) return
  // El manifest es dinámico por gimnasio: siempre en vivo
  if (url.pathname.startsWith('/api/')) return

  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copia = resp.clone()
        caches.open(CACHE).then((c) => c.put(e.request, copia))
        return resp
      })
      .catch(() =>
        caches.match(e.request).then((enCache) => enCache ?? (e.request.mode === 'navigate' ? caches.match('/') : undefined))
      )
  )
})
