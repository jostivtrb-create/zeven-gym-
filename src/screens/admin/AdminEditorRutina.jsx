import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { demoClientes } from '../../data/demoAdmin'

const DIAS = [
  ['lun', 'L'],
  ['mar', 'M'],
  ['mie', 'X'],
  ['jue', 'J'],
  ['vie', 'V'],
  ['sab', 'S'],
  ['dom', 'D'],
]

const BASE = {
  nombre: 'Fuerza — Intermedio',
  dias: {
    lun: { titulo: 'Empuje', ejercicios: [
      { id: 'x1', nombre: 'Press de banca', series: 4, reps: 8, descanso: 120 },
      { id: 'x2', nombre: 'Press militar', series: 4, reps: 10, descanso: 90 },
    ] },
    mar: { titulo: 'Tirón', ejercicios: [
      { id: 'x3', nombre: 'Dominadas asistidas', series: 4, reps: 8, descanso: 120 },
      { id: 'x4', nombre: 'Remo con barra', series: 4, reps: 10, descanso: 90 },
    ] },
    mie: { titulo: 'Pierna', ejercicios: [
      { id: 'x5', nombre: 'Sentadilla con barra', series: 4, reps: 8, descanso: 150 },
      { id: 'x6', nombre: 'Peso muerto rumano', series: 4, reps: 10, descanso: 120 },
    ] },
    jue: { titulo: 'Empuje 2', ejercicios: [{ id: 'x7', nombre: 'Fondos en paralelas', series: 3, reps: 12, descanso: 90 }] },
    vie: null,
    sab: null,
    dom: null,
  },
}

const NOMBRES_DIA = { lun: 'Lunes', mar: 'Martes', mie: 'Miércoles', jue: 'Jueves', vie: 'Viernes', sab: 'Sábado', dom: 'Domingo' }

export default function AdminEditorRutina() {
  const navigate = useNavigate()
  const [rutina, setRutina] = useState(BASE)
  const [diaSel, setDiaSel] = useState('mar')
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState({ nombre: '', series: '', reps: '', descanso: '' })
  const [asignacion, setAsignacion] = useState('Intermedio')
  const [guardado, setGuardado] = useState(false)

  const sesion = rutina.dias[diaSel]

  const actualizarDia = (nuevaSesion) => setRutina({ ...rutina, dias: { ...rutina.dias, [diaSel]: nuevaSesion } })

  const abrirEjercicio = (ej) => {
    setEditandoId(ej ? ej.id : 'nuevo')
    setForm(ej ? { nombre: ej.nombre, series: String(ej.series), reps: String(ej.reps), descanso: String(ej.descanso) } : { nombre: '', series: '', reps: '', descanso: '' })
  }

  const guardarEjercicio = () => {
    const datos = { nombre: form.nombre.trim(), series: Number(form.series), reps: Number(form.reps), descanso: Number(form.descanso) }
    if (!datos.nombre || !datos.series || !datos.reps) return
    const base = sesion ?? { titulo: 'Nueva sesión', ejercicios: [] }
    const ejercicios =
      editandoId === 'nuevo'
        ? [...base.ejercicios, { id: `x${Date.now()}`, ...datos }]
        : base.ejercicios.map((e) => (e.id === editandoId ? { ...e, ...datos } : e))
    actualizarDia({ ...base, ejercicios })
    setEditandoId(null)
  }

  const asignados = asignacion === 'Individual' ? 1 : demoClientes.filter((c) => c.rutina?.includes(asignacion)).length || 12

  const campo = { flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }
  const inputStyle = { width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 12.5, fontWeight: 600, padding: 0 }

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 16px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <button onClick={() => navigate('/admin/rutinas')} style={{ color: 'rgba(255,255,255,.8)', fontSize: 12 }}>‹ Rutinas</button>
        <input
          value={rutina.nombre}
          onChange={(e) => setRutina({ ...rutina, nombre: e.target.value })}
          style={{ display: 'block', width: '100%', color: '#fff', fontSize: 18, fontWeight: 600, marginTop: 8, background: 'transparent', border: 'none', outline: 'none', padding: 0 }}
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          {DIAS.map(([key, letra]) => {
            const sel = key === diaSel
            const vacio = !rutina.dias[key]
            return (
              <button key={key} onClick={() => setDiaSel(key)} style={{ flex: 1, textAlign: 'center', padding: '7px 0', borderRadius: 'var(--radius-sm)', background: sel ? '#fff' : `rgba(255,255,255,${vacio ? '.10' : '.16'})`, color: sel ? 'var(--gym-color)' : vacio ? 'rgba(255,255,255,.5)' : '#fff', fontSize: 11, fontWeight: sel ? 700 : vacio ? 400 : 600 }}>
                {letra}
              </button>
            )
          })}
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>
          {NOMBRES_DIA[diaSel]}
          {sesion && (
            <>
              {' · '}
              {sesion.titulo} <span style={{ fontWeight: 400, color: 'var(--text-3)', fontSize: 11.5 }}>· {sesion.ejercicios.length} ejercicios</span>
            </>
          )}
          {!sesion && <span style={{ fontWeight: 400, color: 'var(--text-3)', fontSize: 11.5 }}> · día de descanso</span>}
        </div>

        {sesion?.ejercicios.map((ej) =>
          editandoId === ej.id ? (
            <div key={ej.id} style={{ background: 'var(--surface)', border: '1.5px solid var(--gym-color)', borderRadius: 'var(--radius-md)', padding: 12 }}>
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del ejercicio" style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, padding: 0, boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {[
                  ['series', 'Series'],
                  ['reps', 'Reps'],
                  ['descanso', 'Descanso (s)'],
                ].map(([k, label]) => (
                  <div key={k} style={campo}>
                    <div style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{label}</div>
                    <input type="number" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={guardarEjercicio} style={{ flex: 1, background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '9px 0', fontSize: 12, fontWeight: 600 }}>Guardar</button>
                <button onClick={() => setEditandoId(null)} style={{ border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '9px 14px', fontSize: 12, fontWeight: 600, color: 'var(--text-3)', background: 'var(--surface)' }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div key={ej.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ color: '#c9c9c5', fontSize: 15 }}>≡</span>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', flex: 'none', background: 'repeating-linear-gradient(45deg,#eef2f0 0 8px,#e5eae7 8px 16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '8px ui-monospace,monospace', color: '#8a938e' }}>gif</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{ej.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{ej.series} series · {ej.reps} reps · {ej.descanso} s</div>
              </div>
              <button onClick={() => abrirEjercicio(ej)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--gym-color)' }}>Editar</button>
            </div>
          )
        )}

        {editandoId === 'nuevo' ? (
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--gym-color)', borderRadius: 'var(--radius-md)', padding: 12 }}>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del ejercicio" autoFocus style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, padding: 0, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {[
                ['series', 'Series'],
                ['reps', 'Reps'],
                ['descanso', 'Descanso (s)'],
              ].map(([k, label]) => (
                <div key={k} style={campo}>
                  <div style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{label}</div>
                  <input type="number" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={guardarEjercicio} style={{ flex: 1, background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '9px 0', fontSize: 12, fontWeight: 600 }}>Añadir</button>
              <button onClick={() => setEditandoId(null)} style={{ border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '9px 14px', fontSize: 12, fontWeight: 600, color: 'var(--text-3)', background: 'var(--surface)' }}>Cancelar</button>
            </div>
          </div>
        ) : (
          <button onClick={() => abrirEjercicio(null)} style={{ border: '1.5px dashed #c9c9c5', borderRadius: 'var(--radius-md)', padding: '11px 0', textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: 'var(--text-3)', background: 'transparent' }}>
            + Añadir ejercicio
          </button>
        )}

        <div style={{ marginTop: 8, fontSize: 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Asignar a</div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Individual', 'Principiante', 'Intermedio', 'Avanzado'].map((op) => (
              <button key={op} onClick={() => setAsignacion(op)} style={{ fontSize: 11, fontWeight: asignacion === op ? 600 : 500, color: asignacion === op ? '#fff' : '#565652', background: asignacion === op ? 'var(--gym-color)' : 'var(--surface-2)', border: asignacion === op ? 'none' : '1px solid var(--border)', borderRadius: 99, padding: '6px 12px' }}>
                {op === 'Individual' ? 'Cliente individual…' : op}
                {asignacion === op && op !== 'Individual' ? ` · ${asignados}` : ''}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 10 }}>
            {asignacion === 'Individual' ? 'Elige el cliente desde su ficha en Clientes → Asignar.' : `${asignados} clientes de nivel ${asignacion.toLowerCase()} verán esta rutina en su app.`}
          </div>
        </div>

        <button onClick={() => { setGuardado(true); setTimeout(() => navigate('/admin/rutinas'), 700) }} style={{ background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '13px 0', textAlign: 'center', fontSize: 13.5, fontWeight: 600 }}>
          {guardado ? '✓ Rutina guardada' : 'Guardar rutina'}
        </button>
      </div>
    </>
  )
}
