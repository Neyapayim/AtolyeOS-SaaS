import { Link } from 'react-router-dom';
import { C, F, FB } from '../config/constants.js';

const features = [
  { icon: "📊", title: "Dashboard", desc: "Anlık KPI'lar, stok uyarıları, çalışan durumları" },
  { icon: "🏭", title: "Üretim Takip", desc: "Kanban, iş akışı, zamanlayıcılar, aşama yönetimi" },
  { icon: "📦", title: "Stok Yönetimi", desc: "Ham madde, yarı mamül, ürün, hizmet takibi" },
  { icon: "💰", title: "Maliyet Analizi", desc: "Rekürsif BOM maliyet, KDV, marj hesaplama" },
  { icon: "🚚", title: "Tedarik Zinciri", desc: "Sipariş, tedarik, nakliye, fason takibi" },
  { icon: "👥", title: "Müşteri Yönetimi", desc: "Bayi, direkt, kurumsal müşteri portföyü" },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: FB }}>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroOrb1} />
        <div style={styles.heroOrb2} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 680 }}>
          <h1 style={styles.heroTitle}>Atölye OS</h1>
          <p style={styles.heroSub}>
            Mobilya ve metal atölyeleri için profesyonel üretim yönetim sistemi.
            Siparişten sevkiyata, stoktan maliyete — her şey tek ekranda.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 32 }}>
            <Link to="/register" style={styles.btnPrimary}>
              Ücretsiz Başla
            </Link>
            <Link to="/login" style={styles.btnGhost}>
              Giriş Yap
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>Her şey tek platformda</h2>
        <div style={styles.featureGrid}>
          {features.map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <span style={{ fontSize: 32 }}>{f.icon}</span>
              <h3 style={{ fontFamily: F, fontSize: 16, fontWeight: 700, margin: '12px 0 6px' }}>{f.title}</h3>
              <p style={{ color: C.sub, fontSize: 13, lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={{ fontFamily: F, fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
          Atölyenizi dijitalleştirin
        </h2>
        <p style={{ color: C.sub, fontSize: 14, marginBottom: 28, maxWidth: 500 }}>
          Küçük atölyelerden orta ölçekli fabrikalara — ihtiyacınız olan tüm araçlar burada.
        </p>
        <Link to="/register" style={styles.btnPrimary}>
          Hemen Kayıt Ol
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p style={{ color: C.muted, fontSize: 12 }}>
          \© {new Date().getFullYear()} Atölye OS — Tüm hakları saklıdır.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  hero: {
    minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '60px 20px', position: 'relative', overflow: 'hidden',
  },
  heroOrb1: {
    position: 'absolute', width: 400, height: 400, borderRadius: '50%',
    background: `radial-gradient(circle, ${C.cyan}15, transparent 70%)`,
    top: '10%', left: '15%', animation: 'orb1 12s ease-in-out infinite',
  },
  heroOrb2: {
    position: 'absolute', width: 300, height: 300, borderRadius: '50%',
    background: `radial-gradient(circle, ${C.lav}12, transparent 70%)`,
    bottom: '15%', right: '20%', animation: 'orb2 10s ease-in-out infinite',
  },
  heroTitle: {
    fontFamily: F, fontSize: 64, fontWeight: 900, lineHeight: 1,
    backgroundImage: `linear-gradient(135deg, ${C.text} 40%, ${C.cyan})`,
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    marginBottom: 16,
  },
  heroSub: {
    color: C.sub, fontSize: 17, lineHeight: 1.6, maxWidth: 520, margin: '0 auto',
  },
  btnPrimary: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
    border: 'none', borderRadius: 12, padding: '14px 32px',
    fontWeight: 700, fontSize: 15, color: '#0C0800', cursor: 'pointer',
    fontFamily: FB, textDecoration: 'none',
    boxShadow: '0 4px 20px rgba(245,158,11,0.35)',
  },
  btnGhost: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12,
    padding: '14px 28px', fontWeight: 500, fontSize: 15, color: C.sub,
    cursor: 'pointer', fontFamily: FB, textDecoration: 'none',
  },
  features: {
    padding: '80px 20px', maxWidth: 1000, margin: '0 auto',
  },
  sectionTitle: {
    fontFamily: F, fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 48,
    backgroundImage: `linear-gradient(135deg, ${C.text} 50%, ${C.cyan})`,
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  featureGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 20,
  },
  featureCard: {
    background: C.s2, border: `1px solid ${C.border}`, borderRadius: 14,
    padding: '28px 24px', transition: 'transform .2s, border-color .2s',
  },
  cta: {
    textAlign: 'center', padding: '80px 20px',
    background: `linear-gradient(180deg, transparent, ${C.s1})`,
  },
  footer: {
    textAlign: 'center', padding: '30px 20px',
    borderTop: `1px solid ${C.border}`,
  },
};
