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
