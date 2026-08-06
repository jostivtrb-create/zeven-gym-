import { NavLink } from 'react-router-dom'

const tabs = [
  {
    to: '/app',
    end: true,
    label: 'Inicio',
    icon: <path d="M4 11 L12 4 L20 11 V20 H4 Z" />,
  },
  {
    to: '/app/rutina',
    label: 'Rutina',
    icon: (
      <>
        <rect x="3" y="8" width="4" height="8" rx="1" />
        <rect x="17" y="8" width="4" height="8" rx="1" />
        <line x1="7" y1="12" x2="17" y2="12" />
      </>
    ),
  },
  {
    to: '/app/progreso',
    label: 'Progreso',
    icon: (
      <>
        <line x1="5" y1="20" x2="5" y2="12" />
        <line x1="12" y1="20" x2="12" y2="6" />
        <line x1="19" y1="20" x2="19" y2="10" />
      </>
    ),
  },
  {
    to: '/app/calcular',
    label: 'Números',
    icon: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <line x1="8" y1="8" x2="16" y2="8" />
        <circle cx="8.5" cy="13" r="0.5" />
        <circle cx="12" cy="13" r="0.5" />
        <circle cx="15.5" cy="13" r="0.5" />
        <circle cx="8.5" cy="17" r="0.5" />
        <circle cx="12" cy="17" r="0.5" />
        <circle cx="15.5" cy="17" r="0.5" />
      </>
    ),
  },
  {
    to: '/app/perfil',
    label: 'Perfil',
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21 C4 16.5 8 15 12 15 C16 15 20 16.5 20 21" />
      </>
    ),
  },
]

export default function TabBar() {
  return (
    <nav
      style={{
        display: 'flex',
        flex: 'none',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        padding: '8px 6px calc(6px + env(safe-area-inset-bottom))',
      }}
    >
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          {({ isActive }) => (
            <>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isActive ? 'var(--gym-color)' : 'var(--text-4)'}
                strokeWidth="2"
              >
                {t.icon}
              </svg>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--gym-color)' : 'var(--text-4)',
                }}
              >
                {t.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
