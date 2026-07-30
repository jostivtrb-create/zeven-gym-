import { useEffect, useState } from 'react'
import { listarGimnasios, actualizarSuscripcionGym } from '../../services/db'
import { Timestamp } from 'firebase/firestore'

const seccion = { fontSize: 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }
const fila = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }
const pesos = (n) => '$' + n.toLocaleString('es-CO')
const MONTO = 79000
const FECHA = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' })

function Avatar({ g }) {
  return (
    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', flex: 'none', background: g.branding?.color ?? '#16a34a', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {g.nombre.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
    </div>
  )
}

export default function SuperPagos() {
  const [gimnasios, setGimnasios] = useState(null)
  const [ocupado, setOcupado] = useState('')

  const cargar = () => listarGimnasios().then(setGimnasios).catch(() => setGimnasios([]))
  useEffect(() => { cargar() }, [])

  const lista = gimnasios ?? []
  const pendientes = lista.filter((g) => g.estado === 'gracia' || g.estado === 'suspendido')
  const enPrueba = lista.filter((g) => g.estado === 'prueba')
  const alDia = lista.filter((g) => g.estado === 'activo')
  const mes = new Intl.DateTimeFormat('es-CO', { month: 'long' }).format(new Date())

  const confirmar = async (g) => {
    setOcupado(g.id)
    try {
      const proximo = new Date()
      proximo.setDate(proximo.getDate() + 30)
      await actualizarSuscripcionGym(g.id, {
        estado: 'activo',
        inicioPrueba: g.suscripcion?.inicioPrueba ?? null,
        ultimoPagoEl: Timestamp.now(),
        proximoCorte: Timestamp.fromDate(proximo),
      })
      await cargar()
    } finally {
      setOcupado('')
    }
  }

  const fechaCorte = (g) => {
    const c = g.suscripcion?.proximoCorte
    return c?.toDate ? FECHA.format(c.toDate()) : '—'
  }

  return (
    <>
      <header style={{ background: 'var(--zeven-dark)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600, textTransform: 'capitalize' }}>Pagos · {mes}</div>
        <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, marginTop: 2 }}>
          {pesos(MONTO)} por gimnasio · {alDia.length} al día · {pendientes.length} pendiente{pendientes.length === 1 ? '' : 's'}
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {gimnasios === null && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 12.5 }}>Cargando pagos…</div>}

        {gimnasios !== null && lista.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-2)', fontSize: 13, lineHeight: 1.6 }}>
            Aquí confirmarás las transferencias de {pesos(MONTO)}/mes de cada gimnasio. Crea el primero desde la pestaña Gimnasios.
          </div>
        )}

        {pendientes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ ...seccion, color: 'var(--warning-text)' }}>Pendientes de pago</div>
            {pendientes.map((g) => (
              <div key={g.id} style={fila}>
                <Avatar g={g} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{g.nombre}</div>
                  <div style={{ fontSize: 11, color: g.estado === 'suspendido' ? 'var(--text-3)' : 'var(--warning-text)' }}>
                    {g.estado === 'suspendido' ? 'Suspendido por falta de pago' : `Quedan ${g.diasGracia} días de gracia`}
                  </div>
                </div>
                <button onClick={() => confirmar(g)} disabled={ocupado === g.id} style={{ background: 'var(--zeven-dark)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap', opacity: ocupado === g.id ? 0.6 : 1 }}>
                  {ocupado === g.id ? 'Guardando…' : 'Confirmar pago'}
                </button>
              </div>
            ))}
          </div>
        )}

        {enPrueba.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ ...seccion, color: '#1e40af' }}>En prueba de 30 días</div>
            {enPrueba.map((g) => (
              <div key={g.id} style={fila}>
                <Avatar g={g} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{g.nombre}</div>
                  <div style={{ fontSize: 11, color: '#1e40af' }}>Quedan {g.diasPrueba} días de prueba</div>
                </div>
                <button onClick={() => confirmar(g)} disabled={ocupado === g.id} style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', color: '#565652', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {ocupado === g.id ? 'Guardando…' : 'Ya pagó'}
                </button>
              </div>
            ))}
          </div>
        )}

        {alDia.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ ...seccion, color: '#166534' }}>Al día</div>
            {alDia.map((g) => (
              <div key={g.id} style={{ ...fila, opacity: 0.85 }}>
                <Avatar g={g} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{g.nombre}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Próximo corte: {fechaCorte(g)}</div>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: '#166534', background: '#dcfce7', borderRadius: 99, padding: '3px 9px' }}>✓ Al día</span>
              </div>
            ))}
          </div>
        )}

        {lista.length > 0 && (
          <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6 }}>
            Confirmar un pago activa el mes del gimnasio (próximo corte en 30 días). Las transferencias llegan a tu cuenta; aquí solo las registras.
          </div>
        )}
      </div>
    </>
  )
}
