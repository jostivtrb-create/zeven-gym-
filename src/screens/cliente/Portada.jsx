import { useEffect, useState } from 'react'
import { useGym } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { listarComunicados, obtenerMembresia } from '../../services/db'
import { haceTexto } from '../admin/AdminComunicados'

const seccionTitulo = { fontSize: 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }
const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }
const DIA_MS = 86400000

export default function Portada() {
  const { gym } = useGym()
  const { perfil } = useAuth()
  const [comunicados, setComunicados] = useState([])
  const [membresia, setMembresia] = useState(null)

  useEffect(() => {
    if (!gym.id) return
    listarComunicados(gym.id).then(setComunicados).catch(() => {})
    if (perfil?.uid) obtenerMembresia(gym.id, perfil.uid).then(setMembresia)
  }, [gym.id, perfil?.uid])

  const nombreCorto = (perfil?.nombre ?? '').split(' ')[0] || '¡hola!'
  const vence = membresia?.vence?.toDate?.()
  const dias = vence ? Math.round((vence - new Date(new Date().toDateString())) / DIA_MS) : null
  const porVencer = dias !== null && dias >= 0 && dias <= 1 && membresia?.estado !== 'congelada'
  const vencida = dias !== null && dias < 0 && membresia?.estado !== 'congelada'

  const iniciales = gym.nombre.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 24px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: 'var(--gym-color)', overflow: 'hidden' }}>
            {gym.branding?.logoUrl ? <img src={gym.branding.logoUrl} alt={gym.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : iniciales}
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>{gym.nombre}</div>
            {gym.ciudad && <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 11.5 }}>{gym.ciudad}</div>}
          </div>
        </div>
        <div style={{ marginTop: 18, color: '#fff', fontSize: 21, fontWeight: 600, lineHeight: 1.2 }}>¡Hola, {nombreCorto}!</div>
        <div style={{ color: 'rgba(255,255,255,.85)', fontSize: 13, marginTop: 2 }}>¡Vamos por ese entreno de hoy!</div>
      </header>

      {porVencer && (
        <div style={{ margin: '14px 16px 0', background: 'var(--warning-bg)', border: '1px solid #fcd34d', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--warning-text)' }}>Tu plan vence {dias === 0 ? 'hoy' : 'mañana'}</div>
          <div style={{ fontSize: 12, color: '#a16207', marginTop: 2 }}>Renuévalo en recepción y sigue sin pausas.</div>
        </div>
      )}
      {vencida && (
        <div style={{ margin: '14px 16px 0', background: 'var(--danger-bg)', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--danger)' }}>Tu plan está vencido</div>
          <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 2 }}>Pásate por recepción y lo reactivamos en un momento.</div>
        </div>
      )}

      {gym.branding?.bannerUrl && (
        <div style={{ margin: 16, height: 150, borderRadius: 'var(--radius-lg)', background: `center/cover url(${gym.branding.bannerUrl})` }} />
      )}

      <div style={{ padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {comunicados.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={seccionTitulo}>Comunicados</div>
            {comunicados.map((c) => (
              <div key={c.id} style={{ ...card, padding: 14 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.titulo}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3, lineHeight: 1.5 }}>{c.texto}</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--gym-color)', marginTop: 8 }}>{haceTexto(c.creadoEl)}</div>
              </div>
            ))}
          </div>
        )}

        {(gym.horarios ?? []).length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={seccionTitulo}>Horarios</div>
            <div style={{ ...card, padding: '6px 14px' }}>
              {gym.horarios.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < gym.horarios.length - 1 ? '1px solid #f2f2f0' : 'none', fontSize: 12.5 }}>
                  <span style={{ color: 'var(--text-2)' }}>{h.dias}</span>
                  {h.abre ? (
                    <span style={{ fontWeight: 500 }}>{h.abre} – {h.cierra}</span>
                  ) : (
                    <span style={{ fontWeight: 500, color: '#a8a8a4' }}>Cerrado</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(gym.contacto?.celular || gym.contacto?.instagram || gym.contacto?.direccion) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={seccionTitulo}>Contacto y redes</div>
            <div style={{ ...card, padding: '6px 14px' }}>
              {[
                ['Llamadas y WhatsApp', gym.contacto?.celular, null],
                ['Instagram', gym.contacto?.instagram, 'var(--gym-color)'],
                ['Dirección', gym.contacto?.direccion, null],
              ].filter(([, v]) => v).map(([k, v, color], i, arr) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid #f2f2f0' : 'none', fontSize: 12.5 }}>
                  <span style={{ color: 'var(--text-2)' }}>{k}</span>
                  <span style={{ fontWeight: 500, color: color ?? 'inherit' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {comunicados.length === 0 && !(gym.horarios ?? []).length && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-3)', fontSize: 12.5, lineHeight: 1.6 }}>
            Tu gimnasio pronto publicará sus avisos y horarios aquí. 💪
          </div>
        )}
      </div>
    </>
  )
}
