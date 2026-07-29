import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGym } from '../../context/ThemeContext'

const campo = { background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: '11px 14px' }
const inputStyle = { width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, fontWeight: 500, padding: 0, marginTop: 1 }

function Campo({ label, type = 'text', value, onChange, flex, placeholder, inputMode }) {
  return (
    <div style={{ ...campo, flex }}>
      <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{label}</div>
      <input type={type} inputMode={inputMode} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
  )
}

export default function Registro() {
  const navigate = useNavigate()
  const { gym } = useGym()
  const [form, setForm] = useState({ nombre: '', celular: '', documento: '', nacimiento: '', correo: '', clave: '' })
  const [error, setError] = useState('')
  const set = (k) => (v) => setForm({ ...form, [k]: v })

  const iniciales = gym.nombre.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()

  const crearCuenta = () => {
    if (!form.nombre || !form.celular || !form.documento || !form.nacimiento || !form.correo || form.clave.length < 6) {
      setError('Completa todos los campos (la contraseña necesita mínimo 6 caracteres).')
      return
    }
    // Fase 5a: createUserWithEmailAndPassword + doc usuarios/{uid} con gymId
    localStorage.setItem('zg-registro', JSON.stringify(form))
    navigate('/app')
  }

  const conGoogle = () => {
    // Fase 5a: signInWithPopup(googleProvider) + completar datos faltantes
    navigate('/app')
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: '#fff', color: 'var(--gym-color)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {iniciales}
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: 17, fontWeight: 600 }}>Crea tu cuenta</div>
          <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 11.5 }}>Te unes a {gym.nombre}</div>
        </div>
      </header>

      <div style={{ padding: '20px 20px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button style={{ width: 64, height: 64, borderRadius: 99, flex: 'none', border: '1.5px dashed #c9c9c5', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#a8a8a4' }}>
            +
          </button>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Foto de perfil</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Para que en el gym te reconozcan</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Campo label="Nombre completo" value={form.nombre} onChange={set('nombre')} placeholder="Tu nombre y apellido" />
          <Campo label="Celular" value={form.celular} onChange={set('celular')} placeholder="300 000 0000" inputMode="tel" />
          <div style={{ display: 'flex', gap: 10 }}>
            <Campo label="Documento" value={form.documento} onChange={set('documento')} placeholder="CC 0.000.000.000" flex={1.3} />
            <Campo label="Nacimiento" type="date" value={form.nacimiento} onChange={set('nacimiento')} flex={1} />
          </div>
          <Campo label="Correo" type="email" value={form.correo} onChange={set('correo')} placeholder="tu@correo.com" />
          <Campo label="Contraseña" type="password" value={form.clave} onChange={set('clave')} placeholder="Mínimo 6 caracteres" />
        </div>

        {error && <div style={{ fontSize: 11.5, color: 'var(--danger)' }}>{error}</div>}

        <button onClick={crearCuenta} style={{ background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '14px 0', textAlign: 'center', fontSize: 14, fontWeight: 600 }}>
          Crear cuenta
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: '#e6e6e2' }} />
          <span style={{ fontSize: 11, color: '#a8a8a4' }}>o</span>
          <div style={{ flex: 1, height: 1, background: '#e6e6e2' }} />
        </div>
        <button onClick={conGoogle} style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-md)', padding: '13px 0', textAlign: 'center', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ width: 18, height: 18, borderRadius: 99, background: 'conic-gradient(#ea4335 0 25%, #fbbc05 25% 50%, #34a853 50% 75%, #4285f4 75% 100%)', display: 'inline-block' }} />
          Continuar con Google
        </button>
      </div>
    </div>
  )
}
