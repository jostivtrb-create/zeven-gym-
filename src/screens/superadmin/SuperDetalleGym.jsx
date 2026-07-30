import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { demoGimnasios } from '../../data/demoSuper'
import { useGym } from '../../context/ThemeContext'
import { demoGym } from '../../data/demo'

const seccion = { fontSize: 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }
const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }

export default function SuperDetalleGym() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setGym, setSoporte } = useGym()
  const base = demoGimnasios.find((g) => g.id === id) ?? demoGimnasios[0]
  const [gym, setGymLocal] = useState(base)
  const [confirmando, setConfirmando] = useState(false)

  const suspendido = gym.estado === 'suspendido'
  const alDia = gym.estado === 'activo'

  const entrarSoporte = () => {
    setGym({ ...demoGym, id: gym.id, nombre: gym.nombre, ciudad: gym.ciudad, codigo: gym.codigo, branding: { ...demoGym.branding, color: gym.color } })
    setSoporte({ gymNombre: gym.nombre })
    navigate('/admin')
  }

  const alternarSuspension = () => {
    setGymLocal({ ...gym, estado: suspendido ? 'activo' : 'suspendido', suspendidoEl: 'hoy' })
    setConfirmando(false)
  }

  return (
    <>
      <header style={{ background: 'var(--zeven-dark)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <button onClick={() => navigate('/super/gimnasios')} style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>‹ Gimnasios</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: gym.color, color: '#fff', fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {gym.nombre.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>{gym.nombre}</div>
            <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 11.5 }}>
              {gym.ciudad} · código {gym.codigo} · desde {gym.desde}
            </div>
          </div>
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            [gym.clientes, 'clientes', 'inherit'],
            [gym.activos, 'activos', 'inherit'],
            [`+${gym.nuevosMes}`, 'en julio', gym.color],
          ].map(([n, texto, color]) => (
            <div key={texto} style={{ ...card, padding: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color }}>{n}</div>
              <div style={{ fontSize: 10, color: 'var(--text-2)' }}>{texto}</div>
            </div>
          ))}
        </div>

        <button onClick={entrarSoporte} style={{ background: 'var(--zeven-dark)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '13px 0', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
          Entrar como soporte →
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccion}>Suscripción</div>
          <div style={{ ...card, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>$79.000 / mes</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: alDia ? '#166534' : gym.estado === 'prueba' ? '#1e40af' : '#92400e', background: alDia ? '#dcfce7' : gym.estado === 'prueba' ? '#dbeafe' : '#fef3c7', borderRadius: 99, padding: '3px 9px' }}>
                {alDia ? 'Al día' : gym.estado === 'prueba' ? `Prueba · ${gym.diasPrueba} días` : suspendido ? 'Suspendido' : `Gracia · ${gym.diasGracia} días`}
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 4 }}>
              {gym.ultimoPago ? `Último pago: ${gym.ultimoPago} · próximo corte: ${gym.proximoCorte}` : `Sin pagos aún · primer corte: ${gym.proximoCorte}`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccion}>Admin del gimnasio</div>
          <div style={{ ...card, padding: '6px 14px' }}>
            {[
              ['Nombre', gym.admin.nombre],
              ['Celular', gym.admin.celular],
              ['Correo', gym.admin.correo],
            ].map(([k, v], i, arr) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid #f2f2f0' : 'none', fontSize: 12.5 }}>
                <span style={{ color: 'var(--text-2)' }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccion}>Branding</div>
          <div style={{ ...card, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: gym.color }} />
            <div style={{ width: 26, height: 26, borderRadius: 8, background: `color-mix(in srgb, ${gym.color} 60%, #000)` }} />
            <div style={{ flex: 1, fontSize: 11.5, color: 'var(--text-2)' }}>Color del gym · lo ven sus {gym.clientes} clientes</div>
            <button onClick={() => navigate('/super/gimnasios/crear')} style={{ fontSize: 12, fontWeight: 600, color: 'var(--zeven-dark)' }}>Editar</button>
          </div>
        </div>

        {confirmando ? (
          <div style={{ ...card, border: '1px solid #f3d5d5', padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)' }}>
              ¿{suspendido ? 'Reactivar' : 'Suspender'} {gym.nombre}?
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => setConfirmando(false)} style={{ flex: 1, border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12.5, fontWeight: 600, background: 'var(--surface)' }}>Cancelar</button>
              <button onClick={alternarSuspension} style={{ flex: 1, borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12.5, fontWeight: 600, background: suspendido ? '#166534' : 'var(--danger)', color: '#fff' }}>
                {suspendido ? 'Reactivar' : 'Suspender'}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmando(true)} style={{ ...card, border: suspendido ? '1px solid #bbf7d0' : '1px solid #f3d5d5', padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: suspendido ? '#166534' : 'var(--danger)' }}>
              {suspendido ? 'Reactivar gimnasio' : 'Suspender gimnasio'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>
              {suspendido ? 'El admin y sus clientes recuperan el acceso.' : 'Te pediremos confirmarlo. El admin y sus clientes pierden acceso hasta reactivarlo.'}
            </div>
          </button>
        )}
      </div>
    </>
  )
}
