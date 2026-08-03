/* Manifest dinámico: cada gimnasio instala la PWA con SU nombre, SU logo y SU color.
   Se sirve como /api/manifest?g=CODIGO (la colección gimnasios es de lectura pública). */

const PROYECTO = 'zeven-gym'
const API_KEY = 'AIzaSyAHO5sEN5vVIVkFDD4Da0vl3wN4Nw6cUTA'

const POR_DEFECTO = {
  name: 'Zeven Gym',
  short_name: 'Zeven Gym',
  description: 'La app de tu gimnasio: rutinas, progreso y membresía.',
  theme_color: '#16a34a',
  icons: [
    { src: '/iconos/icono-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/iconos/icono-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/iconos/icono-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}

async function buscarGym(codigo) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROYECTO}/databases/(default)/documents:runQuery?key=${API_KEY}`
  const cuerpo = {
    structuredQuery: {
      from: [{ collectionId: 'gimnasios' }],
      where: { fieldFilter: { field: { fieldPath: 'codigo' }, op: 'EQUAL', value: { stringValue: codigo.toUpperCase() } } },
      limit: 1,
    },
  }
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) })
  if (!r.ok) return null
  const datos = await r.json()
  const doc = datos.find?.((d) => d.document)?.document
  if (!doc) return null
  const f = doc.fields ?? {}
  const branding = f.branding?.mapValue?.fields ?? {}
  return {
    nombre: f.nombre?.stringValue ?? null,
    codigo: f.codigo?.stringValue ?? null,
    color: branding.color?.stringValue ?? null,
    logoUrl: branding.logoUrl?.stringValue ?? null,
  }
}

export default async function handler(req, res) {
  const codigo = (req.query?.g ?? '').toString().trim()
  let manifest = { ...POR_DEFECTO, id: '/', start_url: '/', scope: '/' }

  if (codigo) {
    try {
      const gym = await buscarGym(codigo)
      if (gym?.nombre) {
        manifest = {
          // id propio por gimnasio: cada gym es una app distinta en el celular
          id: `/?gym=${gym.codigo}`,
          name: gym.nombre,
          short_name: gym.nombre.length > 12 ? gym.nombre.slice(0, 12) : gym.nombre,
          description: `La app de ${gym.nombre}. Tu rutina, tu progreso y tu membresía.`,
          theme_color: gym.color ?? POR_DEFECTO.theme_color,
          start_url: '/',
          scope: '/',
          icons: gym.logoUrl
            ? [
                { src: gym.logoUrl, sizes: '192x192', type: 'image/png' },
                { src: gym.logoUrl, sizes: '512x512', type: 'image/png' },
                { src: gym.logoUrl, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
              ]
            : POR_DEFECTO.icons,
        }
      }
    } catch {
      /* si falla, se entrega el manifest de Zeven */
    }
  }

  const completo = {
    ...manifest,
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fafaf9',
    lang: 'es',
  }

  res.setHeader('content-type', 'application/manifest+json; charset=utf-8')
  res.setHeader('cache-control', 'public, max-age=300, s-maxage=300')
  res.status(200).send(JSON.stringify(completo))
}
