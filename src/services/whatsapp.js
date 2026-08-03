/* Links de WhatsApp con emojis que SIEMPRE se ven bien (skill Mensajes_Whatsapp):
   - emojis como escapes \u (el archivo queda ASCII puro)
   - encodeURIComponent una sola vez
   - desktop usa api.whatsapp.com/send (wa.me corrompe emojis en WhatsApp Web) */

export const esMovil = () =>
  typeof navigator !== 'undefined' && /android|iphone|ipad|ipod/i.test(navigator.userAgent || '')

/* Sin numero: WhatsApp abre el selector de contactos (ideal para "compartir"). */
export const abrirWhatsAppCompartir = (mensaje) => {
  const texto = encodeURIComponent(mensaje || '')
  const link = esMovil()
    ? `whatsapp://send?text=${texto}`
    : `https://api.whatsapp.com/send?text=${texto}`
  if (esMovil()) window.location.href = link
  else window.open(link, '_blank')
}

/* Mensaje de "trae un amigo": invita a entrenar en el gym del cliente. */
export const mensajeTraeAmigo = (nombreGym) =>
  `\u{1F4AA} ¡Hola! Estoy entrenando en *${nombreGym}* y está buenísimo.\n` +
  `¿Te animas a entrenar conmigo? \u{1F525} Entrenando en equipo rinde el doble \u{1F91D}`
