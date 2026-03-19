import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ShoppingCart, ClipboardCheck, Factory, Package,
  Truck, CheckCircle
} from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

const steps = [
  {
    icon: ShoppingCart, title: 'Sipariş Alın',
    desc: 'Müşterinizden gelen siparişi sisteme girin. Çoklu kalem, alt müşteri ve termin desteği.',
    color: C.cyan,
    detail: 'Sipariş girişi ile stok analizi otomatik yapılır. Stokta yeterli ürün varsa direkt sevkiyata hazır.',
  },
  {
    icon: ClipboardCheck, title: 'Stok Analizi',
    desc: 'Sistem, mevcut stoğunuzu kontrol eder. Eksik malzemeleri otomatik hesaplar.',
    color: '#3E7BD4',
    detail: 'BOM reçetesi üzerinden rekürsif malzeme patlatma. Her ham madde ve yarı mamül kontrol edilir.',
  },
  {
    icon: Factory, title: 'Üretime Gönder',
    desc: 'Tek tıkla toplu üretim emirleri oluşturun. Aşamalar, süreler ve sorumlular otomatik atanır.',
    color: '#3DB88A',
    detail: 'Kanban tahtasında aşama takibi, canlı zamanlayıcılar ve iş günlüğü ile tam kontrol.',
  },
  {
    icon: Package, title: 'Tedarik Et',
    desc: 'Eksik malzemeler için tedarik siparişleri oluşturun. Tedarikçi, nakliye ve fason yönetimi.',
    color: C.gold,
    detail: 'Toplu, ürün bazlı veya sipariş bazlı görünümlerle tedarik sürecini izleyin.',
  },
  {
    icon: Truck, title: 'Sevk Et',
    desc: 'Üretim tamamlandığında sevkiyat emri oluşturun. Nakliye ve teslimat takibi.',
    color: '#D46B2A',
    detail: 'Stok hareketleri otomatik güncellenir. Fatura ve irsaliye bilgileri kaydedilir.',
  },
  {
    icon: CheckCircle, title: 'Tamamla',
    desc: 'Sipariş teslim edildi. Maliyet analizi ve kar/marj raporlarınız hazır.',
    color: '#3DB88A',
    detail: 'Siparişten teslimata kadar tüm süreç tek ekrandan izlenebilir ve raporlanabilir.',
  },
];

/* ── Scroll-Linked SVG Path ────────────────────────────────────────────────── */
function ScrollPath({ containerRef }) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 20%'],
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.8, 1]);

  return (
    <svg
      style={{
        position: 'absolute', left: 39, top: 0,
        width: 2, height: '100%',
        overflow: 'visible', zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <defs>
        <linearGradient id="goldFlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.cyan} />
          <stop offset="50%" stopColor={C.gold} />
          <stop offset="100%" stopColor={C.cyan} />
        </linearGradient>
        <filter id="pathGlow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background track */}
      <motion.line
        x1="1" y1="0" x2="1" y2="100%"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="2"
      />

      {/* Flowing golden line */}
      <motion.line
        x1="1" y1="0" x2="1" y2="100%"
        stroke="url(#goldFlow)"
        strokeWidth="2"
        filter="url(#pathGlow)"
        style={{
          pathLength,
          opacity: glowOpacity,
        }}
        strokeLinecap="round"
      />

      {/* Leading glow dot */}
      <motion.circle
        cx="1"
        r="4"
        fill={C.gold}
        filter="url(#pathGlow)"
        style={{
          cy: useTransform(scrollYProgress, [0, 1], ['0%', '100%']),
          opacity: useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]),
        }}
      />
    </svg>
  );
}

export default function InteractiveShowcase() {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef(null);
  const stepsContainerRef = useRef(null);

  return (
    <section
      ref={containerRef}
      style={{
        padding: '120px 24px',
        background: `linear-gradient(180deg, ${C.bg}, ${C.s1} 30%, ${C.s1} 70%, ${C.bg})`,
        position: 'relative',
      }}
    >
      {/* Background orb */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.cyan}08, transparent 70%)`,
        top: '20%', left: '60%', pointerEvents: 'none',
        mixBlendMode: 'screen',
        animation: 'landing-orb-drift-2 20s ease-in-out infinite',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Section header with cinematic text */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 72, perspective: '600px' }}
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: 12, fontFamily: FB, color: C.cyan,
              letterSpacing: '2.5px', textTransform: 'uppercase',
              fontWeight: 600, marginBottom: 16,
            }}
          >Nasıl Çalışır?</motion.p>
          <h2 style={{
            fontFamily: F, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900,
            color: C.text, letterSpacing: '-0.02em', lineHeight: 1.15,
          }}>
            {['Siparişten', 'Teslimata,'].map((word, i) => (
              <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
                <motion.span
                  initial={{ y: '100%', rotateX: 40, opacity: 0 }}
                  whileInView={{ y: '0%', rotateX: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: 'inline-block', transformOrigin: 'bottom center' }}
                >{word}</motion.span>
                {'\u00A0'}
              </span>
            ))}
            <br />
            {['Kesintisiz', 'Akış'].map((word, i) => (
              <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
                <motion.span
                  initial={{ y: '100%', rotateX: 40, opacity: 0 }}
                  whileInView={{ y: '0%', rotateX: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.3 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: 'inline-block', transformOrigin: 'bottom center',
                    backgroundImage: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}
                >{word}</motion.span>
                {i === 0 && '\u00A0'}
              </span>
            ))}
          </h2>
        </motion.div>

        {/* Interactive Process */}
        <div style={{
          display: 'grid', gridTemplateColumns: '340px 1fr',
          gap: 48, alignItems: 'start',
        }}>
          {/* Left: Step list with scroll-linked SVG line */}
          <div ref={stepsContainerRef} style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
            {/* SVG path */}
            <ScrollPath containerRef={stepsContainerRef} />

            {steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = activeStep === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  onClick={() => setActiveStep(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 18px', borderRadius: 14, cursor: 'pointer',
                    background: isActive ? `${step.color}08` : 'transparent',
                    border: `1px solid ${isActive ? `${step.color}20` : 'transparent'}`,
                    transition: 'all 0.3s ease',
                    position: 'relative', zIndex: 1,
                  }}
                >
                  {/* Spring-bounce icon */}
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                    style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: isActive ? `${step.color}15` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? `${step.color}30` : 'rgba(255,255,255,0.05)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.3s, border-color 0.3s',
                    }}
                  >
                    <Icon size={18} color={isActive ? step.color : C.muted} strokeWidth={1.8} />
                  </motion.div>
                  <div>
                    <div style={{
                      fontFamily: F, fontSize: 14, fontWeight: 700,
                      color: isActive ? C.text : C.sub,
                      transition: 'color 0.3s ease',
                    }}>{step.title}</div>
                    <div style={{
                      fontFamily: FB, fontSize: 11.5, color: C.muted,
                      lineHeight: 1.4, marginTop: 2,
                    }}>{step.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right: Active step detail */}
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'rgba(255,255,255,0.02)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 24, padding: '48px 40px',
              position: 'relative', overflow: 'hidden', minHeight: 400,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}
          >
            {/* Glow */}
            <div style={{
              position: 'absolute', top: -80, right: -80,
              width: 300, height: 300, borderRadius: '50%',
              background: `radial-gradient(circle, ${steps[activeStep].color}15, transparent 65%)`,
              pointerEvents: 'none', mixBlendMode: 'screen',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Step number */}
              <span style={{
                fontFamily: F, fontSize: 80, fontWeight: 900,
                backgroundImage: `linear-gradient(180deg, ${steps[activeStep].color}20, transparent)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                position: 'absolute', top: -30, right: 0,
                lineHeight: 1, userSelect: 'none',
              }}>0{activeStep + 1}</span>

              {/* Icon with spring */}
              <motion.div
                key={`icon-${activeStep}`}
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: `${steps[activeStep].color}12`,
                  border: `1px solid ${steps[activeStep].color}25`,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 24, cursor: 'pointer',
                }}
              >
                {(() => {
                  const Icon = steps[activeStep].icon;
                  return <Icon size={26} color={steps[activeStep].color} strokeWidth={1.8} />;
                })()}
              </motion.div>

              {/* Title */}
              <h3 style={{
                fontFamily: F, fontSize: 28, fontWeight: 900,
                color: C.text, marginBottom: 16, letterSpacing: '-0.02em',
              }}>{steps[activeStep].title}</h3>

              {/* Description */}
              <p style={{
                fontFamily: FB, fontSize: 15, lineHeight: 1.8,
                color: C.sub, maxWidth: 460, marginBottom: 32,
              }}>{steps[activeStep].detail}</p>

              {/* Progress dots */}
              <div style={{ display: 'flex', gap: 8 }}>
                {steps.map((s, i) => (
                  <motion.div
                    key={i}
                    onClick={() => setActiveStep(i)}
                    whileHover={{ scale: 1.3 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    style={{
                      width: i === activeStep ? 32 : 8, height: 8,
                      borderRadius: 4, cursor: 'pointer',
                      background: i === activeStep ? steps[activeStep].color : 'rgba(255,255,255,0.08)',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <style>{`
          @media (max-width: 800px) {
            section > div > div:last-child {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
