import { Outlet, NavLink } from 'react-router-dom'

const tabs = [
  { to: '/super', end: true, label: 'Inicio', icon: <path d="M4 11 L12 4 L20 11 V20 H4 Z" /> },
  {
    to: '/super/gimnasios',
    label: 'Gimnasios',
    icon: (
      <>
        <rect x="4" y="6" width="16" height="14" rx="2" />
        <line x1="4" y1="11" x2="20" y2="11" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </>
    ),
  },
  {
    to: '/super/pagos',
    label: 'Pagos',
    icon: (
      <>
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <circle cx="12" cy="13" r="3" />
      </>
    ),
  },
]

export default function SuperShell() {
  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <main style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Outlet />
      </main>
      <nav style={{ display: 'flex', flex: 'none', background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '8px 6px calc(6px + env(safe-area-inset-bottom))' }}>
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            {({ isActive }) => (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'var(--zeven-dark)' : 'var(--text-4)'} strokeWidth="2">
                  {t.icon}
                </svg>
                <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--zeven-dark)' : 'var(--text-4)' }}>{t.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
