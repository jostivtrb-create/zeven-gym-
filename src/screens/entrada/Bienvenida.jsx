import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGym } from '../../context/ThemeContext'
import { demoGym } from '../../data/demo'

export default function Bienvenida() {
  const navigate = useNavigate()
  const { setGym } = useGym()
  const [codigo, setCodigo] = useState('')
  const [gymEncontrado, setGymEncontrado] = useState(null)
  const [error, setError] = useState(false)

  const buscar = (valor) => {
    const limpio = valor.toUpperCase().replace(/\s/g, '')
    setCodigo(limpio)
    setError(false)
    // Fase 5a: consulta a Firestore por codigo. Demo: TITAN26.
    if (limpio === demoGym.codigo) {
      setGymEncontrado(demoGym)
      setGym(demoGym)
    } else {
      setGymEncontrado(null)
    }
  }

  const continuar = () => {
    if (!gymEncontrado) {
      setError(true)
      return
    }
    navigate('/registro')
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '80px 24px 32px', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--zeven-dark)', color: '#fff', fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
          Z
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 14, letterSpacing: '-.01em' }}>Zeven Gym</div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>La app de tu gimnasio</div>
      </div>

      <div style={{ marginTop: 36 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#565652' }}>Código de tu gimnasio</div>
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--surface)',
            border: gymEncontrado ? '1.5px solid var(--gym-color)' : error ? '1.5px solid var(--danger)' : '1.5px solid var(--border-2)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 16px',
          }}
        >
          <input
            value={codigo}
            onChange={(e) => buscar(e.target.value)}
            placeholder="EJ: TITAN26"
            autoCapitalize="characters"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, fontWeight: 700, letterSpacing: '.14em', padding: '8px 0' }}
          />
          {gymEncontrado && <span style={{ color: 'var(--gym-color)', fontSize: 14, fontWeight: 700 }}>✓</span>}
        </div>
        <div style={{ fontSize: 11, color: error ? 'var(--danger)' : 'var(--text-3)', marginTop: 8 }}>
          {error ? 'No encontramos un gimnasio con ese código. Revísalo con tu gym.' : 'Te lo da tu gym al inscribirte, o entra directo con su link.'}
        </div>
      </div>

      {gymEncontrado && (
        <div style={{ marginTop: 20, background: 'color-mix(in oklab, var(--gym-color) 8%, white)', border: '1px solid color-mix(in oklab, var(--gym-color) 25%, white)', borderRadius: 'var(--radius-lg)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 'var(--radius-md)', background: 'var(--gym-color)', color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {gymEncontrado.nombre.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gym-color)', textTransform: 'uppercase', letterSpacing: '.06em' }}>¡Encontramos tu gym!</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 1 }}>{gymEncontrado.nombre}</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{gymEncontrado.ciudad}</div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={continuar} style={{ background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '14px 0', textAlign: 'center', fontSize: 14, fontWeight: 600, opacity: gymEncontrado ? 1 : 0.6 }}>
          Continuar
        </button>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
          ¿Ya tienes cuenta?{' '}
          <button onClick={() => navigate('/login')} style={{ fontWeight: 600, color: 'var(--gym-color)', fontSize: 12 }}>
            Inicia sesión
          </button>
        </div>
      </div>
    </div>
  )
}
