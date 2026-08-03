import { useEffect, useState } from 'react'
import { useGym } from '../context/ThemeContext'

/* Botón/aviso de instalación de la PWA (patrón skill instalar-app-mobil):
   - Android/Chrome: usa beforeinstallprompt
   - iOS: modal con instrucciones (Compartir → Añadir a pantalla de inicio)
   Se presenta con la identidad del gimnasio del usuario, no con la de Zeven. */

const esIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
const yaInstalada = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone

export default function InstallPrompt() {
  const { gym } = useGym()
  const [evento, setEvento] = useState(null)
  const [mostrarIos, setMostrarIos] = useState(false)
  const [oculto, setOculto] = useState(() => localStorage.getItem('zg-install-oculto') === '1')

  useEffect(() => {
    const captura = (e) => {
      e.preventDefault()
      setEvento(e)
    }
    window.addEventListener('beforeinstallprompt', captura)
    return () => window.removeEventListener('beforeinstallprompt', captura)
  }, [])

  if (oculto || yaInstalada()) return null
  const puedeAndroid = !!evento
  const puedeIos = esIos()
  if (!puedeAndroid && !puedeIos) return null

  const instalar = async () => {
    if (puedeAndroid) {
      evento.prompt()
      const { outcome } = await evento.userChoice
      if (outcome === 'accepted') cerrar()
    } else {
      setMostrarIos(true)
    }
  }

  const cerrar = () => {
    setOculto(true)
    localStorage.setItem('zg-install-oculto', '1')
  }

  return (
    <>
      <div style={{ position: 'fixed', left: 16, right: 16, bottom: 76, zIndex: 60, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow-pop)', maxWidth: 448, margin: '0 auto' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gym-color)', color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', overflow: 'hidden' }}>
          {gym?.branding?.logoUrl
            ? <img src={gym.branding.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (gym?.nombre ?? 'Z').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>Instala la app de {gym?.nombre ?? 'tu gimnasio'}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Acceso directo, pantalla completa y rutina offline</div>
        </div>
        <button onClick={instalar} style={{ background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap' }}>Instalar</button>
        <button onClick={cerrar} aria-label="Cerrar" style={{ color: 'var(--text-4)', fontSize: 16, lineHeight: 1 }}>×</button>
      </div>

      {mostrarIos && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(28,28,26,.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setMostrarIos(false)}>
          <div style={{ background: 'var(--surface)', borderRadius: '16px 16px 0 0', padding: '22px 20px calc(22px + env(safe-area-inset-bottom))', width: '100%', maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 600, textAlign: 'center' }}>Instalar en iPhone</div>
            <ol style={{ margin: '14px 0 0', paddingLeft: 20, fontSize: 13, color: 'var(--text-2)', lineHeight: 2 }}>
              <li>Toca el botón <b>Compartir</b> (cuadro con flecha ↑) en Safari.</li>
              <li>Baja y elige <b>"Añadir a pantalla de inicio"</b>.</li>
              <li>Toca <b>Añadir</b> — ¡y listo!</li>
            </ol>
            <button onClick={() => { setMostrarIos(false); cerrar() }} style={{ marginTop: 16, width: '100%', background: 'var(--gym-color)', color: '#fff', borderRadius: 'var(--radius)', padding: '12px 0', fontSize: 13, fontWeight: 600 }}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}
