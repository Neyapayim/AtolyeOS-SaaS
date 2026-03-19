import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { C, F, FB, GLASS } from '../config/constants.js';

const ease = [0.25, 0.1, 0.25, 1];

const testimonials = [
  { name: 'Mehmet Karaca', role: 'Karaca Mobilya, Kurucu', text: 'Stok sayımı eskiden 3 saatimizi alıyordu, şimdi 10 dakikada bitiyor. Müşteri aradığında "hangi aşamada?" sorusuna artık anında cevap verebiliyoruz.', initials: 'MK' },
  { name: 'Ayşe Demir', role: 'Demir Metal, Üretim Müdürü', text: 'Boyacıda ne var, kaynak atölyesinde ne var — tek ekrandan görebiliyoruz. Fason takibi artık telefon trafiğiyle değil, sistem üzerinden yapılıyor.', initials: 'AD' },
  { name: 'Hakan Yılmaz', role: 'Yılmaz Atölye, İşletme Sahibi', text: 'Maliyet kartlarını ilk gördüğümde fark ettim: bazı ürünlerimiz aslında zarar ettiriyormuş. Fiyatları düzelttik, kârlılığımız gözle görülür arttı.', initials: 'HY' },
  { name: 'Fatma Özkan', role: 'Özkan Tekstil, Operasyon Yöneticisi', text: 'Malzeme siparişi, nakliye ve stok girişi artık tek akışta. WhatsApp gruplarında malzeme peşinde koşmak bitti.', initials: 'FÖ' },
];

export default function Testimonials() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    const t = setInterval(() => { setDir(1); setIdx(p => (p + 1) % testimonials.length); }, 7000);
    return () => clearInterval(t);
  }, []);

  const go = (d) => { setDir(d); setIdx(p => { const n = p + d; return n < 0 ? testimonials.length - 1 : n >= testimonials.length ? 0 : n; }); };
  const t = testimonials[idx];

  return (
    <section aria-labelledby="testimonials-title" style={{ padding: '120px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          style={{ textAlign: 'center', marginBottom: 56 }}
        >
          <p style={{ fontSize: 12, fontFamily: FB, color: C.cyan, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 500, marginBottom: 12 }}>Müşteriler</p>
          <h2 id="testimonials-title" style={{ fontFamily: F, fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800, color: C.text, letterSpacing: '-0.03em' }}>Atölyeler ne diyor</h2>
        </motion.div>

        <div style={{ position: 'relative', minHeight: 240 }}>
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={idx}
              initial={{ opacity: 0, x: dir * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -24 }}
              transition={{ duration: 0.35, ease }}
              style={{
                background: C.s1, ...GLASS,
                borderRadius: 16, padding: '40px 36px',
                margin: 0,
              }}
            >
              <p style={{
                fontFamily: FB, fontSize: 16.5, lineHeight: 1.8,
                color: C.text, fontStyle: 'italic', marginBottom: 28,
                opacity: 0.88,
              }}>
                "{t.text}"
              </p>
              <footer style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: C.s3, ...GLASS,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: F, fontSize: 13, fontWeight: 700, color: C.sub,
                }}>{t.initials}</div>
                <div>
                  <cite style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: C.text, fontStyle: 'normal', letterSpacing: '-0.01em' }}>{t.name}</cite>
                  <div style={{ fontFamily: FB, fontSize: 12.5, color: C.muted, marginTop: 2 }}>{t.role}</div>
                </div>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 28 }}>
          <button onClick={() => go(-1)} aria-label="Önceki yorum" style={{
            width: 36, height: 36, borderRadius: 10,
            background: C.s2, ...GLASS,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: C.sub, transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
          ><ChevronLeft size={16} /></button>
          <div style={{ display: 'flex', gap: 6 }}>
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i); }}
                aria-label={`Yorum ${i + 1}`}
                style={{
                  width: i === idx ? 20 : 6, height: 6, borderRadius: 3,
                  background: i === idx ? C.cyan : 'rgba(255,255,255,0.08)',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
          <button onClick={() => go(1)} aria-label="Sonraki yorum" style={{
            width: 36, height: 36, borderRadius: 10,
            background: C.s2, ...GLASS,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: C.sub, transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
          ><ChevronRight size={16} /></button>
        </div>
      </div>
    </section>
  );
}
