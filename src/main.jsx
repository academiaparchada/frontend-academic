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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
