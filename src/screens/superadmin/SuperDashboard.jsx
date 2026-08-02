import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { listarGimnasios } from '../../services/db'

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }
const pesos = (n) => '$' + n.toLocaleString('es-CO')
const MONTO = 79000

export default function SuperDashboard() {
  const navigate = useNavigate()
  const { perfil, salir } = useAuth()
  const [gimnasios, setGimnasios] = useState(null)

  const cerrarSesion = async () => {
    try {
      await salir()
    } finally {
      location.href = '/'
    }
  }

  useEffect(() => {
    listarGimnasios()
      .then(setGimnasios)
      .catch(() => setGimnasios([]))
  }, [])

  const lista = gimnasios ?? []
  const cuenta = (e) => lista.filter((g) => g.estado === e).length
  const activos = cuenta('activo')
  const clientesTotal = lista.reduce((s, g) => s + (g.clientes ?? 0), 0)
  const enGracia = lista.filter((g) => g.estado === 'gracia')
  const mes = new Intl.DateTimeFormat('es-CO', { month: 'long' }).format(new Date())

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
        {gimnasios === null ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 12.5 }}>Cargando plataforma…</div>
        ) : (
          <>
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
                <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'capitalize' }}>Ingresos de {mes}</div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--zeven-dark)', background: '#f0f0ee', borderRadius: 99, padding: '3px 9px' }}>
                  {activos} × {pesos(MONTO)}
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }}>{pesos(activos * MONTO)}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 2 }}>
                {lista.length === 0
                  ? 'Crea tu primer gimnasio para empezar a facturar.'
                  : `${activos} al día · ${cuenta('prueba')} en prueba · ${cuenta('gracia')} pendientes de pago`}
              </div>
            </div>

            <div style={{ ...card, borderRadius: 'var(--radius-lg)', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Clientes en toda la plataforma</div>
                <div style={{ fontSize: 11.5, fontWeight: 600 }}>{clientesTotal.toLocaleString('es-CO')}</div>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.5 }}>
                {clientesTotal === 0
                  ? 'Cuando los gimnasios registren clientes, aquí verás el total y su crecimiento.'
                  : `Repartidos en ${lista.length} gimnasio${lista.length === 1 ? '' : 's'}.`}
              </div>
            </div>

            {enGracia.length > 0 && (
              <button onClick={() => navigate('/super/pagos')} style={{ background: 'var(--surface)', border: '1px solid #fcd34d', borderRadius: 'var(--radius-md)', padding: '13px 16px', fontSize: 12, color: 'var(--warning-text)', lineHeight: 1.5, textAlign: 'left' }}>
                <b>{enGracia.length} gimnasio{enGracia.length === 1 ? '' : 's'} en gracia:</b>{' '}
                {enGracia.map((g) => `${g.nombre} (quedan ${g.diasGracia} días)`).join(' · ')}.
              </button>
            )}

            <div style={{ ...card, padding: '12px 14px', marginTop: 4 }}>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Sesión iniciada como</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {perfil?.correo}
              </div>
            </div>

            <button onClick={cerrarSesion} style={{ background: 'var(--surface)', border: '1px solid #f3d5d5', color: 'var(--danger)', borderRadius: 'var(--radius-md)', padding: '12px 0', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </>
  )
}
