import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import RutaProtegida from './components/RutaProtegida'
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
import SuperShell from './screens/superadmin/SuperShell'
import SuperDashboard from './screens/superadmin/SuperDashboard'
import SuperGimnasios from './screens/superadmin/SuperGimnasios'
import SuperDetalleGym from './screens/superadmin/SuperDetalleGym'
import SuperCrearGym from './screens/superadmin/SuperCrearGym'
import SuperPagos from './screens/superadmin/SuperPagos'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Bienvenida />} />
          <Route path="/g/:codigo" element={<Bienvenida />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<RutaProtegida rol="cliente"><ClienteShell /></RutaProtegida>}>
            <Route index element={<Portada />} />
            <Route path="rutina" element={<Rutina />} />
            <Route path="progreso" element={<Progreso />} />
            <Route path="calcular" element={<Calculadoras />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>
          <Route path="/admin" element={<RutaProtegida rol="admin"><AdminShell /></RutaProtegida>}>
            <Route index element={<AdminDashboard />} />
            <Route path="clientes" element={<AdminClientes />} />
            <Route path="clientes/:uid" element={<AdminDetalleCliente />} />
            <Route path="pagos" element={<AdminPagos />} />
            <Route path="planes" element={<AdminPlanes />} />
            <Route path="rutinas" element={<AdminRutinas />} />
            <Route path="rutinas/editor/:id" element={<AdminEditorRutina />} />
            <Route path="comunicados" element={<AdminComunicados />} />
            <Route path="config" element={<AdminConfig />} />
            <Route path="mas" element={<AdminMas />} />
          </Route>
          <Route path="/super" element={<RutaProtegida rol="superadmin"><SuperShell /></RutaProtegida>}>
            <Route index element={<SuperDashboard />} />
            <Route path="gimnasios" element={<SuperGimnasios />} />
            <Route path="gimnasios/crear" element={<SuperCrearGym />} />
            <Route path="gimnasios/:id" element={<SuperDetalleGym />} />
            <Route path="pagos" element={<SuperPagos />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
