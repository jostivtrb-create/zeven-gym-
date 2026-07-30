import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { demoClientes, ESTADOS } from '../../data/demoAdmin'

const MES = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' })
const fechaCorta = (iso) => (iso ? MES.format(new Date(iso + 'T00:00:00')) : null)

export function iniciales(nombre) {
  return nombre.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

export function subtituloCliente(c) {
  if (c.estado === 'desactivado') return `Sin plan · desactivado en ${c.desactivadoEn}`
  if (c.estado === 'congelado') return `${c.plan} · congelado desde ${c.congeladoDesde}`
  if (c.estado === 'vencido') return `${c.plan} · venció ${fechaCorta(c.vence)}`
  return `${c.plan} · vence ${fechaCorta(c.vence)}`
}

const FILTROS = [
  ['todos', 'Todos'],
  ['activo', 'Activos'],
  ['por_vencer', 'Por vencer'],
  ['vencido', 'Vencidos'],
  ['congelado', 'Congelados'],
]

export default function AdminClientes() {
  const navigate = useNavigate()
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')

  const lista = demoClientes.filter((c) => {
    const pasa = filtro === 'todos' || c.estado === filtro
    const q = busqueda.trim().toLowerCase()
    const coincide = !q || c.nombre.toLowerCase().includes(q) || c.documento.toLowerCase().includes(q)
    return pasa && coincide
  })

  const cuenta = (f) => (f === 'todos' ? demoClientes.length : demoClientes.filter((c) => c.estado === f).length)

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 16px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>Clientes</div>
        <div style={{ marginTop: 12, background: 'rgba(255,255,255,.18)', borderRadius: 'var(--radius)', padding: '4px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2.5">
            <circle cx="10" cy="10" r="6" />
            <line x1="15" y1="15" x2="20" y2="20" />
          </svg>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o documento…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 12.5, color: '#fff', padding: '7px 0' }}
          />
        </div>
      </header>

      <div style={{ display: 'flex', gap: 6, padding: '14px 16px 4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {FILTROS.map(([f, nombre]) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              fontSize: 11,
              fontWeight: filtro === f ? 600 : 500,
              color: filtro === f ? '#fff' : '#565652',
              background: filtro === f ? 'var(--gym-color)' : 'var(--surface)',
              border: filtro === f ? 'none' : '1px solid var(--border-2)',
              borderRadius: 99,
              padding: '6px 12px',
              whiteSpace: 'nowrap',
            }}
          >
            {nombre} · {cuenta(f)}
          </button>
        ))}
      </div>

      <div style={{ padding: '10px 16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lista.map((c) => {
          const est = ESTADOS[c.estado]
          const inactivo = c.estado === 'desactivado'
          return (
            <button
              key={c.uid}
              onClick={() => navigate(`/admin/clientes/${c.uid}`)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                opacity: inactivo ? 0.55 : 1,
                textAlign: 'left',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 99, flex: 'none', background: inactivo ? 'var(--border)' : 'color-mix(in oklab, var(--gym-color) 12%, white)', color: inactivo ? 'var(--text-3)' : 'var(--gym-color)', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {iniciales(c.nombre)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{subtituloCliente(c)}</div>
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: est.color, background: est.bg, borderRadius: 99, padding: '3px 9px' }}>{est.etiqueta}</div>
            </button>
          )
        })}
        {lista.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 12.5 }}>No hay clientes con ese filtro.</div>
        )}
      </div>
    </>
  )
}
