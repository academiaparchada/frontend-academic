// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/auth_context.jsx'
import { SessionModalProvider } from './context/session_modal_context'; // NUEVO
import { ProtectedRoute } from './components/ProtectedRoute'; // NUEVO
import './index.css'
import './styles/header.css'
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
import DetalleCompra from './pages/estudiante/DetalleCompra.jsx'
import ClasesPersonalizadasPublico from './pages/ClasesPersonalizadasPublico.jsx'
import PagoExitoso from './pages/PagoExitoso.jsx'
import PagoPendiente from './pages/PagoPendiente.jsx'
import PagoFallido from './pages/PagoFallido.jsx'
import MisClases from './pages/profesor/MisClases.jsx'
import { MisCursos } from './pages/profesor/MisCursos.jsx'
import { MiPerfil } from './pages/profesor/MiPerfil.jsx'
import { GoogleCallback } from './pages/GoogleCallback.jsx'
import ContabilidadAdmin from './pages/admin/ContabilidadAdmin.jsx'
import ComprasAdmin from './pages/admin/compras.jsx'
import SesionesPendientes from './pages/admin/sesiones_pendientes.jsx'
import MisPaquetes from './pages/estudiante/MisPaquetes'
import MisClasesEstudiante from './pages/estudiante/MisClases.jsx'
import MisCursosEstudiante from './pages/estudiante/MisCursos.jsx'
import { About } from './pages/about.jsx'
import MiPerfilEstudiante from './pages/estudiante/MiPerfilEstudiante.jsx'

// ✅ GA4
import analyticsService from './services/analytics_service.js'

// ✅ Inicializa GA4 una sola vez
analyticsService.init()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SessionModalProvider>
          <Routes>
            {/* ==================== RUTAS PÚBLICAS ==================== */}
            
            {/* Página principal */}
            <Route path="/" element={<App />} />
            
            {/* Autenticación */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms-and-policies" element={<TermsAndPolicies />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            
            {/* Información pública */}
            <Route path="/about" element={<About />} />
            <Route path="/cursos" element={<CursosPublico />} />
            <Route path="/clases-personalizadas" element={<ClasesPersonalizadasPublico />} />

            {/* Resultados de pago (públicas pero requieren datos específicos) */}
            <Route path="/pago-exitoso" element={<PagoExitoso />} />
            <Route path="/pago-pendiente" element={<PagoPendiente />} />
            <Route path="/pago-fallido" element={<PagoFallido />} />

            {/* Checkout (pueden acceder no autenticados para registro + compra) */}
            <Route path="/checkout/curso/:cursoId" element={<CheckoutCurso />} />
            <Route path="/checkout/clase/:claseId" element={<CheckoutClase />} />
            <Route path="/checkout/paquete/:claseId" element={<CheckoutPaquete />} />

            {/* ==================== RUTAS PROTEGIDAS - ESTUDIANTE ==================== */}
            <Route 
              path="/estudiante/dashboard" 
              element={
                <ProtectedRoute requiredRole="estudiante">
                  <EstudianteDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/estudiante/mis-compras" 
              element={
                <ProtectedRoute requiredRole="estudiante">
                  <MisCompras />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/estudiante/paquete/:compraId" 
              element={
                <ProtectedRoute requiredRole="estudiante">
                  <DetallePaquete />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/estudiante/compra/:compraId" 
              element={
                <ProtectedRoute requiredRole="estudiante">
                  <DetalleCompra />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/estudiante/mis-paquetes" 
              element={
                <ProtectedRoute requiredRole="estudiante">
                  <MisPaquetes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/estudiante/mis-clases" 
              element={
                <ProtectedRoute requiredRole="estudiante">
                  <MisClasesEstudiante />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/estudiante/mis-cursos" 
              element={
                <ProtectedRoute requiredRole="estudiante">
                  <MisCursosEstudiante />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/estudiante/mi-perfil" 
              element={
                <ProtectedRoute requiredRole="estudiante">
                  <MiPerfilEstudiante />
                </ProtectedRoute>
              } 
            />

            {/* ==================== RUTAS PROTEGIDAS - PROFESOR ==================== */}
            <Route 
              path="/profesor/dashboard" 
              element={
                <ProtectedRoute requiredRole="profesor">
                  <ProfesorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profesor/franjas-horarias" 
              element={
                <ProtectedRoute requiredRole="profesor">
                  <FranjasHorariasProfesor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profesor/mis-clases" 
              element={
                <ProtectedRoute requiredRole="profesor">
                  <MisClases />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profesor/mis-cursos" 
              element={
                <ProtectedRoute requiredRole="profesor">
                  <MisCursos />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profesor/mi-perfil" 
              element={
                <ProtectedRoute requiredRole="profesor">
                  <MiPerfil />
                </ProtectedRoute>
              } 
            />

            {/* ==================== RUTAS PROTEGIDAS - ADMIN ==================== */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/gestion-profesores" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <GestionProfesoresAdmin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/asignaturas" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AsignaturasPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/clases-personalizadas" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <ClasesPersonalizadasAdmin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/cursos" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <CursosAdmin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/contabilidad" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <ContabilidadAdmin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/compras" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <ComprasAdmin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/sesiones-pendientes" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <SesionesPendientes />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </SessionModalProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
