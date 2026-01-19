import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/auth_context.jsx'
import './index.css'
import App from './app.jsx'
import { Login } from './pages/login.jsx'
import { Register } from './pages/register.jsx'
import { ForgotPassword } from './pages/forgot_password.jsx'
import { ResetPassword } from './pages/reset_password.jsx'
import { TermsAndPolicies } from './pages/terms_and_policies.jsx'
import { EstudianteDashboard } from './pages/estudiante/dashboard.jsx'
import { ProfesorDashboard } from './pages/profesor/dashboard.jsx'
import { AdminDashboard } from './pages/admin/dashboard.jsx'
import AsignaturasPage from './pages/AsignaturasPage.jsx'
import GestionProfesoresAdmin from './pages/admin/GestionProfesoresAdmin.jsx'
import FranjasHorariasProfesor from './pages/profesor/FranjasHorariasProfesor.jsx'
import ClasesPersonalizadasAdmin from './pages/admin/ClasesPersonalizadasAdmin.jsx'
import CursosAdmin from './pages/admin/CursosAdmin.jsx'
import CursosPublico from './pages/CursosPublico.jsx'
import CheckoutCurso from './pages/CheckoutCurso.jsx'
import CheckoutClase from './pages/CheckoutClase.jsx'
import CheckoutPaquete from './pages/CheckoutPaquete.jsx'
import MisCompras from './pages/estudiante/MisCompras.jsx'
import DetallePaquete from './pages/estudiante/DetallePaquete.jsx'
import ClasesPersonalizadasPublico from './pages/ClasesPersonalizadasPublico.jsx'
import PagoExitoso from './pages/PagoExitoso.jsx'
import PagoPendiente from './pages/PagoPendiente.jsx'
import PagoFallido from './pages/PagoFallido.jsx'
import  MisClases  from './pages/profesor/MisClases.jsx'
import { MisCursos } from './pages/profesor/MisCursos.jsx'
import { MiPerfil } from './pages/profesor/MiPerfil.jsx'
import { GoogleCallback } from './pages/GoogleCallback.jsx'
import ContabilidadAdmin from './pages/admin/ContabilidadAdmin.jsx'
import ComprasAdmin from './pages/admin/compras.jsx'
import SesionesPendientes from './pages/admin/sesiones_pendientes.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ✅ RUTAS DE RESULTADO DE PAGO (SIN LAYOUT) */}
          <Route path="/pago-exitoso" element={<PagoExitoso />} />
          <Route path="/pago-pendiente" element={<PagoPendiente />} />
          <Route path="/pago-fallido" element={<PagoFallido />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms-and-policies" element={<TermsAndPolicies />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />

          {/* Dashboards */}
          <Route path="/estudiante/dashboard" element={<EstudianteDashboard />} />
          <Route path="/profesor/dashboard" element={<ProfesorDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Admin */}
          <Route path="/admin/profesores" element={<GestionProfesoresAdmin />} />
          <Route path="/admin/asignaturas" element={<AsignaturasPage />} />
          <Route path="/admin/clases-personalizadas" element={<ClasesPersonalizadasAdmin />} />
          <Route path="/admin/cursos" element={<CursosAdmin />} />
          <Route path="/admin/contabilidad" element={<ContabilidadAdmin />} />
          <Route path="/admin/compras" element={<ComprasAdmin />} />
          <Route path="/admin/sesiones-pendientes" element={<SesionesPendientes />} />

          {/* Profesor */}
          <Route path="/profesor/franjas-horarias" element={<FranjasHorariasProfesor />} />
          <Route path="/profesor/mis-clases" element={<MisClases />} />
          <Route path="/profesor/mis-cursos" element={<MisCursos />} />
          <Route path="/profesor/mi-perfil" element={<MiPerfil />} />

          {/* Público */}
          <Route path="/cursos" element={<CursosPublico />} />
          <Route path="/clases-personalizadas" element={<ClasesPersonalizadasPublico />} />

          {/* Rutas de checkout */}
          <Route path="/checkout/curso/:cursoId" element={<CheckoutCurso />} />
          <Route path="/checkout/clase/:claseId" element={<CheckoutClase />} />
          <Route path="/checkout/paquete/:claseId" element={<CheckoutPaquete />} />

          {/* Rutas de estudiante */}
          <Route path="/estudiante/mis-compras" element={<MisCompras />} />
          <Route path="/estudiante/paquete/:compraId" element={<DetallePaquete />} />

          {/* Página principal (App) */}
          <Route path="/" element={<App />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
)