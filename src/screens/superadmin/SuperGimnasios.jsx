import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarGimnasios } from '../../services/db'
import { ESTADOS_GYM } from '../../data/constantes'

const MES = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' })

function subtitulo(g) {
  const base = [g.ciudad, `${g.clientes} cliente${g.clientes === 1 ? '' : 's'}`].filter(Boolean).join(' · ')
  if (g.estado === 'prueba') return `${base} · prueba`
  if (g.estado === 'gracia') return `${base} · pago vencido`
  if (g.estado === 'suspendido') return `${base} · suspendido`
  const desde = g.creadoEl?.toDate ? ` · desde ${MES.format(g.creadoEl.toDate())}` : ''
  return base + desde
}

function etiquetaEstado(g) {
  if (g.estado === 'prueba') return `Prueba · ${g.diasPrueba} días`
  if (g.estado === 'gracia') return `Gracia · ${g.diasGracia} días`
  return ESTADOS_GYM[g.estado].etiqueta
}

export default function SuperGimnasios() {
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [gimnasios, setGimnasios] = useState(null) // null = cargando

  useEffect(() => {
    listarGimnasios()
      .then(setGimnasios)
      .catch(() => setGimnasios([]))
  }, [])

  const q = busqueda.trim().toLowerCase()
  const lista = (gimnasios ?? []).filter((g) => !q || g.nombre.toLowerCase().includes(q) || (g.ciudad ?? '').toLowerCase().includes(q))

  return (
    <>
      <header style={{ background: 'var(--zeven-dark)', padding: '62px 20px 16px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>Gimnasios</div>
          <button onClick={() => navigate('/super/gimnasios/crear')} style={{ background: '#fff', color: 'var(--zeven-dark)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 12, fontWeight: 600 }}>
            + Crear gimnasio
          </button>
        </div>
        <div style={{ marginTop: 12, background: 'rgba(255,255,255,.14)', borderRadius: 'var(--radius)', padding: '4px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2.5">
            <circle cx="10" cy="10" r="6" />
            <line x1="15" y1="15" x2="20" y2="20" />
          </svg>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar gimnasio…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 12.5, color: '#fff', padding: '7px 0' }} />
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {gimnasios === null && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 12.5 }}>Cargando gimnasios…</div>
        )}

        {gimnasios !== null && lista.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1.5px dashed #c9c9c5', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#a8a8a4' }}>🏋️</div>
            <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 14 }}>{q ? 'Sin resultados' : 'Aún no tienes gimnasios'}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 4, lineHeight: 1.5 }}>
              {q ? 'Prueba con otro nombre.' : 'Crea el primero: eliges sus colores, invitas al dueño y le entregas su código.'}
            </div>
            {!q && (
              <button onClick={() => navigate('/super/gimnasios/crear')} style={{ marginTop: 16, background: 'var(--zeven-dark)', color: '#fff', borderRadius: 'var(--radius)', padding: '11px 18px', fontSize: 13, fontWeight: 600 }}>
                + Crear mi primer gimnasio
              </button>
            )}
          </div>
        )}

        {lista.map((g) => {
          const est = ESTADOS_GYM[g.estado]
          const inactivo = g.estado === 'suspendido'
          return (
            <button key={g.id} onClick={() => navigate(`/super/gimnasios/${g.id}`)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: inactivo ? 0.55 : 1, textAlign: 'left' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', flex: 'none', background: inactivo ? '#9ca3af' : g.branding?.color ?? '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {g.nombre.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{g.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{subtitulo(g)}</div>
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: est.color, background: est.bg, borderRadius: 99, padding: '3px 9px', whiteSpace: 'nowrap' }}>{etiquetaEstado(g)}</div>
            </button>
          )
        })}
      </div>
    </>
  )
}
