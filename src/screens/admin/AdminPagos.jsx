import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { demoClientes, pesos } from '../../data/demoAdmin'

const seccion = { fontSize: 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }
const fila = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

function textoVencimiento(c) {
  const hoy = new Date(new Date().toDateString())
  const v = new Date(c.vence + 'T00:00:00')
  const dias = Math.round((v - hoy) / 86400000)
  const planCorto = c.plan.replace('Plan ', '')
  if (dias < 0) return `Venció hace ${-dias} día${dias === -1 ? '' : 's'} · ${planCorto} · ${pesos(c.precio)}`
  if (dias === 0) return `Vence hoy · ${planCorto} · ${pesos(c.precio)}`
  if (dias === 1) return `Vence mañana · ${planCorto} · ${pesos(c.precio)}`
  return `Vence el ${DIAS_SEMANA[v.getDay()]} ${v.getDate()} · ${planCorto} · ${pesos(c.precio)}`
}

export default function AdminPagos() {
  const navigate = useNavigate()
  const [pagados, setPagados] = useState([])
  const visibles = demoClientes.filter((c) => !pagados.includes(c.uid))
  const vencidos = visibles.filter((c) => c.estado === 'vencido')
  const porVencer = visibles.filter((c) => c.estado === 'por_vencer')

  const registrar = (uid) => setPagados([...pagados, uid])

  const Fila = ({ c, color }) => (
    <div style={fila}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.nombre}</div>
        <div style={{ fontSize: 11, color }}>{textoVencimiento(c)}</div>
      </div>
      <button onClick={() => registrar(c.uid)} style={{ background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
        Registrar pago
      </button>
    </div>
  )

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <button onClick={() => navigate('/admin/mas')} style={{ color: 'rgba(255,255,255,.8)', fontSize: 12 }}>‹ Más</button>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600, marginTop: 8 }}>Pagos</div>
        <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, marginTop: 2 }}>
          {vencidos.length} vencidos · {porVencer.length} vencen esta semana
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {vencidos.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ ...seccion, color: 'var(--danger)' }}>Vencidos</div>
            {vencidos.map((c) => <Fila key={c.uid} c={c} color="var(--danger)" />)}
          </div>
        )}
        {porVencer.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ ...seccion, color: 'var(--warning-text)' }}>Vencen esta semana</div>
            {porVencer.map((c) => <Fila key={c.uid} c={c} color="var(--warning-text)" />)}
          </div>
        )}
        {vencidos.length === 0 && porVencer.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-2)', fontSize: 13 }}>
            🎉 ¡Todo al día! Nadie debe en este momento.
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6 }}>
          Al registrar un pago la vigencia se renueva según la política del gym y el cliente recibe su recordatorio amable la próxima vez, 1 día antes.
        </div>
      </div>
    </>
  )
}
