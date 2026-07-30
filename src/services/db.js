import { collection, doc, getDoc, getDocs, query, where, limit, orderBy, setDoc, updateDoc, deleteDoc, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { getCountFromServer } from 'firebase/firestore'
import { db } from '../firebase'

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
    console.warn('buscarGymPorCodigo:', e.code ?? e.message)
  }
  return null
}

export async function obtenerGym(gymId) {
  try {
    const snap = await getDoc(doc(db, 'gimnasios', gymId))
    if (snap.exists()) return { id: snap.id, ...snap.data() }
  } catch (e) {
    console.warn('obtenerGym:', e.code ?? e.message)
  }
  return null
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

/* ============ PLANES ============ */
export async function listarPlanes(gymId) {
  const snap = await getDocs(collection(db, 'gimnasios', gymId, 'planes'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => b.duracionDias - a.duracionDias)
}
export async function guardarPlan(gymId, plan) {
  if (plan.id) {
    const { id, ...datos } = plan
    await updateDoc(doc(db, 'gimnasios', gymId, 'planes', id), datos)
    return id
  }
  const ref = await addDoc(collection(db, 'gimnasios', gymId, 'planes'), { ...plan, activo: true, creadoEl: serverTimestamp() })
  return ref.id
}

/* ============ CLIENTES + MEMBRESÍAS ============ */
export function estadoCliente(usuario, membresia) {
  if (usuario.estado === 'desactivado') return 'desactivado'
  if (!membresia) return 'sin_plan'
  if (membresia.estado === 'congelada') return 'congelado'
  const vence = membresia.vence?.toDate ? membresia.vence.toDate() : null
  if (!vence) return 'sin_plan'
  const hoy = new Date(new Date().toDateString())
  const dias = Math.round((vence - hoy) / DIA_MS)
  if (dias < 0) return 'vencido'
  if (dias <= 3) return 'por_vencer'
  return 'activo'
}

export async function listarClientes(gymId) {
  const [usuariosSnap, membresiasSnap] = await Promise.all([
    getDocs(query(collection(db, 'usuarios'), where('gymId', '==', gymId), where('rol', '==', 'cliente'))),
    getDocs(collection(db, 'gimnasios', gymId, 'membresias')),
  ])
  const membresias = Object.fromEntries(membresiasSnap.docs.map((d) => [d.id, d.data()]))
  return usuariosSnap.docs.map((d) => {
    const u = { uid: d.id, ...d.data() }
    const m = membresias[d.id] ?? null
    return { ...u, membresia: m, estadoDerivado: estadoCliente(u, m) }
  })
}

export async function obtenerCliente(gymId, uid) {
  const [uSnap, mSnap] = await Promise.all([
    getDoc(doc(db, 'usuarios', uid)),
    getDoc(doc(db, 'gimnasios', gymId, 'membresias', uid)),
  ])
  if (!uSnap.exists()) return null
  const u = { uid, ...uSnap.data() }
  const m = mSnap.exists() ? mSnap.data() : null
  return { ...u, membresia: m, estadoDerivado: estadoCliente(u, m) }
}

/* Registra un pago y renueva la vigencia según la política del gym. */
export async function registrarPago(gym, uid, plan, registradoPor) {
  const mRef = doc(db, 'gimnasios', gym.id, 'membresias', uid)
  const mSnap = await getDoc(mRef)
  const hoy = new Date()
  let base = hoy
  if (mSnap.exists()) {
    const vence = mSnap.data().vence?.toDate?.()
    if (vence && vence > hoy) base = vence
  }
  let nuevoVence
  if (gym.politicas?.vigencia === 'corte_fijo' && gym.politicas?.diaCorte) {
    const corte = new Date(hoy.getFullYear(), hoy.getMonth() + 1, gym.politicas.diaCorte)
    nuevoVence = corte
  } else {
    nuevoVence = new Date(base.getTime() + plan.duracionDias * DIA_MS)
  }
  await setDoc(mRef, {
    planId: plan.id,
    planNombre: plan.nombre,
    precio: plan.precio,
    duracionDias: plan.duracionDias,
    estado: 'activa',
    inicio: mSnap.exists() ? mSnap.data().inicio : Timestamp.now(),
    vence: Timestamp.fromDate(nuevoVence),
  })
  await addDoc(collection(db, 'gimnasios', gym.id, 'pagos'), {
    uid,
    planId: plan.id,
    planNombre: plan.nombre,
    monto: plan.precio,
    metodo: 'manual',
    fecha: Timestamp.now(),
    registradoPor: registradoPor ?? null,
  })
  return nuevoVence
}

export async function congelarMembresia(gymId, uid, congelar) {
  const mRef = doc(db, 'gimnasios', gymId, 'membresias', uid)
  const mSnap = await getDoc(mRef)
  if (!mSnap.exists()) return
  const m = mSnap.data()
  if (congelar) {
    const vence = m.vence?.toDate?.() ?? new Date()
    const restantes = Math.max(0, Math.round((vence - new Date()) / DIA_MS))
    await updateDoc(mRef, { estado: 'congelada', congeladaEl: Timestamp.now(), diasRestantes: restantes })
  } else {
    const nuevoVence = new Date(Date.now() + (m.diasRestantes ?? 0) * DIA_MS)
    await updateDoc(mRef, { estado: 'activa', congeladaEl: null, diasRestantes: null, vence: Timestamp.fromDate(nuevoVence) })
  }
}

export async function actualizarUsuario(uid, campos) {
  await updateDoc(doc(db, 'usuarios', uid), campos)
}
export async function eliminarCliente(gymId, uid) {
  await deleteDoc(doc(db, 'gimnasios', gymId, 'membresias', uid)).catch(() => {})
  await deleteDoc(doc(db, 'usuarios', uid))
}

/* ============ PAGOS ============ */
export async function listarPagosGym(gymId) {
  const snap = await getDocs(query(collection(db, 'gimnasios', gymId, 'pagos'), orderBy('fecha', 'desc'), limit(200)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
export async function listarPagosCliente(gymId, uid) {
  const snap = await getDocs(query(collection(db, 'gimnasios', gymId, 'pagos'), where('uid', '==', uid)))
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.fecha?.seconds ?? 0) - (a.fecha?.seconds ?? 0))
}

/* ============ COMUNICADOS ============ */
export async function listarComunicados(gymId) {
  const snap = await getDocs(query(collection(db, 'gimnasios', gymId, 'comunicados'), orderBy('creadoEl', 'desc'), limit(20)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
export async function crearComunicado(gymId, { titulo, texto }) {
  await addDoc(collection(db, 'gimnasios', gymId, 'comunicados'), { titulo, texto, creadoEl: serverTimestamp() })
}
export async function eliminarComunicado(gymId, id) {
  await deleteDoc(doc(db, 'gimnasios', gymId, 'comunicados', id))
}

/* ============ CONFIG DEL GYM ============ */
export async function actualizarGymCampos(gymId, campos) {
  await updateDoc(doc(db, 'gimnasios', gymId), campos)
}

/* ============ RUTINAS ============ */
export async function listarRutinas(gymId) {
  const snap = await getDocs(collection(db, 'gimnasios', gymId, 'rutinas'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
export async function obtenerRutina(gymId, rutinaId) {
  const snap = await getDoc(doc(db, 'gimnasios', gymId, 'rutinas', rutinaId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}
export async function guardarRutina(gymId, rutina) {
  if (rutina.id) {
    const { id, ...datos } = rutina
    await updateDoc(doc(db, 'gimnasios', gymId, 'rutinas', id), datos)
    return id
  }
  const ref = await addDoc(collection(db, 'gimnasios', gymId, 'rutinas'), { ...rutina, creadoEl: serverTimestamp() })
  return ref.id
}
export async function asignarRutina(uid, rutinaId) {
  await updateDoc(doc(db, 'usuarios', uid), { rutinaId })
}

/* ============ PROGRESO DEL CLIENTE (privado) ============ */
const hoyISO = () => new Date().toISOString().slice(0, 10)

export async function guardarSesionHoy(uid, datos) {
  // datos: { ejercicios: { [ejId]: { hecho, peso } }, dia }
  await setDoc(doc(db, 'usuarios', uid, 'progreso', `sesion-${hoyISO()}`), {
    tipo: 'sesion',
    fecha: hoyISO(),
    ...datos,
  }, { merge: true })
}
export async function guardarMedidasHoy(uid, medidas) {
  await setDoc(doc(db, 'usuarios', uid, 'progreso', `medidas-${hoyISO()}`), {
    tipo: 'medidas',
    fecha: hoyISO(),
    ...medidas,
  })
}
export async function listarProgreso(uid) {
  const snap = await getDocs(collection(db, 'usuarios', uid, 'progreso'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
}

/* Racha: días consecutivos (hasta hoy o ayer) con sesión registrada. */
export function calcularRacha(progreso) {
  const dias = new Set(progreso.filter((p) => p.tipo === 'sesion').map((p) => p.fecha))
  let racha = 0
  const cursor = new Date()
  if (!dias.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1)
  while (dias.has(cursor.toISOString().slice(0, 10))) {
    racha++
    cursor.setDate(cursor.getDate() - 1)
  }
  let mejor = 0, actual = 0, previa = null
  for (const f of [...dias].sort()) {
    actual = previa && (new Date(f) - new Date(previa)) === DIA_MS ? actual + 1 : 1
    mejor = Math.max(mejor, actual)
    previa = f
  }
  return { actual: racha, mejor, entrenos: dias.size }
}

export async function obtenerMembresia(gymId, uid) {
  try {
    const s = await getDoc(doc(db, 'gimnasios', gymId, 'membresias', uid))
    return s.exists() ? s.data() : null
  } catch (e) {
    console.warn('obtenerMembresia:', e.code ?? e.message)
    return null
  }
}
