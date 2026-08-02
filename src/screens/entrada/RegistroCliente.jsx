import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage, auth } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { useGym } from '../../context/ThemeContext'
import { buscarGymPorCodigo, vincularGym, rutaPorRol } from '../../services/db'

const campo = { background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: '11px 14px' }
const inputStyle = { width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, fontWeight: 500, padding: 0, marginTop: 1, fontFamily: 'inherit' }

const MENSAJES = {
  'auth/email-already-in-use': 'Ese correo ya tiene cuenta. Inicia sesión y el gym se vincula solo.',
  'auth/invalid-email': 'Revisa el correo, parece incompleto.',
  'auth/weak-password': 'La contraseña necesita mínimo 6 caracteres.',
}

function Campo({ label, value, onChange, type = 'text', placeholder, inputMode, flex, bloqueado }) {
  return (
    <div style={{ ...campo, flex, opacity: bloqueado ? 0.7 : 1 }}>
      <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{label}</div>
      <input type={type} inputMode={inputMode} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={bloqueado} style={inputStyle} />
    </div>
  )
}

export default function RegistroCliente() {
  const { codigo } = useParams()
  const navigate = useNavigate()
  const { usuario, recargarPerfil, crearCuentaCorreo, entrarConGoogle } = useAuth()
  const { setGym } = useGym()
  const [gym, setGymLocal] = useState(undefined)
  const [form, setForm] = useState({ nombre: '', celular: '', documento: '', dia: '', mes: '', anio: '', correo: '', clave: '' })
  const [foto, setFoto] = useState(null)
  const [vistaFoto, setVistaFoto] = useState(null)
  const [conGoogle, setConGoogle] = useState(false)
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const archivoRef = useRef(null)
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    buscarGymPorCodigo(codigo).then((g) => {
      setGymLocal(g)
      if (g) setGym(g)
    })
  }, [codigo])

  // Si ya venía logueado (p. ej. tocó Google), se prellenan sus datos
  useEffect(() => {
    if (usuario) {
      setConGoogle(true)
      setForm((f) => ({ ...f, nombre: f.nombre || usuario.displayName || '', correo: usuario.email || f.correo }))
      if (usuario.photoURL && !vistaFoto) setVistaFoto(usuario.photoURL)
    }
  }, [usuario])

  if (gym === undefined) return <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 12.5 }}>Buscando tu gimnasio…</div>
  if (!gym) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Este link no es válido</div>
        <button onClick={() => navigate('/')} style={{ marginTop: 14, background: 'var(--zeven-dark)', color: '#fff', borderRadius: 'var(--radius)', padding: '11px 20px', fontSize: 13, fontWeight: 600 }}>Ir al inicio</button>
      </div>
    )
  }

  const color = gym.branding?.color ?? '#16a34a'
  const iniciales = gym.nombre.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()

  const elegirFoto = (archivo) => {
    if (!archivo) return
    setFoto(archivo)
    setVistaFoto(URL.createObjectURL(archivo))
  }

  const google = async () => {
    setOcupado(true)
    setError('')
    try {
      await entrarConGoogle()
    } catch {
      setError('No pudimos conectar con Google. Inténtalo de nuevo.')
    } finally {
      setOcupado(false)
    }
  }

  const nacimiento = () => {
    const { dia, mes, anio } = form
    if (!dia || !mes || !anio) return ''
    return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${anio}`
  }

  const registrar = async () => {
    const faltan = !form.nombre.trim() || !form.celular.trim() || !form.documento.trim() || !nacimiento() || !form.correo.trim()
    if (faltan) {
      setError('Completa todos los datos: tu gimnasio los necesita para identificarte.')
      return
    }
    if (!conGoogle && form.clave.length < 6) {
      setError('La contraseña necesita mínimo 6 caracteres.')
      return
    }
    setOcupado(true)
    setError('')
    try {
      if (!conGoogle) await crearCuentaCorreo(form.correo.trim(), form.clave)
      const user = auth.currentUser
      if (!user) throw new Error('sin sesión')

      let fotoUrl = usuario?.photoURL ?? null
      if (foto) {
        const r = ref(storage, `usuarios/${user.uid}/perfil.jpg`)
        await uploadBytes(r, foto)
        fotoUrl = await getDownloadURL(r)
      }

      await vincularGym(user, gym, {
        nombre: form.nombre.trim(),
        celular: form.celular.trim(),
        documento: form.documento.trim(),
        nacimiento: nacimiento(),
        fotoUrl,
      })
      sessionStorage.removeItem('zg-codigo-invitacion')
      const perfil = await recargarPerfil()
      navigate(rutaPorRol(perfil), { replace: true })
    } catch (e) {
      setError(MENSAJES[e.code] ?? 'No pudimos crear tu cuenta. Inténtalo de nuevo.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <header style={{ background: color, padding: '58px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: '#fff', color, fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flex: 'none' }}>
          {gym.branding?.logoUrl ? <img src={gym.branding.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : iniciales}
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: 17, fontWeight: 600 }}>Crea tu cuenta</div>
          <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 11.5 }}>Te unes a {gym.nombre}</div>
        </div>
      </header>

      <div style={{ padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => archivoRef.current?.click()} style={{ width: 68, height: 68, borderRadius: 99, flex: 'none', border: vistaFoto ? 'none' : '1.5px dashed #c9c9c5', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#a8a8a4', overflow: 'hidden', padding: 0 }}>
            {vistaFoto ? <img src={vistaFoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '+'}
          </button>
          <input ref={archivoRef} type="file" accept="image/*" onChange={(e) => elegirFoto(e.target.files?.[0])} style={{ display: 'none' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Foto de perfil</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Para que en el gym te reconozcan</div>
          </div>
        </div>

        <Campo label="Nombre completo" value={form.nombre} onChange={set('nombre')} placeholder="Tu nombre y apellido" />
        <Campo label="Celular" value={form.celular} onChange={set('celular')} placeholder="300 000 0000" inputMode="tel" />
        <Campo label="Documento" value={form.documento} onChange={set('documento')} placeholder="CC 1.000.000.000" />

        <div style={{ ...campo }}>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Fecha de nacimiento</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <input inputMode="numeric" maxLength={2} value={form.dia} onChange={(e) => set('dia')(e.target.value.replace(/\D/g, ''))} placeholder="DD" style={{ ...inputStyle, width: 34, textAlign: 'center' }} />
            <span style={{ color: 'var(--text-4)' }}>/</span>
            <input inputMode="numeric" maxLength={2} value={form.mes} onChange={(e) => set('mes')(e.target.value.replace(/\D/g, ''))} placeholder="MM" style={{ ...inputStyle, width: 34, textAlign: 'center' }} />
            <span style={{ color: 'var(--text-4)' }}>/</span>
            <input inputMode="numeric" maxLength={4} value={form.anio} onChange={(e) => set('anio')(e.target.value.replace(/\D/g, ''))} placeholder="AAAA" style={{ ...inputStyle, width: 52, textAlign: 'center' }} />
          </div>
        </div>

        <Campo label="Correo" type="email" value={form.correo} onChange={set('correo')} placeholder="tu@correo.com" bloqueado={conGoogle} />
        {!conGoogle && <Campo label="Contraseña" type="password" value={form.clave} onChange={set('clave')} placeholder="Mínimo 6 caracteres" />}

        {error && <div style={{ fontSize: 11.5, color: 'var(--danger)' }}>{error}</div>}

        <button onClick={registrar} disabled={ocupado} style={{ background: color, color: '#fff', borderRadius: 'var(--radius-md)', padding: '14px 0', textAlign: 'center', fontSize: 14, fontWeight: 600, opacity: ocupado ? 0.7 : 1 }}>
          {ocupado ? 'Creando tu cuenta…' : `Unirme a ${gym.nombre}`}
        </button>

        {!conGoogle && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: '#e6e6e2' }} />
              <span style={{ fontSize: 11, color: '#a8a8a4' }}>o</span>
              <div style={{ flex: 1, height: 1, background: '#e6e6e2' }} />
            </div>
            <button onClick={google} disabled={ocupado} style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-md)', padding: '13px 0', textAlign: 'center', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ width: 18, height: 18, borderRadius: 99, background: 'conic-gradient(#ea4335 0 25%, #fbbc05 25% 50%, #34a853 50% 75%, #4285f4 75% 100%)', display: 'inline-block' }} />
              Continuar con Google
            </button>
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
              ¿Ya tienes cuenta?{' '}
              <button onClick={() => navigate('/')} style={{ fontWeight: 600, color, fontSize: 12 }}>Inicia sesión</button>
            </div>
          </>
        )}
        {conGoogle && (
          <div style={{ fontSize: 11.5, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.5 }}>
            Entraste con Google. Completa los datos que te pide tu gimnasio y listo.
          </div>
        )}
      </div>
    </div>
  )
}
