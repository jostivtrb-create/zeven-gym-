import { useEffect, useState } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../firebase'
import { listarCatalogoZeven, sembrarCatalogoBase, guardarEjercicioCatalogo, eliminarEjercicioCatalogo } from '../../services/db'
import { copiarPromptYAbrirGemini } from '../../services/infografia'
import { GRUPOS } from '../../data/catalogoBase'

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }
const campo = { background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '9px 12px' }
const inputStyle = { width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 600, padding: 0, fontFamily: 'inherit' }

function EditorEjercicio({ form, setForm, guardar, cancelar, eliminar, ocupado }) {
  return (
    <div style={{ ...card, border: '1.5px solid var(--zeven-dark)', padding: 14 }}>
      <div style={campo}>
        <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Nombre</div>
        <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Press de banca" style={inputStyle} />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
        {GRUPOS.map((g) => (
          <button key={g} onClick={() => setForm({ ...form, grupo: g })} style={{ fontSize: 11, fontWeight: form.grupo === g ? 600 : 500, color: form.grupo === g ? '#fff' : '#565652', background: form.grupo === g ? 'var(--zeven-dark)' : 'var(--surface-2)', border: form.grupo === g ? 'none' : '1px solid var(--border)', borderRadius: 99, padding: '6px 12px' }}>
            {g}
          </button>
        ))}
      </div>
      <textarea
        value={form.nota}
        onChange={(e) => setForm({ ...form, nota: e.target.value })}
        placeholder="Técnica correcta: lo que se usa para generar la infografía y lo que ve el cliente como consejo."
        rows={3}
        style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', padding: '9px 11px', fontSize: 11.5, outline: 'none', resize: 'none', marginTop: 10, boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5 }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={guardar} disabled={ocupado} style={{ flex: 1, background: 'var(--zeven-dark)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12.5, fontWeight: 600 }}>
          {ocupado ? 'Guardando…' : 'Guardar'}
        </button>
        {eliminar && (
          <button onClick={eliminar} style={{ border: '1px solid #f3d5d5', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: 12.5, fontWeight: 600, background: 'var(--surface)' }}>Eliminar</button>
        )}
        <button onClick={cancelar} style={{ border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: 12.5, fontWeight: 600, color: 'var(--text-3)', background: 'var(--surface)' }}>Cancelar</button>
      </div>
    </div>
  )
}

export default function SuperCatalogo() {
  const [lista, setLista] = useState(null)
  const [grupo, setGrupo] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', grupo: 'Pecho', nota: '' })
  const [ocupado, setOcupado] = useState(false)
  const [subiendo, setSubiendo] = useState('')
  const [copiado, setCopiado] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargar = () => listarCatalogoZeven().then(setLista).catch(() => setLista([]))
  useEffect(() => { cargar() }, [])

  const sembrar = async () => {
    setOcupado(true)
    setMensaje('')
    try {
      const cuantos = await sembrarCatalogoBase()
      await cargar()
      setMensaje(cuantos > 0 ? `✓ Se cargaron ${cuantos} ejercicios al catálogo.` : 'El catálogo ya estaba completo.')
    } catch (e) {
      console.warn('sembrar catálogo:', e.code ?? e.message)
      setMensaje('No se pudo cargar el catálogo. ¿Entraste como superadmin?')
    } finally {
      setOcupado(false)
    }
  }

  const abrir = (e) => {
    setEditando(e ? e.id : 'nuevo')
    setForm(e ? { nombre: e.nombre, grupo: e.grupo ?? 'Pecho', nota: e.nota ?? '' } : { nombre: '', grupo: 'Pecho', nota: '' })
  }

  const guardar = async () => {
    if (!form.nombre.trim()) return
    setOcupado(true)
    try {
      await guardarEjercicioCatalogo(editando === 'nuevo' ? { ...form, nombre: form.nombre.trim(), imagenUrl: null } : { id: editando, ...form, nombre: form.nombre.trim() })
      setEditando(null)
      await cargar()
    } finally {
      setOcupado(false)
    }
  }

  const eliminar = async () => {
    await eliminarEjercicioCatalogo(editando)
    setEditando(null)
    await cargar()
  }

  const generar = async (ej) => {
    const ok = await copiarPromptYAbrirGemini({ nombre: ej.nombre, grupo: ej.grupo, nota: ej.nota })
    setCopiado(ok ? ej.id : '')
    setTimeout(() => setCopiado(''), 4000)
  }

  const subir = async (ej, archivo) => {
    if (!archivo) return
    setSubiendo(ej.id)
    try {
      const r = ref(storage, `catalogoZeven/${ej.id}.jpg`)
      await uploadBytes(r, archivo)
      const url = await getDownloadURL(r)
      await guardarEjercicioCatalogo({ id: ej.id, imagenUrl: url })
      await cargar()
    } catch (e) {
      console.warn('subir infografía:', e.code ?? e.message)
    } finally {
      setSubiendo('')
    }
  }

  const todos = lista ?? []
  const q = busqueda.trim().toLowerCase()
  const filtrada = todos.filter((e) => (grupo === 'todos' || e.grupo === grupo) && (!q || e.nombre.toLowerCase().includes(q)))
  const conImagen = todos.filter((e) => e.imagenUrl).length

  return (
    <>
      <header style={{ background: 'var(--zeven-dark)', padding: '62px 20px 16px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>Catálogo de ejercicios</div>
        <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, marginTop: 2 }}>
          {todos.length} ejercicios · {conImagen} con infografía · lo heredan todos los gimnasios
        </div>
        <div style={{ marginTop: 12, background: 'rgba(255,255,255,.14)', borderRadius: 'var(--radius)', padding: '4px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2.5">
            <circle cx="10" cy="10" r="6" />
            <line x1="15" y1="15" x2="20" y2="20" />
          </svg>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar ejercicio…" style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 12.5, color: '#fff', padding: '7px 0', fontFamily: 'inherit' }} />
        </div>
      </header>

      <div style={{ display: 'flex', gap: 6, padding: '14px 16px 4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {['todos', ...GRUPOS].map((g) => (
          <button key={g} onClick={() => setGrupo(g)} style={{ fontSize: 11, fontWeight: grupo === g ? 600 : 500, color: grupo === g ? '#fff' : '#565652', background: grupo === g ? 'var(--zeven-dark)' : 'var(--surface)', border: grupo === g ? 'none' : '1px solid var(--border-2)', borderRadius: 99, padding: '6px 12px', whiteSpace: 'nowrap', textTransform: g === 'todos' ? 'capitalize' : 'none' }}>
            {g}
          </button>
        ))}
      </div>

      <div style={{ padding: '10px 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {lista === null && <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-3)', fontSize: 12.5 }}>Cargando catálogo…</div>}

        {lista !== null && todos.length === 0 && (
          <div style={{ ...card, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>El catálogo está vacío</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.6 }}>
              Carga los 40 ejercicios base de Zeven. Después les generas la infografía con Gemini y todos los gimnasios las reciben.
            </div>
            <button onClick={sembrar} disabled={ocupado} style={{ marginTop: 14, background: 'var(--zeven-dark)', color: '#fff', borderRadius: 'var(--radius)', padding: '12px 20px', fontSize: 13, fontWeight: 600, opacity: ocupado ? 0.7 : 1 }}>
              {ocupado ? 'Cargando…' : 'Cargar catálogo base'}
            </button>
            {mensaje && <div style={{ marginTop: 12, fontSize: 11.5, color: 'var(--text-2)' }}>{mensaje}</div>}
          </div>
        )}

        {editando === 'nuevo' && <EditorEjercicio form={form} setForm={setForm} guardar={guardar} cancelar={() => setEditando(null)} ocupado={ocupado} />}

        {filtrada.map((ej) =>
          editando === ej.id ? (
            <div key={ej.id}>
              <EditorEjercicio form={form} setForm={setForm} guardar={guardar} cancelar={() => setEditando(null)} eliminar={eliminar} ocupado={ocupado} />
            </div>
          ) : (
            <div key={ej.id} style={{ ...card, padding: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {ej.imagenUrl ? (
                  <img src={ej.imagenUrl} alt="" style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flex: 'none' }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', flex: 'none', background: 'var(--surface-2)', border: '1px dashed var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✨</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{ej.nombre}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{ej.grupo}{ej.imagenUrl ? ' · con infografía' : ' · sin infografía'}</div>
                </div>
                <button onClick={() => abrir(ej)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)' }}>Editar</button>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={() => generar(ej)} style={{ flex: 1, background: 'var(--zeven-dark)', color: '#fff', borderRadius: 8, padding: '8px 0', fontSize: 11.5, fontWeight: 600 }}>
                  {copiado === ej.id ? '✓ Copiado · pega en Gemini' : '✨ Crear infografía'}
                </button>
                <label style={{ flex: 1, textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 8, padding: '8px 0', fontSize: 11.5, fontWeight: 600, color: '#565652', cursor: 'pointer' }}>
                  {subiendo === ej.id ? 'Subiendo…' : ej.imagenUrl ? 'Cambiar' : 'Subir imagen'}
                  <input type="file" accept="image/*" onChange={(e) => subir(ej, e.target.files?.[0])} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          )
        )}

        {todos.length > 0 && editando !== 'nuevo' && (
          <button onClick={() => abrir(null)} style={{ border: '1.5px dashed #c9c9c5', borderRadius: 'var(--radius-md)', padding: '13px 0', textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--text-3)', background: 'transparent' }}>
            + Nuevo ejercicio al catálogo
          </button>
        )}

        {todos.length > 0 && (
          <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.7, marginTop: 4 }}>
            Las infografías que subas aquí aparecen automáticamente en las rutinas de <b>todos</b> los gimnasios.
          </div>
        )}
      </div>
    </>
  )
}
