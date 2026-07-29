import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import ClienteShell from './screens/cliente/ClienteShell'
import Portada from './screens/cliente/Portada'
import Rutina from './screens/cliente/Rutina'
import Progreso from './screens/cliente/Progreso'
import Calculadoras from './screens/cliente/Calculadoras'
import Perfil from './screens/cliente/Perfil'
import Bienvenida from './screens/entrada/Bienvenida'
import Registro from './screens/entrada/Registro'
import Login from './screens/entrada/Login'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Bienvenida />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<ClienteShell />}>
            <Route index element={<Portada />} />
            <Route path="rutina" element={<Rutina />} />
            <Route path="progreso" element={<Progreso />} />
            <Route path="calcular" element={<Calculadoras />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
