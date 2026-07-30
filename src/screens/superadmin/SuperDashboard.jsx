import { demoGimnasios, demoPlataforma } from '../../data/demoSuper'

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }
const pesos = (n) => '$' + n.toLocaleString('es-CO')

export default function SuperDashboard() {
  const cuenta = (e) => demoGimnasios.filter((g) => g.estado === e).length
  const activos = cuenta('activo')
  const p = demoPlataforma
  const enGracia = demoGimnasios.filter((g) => g.estado === 'gracia')
  const maxBar = Math.max(...p.ingresosSerie)

  return (
    <>
      <header style={{ background: 'var(--zeven-dark)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: '#fff', color: 'var(--zeven-dark)', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Z</div>
        <div>
          <div style={{ color: '#fff', fontSize: 17, fontWeight: 600 }}>Zeven Gym</div>
          <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 11.5 }}>Panel de la plataforma</div>
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            [activos, 'Gimnasios activos', '#16a34a'],
            [cuenta('prueba'), 'En prueba de 30 días', '#2563eb'],
            [cuenta('gracia'), 'En periodo de gracia', '#d97706'],
            [cuenta('suspendido'), 'Suspendidos', '#94a3b8'],
          ].map(([n, texto, color]) => (
            <div key={texto} style={{ ...card, padding: 14 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color }}>{n}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{texto}</div>
            </div>
          ))}
        </div>

        <div style={{ ...card, borderRadius: 'var(--radius-lg)', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Ingresos de julio</div>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--zeven-dark)', background: '#f0f0ee', borderRadius: 99, padding: '3px 9px' }}>
              {activos} × {pesos(p.monto)}
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }}>{pesos(p.ingresosMes)}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 2 }}>
            {p.pagosConfirmados} pagos confirmados · {p.pagosPendientes} pendientes este mes
          </div>
          <svg viewBox="0 0 320 90" style={{ width: '100%', marginTop: 10 }}>
            {p.ingresosSerie.map((v, i) => {
              const h = (v / maxBar) * 66
              const ultimo = i === p.ingresosSerie.length - 1
              return <rect key={i} x={14 + i * 52} y={82 - h} width="34" height={h} rx="5" fill={ultimo ? 'var(--zeven-dark)' : '#e6e6e2'} />
            })}
            <text x={291} y="12" textAnchor="middle" style={{ font: '600 9.5px Poppins,sans-serif' }} fill="var(--zeven-dark)">Jul</text>
          </svg>
        </div>

        <div style={{ ...card, borderRadius: 'var(--radius-lg)', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Clientes en toda la plataforma</div>
            <div style={{ fontSize: 11.5, fontWeight: 600 }}>{p.clientesTotal.toLocaleString('es-CO')}</div>
          </div>
          <svg viewBox="0 0 320 80" style={{ width: '100%', marginTop: 8 }}>
            <polyline points="16,64 76,58 136,50 196,42 256,30 304,20" fill="none" stroke="var(--zeven-dark)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="304" cy="20" r="4.5" fill="var(--zeven-dark)" stroke="#fff" strokeWidth="2" />
            <text x="298" y="10" textAnchor="end" style={{ font: '600 10px Poppins,sans-serif' }} fill="var(--zeven-dark)">
              +{p.clientesNuevosMes} en jul
            </text>
          </svg>
        </div>

        {enGracia.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid #fcd34d', borderRadius: 'var(--radius-md)', padding: '13px 16px', fontSize: 12, color: 'var(--warning-text)', lineHeight: 1.5 }}>
            <b>{enGracia.length} gimnasio{enGracia.length === 1 ? '' : 's'} en gracia:</b>{' '}
            {enGracia.map((g) => `${g.nombre} (quedan ${g.diasGracia} días)`).join(' · ')}.
          </div>
        )}
      </div>
    </>
  )
}
