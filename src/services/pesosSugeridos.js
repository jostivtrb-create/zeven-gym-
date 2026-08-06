/* Punto de partida sugerido para cada ejercicio.
   Sustituye la "tabla maestra" (miles de celdas) por una fórmula equivalente:
   un valor base por ejercicio × multiplicadores por género, edad, contextura,
   actividad y peso corporal. Nadie la edita desde la app — son constantes.
   La especificación completa y los ejemplos están en PESOS-SUGERIDOS.md.

   Los valores nacen CORTOS a propósito: es mejor que el cliente suba peso a
   que se lastime el primer día. Siempre se le muestran como punto de partida. */

export const TIPOS = { PESO: 'peso', REPS: 'reps', TIEMPO: 'tiempo' }

/* Persona de referencia (todos los multiplicadores en 1): hombre, 30 años,
   70 kg, contextura promedio, entrena de vez en cuando.
   En ejercicios de dos mancuernas, el valor es POR MANCUERNA. */
const PESO_REFERENCIA = 70

const BASES = {
  // Pecho
  'press de banca': { tipo: TIPOS.PESO, base: 22.5 },
  'press inclinado con mancuernas': { tipo: TIPOS.PESO, base: 10 },
  'aperturas en polea': { tipo: TIPOS.PESO, base: 7.5 },
  'flexiones de pecho': { tipo: TIPOS.REPS, base: 10 },
  'fondos en paralelas': { tipo: TIPOS.REPS, base: 6 },
  // Espalda
  'dominadas': { tipo: TIPOS.REPS, base: 3 },
  'dominadas asistidas': { tipo: TIPOS.REPS, base: 8 },
  'jalon al pecho': { tipo: TIPOS.PESO, base: 27.5 },
  'remo con barra': { tipo: TIPOS.PESO, base: 22.5 },
  'remo con mancuerna': { tipo: TIPOS.PESO, base: 12.5 },
  'remo en maquina': { tipo: TIPOS.PESO, base: 25 },
  'peso muerto': { tipo: TIPOS.PESO, base: 35 },
  // Pierna
  'sentadilla con barra': { tipo: TIPOS.PESO, base: 27.5 },
  'sentadilla goblet': { tipo: TIPOS.PESO, base: 12.5 },
  'prensa de pierna': { tipo: TIPOS.PESO, base: 60 },
  'peso muerto rumano': { tipo: TIPOS.PESO, base: 30 },
  'zancadas con mancuernas': { tipo: TIPOS.PESO, base: 8 },
  'curl femoral': { tipo: TIPOS.PESO, base: 20 },
  'extension de cuadriceps': { tipo: TIPOS.PESO, base: 20 },
  'elevacion de talones': { tipo: TIPOS.PESO, base: 30 },
  'hip thrust': { tipo: TIPOS.PESO, base: 30 },
  'sentadilla bulgara': { tipo: TIPOS.PESO, base: 8 },
  // Hombro
  'press militar': { tipo: TIPOS.PESO, base: 15 },
  'press de hombro con mancuernas': { tipo: TIPOS.PESO, base: 8 },
  'elevaciones laterales': { tipo: TIPOS.PESO, base: 4 },
  'elevaciones frontales': { tipo: TIPOS.PESO, base: 4 },
  'pajaros posteriores': { tipo: TIPOS.PESO, base: 3 },
  'encogimiento de hombros': { tipo: TIPOS.PESO, base: 20 },
  // Brazo
  'curl de biceps con barra': { tipo: TIPOS.PESO, base: 12.5 },
  'curl con mancuernas': { tipo: TIPOS.PESO, base: 7.5 },
  'curl martillo': { tipo: TIPOS.PESO, base: 7.5 },
  'extension de triceps en polea': { tipo: TIPOS.PESO, base: 15 },
  'press frances': { tipo: TIPOS.PESO, base: 12.5 },
  'fondos en banco': { tipo: TIPOS.REPS, base: 10 },
  // Core
  'plancha': { tipo: TIPOS.TIEMPO, base: 30, unidad: 'seg' },
  'crunch abdominal': { tipo: TIPOS.REPS, base: 15 },
  'crunch en polea': { tipo: TIPOS.PESO, base: 15 },
  'elevacion de piernas': { tipo: TIPOS.REPS, base: 10 },
  'russian twist': { tipo: TIPOS.REPS, base: 20 },
  // Cardio
  'caminadora': { tipo: TIPOS.TIEMPO, base: 15, unidad: 'min' },
  'bicicleta estatica': { tipo: TIPOS.TIEMPO, base: 15, unidad: 'min' },
  'burpees': { tipo: TIPOS.REPS, base: 8 },
}

// Sin acentos ni mayúsculas: así "Jalón al pecho" encuentra su ficha.
const normalizar = (s) =>
  (s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

/* Ficha del ejercicio: tipo de medida y valor base.
   Un ejercicio propio del gym (fuera del catálogo Zeven) puede traer su propio
   `tipoMedida`; si no, se asume peso y sin sugerencia automática. */
export function fichaEjercicio(ejercicio) {
  const dato = BASES[normalizar(ejercicio?.nombre)]
  if (dato) return { unidad: dato.tipo === TIPOS.PESO ? 'kg' : null, ...dato }
  return { tipo: ejercicio?.tipoMedida ?? TIPOS.PESO, base: null, unidad: ejercicio?.tipoMedida === TIPOS.PESO || !ejercicio?.tipoMedida ? 'kg' : null }
}

/* ---- Multiplicadores ---- */

const TREN_SUPERIOR = ['Pecho', 'Espalda', 'Hombro', 'Brazo']

// Sin género conocido se usa el coeficiente más bajo: nunca sugerir de más.
function multGenero(genero, grupo, tipo) {
  if (tipo === TIPOS.TIEMPO) return 1 // el tiempo no se recorta por género
  if (genero === 'hombre') return 1
  return TREN_SUPERIOR.includes(grupo) ? 0.6 : 0.75
}

function multEdad(edad) {
  if (edad == null) return 1
  if (edad <= 35) return 1
  if (edad <= 45) return 0.93
  if (edad <= 55) return 0.85
  if (edad <= 65) return 0.75
  return 0.62
}

export function contexturaPorImc(peso, estatura) {
  if (!peso || !estatura) return 'promedio'
  const imc = peso / (estatura * estatura)
  if (imc < 18.5) return 'delgado'
  if (imc < 25) return 'promedio'
  return 'robusto'
}

const MULT_CONTEXTURA = { delgado: 0.88, promedio: 1, robusto: 1.06 }
const MULT_ACTIVIDAD = { nunca: 0.8, aveces: 1, regular: 1.18 }

// Escalado amortiguado: el doble de peso corporal no es el doble de fuerza.
function multPesoCorporal(peso, tipo) {
  if (tipo !== TIPOS.PESO || !peso) return 1
  const f = 1 + 0.5 * ((peso - PESO_REFERENCIA) / PESO_REFERENCIA)
  return Math.min(1.3, Math.max(0.8, f))
}

/* Redondeo a un número que se pueda montar de verdad en el gym. */
function redondear(valor, tipo, unidad) {
  if (tipo === TIPOS.REPS) return Math.max(1, Math.round(valor))
  if (tipo === TIPOS.TIEMPO) {
    const v = Math.round(valor / 5) * 5
    return unidad === 'min' ? Math.max(5, v) : Math.max(5, v)
  }
  if (valor >= 20) return Math.round(valor / 5) * 5
  if (valor >= 10) return Math.round(valor / 2.5) * 2.5
  return Math.max(1, Math.round(valor))
}

export function edadDesdeNacimiento(nacimiento) {
  // Se guarda como DD/MM/AAAA
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(nacimiento ?? '')
  if (!m) return null
  const [, d, mes, anio] = m
  const hoy = new Date()
  let edad = hoy.getFullYear() - Number(anio)
  const cumpleAun = hoy.getMonth() + 1 < Number(mes) || (hoy.getMonth() + 1 === Number(mes) && hoy.getDate() < Number(d))
  if (cumpleAun) edad--
  return edad >= 10 && edad <= 100 ? edad : null
}

/* Punto de partida para un ejercicio y un cliente.
   `perfil` acepta datos incompletos: cada hueco cae en su valor neutro.
   Devuelve null si el ejercicio no tiene base conocida (ejercicio propio del gym). */
export function sugerirValor(ejercicio, perfil = {}, pesoCorporal = null) {
  const ficha = fichaEjercicio(ejercicio)
  if (ficha.base == null) return null

  const edad = perfil.edad ?? edadDesdeNacimiento(perfil.nacimiento)
  const contextura = contexturaPorImc(pesoCorporal, perfil.estatura)
  const valor =
    ficha.base *
    multGenero(perfil.genero, ejercicio?.grupo, ficha.tipo) *
    multEdad(edad) *
    MULT_CONTEXTURA[contextura] *
    (MULT_ACTIVIDAD[perfil.actividad] ?? 1) *
    multPesoCorporal(pesoCorporal, ficha.tipo)

  return { valor: redondear(valor, ficha.tipo, ficha.unidad), tipo: ficha.tipo, unidad: ficha.unidad }
}

/* Texto corto para mostrar: "30 kg", "12 reps", "15 min". */
export function textoValor(valor, tipo, unidad) {
  if (valor == null) return ''
  const n = String(valor).replace('.', ',')
  if (tipo === TIPOS.REPS) return `${n} reps`
  if (tipo === TIPOS.TIEMPO) return `${n} ${unidad ?? 'min'}`
  return `${n} kg`
}
