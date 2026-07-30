import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGym } from '../../context/ThemeContext'
import { listarRutinas, guardarRutina } from '../../services/db'
import { PLANTILLAS_ZEVEN } from '../../data/plantillas'

const NIVELES = {
  Principiante: { color: 'var(--gym-color)', bg: 'color-mix(in oklab, var(--gym-color) 10%, white)' },
  Intermedio: { color: '#92400e', bg: '#fef3c7' },
  Avanzado: { color: '#b91c1c', bg: '#fee2e2' },
}

export default function AdminRutinas() {
  const navigate = useNavigate()
  const { gym } = useGym()
  const [pestana, setPestana] = useState('plantillas')
  const [rutinas, setRutinas] = useState(null)
  const [ocupado, setOcupado] = useState('')

  useEffect(() => {
    if (gym.id) listarRutinas(gym.id).then(setRutinas).catch(() => setRutinas([]))
  }, [gym.id])

  const usarPlantilla = async (p) => {
    setOcupado(p.nombre)
    try {
      const id = await guardarRutina(gym.id, { nombre: p.nombre, nivel: p.nivel, dias: p.dias, origen: 'plantilla' })
      navigate(`/admin/rutinas/editor/${id}`)
    } finally {
      setOcupado('')
    }
  }

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 16px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>Rutinas</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={() => setPestana('plantillas')} style={{ background: pestana === 'plantillas' ? '#fff' : 'rgba(255,255,255,.16)', color: pestana === 'plantillas' ? 'var(--gym-color)' : '#fff', borderRadius: 99, padding: '7px 14px', fontSize: 11.5, fontWeight: pestana === 'plantillas' ? 600 : 500 }}>
            Plantillas Zeven
          </button>
          <button onClick={() => setPestana('propias')} style={{ background: pestana === 'propias' ? '#fff' : 'rgba(255,255,255,.16)', color: pestana === 'propias' ? 'var(--gym-color)' : '#fff', borderRadius: 99, padding: '7px 14px', fontSize: 11.5, fontWeight: pestana === 'propias' ? 600 : 500 }}>
            Mis rutinas · {rutinas?.length ?? '…'}
          </button>
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pestana === 'plantillas' ? (
          <>
            {PLANTILLAS_ZEVEN.map((p) => {
              const nivel = NIVELES[p.nivel]
              return (
                <div key={p.nombre} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.nombre.split(' — ')[0]}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{p.detalle}</div>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: nivel.color, background: nivel.bg, borderRadius: 99, padding: '3px 9px' }}>{p.nivel}</div>
                  </div>
                  <button onClick={() => usarPlantilla(p)} disabled={!!ocupado} style={{ marginTop: 12, width: '100%', background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '9px 0', textAlign: 'center', fontSize: 12, fontWeight: 600, opacity: ocupado === p.nombre ? 0.6 : 1 }}>
                    {ocupado === p.nombre ? 'Creando copia…' : 'Usar plantilla'}
                  </button>
                </div>
              )
            })}
            <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6 }}>
              Al usar una plantilla se crea una copia editable en "Mis rutinas". Asígnala a cada cliente desde su ficha.
            </div>
          </>
        ) : (
          <>
            {rutinas === null && <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-3)', fontSize: 12.5 }}>Cargando rutinas…</div>}
            {rutinas !== null && rutinas.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-2)', fontSize: 12.5, lineHeight: 1.6 }}>
                Aún no tienes rutinas. Usa una plantilla Zeven o crea una desde cero.
              </div>
            )}
            {(rutinas ?? []).map((r) => (
              <button key={r.id} onClick={() => navigate(`/admin/rutinas/editor/${r.id}`)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.nombre}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
                    {Object.values(r.dias ?? {}).filter(Boolean).length} días/semana{r.origen === 'plantilla' ? ' · de plantilla' : ''}
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gym-color)' }}>Editar</span>
              </button>
            ))}
          </>
        )}
        <button onClick={() => navigate('/admin/rutinas/editor/nueva')} style={{ border: '1.5px dashed #c9c9c5', borderRadius: 'var(--radius-md)', padding: '13px 0', textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--text-3)', background: 'transparent' }}>
          + Crear rutina desde cero
        </button>
      </div>
    </>
  )
}
