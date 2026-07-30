import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGym } from '../../context/ThemeContext'

const seccion = { fontSize: 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }
const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }

function Toggle({ activo, onClick }) {
  return (
    <button onClick={onClick} aria-pressed={activo} style={{ width: 42, height: 24, borderRadius: 99, background: activo ? 'var(--gym-color)' : '#d6d6d2', position: 'relative', flex: 'none', transition: 'background .2s' }}>
      <span style={{ position: 'absolute', top: 2, left: activo ? 20 : 2, width: 20, height: 20, borderRadius: 99, background: '#fff', transition: 'left .2s' }} />
    </button>
  )
}

function FilaEditable({ etiqueta, valor, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '9px 0', fontSize: 12.5 }}>
      <span style={{ color: 'var(--text-2)', flex: 'none' }}>{etiqueta}</span>
      <input value={valor} onChange={(e) => onChange(e.target.value)} style={{ fontWeight: 500, fontSize: 12.5, textAlign: 'right', border: 'none', outline: 'none', background: 'transparent', flex: 1, minWidth: 0, fontFamily: 'inherit' }} />
    </div>
  )
}

export default function AdminConfig() {
  const navigate = useNavigate()
  const { gym, setGym } = useGym()
  const [politicas, setPoliticas] = useState(gym.politicas)
  const [contacto, setContacto] = useState({ celular: gym.contacto.celular, instagram: gym.contacto.instagram, direccion: gym.contacto.direccion })

  const guardarPoliticas = (nuevas) => {
    setPoliticas(nuevas)
    setGym({ ...gym, politicas: nuevas, contacto: { ...gym.contacto, ...contacto } })
  }

  const setC = (k) => (v) => {
    const nuevo = { ...contacto, [k]: v }
    setContacto(nuevo)
    setGym({ ...gym, contacto: { ...gym.contacto, ...nuevo }, politicas })
  }

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <button onClick={() => navigate('/admin/mas')} style={{ color: 'rgba(255,255,255,.8)', fontSize: 12 }}>‹ Más</button>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600, marginTop: 8 }}>Configuración del gym</div>
        <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, marginTop: 2 }}>Los colores y el logo los gestiona Zeven Gym</div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ position: 'relative', height: 120, borderRadius: 'var(--radius-lg)', background: 'repeating-linear-gradient(45deg,#eef2f0 0 10px,#e5eae7 10px 20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '11px ui-monospace,monospace', color: '#8a938e' }}>
          foto de portada del gym
          <button style={{ position: 'absolute', right: 10, bottom: 10, background: '#fff', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '7px 12px', font: '600 11px Poppins,sans-serif', color: '#565652' }}>
            Cambiar portada
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccion}>Contacto y redes</div>
          <div style={{ ...card, padding: '2px 14px' }}>
            <div style={{ borderBottom: '1px solid #f2f2f0' }}><FilaEditable etiqueta="Llamadas y WhatsApp" valor={contacto.celular} onChange={setC('celular')} /></div>
            <div style={{ borderBottom: '1px solid #f2f2f0' }}><FilaEditable etiqueta="Instagram" valor={contacto.instagram} onChange={setC('instagram')} /></div>
            <FilaEditable etiqueta="Dirección" valor={contacto.direccion} onChange={setC('direccion')} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccion}>Horarios</div>
          <div style={{ ...card, padding: '6px 14px' }}>
            {gym.horarios.map((h, i) => (
              <div key={h.dias} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < gym.horarios.length - 1 ? '1px solid #f2f2f0' : 'none', fontSize: 12.5 }}>
                <span style={{ color: 'var(--text-2)' }}>{h.dias}</span>
                <span style={{ fontWeight: 500 }}>{h.abre ? `${h.abre} – ${h.cierra}` : 'Cerrado'}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccion}>Políticas del gym</div>
          <div style={{ ...card, padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>Vigencia de la membresía</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {[
                  ['desde_pago', '30 días desde el pago'],
                  ['corte_fijo', 'Corte fijo del mes'],
                ].map(([valor, texto]) => (
                  <button key={valor} onClick={() => guardarPoliticas({ ...politicas, vigencia: valor })} style={{ fontSize: 11, fontWeight: politicas.vigencia === valor ? 600 : 500, color: politicas.vigencia === valor ? '#fff' : '#565652', background: politicas.vigencia === valor ? 'var(--gym-color)' : 'var(--surface-2)', border: politicas.vigencia === valor ? 'none' : '1px solid var(--border)', borderRadius: 99, padding: '6px 12px' }}>
                    {texto}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>Permitir congelar membresías</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Pausar días sin perder lo pagado</div>
              </div>
              <Toggle activo={politicas.permitirCongelar} onClick={() => guardarPoliticas({ ...politicas, permitirCongelar: !politicas.permitirCongelar })} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>Bloquear rutina al vencer</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Si está apagado, solo se muestra un aviso</div>
              </div>
              <Toggle activo={politicas.bloquearAlVencer} onClick={() => guardarPoliticas({ ...politicas, bloquearAlVencer: !politicas.bloquearAlVencer })} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
