import { getMessaging, getToken, deleteToken, isSupported } from 'firebase/messaging'
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { app, db } from '../firebase'

/* Notificaciones push (recordatorio de pago 1 día antes).
   La llave VAPID sale de: Firebase Console → Configuración del proyecto →
   Cloud Messaging → Certificados push web. */
export const VAPID_PUBLICA = 'BEjOe_exR2ea2ulV5ZtkGJcQTetDP6cxkABrV3JqQqlMmY-JSIw6iCRQmteYiKTaYLdV9za1BWwzLrzyZaKafhg'

export const soportaNotificaciones = async () => {
  try {
    return 'Notification' in window && (await isSupported())
  } catch {
    return false
  }
}

export const permisoActual = () => (typeof Notification === 'undefined' ? 'default' : Notification.permission)

/* Pide permiso, obtiene el token del celular y lo guarda en el perfil. */
export async function activarNotificaciones(uid) {
  if (!(await soportaNotificaciones())) return { ok: false, motivo: 'no-soportado' }
  if (VAPID_PUBLICA.includes('PENDIENTE')) return { ok: false, motivo: 'sin-configurar' }

  const permiso = await Notification.requestPermission()
  if (permiso !== 'granted') return { ok: false, motivo: 'denegado' }

  const registro = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
  const token = await getToken(getMessaging(app), { vapidKey: VAPID_PUBLICA, serviceWorkerRegistration: registro })
  if (!token) return { ok: false, motivo: 'sin-token' }

  await setDoc(doc(db, 'usuarios', uid, 'tokens', token), {
    creadoEl: serverTimestamp(),
    dispositivo: navigator.userAgent.slice(0, 120),
  })
  localStorage.setItem('zg-token-push', token)
  return { ok: true, token }
}

export async function desactivarNotificaciones(uid) {
  const token = localStorage.getItem('zg-token-push')
  try {
    if (token) await deleteDoc(doc(db, 'usuarios', uid, 'tokens', token))
    await deleteToken(getMessaging(app)).catch(() => {})
  } finally {
    localStorage.removeItem('zg-token-push')
  }
}

export const notificacionesActivas = () => !!localStorage.getItem('zg-token-push') && permisoActual() === 'granted'
