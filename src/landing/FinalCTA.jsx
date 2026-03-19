import { useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

/* ── Magnetic Button Hook ──────────────────────────────────────────────────── */
function useMagnetic(strength = 0.35) {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setOffset({ x: (e.clientX - cx) * strength, y: (e.clientY - cy) * strength });
  }, [strength]);

  const handleMouseLeave = useCallback(() => setOffset({ x: 0, y: 0 }), []);
  return { ref, offset, handleMouseMove, handleMouseLeave };
}

/* ── Cinematic Text ────────────────────────────────────────────────────────── */
function CinematicWords({ words, gradientWords = [], delay = 0 }) {
  return (
    <>
      {words.map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
          <motion.span
            initial={{ y: '110%', rotateX: 50, opacity: 0 }}
            whileInView={{ y: '0%', rotateX: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: delay + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'inline-block', transformOrigin: 'bottom center',
              ...(gradientWords.includes(word) ? {
                backgroundImage: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              } : {}),
            }}
          >{word}</motion.span>
          {i < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </>
  );
}

export default function FinalCTA() {
  const { ref: btnRef, offset, handleMouseMove, handleMouseLeave } = useMagnetic(0.4);

  return (
    <section style={{
      padding: '140px 24px',
      position: 'relative', overflow: 'hidden',
      isolation: 'isolate',
    }}>
      {/* Blend-mode background orbs */}
      <div style={{
        position: 'absolute', width: 700, height: 700, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.cyan}15, ${C.cyan}05 40%, transparent 65%)`,
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        pointerEvents: 'none', mixBlendMode: 'screen',
        animation: 'landing-orb-drift 18s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.gold}12, transparent 55%)`,
        top: '25%', left: '15%', pointerEvents: 'none', mixBlendMode: 'screen',
        animation: 'landing-orb-drift-2 22s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.lav}10, transparent 55%)`,
        top: '60%', left: '70%', pointerEvents: 'none', mixBlendMode: 'color-dodge',
        animation: 'landing-orb-drift-3 20s ease-in-out infinite',
      }} />

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: 720, margin: '0 auto', textAlign: 'center',
          position: 'relative', zIndex: 1,
          perspective: '600px',
        }}
      >
        {/* Zap icon with spring bounce */}
        <motion.div
          initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
          whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
          whileHover={{ scale: 1.15, rotate: 8 }}
          style={{
            width: 68, height: 68, borderRadius: 22,
            background: `linear-gradient(135deg, ${C.cyan}18, ${C.gold}12)`,
            border: `1px solid ${C.cyan}25`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 36px', cursor: 'pointer',
          }}
        >
          <Zap size={30} color={C.cyan} strokeWidth={1.8} />
        </motion.div>

        {/* Heading — Cinematic */}
        <h2 style={{
          fontFamily: F, fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 900,
          color: C.text, letterSpacing: '-0.035em', lineHeight: 1.1,
          marginBottom: 24,
        }}>
          <CinematicWords
            words={['Atölyenizi', 'Bugünden', 'Dijitale', 'Taşıyın']}
            gradientWords={['Dijitale', 'Taşıyın']}
            delay={0.15}
          />
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.6 }}
          style={{
            fontFamily: FB, fontSize: 17, lineHeight: 1.7,
            color: C.sub, maxWidth: 500, margin: '0 auto 48px',
          }}
        >
          Kurulum yok, kredi kartı yok. 30 saniyede kayıt olun,
          atölyenizi hemen yönetmeye başlayın.
        </motion.p>

        {/* Magnetic CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <motion.div
              ref={btnRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              animate={{ x: offset.x, y: offset.y }}
              transition={{ type: 'spring', stiffness: 250, damping: 15, mass: 0.5 }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 12,
                background: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
                borderRadius: 16, padding: '22px 52px',
                fontWeight: 700, fontSize: 18, color: '#0C0800',
                fontFamily: FB, cursor: 'pointer',
                boxShadow: `
                  0 14px 50px rgba(232,145,74,0.4),
                  0 0 100px rgba(232,145,74,0.15),
                  inset 0 1px 0 rgba(255,255,255,0.2)
                `,
                animation: 'landing-breathe 4s ease-in-out infinite',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Shimmer */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                animation: 'landing-glow-line 3s ease-in-out infinite',
              }} />
              <span style={{ position: 'relative', zIndex: 1 }}>Hemen Ücretsiz Başla</span>
              <ArrowRight size={18} style={{ position: 'relative', zIndex: 1 }} />
            </motion.div>
          </Link>
        </motion.div>

        {/* Trust note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.0, duration: 0.6 }}
          style={{
            fontFamily: FB, fontSize: 12, color: C.muted,
            marginTop: 24,
          }}
        >
          Ücretsiz plan ile sınırsız kullanım — Yükseltme isteğe bağlı
        </motion.p>
      </motion.div>
    </section>
  );
}
