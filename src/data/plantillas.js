/* Plantillas de rutina de Zeven Gym: contenido base real de la plataforma.
   Al "usarlas" se crea una COPIA editable en las rutinas del gimnasio. */

const ej = (nombre, series, reps, descansoSeg) => ({ id: `${nombre.toLowerCase().replace(/[^a-z]/g, '').slice(0, 12)}${series}${reps}`, nombre, series, reps, descansoSeg, imagenUrl: null })

export const PLANTILLAS_ZEVEN = [
  {
    nombre: 'Full body — Principiante',
    nivel: 'Principiante',
    detalle: '3 días/semana · cuerpo completo',
    dias: {
      lun: { titulo: 'Full body A', ejercicios: [ej('Sentadilla goblet', 3, 12, 90), ej('Press de banca con mancuernas', 3, 12, 90), ej('Remo en máquina', 3, 12, 90), ej('Plancha (segundos)', 3, 30, 60)] },
      mar: null,
      mie: { titulo: 'Full body B', ejercicios: [ej('Prensa de pierna', 3, 12, 90), ej('Press militar con mancuernas', 3, 12, 90), ej('Jalón al pecho', 3, 12, 90), ej('Crunch abdominal', 3, 15, 60)] },
      jue: null,
      vie: { titulo: 'Full body C', ejercicios: [ej('Peso muerto rumano con mancuernas', 3, 12, 90), ej('Flexiones de pecho', 3, 10, 90), ej('Remo con mancuerna', 3, 12, 90), ej('Elevación de talones', 3, 20, 45)] },
      sab: null,
      dom: null,
    },
  },
  {
    nombre: 'Fuerza — Intermedio',
    nivel: 'Intermedio',
    detalle: '4 días/semana · empuje, tirón, pierna',
    dias: {
      lun: { titulo: 'Empuje', ejercicios: [ej('Press de banca', 4, 8, 120), ej('Press militar', 4, 10, 90), ej('Fondos en paralelas', 3, 12, 90), ej('Extensión de tríceps en polea', 3, 15, 60)] },
      mar: { titulo: 'Tirón', ejercicios: [ej('Dominadas asistidas', 4, 8, 120), ej('Remo con barra', 4, 10, 90), ej('Jalón al pecho', 3, 12, 90), ej('Curl de bíceps con barra', 3, 12, 60)] },
      mie: null,
      jue: { titulo: 'Pierna', ejercicios: [ej('Sentadilla con barra', 4, 8, 150), ej('Peso muerto rumano', 4, 10, 120), ej('Zancadas con mancuernas', 3, 12, 90), ej('Curl femoral', 3, 15, 60)] },
      vie: { titulo: 'Cuerpo completo', ejercicios: [ej('Peso muerto', 4, 6, 150), ej('Press inclinado con mancuernas', 3, 10, 90), ej('Remo en máquina', 3, 12, 90), ej('Plancha (segundos)', 3, 45, 60)] },
      sab: null,
      dom: null,
    },
  },
  {
    nombre: 'Hipertrofia — Avanzado',
    nivel: 'Avanzado',
    detalle: '5 días/semana · por grupo muscular',
    dias: {
      lun: { titulo: 'Pecho', ejercicios: [ej('Press de banca', 4, 10, 90), ej('Press inclinado con mancuernas', 4, 12, 90), ej('Aperturas en polea', 3, 15, 60), ej('Flexiones de pecho', 3, 15, 60)] },
      mar: { titulo: 'Espalda', ejercicios: [ej('Dominadas', 4, 8, 120), ej('Remo con barra', 4, 10, 90), ej('Jalón al pecho', 4, 12, 90), ej('Remo en polea baja', 3, 12, 60)] },
      mie: { titulo: 'Pierna', ejercicios: [ej('Sentadilla con barra', 4, 10, 120), ej('Prensa de pierna', 4, 12, 90), ej('Peso muerto rumano', 4, 10, 90), ej('Elevación de talones', 4, 20, 45)] },
      jue: { titulo: 'Hombro y abdomen', ejercicios: [ej('Press militar', 4, 10, 90), ej('Elevaciones laterales', 4, 15, 60), ej('Pájaros posteriores', 3, 15, 60), ej('Crunch en polea', 3, 15, 60)] },
      vie: { titulo: 'Brazo', ejercicios: [ej('Curl de bíceps con barra', 4, 10, 60), ej('Extensión de tríceps en polea', 4, 12, 60), ej('Curl martillo', 3, 12, 60), ej('Fondos en banco', 3, 15, 60)] },
      sab: null,
      dom: null,
    },
  },
]
