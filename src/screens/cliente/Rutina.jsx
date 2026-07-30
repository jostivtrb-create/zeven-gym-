import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGym } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { obtenerRutina, obtenerMembresia, listarProgreso, guardarSesionHoy } from '../../services/db'

const DIAS = [
  { key: 'lun', letra: 'L' }, { key: 'mar', letra: 'M' }, { key: 'mie', letra: 'X' },
  { key: 'jue', letra: 'J' }, { key: 'vie', letra: 'V' }, { key: 'sab', letra: 'S' }, { key: 'dom', letra: 'D' },
]
const DIA_MS = 86400000
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function semanaActual() {
  const hoy = new Date()
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7))
  return DIAS.map((d, i) => {
    const f = new Date(lunes)
    f.setDate(lunes.getDate() + i)
    return { ...d, num: f.getDate(), esHoy: f.toDateString() === hoy.toDateString() }
  })
}

export default function Rutina() {
  const { gym } = useGym()
  const { perfil } = useAuth()
  const navigate = useNavigate()
  const semana = useMemo(semanaActual, [])
  const hoyKey = semana.find((d) => d.esHoy)?.key ?? 'lun'
  const [diaSel, setDiaSel] = useState(hoyKey)
  const [rutina, setRutina] = useState(undefined) // undefined=cargando, null=sin rutina
  const [sesionHoy, setSesionHoy] = useState({})
  const [ultimosPesos, setUltimosPesos] = useState({})
  const [membresia, setMembresia] = useState(null)
  const [pesoInput, setPesoInput] = useState('')
  const [activo, setActivo] = useState(null)

  useEffect(() => {
    if (!gym.id || !perfil?.uid) return
    if (perfil.rutinaId) {
      obtenerRutina(gym.id, perfil.rutinaId).then((r) => setRutina(r ?? null))
    } else {
      setRutina(null)
    }
    obtenerMembresia(gym.id, perfil.uid).then(setMembresia)
    listarProgreso(perfil.uid).then((prog) => {
      const hoyISO = new Date().toISOString().slice(0, 10)
      const sesiones = prog.filter((p) => p.tipo === 'sesion')
      const deHoy = sesiones.find((p) => p.fecha === hoyISO)
      setSesionHoy(deHoy?.ejercicios ?? {})
      const pesos = {}
      for (const s of sesiones) {
        for (const [ejId, dato] of Object.entries(s.ejercicios ?? {})) {
          if (dato?.peso != null) pesos[ejId] = dato.peso
        }
      }
      setUltimosPesos(pesos)
    }).catch(() => {})
  }, [gym.id, perfil?.uid, perfil?.rutinaId])

  const sesion = rutina?.dias?.[diaSel]
  const esHoy = diaSel === hoyKey

  const vence = membresia?.vence?.toDate?.()
  const vencida = vence && vence < new Date(new Date().toDateString())
  const bloqueada = vencida && gym.politicas?.bloquearAlVencer

  const completar = async (ej, conPeso) => {
    const dato = { hecho: true, ...(conPeso && pesoInput ? { peso: Number(pesoInput) } : {}) }
    const nuevos = { ...sesionHoy, [ej.id]: dato }
    setSesionHoy(nuevos)
    setActivo(null)
    setPesoInput('')
    if (dato.peso != null) setUltimosPesos({ ...ultimosPesos, [ej.id]: dato.peso })
    try {
      await guardarSesionHoy(perfil.uid, { ejercicios: nuevos, dia: diaSel, titulo: sesion?.titulo ?? '' })
    } catch (e) {
      console.warn('guardarSesionHoy:', e.code ?? e.message)
    }
  }

  const hechos = sesion && esHoy ? sesion.ejercicios.filter((e) => sesionHoy[e.id]?.hecho).length : 0
  const total = sesion ? sesion.ejercicios.length : 0
  const rango = `Semana del ${semana[0].num} ${MESES[new Date().getMonth()]}`

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>Mi rutina</div>
        <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, marginTop: 2 }}>{rango}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {semana.map((d) => {
            const sel = d.key === diaSel
            const sinSesion = !rutina?.dias?.[d.key]
            return (
              <button key={d.key} onClick={() => setDiaSel(d.key)} style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 'var(--radius)', background: sel ? '#fff' : `rgba(255,255,255,${sinSesion ? '.10' : '.16'})`, color: sel ? 'var(--gym-color)' : sinSesion ? 'rgba(255,255,255,.6)' : '#fff' }}>
                <div style={{ fontSize: 10, fontWeight: sel ? 600 : 400, opacity: sel ? 1 : 0.8 }}>{d.letra}</div>
                <div style={{ fontSize: 13, fontWeight: sel ? 700 : 600 }}>{d.num}</div>
              </button>
            )
          })}
        </div>
      </header>

      {rutina === undefined && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 12.5 }}>Cargando tu rutina…</div>}

      {rutina === null && (
        <div style={{ margin: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Aún no tienes rutina asignada</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.6 }}>
            Pídesela a tu entrenador en {gym.nombre} — apenas te la asignen aparecerá aquí, lista para entrenar. 💪
          </div>
        </div>
      )}

      {rutina && (
        <>
          {sesion ? (
            <div style={{ margin: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  {esHoy ? 'Hoy · ' : ''}{sesion.titulo}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{total} ejercicios · ~{total * 8} min</div>
              </div>
              {esHoy && (
                <>
                  <div style={{ marginTop: 12, height: 8, borderRadius: 99, background: '#f0f0ee', overflow: 'hidden' }}>
                    <div style={{ width: `${total ? (hechos / total) * 100 : 0}%`, height: '100%', borderRadius: 99, background: 'var(--gym-color)', transition: 'width .3s' }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 8 }}>
                    {hechos === total && total > 0 ? '¡Sesión completa! Eres imparable 🔥' : `${hechos} de ${total} completados. ¡Quedan ${total - hechos}, tú puedes!`}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ margin: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Día de descanso</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>Recupérate bien: el descanso también es entreno.</div>
            </div>
          )}

          <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
            {sesion?.ejercicios.map((ej) => {
              const hecho = esHoy && !!sesionHoy[ej.id]?.hecho
              const abierto = activo === ej.id
              const pesoHoy = esHoy ? sesionHoy[ej.id]?.peso : null
              const ultimo = ultimosPesos[ej.id]
              return (
                <div
                  key={ej.id}
                  onClick={() => esHoy && !hecho && !bloqueada && setActivo(abierto ? null : ej.id)}
                  style={{
                    background: hecho ? 'color-mix(in oklab, var(--gym-color) 8%, white)' : 'var(--surface)',
                    border: abierto ? '1.5px solid var(--gym-color)' : hecho ? '1px solid color-mix(in oklab, var(--gym-color) 25%, white)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 12,
                    cursor: esHoy && !hecho ? 'pointer' : 'default',
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div
                      onClick={(e) => {
                        if (ej.imagenUrl) {
                          e.stopPropagation()
                          window.open(ej.imagenUrl, '_blank')
                        }
                      }}
                      style={{ width: 54, height: 54, borderRadius: 'var(--radius)', flex: 'none', background: ej.imagenUrl ? `center/cover url(${ej.imagenUrl})` : 'color-mix(in oklab, var(--gym-color) 8%, white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: ej.imagenUrl ? 'zoom-in' : 'default' }}
                    >
                      {!ej.imagenUrl && '💪'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{ej.nombre}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 2 }}>
                        {ej.series} × {ej.reps} · {ej.descansoSeg ?? ej.descanso} s descanso
                      </div>
                      {ej.nota && <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 3, lineHeight: 1.4 }}>💡 {ej.nota}</div>}
                      {hecho && pesoHoy != null && (
                        <div style={{ display: 'inline-block', fontSize: 10.5, fontWeight: 600, color: 'var(--gym-color)', background: '#fff', borderRadius: 99, padding: '2px 8px', marginTop: 6 }}>
                          Hoy: {pesoHoy} kg
                        </div>
                      )}
                      {!hecho && ultimo != null && <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 4 }}>Última vez: {ultimo} kg</div>}
                    </div>
                    {hecho ? (
                      <div style={{ width: 26, height: 26, flex: 'none', borderRadius: 99, background: 'var(--gym-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</div>
                    ) : (
                      <div style={{ width: 26, height: 26, flex: 'none', borderRadius: 99, border: '2px solid #d6d6d2' }} />
                    )}
                  </div>
                  {abierto && !hecho && esHoy && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px 12px' }}>
                        <input type="number" inputMode="decimal" value={pesoInput} onChange={(e) => setPesoInput(e.target.value)} placeholder={ultimo != null ? String(ultimo) : '0'} style={{ width: 48, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, outline: 'none' }} />
                        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>kg de hoy</span>
                      </div>
                      <button onClick={() => completar(ej, true)} style={{ background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '9px 16px', fontSize: 12, fontWeight: 600 }}>
                        Guardar y completar
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {bloqueada && sesion && (
              <div style={{ position: 'absolute', inset: '-6px -4px', borderRadius: 18, background: 'rgba(250,250,249,.82)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 40 }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, margin: '0 24px', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>Tu rutina está en pausa</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.5 }}>
                    Tu plan venció. Renueva en recepción y volvemos al entreno. Tu progreso y tu racha te esperan intactos.
                  </div>
                  <button onClick={() => navigate('/app/perfil')} style={{ marginTop: 14, width: '100%', background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius)', padding: '10px 0', fontSize: 13, fontWeight: 600 }}>
                    Ver mi membresía
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
