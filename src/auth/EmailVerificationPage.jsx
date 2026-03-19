import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from './AuthProvider.jsx';
import { C, F, FB } from '../config/constants.js';

export default function EmailVerificationPage() {
  const { user, reloadUser, resendVerification, logout } = useAuthContext();
  const [resent, setResent] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  // Her 4 saniyede emailVerified kontrol et
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user && !user.emailVerified) {
        await reloadUser();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [user, reloadUser]);

  // emailVerified olunca yönlendir
  useEffect(() => {
    if (user?.emailVerified) {
      navigate('/app', { replace: true });
    }
  }, [user?.emailVerified, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = async () => {
    setResent(false);
    await resendVerification();
    setResent(true);
    setCooldown(60);
  };

  const handleCheck = async () => {
    setChecking(true);
    await reloadUser();
    setTimeout(() => setChecking(false), 1000);
  };

  const maskedEmail = user?.email
    ? user.email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 6)) + c)
    : '';

  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FB, padding: 20,
    }}>
      {/* Ambient orb */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', top: '10%', left: '60%',
          background: 'radial-gradient(circle, rgba(232,145,74,0.08) 0%, transparent 60%)', animation: 'orb1 28s ease-in-out infinite' }} />
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(13,13,17,0.85)', backdropFilter: 'blur(40px)',
        border: `1px solid ${C.border}`, borderRadius: 24,
        padding: '48px 40px', width: '100%', maxWidth: 440,
        boxShadow: '0 40px 120px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.03) inset',
        textAlign: 'center',
      }}>
        {/* Animated mail icon */}
        <div style={{
          width: 80, height: 80, borderRadius: 20, margin: '0 auto 24px',
          background: 'rgba(232,145,74,0.08)', border: '1px solid rgba(232,145,74,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(232,145,74,0.15)',
          animation: 'float 4s ease-in-out infinite',
        }}>
          <span style={{ fontSize: 36 }}>📧</span>
        </div>

        <h1 style={{
          fontFamily: F, fontSize: 24, fontWeight: 800, marginBottom: 8,
          backgroundImage: `linear-gradient(135deg, ${C.text} 40%, ${C.cyan})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>E-posta Doğrulama</h1>

        <p style={{ color: C.sub, fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
          Hesabınızı aktifleştirmek için e-posta adresinize gönderilen doğrulama linkine tıklayın.
        </p>

        <div style={{
          background: 'rgba(232,145,74,0.06)', border: '1px solid rgba(232,145,74,0.15)',
          borderRadius: 12, padding: '12px 16px', marginBottom: 24,
        }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Gönderildi:</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.cyan, fontFamily: F, letterSpacing: .3 }}>{maskedEmail}</div>
        </div>

        {resent && (
          <div style={{
            background: 'rgba(61,184,138,0.08)', border: '1px solid rgba(61,184,138,0.25)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: C.mint,
          }}>
            ✓ Doğrulama maili tekrar gönderildi
          </div>
        )}

        {/* Kontrol Et */}
        <button onClick={handleCheck} disabled={checking} style={{
          width: '100%', padding: '13px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0C0800',
          fontWeight: 700, fontSize: 14, fontFamily: FB, marginBottom: 12,
          boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
          opacity: checking ? 0.6 : 1, transition: 'opacity .2s',
        }}>
          {checking ? 'Kontrol ediliyor...' : 'Doğruladım, Kontrol Et'}
        </button>

        {/* Tekrar Gönder */}
        <button onClick={handleResend} disabled={cooldown > 0} style={{
          width: '100%', padding: '11px 18px', borderRadius: 12, cursor: cooldown > 0 ? 'default' : 'pointer',
          background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
          color: cooldown > 0 ? C.muted : C.sub, fontWeight: 500, fontSize: 13, fontFamily: FB,
          transition: 'all .2s',
        }}>
          {cooldown > 0 ? `Tekrar gönder (${cooldown}s)` : 'Doğrulama Mailini Tekrar Gönder'}
        </button>

        {/* Çıkış */}
        <button onClick={logout} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: C.muted, fontSize: 12, marginTop: 20, textDecoration: 'underline',
        }}>
          Farklı bir hesapla giriş yap
        </button>
      </div>
    </div>
  );
}
