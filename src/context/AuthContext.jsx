import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { obtenerPerfil, obtenerGym } from '../services/db'
import { useGym } from './ThemeContext'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null) // firebase user
  const [perfil, setPerfil] = useState(null) // doc usuarios/{uid}
  const [cargando, setCargando] = useState(true)
  const { setGym } = useGym()

  useEffect(() => {
    // Safety-net: nunca dejar la app en "cargando" infinito (lección Solucion_Ingreso)
    const tope = setTimeout(() => setCargando(false), 6000)
    const off = onAuthStateChanged(auth, async (u) => {
      setUsuario(u)
      if (u) {
        const p = await obtenerPerfil(u.uid)
        setPerfil(p)
        if (p?.gymId) {
          const gym = await obtenerGym(p.gymId)
          if (gym) setGym(gym)
        }
      } else {
        setPerfil(null)
      }
      clearTimeout(tope)
      setCargando(false)
    })
    return () => {
      off()
      clearTimeout(tope)
    }
  }, [])

  // Popup primero; si el navegador lo bloquea (PWA instalada), redirect (lección Solucion_Ingreso)
  const entrarConGoogle = async () => {
    try {
      return await signInWithPopup(auth, googleProvider)
    } catch (e) {
      if (['auth/popup-blocked', 'auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(e.code)) {
        if (e.code === 'auth/popup-blocked') return signInWithRedirect(auth, googleProvider)
      }
      throw e
    }
  }

  const entrarConCorreo = (correo, clave) => signInWithEmailAndPassword(auth, correo, clave)
  const crearCuentaCorreo = (correo, clave) => createUserWithEmailAndPassword(auth, correo, clave)
  const recuperarClave = (correo) => sendPasswordResetEmail(auth, correo)
  const salir = () => signOut(auth)

  const recargarPerfil = async () => {
    if (!auth.currentUser) return null
    const p = await obtenerPerfil(auth.currentUser.uid)
    setPerfil(p)
    return p
  }

  return (
    <AuthContext.Provider value={{ usuario, perfil, cargando, entrarConGoogle, entrarConCorreo, crearCuentaCorreo, recuperarClave, salir, recargarPerfil }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
