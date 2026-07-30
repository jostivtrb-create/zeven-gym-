import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGym } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { obtenerCliente, listarPlanes, listarPagosCliente, listarRutinas, registrarPago, congelarMembresia, actualizarUsuario, eliminarCliente, asignarRutina, desvincularGym, calcularVencimiento, actualizarVencimiento, aISO, deISO } from '../../services/db'
import { ESTADOS, iniciales } from './AdminClientes'

const seccionTitulo = { fontSize: 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }
const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }
const pesos = (n) => '$' + Number(n).toLocaleString('es-CO')
const FECHA = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
const FECHA_CORTA = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })

export default function AdminDetalleCliente() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const { gym } = useGym()
  const { usuario } = useAuth()
  const [cliente, setCliente] = useState(null)
  const [planes, setPlanes] = useState([])
  const [pagos, setPagos] = useState([])
  const [rutinas, setRutinas] = useState([])
  const [eligiendoPlan, setEligiendoPlan] = useState(false)
  const [planElegido, setPlanElegido] = useState(null)
  const [fechaVence, setFechaVence] = useState('')
  const [editandoFecha, setEditandoFecha] = useState(false)
  const [eligiendoRutina, setEligiendoRutina] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [nombreConfirm, setNombreConfirm] = useState('')
  const [ocupado, setOcupado] = useState(false)

  const cargar = async () => {
    if (!gym.id) return
    const [c, pl, pg, rt] = await Promise.all([
      obtenerCliente(gym.id, uid),
      listarPlanes(gym.id),
      listarPagosCliente(gym.id, uid),
      listarRutinas(gym.id),
    ])
    setCliente(c ?? 'no-existe')
    setPlanes(pl)
    setPagos(pg)
    setRutinas(rt)
  }
  useEffect(() => { cargar() }, [gym.id, uid])

  if (cliente === null) return <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-3)', fontSize: 12.5 }}>Cargando cliente…</div>
  if (cliente === 'no-existe')
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Este cliente ya no existe</div>
        <button onClick={() => navigate('/admin/clientes')} style={{ marginTop: 12, fontSize: 12.5, fontWeight: 600, color: 'var(--gym-color)' }}>‹ Volver a clientes</button>
      </div>
    )

  const est = ESTADOS[cliente.estadoDerivado]
  const m = cliente.membresia
  const vence = m?.vence?.toDate?.()
  const rutinaActual = rutinas.find((r) => r.id === cliente.rutinaId)

  // Paso 1: elegir el plan → se propone la fecha del próximo pago (editable)
  const elegirPlan = (plan) => {
    setPlanElegido(plan)
    setFechaVence(aISO(calcularVencimiento(gym, cliente.membresia, plan)))
  }

  // Paso 2: confirmar el pago con la fecha que decidió el admin
  const cobrar = async () => {
    if (!planElegido || !fechaVence) return
    setOcupado(true)
    try {
      await registrarPago(gym, uid, planElegido, usuario?.uid ?? null, deISO(fechaVence))
      setEligiendoPlan(false)
      setPlanElegido(null)
      await cargar()
    } finally {
      setOcupado(false)
    }
  }

  // Corregir solo la fecha, sin cobrar (para clientes que ya venían pagando)
  const guardarFecha = async () => {
    if (!fechaVence) return
    setOcupado(true)
    try {
      await actualizarVencimiento(gym.id, uid, deISO(fechaVence))
      setEditandoFecha(false)
      await cargar()
    } finally {
      setOcupado(false)
    }
  }

  const congelar = async () => {
    setOcupado(true)
    try {
      await congelarMembresia(gym.id, uid, cliente.estadoDerivado !== 'congelado')
      await cargar()
    } finally {
      setOcupado(false)
    }
  }

  const desactivar = async () => {
    setOcupado(true)
    try {
      await actualizarUsuario(uid, { estado: cliente.estado === 'desactivado' ? 'activo' : 'desactivado' })
      await cargar()
    } finally {
      setOcupado(false)
    }
  }

  const asignar = async (rutinaId) => {
    setOcupado(true)
    try {
      await asignarRutina(uid, rutinaId)
      setEligiendoRutina(false)
      await cargar()
    } finally {
      setOcupado(false)
    }
  }

  const sacarDelGym = async () => {
    setOcupado(true)
    try {
      await desvincularGym(uid)
      navigate('/admin/clientes')
    } finally {
      setOcupado(false)
    }
  }

  const eliminar = async () => {
    if (nombreConfirm.trim().toLowerCase() !== (cliente.nombre ?? '').toLowerCase()) return
    setOcupado(true)
    try {
      await eliminarCliente(gym.id, uid)
      navigate('/admin/clientes')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <button onClick={() => navigate('/admin/clientes')} style={{ color: 'rgba(255,255,255,.8)', fontSize: 12 }}>‹ Clientes</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 99, background: '#fff', color: 'var(--gym-color)', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {cliente.fotoUrl ? <img src={cliente.fotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : iniciales(cliente.nombre)}
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>{cliente.nombre}</div>
            <div style={{ display: 'inline-block', marginTop: 4, background: '#fff', color: est.color, fontSize: 10.5, fontWeight: 600, borderRadius: 99, padding: '3px 10px' }}>{est.etiqueta}</div>
          </div>
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ ...card, borderRadius: 'var(--radius-lg)', padding: 16 }}>
          {m ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{m.planNombre}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gym-color)' }}>{pesos(m.precio)}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3 }}>
                {cliente.estadoDerivado === 'vencido' ? 'Venció' : 'Paga el'} {vence ? FECHA.format(vence) : '—'}
              </div>
              {editandoFecha ? (
                <div style={{ marginTop: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 12 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600 }}>Día en que debe pagar</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.5 }}>
                    Ajústalo si ya venía pagando otro día. De ahí en adelante se mantiene solo.
                  </div>
                  <input type="date" value={fechaVence} onChange={(e) => setFechaVence(e.target.value)} style={{ width: '100%', marginTop: 8, border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: 13, fontWeight: 600, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff' }} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button onClick={guardarFecha} disabled={ocupado} style={{ flex: 1, background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12.5, fontWeight: 600 }}>
                      {ocupado ? 'Guardando…' : 'Guardar fecha'}
                    </button>
                    <button onClick={() => setEditandoFecha(false)} style={{ border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 12.5, fontWeight: 600, color: 'var(--text-3)', background: 'var(--surface)' }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setFechaVence(vence ? aISO(vence) : ''); setEditandoFecha(true) }} style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--gym-color)', marginTop: 6 }}>
                  Cambiar día de pago
                </button>
              )}
            </>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Sin plan activo. Regístrale su primer pago:</div>
          )}

          {eligiendoPlan ? (
            planElegido ? (
              <div style={{ marginTop: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{planElegido.nombre}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gym-color)' }}>{pesos(planElegido.precio)}</div>
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 600, marginTop: 12 }}>Próximo pago</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.5 }}>
                  Cámbialo si el cliente ya venía pagando otro día del mes. Las próximas renovaciones respetan esta fecha.
                </div>
                <input type="date" value={fechaVence} onChange={(e) => setFechaVence(e.target.value)} style={{ width: '100%', marginTop: 8, border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: 13, fontWeight: 600, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff' }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={cobrar} disabled={ocupado} style={{ flex: 1, background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '11px 0', fontSize: 12.5, fontWeight: 600, opacity: ocupado ? 0.6 : 1 }}>
                    {ocupado ? 'Guardando…' : 'Confirmar pago'}
                  </button>
                  <button onClick={() => setPlanElegido(null)} style={{ border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '11px 14px', fontSize: 12.5, fontWeight: 600, color: 'var(--text-3)', background: 'var(--surface)' }}>Atrás</button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {planes.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                    Primero crea un plan en <b>Más → Planes del gym</b>.
                  </div>
                )}
                {planes.map((p) => (
                  <button key={p.id} onClick={() => elegirPlan(p)} disabled={ocupado} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '11px 14px', background: 'var(--surface-2)', fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>{p.nombre} · {p.duracionDias} días</span>
                    <span style={{ fontWeight: 700, color: 'var(--gym-color)' }}>{pesos(p.precio)}</span>
                  </button>
                ))}
                <button onClick={() => setEligiendoPlan(false)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', padding: '6px 0' }}>Cancelar</button>
              </div>
            )
          ) : (
            <button onClick={() => { setEligiendoPlan(true); setPlanElegido(null) }} disabled={ocupado} style={{ marginTop: 12, width: '100%', background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius)', padding: '12px 0', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
              {ocupado ? 'Guardando…' : m ? `Registrar pago y renovar` : 'Registrar primer pago'}
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {gym.politicas?.permitirCongelar && m && (
            <button onClick={congelar} disabled={ocupado} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: '11px 0', fontSize: 12, fontWeight: 600, color: '#475569' }}>
              {cliente.estadoDerivado === 'congelado' ? 'Descongelar' : 'Congelar'}
            </button>
          )}
          <button onClick={desactivar} disabled={ocupado} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: '11px 0', fontSize: 12, fontWeight: 600, color: '#475569' }}>
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
              ['Correo', cliente.correo],
            ].filter(([, v]) => v).map(([k, v], i, arr) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid #f2f2f0' : 'none', fontSize: 12.5 }}>
                <span style={{ color: 'var(--text-2)', flex: 'none' }}>{k}</span>
                <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccionTitulo}>Rutina asignada</div>
          <div style={{ ...card, padding: 14 }}>
            {eligiendoRutina ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rutinas.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Aún no tienes rutinas. Créala en la pestaña <b>Rutinas</b>.</div>
                )}
                {rutinas.map((r) => (
                  <button key={r.id} onClick={() => asignar(r.id)} disabled={ocupado} style={{ textAlign: 'left', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '11px 14px', background: r.id === cliente.rutinaId ? 'color-mix(in oklab, var(--gym-color) 8%, white)' : 'var(--surface-2)', fontSize: 13, fontWeight: 600 }}>
                    {r.nombre}
                  </button>
                ))}
                <button onClick={() => setEligiendoRutina(false)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', padding: '6px 0' }}>Cancelar</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{rutinaActual?.nombre ?? 'Sin rutina asignada'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {rutinaActual ? `${Object.values(rutinaActual.dias ?? {}).filter(Boolean).length} días por semana` : 'Asígnale una para que la vea en su app'}
                  </div>
                </div>
                <button onClick={() => setEligiendoRutina(true)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--gym-color)' }}>
                  {rutinaActual ? 'Cambiar' : 'Asignar'}
                </button>
              </div>
            )}
          </div>
        </div>

        {pagos.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={seccionTitulo}>Historial de pagos</div>
            <div style={{ ...card, padding: '6px 14px' }}>
              {pagos.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < pagos.length - 1 ? '1px solid #f2f2f0' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{p.fecha?.toDate ? FECHA_CORTA.format(p.fecha.toDate()) : '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.planNombre}</div>
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{pesos(p.monto)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={sacarDelGym} disabled={ocupado} style={{ ...card, padding: 14, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Sacar del gimnasio</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>
              Se desvincula pero conserva su historial: si vuelve con tu código, lo recupera.
            </div>
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)' }}>Sacar</span>
        </button>

        {confirmando ? (
          <div style={{ ...card, border: '1px solid #f3d5d5', padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)' }}>Escribe "{cliente.nombre}" para confirmar</div>
            <input value={nombreConfirm} onChange={(e) => setNombreConfirm(e.target.value)} placeholder={cliente.nombre} style={{ marginTop: 10, width: '100%', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => setConfirmando(false)} style={{ flex: 1, border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12.5, fontWeight: 600, background: 'var(--surface)' }}>Cancelar</button>
              <button onClick={eliminar} disabled={ocupado} style={{ flex: 1, borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12.5, fontWeight: 600, background: nombreConfirm.trim().toLowerCase() === (cliente.nombre ?? '').toLowerCase() ? 'var(--danger)' : '#f3d5d5', color: '#fff' }}>
                {ocupado ? 'Eliminando…' : 'Eliminar'}
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
