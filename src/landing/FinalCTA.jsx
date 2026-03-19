import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

const ease = [0.25, 0.1, 0.25, 1];

export default function FinalCTA() {
  return (
    <section aria-label="Harekete geçin" style={{
      padding: '120px 24px',
      background: C.s1,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease }}
        style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center' }}
      >
        <h2 style={{
          fontFamily: F, fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800,
          color: C.text, letterSpacing: '-0.03em', lineHeight: 1.12,
          marginBottom: 16,
        }}>
          Atölyenizi tek platformdan yönetin
        </h2>
        <p style={{
          fontFamily: FB, fontSize: 16, lineHeight: 1.7,
          color: C.sub, marginBottom: 36,
        }}>
          Kurulum gerektirmez. Kredi kartı gerekmez.
          Ücretsiz plan ile hemen başlayın.
        </p>

        <Link to="/register" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: C.cyan, borderRadius: 10, padding: '16px 32px',
          fontFamily: FB, fontWeight: 600, fontSize: 15, color: '#0C0800',
          textDecoration: 'none', transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Ücretsiz Başla <ArrowRight size={16} />
        </Link>
      </motion.div>
    </section>
  );
}
