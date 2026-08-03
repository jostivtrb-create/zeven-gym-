import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGym } from '../../context/ThemeContext'
import { auth } from '../../firebase'
import { rutaPorRol, buscarGymPorCodigo, vincularGym } from '../../services/db'

const campo = { background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: '11px 14px' }
const inputStyle = { width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, fontWeight: 500, padding: 0, marginTop: 1, fontFamily: 'inherit' }

const MENSAJES = {
  'auth/email-already-in-use': 'Ese correo ya tiene cuenta. Cambia a "Ya tengo cuenta" para entrar.',
  'auth/invalid-email': 'Revisa el correo, parece incompleto.',
  'auth/weak-password': 'La contraseña necesita mínimo 6 caracteres.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/user-not-found': 'No encontramos una cuenta con ese correo.',
}

export default function Entrada() {
  const navigate = useNavigate()
  const { usuario, perfil, cargando, entrarConGoogle, entrarConCorreo, crearCuentaCorreo, recuperarClave, recargarPerfil } = useAuth()
  const { setGym } = useGym()
  const [modo, setModo] = useState('entrar') // 'entrar' | 'crear'
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [invitacion, setInvitacion] = useState(null) // gym del link/QR

  // Si llegó por el link o el QR de un gimnasio, se recuerda para vincularlo
  // automáticamente apenas cree su cuenta o inicie sesión.
  useEffect(() => {
    const codigo = sessionStorage.getItem('zg-codigo-invitacion')
    if (!codigo) return
    buscarGymPorCodigo(codigo).then((gym) => {
      if (gym) {
        setInvitacion(gym)
        setGym(gym)
        setModo('crear')
      }
    })
  }, [])

  // Sesión ya viva (p. ej. la PWA se vuelve a abrir): saltar el login y entrar
  // directo. Firebase sí recuerda la sesión; lo que faltaba era este redirect.
  // No aplica si viene de un link/QR de invitación (ese flujo vincula primero).
  useEffect(() => {
    if (cargando || !usuario || !perfil) return
    if (invitacion || sessionStorage.getItem('zg-codigo-invitacion')) return
    navigate(perfil.gymId || perfil.rol !== 'cliente' ? rutaPorRol(perfil) : '/vincular', { replace: true })
  }, [cargando, usuario, perfil, invitacion, navigate])

  const seguir = async () => {
    const perfil = await recargarPerfil()

    // Admin invitado o superadmin: directo a su panel, sin vincular como cliente
    if (perfil?.rol === 'admin' || perfil?.rol === 'superadmin') {
      navigate(rutaPorRol(perfil))
      return
    }

    // Venía de un link/QR y aún no tiene gym
    if (invitacion && !perfil?.gymId) {
      // Si le faltan los datos que pide el gimnasio, primero el registro completo
      if (!perfil?.celular || !perfil?.documento) {
        navigate(`/g/${invitacion.codigo.toLowerCase()}/registro`)
        return
      }
      await vincularGym(auth.currentUser, invitacion)
      sessionStorage.removeItem('zg-codigo-invitacion')
      const actualizado = await recargarPerfil()
      navigate(rutaPorRol(actualizado))
      return
    }

    navigate(perfil?.gymId ? rutaPorRol(perfil) : '/vincular')
  }

  const conGoogle = async () => {
    setOcupado(true)
    setError('')
    try {
      const cred = await entrarConGoogle()
      if (cred?.user) await seguir()
    } catch {
      setError('No pudimos conectar con Google. Inténtalo de nuevo.')
    } finally {
      setOcupado(false)
    }
  }

  const conCorreo = async () => {
    if (!correo.trim() || !clave) {
      setError('Escribe tu correo y contraseña.')
      return
    }
    if (modo === 'crear' && !nombre.trim()) {
      setError('Escribe tu nombre para crear la cuenta.')
      return
    }
    setOcupado(true)
    setError('')
    try {
      if (modo === 'crear') {
        await crearCuentaCorreo(correo.trim(), clave)
      } else {
        await entrarConCorreo(correo.trim(), clave)
      }
      if (modo === 'crear') sessionStorage.setItem('zg-nombre-nuevo', nombre.trim())
      await seguir()
    } catch (e) {
      setError(MENSAJES[e.code] ?? 'No pudimos continuar. Inténtalo de nuevo.')
    } finally {
      setOcupado(false)
    }
  }

  const olvido = async () => {
    if (!correo.trim()) {
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

  // Mientras Firebase restaura la sesión guardada, splash en vez del formulario
  // (evita el destello de "login" a quien ya tiene sesión).
  if (cargando) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'var(--bg)' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--zeven-dark)', color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Z</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Cargando…</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '72px 24px 32px', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        {invitacion ? (
          <>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: invitacion.branding?.color ?? 'var(--zeven-dark)', color: '#fff', fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', overflow: 'hidden' }}>
              {invitacion.branding?.logoUrl
                ? <img src={invitacion.branding.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : invitacion.nombre.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 14, letterSpacing: '-.01em' }}>{invitacion.nombre}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
              {modo === 'crear' ? 'Crea tu cuenta y quedas dentro del gym' : 'Inicia sesión y quedas dentro del gym'}
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--zeven-dark)', color: '#fff', fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>Z</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 14, letterSpacing: '-.01em' }}>Zeven Gym</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
              {modo === 'crear' ? 'Crea tu cuenta para empezar' : 'La app de tu gimnasio'}
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {modo === 'crear' && (
          <div style={campo}>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Nombre completo</div>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre y apellido" style={inputStyle} />
          </div>
        )}
        <div style={campo}>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Correo</div>
          <input type="email" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="tu@correo.com" style={inputStyle} />
        </div>
        <div style={campo}>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Contraseña</div>
          <input type="password" autoComplete={modo === 'crear' ? 'new-password' : 'current-password'} value={clave} onChange={(e) => setClave(e.target.value)} placeholder={modo === 'crear' ? 'Mínimo 6 caracteres' : '••••••••'} style={inputStyle} />
        </div>
        {modo === 'entrar' && (
          <button onClick={olvido} style={{ textAlign: 'right', fontSize: 11.5, fontWeight: 500, color: 'var(--zeven-dark)' }}>¿Olvidaste tu contraseña?</button>
        )}
        {error && <div style={{ fontSize: 11.5, color: 'var(--danger)' }}>{error}</div>}
        {aviso && <div style={{ fontSize: 11.5, color: '#166534' }}>{aviso}</div>}
      </div>

      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={conCorreo} disabled={ocupado} style={{ background: invitacion ? 'var(--gym-color)' : 'var(--zeven-dark)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '14px 0', textAlign: 'center', fontSize: 14, fontWeight: 600, opacity: ocupado ? 0.7 : 1 }}>
          {ocupado ? 'Un momento…' : modo === 'crear' ? (invitacion ? `Crear cuenta y unirme` : 'Crear cuenta') : 'Entrar'}
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
        {modo === 'crear' ? '¿Ya tienes cuenta? ' : '¿Eres nuevo? '}
        <button onClick={() => { setModo(modo === 'crear' ? 'entrar' : 'crear'); setError(''); setAviso('') }} style={{ fontWeight: 600, color: 'var(--zeven-dark)', fontSize: 12 }}>
          {modo === 'crear' ? 'Inicia sesión' : 'Crea tu cuenta'}
        </button>
      </div>
    </div>
  )
}
