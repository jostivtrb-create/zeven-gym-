import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGym } from '../../context/ThemeContext'
import { obtenerRutina, guardarRutina } from '../../services/db'

const DIAS = [
  ['lun', 'L'], ['mar', 'M'], ['mie', 'X'], ['jue', 'J'], ['vie', 'V'], ['sab', 'S'], ['dom', 'D'],
]
const NOMBRES_DIA = { lun: 'Lunes', mar: 'Martes', mie: 'Miércoles', jue: 'Jueves', vie: 'Viernes', sab: 'Sábado', dom: 'Domingo' }

const VACIA = {
  nombre: 'Nueva rutina',
  nivel: null,
  dias: { lun: null, mar: null, mie: null, jue: null, vie: null, sab: null, dom: null },
}

export default function AdminEditorRutina() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { gym } = useGym()
  const [rutina, setRutina] = useState(id === 'nueva' ? VACIA : null)
  const [diaSel, setDiaSel] = useState('lun')
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState({ nombre: '', series: '', reps: '', descansoSeg: '' })
  const [tituloDia, setTituloDia] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    if (id !== 'nueva' && gym.id) {
      obtenerRutina(gym.id, id).then((r) => setRutina(r ?? VACIA))
    }
  }, [gym.id, id])

  if (rutina === null) return <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-3)', fontSize: 12.5 }}>Cargando rutina…</div>

  const sesion = rutina.dias[diaSel]

  const actualizarDia = (nuevaSesion) => {
    setRutina({ ...rutina, dias: { ...rutina.dias, [diaSel]: nuevaSesion } })
    setGuardado(false)
  }

  const abrirEjercicio = (ej) => {
    setEditandoId(ej ? ej.id : 'nuevo')
    setForm(ej ? { nombre: ej.nombre, series: String(ej.series), reps: String(ej.reps), descansoSeg: String(ej.descansoSeg ?? ej.descanso ?? '') } : { nombre: '', series: '', reps: '', descansoSeg: '' })
  }

  const guardarEjercicio = () => {
    const datos = { nombre: form.nombre.trim(), series: Number(form.series), reps: Number(form.reps), descansoSeg: Number(form.descansoSeg) || 60, imagenUrl: null }
    if (!datos.nombre || !datos.series || !datos.reps) return
    const base = sesion ?? { titulo: tituloDia.trim() || 'Sesión', ejercicios: [] }
    const ejercicios =
      editandoId === 'nuevo'
        ? [...base.ejercicios, { id: `x${Date.now()}`, ...datos }]
        : base.ejercicios.map((e) => (e.id === editandoId ? { ...e, ...datos } : e))
    actualizarDia({ ...base, ejercicios })
    setEditandoId(null)
  }

  const quitarEjercicio = (ejId) => {
    const ejercicios = sesion.ejercicios.filter((e) => e.id !== ejId)
    actualizarDia(ejercicios.length ? { ...sesion, ejercicios } : null)
    setEditandoId(null)
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

  const campo = { flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }
  const inputStyle = { width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 12.5, fontWeight: 600, padding: 0 }

  const EditorEjercicio = () => (
    <div style={{ background: 'var(--surface)', border: '1.5px solid var(--gym-color)', borderRadius: 'var(--radius-md)', padding: 12 }}>
      <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del ejercicio" style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, padding: 0, boxSizing: 'border-box' }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {[['series', 'Series'], ['reps', 'Reps'], ['descansoSeg', 'Descanso (s)']].map(([k, label]) => (
          <div key={k} style={campo}>
            <div style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{label}</div>
            <input type="number" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} style={inputStyle} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={guardarEjercicio} style={{ flex: 1, background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '9px 0', fontSize: 12, fontWeight: 600 }}>
          {editandoId === 'nuevo' ? 'Añadir' : 'Guardar'}
        </button>
        {editandoId !== 'nuevo' && (
          <button onClick={() => quitarEjercicio(editandoId)} style={{ border: '1px solid #f3d5d5', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', padding: '9px 12px', fontSize: 12, fontWeight: 600, background: 'var(--surface)' }}>Quitar</button>
        )}
        <button onClick={() => setEditandoId(null)} style={{ border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '9px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-3)', background: 'var(--surface)' }}>Cancelar</button>
      </div>
    </div>
  )

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 16px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <button onClick={() => navigate('/admin/rutinas')} style={{ color: 'rgba(255,255,255,.8)', fontSize: 12 }}>‹ Rutinas</button>
        <input
          value={rutina.nombre}
          onChange={(e) => { setRutina({ ...rutina, nombre: e.target.value }); setGuardado(false) }}
          style={{ display: 'block', width: '100%', color: '#fff', fontSize: 18, fontWeight: 600, marginTop: 8, background: 'transparent', border: 'none', outline: 'none', padding: 0 }}
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          {DIAS.map(([key, letra]) => {
            const sel = key === diaSel
            const vacio = !rutina.dias[key]
            return (
              <button key={key} onClick={() => { setDiaSel(key); setEditandoId(null); setTituloDia('') }} style={{ flex: 1, textAlign: 'center', padding: '7px 0', borderRadius: 'var(--radius-sm)', background: sel ? '#fff' : `rgba(255,255,255,${vacio ? '.10' : '.16'})`, color: sel ? 'var(--gym-color)' : vacio ? 'rgba(255,255,255,.5)' : '#fff', fontSize: 11, fontWeight: sel ? 700 : vacio ? 400 : 600 }}>
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
              <input value={sesion.titulo} onChange={(e) => actualizarDia({ ...sesion, titulo: e.target.value })} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', flex: 1 }} />
              <span style={{ fontWeight: 400, color: 'var(--text-3)', fontSize: 11.5, flex: 'none' }}>{sesion.ejercicios.length} ejercicios</span>
            </>
          ) : (
            <span style={{ fontWeight: 400, color: 'var(--text-3)', fontSize: 11.5 }}> · día de descanso</span>
          )}
        </div>

        {!sesion && editandoId !== 'nuevo' && (
          <input value={tituloDia} onChange={(e) => setTituloDia(e.target.value)} placeholder="Nombre de la sesión (ej: Pierna y glúteo)" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: 12.5, outline: 'none', background: 'var(--surface)', fontFamily: 'inherit' }} />
        )}

        {sesion?.ejercicios.map((ej) =>
          editandoId === ej.id ? (
            <EditorEjercicio key={ej.id} />
          ) : (
            <div key={ej.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', flex: 'none', background: 'repeating-linear-gradient(45deg,#eef2f0 0 8px,#e5eae7 8px 16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '8px ui-monospace,monospace', color: '#8a938e' }}>gif</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{ej.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{ej.series} series · {ej.reps} reps · {ej.descansoSeg} s</div>
              </div>
              <button onClick={() => abrirEjercicio(ej)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--gym-color)' }}>Editar</button>
            </div>
          )
        )}

        {editandoId === 'nuevo' ? (
          <EditorEjercicio />
        ) : (
          <button onClick={() => abrirEjercicio(null)} style={{ border: '1.5px dashed #c9c9c5', borderRadius: 'var(--radius-md)', padding: '11px 0', textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: 'var(--text-3)', background: 'transparent' }}>
            + Añadir ejercicio
          </button>
        )}

        <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6 }}>
          Para asignarla: entra a la ficha del cliente en <b>Clientes</b> → Rutina asignada.
        </div>

        <button onClick={guardar} disabled={guardando} style={{ background: guardado ? '#166534' : 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '13px 0', textAlign: 'center', fontSize: 13.5, fontWeight: 600, opacity: guardando ? 0.7 : 1 }}>
          {guardando ? 'Guardando…' : guardado ? '✓ Rutina guardada' : 'Guardar rutina'}
        </button>
      </div>
    </>
  )
}
