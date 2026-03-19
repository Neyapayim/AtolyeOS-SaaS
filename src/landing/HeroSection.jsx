import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { C, F, FB, GLASS } from '../config/constants.js';

const ease = [0.25, 0.1, 0.25, 1];
const up = (d = 0) => ({ initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6, delay: d, ease } });

/* ── Dashboard Preview ─────────────────────────────────────────────────────── */
function DashboardPreview() {
  const kpis = [
    { label: 'Aktif Sipariş', val: '24', color: C.cyan },
    { label: 'Üretimde', val: '12', color: '#3DB88A' },
    { label: 'Sevk Bekleyen', val: '7', color: '#3E7BD4' },
    { label: 'Aylık Ciro', val: '₺847K', color: C.gold },
  ];

  const rows = [
    { no: '#1042', client: 'Karaca Mobilya', status: 'Tamamlandı', pct: 100, color: '#3DB88A' },
    { no: '#1043', client: 'Demir Metal', status: 'Üretimde', pct: 68, color: C.cyan },
    { no: '#1044', client: 'Yılmaz Atölye', status: 'Tedarik', pct: 35, color: C.gold },
  ];

  return (
    <motion.div
      {...up(0.35)}
      aria-label="Atölye OS arayüz önizlemesi: sipariş listesi, KPI kartları ve üretim çizelgesi"
      role="img"
      style={{
        width: '100%', maxWidth: 820, margin: '64px auto 0',
        position: 'relative',
      }}
    >
      {/* Ambient glow — single, subtle */}
      <div style={{
        position: 'absolute', inset: -20,
        background: `radial-gradient(ellipse 60% 50% at 50% 60%, ${C.cyan}0A, transparent 70%)`,
        borderRadius: 28, pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative',
        background: C.s1,
        ...GLASS,
        borderRadius: 16, overflow: 'hidden',
        boxShadow: `0 40px 80px rgba(0,0,0,0.5), ${GLASS.boxShadow}`,
      }}>
        {/* Title bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '11px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#DC3C3C', opacity: 0.7 }} />
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#FBBF24', opacity: 0.7 }} />
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#3DB88A', opacity: 0.7 }} />
          <span style={{ marginLeft: 10, fontSize: 11, color: C.muted, fontFamily: FB }}>Dashboard</span>
        </div>

        <div style={{ padding: '16px 20px 20px' }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
            {kpis.map((k, i) => (
              <div key={i} style={{
                background: C.s2, ...GLASS, borderRadius: 10, padding: '12px',
              }}>
                <div style={{ fontSize: 9.5, color: C.muted, fontFamily: FB, marginBottom: 6 }}>{k.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: F, color: k.color, letterSpacing: '-0.03em' }}>{k.val}</div>
              </div>
            ))}
          </div>

          {/* Order table */}
          <div style={{ background: C.s2, ...GLASS, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '72px 1fr 90px 1fr', gap: 8,
              padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.03)',
            }}>
              {['Sipariş', 'Müşteri', 'Durum', 'İlerleme'].map(h => (
                <span key={h} style={{ fontSize: 9, color: C.muted, fontFamily: FB, fontWeight: 600 }}>{h}</span>
              ))}
            </div>
            {rows.map((r, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '72px 1fr 90px 1fr', gap: 8,
                padding: '9px 14px', alignItems: 'center',
                borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.02)' : 'none',
              }}>
                <span style={{ fontSize: 11, fontFamily: F, fontWeight: 700, color: r.color }}>{r.no}</span>
                <span style={{ fontSize: 11, fontFamily: FB, color: C.sub }}>{r.client}</span>
                <span style={{ fontSize: 9.5, fontFamily: FB, fontWeight: 500, color: r.color }}>{r.status}</span>
                <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.04)' }}>
                  <div style={{ width: `${r.pct}%`, height: '100%', borderRadius: 2, background: r.color, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Hero ───────────────────────────────────────────────────────────────────── */
export default function HeroSection() {
  return (
    <section style={{
      position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '140px 24px 100px',
      overflow: 'hidden',
    }}>
      {/* Single subtle ambient gradient */}
      <div style={{
        position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: 900, height: 600, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${C.cyan}08, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 680 }}>
        {/* Chip */}
        <motion.div {...up(0)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: C.s2, ...GLASS, borderRadius: 100,
          padding: '7px 16px 7px 12px', marginBottom: 32,
          fontSize: 12.5, fontFamily: FB, color: C.sub, fontWeight: 500,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.cyan }} />
          Üretim atölyeleri için tasarlandı
        </motion.div>

        {/* Heading */}
        <motion.h1 {...up(0.08)} style={{
          fontFamily: F,
          fontSize: 'clamp(36px, 5.5vw, 64px)',
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: '-0.03em',
          color: C.text,
          marginBottom: 20,
        }}>
          Siparişten sevkiyata,{' '}
          <span style={{ color: C.cyan }}>tek ekranda</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p {...up(0.16)} style={{
          fontFamily: FB, fontSize: 17, lineHeight: 1.7,
          color: C.sub, maxWidth: 520, margin: '0 auto 36px',
        }}>
          Sipariş, stok, üretim, tedarik ve maliyet yönetimini birleştiren
          platform. WhatsApp grupları ve Excel tablolarına artık gerek yok.
        </motion.p>

        {/* CTAs */}
        <motion.div {...up(0.24)} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: C.cyan, borderRadius: 10, padding: '14px 28px',
            fontFamily: FB, fontWeight: 600, fontSize: 14, color: '#0C0800',
            textDecoration: 'none', transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Ücretsiz Başla <ArrowRight size={15} />
          </Link>
          <Link to="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: C.s2, ...GLASS, borderRadius: 10, padding: '14px 24px',
            fontFamily: FB, fontWeight: 500, fontSize: 14, color: C.sub,
            textDecoration: 'none', transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
          >
            Demoyu İncele
          </Link>
        </motion.div>
      </div>

      {/* Dashboard preview */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <DashboardPreview />
      </div>

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
        background: `linear-gradient(transparent, ${C.bg})`,
        pointerEvents: 'none', zIndex: 2,
      }} />
    </section>
  );
}
