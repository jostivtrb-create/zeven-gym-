import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PALETA_GYMS } from '../../data/constantes'
import { crearGimnasio } from '../../services/db'

const seccion = { fontSize: 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }
const campo = { background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: '10px 14px' }
const inputStyle = { width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontWeight: 500, padding: 0, marginTop: 1 }

function Campo({ label, value, onChange, placeholder, flex, bold }) {
  return (
    <div style={{ ...campo, flex }}>
      <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ ...inputStyle, fontWeight: bold ? 600 : 500 }} />
    </div>
  )
}

export default function SuperCrearGym() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', ciudad: '', adminNombre: '', adminCelular: '', adminCorreo: '' })
  const [color, setColor] = useState(PALETA_GYMS[0])
  const [creado, setCreado] = useState(null)
  const [copiado, setCopiado] = useState('')
  const set = (k) => (v) => setForm({ ...form, [k]: v })

  const iniciales = (form.nombre || 'Tu Gym').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)

  const crear = async () => {
    if (!form.nombre.trim() || !form.adminNombre.trim() || !form.adminCorreo.trim()) {
      setError('Completa el nombre del gym, el nombre del dueño y su correo.')
      return
    }
    setOcupado(true)
    setError('')
    try {
      const { codigo } = await crearGimnasio({
        nombre: form.nombre.trim(),
        ciudad: form.ciudad.trim(),
        color,
        admin: { nombre: form.adminNombre.trim(), celular: form.adminCelular.trim(), correo: form.adminCorreo.trim().toLowerCase() },
      })
      setCreado({ codigo, link: `zeven-gym.vercel.app/g/${codigo.toLowerCase()}` })
    } catch (e) {
      console.warn('crearGimnasio:', e.code ?? e.message)
      setError('No se pudo guardar en la base de datos. ¿Iniciaste sesión como superadmin?')
    } finally {
      setOcupado(false)
    }
  }

  const copiar = (texto, cual) => {
    navigator.clipboard?.writeText(texto)
    setCopiado(cual)
    setTimeout(() => setCopiado(''), 1200)
  }

  return (
    <>
      <header style={{ background: 'var(--zeven-dark)', padding: '62px 20px 16px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <button onClick={() => navigate('/super/gimnasios')} style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>‹ Gimnasios</button>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600, marginTop: 8 }}>Crear gimnasio</div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={seccion}>El gimnasio</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', flex: 'none', border: '1.5px dashed #c9c9c5', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#a8a8a4' }}>+</button>
            <div style={{ flex: 1 }}>
              <Campo label="Nombre" value={form.nombre} onChange={set('nombre')} placeholder="Ej: Titán Gym" bold />
            </div>
          </div>
          <Campo label="Ciudad" value={form.ciudad} onChange={set('ciudad')} placeholder="Ej: Bogotá" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={seccion}>Colores del branding</div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {PALETA_GYMS.map((c) => (
                <button key={c} onClick={() => setColor(c)} aria-label={`Color ${c}`} style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', background: c, outline: color === c ? '2.5px solid var(--zeven-dark)' : 'none', outlineOffset: 2 }} />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: color, flex: 'none', border: '1px solid var(--border-2)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>o escribe el color de su marca:</span>
              <input
                value={color}
                onChange={(e) => {
                  let v = e.target.value.trim()
                  if (v && !v.startsWith('#')) v = '#' + v
                  setColor(v.slice(0, 7))
                }}
                placeholder="#16a34a"
                maxLength={7}
                style={{ flex: 1, minWidth: 0, border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '7px 10px', fontSize: 12.5, fontWeight: 600, outline: 'none', fontFamily: 'ui-monospace, monospace', textTransform: 'lowercase' }}
              />
            </div>
            <div style={{ marginTop: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <div style={{ background: color, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: 7, background: '#fff', color, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{iniciales}</div>
                <span style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>Así lo verán sus clientes</span>
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--bg)' }}>
                <div style={{ height: 8, width: '70%', borderRadius: 99, background: '#e6e6e2' }} />
                <div style={{ height: 8, width: '45%', borderRadius: 99, background: '#e6e6e2', marginTop: 6 }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={seccion}>Cuenta del dueño (admin)</div>
          <Campo label="Nombre" value={form.adminNombre} onChange={set('adminNombre')} placeholder="Nombre del dueño" />
          <div style={{ display: 'flex', gap: 8 }}>
            <Campo label="Celular" value={form.adminCelular} onChange={set('adminCelular')} placeholder="300 000 0000" flex={1} />
            <Campo label="Correo" value={form.adminCorreo} onChange={set('adminCorreo')} placeholder="dueno@sugym.co" flex={1.4} />
          </div>
        </div>

        {error && <div style={{ fontSize: 11.5, color: 'var(--danger)' }}>{error}</div>}
        <button onClick={crear} disabled={ocupado || !!creado} style={{ background: 'var(--zeven-dark)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '13px 0', textAlign: 'center', fontSize: 13.5, fontWeight: 600, opacity: creado || ocupado ? 0.5 : 1 }}>
          {ocupado ? 'Creando…' : 'Crear gimnasio y generar acceso'}
        </button>

        {creado && (
          <div style={{ background: 'var(--surface)', border: `1.5px solid ${color}`, borderRadius: 'var(--radius-lg)', padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '.06em' }}>✓ Gimnasio creado</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <div style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '9px 12px' }}>
                <div style={{ fontSize: 9.5, color: 'var(--text-3)' }}>Código único</div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '.12em' }}>{creado.codigo}</div>
              </div>
              <button onClick={() => copiar(creado.codigo, 'codigo')} style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '0 14px', fontSize: 11.5, fontWeight: 600, color: '#565652' }}>
                {copiado === 'codigo' ? '✓' : 'Copiar'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <div style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '9px 12px', minWidth: 0 }}>
                <div style={{ fontSize: 9.5, color: 'var(--text-3)' }}>Link de invitación</div>
                <div style={{ fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{creado.link}</div>
              </div>
              <button onClick={() => copiar(`https://${creado.link}`, 'link')} style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '0 14px', fontSize: 11.5, fontWeight: 600, color: '#565652' }}>
                {copiado === 'link' ? '✓' : 'Copiar'}
              </button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 10, lineHeight: 1.5 }}>
              Compártelos con el dueño: sus clientes entran con este código o link y reciben el branding del gym. La prueba de 30 días empieza hoy.
            </div>
          </div>
        )}
      </div>
    </>
  )
}
