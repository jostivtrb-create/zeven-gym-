import { useEffect, useState } from 'react'
import { useGym } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { obtenerMembresia, listarPagosCliente, desvincularGym, actualizarUsuario } from '../../services/db'
import { activarNotificaciones, desactivarNotificaciones, notificacionesActivas, soportaNotificaciones } from '../../services/notificaciones'

const seccionTitulo = { fontSize: 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }
const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }
const pesos = (n) => '$' + Number(n).toLocaleString('es-CO')
const DIA_MS = 86400000
const FECHA = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
const FECHA_CORTA = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
const MES_LARGO = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' })

export default function Perfil() {
  const { gym, tema, setTema } = useGym()
  const oscuro = tema === 'oscuro'
  const { perfil, salir, recargarPerfil } = useAuth()
  const [membresia, setMembresia] = useState(null)
  const [pagos, setPagos] = useState([])
  const [confirmandoSalida, setConfirmandoSalida] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [push, setPush] = useState({ soporta: false, activo: false, mensaje: '' })
  // Datos que alimentan el punto de partida de cada ejercicio
  const [medida, setMedida] = useState({ genero: '', estatura: '', actividad: '' })
  const [medidaGuardada, setMedidaGuardada] = useState(false)

  useEffect(() => {
    setMedida({
      genero: perfil?.genero ?? '',
      estatura: perfil?.estatura != null ? String(perfil.estatura).replace('.', ',') : '',
      actividad: perfil?.actividad ?? '',
    })
  }, [perfil?.genero, perfil?.estatura, perfil?.actividad])

  const guardarMedida = async (cambios) => {
    const nuevo = { ...medida, ...cambios }
    setMedida(nuevo)
    try {
      await actualizarUsuario(perfil.uid, {
        genero: nuevo.genero || null,
        estatura: parseFloat(String(nuevo.estatura).replace(',', '.')) || null,
        actividad: nuevo.actividad || null,
      })
      await recargarPerfil()
      setMedidaGuardada(true)
      setTimeout(() => setMedidaGuardada(false), 2000)
    } catch (e) {
      console.warn('guardarMedida:', e.code ?? e.message)
    }
  }

  useEffect(() => {
    soportaNotificaciones().then((soporta) => setPush((p) => ({ ...p, soporta, activo: notificacionesActivas() })))
  }, [])

  const alternarPush = async () => {
    if (push.activo) {
      await desactivarNotificaciones(perfil.uid)
      setPush((p) => ({ ...p, activo: false, mensaje: '' }))
      return
    }
    const r = await activarNotificaciones(perfil.uid)
    const motivos = {
      denegado: 'Tu celular bloqueó las notificaciones. Actívalas en los ajustes del navegador.',
      'sin-configurar': 'Los recordatorios aún no están habilitados por Zeven Gym.',
      'no-soportado': 'Este navegador no admite notificaciones.',
      'sin-token': 'No pudimos activarlas. Inténtalo de nuevo.',
    }
    setPush((p) => ({ ...p, activo: r.ok, mensaje: r.ok ? '' : motivos[r.motivo] ?? '' }))
  }

  useEffect(() => {
    if (!gym.id || !perfil?.uid) return
    obtenerMembresia(gym.id, perfil.uid).then(setMembresia)
    listarPagosCliente(gym.id, perfil.uid).then(setPagos).catch(() => {})
  }, [gym.id, perfil?.uid])

  const vence = membresia?.vence?.toDate?.()
  const dias = vence ? Math.round((vence - new Date(new Date().toDateString())) / DIA_MS) : null
  const congelada = membresia?.estado === 'congelada'
  const estado = congelada
    ? { etiqueta: 'Congelada', color: '#1e40af' }
    : dias === null
      ? { etiqueta: 'Sin plan', color: '#6b7280' }
      : dias < 0
        ? { etiqueta: 'Vencida', color: '#b91c1c' }
        : dias <= 3
          ? { etiqueta: 'Por vencer', color: '#92400e' }
          : { etiqueta: 'Activa', color: '#166534' }

  const desde = perfil?.creadoEl?.toDate ? `desde ${MES_LARGO.format(perfil.creadoEl.toDate())}` : ''

  const cerrarSesion = async () => {
    try {
      await salir()
    } finally {
      location.href = '/'
    }
  }

  const salirDelGym = async () => {
    setOcupado(true)
    try {
      await desvincularGym(perfil.uid)
      location.href = '/vincular'
    } catch (e) {
      console.warn('desvincular:', e.code ?? e.message)
      setOcupado(false)
    }
  }

  const diasPagados = dias !== null && dias > 0 ? dias : 0

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 24px', borderRadius: '0 0 var(--radius-header) var(--radius-header)', textAlign: 'center' }}>
        <div style={{ width: 76, height: 76, borderRadius: 99, margin: '0 auto', background: '#fff', border: '3px solid rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'var(--gym-color)', overflow: 'hidden' }}>
          {perfil?.fotoUrl ? (
            <img src={perfil.fotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            (perfil?.nombre ?? '?').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
          )}
        </div>
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 600, marginTop: 10 }}>{perfil?.nombre}</div>
        <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 11.5, marginTop: 2 }}>
          Miembro de {gym.nombre} {desde}
        </div>
        <div style={{ display: 'inline-block', marginTop: 10, background: '#fff', color: estado.color, fontSize: 11, fontWeight: 600, borderRadius: 99, padding: '4px 12px' }}>
          ● {estado.etiqueta}
          {vence && ` · ${new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(vence)}`}
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ ...card, borderRadius: 'var(--radius-lg)', padding: 16 }}>
          {membresia ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{membresia.planNombre}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gym-color)' }}>{pesos(membresia.precio)}</div>
              </div>
              {vence && (
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>
                  Vence el <span style={{ fontWeight: 600, color: 'var(--text)' }}>{FECHA.format(vence)}</span>
                  {dias >= 0 && <> · {dias === 0 ? 'vence hoy' : `quedan ${dias} día${dias === 1 ? '' : 's'}`}</>}
                </div>
              )}
              {estado.etiqueta === 'Por vencer' && (
                <div style={{ marginTop: 12, background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 'var(--radius)', padding: '11px 13px', fontSize: 11.5, color: 'var(--warning-text)', lineHeight: 1.5 }}>
                  Tu plan vence {dias === 0 ? 'hoy' : 'pronto'}. Renuévalo en recepción y no pierdas tu racha.
                </div>
              )}
              {estado.etiqueta === 'Vencida' && (
                <div style={{ marginTop: 12, background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius)', padding: '11px 13px', fontSize: 11.5, color: 'var(--danger)', lineHeight: 1.5 }}>
                  Tu plan está vencido. Pásate por recepción y lo reactivamos en un momento.
                </div>
              )}
              {congelada && (
                <div style={{ marginTop: 12, background: 'var(--info-bg)', border: '1px solid var(--info-border)', borderRadius: 'var(--radius)', padding: '11px 13px', fontSize: 11.5, color: 'var(--info-text)', lineHeight: 1.5 }}>
                  Tu membresía está congelada: tus {membresia.diasRestantes ?? 0} días pagados te esperan intactos.
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
              Aún no tienes un plan activo. Actívalo en la recepción de {gym.nombre} y aquí verás tu vencimiento y tus pagos.
            </div>
          )}
        </div>

        {pagos.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={seccionTitulo}>Historial de pagos</div>
            <div style={{ ...card, padding: '6px 14px' }}>
              {pagos.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < pagos.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccionTitulo}>Mis datos</div>
          <div style={{ ...card, padding: '6px 14px' }}>
            {[
              ['Celular', perfil?.celular],
              ['Documento', perfil?.documento],
              ['Nacimiento', perfil?.nacimiento],
              ['Correo', perfil?.correo],
            ].filter(([, v]) => v).map(([k, v], i, arr) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--hairline)' : 'none', fontSize: 12.5 }}>
                <span style={{ color: 'var(--text-2)', flex: 'none' }}>{k}</span>
                <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alimenta el punto de partida que ve en cada ejercicio de su rutina */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccionTitulo}>Para calcular mis pesos</div>
          <div style={{ ...card, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>
              Con estos datos tu rutina te muestra un peso de arranque a tu medida. Cambian solo tus sugerencias, nunca lo que ya ajustaste.
            </div>

            <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 12, marginBottom: 6 }}>Género</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['hombre', 'Hombre'], ['mujer', 'Mujer']].map(([v, etiqueta]) => (
                <button key={v} onClick={() => guardarMedida({ genero: medida.genero === v ? '' : v })}
                  style={{ flex: 1, borderRadius: 'var(--radius-sm)', padding: '9px 0', fontSize: 12, fontWeight: 600, background: medida.genero === v ? 'var(--gym-color)' : 'var(--surface-2)', color: medida.genero === v ? '#fff' : 'var(--text-2)', border: medida.genero === v ? 'none' : '1px solid var(--border)' }}>
                  {etiqueta}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 12, marginBottom: 6 }}>Estatura (m)</div>
            <input
              inputMode="decimal" value={medida.estatura}
              onChange={(e) => setMedida({ ...medida, estatura: e.target.value })}
              onBlur={() => guardarMedida({})}
              placeholder="1,70"
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '9px 10px', fontSize: 13, fontWeight: 600, outline: 'none', background: 'var(--surface-2)', color: 'var(--text)', boxSizing: 'border-box' }}
            />

            <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 12, marginBottom: 6 }}>¿Qué tanto te mueves?</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['nunca', 'Nunca'], ['aveces', 'De vez en cuando'], ['regular', 'Regular']].map(([v, etiqueta]) => (
                <button key={v} onClick={() => guardarMedida({ actividad: medida.actividad === v ? '' : v })}
                  style={{ flex: 1, borderRadius: 'var(--radius-sm)', padding: '9px 4px', fontSize: 10.5, fontWeight: 600, lineHeight: 1.25, background: medida.actividad === v ? 'var(--gym-color)' : 'var(--surface-2)', color: medida.actividad === v ? '#fff' : 'var(--text-2)', border: medida.actividad === v ? 'none' : '1px solid var(--border)' }}>
                  {etiqueta}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 10.5, color: medidaGuardada ? 'var(--gym-color-text)' : 'var(--text-4)', marginTop: 10, fontWeight: medidaGuardada ? 600 : 400 }}>
              {medidaGuardada ? '✓ Guardado' : 'Tu peso se toma de las medidas que registras en Progreso.'}
            </div>
          </div>
        </div>

        <div style={{ ...card, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 99, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flex: 'none' }}>
              {oscuro ? '🌙' : '☀️'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>Modo {oscuro ? 'oscuro' : 'claro'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>
                {oscuro ? 'Ideal para entrenar de noche. Toca para pasar a claro.' : 'Fondo claro y luminoso. Toca para volver al oscuro.'}
              </div>
            </div>
            <button onClick={() => setTema(oscuro ? 'claro' : 'oscuro')} aria-pressed={oscuro} aria-label="Cambiar entre modo oscuro y claro" style={{ width: 42, height: 24, borderRadius: 99, background: oscuro ? 'var(--gym-color)' : 'var(--border-2)', position: 'relative', flex: 'none', transition: 'background .2s' }}>
              <span style={{ position: 'absolute', top: 2, left: oscuro ? 20 : 2, width: 20, height: 20, borderRadius: 99, background: '#fff', transition: 'left .2s' }} />
            </button>
          </div>
        </div>

        {push.soporta && (
          <div style={{ ...card, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>Recordatorio de pago</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>
                  Un aviso amable en este celular un día antes de que venza tu plan.
                </div>
              </div>
              <button onClick={alternarPush} aria-pressed={push.activo} style={{ width: 42, height: 24, borderRadius: 99, background: push.activo ? 'var(--gym-color)' : 'var(--border-2)', position: 'relative', flex: 'none', transition: 'background .2s' }}>
                <span style={{ position: 'absolute', top: 2, left: push.activo ? 20 : 2, width: 20, height: 20, borderRadius: 99, background: '#fff', transition: 'left .2s' }} />
              </button>
            </div>
            {push.mensaje && <div style={{ fontSize: 11, color: 'var(--warning-text)', marginTop: 8 }}>{push.mensaje}</div>}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={seccionTitulo}>Mi gimnasio</div>
          {confirmandoSalida ? (
            <div style={{ ...card, border: '1px solid var(--danger-border)', padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>¿Salir de {gym.nombre}?</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.6 }}>
                {diasPagados > 0
                  ? `Te quedan ${diasPagados} día${diasPagados === 1 ? '' : 's'} pagados. Guardamos tu historial: si vuelves con el mismo código, lo recuperas.`
                  : 'Guardamos tu historial: si vuelves con el mismo código, lo recuperas tal cual.'}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => setConfirmandoSalida(false)} style={{ flex: 1, border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12.5, fontWeight: 600, background: 'var(--surface)' }}>
                  Quedarme
                </button>
                <button onClick={salirDelGym} disabled={ocupado} style={{ flex: 1, borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12.5, fontWeight: 600, background: 'var(--danger)', color: '#fff', opacity: ocupado ? 0.6 : 1 }}>
                  {ocupado ? 'Saliendo…' : 'Sí, salir'}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmandoSalida(true)} style={{ ...card, padding: 14, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{gym.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Toca para desvincularte de este gimnasio</div>
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)' }}>Salir</span>
            </button>
          )}
        </div>

        <button onClick={cerrarSesion} style={{ background: 'var(--surface)', border: '1px solid var(--danger-border)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', padding: '12px 0', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
          Cerrar sesión
        </button>
      </div>
    </>
  )
}
