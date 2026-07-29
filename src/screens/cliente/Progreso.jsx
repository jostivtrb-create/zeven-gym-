import { useState } from 'react'

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
}

const demoSerie = { ejercicio: 'Press de banca', delta: '+8 kg en 3 meses', puntos: [42, 44, 45, 48, 50], meses: ['Mar', 'Abr', 'May', 'Jun', 'Jul'] }

function leer(clave, porDefecto) {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? porDefecto
  } catch {
    return porDefecto
  }
}

export default function Progreso() {
  const [medidas, setMedidas] = useState(() =>
    leer('zg-medidas', { peso: { v: 72.4, d: -1.8 }, cintura: { v: 78, d: -3 }, brazo: { v: 36, d: 1 } })
  )
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({ peso: '', cintura: '', brazo: '' })
  const racha = leer('zg-racha', { actual: 12, mejor: 18, entrenos: 14 })

  const { puntos, meses } = demoSerie
  const min = Math.min(...puntos)
  const max = Math.max(...puntos)
  const X = (i) => 24 + (i * 272) / (puntos.length - 1)
  const Y = (v) => 110 - ((v - min) / (max - min || 1)) * 65

  const guardarMedidas = () => {
    const nuevo = { ...medidas }
    for (const k of ['peso', 'cintura', 'brazo']) {
      const val = parseFloat(form[k])
      if (!Number.isNaN(val)) {
        nuevo[k] = { v: val, d: Math.round((val - medidas[k].v) * 10) / 10 }
      }
    }
    setMedidas(nuevo)
    localStorage.setItem('zg-medidas', JSON.stringify(nuevo))
    setEditando(false)
    setForm({ peso: '', cintura: '', brazo: '' })
  }

  const logros = [
    { nombre: 'Primera semana', logrado: true },
    { nombre: '10 entrenos', logrado: racha.entrenos >= 10 },
    { nombre: 'Constancia 30', logrado: racha.entrenos >= 30, meta: 30 },
  ]

  const fmt = (n) => String(n).replace('.', ',')

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>Mi progreso</div>
        <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, marginTop: 2 }}>Cada registro cuenta. ¡Sigue así!</div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ ...card, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: 99, background: 'color-mix(in oklab, var(--gym-color) 12%, white)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--gym-color)', lineHeight: 1 }}>{racha.actual}</div>
              <div style={{ fontSize: 8.5, fontWeight: 600, color: 'var(--gym-color)', letterSpacing: '.04em' }}>DÍAS</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>¡Racha encendida!</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                {racha.actual} días seguidos entrenando. Tu mejor racha: {racha.mejor}.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            {logros.map((l) => (
              <div
                key={l.nombre}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  background: l.logrado ? 'color-mix(in oklab, var(--gym-color) 8%, white)' : 'var(--surface-2)',
                  borderRadius: 'var(--radius)',
                  padding: '10px 4px',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 99,
                    background: l.logrado ? 'var(--gym-color)' : '#e4e4e0',
                    color: l.logrado ? '#fff' : '#a8a8a4',
                    fontSize: l.logrado ? 13 : 11,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                  }}
                >
                  {l.logrado ? '✓' : l.meta}
                </div>
                <div style={{ fontSize: 10, fontWeight: l.logrado ? 600 : 500, marginTop: 6, color: l.logrado ? 'inherit' : '#a8a8a4' }}>{l.nombre}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{demoSerie.ejercicio}</div>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--gym-color)', background: 'color-mix(in oklab, var(--gym-color) 10%, white)', borderRadius: 99, padding: '3px 9px' }}>
              {demoSerie.delta}
            </div>
          </div>
          <svg viewBox="0 0 320 130" style={{ width: '100%', marginTop: 10 }}>
            {[30, 70, 110].map((y) => (
              <line key={y} x1="16" y1={y} x2="312" y2={y} stroke="#f0f0ee" strokeWidth="1" />
            ))}
            <polyline
              points={puntos.map((v, i) => `${X(i)},${Y(v)}`).join(' ')}
              fill="none"
              stroke="var(--gym-color)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {puntos.map((v, i) => (
              <circle key={i} cx={X(i)} cy={Y(v)} r={i === puntos.length - 1 ? 5 : 3.5} fill="var(--gym-color)" stroke={i === puntos.length - 1 ? '#fff' : 'none'} strokeWidth="2" />
            ))}
            <text x={X(puntos.length - 1)} y={Y(puntos[puntos.length - 1]) - 12} textAnchor="middle" style={{ font: '600 11px Poppins,sans-serif' }} fill="var(--gym-color)">
              {puntos[puntos.length - 1]} kg
            </text>
            {meses.map((m, i) => (
              <text key={m} x={X(i)} y="126" textAnchor="middle" style={{ font: '10px Poppins,sans-serif' }} fill="#a8a8a4">
                {m}
              </text>
            ))}
          </svg>
        </div>

        <div style={{ ...card, padding: '6px 16px' }}>
          {[
            ['Peso corporal', medidas.peso, 'kg'],
            ['Cintura', medidas.cintura, 'cm'],
            ['Brazo', medidas.brazo, 'cm'],
          ].map(([nombre, m, unidad], i, arr) => (
            <div key={nombre} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid #f2f2f0' : 'none' }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{nombre}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {fmt(m.v)} {unidad}{' '}
                {m.d !== 0 && (
                  <span style={{ fontSize: 11, color: 'var(--gym-color)' }}>
                    {m.d < 0 ? '▼' : '▲'} {fmt(Math.abs(m.d))}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

        <div style={{ ...card, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>Fotos de progreso</div>
            <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>Privadas: solo tú las ves</div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            {['may', 'jun'].map((m) => (
              <div key={m} style={{ flex: 1, aspectRatio: '3/4', borderRadius: 'var(--radius)', background: 'repeating-linear-gradient(45deg,#eef2f0 0 8px,#e5eae7 8px 16px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8, font: '9px ui-monospace,monospace', color: '#8a938e' }}>
                {m}
              </div>
            ))}
            <button style={{ flex: 1, aspectRatio: '3/4', borderRadius: 'var(--radius)', border: '1.5px dashed #d6d6d2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#a8a8a4' }}>
              + Añadir
            </button>
          </div>
        </div>

        {editando ? (
          <div style={{ ...card, padding: 16 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>Medidas de hoy</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {[
                ['peso', 'Peso (kg)'],
                ['cintura', 'Cintura (cm)'],
                ['brazo', 'Brazo (cm)'],
              ].map(([k, label]) => (
                <div key={k} style={{ flex: 1 }}>
                  <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginBottom: 4 }}>{label}</div>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    placeholder={fmt(medidas[k].v)}
                    style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '9px 10px', fontSize: 13, fontWeight: 600, outline: 'none', background: 'var(--surface-2)' }}
                  />
                </div>
              ))}
            </div>
            <button onClick={guardarMedidas} style={{ marginTop: 12, width: '100%', background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius)', padding: '11px 0', fontSize: 13, fontWeight: 600 }}>
              Guardar medidas
            </button>
          </div>
        ) : (
          <button onClick={() => setEditando(true)} style={{ background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '13px 0', textAlign: 'center', fontSize: 13.5, fontWeight: 600 }}>
            Registrar medidas de hoy
          </button>
        )}
      </div>
    </>
  )
}
