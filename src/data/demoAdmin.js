/* Datos demo del panel del admin (Titán Gym). */

export const demoClientes = [
  { uid: 'c1', nombre: 'Camila Rodríguez', celular: '310 222 8145', documento: 'CC 1.023.456.789', nacimiento: '3 sep 1996', plan: 'Plan Mensual', precio: 70000, vence: '2026-07-29', estado: 'por_vencer', rutina: 'Full body — Principiante' },
  { uid: 'c2', nombre: 'Julián Mora', celular: '311 555 0192', documento: 'CC 1.010.222.333', nacimiento: '21 ene 1994', plan: 'Plan Mensual', precio: 70000, vence: '2026-08-18', estado: 'activo', rutina: 'Fuerza — Intermedio' },
  { uid: 'c3', nombre: 'Daniela Pardo', celular: '315 880 4472', documento: 'CC 1.098.334.221', nacimiento: '3 sep 1996', plan: 'Plan Quincena', precio: 40000, vence: '2026-07-26', estado: 'vencido', rutina: 'Full body — Principiante' },
  { uid: 'c4', nombre: 'Andrés Vélez', celular: '312 400 7810', documento: 'CC 80.233.415', nacimiento: '9 jun 1990', plan: 'Plan Mensual', precio: 70000, vence: '2026-08-15', estado: 'congelado', congeladoDesde: '15 jul', rutina: 'Hipertrofia — Avanzado' },
  { uid: 'c5', nombre: 'Laura Gómez', celular: '318 220 9911', documento: 'CC 1.032.876.554', nacimiento: '27 nov 1999', plan: 'Plan Día', precio: 8000, vence: '2026-08-05', estado: 'activo', rutina: null },
  { uid: 'c6', nombre: 'Óscar Herrera', celular: '316 774 2210', documento: 'CC 79.556.812', nacimiento: '2 mar 1988', plan: 'Plan Mensual', precio: 70000, vence: '2026-07-23', estado: 'vencido', rutina: 'Fuerza — Intermedio' },
  { uid: 'c7', nombre: 'Paula Cifuentes', celular: '317 908 1123', documento: 'CC 1.045.221.876', nacimiento: '15 may 1997', plan: 'Plan Mensual', precio: 70000, vence: '2026-07-16', estado: 'vencido', rutina: null },
  { uid: 'c8', nombre: 'Felipe Castaño', celular: '314 660 3345', documento: 'CC 1.020.443.119', nacimiento: '8 ago 1995', plan: 'Plan Mensual', precio: 70000, vence: '2026-07-31', estado: 'por_vencer', rutina: 'Full body — Principiante' },
  { uid: 'c9', nombre: 'Valentina Ríos', celular: '319 112 5540', documento: 'CC 1.033.998.204', nacimiento: '30 abr 2000', plan: 'Plan Quincena', precio: 40000, vence: '2026-08-02', estado: 'por_vencer', rutina: null },
  { uid: 'c10', nombre: 'Santiago Ruiz', celular: '310 448 6621', documento: 'CC 1.015.667.983', nacimiento: '12 dic 1992', plan: null, precio: null, vence: null, estado: 'desactivado', desactivadoEn: 'junio', rutina: null },
]

export const demoPlanes = [
  { id: 'p1', nombre: 'Plan Mensual', precio: 70000, duracionDias: 30, activo: true, miembros: 64 },
  { id: 'p2', nombre: 'Plan Quincena', precio: 40000, duracionDias: 15, activo: true, miembros: 12 },
  { id: 'p3', nombre: 'Plan Día', precio: 8000, duracionDias: 1, activo: true, miembros: 5 },
]

export const demoStats = {
  ingresosMes: 4270000,
  variacion: '+12% vs junio',
  ingresosSerie: [2800000, 3400000, 3100000, 3700000, 4000000, 4270000],
  meses: ['Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
  crecimiento: [55, 60, 64, 70, 76, 81],
  nuevosMes: 9,
}

export const demoRutinasGym = [
  { id: 'r1', nombre: 'Full body — Principiante', origen: 'plantilla', dias: 3, asignados: 18 },
  { id: 'r2', nombre: 'Fuerza — Intermedio', origen: 'plantilla', dias: 4, asignados: 11 },
  { id: 'r3', nombre: 'Hipertrofia — Avanzado', origen: 'propia', dias: 5, asignados: 6 },
  { id: 'r4', nombre: 'Cardio y core', origen: 'propia', dias: 3, asignados: 4 },
]

export const demoComunicadosAdmin = [
  { id: 'a1', titulo: 'Nuevo horario los domingos', texto: 'A partir de agosto abrimos los domingos de 8:00 am a 12:00 m. ¡Nos vemos!', hace: 'Hace 2 días' },
  { id: 'a2', titulo: 'Clase de estiramiento gratis', texto: 'Este sábado 1 de agosto, 9:00 am. Cupo libre para todos los miembros.', hace: 'Hace 5 días' },
]

/* Suscripción del gym con Zeven: cambiar diasAtraso para probar avisos (0 = al día). */
export const demoSuscripcionGym = { diasAtraso: 0, monto: 79000 }

export const ESTADOS = {
  activo: { etiqueta: 'Activo', color: '#166534', bg: '#dcfce7' },
  por_vencer: { etiqueta: 'Por vencer', color: '#92400e', bg: '#fef3c7' },
  vencido: { etiqueta: 'Vencido', color: '#b91c1c', bg: '#fee2e2' },
  congelado: { etiqueta: 'Congelado', color: '#1e40af', bg: '#dbeafe' },
  desactivado: { etiqueta: 'Desactivado', color: '#6b7280', bg: '#f3f4f6' },
}

export const pesos = (n) => '$' + Number(n).toLocaleString('es-CO')
