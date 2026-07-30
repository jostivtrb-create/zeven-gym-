import { Outlet } from 'react-router-dom'
import TabBar from '../../components/TabBar'
import InstallPrompt from '../../components/InstallPrompt'

export default function ClienteShell() {
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
