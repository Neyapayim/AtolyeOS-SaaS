import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

export default function FinalCTA() {
  return (
    <section style={{
      padding: '120px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.cyan}10, transparent 60%)`,
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
        animation: 'landing-orb-drift 16s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.gold}08, transparent 60%)`,
        top: '30%', left: '20%', pointerEvents: 'none',
        animation: 'landing-orb-drift-2 20s ease-in-out infinite',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{
          maxWidth: 700, margin: '0 auto', textAlign: 'center',
          position: 'relative', zIndex: 1,
        }}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            width: 64, height: 64, borderRadius: 20,
            background: `linear-gradient(135deg, ${C.cyan}15, ${C.gold}10)`,
            border: `1px solid ${C.cyan}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 32px',
          }}
        >
          <Zap size={28} color={C.cyan} strokeWidth={1.8} />
        </motion.div>

        {/* Heading */}
        <h2 style={{
          fontFamily: F, fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900,
          color: C.text, letterSpacing: '-0.03em', lineHeight: 1.1,
          marginBottom: 20,
        }}>
          Atölyenizi Bugünden{' '}
          <span style={{
            backgroundImage: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Dijitale Taşıyın</span>
        </h2>

        <p style={{
          fontFamily: FB, fontSize: 17, lineHeight: 1.7,
          color: C.sub, maxWidth: 500, margin: '0 auto 44px',
        }}>
          Kurulum yok, kredi kartı yok. 30 saniyede kayıt olun,
          atölyenizi hemen yönetmeye başlayın.
        </p>

        {/* CTA Button */}
        <Link to="/register" style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              background: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
              borderRadius: 16, padding: '20px 48px',
              fontWeight: 700, fontSize: 17, color: '#0C0800',
              fontFamily: FB, cursor: 'pointer',
              boxShadow: `0 12px 40px rgba(232,145,74,0.35), 0 0 80px rgba(232,145,74,0.12)`,
              animation: 'landing-breathe 4s ease-in-out infinite',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Shimmer */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
              animation: 'landing-glow-line 3s ease-in-out infinite',
            }} />
            <span style={{ position: 'relative', zIndex: 1 }}>Hemen Ücretsiz Başla</span>
            <ArrowRight size={18} style={{ position: 'relative', zIndex: 1 }} />
          </motion.div>
        </Link>

        {/* Trust note */}
        <p style={{
          fontFamily: FB, fontSize: 12, color: C.muted,
          marginTop: 20,
        }}>
          Ücretsiz plan ile sınırsız kullanım — Yükseltme isteğe bağlı
        </p>
      </motion.div>
    </section>
  );
}
