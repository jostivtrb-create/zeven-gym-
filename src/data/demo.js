/* Datos de demostración (Titán Gym) — se usan mientras Firestore no tiene datos.
   La forma imita 1:1 la arquitectura de ARQUITECTURA.md. */

export const demoGym = {
  id: 'demo',
  nombre: 'Titán Gym',
  ciudad: 'Chapinero · Bogotá',
  codigo: 'TITAN26',
  branding: { color: '#16a34a', logoUrl: null, bannerUrl: null },
  contacto: {
    celular: '313 456 7890',
    instagram: '@titangym.bta',
    direccion: 'Cra 13 #54-20',
  },
  horarios: [
    { dias: 'Lunes a viernes', abre: '5:00 am', cierra: '10:00 pm' },
    { dias: 'Sábados', abre: '7:00 am', cierra: '1:00 pm' },
    { dias: 'Domingos', abre: null, cierra: null },
  ],
  politicas: {
    vigencia: 'desde_pago',
    permitirCongelar: true,
    bloquearAlVencer: false,
  },
}

export const demoUsuario = {
  uid: 'demo-camila',
  rol: 'cliente',
  gymId: 'demo',
  nombre: 'Camila Rodríguez',
  celular: '310 222 8145',
  documento: 'CC 1.023.456.789',
  nacimiento: '14 feb 1999',
}

export const demoMembresia = {
  planNombre: 'Plan Mensual',
  precio: 70000,
  vence: '2026-07-29',
  estado: 'activa', // derivar 'por_vencer' si vence - hoy <= 1
}

export const demoRutina = {
  id: 'r1',
  nombre: 'Full body — Principiante',
  dias: {
    lun: {
      titulo: 'Pecho y tríceps',
      ejercicios: [
        { id: 'e1', nombre: 'Press de banca', series: 4, reps: 10, descansoSeg: 120, imagenUrl: null },
        { id: 'e2', nombre: 'Press inclinado con mancuernas', series: 4, reps: 12, descansoSeg: 90, imagenUrl: null },
        { id: 'e3', nombre: 'Fondos en paralelas', series: 3, reps: 12, descansoSeg: 90, imagenUrl: null },
        { id: 'e4', nombre: 'Extensión de tríceps en polea', series: 3, reps: 15, descansoSeg: 60, imagenUrl: null },
      ],
    },
    mar: {
      titulo: 'Pierna y glúteo',
      ejercicios: [
        { id: 'e5', nombre: 'Sentadilla con barra', series: 4, reps: 10, descansoSeg: 120, imagenUrl: null },
        { id: 'e6', nombre: 'Prensa de pierna', series: 4, reps: 12, descansoSeg: 90, imagenUrl: null },
        { id: 'e7', nombre: 'Peso muerto rumano', series: 4, reps: 10, descansoSeg: 90, imagenUrl: null },
        { id: 'e8', nombre: 'Zancadas con mancuernas', series: 3, reps: 12, descansoSeg: 60, imagenUrl: null },
        { id: 'e9', nombre: 'Curl femoral', series: 3, reps: 15, descansoSeg: 60, imagenUrl: null },
        { id: 'e10', nombre: 'Elevación de talones', series: 4, reps: 20, descansoSeg: 45, imagenUrl: null },
      ],
    },
    mie: {
      titulo: 'Espalda y bíceps',
      ejercicios: [
        { id: 'e11', nombre: 'Dominadas asistidas', series: 4, reps: 8, descansoSeg: 120, imagenUrl: null },
        { id: 'e12', nombre: 'Remo con barra', series: 4, reps: 10, descansoSeg: 90, imagenUrl: null },
        { id: 'e13', nombre: 'Jalón al pecho', series: 3, reps: 12, descansoSeg: 90, imagenUrl: null },
        { id: 'e14', nombre: 'Curl de bíceps con barra', series: 3, reps: 12, descansoSeg: 60, imagenUrl: null },
      ],
    },
    jue: {
      titulo: 'Hombro y abdomen',
      ejercicios: [
        { id: 'e15', nombre: 'Press militar', series: 4, reps: 10, descansoSeg: 120, imagenUrl: null },
        { id: 'e16', nombre: 'Elevaciones laterales', series: 4, reps: 15, descansoSeg: 60, imagenUrl: null },
        { id: 'e17', nombre: 'Plancha', series: 3, reps: 60, descansoSeg: 60, imagenUrl: null },
        { id: 'e18', nombre: 'Crunch en polea', series: 3, reps: 15, descansoSeg: 60, imagenUrl: null },
      ],
    },
    vie: {
      titulo: 'Full body',
      ejercicios: [
        { id: 'e19', nombre: 'Peso muerto', series: 4, reps: 8, descansoSeg: 150, imagenUrl: null },
        { id: 'e20', nombre: 'Press de banca', series: 3, reps: 10, descansoSeg: 120, imagenUrl: null },
        { id: 'e21', nombre: 'Sentadilla goblet', series: 3, reps: 12, descansoSeg: 90, imagenUrl: null },
        { id: 'e22', nombre: 'Remo en máquina', series: 3, reps: 12, descansoSeg: 90, imagenUrl: null },
      ],
    },
    sab: null,
    dom: null,
  },
}

export const demoComunicados = [
  {
    id: 'c1',
    titulo: 'Nuevo horario los domingos',
    texto: 'A partir de agosto abrimos los domingos de 8:00 am a 12:00 m. ¡Nos vemos!',
    hace: 'Hace 2 días',
  },
  {
    id: 'c2',
    titulo: 'Clase de estiramiento gratis',
    texto: 'Este sábado 1 de agosto, 9:00 am. Cupo libre para todos los miembros.',
    hace: 'Hace 5 días',
  },
]
