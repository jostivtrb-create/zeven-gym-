import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGym } from '../../context/ThemeContext'
import { listarClientes, listarPagosGym } from '../../services/db'

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16 }
const pesos = (n) => '$' + Number(n).toLocaleString('es-CO')
const MES_CORTO = new Intl.DateTimeFormat('es-CO', { month: 'short' })

export default function AdminDashboard() {
  const { gym } = useGym()
  const navigate = useNavigate()
  const [clientes, setClientes] = useState(null)
  const [pagos, setPagos] = useState([])

  useEffect(() => {
    if (!gym.id) return
    listarClientes(gym.id).then(setClientes).catch(() => setClientes([]))
    listarPagosGym(gym.id).then(setPagos).catch(() => {})
  }, [gym.id])

  const lista = clientes ?? []
  const cuenta = (e) => lista.filter((c) => c.estadoDerivado === e).length
  const activos = cuenta('activo')
  const porVencer = cuenta('por_vencer')
  const vencidos = cuenta('vencido')
  const congelados = cuenta('congelado')
  const total = Math.max(1, activos + porVencer + vencidos + congelados)
  const pct = (n) => `${Math.round((n / total) * 100)}%`

  // Ingresos por mes (últimos 6) a partir de los pagos reales
  const meses = Array.from({ length: 6 }, (_, i) => {
    const f = new Date()
    f.setMonth(f.getMonth() - (5 - i))
    return { año: f.getFullYear(), mes: f.getMonth(), etiqueta: MES_CORTO.format(f) }
  })
  const serie = meses.map(({ año, mes }) =>
    pagos.reduce((s, p) => {
      const f = p.fecha?.toDate?.()
      return f && f.getFullYear() === año && f.getMonth() === mes ? s + (p.monto ?? 0) : s
    }, 0)
  )
  const ingresosMes = serie[5]
  const maxSerie = Math.max(1, ...serie)

  const iniciales = gym.nombre.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: '#fff', color: 'var(--gym-color)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {gym.branding?.logoUrl ? <img src={gym.branding.logoUrl} alt="" style={{ width: '100%', borderRadius: 'inherit' }} /> : iniciales}
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: 17, fontWeight: 600 }}>{gym.nombre}</div>
          <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 11.5 }}>Panel de administración</div>
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {clientes === null ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 12.5 }}>Cargando tu gimnasio…</div>
        ) : (
          <>
            {lista.length === 0 && (
              <div style={{ ...card, textAlign: 'center', padding: '24px 16px' }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>¡Bienvenido a tu panel! 💪</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.6 }}>
                  Tus clientes se registran solos con tu código <b style={{ letterSpacing: '.08em' }}>{gym.codigo}</b>.<br />
                  Mientras llegan: crea tus planes y tu primera rutina.
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button onClick={() => navigate('/admin/planes')} style={{ flex: 1, background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12, fontWeight: 600 }}>Crear planes</button>
                  <button onClick={() => navigate('/admin/rutinas')} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12, fontWeight: 600, color: '#565652' }}>Crear rutina</button>
                </div>
              </div>
            )}

            {vencidos + porVencer > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid #fcd34d', borderRadius: 'var(--radius-lg)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{vencidos + porVencer} plan{vencidos + porVencer === 1 ? '' : 'es'} por cobrar</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 2 }}>Buen momento para recordarles con tiempo.</div>
                </div>
                <button onClick={() => navigate('/admin/pagos')} style={{ background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '9px 14px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  Ir a cobrar
                </button>
              </div>
            )}

            <div style={card}>
              <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'capitalize' }}>Ingresos de {MES_CORTO.format(new Date())}</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }}>{pesos(ingresosMes)}</div>
              <svg viewBox="0 0 320 110" style={{ width: '100%', marginTop: 10 }}>
                {serie.map((v, i) => {
                  const h = 6 + (v / maxSerie) * 74
                  const ultimo = i === 5
                  return <rect key={i} x={14 + i * 52} y={98 - h} width="34" height={h} rx="5" fill={ultimo ? 'var(--gym-color)' : 'color-mix(in oklab, var(--gym-color) 18%, white)'} />
                })}
                {meses.map((m, i) => (
                  <text key={i} x={31 + i * 52} y="108" textAnchor="middle" style={{ font: `${i === 5 ? '600 ' : ''}9.5px Poppins,sans-serif` }} fill={i === 5 ? 'var(--gym-color)' : '#a8a8a4'}>
                    {m.etiqueta}
                  </text>
                ))}
              </svg>
            </div>

            {lista.length > 0 && (
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Miembros por estado</div>
                  <div style={{ fontSize: 11.5, fontWeight: 600 }}>{lista.length} en total</div>
                </div>
                <div style={{ display: 'flex', height: 12, borderRadius: 99, overflow: 'hidden', marginTop: 10, background: '#f0f0ee' }}>
                  <div style={{ width: pct(activos), background: 'var(--gym-color)' }} />
                  <div style={{ width: pct(porVencer), background: '#fbbf24' }} />
                  <div style={{ width: pct(vencidos), background: '#ef4444' }} />
                  <div style={{ width: pct(congelados), background: '#94a3b8' }} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', marginTop: 12, fontSize: 11.5 }}>
                  {[
                    ['Activos', activos, 'var(--gym-color)'],
                    ['Por vencer', porVencer, '#fbbf24'],
                    ['Vencidos', vencidos, '#ef4444'],
                    ['Congelados', congelados, '#94a3b8'],
                  ].map(([nombre, n, color]) => (
                    <span key={nombre}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 99, background: color, marginRight: 5 }} />
                      {nombre} <b>{n}</b>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
