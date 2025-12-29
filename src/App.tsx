import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import './index.css'

// Auth Provider
import { AuthProvider } from '@/lib/auth-context'

// Pages
import { HomePage } from '@/pages/HomePage'
import { TermiVoxedPage } from '@/pages/TermiVoxedPage'
import { AppPage } from '@/pages/AppPage'
import { GetStartedPage } from '@/pages/GetStartedPage'
import { LegalPage } from '@/pages/LegalPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { SubscriptionPage } from '@/pages/SubscriptionPage'
import { DemoPage } from '@/pages/DemoPage'
import { TrialPage } from '@/pages/trial/TrialPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/termivoxed" element={<TermiVoxedPage />} />
          <Route path="/termivoxed/app" element={<AppPage />} />
          <Route path="/termivoxed/download" element={<Navigate to="/termivoxed/try" replace />} />
          <Route path="/termivoxed/get-started" element={<GetStartedPage />} />
          <Route path="/termivoxed/demo" element={<DemoPage />} />
          <Route path="/termivoxed/try" element={<TrialPage />} />
          <Route path="/legal/:type" element={<LegalPage />} />

          {/* Auth pages */}
          <Route path="/termivoxed/login" element={<LoginPage />} />
          <Route path="/termivoxed/register" element={<RegisterPage />} />
          <Route path="/termivoxed/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected pages (auth check inside components) */}
          <Route path="/termivoxed/dashboard" element={<DashboardPage />} />
          <Route path="/termivoxed/settings" element={<SettingsPage />} />
          <Route path="/termivoxed/subscription" element={<SubscriptionPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
