import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from './AuthProvider.jsx';
import { C, F, FB } from '../config/constants.js';

const CALISAN_SECENEKLERI = [
  { value: "1", label: "Sadece ben" },
  { value: "2-5", label: "2 – 5 kişi" },
  { value: "6-10", label: "6 – 10 kişi" },
  { value: "11-25", label: "11 – 25 kişi" },
  { value: "26-50", label: "26 – 50 kişi" },
  { value: "50+", label: "50+ kişi" },
];

const SEKTOR_SECENEKLERI = [
  { value: "mobilya", label: "Mobilya & Dekorasyon" },
  { value: "metal", label: "Metal İşleme & Çelik Konstrüksiyon" },
  { value: "ahsap", label: "Ahşap & Marangoz" },
  { value: "tekstil", label: "Tekstil & Konfeksiyon" },
  { value: "otomotiv", label: "Otomotiv Yan Sanayi" },
  { value: "plastik", label: "Plastik & Kalıp" },
  { value: "elektronik", label: "Elektronik & Montaj" },
  { value: "gida", label: "Gıda Üretimi" },
  { value: "matbaa", label: "Matbaa & Ambalaj" },
  { value: "insaat", label: "İnşaat & Yapı Malzemesi" },
  { value: "diger", label: "Diğer" },
];

export default function OnboardingPage() {
  const { user, completeOnboarding } = useAuthContext();
  const [sirketAdi, setSirketAdi] = useState('');
  const [calisanSayisi, setCalisanSayisi] = useState('');
  const [sektor, setSektor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const canSubmit = sirketAdi.trim() && calisanSayisi && sektor;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      await completeOnboarding({
        sirketAdi: sirketAdi.trim(),
        calisanSayisi,
        sektor,
      });
      navigate('/app', { replace: true });
    } catch (err) {
      setError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectStyle = {
    width: '100%', background: C.s3, border: `1px solid ${C.border}`, borderRadius: 12,
    padding: '14px 16px', fontSize: 14, color: C.text, fontFamily: FB,
    cursor: 'pointer', boxSizing: 'border-box', appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239CA3AF' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
  };

  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FB, padding: 20,
    }}>
      {/* Ambient */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: '#060608' }} />
        <div style={{
          position: 'absolute', width: 700, height: 300, borderRadius: '50%',
          bottom: '-10%', left: '50%', transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse, rgba(180,70,10,0.1) 0%, transparent 65%)',
          animation: 'orb3 30s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          top: '-15%', right: '-5%',
          background: 'radial-gradient(circle, rgba(61,184,138,0.06) 0%, transparent 55%)',
          animation: 'orb1 22s ease-in-out infinite',
        }} />
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(13,13,17,0.88)', backdropFilter: 'blur(40px)',
        border: `1px solid ${C.border}`, borderRadius: 28,
        padding: '52px 44px', width: '100%', maxWidth: 480,
        boxShadow: '0 40px 120px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.03) inset',
      }}>
        {/* Progress indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32, justifyContent: 'center' }}>
          {[1, 2, 3].map(step => (
            <div key={step} style={{
              width: step === 3 ? 32 : 24, height: 4, borderRadius: 2,
              background: step <= 2 ? C.cyan : 'rgba(255,255,255,0.08)',
              transition: 'all .3s',
            }} />
          ))}
        </div>

        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 18, margin: '0 auto 24px',
          background: 'rgba(232,145,74,0.08)', border: '1px solid rgba(232,145,74,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 50px rgba(232,145,74,0.12)',
        }}>
          <span style={{ fontSize: 32 }}>🏭</span>
        </div>

        <h1 style={{
          fontFamily: F, fontSize: 26, fontWeight: 800, marginBottom: 6, textAlign: 'center',
          backgroundImage: `linear-gradient(135deg, ${C.text} 40%, ${C.cyan})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Atölyeni Kur</h1>

        <p style={{ color: C.sub, fontSize: 13, lineHeight: 1.5, textAlign: 'center', marginBottom: 32 }}>
          Başlamadan önce birkaç bilgiye ihtiyacımız var.
          <br />Bu bilgiler deneyimini kişiselleştirmek için kullanılacak.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Şirket Adı */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: .5, textTransform: 'uppercase', marginBottom: 8 }}>
              Şirket / Atölye Adı
            </label>
            <input
              value={sirketAdi} onChange={e => setSirketAdi(e.target.value)}
              placeholder="Örn: Güneş Mobilya Atölyesi"
              className="inp"
              style={{
                width: '100%', background: C.s3, border: `1px solid ${C.border}`, borderRadius: 12,
                padding: '14px 16px', fontSize: 14, color: C.text, fontFamily: FB,
                boxSizing: 'border-box', transition: 'border-color .2s',
              }}
            />
          </div>

          {/* Çalışan Sayısı */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: .5, textTransform: 'uppercase', marginBottom: 8 }}>
              Çalışan Sayısı
            </label>
            <select value={calisanSayisi} onChange={e => setCalisanSayisi(e.target.value)} style={selectStyle}>
              <option value="" disabled style={{ color: C.muted, background: C.s2 }}>Seçiniz...</option>
              {CALISAN_SECENEKLERI.map(o => (
                <option key={o.value} value={o.value} style={{ background: C.s2 }}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Sektör */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: .5, textTransform: 'uppercase', marginBottom: 8 }}>
              Sektör
            </label>
            <select value={sektor} onChange={e => setSektor(e.target.value)} style={selectStyle}>
              <option value="" disabled style={{ color: C.muted, background: C.s2 }}>Sektörünüzü seçin...</option>
              {SEKTOR_SECENEKLERI.map(o => (
                <option key={o.value} value={o.value} style={{ background: C.s2 }}>{o.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <p style={{ color: C.coral, fontSize: 12, margin: 0 }}>{error}</p>
          )}

          {/* Submit */}
          <button type="submit" disabled={!canSubmit || submitting} style={{
            width: '100%', padding: '14px 18px', borderRadius: 12, border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
            background: canSubmit ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'rgba(255,255,255,0.06)',
            color: canSubmit ? '#0C0800' : C.muted,
            fontWeight: 700, fontSize: 15, fontFamily: F, letterSpacing: .3,
            boxShadow: canSubmit ? '0 4px 24px rgba(245,158,11,0.3)' : 'none',
            opacity: submitting ? 0.6 : 1, transition: 'all .3s',
            marginTop: 4,
          }}>
            {submitting ? 'Kuruluyor...' : 'Atölyemi Kur'}
          </button>
        </form>

        {/* Footer */}
        <p style={{ color: C.muted, fontSize: 11, textAlign: 'center', marginTop: 20 }}>
          {user?.email || ''}
        </p>
      </div>
    </div>
  );
}
