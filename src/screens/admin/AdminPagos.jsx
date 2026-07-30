import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGym } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { listarClientes, listarPlanes, registrarPago } from '../../services/db'

const seccion = { fontSize: 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }
const fila = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }
const pesos = (n) => '$' + Number(n).toLocaleString('es-CO')
const DIA_MS = 86400000

function textoVencimiento(c) {
  const vence = c.membresia?.vence?.toDate?.()
  if (!vence) return 'Sin plan'
  const hoy = new Date(new Date().toDateString())
  const dias = Math.round((vence - hoy) / DIA_MS)
  const plan = `${c.membresia.planNombre} · ${pesos(c.membresia.precio)}`
  if (dias < 0) return `Venció hace ${-dias} día${dias === -1 ? '' : 's'} · ${plan}`
  if (dias === 0) return `Vence hoy · ${plan}`
  if (dias === 1) return `Vence mañana · ${plan}`
  return `Vence en ${dias} días · ${plan}`
}

export default function AdminPagos() {
  const navigate = useNavigate()
  const { gym } = useGym()
  const { usuario } = useAuth()
  const [clientes, setClientes] = useState(null)
  const [planes, setPlanes] = useState([])
  const [ocupado, setOcupado] = useState('')

  const cargar = async () => {
    if (!gym.id) return
    const [cl, pl] = await Promise.all([listarClientes(gym.id), listarPlanes(gym.id)])
    setClientes(cl)
    setPlanes(pl)
  }
  useEffect(() => { cargar() }, [gym.id])

  const lista = clientes ?? []
  const vencidos = lista.filter((c) => c.estadoDerivado === 'vencido')
  const porVencer = lista.filter((c) => c.estadoDerivado === 'por_vencer')

  const registrar = async (c) => {
    const plan = planes.find((p) => p.id === c.membresia?.planId) ?? planes[0]
    if (!plan) return
    setOcupado(c.uid)
    try {
      await registrarPago(gym, c.uid, plan, usuario?.uid ?? null)
      await cargar()
    } finally {
      setOcupado('')
    }
  }

  const Fila = ({ c, color }) => (
    <div style={fila}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.nombre}</div>
        <div style={{ fontSize: 11, color }}>{textoVencimiento(c)}</div>
      </div>
      <button onClick={() => registrar(c)} disabled={ocupado === c.uid} style={{ background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap', opacity: ocupado === c.uid ? 0.6 : 1 }}>
        {ocupado === c.uid ? 'Guardando…' : 'Registrar pago'}
      </button>
    </div>
  )

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <button onClick={() => navigate('/admin/mas')} style={{ color: 'rgba(255,255,255,.8)', fontSize: 12 }}>‹ Más</button>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600, marginTop: 8 }}>Pagos</div>
        <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, marginTop: 2 }}>
          {vencidos.length} vencido{vencidos.length === 1 ? '' : 's'} · {porVencer.length} por vencer
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {clientes === null && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 12.5 }}>Cargando pagos…</div>}

        {vencidos.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ ...seccion, color: 'var(--danger)' }}>Vencidos</div>
            {vencidos.map((c) => <Fila key={c.uid} c={c} color="var(--danger)" />)}
          </div>
        )}
        {porVencer.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ ...seccion, color: 'var(--warning-text)' }}>Vencen pronto</div>
            {porVencer.map((c) => <Fila key={c.uid} c={c} color="var(--warning-text)" />)}
          </div>
        )}

        {clientes !== null && vencidos.length === 0 && porVencer.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-2)', fontSize: 13 }}>
            🎉 ¡Todo al día! Nadie debe en este momento.
          </div>
        )}

        <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6 }}>
          Al registrar un pago la vigencia se renueva según tu política y el cliente recibe su recordatorio amable 1 día antes del próximo vencimiento.
        </div>
      </div>
    </>
  )
}
