/* Recordatorios automáticos de Zeven Gym.
   Corre todos los días a las 9:00 am (hora de Bogotá) y avisa por notificación
   push a los clientes cuyo plan vence MAÑANA. Tono amable, nunca invasivo. */

const { onSchedule } = require('firebase-functions/v2/scheduler')
const { logger } = require('firebase-functions')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore, Timestamp } = require('firebase-admin/firestore')
const { getMessaging } = require('firebase-admin/messaging')

initializeApp()
const db = getFirestore()

/* Rango [inicio, fin] del día de mañana en hora de Bogotá (UTC-5). */
function mananaEnBogota() {
  const bogota = new Date(Date.now() - 5 * 3600 * 1000)
  const inicio = new Date(Date.UTC(bogota.getUTCFullYear(), bogota.getUTCMonth(), bogota.getUTCDate() + 1, 5, 0, 0))
  const fin = new Date(inicio.getTime() + 24 * 3600 * 1000 - 1)
  return { inicio, fin }
}

async function avisar(uid, gym) {
  const snap = await db.collection('usuarios').doc(uid).collection('tokens').get()
  const tokens = snap.docs.map((d) => d.id)
  if (!tokens.length) return 0

  const res = await getMessaging().sendEachForMulticast({
    notification: {
      title: gym.nombre ?? 'Tu gimnasio',
      body: 'Tu plan vence mañana. Renuévalo en recepción y sigue sin pausas 💪',
    },
    webpush: {
      notification: {
        icon: gym.branding?.logoUrl ?? '/iconos/icono-192.png',
        badge: '/iconos/icono-192.png',
      },
      fcmOptions: { link: '/app/perfil' },
    },
    tokens,
  })

  // Limpia los tokens muertos (app desinstalada, permiso revocado…)
  await Promise.all(
    res.responses.map((r, i) => {
      const codigo = r.error?.code
      const muerto = codigo === 'messaging/registration-token-not-registered' || codigo === 'messaging/invalid-argument'
      return muerto ? db.collection('usuarios').doc(uid).collection('tokens').doc(tokens[i]).delete().catch(() => {}) : null
    })
  )
  return res.successCount
}

exports.recordatoriosDiarios = onSchedule(
  { schedule: '0 9 * * *', timeZone: 'America/Bogota', region: 'us-central1' },
  async () => {
    const { inicio, fin } = mananaEnBogota()
    const gimnasios = await db.collection('gimnasios').get()
    let avisados = 0

    for (const gymDoc of gimnasios.docs) {
      const gym = gymDoc.data()
      // Un gimnasio suspendido no le escribe a sus clientes
      if (gym.suscripcion?.estado === 'suspendido') continue

      const porVencer = await gymDoc.ref
        .collection('membresias')
        .where('vence', '>=', Timestamp.fromDate(inicio))
        .where('vence', '<=', Timestamp.fromDate(fin))
        .get()

      for (const m of porVencer.docs) {
        if (m.data().estado === 'congelada') continue
        avisados += await avisar(m.id, gym)
      }
    }

    logger.info(`Recordatorios enviados: ${avisados}`)
  }
)
