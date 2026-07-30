import { useNavigate } from 'react-router-dom'
import { useGym } from '../../context/ThemeContext'
import { demoClientes, demoStats, pesos } from '../../data/demoAdmin'

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16 }

export default function AdminDashboard() {
  const { gym } = useGym()
  const navigate = useNavigate()
  const iniciales = gym.nombre.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()

  const cuenta = (estado) => demoClientes.filter((c) => c.estado === estado).length
  const activos = cuenta('activo')
  const porVencer = cuenta('por_vencer')
  const vencidos = cuenta('vencido')
  const congelados = cuenta('congelado')
  const totalActivos = activos + porVencer + vencidos + congelados
  const pct = (n) => `${Math.round((n / totalActivos) * 100)}%`

  const vencenSemana = porVencer + vencidos
  const s = demoStats
  const maxIngreso = Math.max(...s.ingresosSerie)
  const maxCrec = Math.max(...s.crecimiento)
  const minCrec = Math.min(...s.crecimiento)

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: '#fff', color: 'var(--gym-color)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {iniciales}
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: 17, fontWeight: 600 }}>{gym.nombre}</div>
          <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 11.5 }}>Panel de administración</div>
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {vencenSemana > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid #fcd34d', borderRadius: 'var(--radius-lg)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{vencenSemana} planes vencen esta semana</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 2 }}>Buen momento para recordarles con tiempo.</div>
            </div>
            <button onClick={() => navigate('/admin/pagos')} style={{ background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '9px 14px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
              Ir a cobrar
            </button>
          </div>
        )}

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Ingresos de julio</div>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--gym-color)', background: 'color-mix(in oklab, var(--gym-color) 10%, white)', borderRadius: 99, padding: '3px 9px' }}>{s.variacion}</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }}>{pesos(s.ingresosMes)}</div>
          <svg viewBox="0 0 320 110" style={{ width: '100%', marginTop: 10 }}>
            {s.ingresosSerie.map((v, i) => {
              const h = 18 + (v / maxIngreso) * 62
              const ultimo = i === s.ingresosSerie.length - 1
              return (
                <rect key={i} x={14 + i * 52} y={98 - h} width="34" height={h} rx="5" fill={ultimo ? 'var(--gym-color)' : 'color-mix(in oklab, var(--gym-color) 18%, white)'} />
              )
            })}
            {s.meses.map((m, i) => (
              <text key={m} x={31 + i * 52} y="108" textAnchor="middle" style={{ font: `${i === s.meses.length - 1 ? '600 ' : ''}9.5px Poppins,sans-serif` }} fill={i === s.meses.length - 1 ? 'var(--gym-color)' : '#a8a8a4'}>
                {m}
              </text>
            ))}
          </svg>
        </div>

        <div style={card}>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Miembros por estado</div>
          <div style={{ display: 'flex', height: 12, borderRadius: 99, overflow: 'hidden', marginTop: 10 }}>
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

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Crecimiento de miembros</div>
            <div style={{ fontSize: 11.5, fontWeight: 600 }}>{s.crecimiento.at(-1)} en total</div>
          </div>
          <svg viewBox="0 0 320 90" style={{ width: '100%', marginTop: 8 }}>
            <polyline
              points={s.crecimiento.map((v, i) => `${16 + i * 57.6},${78 - ((v - minCrec) / (maxCrec - minCrec)) * 52}`).join(' ')}
              fill="none"
              stroke="var(--gym-color)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={16 + (s.crecimiento.length - 1) * 57.6} cy={78 - 52} r="4.5" fill="var(--gym-color)" stroke="#fff" strokeWidth="2" />
            <text x={16 + (s.crecimiento.length - 1) * 57.6} y="14" textAnchor="middle" style={{ font: '600 10px Poppins,sans-serif' }} fill="var(--gym-color)">
              +{s.nuevosMes} en jul
            </text>
          </svg>
        </div>
      </div>
    </>
  )
}
