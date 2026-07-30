import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { rutaPorRol } from '../services/db'

export default function RutaProtegida({ rol, requiereGym, children }) {
  const { usuario, perfil, cargando } = useAuth()

  if (cargando) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'var(--bg)' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--zeven-dark)', color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Z</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Cargando…</div>
      </div>
    )
  }

  // Sin sesión → a la pantalla de entrada
  if (!usuario) return <Navigate to="/" replace />

  const esSuper = perfil?.rol === 'superadmin'

  // Sin gimnasio vinculado (y no es superadmin) → a vincular
  if (requiereGym && !perfil?.gymId && !esSuper) return <Navigate to="/vincular" replace />

  // Rol equivocado → a su panel (el superadmin puede entrar a todo: modo soporte)
  if (perfil && rol && perfil.rol !== rol && !esSuper) return <Navigate to={rutaPorRol(perfil)} replace />

  return children
}
