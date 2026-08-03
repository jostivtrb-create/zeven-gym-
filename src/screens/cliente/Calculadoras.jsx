import { useState } from 'react'

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16 }
const campo = { flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '9px 12px' }
const inputStyle = { width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, outline: 'none', padding: 0 }
const botonCalc = { background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '0 16px', fontSize: 12, fontWeight: 600 }
const resultado = { marginTop: 12, background: 'color-mix(in oklab, var(--gym-color) 9%, var(--mix-base))', borderRadius: 'var(--radius)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 14 }

function Campo({ label, value, onChange, placeholder }) {
  return (
    <div style={campo}>
      <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{label}</div>
      <input type="number" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
  )
}

function Resultado({ valor, unidad, texto }) {
  return (
    <div style={resultado}>
      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--gym-color)', whiteSpace: 'nowrap' }}>
        {valor} {unidad && <span style={{ fontSize: 12 }}>{unidad}</span>}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{texto}</div>
    </div>
  )
}

export default function Calculadoras() {
  const [imc, setImc] = useState({ peso: '', estatura: '', resultado: null })
  const [cal, setCal] = useState({ edad: '', peso: '', estatura: '', actividad: 'moderada', resultado: null })
  const [rm, setRm] = useState({ peso: '', reps: '', resultado: null })

  const calcularImc = () => {
    const p = parseFloat(imc.peso)
    const e = parseFloat(imc.estatura)
    if (!p || !e) return
    setImc({ ...imc, resultado: Math.round(p / (e * e)) })
  }

  const textoImc = (v) => {
    if (v < 18.5) return 'Estás por debajo del rango ideal (18,5–25). Con buena alimentación y tu rutina vas a subir con fuerza.'
    if (v <= 25) return '¡Estás en el rango ideal (18,5–25)! Sigue así, tu constancia se nota.'
    if (v <= 28) return 'Estás apenas un pasito arriba del rango ideal (18,5–25). Con tu rutina de esta semana vas por muy buen camino.'
    return 'Estás por encima del rango ideal (18,5–25), pero cada entreno te acerca. ¡Vamos con toda!'
  }

  const FACTORES = { ligera: 1.375, moderada: 1.55, intensa: 1.725 }

  const calcularCal = () => {
    const { edad, peso, estatura, actividad } = cal
    const e = parseFloat(edad)
    const p = parseFloat(peso)
    const t = parseFloat(estatura)
    if (!e || !p || !t) return
    const tmb = 10 * p + 6.25 * (t * 100) - 5 * e - 78 // promedio Mifflin-St Jeor
    setCal({ ...cal, resultado: Math.round((tmb * FACTORES[actividad]) / 10) * 10 })
  }

  const calcularRm = () => {
    const p = parseFloat(rm.peso)
    const r = parseFloat(rm.reps)
    if (!p || !r) return
    setRm({ ...rm, resultado: Math.round(p * (1 + r / 30)) }) // fórmula de Epley
  }

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>Calculadoras</div>
        <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, marginTop: 2 }}>Conoce tus números y entrena con cabeza</div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>IMC · Índice de masa corporal</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Campo label="Peso (kg)" value={imc.peso} onChange={(v) => setImc({ ...imc, peso: v })} placeholder="72,4" />
            <Campo label="Estatura (m)" value={imc.estatura} onChange={(v) => setImc({ ...imc, estatura: v })} placeholder="1,68" />
            <button onClick={calcularImc} style={botonCalc}>Calcular</button>
          </div>
          {imc.resultado != null && <Resultado valor={imc.resultado} texto={textoImc(imc.resultado)} />}
        </div>

        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Calorías diarias</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Campo label="Edad" value={cal.edad} onChange={(v) => setCal({ ...cal, edad: v })} placeholder="27" />
            <Campo label="Peso (kg)" value={cal.peso} onChange={(v) => setCal({ ...cal, peso: v })} placeholder="72,4" />
            <Campo label="Estatura (m)" value={cal.estatura} onChange={(v) => setCal({ ...cal, estatura: v })} placeholder="1,68" />
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {['ligera', 'moderada', 'intensa'].map((a) => (
              <button
                key={a}
                onClick={() => setCal({ ...cal, actividad: a })}
                style={{
                  fontSize: 11,
                  fontWeight: cal.actividad === a ? 600 : 500,
                  color: cal.actividad === a ? '#fff' : 'var(--text-3)',
                  background: cal.actividad === a ? 'var(--gym-color)' : 'var(--surface-2)',
                  border: cal.actividad === a ? 'none' : '1px solid var(--border)',
                  borderRadius: 99,
                  padding: '5px 11px',
                  textTransform: 'capitalize',
                }}
              >
                {a}
              </button>
            ))}
            <button onClick={calcularCal} style={{ ...botonCalc, marginLeft: 'auto', padding: '5px 14px' }}>Calcular</button>
          </div>
          {cal.resultado != null && (
            <Resultado valor={cal.resultado.toLocaleString('es-CO')} unidad="kcal" texto="Lo que tu cuerpo necesita al día para mantenerte. ¡Combustible para el entreno!" />
          )}
        </div>

        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>RM · Tu máximo en un levantamiento</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Campo label="Peso levantado (kg)" value={rm.peso} onChange={(v) => setRm({ ...rm, peso: v })} placeholder="42" />
            <Campo label="Repeticiones" value={rm.reps} onChange={(v) => setRm({ ...rm, reps: v })} placeholder="10" />
            <button onClick={calcularRm} style={botonCalc}>Calcular</button>
          </div>
          {rm.resultado != null && (
            <Resultado valor={rm.resultado} unidad="kg" texto="Tu máximo teórico en una repetición. ¡Cada semana ese número puede subir!" />
          )}
        </div>
      </div>
    </>
  )
}
