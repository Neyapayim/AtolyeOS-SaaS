import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ShoppingCart, ClipboardCheck, Factory, Package,
  Truck, CheckCircle
} from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

const GLASS = {
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
};

const steps = [
  { icon: ShoppingCart, title: 'Sipariş Alın', desc: 'Müşteri aradı, siparişi sisteme girin. Çoklu kalem, alt müşteri ve termin — hepsi tek formda.', color: C.cyan, detail: 'Sipariş girildiği an stok analizi otomatik çalışır. Stokta varsa direkt sevkiyata hazır; yoksa eksik malzeme listesi çıkar.' },
  { icon: ClipboardCheck, title: 'Stok Kontrol', desc: 'Sistem her ham madde ve yarı mamülü kontrol eder, eksikleri hesaplar.', color: '#3E7BD4', detail: 'BOM reçetesi üzerinden rekürsif malzeme patlatma. Hangi depoda ne kadar var, neye ne kadar lazım — saniyeler içinde.' },
  { icon: Factory, title: 'Üretime Gönder', desc: 'Tek tıkla toplu üretim emirleri. Aşamalar, süreler ve sorumlular otomatik atanır.', color: '#3DB88A', detail: 'Kanban tahtasında canlı aşama takibi, iş günlüğü, canlı zamanlayıcılar. Üretim hattınız artık şeffaf.' },
  { icon: Package, title: 'Tedarik Et', desc: 'Eksik malzeme? Tedarikçiye sipariş, nakliye takibi, otomatik stok girişi.', color: C.gold, detail: 'Toplu, ürün bazlı veya sipariş bazlı 3 farklı görünümle tedarik sürecini komple izleyin.' },
  { icon: Truck, title: 'Sevk Et', desc: 'Üretim bitti, sevkiyat emri oluşturun. Nakliye ve teslimat takibi dahil.', color: '#D46B2A', detail: 'Stok hareketleri otomatik güncellenir. İrsaliye numarası, fatura bilgisi, nakliyeci — hepsi kayıtta.' },
  { icon: CheckCircle, title: 'Tamamla', desc: 'Sipariş teslim. Maliyet analizi ve kar/marj raporlarınız hazır.', color: '#3DB88A', detail: 'Siparişten teslimata her adım tek ekrandan izlenip raporlanabilir. "Bu sipariş bize ne kazandırdı?" sorusunun cevabı burada.' },
];

/* ── Scroll-Linked SVG Path ── */
function ScrollPath({ containerRef }) {
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start 80%', 'end 20%'] });
  const pathLen = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const glowOp = useTransform(scrollYProgress, [0, 0.5, 1], [0.15, 0.85, 1]);

  return (
    <svg style={{ position: 'absolute', left: 39, top: 0, width: 2, height: '100%', overflow: 'visible', zIndex: 0, pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="goldFlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.cyan} />
          <stop offset="50%" stopColor={C.gold} />
          <stop offset="100%" stopColor={C.cyan} />
        </linearGradient>
        <filter id="pathGlow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <motion.line x1="1" y1="0" x2="1" y2="100%" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
      <motion.line
        x1="1" y1="0" x2="1" y2="100%"
        stroke="url(#goldFlow)" strokeWidth="2" filter="url(#pathGlow)"
        style={{ pathLength: pathLen, opacity: glowOp }} strokeLinecap="round"
      />
      <motion.circle
        cx="1" r="5" fill={C.gold} filter="url(#pathGlow)"
        style={{
          cy: useTransform(scrollYProgress, [0, 1], ['0%', '100%']),
          opacity: useTransform(scrollYProgress, [0, 0.04, 0.96, 1], [0, 1, 1, 0]),
        }}
      />
    </svg>
  );
}

export default function InteractiveShowcase() {
  const [activeStep, setActiveStep] = useState(0);
  const stepsRef = useRef(null);

  return (
    <section style={{
      padding: '160px 24px',
      background: `linear-gradient(180deg, ${C.bg}, ${C.s1} 25%, ${C.s1} 75%, ${C.bg})`,
      position: 'relative', isolation: 'isolate',
    }}>
      {/* Ambient orb */}
      <div style={{
        position: 'absolute', width: 550, height: 550, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.cyan}0C, transparent 65%)`,
        top: '18%', left: '58%', pointerEvents: 'none', mixBlendMode: 'color-dodge',
        animation: 'landing-orb-drift-2 22s ease-in-out infinite',
      }} />

      <div style={{ maxWidth: 1140, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 88, perspective: '600px' }}
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ fontSize: 12, fontFamily: FB, color: C.cyan, letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 20 }}
          >Nasıl Çalışır?</motion.p>
          <h2 style={{ fontFamily: F, fontSize: 'clamp(30px, 4.5vw, 48px)', fontWeight: 900, color: C.text, letterSpacing: '-2px', lineHeight: 1.08 }}>
            {['Siparişten', 'Teslimata,'].map((w, i) => (
              <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
                <motion.span initial={{ y: '105%', rotateX: 45, opacity: 0 }} whileInView={{ y: '0%', rotateX: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }} style={{ display: 'inline-block', transformOrigin: 'bottom center' }}>{w}</motion.span>{'\u00A0'}
              </span>
            ))}
            <br />
            {['Kesintisiz', 'Akış'].map((w, i) => (
              <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
                <motion.span initial={{ y: '105%', rotateX: 45, opacity: 0 }} whileInView={{ y: '0%', rotateX: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 + i * 0.07, ease: [0.16, 1, 0.3, 1] }} style={{ display: 'inline-block', transformOrigin: 'bottom center', backgroundImage: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{w}</motion.span>{i === 0 && '\u00A0'}
              </span>
            ))}
          </h2>
        </motion.div>

        {/* ── Content grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 56, alignItems: 'start' }}>
          {/* Left: steps with SVG line */}
          <div ref={stepsRef} style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
            <ScrollPath containerRef={stepsRef} />
            {steps.map((s, i) => {
              const Icon = s.icon;
              const active = activeStep === i;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                  onClick={() => setActiveStep(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '18px 20px', borderRadius: 16, cursor: 'pointer',
                    background: active ? `${s.color}06` : 'transparent',
                    border: active ? `1px solid ${s.color}18` : '1px solid transparent',
                    transition: 'all 0.35s ease', position: 'relative', zIndex: 1,
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.18 }}
                    whileTap={{ scale: 0.82 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                    style={{
                      width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                      background: active ? `${s.color}10` : 'rgba(255,255,255,0.025)',
                      ...GLASS,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Icon size={18} color={active ? s.color : C.muted} strokeWidth={1.8} />
                  </motion.div>
                  <div>
                    <div style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: active ? C.text : C.sub, letterSpacing: '-0.5px', transition: 'color 0.3s' }}>{s.title}</div>
                    <div style={{ fontFamily: FB, fontSize: 11.5, color: C.muted, lineHeight: 1.45, marginTop: 3 }}>{s.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right: detail panel */}
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'rgba(255,255,255,0.018)',
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              ...GLASS,
              borderRadius: 26, padding: '56px 48px',
              position: 'relative', overflow: 'hidden', minHeight: 420,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}
          >
            <div style={{
              position: 'absolute', top: -100, right: -100,
              width: 320, height: 320, borderRadius: '50%',
              background: `radial-gradient(circle, ${steps[activeStep].color}12, transparent 60%)`,
              pointerEvents: 'none', mixBlendMode: 'color-dodge',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{
                fontFamily: F, fontSize: 88, fontWeight: 900,
                backgroundImage: `linear-gradient(180deg, ${steps[activeStep].color}18, transparent)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                position: 'absolute', top: -40, right: 0, lineHeight: 1, userSelect: 'none',
                letterSpacing: '-4px',
              }}>0{activeStep + 1}</span>

              <motion.div
                key={`ic-${activeStep}`}
                initial={{ scale: 0.4, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 16 }}
                whileHover={{ scale: 1.12, rotate: 5 }}
                style={{
                  width: 60, height: 60, borderRadius: 18,
                  background: `${steps[activeStep].color}0C`,
                  ...GLASS,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 28, cursor: 'pointer',
                }}
              >
                {(() => { const I = steps[activeStep].icon; return <I size={27} color={steps[activeStep].color} strokeWidth={1.7} />; })()}
              </motion.div>

              <h3 style={{ fontFamily: F, fontSize: 30, fontWeight: 900, color: C.text, marginBottom: 18, letterSpacing: '-1.5px' }}>{steps[activeStep].title}</h3>
              <p style={{ fontFamily: FB, fontSize: 15.5, lineHeight: 1.8, color: C.sub, maxWidth: 480, marginBottom: 36 }}>{steps[activeStep].detail}</p>

              <div style={{ display: 'flex', gap: 8 }}>
                {steps.map((_, i) => (
                  <motion.div key={i} onClick={() => setActiveStep(i)}
                    whileHover={{ scale: 1.35 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                    style={{
                      width: i === activeStep ? 36 : 8, height: 8, borderRadius: 4, cursor: 'pointer',
                      background: i === activeStep ? steps[activeStep].color : 'rgba(255,255,255,0.06)',
                      transition: 'width 0.35s ease, background 0.35s ease',
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <style>{`@media (max-width: 800px) { section > div > div:last-child { grid-template-columns: 1fr !important; } }`}</style>
      </div>
    </section>
  );
}
