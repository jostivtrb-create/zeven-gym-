import { collection, doc, getDoc, getDocs, query, where, limit, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { getCountFromServer } from 'firebase/firestore'
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

const DIA_MS = 86400000
const aFecha = (t) => (t?.toDate ? t.toDate() : t ? new Date(t) : null)

/* Deriva el estado visible de la suscripción de un gym a partir de sus fechas:
   prueba (30 días) → gracia (7 días tras vencer) → suspendido. */
export function derivarSuscripcion(gym) {
  const s = gym.suscripcion ?? {}
  const hoy = new Date()
  if (s.estado === 'suspendido') return { estado: 'suspendido' }
  if (s.estado === 'prueba') {
    const inicio = aFecha(s.inicioPrueba) ?? hoy
    const restantes = 30 - Math.floor((hoy - inicio) / DIA_MS)
    if (restantes > 0) return { estado: 'prueba', diasPrueba: restantes }
    const graciaRestante = 7 + restantes // días de gracia tras acabar la prueba
    return graciaRestante > 0 ? { estado: 'gracia', diasGracia: graciaRestante } : { estado: 'suspendido' }
  }
  const corte = aFecha(s.proximoCorte)
  if (corte && corte < hoy) {
    const atraso = Math.floor((hoy - corte) / DIA_MS)
    return atraso <= 7 ? { estado: 'gracia', diasGracia: 7 - atraso } : { estado: 'suspendido' }
  }
  return { estado: 'activo' }
}

export async function listarGimnasios() {
  const snap = await getDocs(collection(db, 'gimnasios'))
  return Promise.all(
    snap.docs.map(async (d) => {
      const gym = { id: d.id, ...d.data() }
      let clientes = 0
      try {
        const c = await getCountFromServer(query(collection(db, 'usuarios'), where('gymId', '==', d.id)))
        clientes = c.data().count
      } catch { /* sin permiso de conteo aún: se muestra 0 */ }
      return { ...gym, ...derivarSuscripcion(gym), clientes }
    })
  )
}

export async function actualizarSuscripcionGym(gymId, suscripcion) {
  await updateDoc(doc(db, 'gimnasios', gymId), { suscripcion })
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
