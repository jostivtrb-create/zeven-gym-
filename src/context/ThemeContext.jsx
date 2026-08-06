import { createContext, useContext, useEffect, useState } from 'react'

/* Marca del gimnasio activo. Toda la app lee de aquí: color, logo, nombre.
   El superadmin usa la identidad neutra Zeven (theme = null). */

const ThemeContext = createContext(null)

/* Marca neutra mientras no se conoce el gimnasio (pantalla de entrada). */
const GYM_NEUTRO = {
  id: null,
  nombre: 'Zeven Gym',
  ciudad: '',
  codigo: null,
  branding: { color: '#16a34a', logoUrl: null, bannerUrl: null },
  contacto: {},
  horarios: [],
  politicas: { vigencia: 'desde_pago', permitirCongelar: true, bloquearAlVencer: false },
}

/* Tema de la app del cliente: oscuro por defecto (el diseño nació oscuro),
   pero cada quien puede pasarlo a claro desde su Perfil. Se recuerda en el
   celular. Los paneles de admin y superadmin siempre van en claro. */
const leerTema = () => {
  try {
    return localStorage.getItem('zg-tema') === 'claro' ? 'claro' : 'oscuro'
  } catch {
    return 'oscuro'
  }
}

export function ThemeProvider({ children }) {
  const [gym, setGym] = useState(GYM_NEUTRO)
  const [soporte, setSoporte] = useState(null) // { gymNombre } cuando el superadmin entra a un panel ajeno
  const [tema, setTemaState] = useState(leerTema)

  const setTema = (nuevo) => {
    setTemaState(nuevo)
    try { localStorage.setItem('zg-tema', nuevo) } catch { /* sin localStorage: solo esta sesión */ }
  }

  useEffect(() => {
    const color = gym?.branding?.color
    const root = document.documentElement
    if (color) {
      root.style.setProperty('--gym-color', color)
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
    } else {
      root.style.removeProperty('--gym-color')
    }

    // La PWA se instala con la identidad del gimnasio: su nombre, su logo y su color
    const manifest = document.querySelector('link[rel="manifest"]')
    if (manifest && gym?.codigo) {
      manifest.setAttribute('href', `/api/manifest?g=${gym.codigo}`)
    }
    // Se recuerda para que el script de index.html la aplique ANTES de que el
    // navegador lea el manifest en la próxima visita (Chrome lo captura al cargar).
    if (gym?.codigo) {
      try {
        localStorage.setItem('zg-gym-codigo', gym.codigo)
        localStorage.setItem('zg-gym-nombre', gym.nombre ?? '')
        if (gym.branding?.logoUrl) localStorage.setItem('zg-gym-logo', gym.branding.logoUrl)
        else localStorage.removeItem('zg-gym-logo')
      } catch { /* sin localStorage no pasa nada: identidad Zeven */ }
    }
    if (gym?.branding?.logoUrl) {
      document.querySelector('link[rel="apple-touch-icon"]')?.setAttribute('href', gym.branding.logoUrl)
      document.querySelector('link[rel="icon"]')?.setAttribute('href', gym.branding.logoUrl)
    }
    // El título solo se pisa con un gym REAL: mientras carga la sesión, la marca
    // neutra no debe tapar la identidad del gym que dejó el script de index.html.
    let hayGuardada = false
    try { hayGuardada = !!localStorage.getItem('zg-gym-nombre') } catch { /* sin localStorage */ }
    if (gym?.nombre && (gym.id || !hayGuardada)) {
      document.title = gym.nombre
      document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', gym.nombre)
    }
  }, [gym])

  return (
    <ThemeContext.Provider value={{ gym, setGym, soporte, setSoporte, tema, setTema }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useGym() {
  return useContext(ThemeContext)
}
