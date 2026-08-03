import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGym } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import {
  listarComunicados, obtenerMembresia, obtenerRutina, listarEjerciciosGym,
  listarProgreso, calcularRacha, obtenerPerfil,
} from '../../services/db'
import { abrirWhatsAppCompartir, mensajeTraeAmigo } from '../../services/whatsapp'
import FiguraMuscular from '../../components/FiguraMuscular'
import { haceTexto } from '../admin/AdminComunicados'

const seccionTitulo = { fontSize: 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }
const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }
const eyebrow = { fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gym-color)' }
const DIA_MS = 86400000
const DIAS_KEYS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab']
const FECHA_LARGA = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long' })

/* Anillo de progreso hacia la meta de peso. */
function Anillo({ pct }) {
  const R = 21.5
  const C = 2 * Math.PI * R
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" style={{ flex: 'none' }}>
      <circle cx="27" cy="27" r={R} stroke="var(--track)" strokeWidth="5.5" fill="none" />
      <circle
        cx="27" cy="27" r={R} stroke="var(--gym-color)" strokeWidth="5.5" fill="none"
        strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
        transform="rotate(-90 27 27)" style={{ transition: 'stroke-dashoffset .6s' }}
      />
      <text x="27" y="31" textAnchor="middle" style={{ font: '700 11.5px Poppins,sans-serif' }} fill="var(--text)">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  )
}

export default function Portada() {
  const { gym } = useGym()
  const { perfil } = useAuth()
  const navigate = useNavigate()
  const [comunicados, setComunicados] = useState([])
  const [membresia, setMembresia] = useState(null)
  const [rutina, setRutina] = useState(undefined) // undefined=cargando, null=sin rutina
  const [biblioteca, setBiblioteca] = useState({})
  const [progreso, setProgreso] = useState([])
  const [metas, setMetas] = useState({ metaPeso: null, metaEntrenosMes: null })
  const [verAvisos, setVerAvisos] = useState(false)

  useEffect(() => {
    if (!gym.id) return
    listarComunicados(gym.id).then(setComunicados).catch(() => {})
    if (!perfil?.uid) return
    obtenerMembresia(gym.id, perfil.uid).then(setMembresia)
    listarEjerciciosGym(gym.id)
      .then((lista) => setBiblioteca(Object.fromEntries(lista.map((e) => [e.id, e]))))
      .catch(() => {})
    listarProgreso(perfil.uid).then(setProgreso).catch(() => {})
    // Metas frescas (pueden haberse editado en Progreso después del login)
    obtenerPerfil(perfil.uid)
      .then((p) => p && setMetas({ metaPeso: p.metaPeso ?? null, metaEntrenosMes: p.metaEntrenosMes ?? null }))
      .catch(() => {})
    if (perfil.rutinaId) obtenerRutina(gym.id, perfil.rutinaId).then((r) => setRutina(r ?? null))
    else setRutina(null)
  }, [gym.id, perfil?.uid, perfil?.rutinaId])

  const nombreCorto = (perfil?.nombre ?? '').split(' ')[0] || '¡hola!'
  const iniciales = gym.nombre.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
  const banner = gym.branding?.bannerUrl

  /* Membresía */
  const vence = membresia?.vence?.toDate?.()
  const dias = vence ? Math.round((vence - new Date(new Date().toDateString())) / DIA_MS) : null
  const congelada = membresia?.estado === 'congelada'
  const porVencer = dias !== null && dias >= 0 && dias <= 1 && !congelada
  const vencida = dias !== null && dias < 0 && !congelada
  const estadoBadge = congelada
    ? { texto: 'CONGELADA', color: 'var(--info-text)', bg: 'var(--info-bg)' }
    : dias === null
      ? null
      : dias < 0
        ? { texto: 'VENCIDA', color: 'var(--danger)', bg: 'var(--danger-bg)' }
        : dias <= 3
          ? { texto: 'POR VENCER', color: 'var(--warning-text)', bg: 'var(--warning-bg)' }
          : { texto: 'ACTIVO', color: 'var(--ok-text)', bg: 'var(--ok-bg)' }
  const duracion = membresia?.duracionDias || 30
  const barraMembresia = dias !== null ? Math.max(0, Math.min(1, dias / duracion)) : 0

  /* Rutina de hoy */
  const hoyKey = DIAS_KEYS[new Date().getDay()]
  const sesionHoy = rutina?.dias?.[hoyKey]
  const ejerciciosHoy = (sesionHoy?.ejercicios ?? []).map((e) => biblioteca[e.ejercicioId]).filter(Boolean)
  const nombresHoy = ejerciciosHoy.map((e) => e.nombre).slice(0, 5)
  const extraHoy = Math.max(0, (sesionHoy?.ejercicios?.length ?? 0) - nombresHoy.length)
  const gruposHoy = [...new Set(ejerciciosHoy.map((e) => e.grupo).filter(Boolean))]

  /* Progreso + metas */
  const racha = useMemo(() => calcularRacha(progreso), [progreso])
  const mesActual = new Date().toISOString().slice(0, 7)
  const entrenosMes = new Set(progreso.filter((p) => p.tipo === 'sesion' && (p.fecha ?? '').startsWith(mesActual)).map((p) => p.fecha)).size
  const pesos = progreso.filter((p) => p.tipo === 'medidas' && p.peso != null)
  const pesoActual = pesos.at(-1)?.peso ?? null
  const pesoInicial = pesos[0]?.peso ?? null
  const { metaPeso, metaEntrenosMes } = metas
  const pctMeta = (() => {
    if (metaPeso == null || pesoActual == null || pesoInicial == null) return null
    if (pesoInicial === metaPeso) return pesoActual === metaPeso ? 1 : 0
    return Math.max(0, Math.min(1, (pesoInicial - pesoActual) / (pesoInicial - metaPeso)))
  })()
  const nivel = rutina?.nivel ? rutina.nivel[0].toUpperCase() + rutina.nivel.slice(1) : null

  /* Campanita de comunicados: no leídos = más nuevos que la última vez que abrió */
  const vistosKey = `zg-avisos-vistos-${perfil?.uid ?? ''}`
  const [vistoHasta, setVistoHasta] = useState(() => Number(localStorage.getItem(vistosKey) || 0))
  const noLeidos = comunicados.filter((c) => (c.creadoEl?.seconds ?? 0) * 1000 > vistoHasta).length
  const alternarAvisos = () => {
    setVerAvisos((v) => !v)
    if (!verAvisos) {
      const ahora = Date.now()
      localStorage.setItem(vistosKey, String(ahora))
      setVistoHasta(ahora)
    }
  }

  return (
    <>
      {/* ===== HERO: portada del gym con degradado oscuro ===== */}
      <div style={{ position: 'relative', minHeight: banner ? 300 : 220, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '108px 20px 18px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: banner ? `center/cover url(${banner})` : `linear-gradient(160deg, color-mix(in srgb, var(--gym-color) 42%, #0c0c0e) 0%, #0c0c0e 85%)` }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,12,14,.42) 0%, rgba(12,12,14,.25) 45%, var(--bg) 100%)' }} />

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '54px 16px 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: 'var(--gym-color)', overflow: 'hidden', flex: 'none', boxShadow: '0 4px 14px rgba(0,0,0,.4)' }}>
            {gym.branding?.logoUrl ? <img src={gym.branding.logoUrl} alt={gym.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : iniciales}
          </div>
          <div style={{ minWidth: 0, textShadow: '0 1px 8px rgba(0,0,0,.6)' }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gym.nombre}</div>
            {gym.ciudad && <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 11 }}>{gym.ciudad}</div>}
          </div>
          <button onClick={alternarAvisos} aria-label="Comunicados" style={{ marginLeft: 'auto', position: 'relative', width: 40, height: 40, borderRadius: 99, background: 'rgba(255,255,255,.14)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8 A6 6 0 0 0 6 8 C6 15 3 17 3 17 H21 C21 17 18 15 18 8" />
              <path d="M13.7 21 a2 2 0 0 1 -3.4 0" />
            </svg>
            {noLeidos > 0 && (
              <span style={{ position: 'absolute', top: -2, right: -2, minWidth: 17, height: 17, borderRadius: 99, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid rgba(12,12,14,.6)' }}>
                {noLeidos}
              </span>
            )}
          </button>
        </div>

        <div style={{ position: 'relative', textShadow: '0 1px 10px rgba(0,0,0,.55)' }}>
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 700, lineHeight: 1.15 }}>¡Hola, {nombreCorto}! 👋</div>
          <div style={{ color: 'rgba(255,255,255,.85)', fontSize: 13.5, marginTop: 3 }}>
            Listo para ser <span style={{ color: 'var(--gym-color)', fontWeight: 600, filter: 'brightness(1.35)' }}>tu mejor versión</span> hoy.
          </div>
        </div>
      </div>

      <div style={{ padding: '4px 16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* ===== Comunicados (se abren con la campanita) ===== */}
        {verAvisos && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={seccionTitulo}>Comunicados</div>
            {comunicados.length === 0 && (
              <div style={{ ...card, padding: 14, fontSize: 12, color: 'var(--text-3)' }}>Por ahora no hay avisos de {gym.nombre}.</div>
            )}
            {comunicados.map((c) => (
              <div key={c.id} style={{ ...card, padding: 14 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.titulo}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3, lineHeight: 1.5 }}>{c.texto}</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--gym-color)', marginTop: 8 }}>{haceTexto(c.creadoEl)}</div>
              </div>
            ))}
          </div>
        )}

        {/* ===== Alertas de membresía ===== */}
        {!membresia && (
          <div style={{ background: 'color-mix(in oklab, var(--gym-color) 10%, var(--mix-base))', border: '1px solid color-mix(in oklab, var(--gym-color) 30%, var(--mix-base))', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--gym-color)', filter: 'brightness(1.25)' }}>¡Bienvenido a {gym.nombre}! 🎉</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3, lineHeight: 1.5 }}>
              Ya quedaste registrado. Cuando pagues en recepción, tu plan se activa aquí mismo y verás tu rutina.
            </div>
          </div>
        )}
        {porVencer && (
          <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--warning-text)' }}>Tu plan vence {dias === 0 ? 'hoy' : 'mañana'}</div>
            <div style={{ fontSize: 12, color: 'var(--warning-text)', opacity: 0.85, marginTop: 2 }}>Renuévalo en recepción y sigue sin pausas.</div>
          </div>
        )}
        {vencida && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--danger)' }}>Tu plan está vencido</div>
            <div style={{ fontSize: 12, color: 'var(--danger)', opacity: 0.85, marginTop: 2 }}>Pásate por recepción y lo reactivamos en un momento.</div>
          </div>
        )}

        {/* ===== Rutina de hoy ===== */}
        {rutina !== undefined && (
          <div style={{ ...card, padding: 16 }}>
            {sesionHoy ? (
              <>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 99, background: 'var(--gym-color-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flex: 'none' }}>🏋️</div>
                      <div style={eyebrow}>Rutina de hoy</div>
                    </div>
                    <button onClick={() => navigate('/app/rutina')} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, color: 'var(--text)', fontSize: 17.5, fontWeight: 700, textAlign: 'left', padding: 0 }}>
                      {sesionHoy.titulo}
                      <span style={{ color: 'var(--gym-color)', fontSize: 16, fontWeight: 700 }}>›</span>
                    </button>
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {nombresHoy.map((n) => (
                        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-2)' }}>
                          <span style={{ width: 5, height: 5, borderRadius: 99, background: 'var(--gym-color)', flex: 'none' }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n}</span>
                        </div>
                      ))}
                      {extraHoy > 0 && <div style={{ fontSize: 11.5, color: 'var(--text-3)', paddingLeft: 13 }}>+{extraHoy} más</div>}
                    </div>
                  </div>
                  <FiguraMuscular grupos={gruposHoy} ancho={88} />
                </div>
                <button
                  onClick={() => navigate('/app/rutina')}
                  style={{ marginTop: 14, width: '100%', background: 'linear-gradient(135deg, var(--gym-color), var(--gym-color-dark))', color: '#fff', borderRadius: 'var(--radius-md)', padding: '13px 0', fontSize: 12.5, fontWeight: 700, letterSpacing: '.08em', boxShadow: '0 6px 18px color-mix(in srgb, var(--gym-color) 35%, transparent)' }}
                >
                  COMENZAR ENTRENAMIENTO ▸
                </button>
              </>
            ) : rutina ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 99, background: 'var(--gym-color-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flex: 'none' }}>😌</div>
                <div>
                  <div style={eyebrow}>Rutina de hoy</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 3 }}>Día de descanso</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>Recupérate bien: el descanso también es entreno.</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 99, background: 'var(--gym-color-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flex: 'none' }}>📋</div>
                <div>
                  <div style={eyebrow}>Rutina de hoy</div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, marginTop: 3 }}>Aún no tienes rutina asignada</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2, lineHeight: 1.5 }}>Pídesela a tu entrenador en {gym.nombre} y aparecerá aquí. 💪</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== Membresía + Progreso ===== */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ ...card, padding: 14, display: 'flex', flexDirection: 'column' }}>
            <div style={{ ...eyebrow, display: 'flex', alignItems: 'center', gap: 5 }}>👑 <span>Mi membresía</span></div>
            {membresia ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 9, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.2 }}>{membresia.planNombre}</div>
                  {estadoBadge && (
                    <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '.06em', color: estadoBadge.color, background: estadoBadge.bg, borderRadius: 99, padding: '3px 7px' }}>
                      {estadoBadge.texto}
                    </span>
                  )}
                </div>
                {vence && <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 5 }}>Vence el {FECHA_LARGA.format(vence)}</div>}
                {congelada ? (
                  <div style={{ fontSize: 11, color: 'var(--info-text)', marginTop: 8 }}>{membresia.diasRestantes ?? 0} días guardados ❄️</div>
                ) : dias !== null && (
                  <>
                    <div style={{ fontSize: 11.5, fontWeight: 600, marginTop: 8 }}>
                      {dias < 0 ? `Venció hace ${Math.abs(dias)} día${Math.abs(dias) === 1 ? '' : 's'}` : dias === 0 ? 'Vence hoy' : `${dias} día${dias === 1 ? '' : 's'} restantes`}
                    </div>
                    <div style={{ marginTop: 7, height: 7, borderRadius: 99, background: 'var(--track)', overflow: 'hidden' }}>
                      <div style={{ width: `${barraMembresia * 100}%`, height: '100%', borderRadius: 99, background: 'var(--gym-color)' }} />
                    </div>
                  </>
                )}
              </>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 9, lineHeight: 1.55 }}>
                Sin plan activo. Actívalo en recepción y aquí verás tus días restantes.
              </div>
            )}
          </div>

          <div style={{ ...card, padding: 14, display: 'flex', flexDirection: 'column' }}>
            <div style={{ ...eyebrow, display: 'flex', alignItems: 'center', gap: 5 }}>📊 <span>Mi progreso</span></div>
            {pesoActual != null ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 9 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Peso actual</div>
                  <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.1 }}>{String(pesoActual).replace('.', ',')} <span style={{ fontSize: 12, fontWeight: 600 }}>kg</span></div>
                  {metaPeso != null ? (
                    <div style={{ fontSize: 11, color: 'var(--gym-color)', fontWeight: 600, marginTop: 5, filter: 'brightness(1.25)', whiteSpace: 'nowrap' }}>Meta: {String(metaPeso).replace('.', ',')} kg</div>
                  ) : (
                    <button onClick={() => navigate('/app/progreso')} style={{ fontSize: 11, color: 'var(--gym-color)', fontWeight: 600, marginTop: 5, padding: 0, filter: 'brightness(1.25)' }}>
                      Definir meta ›
                    </button>
                  )}
                </div>
                {pctMeta != null && <Anillo pct={pctMeta} />}
              </div>
            ) : (
              <button onClick={() => navigate('/app/progreso')} style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 9, lineHeight: 1.55, textAlign: 'left', padding: 0 }}>
                Registra tu peso en <span style={{ color: 'var(--gym-color)', fontWeight: 600 }}>Progreso ›</span> y mide tu avance aquí.
              </button>
            )}
          </div>
        </div>

        {/* ===== Racha · Entrenos del mes · Nivel ===== */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { icono: '🔥', titulo: 'Racha actual', valor: `${racha.actual} día${racha.actual === 1 ? '' : 's'}`, pie: racha.actual > 0 ? '¡Sigue así!' : '¡Arranca hoy!' },
            { icono: '💪', titulo: 'Entrenamientos', valor: metaEntrenosMes ? `${entrenosMes} / ${metaEntrenosMes}` : String(entrenosMes), pie: 'Este mes' },
            { icono: '⭐', titulo: 'Nivel actual', valor: nivel ?? '—', pie: nivel ? '¡Vamos por más!' : 'Según tu rutina' },
          ].map((s) => (
            <div key={s.titulo} style={{ ...card, padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 16 }}>{s.icono}</div>
              <div style={{ fontSize: 9.5, color: 'var(--text-3)', fontWeight: 600, marginTop: 4 }}>{s.titulo}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.valor}</div>
              <div style={{ fontSize: 9.5, color: 'var(--gym-color)', fontWeight: 600, marginTop: 2, filter: 'brightness(1.25)' }}>{s.pie}</div>
            </div>
          ))}
        </div>

        {/* ===== ¡Trae un amigo! ===== */}
        <div style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gym-color) 24%, var(--surface)) 0%, var(--surface) 70%)', border: '1px solid color-mix(in srgb, var(--gym-color) 30%, var(--border))', borderRadius: 'var(--radius-lg)', padding: 16 }}>
          <div style={{ fontSize: 15.5, fontWeight: 700 }}>¡Trae un amigo! 🤝</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4, lineHeight: 1.5 }}>
            Entrenar acompañado <span style={{ color: 'var(--gym-color)', fontWeight: 600, filter: 'brightness(1.25)' }}>motiva el doble</span>. Invítalo y crezcan juntos.
          </div>
          <button
            onClick={() => abrirWhatsAppCompartir(mensajeTraeAmigo(gym.nombre))}
            style={{ marginTop: 12, background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius)', padding: '10px 18px', fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em' }}
          >
            INVITAR POR WHATSAPP ›
          </button>
        </div>

        {/* ===== Horarios ===== */}
        {(gym.horarios ?? []).length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={seccionTitulo}>Horarios</div>
            <div style={{ ...card, borderRadius: 'var(--radius-md)', padding: '6px 14px' }}>
              {gym.horarios.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < gym.horarios.length - 1 ? '1px solid var(--hairline)' : 'none', fontSize: 12.5 }}>
                  <span style={{ color: 'var(--text-2)' }}>{h.dias}</span>
                  {h.abre ? (
                    <span style={{ fontWeight: 500 }}>{h.abre} – {h.cierra}</span>
                  ) : (
                    <span style={{ fontWeight: 500, color: 'var(--text-4)' }}>Cerrado</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== Contacto y redes ===== */}
        {(gym.contacto?.celular || gym.contacto?.instagram || gym.contacto?.direccion) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={seccionTitulo}>Contacto y redes</div>
            <div style={{ ...card, borderRadius: 'var(--radius-md)', padding: '6px 14px' }}>
              {[
                ['Llamadas y WhatsApp', gym.contacto?.celular, null],
                ['Instagram', gym.contacto?.instagram, 'var(--gym-color)'],
                ['Dirección', gym.contacto?.direccion, null],
              ].filter(([, v]) => v).map(([k, v, color], i, arr) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--hairline)' : 'none', fontSize: 12.5 }}>
                  <span style={{ color: 'var(--text-2)', flex: 'none' }}>{k}</span>
                  <span style={{ fontWeight: 500, color: color ?? 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
