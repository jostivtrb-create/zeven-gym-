import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import TabBar from '../../components/TabBar'
import InstallPrompt from '../../components/InstallPrompt'
import { useGym } from '../../context/ThemeContext'

export default function ClienteShell() {
  const { tema } = useGym()

  // El cliente elige su tema (oscuro por defecto) desde Perfil. Ambos temas
  // son propios del cliente: al salir a admin/superadmin se quitan los dos.
  useEffect(() => {
    const raiz = document.documentElement
    raiz.classList.toggle('tema-oscuro', tema === 'oscuro')
    raiz.classList.toggle('tema-claro', tema === 'claro')
    return () => raiz.classList.remove('tema-oscuro', 'tema-claro')
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
