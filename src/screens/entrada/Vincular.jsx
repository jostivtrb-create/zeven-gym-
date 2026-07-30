import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGym } from '../../context/ThemeContext'
import { buscarGymPorCodigo, vincularGym, rutaPorRol } from '../../services/db'

/* Pantalla para un usuario logueado que aún no pertenece a ningún gimnasio.
   Llega aquí por el menú, o directo desde el link/QR del gym (/g/:codigo). */
export default function Vincular() {
  const navigate = useNavigate()
  const { codigo: codigoUrl } = useParams()
  const { usuario, perfil, salir, recargarPerfil } = useAuth()
  const { setGym } = useGym()
  const [codigo, setCodigo] = useState('')
  const [encontrado, setEncontrado] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const timer = useRef(null)

  // Si ya tiene gym, no debería estar aquí
  useEffect(() => {
    if (perfil?.gymId) navigate(rutaPorRol(perfil), { replace: true })
  }, [perfil?.gymId])

  const buscar = (valor) => {
    const limpio = valor.toUpperCase().replace(/[^A-Z0-9]/g, '')
    setCodigo(limpio)
    setError('')
    setEncontrado(null)
    clearTimeout(timer.current)
    if (limpio.length < 4) return
    setBuscando(true)
    timer.current = setTimeout(async () => {
      const gym = await buscarGymPorCodigo(limpio)
      setBuscando(false)
      if (gym) {
        setEncontrado(gym)
        setGym(gym)
      } else {
        setError('No encontramos un gimnasio con ese código. Revísalo con tu gym.')
      }
    }, 400)
  }

  useEffect(() => {
    // Código del link/QR, o el que quedó pendiente de una invitación
    const pendiente = codigoUrl ?? sessionStorage.getItem('zg-codigo-invitacion')
    if (pendiente) buscar(pendiente)
    return () => clearTimeout(timer.current)
  }, [codigoUrl])

  const entrar = async () => {
    if (!encontrado || !usuario) return
    setOcupado(true)
    try {
      const nombreNuevo = sessionStorage.getItem('zg-nombre-nuevo')
      await vincularGym(usuario, encontrado, nombreNuevo ? { nombre: nombreNuevo } : {})
      sessionStorage.removeItem('zg-nombre-nuevo')
      sessionStorage.removeItem('zg-codigo-invitacion')
      const p = await recargarPerfil()
      navigate(rutaPorRol(p), { replace: true })
    } catch (e) {
      console.warn('vincularGym:', e.code ?? e.message)
      setError('No pudimos vincularte. Inténtalo de nuevo.')
    } finally {
      setOcupado(false)
    }
  }

  const cerrarSesion = async () => {
    try {
      await salir()
    } finally {
      location.href = '/'
    }
  }

  const iniciales = encontrado ? encontrado.nombre.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() : ''
  const color = encontrado?.branding?.color ?? 'var(--zeven-dark)'

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '72px 24px 32px', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--zeven-dark)', color: '#fff', fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>🏋️</div>
        <div style={{ fontSize: 19, fontWeight: 700, marginTop: 14 }}>Aún no tienes gimnasio</div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.6 }}>
          Escanea el <b>código QR</b> o abre el <b>link</b> que te da tu gimnasio. También puedes escribir su código aquí:
        </div>
      </div>

      <div style={{ marginTop: 26 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#565652' }}>Código del gimnasio</div>
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--surface)',
            border: encontrado ? `1.5px solid ${color}` : error ? '1.5px solid var(--danger)' : '1.5px solid var(--border-2)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 16px',
          }}
        >
          <input
            value={codigo}
            onChange={(e) => buscar(e.target.value)}
            placeholder="EJ: TITAN26"
            autoCapitalize="characters"
            autoFocus
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, fontWeight: 700, letterSpacing: '.14em', padding: '8px 0', fontFamily: 'inherit' }}
          />
          {buscando && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>…</span>}
          {encontrado && <span style={{ color, fontSize: 14, fontWeight: 700 }}>✓</span>}
        </div>
        {error && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 8 }}>{error}</div>}
      </div>

      {encontrado && (
        <div style={{ marginTop: 20, background: `color-mix(in oklab, ${color} 8%, white)`, border: `1px solid color-mix(in oklab, ${color} 25%, white)`, borderRadius: 'var(--radius-lg)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 'var(--radius-md)', background: color, color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {encontrado.branding?.logoUrl ? <img src={encontrado.branding.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : iniciales}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '.06em' }}>¡Encontramos tu gym!</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 1 }}>{encontrado.nombre}</div>
            {encontrado.ciudad && <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{encontrado.ciudad}</div>}
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={entrar} disabled={!encontrado || ocupado} style={{ background: encontrado ? color : 'var(--border-2)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '14px 0', textAlign: 'center', fontSize: 14, fontWeight: 600, opacity: ocupado ? 0.7 : 1 }}>
          {ocupado ? 'Vinculando…' : encontrado ? `Unirme a ${encontrado.nombre}` : 'Escribe tu código'}
        </button>
        <button onClick={cerrarSesion} style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', padding: '8px 0' }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
