import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { listarGimnasios, actualizarSuscripcionGym } from '../../services/db'
import { useGym } from '../../context/ThemeContext'
import { ESTADOS_GYM } from '../../data/constantes'

const seccion = { fontSize: 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }
const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }
const MES = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' })
const FECHA = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' })

export default function SuperDetalleGym() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setGym, setSoporte } = useGym()
  const [gym, setGymLocal] = useState(null)
  const [confirmando, setConfirmando] = useState(false)
  const [ocupado, setOcupado] = useState(false)

  const cargar = () =>
    listarGimnasios()
      .then((lista) => setGymLocal(lista.find((g) => g.id === id) ?? 'no-existe'))
      .catch(() => setGymLocal('no-existe'))

  useEffect(() => { cargar() }, [id])

  if (gym === null) {
    return <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-3)', fontSize: 12.5 }}>Cargando gimnasio…</div>
  }
  if (gym === 'no-existe') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>No encontramos este gimnasio</div>
        <button onClick={() => navigate('/super/gimnasios')} style={{ marginTop: 12, fontSize: 12.5, fontWeight: 600, color: 'var(--zeven-dark)' }}>‹ Volver a gimnasios</button>
      </div>
    )
  }

  const color = gym.branding?.color ?? '#16a34a'
  const suspendido = gym.estado === 'suspendido'
  const est = ESTADOS_GYM[gym.estado]
  const desde = gym.creadoEl?.toDate ? MES.format(gym.creadoEl.toDate()) : ''
  const iniciales = gym.nombre.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  const entrarSoporte = () => {
    setGym({ ...gym, branding: { color, logoUrl: gym.branding?.logoUrl ?? null, bannerUrl: gym.branding?.bannerUrl ?? null } })
    setSoporte({ gymNombre: gym.nombre })
    navigate('/admin')
  }

  const alternarSuspension = async () => {
    setOcupado(true)
    try {
      await actualizarSuscripcionGym(gym.id, {
        ...gym.suscripcion,
        estado: suspendido ? 'activo' : 'suspendido',
      })
      setConfirmando(false)
      await cargar()
    } finally {
      setOcupado(false)
    }
  }

  const textoSuscripcion = () => {
    const ultimo = gym.suscripcion?.ultimoPagoEl
    const corte = gym.suscripcion?.proximoCorte
    const f = (t) => (t?.toDate ? FECHA.format(t.toDate()) : null)
    if (gym.estado === 'prueba') return `En prueba gratis · quedan ${gym.diasPrueba} días`
    if (f(ultimo) && f(corte)) return `Último pago: ${f(ultimo)} · próximo corte: ${f(corte)}`
    return 'Sin pagos registrados aún'
  }

  return (
    <>
      <header style={{ background: 'var(--zeven-dark)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <button onClick={() => navigate('/super/gimnasios')} style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>‹ Gimnasios</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: color, color: '#fff', fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {iniciales}
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>{gym.nombre}</div>
            <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 11.5 }}>
              {[gym.ciudad, `código ${gym.codigo}`, desde && `desde ${desde}`].filter(Boolean).join(' · ')}
            </div>
          </div>
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ ...card, padding: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{gym.clientes}</div>
            <div style={{ fontSize: 10, color: 'var(--text-2)' }}>cliente{gym.clientes === 1 ? '' : 's'} registrados</div>
          </div>
          <div style={{ ...card, padding: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: est.color, marginTop: 3 }}>{est.etiqueta}</div>
            <div style={{ fontSize: 10, color: 'var(--text-2)' }}>estado de la suscripción</div>
          </div>
        </div>

        <button onClick={entrarSoporte} style={{ background: 'var(--zeven-dark)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '13px 0', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
          Entrar como soporte →
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccion}>Suscripción</div>
          <div style={{ ...card, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>$79.000 / mes</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: est.color, background: est.bg, borderRadius: 99, padding: '3px 9px' }}>{est.etiqueta}</div>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 4 }}>{textoSuscripcion()}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccion}>Acceso del gimnasio</div>
          <div style={{ ...card, padding: '6px 14px' }}>
            {[
              ['Código único', gym.codigo],
              ['Link de invitación', `zeven-gym.vercel.app/g/${(gym.codigo ?? '').toLowerCase()}`],
              ['Correo del admin', gym.adminCorreo ?? '—'],
            ].map(([k, v], i, arr) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid #f2f2f0' : 'none', fontSize: 12.5 }}>
                <span style={{ color: 'var(--text-2)', flex: 'none' }}>{k}</span>
                <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccion}>Branding</div>
          <div style={{ ...card, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: color }} />
            <div style={{ width: 26, height: 26, borderRadius: 8, background: `color-mix(in srgb, ${color} 60%, #000)` }} />
            <div style={{ flex: 1, fontSize: 11.5, color: 'var(--text-2)' }}>Color del gym · lo ven sus clientes</div>
          </div>
        </div>

        {confirmando ? (
          <div style={{ ...card, border: '1px solid #f3d5d5', padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)' }}>
              ¿{suspendido ? 'Reactivar' : 'Suspender'} {gym.nombre}?
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => setConfirmando(false)} style={{ flex: 1, border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12.5, fontWeight: 600, background: 'var(--surface)' }}>Cancelar</button>
              <button onClick={alternarSuspension} disabled={ocupado} style={{ flex: 1, borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12.5, fontWeight: 600, background: suspendido ? '#166534' : 'var(--danger)', color: '#fff', opacity: ocupado ? 0.6 : 1 }}>
                {ocupado ? 'Guardando…' : suspendido ? 'Reactivar' : 'Suspender'}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmando(true)} style={{ ...card, border: suspendido ? '1px solid #bbf7d0' : '1px solid #f3d5d5', padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: suspendido ? '#166534' : 'var(--danger)' }}>
              {suspendido ? 'Reactivar gimnasio' : 'Suspender gimnasio'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>
              {suspendido ? 'El admin y sus clientes recuperan el acceso.' : 'Te pediremos confirmarlo. El admin y sus clientes pierden acceso hasta reactivarlo.'}
            </div>
          </button>
        )}
      </div>
    </>
  )
}
