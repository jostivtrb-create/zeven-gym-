import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { demoRutinasGym } from '../../data/demoAdmin'

const NIVELES = {
  Principiante: { color: 'var(--gym-color)', bg: 'color-mix(in oklab, var(--gym-color) 10%, white)' },
  Intermedio: { color: '#92400e', bg: '#fef3c7' },
  Avanzado: { color: '#b91c1c', bg: '#fee2e2' },
}

const PLANTILLAS = [
  { id: 't1', nombre: 'Full body', detalle: '3 días/semana · 8 ejercicios por día', nivel: 'Principiante' },
  { id: 't2', nombre: 'Fuerza', detalle: '4 días/semana · empuje, tirón, pierna', nivel: 'Intermedio' },
  { id: 't3', nombre: 'Hipertrofia', detalle: '5 días/semana · por grupo muscular', nivel: 'Avanzado' },
  { id: 't4', nombre: 'Cardio y core', detalle: '3 días/semana · resistencia y abdomen', nivel: 'Principiante' },
]

export default function AdminRutinas() {
  const navigate = useNavigate()
  const [pestana, setPestana] = useState('plantillas')

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 16px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>Rutinas</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            onClick={() => setPestana('plantillas')}
            style={{ background: pestana === 'plantillas' ? '#fff' : 'rgba(255,255,255,.16)', color: pestana === 'plantillas' ? 'var(--gym-color)' : '#fff', borderRadius: 99, padding: '7px 14px', fontSize: 11.5, fontWeight: pestana === 'plantillas' ? 600 : 500 }}
          >
            Plantillas Zeven
          </button>
          <button
            onClick={() => setPestana('propias')}
            style={{ background: pestana === 'propias' ? '#fff' : 'rgba(255,255,255,.16)', color: pestana === 'propias' ? 'var(--gym-color)' : '#fff', borderRadius: 99, padding: '7px 14px', fontSize: 11.5, fontWeight: pestana === 'propias' ? 600 : 500 }}
          >
            Mis rutinas · {demoRutinasGym.length}
          </button>
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pestana === 'plantillas' ? (
          <>
            {PLANTILLAS.map((p) => {
              const nivel = NIVELES[p.nivel]
              return (
                <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.nombre}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{p.detalle}</div>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: nivel.color, background: nivel.bg, borderRadius: 99, padding: '3px 9px' }}>{p.nivel}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={() => navigate('/admin/rutinas/editor')} style={{ flex: 1, background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '9px 0', textAlign: 'center', fontSize: 12, fontWeight: 600 }}>
                      Usar plantilla
                    </button>
                    <button onClick={() => navigate('/admin/rutinas/editor')} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '9px 0', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#565652' }}>
                      Ver ejercicios
                    </button>
                  </div>
                </div>
              )
            })}
            <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6 }}>
              Al usar una plantilla se crea una copia editable en "Mis rutinas". Asígnala a un cliente o a todo un nivel.
            </div>
          </>
        ) : (
          <>
            {demoRutinasGym.map((r) => (
              <button key={r.id} onClick={() => navigate('/admin/rutinas/editor')} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.nombre}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
                    {r.dias} días/semana · {r.asignados} asignados · {r.origen === 'plantilla' ? 'de plantilla' : 'propia'}
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gym-color)' }}>Editar</span>
              </button>
            ))}
          </>
        )}
        <button onClick={() => navigate('/admin/rutinas/editor')} style={{ border: '1.5px dashed #c9c9c5', borderRadius: 'var(--radius-md)', padding: '13px 0', textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--text-3)', background: 'transparent' }}>
          + Crear rutina desde cero
        </button>
      </div>
    </>
  )
}
