import { createContext, useContext, useEffect, useState } from 'react'

/* Marca del gimnasio activo. Toda la app lee de aquí: color, logo, nombre.
   El superadmin usa la identidad neutra Zeven (theme = null). */

import { demoGym } from '../data/demo'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [gym, setGym] = useState(demoGym)
  const [soporte, setSoporte] = useState(null) // { gymNombre } cuando el superadmin entra a un panel ajeno

  useEffect(() => {
    const color = gym?.branding?.color
    const root = document.documentElement
    if (color) {
      root.style.setProperty('--gym-color', color)
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', color)
    } else {
      root.style.removeProperty('--gym-color')
    }
  }, [gym])

  return (
    <ThemeContext.Provider value={{ gym, setGym, soporte, setSoporte }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useGym() {
  return useContext(ThemeContext)
}
