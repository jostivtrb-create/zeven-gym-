/* Service worker de notificaciones de Zeven Gym.
   Recibe los recordatorios cuando la app está cerrada o en segundo plano. */

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyAHO5sEN5vVIVkFDD4Da0vl3wN4Nw6cUTA',
  authDomain: 'zeven-gym.firebaseapp.com',
  projectId: 'zeven-gym',
  storageBucket: 'zeven-gym.firebasestorage.app',
  messagingSenderId: '80592345416',
  appId: '1:80592345416:web:a5ea5c32b229196e507b7d',
})

firebase.messaging().onBackgroundMessage((payload) => {
  const { title, body } = payload.notification ?? {}
  self.registration.showNotification(title ?? 'Zeven Gym', {
    body: body ?? '',
    icon: payload.notification?.icon ?? '/iconos/icono-192.png',
    badge: '/iconos/icono-192.png',
    data: { url: payload.fcmOptions?.link ?? '/app/perfil' },
  })
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const destino = e.notification.data?.url ?? '/app/perfil'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((lista) => {
      const abierta = lista.find((c) => c.url.includes(location.origin))
      if (abierta) return abierta.focus()
      return clients.openWindow(destino)
    })
  )
})
