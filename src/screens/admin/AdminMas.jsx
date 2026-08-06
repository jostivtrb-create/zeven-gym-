import { useNavigate } from 'react-router-dom'
import { useGym } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { derivarSuscripcion } from '../../services/db'

const ESTADOS_SUS = {
  activo: { texto: 'Al día', color: '#166534', bg: '#dcfce7' },
  prueba: { texto: 'Prueba', color: '#1e40af', bg: '#dbeafe' },
  gracia: { texto: 'Renovar', color: '#92400e', bg: '#fef3c7' },
  suspendido: { texto: 'Suspendida', color: '#6b7280', bg: '#f3f4f6' },
}

const OPCIONES = [
  { ruta: '/admin/invitar', titulo: 'Invitar clientes', detalle: 'Tu código QR y tu link para compartir', icono: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3z" /><path d="M20 14v3M17 20h4" /></> },
  { ruta: '/admin/pagos', titulo: 'Pagos', detalle: 'Vencidos y por vencer, registrar pagos', icono: <><rect x="3" y="6" width="18" height="13" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /></> },
  { ruta: '/admin/planes', titulo: 'Planes del gym', detalle: 'Nombre, precio y duración', icono: <><path d="M20 12 V7 a2 2 0 0 0 -2 -2 H6 a2 2 0 0 0 -2 2 v10 a2 2 0 0 0 2 2 h6" /><circle cx="17" cy="17" r="4" /><path d="M17 15.5 v1.5 l1 1" /></> },
  { ruta: '/admin/maquinas', titulo: 'Mis máquinas', detalle: 'Qué equipos tienes: filtra los ejercicios', icono: <><rect x="3" y="9" width="4" height="6" rx="1" /><rect x="17" y="9" width="4" height="6" rx="1" /><line x1="7" y1="12" x2="17" y2="12" /></> },
  { ruta: '/admin/comunicados', titulo: 'Comunicados', detalle: 'Avisos que ven tus clientes', icono: <><path d="M4 10 L18 5 V19 L4 14 Z" /><path d="M8 14 v4" /></> },
  { ruta: '/admin/config', titulo: 'Configuración del gym', detalle: 'Portada, contacto, horarios y políticas', icono: <><circle cx="12" cy="12" r="3" /><path d="M12 3 v3 M12 18 v3 M3 12 h3 M18 12 h3 M5.6 5.6 l2.1 2.1 M16.3 16.3 l2.1 2.1 M18.4 5.6 l-2.1 2.1 M7.7 16.3 l-2.1 2.1" /></> },
]

export default function AdminMas() {
  const navigate = useNavigate()
  const { gym } = useGym()
  const { perfil, salir } = useAuth()

  const cerrarSesion = async () => {
    try {
      await salir()
    } finally {
      location.href = '/'
    }
  }
  const s = derivarSuscripcion(gym)
  const es = ESTADOS_SUS[s.estado]
  const detalleSus =
    s.estado === 'prueba'
      ? `$79.000/mes · prueba gratis · quedan ${s.diasPrueba} días`
      : s.estado === 'gracia'
        ? `$79.000/mes · vencida · quedan ${s.diasGracia} días de gracia`
        : s.estado === 'suspendido'
          ? '$79.000/mes · suspendida por falta de pago'
          : `$79.000/mes · al día${gym.suscripcion?.proximoCorte?.toDate ? ` · próximo corte: ${new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(gym.suscripcion.proximoCorte.toDate())}` : ''}`

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
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{detalleSus}</div>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: es.color, background: es.bg, borderRadius: 99, padding: '3px 9px' }}>{es.texto}</span>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', marginTop: 4 }}>
          Código de tu gym para nuevos clientes: <b style={{ letterSpacing: '.1em' }}>{gym.codigo}</b>
        </div>

        <div style={{ marginTop: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Sesión iniciada como</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {perfil?.nombre || perfil?.correo}
          </div>
          {perfil?.nombre && perfil?.correo && (
            <div style={{ fontSize: 11, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{perfil.correo}</div>
          )}
        </div>

        <button onClick={cerrarSesion} style={{ background: 'var(--surface)', border: '1px solid #f3d5d5', color: 'var(--danger)', borderRadius: 'var(--radius-md)', padding: '12px 0', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
          Cerrar sesión
        </button>
      </div>
    </>
  )
}
