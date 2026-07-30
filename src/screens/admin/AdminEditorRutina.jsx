import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../firebase'
import { useGym } from '../../context/ThemeContext'
import { obtenerRutina, guardarRutina } from '../../services/db'

/* Prompt para que el admin genere la infografía del ejercicio con Gemini.
   Funciona para CUALQUIER ejercicio y usa la explicación del entrenador. */
export function promptInfografia({ nombre, series, reps, descansoSeg, nota }, gym) {
  const color = gym.branding?.color ?? '#16a34a'
  return `Crea una INFOGRAFÍA DE EJERCICIO DE GIMNASIO, ilustración digital vertical (formato 3:4), limpia y profesional, lista para usarse dentro de una app.

EJERCICIO: ${nombre}
DOSIS: ${series} series × ${reps} repeticiones · descanso de ${descansoSeg} segundos
${nota ? `EXPLICACIÓN DEL ENTRENADOR (úsala como base de los pasos y consejos): ${nota}` : 'Sin explicación del entrenador: usa la técnica estándar correcta y segura de este ejercicio.'}

LA INFOGRAFÍA DEBE TENER:
1. Título grande arriba con el nombre "${nombre}" en tipografía moderna geométrica (estilo Poppins).
2. Una figura humana ilustrada en estilo flat moderno (sin rostro detallado, cuerpo atlético neutro) mostrando el ejercicio en 2 o 3 PASOS NUMERADOS: posición inicial → movimiento → posición final, con flechas limpias que indiquen la dirección del movimiento.
3. Los músculos que trabaja el ejercicio resaltados sobre la figura en el color ${color}.
4. Acentos y detalles en el color ${color} (es el color del gimnasio) sobre FONDO BLANCO limpio.
5. Abajo, 2 o 3 consejos cortos de técnica en tono cercano y motivador (tuteo), derivados de la explicación del entrenador.
6. Todo el texto en ESPAÑOL, sin errores de ortografía, sin marcas de agua ni logos.

ESTILO GENERAL: minimalista, deportivo y profesional, con mucho aire blanco — como material oficial de una app premium de gimnasio. La imagen debe ser nítida y legible en la pantalla de un celular.`
}

const DIAS = [
  ['lun', 'L'], ['mar', 'M'], ['mie', 'X'], ['jue', 'J'], ['vie', 'V'], ['sab', 'S'], ['dom', 'D'],
]
const NOMBRES_DIA = { lun: 'Lunes', mar: 'Martes', mie: 'Miércoles', jue: 'Jueves', vie: 'Viernes', sab: 'Sábado', dom: 'Domingo' }

const VACIA = {
  nombre: 'Nueva rutina',
  nivel: null,
  dias: { lun: null, mar: null, mie: null, jue: null, vie: null, sab: null, dom: null },
}

/* Definido FUERA del componente principal: si se declara dentro, React lo
   recrea en cada pulsación y los campos pierden el foco. */
const CAMPO = { flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }
const INPUT = { width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 12.5, fontWeight: 600, padding: 0, fontFamily: 'inherit' }

function EditorEjercicio({ esNuevo, form, setForm, promptCopiado, subiendoImg, crearInfografia, subirInfografia, guardar, quitar, cancelar }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1.5px solid var(--gym-color)', borderRadius: 'var(--radius-md)', padding: 12 }}>
      <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del ejercicio" style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, padding: 0, boxSizing: 'border-box' }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {[['series', 'Series'], ['reps', 'Reps'], ['descansoSeg', 'Descanso (s)']].map(([k, label]) => (
          <div key={k} style={CAMPO}>
            <div style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{label}</div>
            <input type="number" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} style={INPUT} />
          </div>
        ))}
      </div>
      <textarea
        value={form.nota}
        onChange={(e) => setForm({ ...form, nota: e.target.value })}
        placeholder="Mini explicación de la técnica (ej: espalda recta, baja lento hasta 90°, empuja con los talones…). Se usa para crear la infografía y el cliente la ve como consejo."
        rows={2}
        style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', padding: '9px 11px', fontSize: 11.5, outline: 'none', resize: 'none', marginTop: 10, boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5 }}
      />

      <div style={{ marginTop: 10, background: 'color-mix(in oklab, var(--gym-color) 6%, white)', border: '1px dashed color-mix(in oklab, var(--gym-color) 30%, white)', borderRadius: 'var(--radius-sm)', padding: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {form.imagenUrl ? (
            <img src={form.imagenUrl} alt="Infografía" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flex: 'none' }} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 8, flex: 'none', background: '#fff', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✨</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600 }}>{form.imagenUrl ? 'Infografía lista' : 'Infografía del ejercicio'}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.4 }}>
              {promptCopiado ? '✓ Prompt copiado — pégalo en Gemini y guarda la imagen que te genere.' : 'Crea el prompt, genera la imagen en Gemini y súbela aquí.'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={crearInfografia} style={{ flex: 1, background: 'var(--gym-color)', color: '#fff', borderRadius: 8, padding: '8px 0', fontSize: 11.5, fontWeight: 600 }}>
            {promptCopiado ? '✓ Copiado · abrir Gemini' : '✨ Crear infografía con Gemini'}
          </button>
          <label style={{ flex: 1, textAlign: 'center', background: '#fff', border: '1px solid var(--border-2)', borderRadius: 8, padding: '8px 0', fontSize: 11.5, fontWeight: 600, color: '#565652', cursor: 'pointer' }}>
            {subiendoImg ? 'Subiendo…' : form.imagenUrl ? 'Cambiar imagen' : 'Subir infografía'}
            <input type="file" accept="image/*" onChange={subirInfografia} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={guardar} style={{ flex: 1, background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '9px 0', fontSize: 12, fontWeight: 600 }}>
          {esNuevo ? 'Añadir' : 'Guardar'}
        </button>
        {!esNuevo && (
          <button onClick={quitar} style={{ border: '1px solid #f3d5d5', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', padding: '9px 12px', fontSize: 12, fontWeight: 600, background: 'var(--surface)' }}>Quitar</button>
        )}
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
  const [diaSel, setDiaSel] = useState('lun')
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState({ nombre: '', series: '', reps: '', descansoSeg: '', nota: '', imagenUrl: null })
  const [tituloDia, setTituloDia] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [promptCopiado, setPromptCopiado] = useState(false)
  const [subiendoImg, setSubiendoImg] = useState(false)

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
    setPromptCopiado(false)
    setForm(
      ej
        ? { nombre: ej.nombre, series: String(ej.series), reps: String(ej.reps), descansoSeg: String(ej.descansoSeg ?? ej.descanso ?? ''), nota: ej.nota ?? '', imagenUrl: ej.imagenUrl ?? null }
        : { nombre: '', series: '', reps: '', descansoSeg: '', nota: '', imagenUrl: null }
    )
  }

  const crearInfografia = async () => {
    if (!form.nombre.trim()) return
    const prompt = promptInfografia(
      { nombre: form.nombre.trim(), series: Number(form.series) || 3, reps: Number(form.reps) || 12, descansoSeg: Number(form.descansoSeg) || 60, nota: form.nota.trim() },
      gym
    )
    try {
      await navigator.clipboard.writeText(prompt)
      setPromptCopiado(true)
    } catch { /* si el portapapeles falla, igual abrimos Gemini */ }
    window.open('https://gemini.google.com/app', '_blank')
  }

  const subirInfografia = async (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setSubiendoImg(true)
    try {
      const r = ref(storage, `gimnasios/${gym.id}/ejercicios/${Date.now()}-${archivo.name.replace(/[^a-zA-Z0-9.]/g, '')}`)
      await uploadBytes(r, archivo)
      const url = await getDownloadURL(r)
      setForm((f) => ({ ...f, imagenUrl: url }))
    } catch (err) {
      console.warn('subirInfografia:', err.code ?? err.message)
    } finally {
      setSubiendoImg(false)
    }
  }

  const guardarEjercicio = () => {
    const datos = { nombre: form.nombre.trim(), series: Number(form.series), reps: Number(form.reps), descansoSeg: Number(form.descansoSeg) || 60, nota: form.nota.trim(), imagenUrl: form.imagenUrl ?? null }
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

  const editorEjercicio = (
    <EditorEjercicio
      esNuevo={editandoId === 'nuevo'}
      form={form}
      setForm={setForm}
      gym={gym}
      promptCopiado={promptCopiado}
      subiendoImg={subiendoImg}
      crearInfografia={crearInfografia}
      subirInfografia={subirInfografia}
      guardar={guardarEjercicio}
      quitar={() => quitarEjercicio(editandoId)}
      cancelar={() => setEditandoId(null)}
    />
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
            <div key={ej.id}>{editorEjercicio}</div>
          ) : (
            <div key={ej.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
              {ej.imagenUrl ? (
                <img src={ej.imagenUrl} alt="" style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', flex: 'none', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', flex: 'none', background: 'color-mix(in oklab, var(--gym-color) 8%, white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✨</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{ej.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{ej.series} series · {ej.reps} reps · {ej.descansoSeg} s</div>
              </div>
              <button onClick={() => abrirEjercicio(ej)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--gym-color)' }}>Editar</button>
            </div>
          )
        )}

        {editandoId === 'nuevo' ? (
          editorEjercicio
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
