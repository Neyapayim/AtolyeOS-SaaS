import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from './AuthProvider.jsx';
import { C, F, FB } from '../config/constants.js';

export default function RegisterPage() {
  const { register, loginWithGoogle, error, isConfigured } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!email || !password) { setLocalError('Tüm alanları doldurun'); return; }
    if (password.length < 6) { setLocalError('Şifre en az 6 karakter olmalı'); return; }
    if (password !== passwordConfirm) { setLocalError('Şifreler eşleşmiyor'); return; }
    setSubmitting(true);
    await register(email, password);
    setSubmitting(false);
    // Kayıt başarılıysa doğrulama sayfasına yönlendir
    navigate('/verify-email');
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    await loginWithGoogle();
    setSubmitting(false);
  };

  if (!isConfigured) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Kayıt Ol</h1>
          <p style={{ color: C.sub, fontSize: 13, marginBottom: 24 }}>
            Firebase yapılandırılmamış — demo modda çalışıyor
          </p>
          <button onClick={() => navigate('/app')} style={styles.btnPrimary}>
            Uygulamaya Geç
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Kayıt Ol</h1>
        <p style={{ color: C.sub, fontSize: 13, marginBottom: 24 }}>
          Yeni hesap oluşturun
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="email" placeholder="E-posta" value={email}
            onChange={e => setEmail(e.target.value)}
            style={styles.input} className="inp"
          />
          <input
            type="password" placeholder="Şifre (en az 6 karakter)" value={password}
            onChange={e => setPassword(e.target.value)}
            style={styles.input} className="inp"
          />
          <input
            type="password" placeholder="Şifre Tekrar" value={passwordConfirm}
            onChange={e => setPasswordConfirm(e.target.value)}
            style={styles.input} className="inp"
          />
          {(localError || error) && (
            <p style={{ color: C.coral, fontSize: 12 }}>{localError || error}</p>
          )}
          <button type="submit" disabled={submitting} style={styles.btnPrimary}>
            {submitting ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div style={{ margin: '18px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ color: C.muted, fontSize: 11 }}>veya</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        <button onClick={handleGoogle} disabled={submitting} style={styles.btnGoogle}>
          Google ile Kayıt Ol
        </button>

        <p style={{ color: C.sub, fontSize: 12, marginTop: 20, textAlign: 'center' }}>
          Zaten hesabınız var mı?{' '}
          <Link to="/login" style={{ color: C.cyan, textDecoration: 'none' }}>
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh', background: C.bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: FB, padding: 20,
  },
  card: {
    background: C.s2, border: `1px solid ${C.border}`, borderRadius: 18,
    padding: '40px 36px', width: '100%', maxWidth: 400,
    boxShadow: '0 40px 100px rgba(0,0,0,.6)',
  },
  title: {
    fontFamily: F, fontSize: 28, fontWeight: 800, color: C.text,
    marginBottom: 4, textAlign: 'center',
    backgroundImage: `linear-gradient(135deg, ${C.text} 50%, ${C.cyan})`,
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  input: {
    background: C.s3, border: `1px solid ${C.border}`, borderRadius: 10,
    padding: '12px 14px', fontSize: 14, color: C.text, fontFamily: FB,
    width: '100%', boxSizing: 'border-box',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
    border: 'none', borderRadius: 10, padding: '12px 18px',
    fontWeight: 700, fontSize: 14, color: '#0C0800', cursor: 'pointer',
    fontFamily: FB, width: '100%',
    boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
  },
  btnGoogle: {
    background: C.s3, border: `1px solid ${C.border}`, borderRadius: 10,
    padding: '12px 18px', fontWeight: 500, fontSize: 14, color: C.text,
    cursor: 'pointer', fontFamily: FB, width: '100%',
  },
};
