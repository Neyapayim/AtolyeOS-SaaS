import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

/* ── Magnetic Button Hook ──────────────────────────────────────────────────── */
function useMagnetic(strength = 0.3) {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    setOffset({ x: dx, y: dy });
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  return { ref, offset, handleMouseMove, handleMouseLeave };
}

/* ── Cinematic Word Reveal ─────────────────────────────────────────────────── */
function CinematicText({ text, delay = 0, gradient = false }) {
  const words = text.split(' ');
  return (
    <span style={{ display: 'inline' }}>
      {words.map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
          <motion.span
            initial={{ y: '110%', rotateX: 45, opacity: 0 }}
            animate={{ y: '0%', rotateX: 0, opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: delay + i * 0.07,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              display: 'inline-block',
              transformOrigin: 'bottom center',
              ...(gradient ? {
                backgroundImage: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              } : {}),
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </span>
  );
}

/* ── Blend-Mode Orbs ───────────────────────────────────────────────────────── */
function BlendOrb({ size, color, top, left, delay, duration, animation }) {
  return (
    <div style={{
      position: 'absolute', width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle, ${color}30, ${color}12 35%, ${color}05 55%, transparent 70%)`,
      top, left,
      filter: 'blur(2px)',
      mixBlendMode: 'screen',
      animation: `${animation} ${duration}s ease-in-out ${delay}s infinite`,
      willChange: 'transform',
      pointerEvents: 'none',
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
      initial={{ opacity: 0, y: 60, rotateX: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      transition={{ duration: 1.4, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{
        perspective: '1200px',
        width: '100%', maxWidth: 780,
        margin: '56px auto 0',
        position: 'relative',
      }}
    >
      {/* Glow behind */}
      <div style={{
        position: 'absolute', inset: -4,
        background: `linear-gradient(135deg, ${C.cyan}28, transparent 40%, ${C.gold}20, transparent 80%)`,
        borderRadius: 24, filter: 'blur(30px)', zIndex: 0,
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(10,10,13,0.82)',
        backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, overflow: 'hidden',
        boxShadow: `
          0 50px 120px rgba(0,0,0,0.7),
          0 0 0 1px rgba(255,255,255,0.03),
          inset 0 1px 0 rgba(255,255,255,0.04)
        `,
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
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.2 + i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${h}%`, opacity: 1 }}
                transition={{ delay: 1.5 + i * 0.04, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  flex: 1,
                  background: `linear-gradient(180deg, ${C.cyan}95, ${C.cyan}25)`,
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

/* ── Magnetic Button Component ─────────────────────────────────────────────── */
function MagneticButton({ children, to, primary = false }) {
  const { ref, offset, handleMouseMove, handleMouseLeave } = useMagnetic(0.35);

  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{
          x: offset.x,
          y: offset.y,
        }}
        transition={{ type: 'spring', stiffness: 250, damping: 15, mass: 0.5 }}
        whileTap={{ scale: 0.96 }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          ...(primary ? {
            background: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
            borderRadius: 14, padding: '16px 36px',
            fontWeight: 700, fontSize: 15, color: '#0C0800',
            boxShadow: `0 8px 32px rgba(232,145,74,0.35)`,
            animation: 'landing-breathe 4s ease-in-out infinite',
          } : {
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: '16px 32px',
            fontWeight: 500, fontSize: 15, color: C.sub,
          }),
          fontFamily: FB, cursor: 'pointer',
          position: 'relative', overflow: 'hidden',
          transition: 'box-shadow 0.4s ease',
        }}
      >
        {primary && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
            animation: 'landing-glow-line 3s ease-in-out infinite',
          }} />
        )}
        {children}
      </motion.div>
    </Link>
  );
}

/* ── Hero Section ──────────────────────────────────────────────────────────── */
export default function HeroSection() {
  return (
    <section style={{
      position: 'relative', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '120px 24px 80px', overflow: 'hidden',
      /* Isolation for blend modes */
      isolation: 'isolate',
    }}>
      {/* Blend-mode Orbs — cinematic light show */}
      <BlendOrb size={700} color={C.cyan} top="-15%" left="-8%" delay={0} duration={18} animation="landing-orb-drift" />
      <BlendOrb size={550} color={C.lav} top="15%" left="65%" delay={2} duration={22} animation="landing-orb-drift-2" />
      <BlendOrb size={500} color={C.gold} top="55%" left="5%" delay={4} duration={20} animation="landing-orb-drift-3" />
      <BlendOrb size={400} color={C.sky} top="0%" left="45%" delay={1} duration={16} animation="landing-orb-drift" />
      <BlendOrb size={300} color="#DC3C3C" top="40%" left="75%" delay={3} duration={24} animation="landing-orb-drift-3" />

      {/* Radial vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 85% 65% at 50% 40%, transparent 0%, ${C.bg}ee 70%, ${C.bg} 100%)`,
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Noise texture overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: '128px 128px',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 840 }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(232,145,74,0.06)',
            border: '1px solid rgba(232,145,74,0.15)',
            borderRadius: 100, padding: '8px 20px 8px 14px',
            marginBottom: 36, fontSize: 13, fontFamily: FB, color: C.cyan,
            fontWeight: 500,
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: C.cyan,
            animation: 'pulse-dot 2s ease-in-out infinite',
          }} />
          Üretim Yönetiminde Yeni Nesil
        </motion.div>

        {/* Main heading — Cinematic word-by-word reveal */}
        <h1 style={{
          fontFamily: F, fontSize: 'clamp(38px, 6.5vw, 76px)', fontWeight: 900,
          lineHeight: 1.05, letterSpacing: '-0.035em',
          color: C.text, marginBottom: 28,
          perspective: '600px',
        }}>
          <CinematicText text="Siparişten Sevkiyata," delay={0.2} />
          <br />
          <CinematicText text="Tek Ekranda" delay={0.55} gradient />
          {' '}
          <CinematicText text="Dijital Atölye" delay={0.75} />
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: FB, fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.7,
            color: C.sub, maxWidth: 560, margin: '0 auto 44px',
            fontWeight: 400,
          }}
        >
          Karmaşık Excel tablolarına veda edin. Stok, maliyet, üretim ve tedarik —
          tüm atölye operasyonlarınız artık tek bir platformda.
        </motion.p>

        {/* CTA Buttons — Magnetic */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.15, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <MagneticButton to="/register" primary>
            <span style={{ position: 'relative', zIndex: 1 }}>Hemen Ücretsiz Başla</span>
            <ArrowRight size={16} style={{ position: 'relative', zIndex: 1 }} />
          </MagneticButton>

          <MagneticButton to="/login">
            <Play size={14} />
            <span>Demoyu İncele</span>
          </MagneticButton>
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
