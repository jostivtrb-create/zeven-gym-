import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGym } from '../../context/ThemeContext'
import { listarPlanes, guardarPlan } from '../../services/db'

const pesos = (n) => '$' + Number(n).toLocaleString('es-CO')
const campo = { flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '9px 12px' }
const inputStyle = { width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 600, padding: 0 }

export default function AdminPlanes() {
  const navigate = useNavigate()
  const { gym } = useGym()
  const [planes, setPlanes] = useState(null)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', precio: '', duracionDias: '' })
  const [ocupado, setOcupado] = useState(false)

  const cargar = () => gym.id && listarPlanes(gym.id).then(setPlanes).catch(() => setPlanes([]))
  useEffect(() => { cargar() }, [gym.id])

  const abrir = (p) => {
    setEditando(p ? p.id : 'nuevo')
    setForm(p ? { nombre: p.nombre, precio: String(p.precio), duracionDias: String(p.duracionDias) } : { nombre: '', precio: '', duracionDias: '' })
  }

  const guardar = async () => {
    const datos = { nombre: form.nombre.trim(), precio: Number(form.precio), duracionDias: Number(form.duracionDias) }
    if (!datos.nombre || !datos.precio || !datos.duracionDias) return
    setOcupado(true)
    try {
      await guardarPlan(gym.id, editando === 'nuevo' ? datos : { id: editando, ...datos })
      setEditando(null)
      await cargar()
    } finally {
      setOcupado(false)
    }
  }

  const Editor = () => (
    <div style={{ background: 'var(--surface)', border: '1.5px solid var(--gym-color)', borderRadius: 'var(--radius-md)', padding: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gym-color)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        {editando === 'nuevo' ? 'Nuevo plan' : 'Editando'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
        <div style={campo}>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Nombre del plan</div>
          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Plan Mensual" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={campo}>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Precio (COP)</div>
            <input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="70000" style={inputStyle} />
          </div>
          <div style={campo}>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Duración (días)</div>
            <input type="number" value={form.duracionDias} onChange={(e) => setForm({ ...form, duracionDias: e.target.value })} placeholder="30" style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
          <button onClick={guardar} disabled={ocupado} style={{ flex: 1, background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12.5, fontWeight: 600, opacity: ocupado ? 0.6 : 1 }}>
            {ocupado ? 'Guardando…' : editando === 'nuevo' ? 'Crear plan' : 'Guardar cambios'}
          </button>
          <button onClick={() => setEditando(null)} style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 12.5, fontWeight: 600, color: 'var(--text-3)' }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <button onClick={() => navigate('/admin/mas')} style={{ color: 'rgba(255,255,255,.8)', fontSize: 12 }}>‹ Más</button>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600, marginTop: 8 }}>Planes del gym</div>
        <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, marginTop: 2 }}>Tus clientes se suscriben a estos planes</div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {planes === null && <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-3)', fontSize: 12.5 }}>Cargando planes…</div>}

        {planes !== null && planes.length === 0 && editando !== 'nuevo' && (
          <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-2)', fontSize: 12.5, lineHeight: 1.6 }}>
            Aún no tienes planes. Crea el primero (ej: Plan Mensual, $70.000, 30 días) para poder registrar pagos de tus clientes.
          </div>
        )}

        {(planes ?? []).map((p) =>
          editando === p.id ? (
            <Editor key={p.id} />
          ) : (
            <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.nombre}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{p.duracionDias} día{p.duracionDias === 1 ? '' : 's'}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gym-color)' }}>{pesos(p.precio)}</div>
              <button onClick={() => abrir(p)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)' }}>Editar</button>
            </div>
          )
        )}

        {editando === 'nuevo' ? (
          <Editor />
        ) : (
          <button onClick={() => abrir(null)} style={{ border: '1.5px dashed #c9c9c5', borderRadius: 'var(--radius-md)', padding: '13px 0', textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--text-3)', background: 'transparent' }}>
            + Nuevo plan
          </button>
        )}
      </div>
    </>
  )
}
