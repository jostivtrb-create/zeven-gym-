import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { useGym } from '../../context/ThemeContext'

export default function AdminInvitar() {
  const navigate = useNavigate()
  const { gym } = useGym()
  const canvasRef = useRef(null)
  const [dataUrl, setDataUrl] = useState(null)
  const [copiado, setCopiado] = useState('')

  const link = `${location.origin}/g/${(gym.codigo ?? '').toLowerCase()}`

  useEffect(() => {
    if (!gym.codigo) return
    QRCode.toDataURL(link, { width: 720, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#1c1c1a', light: '#ffffff' } })
      .then(setDataUrl)
      .catch(() => {})
  }, [link, gym.codigo])

  const copiar = (texto, cual) => {
    navigator.clipboard?.writeText(texto)
    setCopiado(cual)
    setTimeout(() => setCopiado(''), 1400)
  }

  const descargar = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `QR-${gym.nombre.replace(/\s+/g, '-')}.png`
    a.click()
  }

  const compartir = async () => {
    const texto = `¡Únete a ${gym.nombre} en la app! Entra a ${link} y crea tu cuenta. También puedes usar el código ${gym.codigo}.`
    if (navigator.share) {
      try {
        await navigator.share({ title: gym.nombre, text: texto, url: link })
        return
      } catch { /* el usuario canceló */ }
    }
    copiar(texto, 'mensaje')
  }

  const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }

  return (
    <>
      <header style={{ background: 'var(--gym-color)', padding: '62px 20px 20px', borderRadius: '0 0 var(--radius-header) var(--radius-header)' }}>
        <button onClick={() => navigate('/admin/mas')} style={{ color: 'rgba(255,255,255,.8)', fontSize: 12 }}>‹ Más</button>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 600, marginTop: 8 }}>Invitar clientes</div>
        <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, marginTop: 2 }}>Que escaneen o abran tu link y quedan en tu gym</div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ ...card, padding: 20, textAlign: 'center' }}>
          {dataUrl ? (
            <img src={dataUrl} alt={`QR de ${gym.nombre}`} style={{ width: '100%', maxWidth: 260, aspectRatio: '1', margin: '0 auto', display: 'block', borderRadius: 'var(--radius)' }} />
          ) : (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 12.5 }}>Generando QR…</div>
          )}
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 14 }}>{gym.nombre}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>Escanea con la cámara del celular</div>
          <button onClick={descargar} style={{ marginTop: 14, width: '100%', background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius)', padding: '12px 0', fontSize: 13, fontWeight: 600 }}>
            Descargar QR para imprimir
          </button>
        </div>

        <div style={{ ...card, padding: 14 }}>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Código de tu gimnasio</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <div style={{ flex: 1, fontSize: 20, fontWeight: 700, letterSpacing: '.14em' }}>{gym.codigo}</div>
            <button onClick={() => copiar(gym.codigo, 'codigo')} style={{ border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '8px 14px', fontSize: 11.5, fontWeight: 600, color: '#565652', background: 'var(--surface)' }}>
              {copiado === 'codigo' ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        <div style={{ ...card, padding: 14 }}>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Link de invitación</div>
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={() => copiar(link, 'link')} style={{ flex: 1, border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12, fontWeight: 600, color: '#565652', background: 'var(--surface)' }}>
              {copiado === 'link' ? '✓ Copiado' : 'Copiar link'}
            </button>
            <button onClick={compartir} style={{ flex: 1, background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '10px 0', fontSize: 12, fontWeight: 600 }}>
              {copiado === 'mensaje' ? '✓ Mensaje copiado' : 'Compartir'}
            </button>
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.7 }}>
          <b>Cómo se usa:</b> imprime el QR y pégalo en recepción, o manda el link por WhatsApp.<br />
          Tu cliente crea su cuenta y aparece de una vez en tu lista de Clientes.
        </div>
      </div>
    </>
  )
}
