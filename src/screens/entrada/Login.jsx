import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGym } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { rutaPorRol } from '../../services/db'

const campo = { background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: '11px 14px' }
const inputStyle = { width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, fontWeight: 500, padding: 0, marginTop: 1 }

export default function Login() {
  const navigate = useNavigate()
  const { gym } = useGym()
  const { entrarConCorreo, entrarConGoogle, recuperarClave, recargarPerfil } = useAuth()
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)

  const iniciales = gym.nombre.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()

  const irSegunRol = async () => {
    const perfil = await recargarPerfil()
    navigate(rutaPorRol(perfil))
  }

  const entrar = async () => {
    if (!correo || !clave) {
      setError('Escribe tu correo y contraseña.')
      return
    }
    setOcupado(true)
    setError('')
    try {
      await entrarConCorreo(correo.trim(), clave)
      await irSegunRol()
    } catch {
      setError('Correo o contraseña incorrectos. Inténtalo de nuevo.')
    } finally {
      setOcupado(false)
    }
  }

  const conGoogle = async () => {
    setOcupado(true)
    setError('')
    try {
      const cred = await entrarConGoogle()
      if (cred?.user) await irSegunRol()
    } catch {
      setError('No pudimos conectar con Google. Inténtalo de nuevo.')
    } finally {
      setOcupado(false)
    }
  }

  const olvido = async () => {
    if (!correo) {
      setError('Escribe tu correo arriba y vuelve a tocar aquí.')
      return
    }
    try {
      await recuperarClave(correo.trim())
      setAviso('Te enviamos un correo para recuperar tu contraseña.')
      setError('')
    } catch {
      setError('No pudimos enviar el correo. Revisa que esté bien escrito.')
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '80px 24px 32px', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--gym-color)', color: '#fff', fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
          {iniciales}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, marginTop: 14 }}>¡Hola de nuevo!</div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{gym.nombre} te está esperando</div>
      </div>

      <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={campo}>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Correo</div>
          <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="tu@correo.com" style={inputStyle} />
        </div>
        <div style={campo}>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Contraseña</div>
          <input type="password" value={clave} onChange={(e) => setClave(e.target.value)} placeholder="••••••••" style={inputStyle} />
        </div>
        <button onClick={olvido} style={{ textAlign: 'right', fontSize: 11.5, fontWeight: 500, color: 'var(--gym-color)' }}>¿Olvidaste tu contraseña?</button>
        {error && <div style={{ fontSize: 11.5, color: 'var(--danger)' }}>{error}</div>}
        {aviso && <div style={{ fontSize: 11.5, color: 'var(--gym-color)' }}>{aviso}</div>}
      </div>

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={entrar} disabled={ocupado} style={{ background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '14px 0', textAlign: 'center', fontSize: 14, fontWeight: 600, opacity: ocupado ? 0.7 : 1 }}>
          {ocupado ? 'Entrando…' : 'Entrar'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: '#e6e6e2' }} />
          <span style={{ fontSize: 11, color: '#a8a8a4' }}>o</span>
          <div style={{ flex: 1, height: 1, background: '#e6e6e2' }} />
        </div>
        <button onClick={conGoogle} disabled={ocupado} style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-md)', padding: '13px 0', textAlign: 'center', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ width: 18, height: 18, borderRadius: 99, background: 'conic-gradient(#ea4335 0 25%, #fbbc05 25% 50%, #34a853 50% 75%, #4285f4 75% 100%)', display: 'inline-block' }} />
          Continuar con Google
        </button>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
        ¿Nuevo en el gym?{' '}
        <button onClick={() => navigate('/')} style={{ fontWeight: 600, color: 'var(--gym-color)', fontSize: 12 }}>
          Regístrate con tu código
        </button>
      </div>
    </div>
  )
}
