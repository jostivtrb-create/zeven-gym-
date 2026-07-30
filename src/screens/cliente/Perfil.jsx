import { useGym } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { demoUsuario, demoMembresia } from '../../data/demo'

const seccionTitulo = { fontSize: 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }
const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }

const demoPagos = [
  { fecha: '29 jun 2026', plan: 'Plan Mensual', monto: 70000 },
  { fecha: '29 may 2026', plan: 'Plan Mensual', monto: 70000 },
  { fecha: '29 abr 2026', plan: 'Plan Mensual', monto: 70000 },
]

const pesos = (n) => '$' + n.toLocaleString('es-CO')

function estadoMembresia(vence) {
  const hoy = new Date(new Date().toDateString())
  const v = new Date(vence + 'T00:00:00')
  const dias = Math.round((v - hoy) / 86400000)
  if (dias < 0) return { etiqueta: 'Vencida', color: '#b91c1c', dias }
  if (dias <= 3) return { etiqueta: 'Por vencer', color: '#92400e', dias }
  return { etiqueta: 'Activa', color: '#166534', dias }
}

const FECHA = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })

export default function Perfil() {
  const { gym } = useGym()
  const { perfil, salir } = useAuth()
  const estado = estadoMembresia(demoMembresia.vence)
  const venceFecha = FECHA.format(new Date(demoMembresia.vence + 'T00:00:00'))
  const datos = perfil ?? demoUsuario

  const cerrarSesion = async () => {
    try {
      await salir()
    } finally {
      location.href = '/'
    }
  }

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 24px', borderRadius: '0 0 var(--radius-header) var(--radius-header)', textAlign: 'center' }}>
        <div style={{ width: 76, height: 76, borderRadius: 99, margin: '0 auto', background: 'repeating-linear-gradient(45deg,#eef2f0 0 8px,#e5eae7 8px 16px)', border: '3px solid rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '9px ui-monospace,monospace', color: '#8a938e' }}>
          foto
        </div>
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 600, marginTop: 10 }}>{datos.nombre}</div>
        <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 11.5, marginTop: 2 }}>Miembro de {gym.nombre} desde marzo 2026</div>
        <div style={{ display: 'inline-block', marginTop: 10, background: '#fff', color: estado.color, fontSize: 11, fontWeight: 600, borderRadius: 99, padding: '4px 12px' }}>
          ● {estado.etiqueta} · {new Date(demoMembresia.vence + 'T00:00:00').getDate()}{' '}
          {new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(new Date(demoMembresia.vence + 'T00:00:00'))}
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ ...card, borderRadius: 'var(--radius-lg)', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{demoMembresia.planNombre}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gym-color)' }}>{pesos(demoMembresia.precio)}</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>
            Vence el <span style={{ fontWeight: 600, color: 'var(--text)' }}>{venceFecha}</span>
            {estado.dias >= 0 && <> · {estado.dias === 0 ? 'vence hoy' : `quedan ${estado.dias} día${estado.dias === 1 ? '' : 's'}`}</>}
          </div>
          {estado.etiqueta === 'Por vencer' && (
            <div style={{ marginTop: 12, background: 'var(--warning-bg)', border: '1px solid #fcd34d', borderRadius: 'var(--radius)', padding: '11px 13px', fontSize: 11.5, color: 'var(--warning-text)', lineHeight: 1.5 }}>
              Tu plan vence {estado.dias === 0 ? 'hoy' : 'mañana'}. Renuévalo en recepción y no pierdas tu racha.
            </div>
          )}
          {estado.etiqueta === 'Vencida' && (
            <div style={{ marginTop: 12, background: 'var(--danger-bg)', border: '1px solid #fca5a5', borderRadius: 'var(--radius)', padding: '11px 13px', fontSize: 11.5, color: 'var(--danger)', lineHeight: 1.5 }}>
              Tu plan está vencido. Pásate por recepción y lo reactivamos en un momento.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccionTitulo}>Historial de pagos</div>
          <div style={{ ...card, padding: '6px 14px' }}>
            {demoPagos.map((p, i) => (
              <div key={p.fecha} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < demoPagos.length - 1 ? '1px solid #f2f2f0' : 'none' }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{p.fecha}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.plan}</div>
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{pesos(p.monto)}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccionTitulo}>Mis datos</div>
          <div style={{ ...card, padding: '6px 14px' }}>
            {[
              ['Celular', datos.celular],
              ['Documento', datos.documento],
              ['Nacimiento', datos.nacimiento],
            ].map(([k, v], i, arr) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid #f2f2f0' : 'none', fontSize: 12.5 }}>
                <span style={{ color: 'var(--text-2)' }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={cerrarSesion} style={{ background: 'var(--surface)', border: '1px solid #f3d5d5', color: 'var(--danger)', borderRadius: 'var(--radius-md)', padding: '12px 0', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
          Cerrar sesión
        </button>
      </div>
    </>
  )
}
