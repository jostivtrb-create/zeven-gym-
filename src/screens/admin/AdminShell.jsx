import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { demoSuscripcionGym } from '../../data/demoAdmin'

const tabs = [
  { to: '/admin', end: true, label: 'Inicio', icon: <path d="M4 11 L12 4 L20 11 V20 H4 Z" /> },
  {
    to: '/admin/clientes',
    label: 'Clientes',
    icon: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M3 20 C3 16 6 14.5 9 14.5 C12 14.5 15 16 15 20" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M16.5 14.7 C19 15.2 21 16.8 21 20" />
      </>
    ),
  },
  {
    to: '/admin/rutinas',
    label: 'Rutinas',
    icon: (
      <>
        <rect x="3" y="8" width="4" height="8" rx="1" />
        <rect x="17" y="8" width="4" height="8" rx="1" />
        <line x1="7" y1="12" x2="17" y2="12" />
      </>
    ),
  },
  { to: '/admin/mas', label: 'Más', relleno: true, icon: (
      <>
        <circle cx="5" cy="12" r="1.8" />
        <circle cx="12" cy="12" r="1.8" />
        <circle cx="19" cy="12" r="1.8" />
      </>
    ) },
]

function AvisoSuscripcion() {
  const [cerrado, setCerrado] = useState(false)
  const { diasAtraso, monto } = demoSuscripcionGym
  if (diasAtraso <= 0 || cerrado) return null
  const restantes = 7 - diasAtraso
  const urgente = restantes <= 3

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(28,28,26,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 22, maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-pop)' }}>
        <div style={{ width: 44, height: 44, borderRadius: 99, margin: '0 auto 10px', background: urgente ? 'var(--danger-bg)' : 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          {urgente ? '⏰' : '👋'}
        </div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>
          {urgente ? `Quedan ${restantes} día${restantes === 1 ? '' : 's'} para renovar` : 'Debes pagar la suscripción'}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.5 }}>
          {urgente
            ? `Tu suscripción de Zeven Gym ($${monto.toLocaleString('es-CO')}/mes) venció hace ${diasAtraso} días. Para no interrumpir el servicio de tu gimnasio y tus clientes, renueva hoy.`
            : `Tu suscripción de Zeven Gym ($${monto.toLocaleString('es-CO')}/mes) venció ayer. Tienes ${restantes} días para ponerte al día — tu panel sigue funcionando normal.`}
        </div>
        <button onClick={() => setCerrado(true)} style={{ marginTop: 14, width: '100%', background: urgente ? 'var(--danger)' : 'var(--zeven-dark)', color: '#fff', borderRadius: 'var(--radius)', padding: '11px 0', fontSize: 13, fontWeight: 600 }}>
          {urgente ? 'Renovar ahora' : 'Entendido'}
        </button>
        {!urgente && (
          <button onClick={() => setCerrado(true)} style={{ marginTop: 8, fontSize: 11.5, color: 'var(--text-3)' }}>
            Cerrar
          </button>
        )}
      </div>
    </div>
  )
}

export default function AdminShell() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <AvisoSuscripcion />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <nav style={{ display: 'flex', background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '8px 6px calc(6px + env(safe-area-inset-bottom))', position: 'sticky', bottom: 0 }}>
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            {({ isActive }) => (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24" fill={t.relleno ? (isActive ? 'var(--gym-color)' : 'var(--text-4)') : 'none'} stroke={t.relleno ? 'none' : isActive ? 'var(--gym-color)' : 'var(--text-4)'} strokeWidth="2">
                  {t.icon}
                </svg>
                <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--gym-color)' : 'var(--text-4)' }}>{t.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
