import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGym } from '../../context/ThemeContext'
import { actualizarGymCampos } from '../../services/db'
import IdentidadGym from '../../components/IdentidadGym'

const seccion = { fontSize: 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }
const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }

function Toggle({ activo, onClick }) {
  return (
    <button onClick={onClick} aria-pressed={activo} style={{ width: 42, height: 24, borderRadius: 99, background: activo ? 'var(--gym-color)' : '#d6d6d2', position: 'relative', flex: 'none', transition: 'background .2s' }}>
      <span style={{ position: 'absolute', top: 2, left: activo ? 20 : 2, width: 20, height: 20, borderRadius: 99, background: '#fff', transition: 'left .2s' }} />
    </button>
  )
}

function Fila({ etiqueta, valor, onChange, placeholder }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '9px 0', fontSize: 12.5 }}>
      <span style={{ color: 'var(--text-2)', flex: 'none' }}>{etiqueta}</span>
      <input value={valor} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ fontWeight: 500, fontSize: 12.5, textAlign: 'right', border: 'none', outline: 'none', background: 'transparent', flex: 1, minWidth: 0, fontFamily: 'inherit' }} />
    </div>
  )
}

export default function AdminConfig() {
  const navigate = useNavigate()
  const { gym, setGym } = useGym()
  const [politicas, setPoliticas] = useState({ vigencia: 'desde_pago', permitirCongelar: true, bloquearAlVencer: false, ...gym.politicas })
  const [branding, setBranding] = useState(gym.branding ?? { color: '#16a34a', logoUrl: null, bannerUrl: null })
  const [nombre, setNombre] = useState(gym.nombre ?? '')
  const [ciudad, setCiudad] = useState(gym.ciudad ?? '')
  const [contacto, setContacto] = useState({ celular: '', instagram: '', direccion: '', ...gym.contacto })
  const [horarios, setHorarios] = useState(
    gym.horarios?.length
      ? gym.horarios
      : [
          { dias: 'Lunes a viernes', abre: '', cierra: '' },
          { dias: 'Sábados', abre: '', cierra: '' },
          { dias: 'Domingos', abre: '', cierra: '' },
        ]
  )
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  const setC = (k) => (v) => { setContacto({ ...contacto, [k]: v }); setGuardado(false) }
  const setH = (i, k) => (v) => {
    const nuevos = horarios.map((h, j) => (j === i ? { ...h, [k]: v } : h))
    setHorarios(nuevos)
    setGuardado(false)
  }

  const guardar = async () => {
    setGuardando(true)
    try {
      const campos = { contacto, horarios, politicas, branding }
      if (nombre.trim()) campos.nombre = nombre.trim()
      campos.ciudad = ciudad.trim()
      await actualizarGymCampos(gym.id, campos)
      setGym({ ...gym, ...campos })
      setGuardado(true)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <button onClick={() => navigate('/admin/mas')} style={{ color: 'rgba(255,255,255,.8)', fontSize: 12 }}>‹ Más</button>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600, marginTop: 8 }}>Configuración del gym</div>
        <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, marginTop: 2 }}>Tu identidad, tus horarios y tus reglas</div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <button onClick={() => navigate('/admin/invitar')} style={{ ...card, padding: 14, display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', flex: 'none', background: 'color-mix(in oklab, var(--gym-color) 10%, white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📱</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Invitar clientes</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Tu código QR y tu link · código {gym.codigo}</div>
          </div>
          <span style={{ color: 'var(--text-4)', fontSize: 16 }}>›</span>
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccion}>Identidad de tu gimnasio</div>
          <div style={{ ...card, padding: '2px 14px' }}>
            <div style={{ borderBottom: '1px solid #f2f2f0' }}>
              <Fila etiqueta="Nombre del gimnasio" valor={nombre} onChange={(v) => { setNombre(v); setGuardado(false) }} placeholder="Ej: Titán Gym" />
            </div>
            <Fila etiqueta="Ciudad" valor={ciudad} onChange={(v) => { setCiudad(v); setGuardado(false) }} placeholder="Ej: Bogotá" />
          </div>
          <IdentidadGym gym={{ ...gym, nombre: nombre || gym.nombre, branding }} onChange={(b) => { setBranding(b); setGuardado(false) }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccion}>Contacto y redes</div>
          <div style={{ ...card, padding: '2px 14px' }}>
            <div style={{ borderBottom: '1px solid #f2f2f0' }}><Fila etiqueta="Llamadas y WhatsApp" valor={contacto.celular} onChange={setC('celular')} placeholder="300 000 0000" /></div>
            <div style={{ borderBottom: '1px solid #f2f2f0' }}><Fila etiqueta="Instagram" valor={contacto.instagram} onChange={setC('instagram')} placeholder="@tugym" /></div>
            <Fila etiqueta="Dirección" valor={contacto.direccion} onChange={setC('direccion')} placeholder="Cra 0 #00-00" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccion}>Horarios</div>
          <div style={{ ...card, padding: '2px 14px' }}>
            {horarios.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 0', borderBottom: i < horarios.length - 1 ? '1px solid #f2f2f0' : 'none', fontSize: 12.5 }}>
                <input value={h.dias} onChange={(e) => setH(i, 'dias')(e.target.value)} style={{ color: 'var(--text-2)', border: 'none', outline: 'none', background: 'transparent', flex: 1.2, fontFamily: 'inherit', fontSize: 12.5 }} />
                <input value={h.abre ?? ''} onChange={(e) => setH(i, 'abre')(e.target.value)} placeholder="5:00 am" style={{ fontWeight: 500, textAlign: 'right', border: 'none', outline: 'none', background: 'transparent', flex: 0.8, fontFamily: 'inherit', fontSize: 12.5 }} />
                <span style={{ color: 'var(--text-4)' }}>–</span>
                <input value={h.cierra ?? ''} onChange={(e) => setH(i, 'cierra')(e.target.value)} placeholder="10:00 pm" style={{ fontWeight: 500, border: 'none', outline: 'none', background: 'transparent', flex: 0.8, fontFamily: 'inherit', fontSize: 12.5 }} />
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>Deja las horas vacías para mostrar "Cerrado".</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccion}>Políticas del gym</div>
          <div style={{ ...card, padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>Vigencia de la membresía</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {[
                  ['desde_pago', 'Días desde el pago'],
                  ['corte_fijo', 'Corte fijo del mes'],
                ].map(([valor, texto]) => (
                  <button key={valor} onClick={() => { setPoliticas({ ...politicas, vigencia: valor }); setGuardado(false) }} style={{ fontSize: 11, fontWeight: politicas.vigencia === valor ? 600 : 500, color: politicas.vigencia === valor ? '#fff' : '#565652', background: politicas.vigencia === valor ? 'var(--gym-color)' : 'var(--surface-2)', border: politicas.vigencia === valor ? 'none' : '1px solid var(--border)', borderRadius: 99, padding: '6px 12px' }}>
                    {texto}
                  </button>
                ))}
              </div>
              {politicas.vigencia === 'corte_fijo' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-2)' }}>Día de corte:</span>
                  <input type="number" min="1" max="28" value={politicas.diaCorte ?? ''} onChange={(e) => { setPoliticas({ ...politicas, diaCorte: Number(e.target.value) || null }); setGuardado(false) }} placeholder="1" style={{ width: 52, border: '1px solid var(--border)', borderRadius: 8, padding: '6px 8px', fontSize: 12.5, fontWeight: 600, outline: 'none', textAlign: 'center' }} />
                  <span style={{ color: 'var(--text-3)', fontSize: 11 }}>de cada mes</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>Permitir congelar membresías</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Pausar días sin perder lo pagado</div>
              </div>
              <Toggle activo={politicas.permitirCongelar} onClick={() => { setPoliticas({ ...politicas, permitirCongelar: !politicas.permitirCongelar }); setGuardado(false) }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>Bloquear rutina al vencer</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Si está apagado, solo se muestra un aviso</div>
              </div>
              <Toggle activo={politicas.bloquearAlVencer} onClick={() => { setPoliticas({ ...politicas, bloquearAlVencer: !politicas.bloquearAlVencer }); setGuardado(false) }} />
            </div>
          </div>
        </div>

        <button onClick={guardar} disabled={guardando} style={{ background: guardado ? '#166534' : 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '13px 0', textAlign: 'center', fontSize: 13.5, fontWeight: 600, opacity: guardando ? 0.7 : 1 }}>
          {guardando ? 'Guardando…' : guardado ? '✓ Cambios guardados' : 'Guardar cambios'}
        </button>
      </div>
    </>
  )
}
