import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import TabBar from '../../components/TabBar'
import InstallPrompt from '../../components/InstallPrompt'

export default function ClienteShell() {
  // La app del cliente vive en tema oscuro premium; admin y superadmin siguen en claro.
  useEffect(() => {
    document.documentElement.classList.add('tema-oscuro')
    return () => document.documentElement.classList.remove('tema-oscuro')
  }, [])

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
