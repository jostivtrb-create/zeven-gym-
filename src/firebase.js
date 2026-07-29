import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
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

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
export const storage = getStorage(app)

// Persistencia en localStorage: evita cierres de sesión espontáneos en PWA
// instalada (lección aprendida de TodyPan — skill Solucion_Ingreso).
setPersistence(auth, browserLocalPersistence).catch(() => {})
