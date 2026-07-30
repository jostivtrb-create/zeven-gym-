import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { demoComunicadosAdmin } from '../../data/demoAdmin'

export default function AdminComunicados() {
  const navigate = useNavigate()
  const [comunicados, setComunicados] = useState(demoComunicadosAdmin)
  const [creando, setCreando] = useState(false)
  const [form, setForm] = useState({ titulo: '', texto: '' })

  const publicar = () => {
    if (!form.titulo.trim() || !form.texto.trim()) return
    setComunicados([{ id: `a${Date.now()}`, titulo: form.titulo.trim(), texto: form.texto.trim(), hace: 'Ahora' }, ...comunicados])
    setForm({ titulo: '', texto: '' })
    setCreando(false)
  }

  const eliminar = (id) => setComunicados(comunicados.filter((c) => c.id !== id))

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <button onClick={() => navigate('/admin/mas')} style={{ color: 'rgba(255,255,255,.8)', fontSize: 12 }}>‹ Más</button>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600, marginTop: 8 }}>Comunicados</div>
        <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, marginTop: 2 }}>Los ven todos tus clientes en su portada</div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {creando ? (
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--gym-color)', borderRadius: 'var(--radius-md)', padding: 14 }}>
            <input
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Título del comunicado"
              autoFocus
              style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, fontWeight: 600, padding: 0, boxSizing: 'border-box' }}
            />
            <textarea
              value={form.texto}
              onChange={(e) => setForm({ ...form, texto: e.target.value })}
              placeholder="Escribe el aviso para tus clientes…"
              rows={3}
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', padding: '10px 12px', fontSize: 12.5, outline: 'none', resize: 'none', marginTop: 10, boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5 }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={publicar} style={{ flex: 1, background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12.5, fontWeight: 600 }}>Publicar</button>
              <button onClick={() => setCreando(false)} style={{ border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 12.5, fontWeight: 600, color: 'var(--text-3)', background: 'var(--surface)' }}>Cancelar</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setCreando(true)} style={{ border: '1.5px dashed #c9c9c5', borderRadius: 'var(--radius-md)', padding: '13px 0', textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--text-3)', background: 'transparent' }}>
            + Nuevo comunicado
          </button>
        )}

        {comunicados.map((c) => (
          <div key={c.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.titulo}</div>
              <button onClick={() => eliminar(c.id)} style={{ fontSize: 11, fontWeight: 600, color: 'var(--danger)', flex: 'none' }}>Eliminar</button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3, lineHeight: 1.5 }}>{c.texto}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--gym-color)', marginTop: 8 }}>{c.hace}</div>
          </div>
        ))}
      </div>
    </>
  )
}
