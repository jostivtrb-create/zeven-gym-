import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGym } from '../../context/ThemeContext'
import { buscarGymPorCodigo, vincularGym, rutaPorRol } from '../../services/db'

/* Landing del link/QR del gimnasio: /g/:codigo
   - Con sesión iniciada: vincula y entra.
   - Sin sesión: muestra la marca del gym e invita a crear cuenta (el código
     queda guardado para vincular apenas entre). */
export default function Invitacion() {
  const { codigo } = useParams()
  const navigate = useNavigate()
  const { usuario, perfil, cargando, recargarPerfil } = useAuth()
  const { setGym } = useGym()
  const [gym, setGymLocal] = useState(undefined)
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    buscarGymPorCodigo(codigo).then((g) => {
      setGymLocal(g)
      if (g) {
        setGym(g)
        sessionStorage.setItem('zg-codigo-invitacion', g.codigo)
      }
    })
  }, [codigo])

  const unirme = async () => {
    if (!gym) return
    // Sin cuenta: al formulario de registro, que pide los datos del gimnasio
    if (!usuario) {
      navigate(`/g/${codigo}/registro`)
      return
    }
    // Con cuenta pero sin datos completos: también pasa por el formulario
    if (!perfil?.gymId && (!perfil?.celular || !perfil?.documento)) {
      navigate(`/g/${codigo}/registro`)
      return
    }
    setOcupado(true)
    try {
      await vincularGym(usuario, gym)
      sessionStorage.removeItem('zg-codigo-invitacion')
      const p = await recargarPerfil()
      navigate(rutaPorRol(p), { replace: true })
    } catch (e) {
      console.warn('vincular:', e.code ?? e.message)
      setError('No pudimos vincularte. Inténtalo de nuevo.')
    } finally {
      setOcupado(false)
    }
  }

  if (gym === undefined || cargando) {
    return <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 12.5 }}>Buscando tu gimnasio…</div>
  }

  if (!gym) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Este link no es válido</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.6 }}>
          El código <b>{(codigo ?? '').toUpperCase()}</b> no corresponde a ningún gimnasio. Pídele el link actualizado a tu gym.
        </div>
        <button onClick={() => navigate('/')} style={{ marginTop: 16, background: 'var(--zeven-dark)', color: '#fff', borderRadius: 'var(--radius)', padding: '11px 20px', fontSize: 13, fontWeight: 600 }}>Ir al inicio</button>
      </div>
    )
  }

  const color = gym.branding?.color ?? '#16a34a'
  const iniciales = gym.nombre.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
  const yaEsDeEsteGym = perfil?.gymId === gym.id

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ background: color, padding: '80px 24px 36px', borderRadius: '0 0 var(--radius-header) var(--radius-header)', textAlign: 'center' }}>
        <div style={{ width: 76, height: 76, borderRadius: 22, background: '#fff', color, fontSize: 26, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', overflow: 'hidden' }}>
          {gym.branding?.logoUrl ? <img src={gym.branding.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : iniciales}
        </div>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginTop: 14 }}>{gym.nombre}</div>
        {gym.ciudad && <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 12.5, marginTop: 2 }}>{gym.ciudad}</div>}
        <div style={{ display: 'inline-block', marginTop: 12, background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 11.5, fontWeight: 600, borderRadius: 99, padding: '5px 14px', letterSpacing: '.08em' }}>
          {gym.codigo}
        </div>
      </div>

      <div style={{ flex: 1, padding: '28px 24px 32px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            {yaEsDeEsteGym ? '¡Ya eres parte de este gym!' : `Te invitaron a ${gym.nombre}`}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.6 }}>
            {yaEsDeEsteGym
              ? 'Entra a tu app para ver tu rutina, tu progreso y tu membresía.'
              : usuario
                ? 'Al unirte verás tu rutina, tu progreso y tu membresía de este gimnasio en la app.'
                : 'Crea tu cuenta (o inicia sesión) y quedarás vinculado a este gimnasio automáticamente.'}
          </div>
        </div>

        {error && <div style={{ fontSize: 11.5, color: 'var(--danger)', textAlign: 'center', marginTop: 12 }}>{error}</div>}

        <div style={{ marginTop: 'auto', paddingTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={unirme} disabled={ocupado} style={{ background: color, color: '#fff', borderRadius: 'var(--radius-md)', padding: '15px 0', textAlign: 'center', fontSize: 14.5, fontWeight: 600, opacity: ocupado ? 0.7 : 1 }}>
            {ocupado ? 'Un momento…' : yaEsDeEsteGym ? 'Ir a mi app' : usuario ? `Unirme a ${gym.nombre}` : 'Crear mi cuenta'}
          </button>
          {!usuario && (
            <button onClick={() => navigate('/')} style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--text-3)', padding: '8px 0' }}>
              Ya tengo cuenta · iniciar sesión
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
