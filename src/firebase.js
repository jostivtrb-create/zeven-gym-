import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyAHO5sEN5vVIVkFDD4Da0vl3wN4Nw6cUTA',
  authDomain: 'zeven-gym.firebaseapp.com',
  projectId: 'zeven-gym',
  storageBucket: 'zeven-gym.firebasestorage.app',
  messagingSenderId: '80592345416',
  appId: '1:80592345416:web:a5ea5c32b229196e507b7d',
}

export const hasFirebaseConfig = true

export const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
/* Caché local: el cliente ve su rutina y su progreso sin internet.
   Sin tab manager múltiple (lección Solucion_Ingreso: causaba bloqueos). */
export const db = initializeFirestore(app, { localCache: persistentLocalCache({}) })
export const storage = getStorage(app)

// Persistencia en localStorage: evita cierres de sesión espontáneos en PWA
// instalada (lección aprendida de TodyPan — skill Solucion_Ingreso).
setPersistence(auth, browserLocalPersistence).catch(() => {})
