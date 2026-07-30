import { useState } from 'react'
import { aISO, deISO } from '../services/db'

/* Calendario propio, dibujado DENTRO de la app.
   Evita el selector nativo del navegador, que se abre fuera de la pantalla. */

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export default function SelectorFecha({ valor, onChange, color = 'var(--gym-color)' }) {
  const seleccionada = valor ? deISO(valor) : null
  const [mes, setMes] = useState(() => {
    const base = seleccionada ?? new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const hoy = new Date()
  const esMismoDia = (a, b) => a && b && aISO(a) === aISO(b)

  // Lunes = primera columna
  const desplazamiento = (new Date(mes.getFullYear(), mes.getMonth(), 1).getDay() + 6) % 7
  const totalDias = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate()
  const celdas = [...Array(desplazamiento).fill(null), ...Array.from({ length: totalDias }, (_, i) => i + 1)]

  const moverMes = (n) => setMes(new Date(mes.getFullYear(), mes.getMonth() + n, 1))
  const elegir = (dia) => onChange(aISO(new Date(mes.getFullYear(), mes.getMonth(), dia)))

  const flecha = { width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--text-2)', background: 'var(--surface-2)' }

  return (
    <div style={{ background: '#fff', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button type="button" onClick={() => moverMes(-1)} aria-label="Mes anterior" style={flecha}>‹</button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
          {MESES[mes.getMonth()]} {mes.getFullYear()}
        </div>
        <button type="button" onClick={() => moverMes(1)} aria-label="Mes siguiente" style={flecha}>›</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginTop: 10 }}>
        {DIAS.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--text-4)', paddingBottom: 4 }}>{d}</div>
        ))}
        {celdas.map((dia, i) => {
          if (!dia) return <div key={`v${i}`} />
          const fecha = new Date(mes.getFullYear(), mes.getMonth(), dia)
          const activa = esMismoDia(fecha, seleccionada)
          const esHoy = esMismoDia(fecha, hoy)
          return (
            <button
              key={dia}
              type="button"
              onClick={() => elegir(dia)}
              style={{
                aspectRatio: '1',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: activa ? 700 : esHoy ? 600 : 500,
                color: activa ? '#fff' : esHoy ? color : 'var(--text)',
                background: activa ? color : esHoy ? `color-mix(in oklab, ${color} 10%, white)` : 'transparent',
                fontFamily: 'inherit',
              }}
            >
              {dia}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
        <button type="button" onClick={() => { const f = new Date(); setMes(new Date(f.getFullYear(), f.getMonth(), 1)); onChange(aISO(f)) }} style={{ flex: 1, fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', padding: '6px 0' }}>
          Hoy
        </button>
        <button type="button" onClick={() => { const f = new Date(); f.setMonth(f.getMonth() + 1); setMes(new Date(f.getFullYear(), f.getMonth(), 1)); onChange(aISO(f)) }} style={{ flex: 1, fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', padding: '6px 0' }}>
          En un mes
        </button>
      </div>
    </div>
  )
}
