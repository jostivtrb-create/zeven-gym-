/* Catálogo de máquinas de Zeven Gym: lo comparten TODOS los gimnasios.
   Cada gym marca cuáles tiene (se guarda en el propio doc del gimnasio, en
   `maquinas`: { id: 'ok' | 'mantenimiento' }; si no está, no la tiene).

   Sirve para una sola cosa: que al armar una rutina solo le aparezcan al
   entrenador los ejercicios que de verdad puede hacer en su sede. */

export const CATEGORIAS = [
  { id: 'cardio', nombre: 'Cardio y calentamiento', icono: '🏃' },
  { id: 'guiadas', nombre: 'Máquinas guiadas', icono: '🏋️' },
  { id: 'poleas', nombre: 'Poleas y especializadas', icono: '🔗' },
  { id: 'libres', nombre: 'Pesas libres', icono: '💪' },
  { id: 'accesorios', nombre: 'Accesorios funcionales', icono: '🧘' },
]

export const MAQUINAS = [
  // Cardio y calentamiento
  { id: 'cinta', nombre: 'Trotadora / cinta', cat: 'cardio' },
  { id: 'bici', nombre: 'Bicicleta estática', cat: 'cardio' },
  { id: 'eliptica', nombre: 'Elíptica', cat: 'cardio' },
  { id: 'remo-maq', nombre: 'Remo (rower)', cat: 'cardio' },
  { id: 'escaladora', nombre: 'Escaladora', cat: 'cardio' },
  { id: 'airbike', nombre: 'Air bike', cat: 'cardio' },
  { id: 'lazo', nombre: 'Lazo para saltar', cat: 'cardio' },
  { id: 'medicinales', nombre: 'Pelotas medicinales', cat: 'cardio' },

  // Máquinas guiadas
  { id: 'press-pecho', nombre: 'Press de pecho', cat: 'guiadas' },
  { id: 'prensa', nombre: 'Prensa de piernas', cat: 'guiadas' },
  { id: 'ext-cuadriceps', nombre: 'Extensión de cuádriceps', cat: 'guiadas' },
  { id: 'curl-femoral', nombre: 'Curl femoral', cat: 'guiadas' },
  { id: 'pec-deck', nombre: 'Pec deck / contractor', cat: 'guiadas' },
  { id: 'jalon', nombre: 'Jalón al pecho', cat: 'guiadas' },
  { id: 'remo-sentado', nombre: 'Remo sentado', cat: 'guiadas' },
  { id: 'press-hombro', nombre: 'Press de hombro', cat: 'guiadas' },
  { id: 'abductor', nombre: 'Abductor / aductor', cat: 'guiadas' },
  { id: 'ext-lumbar', nombre: 'Extensión lumbar', cat: 'guiadas' },
  { id: 'abdominal-maq', nombre: 'Abdominal en máquina', cat: 'guiadas' },
  { id: 'gemelos', nombre: 'Gemelos / pantorrilla', cat: 'guiadas' },
  { id: 'hip-thrust-maq', nombre: 'Hip thrust', cat: 'guiadas' },

  // Poleas y especializadas
  { id: 'crossover', nombre: 'Cruce de poleas', cat: 'poleas' },
  { id: 'polea-alta', nombre: 'Polea alta', cat: 'poleas' },
  { id: 'polea-baja', nombre: 'Polea baja', cat: 'poleas' },
  { id: 'functional', nombre: 'Functional trainer', cat: 'poleas' },
  { id: 'multipower', nombre: 'Multipower / Smith', cat: 'poleas' },
  { id: 'hack', nombre: 'Hack squat', cat: 'poleas' },
  { id: 'prensa45', nombre: 'Prensa 45°', cat: 'poleas' },

  // Pesas libres
  { id: 'barra-olimpica', nombre: 'Barra olímpica', cat: 'libres' },
  { id: 'mancuernas', nombre: 'Mancuernas', cat: 'libres' },
  { id: 'mancuernas-aj', nombre: 'Mancuernas ajustables', cat: 'libres' },
  { id: 'discos', nombre: 'Discos', cat: 'libres' },
  { id: 'discos-bumper', nombre: 'Discos bumper', cat: 'libres' },
  { id: 'barra-ez', nombre: 'Barra EZ / curl', cat: 'libres' },
  { id: 'trap-bar', nombre: 'Barra hexagonal', cat: 'libres' },
  { id: 'kettlebells', nombre: 'Kettlebells', cat: 'libres' },
  { id: 'bancos', nombre: 'Bancos', cat: 'libres' },
  { id: 'rack', nombre: 'Squat rack / power rack', cat: 'libres' },

  // Accesorios funcionales
  { id: 'bandas', nombre: 'Bandas elásticas', cat: 'accesorios' },
  { id: 'trx', nombre: 'TRX', cat: 'accesorios' },
  { id: 'bosu', nombre: 'Bosu', cat: 'accesorios' },
  { id: 'step', nombre: 'Step', cat: 'accesorios' },
  { id: 'colchonetas', nombre: 'Colchonetas', cat: 'accesorios' },
  { id: 'cajones', nombre: 'Cajones pliométricos', cat: 'accesorios' },
  { id: 'cuerdas-batalla', nombre: 'Cuerdas de batalla', cat: 'accesorios' },
  { id: 'cinturon-lastre', nombre: 'Cinturón de lastre', cat: 'accesorios' },
  { id: 'barra-dominadas', nombre: 'Barra de dominadas', cat: 'accesorios' },
  { id: 'paralelas', nombre: 'Paralelas', cat: 'accesorios' },
  { id: 'anillas', nombre: 'Anillas', cat: 'accesorios' },
  { id: 'sliders', nombre: 'Sliders', cat: 'accesorios' },
]

export const MAQUINA_POR_ID = Object.fromEntries(MAQUINAS.map((m) => [m.id, m]))

/* Arranques por tipo de gimnasio: en vez de marcar 50 cosas una por una, el
   dueño elige cómo es su gym y después solo corrige lo que no cuadre. */
export const PRESETS = [
  {
    id: 'basico',
    nombre: 'Básico',
    detalle: 'Cardio, pesas libres y lo esencial',
    maquinas: ['cinta', 'bici', 'lazo', 'barra-olimpica', 'mancuernas', 'discos', 'barra-ez', 'bancos', 'rack', 'colchonetas', 'bandas', 'barra-dominadas'],
  },
  {
    id: 'completo',
    nombre: 'Completo',
    detalle: 'Lo del básico más máquinas guiadas y poleas',
    maquinas: [
      'cinta', 'bici', 'eliptica', 'lazo', 'medicinales',
      'press-pecho', 'prensa', 'ext-cuadriceps', 'curl-femoral', 'pec-deck', 'jalon', 'remo-sentado', 'press-hombro', 'abductor', 'abdominal-maq', 'gemelos',
      'crossover', 'polea-alta', 'polea-baja', 'multipower',
      'barra-olimpica', 'mancuernas', 'discos', 'barra-ez', 'kettlebells', 'bancos', 'rack',
      'colchonetas', 'bandas', 'barra-dominadas', 'step', 'paralelas',
    ],
  },
  {
    id: 'profesional',
    nombre: 'Profesional',
    detalle: 'Todo el catálogo — luego quitas lo que no tengas',
    maquinas: MAQUINAS.map((m) => m.id),
  },
]

/* Qué hace falta para cada ejercicio del catálogo Zeven.
   Basta con tener UNA de las opciones. Lista vacía = no necesita nada
   (se hace con el peso del cuerpo). */
export const MAQUINAS_POR_EJERCICIO = {
  // Pecho
  'press de banca': ['barra-olimpica', 'multipower', 'press-pecho'],
  'press inclinado con mancuernas': ['mancuernas', 'mancuernas-aj'],
  'aperturas en polea': ['crossover', 'polea-alta', 'functional', 'pec-deck'],
  'flexiones de pecho': [],
  'fondos en paralelas': ['paralelas', 'anillas'],
  // Espalda
  'dominadas': ['barra-dominadas', 'anillas'],
  'dominadas asistidas': ['barra-dominadas', 'bandas'],
  'jalon al pecho': ['jalon', 'polea-alta', 'functional'],
  'remo con barra': ['barra-olimpica', 'barra-ez'],
  'remo con mancuerna': ['mancuernas', 'mancuernas-aj'],
  'remo en maquina': ['remo-sentado', 'polea-baja', 'functional'],
  'peso muerto': ['barra-olimpica', 'trap-bar'],
  // Pierna
  'sentadilla con barra': ['barra-olimpica', 'multipower', 'rack'],
  'sentadilla goblet': ['mancuernas', 'kettlebells', 'mancuernas-aj'],
  'prensa de pierna': ['prensa', 'prensa45', 'hack'],
  'peso muerto rumano': ['barra-olimpica', 'mancuernas', 'barra-ez'],
  'zancadas con mancuernas': ['mancuernas', 'mancuernas-aj', 'kettlebells'],
  'curl femoral': ['curl-femoral'],
  'extension de cuadriceps': ['ext-cuadriceps'],
  'elevacion de talones': ['gemelos', 'mancuernas', 'multipower'],
  'hip thrust': ['hip-thrust-maq', 'barra-olimpica', 'bancos'],
  'sentadilla bulgara': ['bancos', 'mancuernas'],
  // Hombro
  'press militar': ['barra-olimpica', 'multipower', 'press-hombro'],
  'press de hombro con mancuernas': ['mancuernas', 'mancuernas-aj'],
  'elevaciones laterales': ['mancuernas', 'mancuernas-aj', 'polea-baja'],
  'elevaciones frontales': ['mancuernas', 'mancuernas-aj', 'discos'],
  'pajaros posteriores': ['mancuernas', 'pec-deck', 'crossover'],
  'encogimiento de hombros': ['mancuernas', 'barra-olimpica', 'trap-bar'],
  // Brazo
  'curl de biceps con barra': ['barra-ez', 'barra-olimpica'],
  'curl con mancuernas': ['mancuernas', 'mancuernas-aj'],
  'curl martillo': ['mancuernas', 'mancuernas-aj'],
  'extension de triceps en polea': ['polea-alta', 'crossover', 'functional'],
  'press frances': ['barra-ez', 'mancuernas'],
  'fondos en banco': ['bancos', 'step'],
  // Core
  'plancha': [],
  'crunch abdominal': [],
  'crunch en polea': ['polea-alta', 'crossover', 'abdominal-maq'],
  'elevacion de piernas': [],
  'russian twist': [],
  // Cardio
  'caminadora': ['cinta'],
  'bicicleta estatica': ['bici'],
  'burpees': [],
}

const normalizar = (s) =>
  (s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

/* Ids de las máquinas que el gimnasio tiene operativas.
   Las que están en mantenimiento NO cuentan: no se puede entrenar en ellas. */
export function maquinasDisponibles(gym) {
  const inv = gym?.maquinas ?? {}
  return new Set(Object.entries(inv).filter(([, estado]) => estado === 'ok').map(([id]) => id))
}

/* ¿Puede hacerse este ejercicio en este gimnasio?
   Si el gym todavía no configuró su inventario, todo se considera disponible:
   nunca se le esconden ejercicios a quien no ha dicho qué tiene. */
export function puedeHacerse(ejercicio, gym) {
  const inv = gym?.maquinas ?? {}
  if (!Object.keys(inv).length) return { ok: true }
  const requiere = MAQUINAS_POR_EJERCICIO[normalizar(ejercicio?.nombre)]
  if (!requiere || requiere.length === 0) return { ok: true }
  const disponibles = maquinasDisponibles(gym)
  if (requiere.some((id) => disponibles.has(id))) return { ok: true }
  // Se explica con la primera opción: es la más común de las que sirven
  return { ok: false, falta: MAQUINA_POR_ID[requiere[0]]?.nombre ?? 'equipo' }
}
