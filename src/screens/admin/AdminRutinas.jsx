import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../firebase'
import { useGym } from '../../context/ThemeContext'
import { listarRutinas, listarEjerciciosGym, guardarEjercicioGym, eliminarEjercicioGym, copiarCatalogoAGym } from '../../services/db'
import { copiarPromptYAbrirGemini } from '../../services/infografia'
import { GRUPOS } from '../../data/catalogoBase'

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }
const campo = { background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '9px 12px' }
const inputStyle = { width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 600, padding: 0, fontFamily: 'inherit' }

function EditorEjercicio({ form, setForm, guardar, cancelar, ocupado }) {
  return (
    <div style={{ ...card, border: '1.5px solid var(--gym-color)', padding: 14 }}>
      <div style={campo}>
        <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Nombre del ejercicio</div>
        <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Sentadilla en máquina Smith" style={inputStyle} autoFocus />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
        {GRUPOS.map((g) => (
          <button key={g} onClick={() => setForm({ ...form, grupo: g })} style={{ fontSize: 11, fontWeight: form.grupo === g ? 600 : 500, color: form.grupo === g ? '#fff' : '#565652', background: form.grupo === g ? 'var(--gym-color)' : 'var(--surface-2)', border: form.grupo === g ? 'none' : '1px solid var(--border)', borderRadius: 99, padding: '6px 12px' }}>
            {g}
          </button>
        ))}
      </div>
      <textarea
        value={form.nota}
        onChange={(e) => setForm({ ...form, nota: e.target.value })}
        placeholder="Técnica: lo que verá el cliente como consejo y lo que se usa para generar la infografía."
        rows={3}
        style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', padding: '9px 11px', fontSize: 11.5, outline: 'none', resize: 'none', marginTop: 10, boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5 }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={guardar} disabled={ocupado} style={{ flex: 1, background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12.5, fontWeight: 600 }}>
          {ocupado ? 'Guardando…' : 'Guardar ejercicio'}
        </button>
        <button onClick={cancelar} style={{ border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 12.5, fontWeight: 600, color: 'var(--text-3)', background: 'var(--surface)' }}>Cancelar</button>
      </div>
    </div>
  )
}

export default function AdminRutinas() {
  const navigate = useNavigate()
  const { gym } = useGym()
  const [pestana, setPestana] = useState('rutinas')
  const [rutinas, setRutinas] = useState(null)
  const [ejercicios, setEjercicios] = useState(null)
  const [grupo, setGrupo] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', grupo: 'Pecho', nota: '' })
  const [ocupado, setOcupado] = useState(false)
  const [copiado, setCopiado] = useState('')
  const [subiendo, setSubiendo] = useState('')

  const cargar = () => {
    if (!gym.id) return
    listarRutinas(gym.id).then(setRutinas).catch(() => setRutinas([]))
    listarEjerciciosGym(gym.id).then(setEjercicios).catch(() => setEjercicios([]))
  }
  useEffect(() => { cargar() }, [gym.id])

  const abrir = (e) => {
    setEditando(e ? e.id : 'nuevo')
    setForm(e ? { nombre: e.nombre, grupo: e.grupo ?? 'Pecho', nota: e.nota ?? '' } : { nombre: '', grupo: 'Pecho', nota: '' })
  }

  const guardar = async () => {
    if (!form.nombre.trim()) return
    setOcupado(true)
    try {
      await guardarEjercicioGym(gym.id, editando === 'nuevo' ? { ...form, nombre: form.nombre.trim() } : { id: editando, ...form, nombre: form.nombre.trim() })
      setEditando(null)
      cargar()
    } finally {
      setOcupado(false)
    }
  }

  const quitar = async (ej) => {
    await eliminarEjercicioGym(gym.id, ej.id)
    cargar()
  }

  const importar = async () => {
    setOcupado(true)
    try {
      await copiarCatalogoAGym(gym.id)
      cargar()
    } finally {
      setOcupado(false)
    }
  }

  const generar = async (ej) => {
    const ok = await copiarPromptYAbrirGemini({ nombre: ej.nombre, grupo: ej.grupo, nota: ej.nota }, gym.branding?.color)
    setCopiado(ok ? ej.id : '')
    setTimeout(() => setCopiado(''), 4000)
  }

  const subir = async (ej, archivo) => {
    if (!archivo) return
    setSubiendo(ej.id)
    try {
      const r = ref(storage, `gimnasios/${gym.id}/ejercicios/${ej.id}.jpg`)
      await uploadBytes(r, archivo)
      const url = await getDownloadURL(r)
      await guardarEjercicioGym(gym.id, { id: ej.id, imagenUrl: url })
      cargar()
    } catch (e) {
      console.warn('subir:', e.code ?? e.message)
    } finally {
      setSubiendo('')
    }
  }

  const q = busqueda.trim().toLowerCase()
  const listaEj = (ejercicios ?? []).filter((e) => (grupo === 'todos' || e.grupo === grupo) && (!q || e.nombre.toLowerCase().includes(q)))

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 16px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>Entrenamiento</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {[['rutinas', `Rutinas · ${rutinas?.length ?? '…'}`], ['ejercicios', `Ejercicios · ${ejercicios?.length ?? '…'}`]].map(([id, texto]) => (
            <button key={id} onClick={() => setPestana(id)} style={{ background: pestana === id ? '#fff' : 'rgba(255,255,255,.16)', color: pestana === id ? 'var(--gym-color)' : '#fff', borderRadius: 99, padding: '7px 14px', fontSize: 11.5, fontWeight: pestana === id ? 600 : 500 }}>
              {texto}
            </button>
          ))}
        </div>
        {pestana === 'ejercicios' && (
          <div style={{ marginTop: 12, background: 'rgba(255,255,255,.18)', borderRadius: 'var(--radius)', padding: '4px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2.5">
              <circle cx="10" cy="10" r="6" />
              <line x1="15" y1="15" x2="20" y2="20" />
            </svg>
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar ejercicio…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 12.5, color: '#fff', padding: '7px 0', fontFamily: 'inherit' }} />
          </div>
        )}
      </header>

      {pestana === 'rutinas' ? (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rutinas === null && <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-3)', fontSize: 12.5 }}>Cargando rutinas…</div>}
          {rutinas !== null && rutinas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-2)', fontSize: 12.5, lineHeight: 1.6 }}>
              Aún no tienes rutinas. Créala eligiendo ejercicios de tu biblioteca y ajustando series, repeticiones y descanso.
            </div>
          )}
          {(rutinas ?? []).map((r) => (
            <button key={r.id} onClick={() => navigate(`/admin/rutinas/editor/${r.id}`)} style={{ ...card, padding: 14, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.nombre}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
                  {Object.values(r.dias ?? {}).filter(Boolean).length} días/semana
                  {r.nivel ? ` · ${r.nivel}` : ''}
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gym-color)' }}>Editar</span>
            </button>
          ))}
          <button onClick={() => navigate('/admin/rutinas/editor/nueva')} style={{ border: '1.5px dashed #c9c9c5', borderRadius: 'var(--radius-md)', padding: '13px 0', textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--text-3)', background: 'transparent' }}>
            + Crear rutina
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 6, padding: '14px 16px 4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {['todos', ...GRUPOS].map((g) => (
              <button key={g} onClick={() => setGrupo(g)} style={{ fontSize: 11, fontWeight: grupo === g ? 600 : 500, color: grupo === g ? '#fff' : '#565652', background: grupo === g ? 'var(--gym-color)' : 'var(--surface)', border: grupo === g ? 'none' : '1px solid var(--border-2)', borderRadius: 99, padding: '6px 12px', whiteSpace: 'nowrap', textTransform: g === 'todos' ? 'capitalize' : 'none' }}>
                {g}
              </button>
            ))}
          </div>

          <div style={{ padding: '10px 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ejercicios === null && <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-3)', fontSize: 12.5 }}>Cargando ejercicios…</div>}

            {ejercicios !== null && ejercicios.length === 0 && (
              <div style={{ ...card, padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Tu biblioteca está vacía</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.6 }}>
                  Trae el catálogo de Zeven (con sus infografías) y borra los que no tengas en tu sede.
                </div>
                <button onClick={importar} disabled={ocupado} style={{ marginTop: 14, background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius)', padding: '12px 20px', fontSize: 13, fontWeight: 600 }}>
                  {ocupado ? 'Trayendo…' : 'Traer catálogo de Zeven'}
                </button>
              </div>
            )}

            {editando === 'nuevo' && <EditorEjercicio form={form} setForm={setForm} guardar={guardar} cancelar={() => setEditando(null)} ocupado={ocupado} />}

            {listaEj.map((ej) =>
              editando === ej.id ? (
                <div key={ej.id}>
                  <EditorEjercicio form={form} setForm={setForm} guardar={guardar} cancelar={() => setEditando(null)} ocupado={ocupado} />
                </div>
              ) : (
                <div key={ej.id} style={{ ...card, padding: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {ej.imagenUrl ? (
                      <img src={ej.imagenUrl} alt="" style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flex: 'none' }} />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', flex: 'none', background: 'color-mix(in oklab, var(--gym-color) 8%, white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💪</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{ej.nombre}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{ej.grupo}{ej.catalogoId ? ' · de Zeven' : ' · propio'}</div>
                    </div>
                    <button onClick={() => quitar(ej)} style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)' }}>Quitar</button>
                  </div>
                  {!ej.catalogoId && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button onClick={() => abrir(ej)} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 8, padding: '8px 0', fontSize: 11.5, fontWeight: 600, color: '#565652' }}>Editar</button>
                      <button onClick={() => generar(ej)} style={{ flex: 1, background: 'var(--gym-color)', color: '#fff', borderRadius: 8, padding: '8px 0', fontSize: 11.5, fontWeight: 600 }}>
                        {copiado === ej.id ? '✓ Copiado' : '✨ Infografía'}
                      </button>
                      <label style={{ flex: 1, textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 8, padding: '8px 0', fontSize: 11.5, fontWeight: 600, color: '#565652', cursor: 'pointer' }}>
                        {subiendo === ej.id ? 'Subiendo…' : 'Subir'}
                        <input type="file" accept="image/*" onChange={(e) => subir(ej, e.target.files?.[0])} style={{ display: 'none' }} />
                      </label>
                    </div>
                  )}
                </div>
              )
            )}

            {ejercicios !== null && ejercicios.length > 0 && editando !== 'nuevo' && (
              <button onClick={() => abrir(null)} style={{ border: '1.5px dashed #c9c9c5', borderRadius: 'var(--radius-md)', padding: '13px 0', textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--text-3)', background: 'transparent' }}>
                + Ejercicio propio de mi gym
              </button>
            )}
          </div>
        </>
      )}
    </>
  )
}
