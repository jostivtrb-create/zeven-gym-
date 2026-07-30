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
import AdminShell from './screens/admin/AdminShell'
import AdminDashboard from './screens/admin/AdminDashboard'
import AdminClientes from './screens/admin/AdminClientes'
import AdminDetalleCliente from './screens/admin/AdminDetalleCliente'
import AdminPagos from './screens/admin/AdminPagos'
import AdminPlanes from './screens/admin/AdminPlanes'
import AdminRutinas from './screens/admin/AdminRutinas'
import AdminEditorRutina from './screens/admin/AdminEditorRutina'
import AdminComunicados from './screens/admin/AdminComunicados'
import AdminConfig from './screens/admin/AdminConfig'
import AdminMas from './screens/admin/AdminMas'

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
          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<AdminDashboard />} />
            <Route path="clientes" element={<AdminClientes />} />
            <Route path="clientes/:uid" element={<AdminDetalleCliente />} />
            <Route path="pagos" element={<AdminPagos />} />
            <Route path="planes" element={<AdminPlanes />} />
            <Route path="rutinas" element={<AdminRutinas />} />
            <Route path="rutinas/editor" element={<AdminEditorRutina />} />
            <Route path="comunicados" element={<AdminComunicados />} />
            <Route path="config" element={<AdminConfig />} />
            <Route path="mas" element={<AdminMas />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
