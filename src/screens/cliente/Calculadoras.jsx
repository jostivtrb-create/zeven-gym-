import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { listarProgreso, obtenerPerfil } from '../../services/db'
import { edadDesdeNacimiento } from '../../services/pesosSugeridos'

/* "Mis números": respuestas a las preguntas que la gente sí se hace, ya
   resueltas con lo que la app conoce del cliente. Nada de siglas ni de
   formularios en blanco: si falta un dato, se le pide UNO y se explica para qué. */

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16 }
const pregunta = { fontSize: 15, fontWeight: 700, lineHeight: 1.25 }
const explica = { fontSize: 11, color: 'var(--text-3)', lineHeight: 1.55, marginTop: 10 }

/* ---- Peso sano: barra visual en vez de la sigla "IMC" ---- */
const TRAMOS = [
  { hasta: 18.5, nombre: 'Bajo', color: '#60a5fa' },
  { hasta: 25, nombre: 'Sano', color: '#22c55e' },
  { hasta: 30, nombre: 'Algo alto', color: '#f59e0b' },
  { hasta: 99, nombre: 'Alto', color: '#ef4444' },
]
const tramoDe = (imc) => TRAMOS.find((t) => imc < t.hasta) ?? TRAMOS.at(-1)

function BarraPeso({ imc }) {
  // La barra cubre de 15 a 35: fuera de ahí el marcador se queda en el borde
  const pct = Math.max(2, Math.min(98, ((imc - 15) / 20) * 100))
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ position: 'relative', height: 10, borderRadius: 99, overflow: 'hidden', display: 'flex' }}>
        <div style={{ flex: 17.5, background: '#60a5fa' }} />
        <div style={{ flex: 32.5, background: '#22c55e' }} />
        <div style={{ flex: 25, background: '#f59e0b' }} />
        <div style={{ flex: 25, background: '#ef4444' }} />
      </div>
      <div style={{ position: 'relative', height: 14 }}>
        <div style={{ position: 'absolute', left: `${pct}%`, transform: 'translateX(-50%)', marginTop: -15 }}>
          <div style={{ width: 4, height: 20, borderRadius: 99, background: 'var(--text)', border: '2px solid var(--surface)', boxSizing: 'content-box' }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: 'var(--text-4)', marginTop: 2 }}>
        <span>Bajo</span><span>Sano</span><span>Algo alto</span><span>Alto</span>
      </div>
    </div>
  )
}

/* ---- Tarjeta para cuando falta un dato: se pide UNO y se dice para qué ---- */
function FaltaDato({ titulo, texto, boton, onBoton }) {
  return (
    <div style={card}>
      <div style={pregunta}>{titulo}</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.55 }}>{texto}</div>
      <button onClick={onBoton} style={{ marginTop: 12, background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius)', padding: '10px 18px', fontSize: 12.5, fontWeight: 600 }}>
        {boton}
      </button>
    </div>
  )
}

const ACTIVIDADES = [
  { id: 'poco', etiqueta: 'Me muevo poco', factor: 1.2 },
  { id: 'normal', etiqueta: 'Normal', factor: 1.375 },
  { id: 'mucho', etiqueta: 'Muy activo', factor: 1.55 },
]
const DESDE_PERFIL = { nunca: 'poco', aveces: 'normal', regular: 'mucho' }
const miles = (n) => Math.round(n / 10) * 10

export default function Calculadoras() {
  const navigate = useNavigate()
  const { perfil } = useAuth()
  const [datos, setDatos] = useState(null) // { peso, estatura, edad, genero }
  const [actividad, setActividad] = useState('normal')
  const [fuerza, setFuerza] = useState({ peso: '', reps: '' })

  useEffect(() => {
    if (!perfil?.uid) return
    Promise.all([obtenerPerfil(perfil.uid), listarProgreso(perfil.uid).catch(() => [])]).then(([p, prog]) => {
      const medidas = prog.filter((r) => r.tipo === 'medidas' && r.peso != null)
      setDatos({
        peso: medidas.at(-1)?.peso ?? null,
        estatura: p?.estatura ?? null,
        edad: edadDesdeNacimiento(p?.nacimiento),
        genero: p?.genero ?? null,
      })
      if (p?.actividad) setActividad(DESDE_PERFIL[p.actividad] ?? 'normal')
    })
  }, [perfil?.uid])

  if (!datos) {
    return (
      <>
        <Cabecera />
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 12.5 }}>Cargando tus números…</div>
      </>
    )
  }

  const { peso, estatura, edad, genero } = datos
  const imc = peso && estatura ? peso / (estatura * estatura) : null
  const tramo = imc ? tramoDe(imc) : null

  /* Calorías (Mifflin-St Jeor). Con el género del perfil el número es el
     correcto; sin él se usa el promedio entre hombre y mujer. */
  const ajusteGenero = genero === 'hombre' ? 5 : genero === 'mujer' ? -161 : -78
  const tmb = peso && estatura && edad ? 10 * peso + 6.25 * (estatura * 100) - 5 * edad + ajusteGenero : null
  const factor = ACTIVIDADES.find((a) => a.id === actividad)?.factor ?? 1.375
  const mantener = tmb ? miles(tmb * factor) : null
  // Nunca por debajo de lo que el cuerpo gasta en reposo
  const bajar = mantener ? Math.max(miles(tmb), miles(mantener * 0.85)) : null
  const subir = mantener ? miles(mantener * 1.15) : null

  const tope = fuerza.peso && fuerza.reps ? Math.round(Number(fuerza.peso) * (1 + Number(fuerza.reps) / 30)) : null

  return (
    <>
      <Cabecera />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* ===== 1. ¿Estoy en un peso sano? ===== */}
        {imc ? (
          <div style={card}>
            <div style={pregunta}>¿Estoy en un peso sano?</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: tramo.color }}>{tramo.nombre}</span>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {String(peso).replace('.', ',')} kg · {String(estatura).replace('.', ',')} m
              </span>
            </div>
            <BarraPeso imc={imc} />
            <div style={explica}>
              Se saca de tu peso y tu estatura. <b>Ojo:</b> no distingue músculo de grasa, así que si entrenas fuerte
              puede salirte alto sin que sea un problema. Tómalo como una guía, no como un diagnóstico.
            </div>
          </div>
        ) : (
          <FaltaDato
            titulo="¿Estoy en un peso sano?"
            texto={!peso
              ? 'Necesitamos tu peso. Regístralo en Progreso y aquí te decimos cómo vas.'
              : 'Nos falta tu estatura. Ponla en tu perfil y aquí te decimos cómo vas.'}
            boton={!peso ? 'Registrar mi peso' : 'Poner mi estatura'}
            onBoton={() => navigate(!peso ? '/app/progreso' : '/app/perfil')}
          />
        )}

        {/* ===== 2. ¿Cuánto debería comer? ===== */}
        {mantener ? (
          <div style={card}>
            <div style={pregunta}>¿Cuánto debería comer al día?</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 6 }}>Depende de lo que busques:</div>

            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Para bajar de peso', bajar, '🔻'],
                ['Para mantenerte igual', mantener, '⚖️'],
                ['Para ganar músculo', subir, '🔺'],
              ].map(([texto, valor, icono]) => (
                <div key={texto} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
                  <span style={{ fontSize: 14 }}>{icono}</span>
                  <span style={{ flex: 1, fontSize: 12.5, color: 'var(--text-2)' }}>{texto}</span>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{valor.toLocaleString('es-CO')}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>cal</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 12, marginBottom: 6 }}>Fuera del gym, ¿qué tanto te mueves?</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {ACTIVIDADES.map((a) => (
                <button key={a.id} onClick={() => setActividad(a.id)}
                  style={{ flex: 1, borderRadius: 'var(--radius-sm)', padding: '9px 4px', fontSize: 10.5, fontWeight: 600, lineHeight: 1.25, background: actividad === a.id ? 'var(--gym-color)' : 'var(--surface-2)', color: actividad === a.id ? '#fff' : 'var(--text-2)', border: actividad === a.id ? 'none' : '1px solid var(--border)' }}>
                  {a.etiqueta}
                </button>
              ))}
            </div>

            <div style={explica}>
              Son las calorías que tu cuerpo gasta en un día. Comer por debajo hace bajar de peso y por encima
              ayuda a ganar músculo{!genero ? '. Pon tu género en el perfil para afinar el número.' : '.'}
            </div>
          </div>
        ) : (
          <FaltaDato
            titulo="¿Cuánto debería comer al día?"
            texto="Con tu peso, estatura y edad te decimos cuánto comer para bajar, mantenerte o ganar músculo."
            boton="Completar mis datos"
            onBoton={() => navigate(!peso ? '/app/progreso' : '/app/perfil')}
          />
        )}

        {/* ===== 3. ¿Cuánto es lo máximo que puedo levantar? ===== */}
        <div style={card}>
          <div style={pregunta}>¿Cuánto es lo máximo que puedo levantar?</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.55 }}>
            Piensa en un ejercicio y cuéntanos tu última serie:
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {[
              ['peso', '¿Cuánto peso usaste?', '40', 'kg'],
              ['reps', '¿Cuántas veces seguidas?', '10', 'veces'],
            ].map(([k, label, ph, unidad]) => (
              <div key={k} style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '9px 12px' }}>
                <div style={{ fontSize: 9.5, color: 'var(--text-3)', lineHeight: 1.3 }}>{label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <input type="number" inputMode="decimal" value={fuerza[k]} onChange={(e) => setFuerza({ ...fuerza, [k]: e.target.value })} placeholder={ph}
                    style={{ width: '100%', minWidth: 0, border: 'none', background: 'transparent', fontSize: 14, fontWeight: 700, outline: 'none', padding: 0, color: 'var(--text)' }} />
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{unidad}</span>
                </div>
              </div>
            ))}
          </div>

          {tope != null && (
            <div style={{ marginTop: 12, background: 'color-mix(in oklab, var(--gym-color) 9%, var(--mix-base))', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Tu tope sería aproximadamente</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--gym-color-text)', lineHeight: 1.2 }}>{tope} kg</div>
              <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 6, lineHeight: 1.5 }}>
                ⚠️ Es un cálculo, no un reto. <b>No intentes levantarlo</b> para comprobarlo: así es como la gente se lesiona.
              </div>
            </div>
          )}

          <div style={explica}>
            Sirve para medirte: si el otro mes tu tope era menor, estás más fuerte aunque la balanza no se mueva.
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6, padding: '4px 8px 0' }}>
          Estos números son orientativos. Tu entrenador en el gym siempre manda.
        </div>
      </div>
    </>
  )
}

function Cabecera() {
  return (
    <header style={{ background: 'var(--gym-color)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
      <div style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>Mis números</div>
      <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, marginTop: 2 }}>Lo que dicen tu peso y tu fuerza</div>
    </header>
  )
}
