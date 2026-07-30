import { useNavigate } from 'react-router-dom'
import { useGym } from '../../context/ThemeContext'

const OPCIONES = [
  { ruta: '/admin/pagos', titulo: 'Pagos', detalle: 'Vencidos y por vencer, registrar pagos', icono: <><rect x="3" y="6" width="18" height="13" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /></> },
  { ruta: '/admin/planes', titulo: 'Planes del gym', detalle: 'Nombre, precio y duración', icono: <><path d="M20 12 V7 a2 2 0 0 0 -2 -2 H6 a2 2 0 0 0 -2 2 v10 a2 2 0 0 0 2 2 h6" /><circle cx="17" cy="17" r="4" /><path d="M17 15.5 v1.5 l1 1" /></> },
  { ruta: '/admin/comunicados', titulo: 'Comunicados', detalle: 'Avisos que ven tus clientes', icono: <><path d="M4 10 L18 5 V19 L4 14 Z" /><path d="M8 14 v4" /></> },
  { ruta: '/admin/config', titulo: 'Configuración del gym', detalle: 'Portada, contacto, horarios y políticas', icono: <><circle cx="12" cy="12" r="3" /><path d="M12 3 v3 M12 18 v3 M3 12 h3 M18 12 h3 M5.6 5.6 l2.1 2.1 M16.3 16.3 l2.1 2.1 M18.4 5.6 l-2.1 2.1 M7.7 16.3 l-2.1 2.1" /></> },
]

export default function AdminMas() {
  const navigate = useNavigate()
  const { gym } = useGym()

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>Más</div>
        <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, marginTop: 2 }}>Herramientas de {gym.nombre}</div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {OPCIONES.map((op) => (
          <button key={op.ruta} onClick={() => navigate(op.ruta)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14, display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', flex: 'none', background: 'color-mix(in oklab, var(--gym-color) 10%, white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gym-color)" strokeWidth="1.8">{op.icono}</svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{op.titulo}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{op.detalle}</div>
            </div>
            <span style={{ color: 'var(--text-4)', fontSize: 16 }}>›</span>
          </button>
        ))}

        <div style={{ marginTop: 6, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', background: 'var(--zeven-dark)', color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>Z</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Suscripción Zeven Gym</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>$79.000/mes · al día · próximo corte: 15 ago</div>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: '#166534', background: '#dcfce7', borderRadius: 99, padding: '3px 9px' }}>Al día</span>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', marginTop: 4 }}>
          Código de tu gym para nuevos clientes: <b style={{ letterSpacing: '.1em' }}>{gym.codigo}</b>
        </div>
      </div>
    </>
  )
}
