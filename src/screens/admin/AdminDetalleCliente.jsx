import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { demoClientes, ESTADOS, pesos } from '../../data/demoAdmin'
import { iniciales } from './AdminClientes'

const seccionTitulo = { fontSize: 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }
const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }
const FECHA = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })

const demoPagosCliente = [
  { fecha: '11 jul 2026', detalle: 'Plan Quincena · efectivo', monto: 40000 },
  { fecha: '26 jun 2026', detalle: 'Plan Quincena · Nequi', monto: 40000 },
]

export default function AdminDetalleCliente() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const base = demoClientes.find((c) => c.uid === uid) ?? demoClientes[0]
  const [cliente, setCliente] = useState(base)
  const [confirmando, setConfirmando] = useState(false)
  const [nombreConfirm, setNombreConfirm] = useState('')
  const est = ESTADOS[cliente.estado]

  const duracion = cliente.plan === 'Plan Quincena' ? 15 : cliente.plan === 'Plan Día' ? 1 : 30

  const registrarPago = () => {
    // Fase 5a: crea doc en pagos/ y recalcula vence según la política del gym
    const base = new Date() > new Date(cliente.vence + 'T00:00:00') ? new Date() : new Date(cliente.vence + 'T00:00:00')
    base.setDate(base.getDate() + duracion)
    setCliente({ ...cliente, estado: 'activo', vence: base.toISOString().slice(0, 10) })
  }

  const congelar = () => setCliente({ ...cliente, estado: cliente.estado === 'congelado' ? 'activo' : 'congelado', congeladoDesde: 'hoy' })
  const desactivar = () => setCliente({ ...cliente, estado: cliente.estado === 'desactivado' ? 'activo' : 'desactivado', desactivadoEn: 'hoy' })

  const eliminar = () => {
    if (nombreConfirm.trim().toLowerCase() !== cliente.nombre.toLowerCase()) return
    navigate('/admin/clientes')
  }

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <button onClick={() => navigate('/admin/clientes')} style={{ color: 'rgba(255,255,255,.8)', fontSize: 12 }}>
          ‹ Clientes
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 99, background: '#fff', color: 'var(--gym-color)', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {iniciales(cliente.nombre)}
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>{cliente.nombre}</div>
            <div style={{ display: 'inline-block', marginTop: 4, background: '#fff', color: est.color, fontSize: 10.5, fontWeight: 600, borderRadius: 99, padding: '3px 10px' }}>{est.etiqueta}</div>
          </div>
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {cliente.plan && (
          <div style={{ ...card, borderRadius: 'var(--radius-lg)', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{cliente.plan}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gym-color)' }}>{pesos(cliente.precio)}</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3 }}>
              {cliente.estado === 'vencido' ? 'Venció' : 'Vence'} el {FECHA.format(new Date(cliente.vence + 'T00:00:00'))}
            </div>
            <button onClick={registrarPago} style={{ marginTop: 12, width: '100%', background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius)', padding: '12px 0', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
              Registrar pago y renovar {duracion} día{duracion === 1 ? '' : 's'}
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={congelar} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: '11px 0', fontSize: 12, fontWeight: 600, color: '#475569' }}>
            {cliente.estado === 'congelado' ? 'Descongelar' : 'Congelar'}
          </button>
          <button onClick={desactivar} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: '11px 0', fontSize: 12, fontWeight: 600, color: '#475569' }}>
            {cliente.estado === 'desactivado' ? 'Reactivar' : 'Desactivar'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccionTitulo}>Datos</div>
          <div style={{ ...card, padding: '6px 14px' }}>
            {[
              ['Celular', cliente.celular],
              ['Documento', cliente.documento],
              ['Nacimiento', cliente.nacimiento],
            ].map(([k, v], i, arr) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid #f2f2f0' : 'none', fontSize: 12.5 }}>
                <span style={{ color: 'var(--text-2)' }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccionTitulo}>Rutina asignada</div>
          <div style={{ ...card, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{cliente.rutina ?? 'Sin rutina asignada'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{cliente.rutina ? '3 días por semana · plantilla Zeven' : 'Asígnale una desde Rutinas'}</div>
            </div>
            <button onClick={() => navigate('/admin/rutinas')} style={{ fontSize: 12, fontWeight: 600, color: 'var(--gym-color)' }}>
              {cliente.rutina ? 'Cambiar' : 'Asignar'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccionTitulo}>Historial de pagos</div>
          <div style={{ ...card, padding: '6px 14px' }}>
            {demoPagosCliente.map((p, i) => (
              <div key={p.fecha} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < demoPagosCliente.length - 1 ? '1px solid #f2f2f0' : 'none' }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{p.fecha}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.detalle}</div>
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{pesos(p.monto)}</span>
              </div>
            ))}
          </div>
        </div>

        {confirmando ? (
          <div style={{ ...card, border: '1px solid #f3d5d5', padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)' }}>Escribe "{cliente.nombre}" para confirmar</div>
            <input
              value={nombreConfirm}
              onChange={(e) => setNombreConfirm(e.target.value)}
              placeholder={cliente.nombre}
              style={{ marginTop: 10, width: '100%', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => setConfirmando(false)} style={{ flex: 1, border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12.5, fontWeight: 600, background: 'var(--surface)' }}>
                Cancelar
              </button>
              <button
                onClick={eliminar}
                style={{ flex: 1, borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12.5, fontWeight: 600, background: nombreConfirm.trim().toLowerCase() === cliente.nombre.toLowerCase() ? 'var(--danger)' : '#f3d5d5', color: '#fff' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmando(true)} style={{ ...card, border: '1px solid #f3d5d5', padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)' }}>Eliminar cliente definitivamente</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>Te pediremos escribir el nombre para confirmar. Esta acción no se puede deshacer.</div>
          </button>
        )}
      </div>
    </>
  )
}
