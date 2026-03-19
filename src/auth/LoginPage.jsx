import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from './AuthProvider.jsx';
import { C, F, FB } from '../config/constants.js';

export default function LoginPage() {
  const { user, login, loginWithGoogle, error, isConfigured } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Kullanıcı giriş yaptıysa direkt uygulamaya at
  useEffect(() => {
    if (user) {
      navigate('/app', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    await login(email, password);
    setSubmitting(false);
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    await loginWithGoogle();
    setSubmitting(false);
  };

  // Demo mod — Firebase yoksa direkt uygulamaya yönlendir
  if (!isConfigured) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Atölye OS</h1>
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
        <h1 style={styles.title}>Atölye OS</h1>
        <p style={{ color: C.sub, fontSize: 13, marginBottom: 24 }}>
          Hesabınıza giriş yapın
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="email" placeholder="E-posta" value={email}
            onChange={e => setEmail(e.target.value)}
            style={styles.input} className="inp"
          />
          <input
            type="password" placeholder="Şifre" value={password}
            onChange={e => setPassword(e.target.value)}
            style={styles.input} className="inp"
          />
          {error && <p style={{ color: C.coral, fontSize: 12 }}>{error}</p>}
          <button type="submit" disabled={submitting} style={styles.btnPrimary}>
            {submitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div style={{ margin: '18px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ color: C.muted, fontSize: 11 }}>veya</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        <button onClick={handleGoogle} disabled={submitting} style={styles.btnGoogle}>
          Google ile Giriş
        </button>

        <p style={{ color: C.sub, fontSize: 12, marginTop: 20, textAlign: 'center' }}>
          Hesabınız yok mu?{' '}
          <Link to="/register" style={{ color: C.cyan, textDecoration: 'none' }}>
            Kayıt Ol
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
