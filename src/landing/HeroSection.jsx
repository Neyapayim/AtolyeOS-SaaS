import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

/* ── Floating Orbs ─────────────────────────────────────────────────────────── */
function Orb({ size, color, top, left, delay, duration, animation }) {
  return (
    <div style={{
      position: 'absolute', width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle, ${color}18, ${color}08 40%, transparent 70%)`,
      top, left, filter: 'blur(1px)',
      animation: `${animation} ${duration}s ease-in-out ${delay}s infinite`,
      willChange: 'transform',
    }} />
  );
}

/* ── Dashboard Mock ────────────────────────────────────────────────────────── */
function DashboardMock() {
  const kpis = [
    { label: 'Aktif Siparişler', value: '24', color: C.cyan },
    { label: 'Üretimde', value: '12', color: '#3DB88A' },
    { label: 'Sevkiyat Bekleyen', value: '7', color: '#3E7BD4' },
    { label: 'Aylık Ciro', value: '₺847K', color: C.gold },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        perspective: '1200px',
        width: '100%', maxWidth: 780,
        margin: '56px auto 0',
        position: 'relative',
      }}
    >
      {/* Glow behind */}
      <div style={{
        position: 'absolute', inset: -2,
        background: `linear-gradient(135deg, ${C.cyan}22, transparent 50%, ${C.gold}15)`,
        borderRadius: 22, filter: 'blur(20px)', zIndex: 0,
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(10,10,13,0.85)',
        backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
      }}>
        {/* Top bar */}
        <div style={{
          padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.015)',
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC3C3C' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FBBF24' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3DB88A' }} />
          <span style={{
            marginLeft: 12, fontSize: 11, color: C.sub, fontFamily: FB, letterSpacing: 0.5,
          }}>Atölye OS — Dashboard</span>
        </div>

        {/* KPI Row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12,
          padding: '20px 20px 16px',
        }}>
          {kpis.map((k, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.12, duration: 0.6 }}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: 12, padding: '14px 16px',
              }}
            >
              <div style={{ fontSize: 10, color: C.sub, fontFamily: FB, marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: F, color: k.color }}>{k.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Fake chart area */}
        <div style={{ padding: '4px 20px 20px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.015)',
            border: '1px solid rgba(255,255,255,0.03)',
            borderRadius: 12, height: 120, display: 'flex', alignItems: 'flex-end',
            padding: '16px 16px 12px', gap: 6, overflow: 'hidden',
          }}>
            {[40, 55, 38, 72, 60, 85, 48, 90, 65, 78, 95, 70, 88, 52, 80, 92].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 1.3 + i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  flex: 1,
                  background: `linear-gradient(180deg, ${C.cyan}90, ${C.cyan}30)`,
                  borderRadius: '4px 4px 0 0',
                  minWidth: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Hero Section ──────────────────────────────────────────────────────────── */
export default function HeroSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  return (
    <section style={{
      position: 'relative', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '120px 24px 80px', overflow: 'hidden',
    }}>
      {/* Orbs */}
      <Orb size={600} color={C.cyan} top="-10%" left="-5%" delay={0} duration={18} animation="landing-orb-drift" />
      <Orb size={500} color={C.lav} top="20%" left="70%" delay={2} duration={22} animation="landing-orb-drift-2" />
      <Orb size={400} color={C.gold} top="60%" left="10%" delay={4} duration={20} animation="landing-orb-drift-3" />
      <Orb size={350} color={C.sky} top="5%" left="50%" delay={1} duration={16} animation="landing-orb-drift" />

      {/* Grain overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, ${C.bg} 100%)`,
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 800 }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(232,145,74,0.06)',
            border: '1px solid rgba(232,145,74,0.15)',
            borderRadius: 100, padding: '8px 20px 8px 14px',
            marginBottom: 32, fontSize: 13, fontFamily: FB, color: C.cyan,
            fontWeight: 500,
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: C.cyan,
            animation: 'pulse-dot 2s ease-in-out infinite',
          }} />
          Üretim Yönetiminde Yeni Nesil
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: F, fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900,
            lineHeight: 1.05, letterSpacing: '-0.03em',
            color: C.text, marginBottom: 24,
          }}
        >
          Siparişten Sevkiyata,{' '}
          <span style={{
            backgroundImage: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Tek Ekranda
          </span>{' '}
          Dijital Atölye
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: FB, fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.7,
            color: C.sub, maxWidth: 560, margin: '0 auto 40px',
            fontWeight: 400,
          }}
        >
          Karmaşık Excel tablolarına veda edin. Stok, maliyet, üretim ve tedarik —
          tüm atölye operasyonlarınız artık tek bir platformda.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          {/* Primary CTA */}
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
                borderRadius: 14, padding: '16px 36px',
                fontWeight: 700, fontSize: 15, color: '#0C0800',
                fontFamily: FB, cursor: 'pointer',
                boxShadow: `0 8px 32px rgba(232,145,74,0.35)`,
                animation: 'landing-breathe 4s ease-in-out infinite',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Shimmer line */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                animation: 'landing-glow-line 3s ease-in-out infinite',
              }} />
              <span style={{ position: 'relative', zIndex: 1 }}>Hemen Ücretsiz Başla</span>
              <ArrowRight size={16} style={{ position: 'relative', zIndex: 1 }} />
            </motion.div>
          </Link>

          {/* Secondary CTA */}
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.06)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, padding: '16px 32px',
                fontWeight: 500, fontSize: 15, color: C.sub,
                fontFamily: FB, cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <Play size={14} />
              <span>Demoyu İncele</span>
            </motion.div>
          </Link>
        </motion.div>
      </div>

      {/* Dashboard Mock */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 900 }}>
        <DashboardMock />
      </div>

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 200,
        background: `linear-gradient(transparent, ${C.bg})`,
        pointerEvents: 'none', zIndex: 3,
      }} />
    </section>
  );
}
