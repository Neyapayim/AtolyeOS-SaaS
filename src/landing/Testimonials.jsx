import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

const GLASS = {
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
};

const testimonials = [
  { name: 'Mehmet Karaca', role: 'Karaca Mobilya — Kurucu', text: 'Excel\'de 3 saat süren stok sayımını artık 10 dakikada yapıyoruz. Müşteriye "ne zaman teslim?" diye sorulduğunda artık cevabımız hazır.', avatar: 'MK', color: C.cyan },
  { name: 'Ayşe Demir', role: 'Demir Metal — Üretim Müdürü', text: 'Boyacıdaki parça mı, kaynak atölyesindeki profil mi — hepsini tek ekrandan görüyoruz. Fason takibi artık kabus değil. İş kayıplarımız %35 düştü.', avatar: 'AD', color: '#3DB88A' },
  { name: 'Hakan Yılmaz', role: 'Yılmaz Atölye — İşletme Sahibi', text: 'Maliyet kartlarını ilk gördüğümde şok oldum: ürünlerimizin yarısı kârsızmış. Fiyatları düzelttik, ilk ayda %20 daha fazla kâr.', avatar: 'HY', color: C.gold },
  { name: 'Fatma Özkan', role: 'Özkan Tekstil — Operasyon', text: 'WhatsApp gruplarında malzeme peşinde koşmak bitti. Tedarik siparişi, nakliye ve stok girişi tek akışta. Hayat kurtarıcı.', avatar: 'FÖ', color: C.lav },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    const t = setInterval(() => { setDir(1); setActive(p => (p + 1) % testimonials.length); }, 6000);
    return () => clearInterval(t);
  }, []);

  const go = (d) => { setDir(d); setActive(p => { const n = p + d; return n < 0 ? testimonials.length - 1 : n >= testimonials.length ? 0 : n; }); };
  const t = testimonials[active];

  return (
    <section style={{ padding: '160px 24px', position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
      <div style={{
        position: 'absolute', width: 450, height: 450, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.lav}0A, transparent 65%)`,
        top: '8%', left: '4%', pointerEvents: 'none', mixBlendMode: 'color-dodge',
        animation: 'landing-orb-drift-3 20s ease-in-out infinite',
      }} />

      <div style={{ maxWidth: 920, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 72, perspective: '600px' }}>
          <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ fontSize: 12, fontFamily: FB, color: C.cyan, letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 20 }}>Müşteri Görüşleri</motion.p>
          <h2 style={{ fontFamily: F, fontSize: 'clamp(30px, 4.5vw, 48px)', fontWeight: 900, color: C.text, letterSpacing: '-2px' }}>
            {['Atölyeler', 'Ne', 'Diyor?'].map((w, i) => (
              <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
                <motion.span initial={{ y: '105%', rotateX: 45, opacity: 0 }} whileInView={{ y: '0%', rotateX: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }} style={{ display: 'inline-block', transformOrigin: 'bottom center' }}>{w}</motion.span>{i < 2 && '\u00A0'}
              </span>
            ))}
          </h2>
        </motion.div>

        <div style={{ position: 'relative', minHeight: 300 }}>
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, x: dir * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -50 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'rgba(255,255,255,0.018)',
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                ...GLASS,
                borderRadius: 26, padding: '56px 60px',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <Quote size={52} color={`${t.color}10`} style={{ position: 'absolute', top: 32, right: 44 }} />
              <div style={{ display: 'flex', gap: 3, marginBottom: 24 }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#FBBF24" color="#FBBF24" />)}
              </div>
              <p style={{ fontFamily: FB, fontSize: 18, lineHeight: 1.85, color: C.text, fontWeight: 400, fontStyle: 'italic', marginBottom: 36, maxWidth: 660, opacity: 0.88 }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 15,
                  background: `${t.color}0C`, ...GLASS,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: F, fontSize: 17, fontWeight: 800, color: t.color,
                }}>{t.avatar}</div>
                <div>
                  <div style={{ fontFamily: F, fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: '-0.5px' }}>{t.name}</div>
                  <div style={{ fontFamily: FB, fontSize: 13, color: C.sub, marginTop: 3 }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 36 }}>
          {[{ d: -1, I: ChevronLeft }, { d: 1, I: ChevronRight }].map(({ d, I }, idx) => (
            <motion.button key={idx} whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }} onClick={() => go(d)} style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'rgba(255,255,255,0.02)', ...GLASS,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: C.sub,
              ...(idx === 0 ? {} : { order: 2 }),
            }}><I size={18} /></motion.button>
          ))}
          <div style={{ display: 'flex', gap: 8, order: 1 }}>
            {testimonials.map((_, i) => (
              <div key={i} onClick={() => { setDir(i > active ? 1 : -1); setActive(i); }} style={{
                width: i === active ? 28 : 8, height: 8, borderRadius: 4, cursor: 'pointer',
                background: i === active ? testimonials[active].color : 'rgba(255,255,255,0.06)',
                transition: 'all 0.35s ease',
              }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
