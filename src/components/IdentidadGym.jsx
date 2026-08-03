import { useRef, useState } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'
import { PALETA_GYMS } from '../data/constantes'
import { copiarPromptPortadaYAbrirGemini, copiarPromptAmigoYAbrirGemini } from '../services/infografia'

/* Editor de identidad del gimnasio: logo, portada y color.
   Lo usan el admin (Configuración) y el superadmin (detalle del gym). */

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }

export default function IdentidadGym({ gym, onChange, guardar, ocupado }) {
  const branding = gym.branding ?? {}
  const color = branding.color ?? '#16a34a'
  const logoRef = useRef(null)
  const bannerRef = useRef(null)
  const amigoRef = useRef(null)
  const [subiendo, setSubiendo] = useState('')
  const [avisoIa, setAvisoIa] = useState('')
  const iniciales = (gym.nombre ?? 'G').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()

  const CAMPO_BRANDING = { logo: 'logoUrl', banner: 'bannerUrl', amigo: 'amigoUrl' }

  const subir = async (tipo, archivo) => {
    if (!archivo || !gym.id) return
    setSubiendo(tipo)
    try {
      const r = ref(storage, `gimnasios/${gym.id}/${tipo}.jpg`)
      await uploadBytes(r, archivo)
      const url = await getDownloadURL(r)
      onChange({ ...branding, [CAMPO_BRANDING[tipo]]: url })
    } catch (e) {
      console.warn('subir', tipo, e.code ?? e.message)
    } finally {
      setSubiendo('')
    }
  }

  return (
    <div style={{ ...card, padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Vista previa en vivo */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div
          style={{
            height: 84,
            background: branding.bannerUrl ? `center/cover url(${branding.bannerUrl})` : 'repeating-linear-gradient(45deg,#eef2f0 0 10px,#e5eae7 10px 20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            font: '10px ui-monospace,monospace',
            color: '#8a938e',
          }}
        >
          {!branding.bannerUrl && 'portada del gym'}
        </div>
        <div style={{ background: color, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fff', color, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flex: 'none' }}>
            {branding.logoUrl ? <img src={branding.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : iniciales}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gym.nombre}</div>
            <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 10 }}>Así lo ven tus clientes</div>
          </div>
        </div>
      </div>

      {/* Logo y portada */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => logoRef.current?.click()} style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 11.5, fontWeight: 600, color: '#565652' }}>
          {subiendo === 'logo' ? 'Subiendo…' : branding.logoUrl ? 'Cambiar logo' : 'Subir logo'}
        </button>
        <input ref={logoRef} type="file" accept="image/*" onChange={(e) => subir('logo', e.target.files?.[0])} style={{ display: 'none' }} />
        <button onClick={() => bannerRef.current?.click()} style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 11.5, fontWeight: 600, color: '#565652' }}>
          {subiendo === 'banner' ? 'Subiendo…' : branding.bannerUrl ? 'Cambiar portada' : 'Subir portada'}
        </button>
      </div>
      <input ref={bannerRef} type="file" accept="image/*" onChange={(e) => subir('banner', e.target.files?.[0])} style={{ display: 'none' }} />
      <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: -8, lineHeight: 1.5 }}>
        El logo se ve mejor <b>cuadrado</b> (es el ícono de la app en el celular de tus clientes). La portada, horizontal.
      </div>

      {/* Portada con IA: copia el prompt maestro y abre Gemini */}
      <button
        onClick={async () => {
          const ok = await copiarPromptPortadaYAbrirGemini(gym)
          setAvisoIa(ok ? 'Prompt copiado. En Gemini: adjunta tu logo, pega el prompt y genera. Luego sube aquí la imagen con "Cambiar portada".' : 'Se abrió Gemini, pero copia el prompt manualmente (el portapapeles falló).')
        }}
        style={{ background: 'color-mix(in oklab, ' + color + ' 10%, white)', border: '1px solid color-mix(in oklab, ' + color + ' 30%, white)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: 11.5, fontWeight: 600, color, textAlign: 'center' }}
      >
        ✨ Crear mi portada con IA (Gemini)
      </button>
      {/* Foto de la tarjeta "¡Trae un amigo!" del Inicio de los clientes */}
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600 }}>Foto de "¡Trae un amigo!"</div>
        <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.5 }}>
          Sale en el Inicio de tus clientes invitando a entrenar acompañado. Genérala con IA usando tu logo.
        </div>
        {branding.amigoUrl && (
          <div style={{ marginTop: 8, height: 74, borderRadius: 'var(--radius-sm)', background: `center/cover url(${branding.amigoUrl})`, border: '1px solid var(--border)' }} />
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={async () => {
              const ok = await copiarPromptAmigoYAbrirGemini(gym)
              setAvisoIa(ok ? 'Prompt copiado. En Gemini: adjunta tu logo, pega el prompt y genera. Luego súbela aquí con "Subir foto".' : 'Se abrió Gemini, pero copia el prompt manualmente (el portapapeles falló).')
            }}
            style={{ flex: 1, background: 'color-mix(in oklab, ' + color + ' 10%, white)', border: '1px solid color-mix(in oklab, ' + color + ' 30%, white)', borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 11.5, fontWeight: 600, color }}
          >
            ✨ Crear con IA
          </button>
          <button onClick={() => amigoRef.current?.click()} style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 11.5, fontWeight: 600, color: '#565652' }}>
            {subiendo === 'amigo' ? 'Subiendo…' : branding.amigoUrl ? 'Cambiar foto' : 'Subir foto'}
          </button>
        </div>
        <input ref={amigoRef} type="file" accept="image/*" onChange={(e) => subir('amigo', e.target.files?.[0])} style={{ display: 'none' }} />
      </div>

      {avisoIa && (
        <div style={{ fontSize: 10.5, color: 'var(--text-2)', marginTop: -8, lineHeight: 1.55, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
          {avisoIa}
        </div>
      )}

      {/* Color */}
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600 }}>Color de tu marca</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
          {PALETA_GYMS.map((c) => (
            <button key={c} onClick={() => onChange({ ...branding, color: c })} aria-label={`Color ${c}`} style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', background: c, outline: color.toLowerCase() === c ? '2.5px solid var(--text)' : 'none', outlineOffset: 2 }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: color, flex: 'none', border: '1px solid var(--border-2)' }} />
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>o escríbelo:</span>
          <input
            value={color}
            onChange={(e) => {
              let v = e.target.value.trim()
              if (v && !v.startsWith('#')) v = '#' + v
              onChange({ ...branding, color: v.slice(0, 7) })
            }}
            placeholder="#16a34a"
            maxLength={7}
            style={{ flex: 1, minWidth: 0, border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '7px 10px', fontSize: 12.5, fontWeight: 600, outline: 'none', fontFamily: 'ui-monospace, monospace', textTransform: 'lowercase' }}
          />
        </div>
      </div>

      {guardar && (
        <button onClick={guardar} disabled={ocupado} style={{ background: color, color: '#fff', borderRadius: 'var(--radius)', padding: '12px 0', fontSize: 13, fontWeight: 600, opacity: ocupado ? 0.7 : 1 }}>
          {ocupado ? 'Guardando…' : 'Guardar identidad'}
        </button>
      )}
    </div>
  )
}
