import { Outlet } from 'react-router-dom'
import TabBar from '../../components/TabBar'

export default function ClienteShell() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}
