import { useState } from 'react'
import { demoGimnasios, demoPlataforma } from '../../data/demoSuper'

const seccion = { fontSize: 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }
const fila = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }
const pesos = (n) => '$' + n.toLocaleString('es-CO')

export default function SuperPagos() {
  const [confirmados, setConfirmados] = useState([])
  const p = demoPlataforma

  const enGracia = demoGimnasios.filter((g) => g.estado === 'gracia' && !confirmados.includes(g.id))
  const enPrueba = demoGimnasios.filter((g) => g.estado === 'prueba')
  const alDia = demoGimnasios.filter((g) => g.estado === 'activo' || confirmados.includes(g.id))

  const confirmar = (id) => setConfirmados([...confirmados, id])

  return (
    <>
      <header style={{ background: 'var(--zeven-dark)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>Pagos · julio</div>
        <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, marginTop: 2 }}>
          {pesos(p.monto)} por gimnasio · {p.pagosConfirmados + confirmados.length} confirmados · {Math.max(0, p.pagosPendientes - confirmados.length)} pendientes
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {enGracia.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ ...seccion, color: 'var(--warning-text)' }}>En periodo de gracia</div>
            {enGracia.map((g) => (
              <div key={g.id} style={fila}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', flex: 'none', background: g.color, color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {g.nombre.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{g.nombre}</div>
                  <div style={{ fontSize: 11, color: 'var(--warning-text)' }}>
                    {g.proximoCorte} · quedan {g.diasGracia} días de gracia
                  </div>
                </div>
                <button onClick={() => confirmar(g.id)} style={{ background: 'var(--zeven-dark)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  Confirmar pago
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
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', flex: 'none', background: g.color, color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {g.nombre.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{g.nombre}</div>
                  <div style={{ fontSize: 11, color: '#1e40af' }}>Quedan {g.diasPrueba} días de prueba · primer cobro: {g.proximoCorte}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ ...seccion, color: '#166534' }}>Al día</div>
          {alDia.map((g) => (
            <div key={g.id} style={{ ...fila, opacity: 0.85 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', flex: 'none', background: g.color, color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {g.nombre.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{g.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  {confirmados.includes(g.id) ? 'Pago confirmado hoy · mes renovado' : `Último pago: ${g.ultimoPago} · próximo corte: ${g.proximoCorte}`}
                </div>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: '#166534', background: '#dcfce7', borderRadius: 99, padding: '3px 9px' }}>✓ Al día</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6 }}>
          Confirmar un pago renueva el mes del gimnasio y reinicia sus avisos. Las transferencias llegan a tu cuenta; aquí solo las registras.
        </div>
      </div>
    </>
  )
}
