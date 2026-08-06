import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGym } from '../../context/ThemeContext'
import { actualizarGymCampos } from '../../services/db'
import { CATEGORIAS, MAQUINAS, PRESETS } from '../../data/maquinas'

/* Inventario del gimnasio: qué equipos tiene y cuáles están en mantenimiento.
   Se configura una vez (eligiendo cómo es el gym) y luego se mantiene aquí.
   Al armar rutinas, el editor solo ofrece ejercicios que se puedan hacer. */

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }

export default function AdminMaquinas() {
  const navigate = useNavigate()
  const { gym, setGym } = useGym()
  const [inv, setInv] = useState(gym.maquinas ?? {})
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const temporizador = useRef(null)

  useEffect(() => setInv(gym.maquinas ?? {}), [gym.id])

  const configurado = Object.keys(inv).length > 0
  const total = Object.values(inv).filter((e) => e === 'ok').length
  const enMantenimiento = Object.values(inv).filter((e) => e === 'mantenimiento').length

  /* Se guarda solo, sin botón: se agrupan los toques seguidos para no
     escribir en Firebase en cada uno. */
  const guardar = (nuevo) => {
    setInv(nuevo)
    setGuardado(false)
    clearTimeout(temporizador.current)
    temporizador.current = setTimeout(async () => {
      setGuardando(true)
      try {
        await actualizarGymCampos(gym.id, { maquinas: nuevo })
        setGym({ ...gym, maquinas: nuevo })
        setGuardado(true)
        setTimeout(() => setGuardado(false), 2000)
      } catch (e) {
        console.warn('guardar máquinas:', e.code ?? e.message)
      } finally {
        setGuardando(false)
      }
    }, 700)
  }

  const alternar = (id) => {
    const nuevo = { ...inv }
    if (nuevo[id]) delete nuevo[id]
    else nuevo[id] = 'ok'
    guardar(nuevo)
  }

  const alternarMantenimiento = (id) => {
    guardar({ ...inv, [id]: inv[id] === 'mantenimiento' ? 'ok' : 'mantenimiento' })
  }

  const aplicarPreset = (preset) => {
    guardar(Object.fromEntries(preset.maquinas.map((id) => [id, 'ok'])))
  }

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <button onClick={() => navigate('/admin/mas')} style={{ color: 'rgba(255,255,255,.8)', fontSize: 12 }}>‹ Más</button>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600, marginTop: 6 }}>Mis máquinas</div>
        <div style={{ color: 'rgba(255,255,255,.78)', fontSize: 12, marginTop: 2 }}>
          {configurado
            ? `${total} equipos disponibles${enMantenimiento ? ` · ${enMantenimiento} en mantenimiento` : ''}`
            : 'Dinos qué tienes y armamos rutinas que sí puedas hacer'}
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {!configurado ? (
          /* Primera vez: en vez de marcar 50 cosas, elige cómo es su gym */
          <>
            <div style={{ fontSize: 14, fontWeight: 600 }}>¿Cómo es tu gimnasio?</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.55, marginTop: -8 }}>
              Elige el que más se parezca. Después ajustas lo que sobre o falte — nada queda fijo.
            </div>
            {PRESETS.map((p) => (
              <button key={p.id} onClick={() => aplicarPreset(p)} style={{ ...card, padding: 16, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{p.nombre}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{p.detalle}</div>
                  <div style={{ fontSize: 11, color: 'var(--gym-color)', fontWeight: 600, marginTop: 6 }}>{p.maquinas.length} equipos</div>
                </div>
                <span style={{ color: 'var(--text-4)', fontSize: 18 }}>›</span>
              </button>
            ))}
            <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6, marginTop: 4 }}>
              Mientras no configures esto, al armar rutinas te aparecen <b>todos</b> los ejercicios.
            </div>
          </>
        ) : (
          <>
            <div style={{ ...card, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.5 }}>
                Toca una máquina para marcar si la tienes. Toca 🔧 en las tuyas si está fuera de servicio.
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: guardado ? '#166534' : 'var(--text-4)', whiteSpace: 'nowrap' }}>
                {guardando ? 'Guardando…' : guardado ? '✓ Guardado' : ''}
              </span>
            </div>

            {CATEGORIAS.map((cat) => {
              const deCat = MAQUINAS.filter((m) => m.cat === cat.id)
              const tiene = deCat.filter((m) => inv[m.id]).length
              return (
                <div key={cat.id}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 13 }}>{cat.icono}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{cat.nombre}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 'auto' }}>{tiene} de {deCat.length}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {deCat.map((m) => {
                      const estado = inv[m.id]
                      const activa = estado === 'ok'
                      const mant = estado === 'mantenimiento'
                      return (
                        <div
                          key={m.id}
                          onClick={() => alternar(m.id)}
                          style={{
                            position: 'relative', cursor: 'pointer', padding: '12px 10px', borderRadius: 'var(--radius-md)',
                            background: activa ? 'color-mix(in oklab, var(--gym-color) 8%, white)' : mant ? 'var(--warning-bg)' : 'var(--surface)',
                            border: activa ? '1.5px solid var(--gym-color)' : mant ? '1.5px solid var(--warning-border)' : '1px solid var(--border)',
                            opacity: estado ? 1 : 0.75,
                          }}
                        >
                          <div style={{ fontSize: 20, textAlign: 'center', filter: estado ? 'none' : 'grayscale(1)', opacity: estado ? 1 : 0.5 }}>{cat.icono}</div>
                          <div style={{ fontSize: 11.5, fontWeight: estado ? 600 : 500, textAlign: 'center', marginTop: 6, lineHeight: 1.3, color: estado ? 'var(--text)' : 'var(--text-3)' }}>
                            {m.nombre}
                          </div>
                          {mant && <div style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--warning-text)', textAlign: 'center', marginTop: 3 }}>En mantenimiento</div>}
                          {estado && (
                            <button
                              onClick={(e) => { e.stopPropagation(); alternarMantenimiento(m.id) }}
                              aria-label={mant ? `Reactivar ${m.nombre}` : `Marcar ${m.nombre} en mantenimiento`}
                              style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 99, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: mant ? 'var(--warning-border)' : 'var(--surface-2)' }}
                            >
                              🔧
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6 }}>
              Al armar una rutina solo verás los ejercicios que se puedan hacer con esto.
            </div>
          </>
        )}
      </div>
    </>
  )
}
