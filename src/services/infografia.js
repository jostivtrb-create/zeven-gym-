/* Prompt para generar la infografía de un ejercicio con Gemini.
   Lo usa el SUPERADMIN (catálogo Zeven, sin color de gym) y también el admin
   si crea un ejercicio propio (con el color de su gimnasio). */

export function promptInfografia({ nombre, grupo, nota }, color = '#16a34a') {
  return `Crea una INFOGRAFÍA DE EJERCICIO DE GIMNASIO, ilustración digital vertical (formato 3:4), limpia y profesional, lista para usarse dentro de una app.

EJERCICIO: ${nombre}
GRUPO MUSCULAR: ${grupo}
${nota ? `TÉCNICA CORRECTA (úsala como base de los pasos y consejos): ${nota}` : 'Usa la técnica estándar correcta y segura de este ejercicio.'}

LA INFOGRAFÍA DEBE TENER:
1. Título grande arriba con el nombre "${nombre}" en tipografía moderna geométrica (estilo Poppins).
2. Una figura humana ilustrada en estilo flat moderno (sin rostro detallado, cuerpo atlético neutro) mostrando el ejercicio en 2 o 3 PASOS NUMERADOS: posición inicial → movimiento → posición final, con flechas limpias que indiquen la dirección del movimiento.
3. Los músculos que trabaja el ejercicio resaltados sobre la figura en el color ${color}.
4. Acentos y detalles en el color ${color} sobre FONDO BLANCO limpio.
5. Abajo, 2 o 3 consejos cortos de técnica en tono cercano y motivador (tuteo), derivados de la técnica descrita.
6. Todo el texto en ESPAÑOL, sin errores de ortografía, sin marcas de agua ni logos.

ESTILO GENERAL: minimalista, deportivo y profesional, con mucho aire blanco — como material oficial de una app premium de gimnasio. La imagen debe ser nítida y legible en la pantalla de un celular.`
}

export async function copiarPromptYAbrirGemini(datos, color) {
  const prompt = promptInfografia(datos, color)
  let copiado = false
  try {
    await navigator.clipboard.writeText(prompt)
    copiado = true
  } catch { /* si el portapapeles falla, igual se abre Gemini */ }
  window.open('https://gemini.google.com/app', '_blank')
  return copiado
}

/* Prompt para generar la PORTADA del gimnasio con Gemini: la imagen hero que
   los clientes ven arriba del Inicio (fondo oscuro premium con degradado).
   El admin adjunta su logo en Gemini como referencia y pega este prompt. */
export function promptPortadaGym({ nombre, color = '#16a34a' }) {
  return `Crea una FOTOGRAFÍA HORIZONTAL panorámica (formato 16:9) para la portada de la app de un gimnasio llamado "${nombre}". Te adjunto el LOGO del gimnasio: úsalo como referencia fiel (no lo deformes ni lo reinventes).

LA ESCENA:
- Interior de un gimnasio moderno y premium, con iluminación oscura y dramática (ambiente nocturno, fondo en tonos negros y grises profundos).
- Luces de neón y acentos de luz en el color ${color}, integrados en el ambiente (tiras LED en paredes o máquinas, reflejos sutiles).
- 3 a 5 personas atléticas y diversas (hombres y mujeres) entrenando o compartiendo con actitud positiva y sonriente, vestidas con ropa deportiva negra.
- El LOGO adjunto aparece de forma natural: grande y luminoso en la pared del fondo, y pequeño en las camisetas de las personas.

REQUISITOS TÉCNICOS:
- Estilo fotografía realista profesional, nítida, con profundidad de campo.
- La MITAD INFERIOR de la imagen debe ser más oscura y despejada (sin caras ni elementos importantes), porque la app pone texto blanco encima con un degradado.
- Sin ningún texto adicional, sin marcas de agua, sin otros logos: SOLO el logo adjunto.

Debe verse como la foto de portada oficial de una app premium de gimnasio.`
}

/* Prompt para la foto de la tarjeta "¡Trae un amigo!" del Inicio del cliente:
   dos amigos entrenando juntos con el logo del gym en la camiseta. El admin
   adjunta su logo en Gemini como referencia y pega este prompt. */
export function promptAmigoGym({ nombre, color = '#16a34a' }) {
  return `Crea una FOTOGRAFÍA HORIZONTAL (formato 16:9) para la tarjeta "¡Trae un amigo!" de la app del gimnasio "${nombre}". Te adjunto el LOGO del gimnasio: úsalo como referencia fiel (no lo deformes ni lo reinventes).

LA ESCENA:
- DOS AMIGOS atléticos entrenando juntos en un gimnasio moderno y oscuro: uno anima o apoya al otro (choque de puños, palmada en el hombro o ayudándolo a terminar una serie), con actitud alegre y motivadora, vistos de espaldas o de semi-perfil.
- Ambos visten camiseta deportiva negra con el LOGO adjunto estampado y visible (en la espalda o el pecho).
- Iluminación dramática nocturna con acentos de neón en el color ${color}; máquinas del gimnasio desenfocadas al fondo.
- Las personas ubicadas hacia la DERECHA de la imagen; el LADO IZQUIERDO debe quedar más oscuro y despejado, porque la app pone texto blanco encima.

REQUISITOS TÉCNICOS:
- Estilo fotografía realista profesional, nítida, con profundidad de campo.
- Sin ningún texto adicional, sin marcas de agua, sin otros logos: SOLO el logo adjunto en las camisetas.

Debe transmitir "entrenar acompañado motiva el doble", como material oficial de una app premium de gimnasio.`
}

export async function copiarPromptAmigoYAbrirGemini(gym) {
  const prompt = promptAmigoGym({ nombre: gym.nombre, color: gym.branding?.color })
  let copiado = false
  try {
    await navigator.clipboard.writeText(prompt)
    copiado = true
  } catch { /* si el portapapeles falla, igual se abre Gemini */ }
  window.open('https://gemini.google.com/app', '_blank')
  return copiado
}

export async function copiarPromptPortadaYAbrirGemini(gym) {
  const prompt = promptPortadaGym({ nombre: gym.nombre, color: gym.branding?.color })
  let copiado = false
  try {
    await navigator.clipboard.writeText(prompt)
    copiado = true
  } catch { /* si el portapapeles falla, igual se abre Gemini */ }
  window.open('https://gemini.google.com/app', '_blank')
  return copiado
}
