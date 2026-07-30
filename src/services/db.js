import { collection, doc, getDoc, getDocs, query, where, limit, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { demoGym } from '../data/demo'

/* Capa de datos de Zeven Gym.
   Si Firestore aún no tiene datos (o falla), cae a los datos demo para que
   la app siempre se pueda mostrar. Los escritos SÍ van a Firestore real. */

export async function buscarGymPorCodigo(codigo) {
  try {
    const q = query(collection(db, 'gimnasios'), where('codigo', '==', codigo.toUpperCase()), limit(1))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const d = snap.docs[0]
      return { id: d.id, ...d.data() }
    }
  } catch (e) {
    console.warn('buscarGymPorCodigo fallback demo:', e.code ?? e.message)
  }
  // Fallback demo mientras no hay datos reales
  return codigo.toUpperCase() === demoGym.codigo ? demoGym : null
}

export async function obtenerGym(gymId) {
  try {
    const snap = await getDoc(doc(db, 'gimnasios', gymId))
    if (snap.exists()) return { id: snap.id, ...snap.data() }
  } catch (e) {
    console.warn('obtenerGym fallback demo:', e.code ?? e.message)
  }
  return demoGym
}

export async function obtenerPerfil(uid) {
  try {
    const snap = await getDoc(doc(db, 'usuarios', uid))
    if (snap.exists()) return { uid, ...snap.data() }
  } catch (e) {
    console.warn('obtenerPerfil:', e.code ?? e.message)
  }
  return null
}

export async function crearPerfilCliente(uid, { gymId, nombre, celular, documento, nacimiento, correo }) {
  await setDoc(doc(db, 'usuarios', uid), {
    rol: 'cliente',
    gymId,
    nombre,
    celular,
    documento,
    nacimiento,
    correo,
    fotoUrl: null,
    estado: 'activo',
    creadoEl: serverTimestamp(),
  })
}

export const rutaPorRol = (perfil) => (perfil?.rol === 'superadmin' ? '/super' : perfil?.rol === 'admin' ? '/admin' : '/app')
