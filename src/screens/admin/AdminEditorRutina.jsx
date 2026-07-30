import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGym } from '../../context/ThemeContext'
import { obtenerRutina, guardarRutina, eliminarRutina, listarEjerciciosGym } from '../../services/db'
import { GRUPOS } from '../../data/catalogoBase'

const DIAS = [['lun', 'L'], ['mar', 'M'], ['mie', 'X'], ['jue', 'J'], ['vie', 'V'], ['sab', 'S'], ['dom', 'D']]
const NOMBRES_DIA = { lun: 'Lunes', mar: 'Martes', mie: 'Miércoles', jue: 'Jueves', vie: 'Viernes', sab: 'Sábado', dom: 'Domingo' }
const NIVELES = ['Principiante', 'Intermedio', 'Avanzado']
const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }
const campo = { flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }
const inputNum = { width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 12.5, fontWeight: 600, padding: 0, fontFamily: 'inherit' }

const VACIA = { nombre: 'Nueva rutina', nivel: null, dias: { lun: null, mar: null, mie: null, jue: null, vie: null, sab: null, dom: null } }

function Miniatura({ ejercicio, tam = 44 }) {
  return ejercicio?.imagenUrl ? (
    <img src={ejercicio.imagenUrl} alt="" style={{ width: tam, height: tam, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flex: 'none' }} />
  ) : (
    <div style={{ width: tam, height: tam, borderRadius: 'var(--radius-sm)', flex: 'none', background: 'color-mix(in oklab, var(--gym-color) 8%, white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tam / 2.8 }}>💪</div>
  )
}

/* Ajusta la dosis del ejercicio dentro de ESTE día de la rutina. */
function EditorDosis({ ejercicio, dosis, setDosis, guardar, quitar, cancelar }) {
  return (
    <div style={{ ...card, border: '1.5px solid var(--gym-color)', padding: 12 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Miniatura ejercicio={ejercicio} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{ejercicio?.nombre ?? 'Ejercicio'}</div>
          <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{ejercicio?.grupo}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {[['series', 'Series'], ['reps', 'Reps'], ['descansoSeg', 'Descanso (s)']].map(([k, label]) => (
          <div key={k} style={campo}>
            <div style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{label}</div>
            <input type="number" inputMode="numeric" value={dosis[k]} onChange={(e) => setDosis({ ...dosis, [k]: e.target.value })} style={inputNum} />
          </div>
        ))}
      </div>
      <div style={{ ...campo, marginTop: 8, flex: 'none' }}>
        <div style={{ fontSize: 9.5, color: 'var(--text-3)' }}>Peso sugerido (kg) · opcional</div>
        <input type="number" inputMode="decimal" value={dosis.pesoSugerido} onChange={(e) => setDosis({ ...dosis, pesoSugerido: e.target.value })} placeholder="Vacío = el cliente elige el suyo" style={inputNum} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={guardar} style={{ flex: 1, background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '9px 0', fontSize: 12, fontWeight: 600 }}>Guardar</button>
        {quitar && <button onClick={quitar} style={{ border: '1px solid #f3d5d5', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', padding: '9px 12px', fontSize: 12, fontWeight: 600, background: 'var(--surface)' }}>Quitar</button>}
        <button onClick={cancelar} style={{ border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '9px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-3)', background: 'var(--surface)' }}>Cancelar</button>
      </div>
    </div>
  )
}

export default function AdminEditorRutina() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { gym } = useGym()
  const [rutina, setRutina] = useState(id === 'nueva' ? VACIA : null)
  const [ejercicios, setEjercicios] = useState([])
  const [diaSel, setDiaSel] = useState('lun')
  const [tituloDia, setTituloDia] = useState('')
  const [eligiendo, setEligiendo] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [grupo, setGrupo] = useState('todos')
  const [editandoIdx, setEditandoIdx] = useState(null)
  const [nuevoEjercicioId, setNuevoEjercicioId] = useState(null)
  const [dosis, setDosis] = useState({ series: '3', reps: '12', descansoSeg: '60', pesoSugerido: '' })
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [confirmandoBorrar, setConfirmandoBorrar] = useState(false)

  useEffect(() => {
    if (!gym.id) return
    listarEjerciciosGym(gym.id).then(setEjercicios).catch(() => setEjercicios([]))
    if (id !== 'nueva') obtenerRutina(gym.id, id).then((r) => setRutina(r ?? VACIA))
  }, [gym.id, id])

  if (rutina === null) return <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-3)', fontSize: 12.5 }}>Cargando rutina…</div>

  const porId = Object.fromEntries(ejercicios.map((e) => [e.id, e]))
  const sesion = rutina.dias?.[diaSel]

  const actualizarDia = (nueva) => {
    setRutina({ ...rutina, dias: { ...rutina.dias, [diaSel]: nueva } })
    setGuardado(false)
  }

  const guardarDosis = () => {
    const datos = {
      series: Number(dosis.series) || 3,
      reps: Number(dosis.reps) || 12,
      descansoSeg: Number(dosis.descansoSeg) || 60,
      pesoSugerido: dosis.pesoSugerido === '' ? null : Number(dosis.pesoSugerido),
    }
    const base = sesion ?? { titulo: tituloDia.trim() || 'Sesión', ejercicios: [] }
    const lista =
      editandoIdx !== null
        ? base.ejercicios.map((e, i) => (i === editandoIdx ? { ...e, ...datos } : e))
        : [...base.ejercicios, { ejercicioId: nuevoEjercicioId, ...datos }]
    actualizarDia({ ...base, ejercicios: lista })
    setEditandoIdx(null)
    setNuevoEjercicioId(null)
  }

  const quitarDosis = () => {
    const lista = sesion.ejercicios.filter((_, i) => i !== editandoIdx)
    actualizarDia(lista.length ? { ...sesion, ejercicios: lista } : null)
    setEditandoIdx(null)
  }

  const guardar = async () => {
    setGuardando(true)
    try {
      const idGuardada = await guardarRutina(gym.id, id === 'nueva' ? rutina : { id, ...rutina })
      setGuardado(true)
      if (id === 'nueva') navigate(`/admin/rutinas/editor/${idGuardada}`, { replace: true })
    } finally {
      setGuardando(false)
    }
  }

  const borrar = async () => {
    await eliminarRutina(gym.id, id)
    navigate('/admin/rutinas')
  }

  const q = busqueda.trim().toLowerCase()
  const disponibles = ejercicios.filter((e) => (grupo === 'todos' || e.grupo === grupo) && (!q || e.nombre.toLowerCase().includes(q)))

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 16px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <button onClick={() => navigate('/admin/rutinas')} style={{ color: 'rgba(255,255,255,.8)', fontSize: 12 }}>‹ Rutinas</button>
        <input
          value={rutina.nombre}
          onChange={(e) => { setRutina({ ...rutina, nombre: e.target.value }); setGuardado(false) }}
          style={{ display: 'block', width: '100%', color: '#fff', fontSize: 18, fontWeight: 600, marginTop: 8, background: 'transparent', border: 'none', outline: 'none', padding: 0, fontFamily: 'inherit' }}
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {NIVELES.map((n) => (
            <button key={n} onClick={() => { setRutina({ ...rutina, nivel: rutina.nivel === n ? null : n }); setGuardado(false) }} style={{ fontSize: 10.5, fontWeight: rutina.nivel === n ? 600 : 500, background: rutina.nivel === n ? '#fff' : 'rgba(255,255,255,.16)', color: rutina.nivel === n ? 'var(--gym-color)' : '#fff', borderRadius: 99, padding: '5px 11px' }}>
              {n}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          {DIAS.map(([key, letra]) => {
            const sel = key === diaSel
            const vacio = !rutina.dias?.[key]
            return (
              <button key={key} onClick={() => { setDiaSel(key); setEditandoIdx(null); setNuevoEjercicioId(null); setEligiendo(false); setTituloDia('') }} style={{ flex: 1, textAlign: 'center', padding: '7px 0', borderRadius: 'var(--radius-sm)', background: sel ? '#fff' : `rgba(255,255,255,${vacio ? '.10' : '.16'})`, color: sel ? 'var(--gym-color)' : vacio ? 'rgba(255,255,255,.5)' : '#fff', fontSize: 11, fontWeight: sel ? 700 : vacio ? 400 : 600 }}>
                {letra}
              </button>
            )
          })}
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'baseline', gap: 6 }}>
          {NOMBRES_DIA[diaSel]}
          {sesion ? (
            <>
              <span>·</span>
              <input value={sesion.titulo} onChange={(e) => actualizarDia({ ...sesion, titulo: e.target.value })} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
              <span style={{ fontWeight: 400, color: 'var(--text-3)', fontSize: 11.5, flex: 'none' }}>{sesion.ejercicios.length} ejercicios</span>
            </>
          ) : (
            <span style={{ fontWeight: 400, color: 'var(--text-3)', fontSize: 11.5 }}> · día de descanso</span>
          )}
        </div>

        {!sesion && !nuevoEjercicioId && !eligiendo && (
          <input value={tituloDia} onChange={(e) => setTituloDia(e.target.value)} placeholder="Nombre de la sesión (ej: Pierna y glúteo)" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: 12.5, outline: 'none', background: 'var(--surface)', fontFamily: 'inherit' }} />
        )}

        {sesion?.ejercicios.map((item, i) => {
          const ej = porId[item.ejercicioId]
          if (editandoIdx === i) {
            return (
              <div key={i}>
                <EditorDosis ejercicio={ej} dosis={dosis} setDosis={setDosis} guardar={guardarDosis} quitar={quitarDosis} cancelar={() => setEditandoIdx(null)} />
              </div>
            )
          }
          return (
            <button
              key={i}
              onClick={() => {
                setEditandoIdx(i)
                setNuevoEjercicioId(null)
                setDosis({ series: String(item.series), reps: String(item.reps), descansoSeg: String(item.descansoSeg), pesoSugerido: item.pesoSugerido == null ? '' : String(item.pesoSugerido) })
              }}
              style={{ ...card, padding: 12, display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left' }}
            >
              <Miniatura ejercicio={ej} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{ej?.nombre ?? 'Ejercicio ya no está en la biblioteca'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  {item.series} × {item.reps} · {item.descansoSeg} s{item.pesoSugerido != null ? ` · ${item.pesoSugerido} kg` : ''}
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gym-color)' }}>Ajustar</span>
            </button>
          )
        })}

        {nuevoEjercicioId && (
          <EditorDosis ejercicio={porId[nuevoEjercicioId]} dosis={dosis} setDosis={setDosis} guardar={guardarDosis} cancelar={() => setNuevoEjercicioId(null)} />
        )}

        {eligiendo ? (
          <div style={{ ...card, padding: 12 }}>
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar en tu biblioteca…" autoFocus style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '9px 11px', fontSize: 12.5, outline: 'none', background: 'var(--surface-2)', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
              {['todos', ...GRUPOS].map((g) => (
                <button key={g} onClick={() => setGrupo(g)} style={{ fontSize: 10.5, fontWeight: grupo === g ? 600 : 500, color: grupo === g ? '#fff' : '#565652', background: grupo === g ? 'var(--gym-color)' : 'var(--surface-2)', border: grupo === g ? 'none' : '1px solid var(--border)', borderRadius: 99, padding: '5px 10px', whiteSpace: 'nowrap' }}>
                  {g}
                </button>
              ))}
            </div>
            <div style={{ maxHeight: 260, overflowY: 'auto', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {disponibles.length === 0 && (
                <div style={{ fontSize: 11.5, color: 'var(--text-3)', textAlign: 'center', padding: '16px 0' }}>
                  Sin resultados. Añádelo en la pestaña <b>Ejercicios</b>.
                </div>
              )}
              {disponibles.map((ej) => (
                <button
                  key={ej.id}
                  onClick={() => {
                    setNuevoEjercicioId(ej.id)
                    setDosis({ series: '3', reps: '12', descansoSeg: '60', pesoSugerido: '' })
                    setEligiendo(false)
                  }}
                  style={{ display: 'flex', gap: 10, alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 8, background: 'var(--surface-2)', textAlign: 'left' }}
                >
                  <Miniatura ejercicio={ej} tam={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{ej.nombre}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{ej.grupo}</div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setEligiendo(false)} style={{ width: '100%', marginTop: 8, fontSize: 12, fontWeight: 600, color: 'var(--text-3)', padding: '6px 0' }}>Cancelar</button>
          </div>
        ) : (
          !nuevoEjercicioId && editandoIdx === null && (
            <button onClick={() => { setEligiendo(true); setBusqueda('') }} style={{ border: '1.5px dashed #c9c9c5', borderRadius: 'var(--radius-md)', padding: '11px 0', textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: 'var(--text-3)', background: 'transparent' }}>
              + Añadir ejercicio de mi biblioteca
            </button>
          )
        )}

        <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6, marginTop: 4 }}>
          Para asignarla: entra a la ficha del cliente en <b>Clientes</b> → Rutina asignada.
        </div>

        <button onClick={guardar} disabled={guardando} style={{ background: guardado ? '#166534' : 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '13px 0', textAlign: 'center', fontSize: 13.5, fontWeight: 600, opacity: guardando ? 0.7 : 1 }}>
          {guardando ? 'Guardando…' : guardado ? '✓ Rutina guardada' : 'Guardar rutina'}
        </button>

        {id !== 'nueva' &&
          (confirmandoBorrar ? (
            <div style={{ ...card, border: '1px solid #f3d5d5', padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)' }}>¿Eliminar "{rutina.nombre}"?</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Los clientes que la tengan asignada quedarán sin rutina.</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => setConfirmandoBorrar(false)} style={{ flex: 1, border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12.5, fontWeight: 600, background: 'var(--surface)' }}>Cancelar</button>
                <button onClick={borrar} style={{ flex: 1, borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12.5, fontWeight: 600, background: 'var(--danger)', color: '#fff' }}>Eliminar</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmandoBorrar(true)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)', padding: '4px 0' }}>Eliminar rutina</button>
          ))}
      </div>
    </>
  )
}
