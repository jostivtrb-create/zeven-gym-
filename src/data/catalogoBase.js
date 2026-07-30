/* Catálogo base de Zeven Gym: 40 ejercicios comunes.
   El SUPERADMIN los siembra una vez y les genera la infografía; todos los
   gimnasios los heredan. Cada gym recibe una copia ligera al crearse y borra
   los que no tenga en su sede. */

export const GRUPOS = ['Pecho', 'Espalda', 'Pierna', 'Hombro', 'Brazo', 'Core', 'Cardio']

export const CATALOGO_BASE = [
  // ---- Pecho ----
  { nombre: 'Press de banca', grupo: 'Pecho', nota: 'Acuéstate con los pies firmes en el piso, baja la barra al centro del pecho controlando y sube sin bloquear los codos de golpe.' },
  { nombre: 'Press inclinado con mancuernas', grupo: 'Pecho', nota: 'Banco a 30-45°. Baja las mancuernas hasta la altura del pecho y sube juntándolas sin chocarlas.' },
  { nombre: 'Aperturas en polea', grupo: 'Pecho', nota: 'Codos ligeramente flexionados y fijos. Junta las manos al frente apretando el pecho, no los brazos.' },
  { nombre: 'Flexiones de pecho', grupo: 'Pecho', nota: 'Cuerpo en línea recta de cabeza a talones. Baja hasta que el pecho casi toque el piso, sin abrir los codos del todo.' },
  { nombre: 'Fondos en paralelas', grupo: 'Pecho', nota: 'Inclina el torso ligeramente al frente para trabajar pecho. Baja hasta 90° en el codo y sube controlado.' },

  // ---- Espalda ----
  { nombre: 'Dominadas', grupo: 'Espalda', nota: 'Agarre un poco más ancho que los hombros. Lleva el pecho hacia la barra pensando en bajar los codos, no en jalar con los brazos.' },
  { nombre: 'Dominadas asistidas', grupo: 'Espalda', nota: 'Usa la máquina o una banda. Misma técnica que la dominada, sube sin impulso y baja lento.' },
  { nombre: 'Jalón al pecho', grupo: 'Espalda', nota: 'Pecho arriba y espalda ligeramente inclinada atrás. Lleva la barra al pecho, no a la nuca.' },
  { nombre: 'Remo con barra', grupo: 'Espalda', nota: 'Espalda recta e inclinada 45°. Lleva la barra al ombligo apretando las escápulas y baja controlado.' },
  { nombre: 'Remo con mancuerna', grupo: 'Espalda', nota: 'Apoya rodilla y mano en el banco. Sube la mancuerna pegada al costado, sin girar el torso.' },
  { nombre: 'Remo en máquina', grupo: 'Espalda', nota: 'Pecho apoyado, hombros abajo. Jala hacia el abdomen y aguanta un segundo apretando la espalda.' },
  { nombre: 'Peso muerto', grupo: 'Espalda', nota: 'Espalda recta siempre. Empuja el piso con las piernas y sube la barra pegada al cuerpo. Es el ejercicio con más riesgo si se hace curvado.' },

  // ---- Pierna ----
  { nombre: 'Sentadilla con barra', grupo: 'Pierna', nota: 'Pies al ancho de los hombros, pecho arriba. Baja como si te sentaras hasta al menos 90° y empuja con los talones.' },
  { nombre: 'Sentadilla goblet', grupo: 'Pierna', nota: 'Sostén una mancuerna contra el pecho. Baja recto manteniendo el torso erguido, ideal para aprender la técnica.' },
  { nombre: 'Prensa de pierna', grupo: 'Pierna', nota: 'No bloquees las rodillas al extender ni dejes que se despegue la espalda baja del respaldo.' },
  { nombre: 'Peso muerto rumano', grupo: 'Pierna', nota: 'Rodillas casi rectas, empuja la cadera hacia atrás y baja la barra pegada a las piernas. Debes sentir el estiramiento atrás.' },
  { nombre: 'Zancadas con mancuernas', grupo: 'Pierna', nota: 'Paso largo, baja hasta que la rodilla de atrás casi toque el piso. La rodilla de adelante no pasa la punta del pie.' },
  { nombre: 'Curl femoral', grupo: 'Pierna', nota: 'Sin despegar la cadera. Sube controlado y baja aún más lento para sentir el trabajo atrás.' },
  { nombre: 'Extensión de cuádriceps', grupo: 'Pierna', nota: 'Sube hasta extender sin dar tirones y aguanta un segundo arriba apretando el muslo.' },
  { nombre: 'Elevación de talones', grupo: 'Pierna', nota: 'Sube lo más alto que puedas sobre las puntas y baja lento hasta estirar el gemelo por completo.' },
  { nombre: 'Hip thrust', grupo: 'Pierna', nota: 'Espalda alta apoyada en el banco. Sube la cadera hasta formar una línea recta y aprieta el glúteo arriba.' },
  { nombre: 'Sentadilla búlgara', grupo: 'Pierna', nota: 'Pie de atrás sobre el banco. Baja recto sobre la pierna de adelante, sin inclinarte demasiado.' },

  // ---- Hombro ----
  { nombre: 'Press militar', grupo: 'Hombro', nota: 'Abdomen apretado para no arquear la espalda. Sube la barra sobre la cabeza sin lanzarla con las piernas.' },
  { nombre: 'Press de hombro con mancuernas', grupo: 'Hombro', nota: 'Codos ligeramente al frente, no totalmente abiertos. Baja hasta la altura de las orejas.' },
  { nombre: 'Elevaciones laterales', grupo: 'Hombro', nota: 'Sube los brazos hasta la altura del hombro, no más. Poco peso y mucho control: es un músculo pequeño.' },
  { nombre: 'Elevaciones frontales', grupo: 'Hombro', nota: 'Sube al frente hasta la altura de los ojos sin balancear el cuerpo.' },
  { nombre: 'Pájaros posteriores', grupo: 'Hombro', nota: 'Torso inclinado al frente. Abre los brazos apretando la parte de atrás del hombro, sin subir los trapecios.' },
  { nombre: 'Encogimiento de hombros', grupo: 'Hombro', nota: 'Sube los hombros hacia las orejas sin rotar y aguanta arriba un segundo.' },

  // ---- Brazo ----
  { nombre: 'Curl de bíceps con barra', grupo: 'Brazo', nota: 'Codos pegados al cuerpo y quietos. Sube sin balancear la espalda y baja lento.' },
  { nombre: 'Curl con mancuernas', grupo: 'Brazo', nota: 'Gira la muñeca al subir para apretar más el bíceps. Un brazo a la vez si te cuesta el control.' },
  { nombre: 'Curl martillo', grupo: 'Brazo', nota: 'Palmas enfrentadas todo el recorrido. Trabaja el antebrazo además del bíceps.' },
  { nombre: 'Extensión de tríceps en polea', grupo: 'Brazo', nota: 'Codos pegados al costado y fijos. Solo se mueve el antebrazo; extiende hasta abajo del todo.' },
  { nombre: 'Press francés', grupo: 'Brazo', nota: 'Baja la barra hacia la frente con los codos apuntando arriba, sin abrirlos.' },
  { nombre: 'Fondos en banco', grupo: 'Brazo', nota: 'Manos en el borde del banco, baja hasta 90° en el codo. No encojas los hombros.' },

  // ---- Core ----
  { nombre: 'Plancha', grupo: 'Core', nota: 'Cuerpo en línea recta, abdomen y glúteo apretados. No subas la cadera ni dejes caer la espalda baja. Se mide en segundos.' },
  { nombre: 'Crunch abdominal', grupo: 'Core', nota: 'Sube con el abdomen, no jales el cuello con las manos. Exhala al subir.' },
  { nombre: 'Crunch en polea', grupo: 'Core', nota: 'De rodillas, baja llevando los codos hacia los muslos redondeando la espalda alta.' },
  { nombre: 'Elevación de piernas', grupo: 'Core', nota: 'Sube las piernas rectas sin balancearte y baja lento sin tocar el piso.' },
  { nombre: 'Russian twist', grupo: 'Core', nota: 'Torso inclinado atrás, gira de lado a lado con control llevando el peso al piso.' },

  // ---- Cardio ----
  { nombre: 'Caminadora', grupo: 'Cardio', nota: 'Ritmo constante que te permita respirar. Se mide en minutos, no en repeticiones.' },
  { nombre: 'Bicicleta estática', grupo: 'Cardio', nota: 'Ajusta el sillín a la altura de la cadera. Se mide en minutos.' },
  { nombre: 'Burpees', grupo: 'Cardio', nota: 'Baja a plancha, flexión, sube y salta. Si es muy exigente, quita el salto y la flexión.' },
]
