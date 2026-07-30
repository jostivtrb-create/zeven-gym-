import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { rutaPorRol } from '../services/db'

export default function RutaProtegida({ rol, children }) {
  const { usuario, perfil, cargando } = useAuth()

  if (cargando) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'var(--bg)' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--zeven-dark)', color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Z</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Cargando…</div>
      </div>
    )
  }
  if (!usuario) return <Navigate to="/" replace />
  // El superadmin puede entrar a cualquier panel (modo soporte / vista de cliente)
  if (perfil && rol && perfil.rol !== rol && perfil.rol !== 'superadmin') return <Navigate to={rutaPorRol(perfil)} replace />
  return children
}
