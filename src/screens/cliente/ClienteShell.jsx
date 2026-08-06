import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import TabBar from '../../components/TabBar'
import InstallPrompt from '../../components/InstallPrompt'
import { useGym } from '../../context/ThemeContext'

export default function ClienteShell() {
  const { tema } = useGym()

  // El cliente elige su tema (oscuro por defecto) desde Perfil.
  // Admin y superadmin siempre en claro: por eso la clase se quita al salir.
  useEffect(() => {
    document.documentElement.classList.toggle('tema-oscuro', tema === 'oscuro')
    return () => document.documentElement.classList.remove('tema-oscuro')
  }, [tema])

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <main style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Outlet />
      </main>
      <InstallPrompt />
      <TabBar />
    </div>
  )
}
