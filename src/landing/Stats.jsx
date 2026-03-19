import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { C, F, FB } from '../config/constants.js';

const stats = [
  { value: 40, suffix: '%', label: 'Daha Az Fire', desc: 'Stok ve BOM optimizasyonu ile hammadde kayıplarını minimize edin' },
  { value: 2, suffix: 'x', label: 'Daha Hızlı Üretim', desc: 'Otomatik üretim emirleri ve aşama takibi ile verimliliği katlayın' },
  { value: 85, suffix: '%', label: 'Daha Az Excel', desc: 'Tüm operasyonel veriniz tek platformda, tablolar tarih oluyor' },
  { value: 10, suffix: 'dk', label: 'Stok Sayımı', desc: 'Eskiden saatler süren envanter kontrolü artık dakikalar içinde' },
];

function AnimatedCounter({ value, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 1500;
          const startTime = performance.now();

          const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} style={{
      fontFamily: F, fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 900,
      backgroundImage: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      lineHeight: 1,
    }}>
      {count}{suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section style={{
      padding: '100px 24px',
      background: `linear-gradient(180deg, ${C.bg}, ${C.s1} 50%, ${C.bg})`,
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 24,
      }}>
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              textAlign: 'center', padding: '32px 20px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            <div style={{
              fontFamily: F, fontSize: 15, fontWeight: 700,
              color: C.text, marginTop: 12, marginBottom: 8,
            }}>{stat.label}</div>
            <div style={{
              fontFamily: FB, fontSize: 12.5, color: C.muted, lineHeight: 1.6,
            }}>{stat.desc}</div>
          </motion.div>
        ))}
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 800px) {
          section > div { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 500px) {
          section > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
