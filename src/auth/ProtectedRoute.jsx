import { Navigate } from 'react-router-dom';
import { useAuthContext } from './AuthProvider.jsx';
import { C, F, FB } from '../config/constants.js';

/**
 * ProtectedRoute: 3 adımlı güvenlik duvarı.
 * (1) Üye mi? → değilse /login
 * (2) E-postası onaylı mı? → değilse /verify-email
 * (3) Onboarding tamamlanmış mı? → değilse /onboarding
 * Üçü de tamamsa children (AppMain) render edilir.
 */
export function ProtectedRoute({ children }) {
  const { user, loading, isConfigured, profile, profileLoading } = useAuthContext();

  // Firebase yoksa demo modda direkt geçir
  if (!isConfigured) return children;

  // Auth yüklenirken spinner
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: C.bg, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(232,145,74,0.1)', border: '1px solid rgba(232,145,74,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'float 3s ease-in-out infinite',
        }}>
          <span style={{ fontSize: 22 }}>🏭</span>
        </div>
        <div style={{ color: C.sub, fontFamily: FB, fontSize: 13 }}>Yükleniyor...</div>
      </div>
    );
  }

  // Adım 1: Giriş yapmış mı?
  if (!user) return <Navigate to="/login" replace />;

  // Adım 2: E-posta onaylı mı? (Google ile girenler zaten onaylı)
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />;

  // Profil yüklenirken bekle
  if (profileLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: C.bg, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(232,145,74,0.1)', border: '1px solid rgba(232,145,74,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'float 3s ease-in-out infinite',
        }}>
          <span style={{ fontSize: 22 }}>🏭</span>
        </div>
        <div style={{ color: C.sub, fontFamily: FB, fontSize: 13 }}>Profil yükleniyor...</div>
      </div>
    );
  }

  // Adım 3: Onboarding tamamlanmış mı?
  if (!profile?.onboardingComplete) return <Navigate to="/onboarding" replace />;

  // Tüm kapılar açık — uygulamaya geç
  return children;
}
