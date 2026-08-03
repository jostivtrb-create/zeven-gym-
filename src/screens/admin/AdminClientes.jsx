import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGym } from '../../context/ThemeContext'
import { listarClientes } from '../../services/db'

export const ESTADOS = {
  activo: { etiqueta: 'Activo', color: '#166534', bg: '#dcfce7' },
  por_vencer: { etiqueta: 'Por vencer', color: '#92400e', bg: '#fef3c7' },
  vencido: { etiqueta: 'Vencido', color: '#b91c1c', bg: '#fee2e2' },
  congelado: { etiqueta: 'Congelado', color: '#1e40af', bg: '#dbeafe' },
  sin_plan: { etiqueta: 'Sin plan', color: '#6b7280', bg: '#f3f4f6' },
  desactivado: { etiqueta: 'Desactivado', color: '#6b7280', bg: '#f3f4f6' },
}

const FECHA = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' })

export function iniciales(nombre = '?') {
  return nombre.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

export function subtituloCliente(c) {
  const m = c.membresia
  const vence = m?.vence?.toDate ? FECHA.format(m.vence.toDate()) : null
  switch (c.estadoDerivado) {
    case 'desactivado': return 'Desactivado'
    case 'sin_plan': return 'Sin plan · regístrale su primer pago'
    case 'congelado': return `${m.planNombre} · congelado`
    case 'vencido': return `${m.planNombre} · venció ${vence}`
    default: return `${m.planNombre} · vence ${vence}`
  }
}

const FILTROS = [
  ['todos', 'Todos'],
  ['activo', 'Activos'],
  ['por_vencer', 'Por vencer'],
  ['vencido', 'Vencidos'],
  ['congelado', 'Congelados'],
  ['sin_plan', 'Sin plan'],
]

export default function AdminClientes() {
  const navigate = useNavigate()
  const { gym } = useGym()
  const [clientes, setClientes] = useState(null)
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    if (gym.id) listarClientes(gym.id).then(setClientes).catch(() => setClientes([]))
  }, [gym.id])

  const lista = (clientes ?? []).filter((c) => {
    const pasa = filtro === 'todos' || c.estadoDerivado === filtro
    const q = busqueda.trim().toLowerCase()
    const coincide = !q || (c.nombre ?? '').toLowerCase().includes(q) || (c.documento ?? '').toLowerCase().includes(q)
    return pasa && coincide
  })

  const cuenta = (f) => (f === 'todos' ? (clientes ?? []).length : (clientes ?? []).filter((c) => c.estadoDerivado === f).length)

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 16px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>Clientes</div>
          <button onClick={() => navigate('/admin/invitar')} style={{ background: '#fff', color: 'var(--gym-color)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 12, fontWeight: 600 }}>
            + Invitar
          </button>
        </div>
        <div style={{ marginTop: 12, background: 'rgba(255,255,255,.18)', borderRadius: 'var(--radius)', padding: '4px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2.5">
            <circle cx="10" cy="10" r="6" />
            <line x1="15" y1="15" x2="20" y2="20" />
          </svg>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o documento…" style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 12.5, color: '#fff', padding: '7px 0' }} />
        </div>
      </header>

      <div style={{ display: 'flex', gap: 6, padding: '14px 16px 4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {FILTROS.map(([f, nombre]) => (
          <button key={f} onClick={() => setFiltro(f)} style={{ fontSize: 11, fontWeight: filtro === f ? 600 : 500, color: filtro === f ? '#fff' : '#565652', background: filtro === f ? 'var(--gym-color)' : 'var(--surface)', border: filtro === f ? 'none' : '1px solid var(--border-2)', borderRadius: 99, padding: '6px 12px', whiteSpace: 'nowrap' }}>
            {nombre} · {cuenta(f)}
          </button>
        ))}
      </div>

      <div style={{ padding: '10px 16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {clientes === null && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 12.5 }}>Cargando clientes…</div>}

        {clientes !== null && clientes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Aún no tienes clientes</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.6 }}>
              Comparte tu código QR o tu link para que se registren solos desde su celular y aparezcan aquí.
            </div>
            <button onClick={() => navigate('/admin/invitar')} style={{ marginTop: 14, background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius)', padding: '11px 18px', fontSize: 13, fontWeight: 600 }}>
              Ver mi QR e invitar
            </button>
          </div>
        )}

        {lista.map((c) => {
          const est = ESTADOS[c.estadoDerivado]
          const inactivo = c.estadoDerivado === 'desactivado'
          return (
            <button key={c.uid} onClick={() => navigate(`/admin/clientes/${c.uid}`)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: inactivo ? 0.55 : 1, textAlign: 'left' }}>
              <div style={{ width: 40, height: 40, borderRadius: 99, flex: 'none', background: inactivo ? 'var(--border)' : 'color-mix(in oklab, var(--gym-color) 12%, white)', color: inactivo ? 'var(--text-3)' : 'var(--gym-color)', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {c.fotoUrl ? <img src={c.fotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : iniciales(c.nombre)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{subtituloCliente(c)}</div>
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: est.color, background: est.bg, borderRadius: 99, padding: '3px 9px' }}>{est.etiqueta}</div>
            </button>
          )
        })}

        {clientes !== null && clientes.length > 0 && lista.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-3)', fontSize: 12.5 }}>No hay clientes con ese filtro.</div>
        )}
      </div>
    </>
  )
}
