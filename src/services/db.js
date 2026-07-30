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

export const CORREO_SUPERADMIN = 'jostivtrb@gmail.com'

/* Bootstrap de perfiles al login:
   - el correo dueño de la plataforma → superadmin (y se AUTO-REPARA si quedó
     guardado con otro rol, p. ej. si entró por la pantalla de registro)
   - un correo pre-invitado en adminsPendientes → admin de su gym */
export async function bootstrapPerfil(user, perfilExistente = null) {
  const correo = user.email ?? ''
  if (correo === CORREO_SUPERADMIN) {
    if (perfilExistente?.rol === 'superadmin') return perfilExistente
    await setDoc(doc(db, 'usuarios', user.uid), {
      rol: 'superadmin',
      gymId: null,
      nombre: user.displayName ?? 'Superadmin',
      correo,
      estado: 'activo',
      creadoEl: perfilExistente?.creadoEl ?? serverTimestamp(),
    })
    return obtenerPerfil(user.uid)
  }
  if (perfilExistente) return perfilExistente
  try {
    const inv = await getDoc(doc(db, 'adminsPendientes', correo))
    if (inv.exists()) {
      await setDoc(doc(db, 'usuarios', user.uid), {
        rol: 'admin',
        gymId: inv.data().gymId,
        nombre: inv.data().nombre ?? user.displayName ?? '',
        celular: inv.data().celular ?? '',
        correo,
        estado: 'activo',
        creadoEl: serverTimestamp(),
      })
      return obtenerPerfil(user.uid)
    }
  } catch (e) {
    console.warn('bootstrapPerfil:', e.code ?? e.message)
  }
  return null
}

export async function crearGimnasio({ nombre, ciudad, color, admin }) {
  const base = nombre.replace(/[^a-zA-Z]/g, '').slice(0, 6).toUpperCase() || 'GYM'
  const codigo = `${base}${Math.floor(10 + Math.random() * 90)}`
  const ref = doc(collection(db, 'gimnasios'))
  await setDoc(ref, {
    nombre,
    ciudad,
    codigo,
    branding: { color, logoUrl: null, bannerUrl: null },
    contacto: { celular: admin.celular ?? '', instagram: '', direccion: '' },
    horarios: [],
    politicas: { vigencia: 'desde_pago', permitirCongelar: true, bloquearAlVencer: false },
    suscripcion: { estado: 'prueba', inicioPrueba: serverTimestamp(), proximoCorte: null, ultimoPagoEl: null },
    adminUid: null,
    adminCorreo: admin.correo,
    creadoEl: serverTimestamp(),
  })
  await setDoc(doc(db, 'adminsPendientes', admin.correo), {
    gymId: ref.id,
    nombre: admin.nombre,
    celular: admin.celular ?? '',
  })
  return { id: ref.id, codigo }
}
