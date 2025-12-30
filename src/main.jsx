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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
