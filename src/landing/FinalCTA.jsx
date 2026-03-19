import { useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

const GLASS = { border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' };

function useMagnetic(str = 0.4) {
  const ref = useRef(null);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const onMove = useCallback((e) => { if (!ref.current) return; const r = ref.current.getBoundingClientRect(); setOff({ x: (e.clientX - r.left - r.width / 2) * str, y: (e.clientY - r.top - r.height / 2) * str }); }, [str]);
  const onLeave = useCallback(() => setOff({ x: 0, y: 0 }), []);
  return { ref, off, onMove, onLeave };
}

export default function FinalCTA() {
  const { ref, off, onMove, onLeave } = useMagnetic(0.4);

  return (
    <section style={{ padding: '160px 24px', position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
      {/* color-dodge orbs */}
      <div style={{ position: 'absolute', width: 750, height: 750, borderRadius: '50%', background: `radial-gradient(circle, ${C.cyan}14, transparent 60%)`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', mixBlendMode: 'color-dodge', animation: 'landing-orb-drift 20s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 550, height: 550, borderRadius: '50%', background: `radial-gradient(circle, ${C.gold}10, transparent 55%)`, top: '20%', left: '12%', pointerEvents: 'none', mixBlendMode: 'color-dodge', animation: 'landing-orb-drift-2 24s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${C.lav}0C, transparent 55%)`, top: '55%', left: '72%', pointerEvents: 'none', mixBlendMode: 'color-dodge', animation: 'landing-orb-drift-3 22s ease-in-out infinite' }} />

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1, perspective: '600px' }}>
        {/* Zap icon — spring bounce */}
        <motion.div
          initial={{ scale: 0.4, rotate: -18, opacity: 0 }}
          whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 280, damping: 14, delay: 0.1 }}
          whileHover={{ scale: 1.18, rotate: 8 }}
          style={{
            width: 72, height: 72, borderRadius: 24,
            background: `linear-gradient(135deg, ${C.cyan}14, ${C.gold}0A)`,
            ...GLASS,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 40px', cursor: 'pointer',
          }}
        >
          <Zap size={32} color={C.cyan} strokeWidth={1.7} />
        </motion.div>

        {/* Cinematic heading */}
        <h2 style={{ fontFamily: F, fontSize: 'clamp(32px, 5.5vw, 56px)', fontWeight: 900, color: C.text, letterSpacing: '-2px', lineHeight: 1.08, marginBottom: 28 }}>
          {['Atölyenizi', 'Bugünden'].map((w, i) => (
            <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
              <motion.span initial={{ y: '110%', rotateX: 50, opacity: 0 }} whileInView={{ y: '0%', rotateX: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.85, delay: 0.15 + i * 0.07, ease: [0.16, 1, 0.3, 1] }} style={{ display: 'inline-block', transformOrigin: 'bottom center' }}>{w}</motion.span>{'\u00A0'}
            </span>
          ))}
          <br />
          {['Dijitale', 'Taşıyın'].map((w, i) => (
            <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
              <motion.span initial={{ y: '110%', rotateX: 50, opacity: 0 }} whileInView={{ y: '0%', rotateX: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.85, delay: 0.35 + i * 0.07, ease: [0.16, 1, 0.3, 1] }} style={{ display: 'inline-block', transformOrigin: 'bottom center', backgroundImage: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{w}</motion.span>{i === 0 && '\u00A0'}
            </span>
          ))}
        </h2>

        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6, duration: 0.7 }} style={{ fontFamily: FB, fontSize: 18, lineHeight: 1.75, color: C.sub, maxWidth: 520, margin: '0 auto 56px' }}>
          Kurulum yok, kredi kartı yok. 30 saniyede kayıt olun,
          üretim hattınızın kontrolünü elinize alın.
        </motion.p>

        {/* Magnetic CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.85, duration: 0.7 }}>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <motion.div
              ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
              animate={{ x: off.x, y: off.y }}
              transition={{ type: 'spring', stiffness: 220, damping: 18, mass: 0.6 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 14,
                background: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
                borderRadius: 18, padding: '24px 56px',
                fontWeight: 700, fontSize: 19, color: '#0C0800', fontFamily: FB, cursor: 'pointer',
                boxShadow: `0 16px 60px rgba(232,145,74,0.4), 0 0 120px rgba(232,145,74,0.12), inset 0 1px 0 rgba(255,255,255,0.25)`,
                animation: 'landing-breathe 4s ease-in-out infinite',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation: 'landing-glow-line 3s ease-in-out infinite' }} />
              <span style={{ position: 'relative', zIndex: 1 }}>Hemen Ücretsiz Başla</span>
              <ArrowRight size={20} style={{ position: 'relative', zIndex: 1 }} />
            </motion.div>
          </Link>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.1 }} style={{ fontFamily: FB, fontSize: 13, color: C.muted, marginTop: 28 }}>
          Ücretsiz plan ile sınırsız kullanım — Yükseltme isteğe bağlı
        </motion.p>
      </motion.div>
    </section>
  );
}
