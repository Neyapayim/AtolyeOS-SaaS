import { motion } from 'framer-motion';
import { Factory, Hammer, Wrench, Scissors, Truck, Cog } from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

const partners = [
  { icon: Factory, name: 'Mobilya Atölyeleri' },
  { icon: Hammer, name: 'Metal İşleme' },
  { icon: Wrench, name: 'CNC & Tornacılar' },
  { icon: Scissors, name: 'Tekstil Üretimi' },
  { icon: Truck, name: 'Fason İmalatçılar' },
  { icon: Cog, name: 'Makine Atölyeleri' },
  { icon: Factory, name: 'Mobilya Atölyeleri' },
  { icon: Hammer, name: 'Metal İşleme' },
  { icon: Wrench, name: 'CNC & Tornacılar' },
  { icon: Scissors, name: 'Tekstil Üretimi' },
  { icon: Truck, name: 'Fason İmalatçılar' },
  { icon: Cog, name: 'Makine Atölyeleri' },
];

export default function TrustedBy() {
  return (
    <section style={{
      padding: '72px 0',
      borderTop: '1px solid rgba(255,255,255,0.03)',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
      background: `linear-gradient(180deg, ${C.bg}, ${C.s1}, ${C.bg})`,
      overflow: 'hidden',
    }}>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{
          textAlign: 'center', fontSize: 11, fontFamily: FB,
          color: C.muted, letterSpacing: '3px', textTransform: 'uppercase',
          fontWeight: 600, marginBottom: 40,
        }}
      >
        Mobilyadan Metale, Her Sektörden Atölye Güveniyor
      </motion.p>

      <div style={{
        display: 'flex', width: 'max-content',
        animation: 'landing-logo-scroll 35s linear infinite',
      }}>
        {partners.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '0 44px', whiteSpace: 'nowrap',
              opacity: 0.25, transition: 'opacity 0.4s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.65'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.25'}
            >
              <Icon size={20} color={C.sub} strokeWidth={1.4} />
              <span style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: C.sub, letterSpacing: '0.3px' }}>{p.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
