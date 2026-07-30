/* Datos demo del panel del superadmin (plataforma Zeven Gym). */

export const demoGimnasios = [
  { id: 'g1', nombre: 'Titán Gym', ciudad: 'Bogotá', codigo: 'TITAN26', color: '#16a34a', estado: 'activo', clientes: 81, activos: 61, nuevosMes: 9, desde: 'marzo 2026', admin: { nombre: 'Ricardo Téllez', celular: '300 555 2211', correo: 'ricardo@titangym.co' }, ultimoPago: '15 jul 2026', proximoCorte: '15 ago', pagoMes: true },
  { id: 'g2', nombre: 'Fitzone', ciudad: 'Medellín', codigo: 'FITZONE9', color: '#2563eb', estado: 'prueba', diasPrueba: 18, clientes: 34, activos: 30, nuevosMes: 34, desde: 'julio 2026', admin: { nombre: 'Marcela Duque', celular: '301 444 8899', correo: 'marcela@fitzone.co' }, ultimoPago: null, proximoCorte: '12 ago', pagoMes: false },
  { id: 'g3', nombre: 'Cuerpo y Mente', ciudad: 'Cali', codigo: 'CUERPO35', color: '#7c3aed', estado: 'gracia', diasGracia: 3, clientes: 56, activos: 41, nuevosMes: 2, desde: 'abril 2026', admin: { nombre: 'Jorge Sarmiento', celular: '302 777 1100', correo: 'jorge@cuerpoymente.co' }, ultimoPago: '25 jun 2026', proximoCorte: 'venció 25 jul', pagoMes: false },
  { id: 'g4', nombre: 'Power House', ciudad: 'Bogotá', codigo: 'POWER14', color: '#ea580c', estado: 'gracia', diasGracia: 6, clientes: 92, activos: 74, nuevosMes: 5, desde: 'febrero 2026', admin: { nombre: 'Sandra Niño', celular: '304 222 6677', correo: 'sandra@powerhouse.co' }, ultimoPago: '22 jun 2026', proximoCorte: 'venció 22 jul', pagoMes: false },
  { id: 'g5', nombre: 'Gym Sur', ciudad: 'Soacha', codigo: 'GYMSUR7', color: '#0d9488', estado: 'suspendido', clientes: 28, activos: 0, nuevosMes: 0, desde: 'mayo 2026', suspendidoEl: '20 jul', admin: { nombre: 'Pedro Almanza', celular: '305 990 3321', correo: 'pedro@gymsur.co' }, ultimoPago: '13 jun 2026', proximoCorte: 'suspendido', pagoMes: false },
]

export const demoPlataforma = {
  ingresosMes: 1106000,
  pagosConfirmados: 11,
  pagosPendientes: 3,
  ingresosSerie: [30, 36, 42, 48, 58, 66],
  clientesTotal: 1238,
  clientesNuevosMes: 117,
  monto: 79000,
}

export const ESTADOS_GYM = {
  activo: { etiqueta: 'Activo', color: '#166534', bg: '#dcfce7' },
  prueba: { etiqueta: 'Prueba', color: '#1e40af', bg: '#dbeafe' },
  gracia: { etiqueta: 'Gracia', color: '#92400e', bg: '#fef3c7' },
  suspendido: { etiqueta: 'Suspendido', color: '#6b7280', bg: '#f3f4f6' },
}

export const PALETA_GYMS = ['#16a34a', '#2563eb', '#dc2626', '#ea580c', '#7c3aed', '#0d9488']
