import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider.jsx';
import { ProtectedRoute } from './auth/ProtectedRoute.jsx';
import LandingPage from './landing/LandingPage.jsx';
import LoginPage from './auth/LoginPage.jsx';
import RegisterPage from './auth/RegisterPage.jsx';
import EmailVerificationPage from './auth/EmailVerificationPage.jsx';
import OnboardingPage from './auth/OnboardingPage.jsx';
import AppMain from './AppMain.jsx';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/app" element={
            <ProtectedRoute>
              <AppMain />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
