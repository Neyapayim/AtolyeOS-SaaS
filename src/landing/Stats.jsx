import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { C, F, FB } from '../config/constants.js';

const GLASS = {
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
};

const stats = [
  { value: 40, suffix: '%', label: 'Daha Az Fire', desc: 'BOM optimizasyonu ile hammadde israfını minimize edin' },
  { value: 2, suffix: 'x', label: 'Hızlı Üretim', desc: 'Otomatik iş emirleri ve aşama takibiyle verimliliği katlayın' },
  { value: 85, suffix: '%', label: 'Daha Az Excel', desc: 'Tüm operasyonel veriniz tek platformda, tablolar rafa kalkar' },
  { value: 10, suffix: 'dk', label: 'Stok Sayımı', desc: 'Eskiden saatler süren envanter kontrolü artık dakikalarda' },
];

function AnimatedCounter({ value, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        const dur = 1600, t0 = performance.now();
        const tick = (now) => {
          const p = Math.min((now - t0) / dur, 1);
          setCount(Math.round((1 - Math.pow(1 - p, 3)) * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  return (
    <span ref={ref} style={{
      fontFamily: F, fontSize: 'clamp(42px, 5.5vw, 60px)', fontWeight: 900,
      backgroundImage: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      lineHeight: 1, letterSpacing: '-2px',
    }}>
      {count}{suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section style={{
      padding: '140px 24px',
      background: `linear-gradient(180deg, ${C.bg}, ${C.s1} 50%, ${C.bg})`,
    }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {stats.map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              textAlign: 'center', padding: '40px 24px',
              borderRadius: 22,
              background: 'rgba(255,255,255,0.012)',
              ...GLASS,
            }}
          >
            <AnimatedCounter value={s.value} suffix={s.suffix} />
            <div style={{ fontFamily: F, fontSize: 15, fontWeight: 700, color: C.text, marginTop: 16, marginBottom: 10, letterSpacing: '-0.5px' }}>{s.label}</div>
            <div style={{ fontFamily: FB, fontSize: 12.5, color: C.muted, lineHeight: 1.65 }}>{s.desc}</div>
          </motion.div>
        ))}
      </div>
      <style>{`
        @media (max-width: 800px) { section > div { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 500px) { section > div { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
