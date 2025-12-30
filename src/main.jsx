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
import ProfesoresPage from './pages/ProfesoresPage.jsx'
import FranjasHorariasAdmin from './pages/admin/FranjasHorariasAdmin.jsx'
import FranjasHorariasProfesor from './pages/profesor/FranjasHorariasProfesor.jsx'
import ClasesPersonalizadasAdmin from './pages/admin/ClasesPersonalizadasAdmin.jsx'
import CursosAdmin from './pages/admin/CursosAdmin.jsx'
import CheckoutCurso from './pages/CheckoutCurso.jsx'
import CheckoutClase from './pages/CheckoutClase.jsx'
import CheckoutPaquete from './pages/CheckoutPaquete.jsx'
import MisCompras from './pages/estudiante/MisCompras.jsx'
import DetallePaquete from './pages/estudiante/DetallePaquete.jsx'
import CursosPublico from './pages/CursosPublico.jsx'
import ClasesPersonalizadasPublico from './pages/ClasesPersonalizadasPublico.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms-and-policies" element={<TermsAndPolicies />} />
          <Route path="/estudiante/dashboard" element={<EstudianteDashboard />} />
          <Route path="/profesor/dashboard" element={<ProfesorDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/asignaturas" element={<AsignaturasPage />} />
          <Route path="/admin/profesores" element={<ProfesoresPage />} />
          <Route path="/admin/franjas-horarias" element={<FranjasHorariasAdmin />} />
          <Route path="/profesor/franjas-horarias" element={<FranjasHorariasProfesor />} />
          <Route path="/admin/clases-personalizadas" element={<ClasesPersonalizadasAdmin />} />
          <Route path="/admin/cursos" element={<CursosAdmin />} />
          <Route path="/checkout/curso/:cursoId" element={<CheckoutCurso />} />
          <Route path="/checkout/clase/:claseId" element={<CheckoutClase />} />
          <Route path="/checkout/paquete/:claseId" element={<CheckoutPaquete />} />
          <Route path="/estudiante/mis-compras" element={<MisCompras />} />
          <Route path="/estudiante/paquete/:compraId" element={<DetallePaquete />} />
          <Route path="/cursos" element={<CursosPublico />} />
          <Route path="/clases-personalizadas" element={<ClasesPersonalizadasPublico />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
