import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart, ClipboardCheck, Factory, Package,
  Truck, CheckCircle, ArrowRight
} from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

const steps = [
  {
    icon: ShoppingCart,
    title: 'Sipariş Alın',
    desc: 'Müşterinizden gelen siparişi sisteme girin. Çoklu kalem, alt müşteri ve termin desteği.',
    color: C.cyan,
    detail: 'Sipariş girişi ile stok analizi otomatik yapılır. Stokta yeterli ürün varsa direkt sevkiyata hazır.',
  },
  {
    icon: ClipboardCheck,
    title: 'Stok Analizi',
    desc: 'Sistem, mevcut stoğunuzu kontrol eder. Eksik malzemeleri otomatik hesaplar.',
    color: '#3E7BD4',
    detail: 'BOM reçetesi üzerinden rekürsif malzeme patlatma. Her ham madde ve yarı mamül kontrol edilir.',
  },
  {
    icon: Factory,
    title: 'Üretime Gönder',
    desc: 'Tek tıkla toplu üretim emirleri oluşturun. Aşamalar, süreler ve sorumlular otomatik atanır.',
    color: '#3DB88A',
    detail: 'Kanban tahtasında aşama takibi, canlı zamanlayıcılar ve iş günlüğü ile tam kontrol.',
  },
  {
    icon: Package,
    title: 'Tedarik Et',
    desc: 'Eksik malzemeler için tedarik siparişleri oluşturun. Tedarikçi, nakliye ve fason yönetimi.',
    color: C.gold,
    detail: 'Toplu, ürün bazlı veya sipariş bazlı görünümlerle tedarik sürecini izleyin.',
  },
  {
    icon: Truck,
    title: 'Sevk Et',
    desc: 'Üretim tamamlandığında sevkiyat emri oluşturun. Nakliye ve teslimat takibi.',
    color: '#D46B2A',
    detail: 'Stok hareketleri otomatik güncellenir. Fatura ve irsaliye bilgileri kaydedilir.',
  },
  {
    icon: CheckCircle,
    title: 'Tamamla',
    desc: 'Sipariş teslim edildi. Maliyet analizi ve kar/marj raporlarınız hazır.',
    color: '#3DB88A',
    detail: 'Siparişten teslimata kadar tüm süreç tek ekrandan izlenebilir ve raporlanabilir.',
  },
];

export default function InteractiveShowcase() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section style={{
      padding: '120px 24px',
      background: `linear-gradient(180deg, ${C.bg}, ${C.s1} 30%, ${C.s1} 70%, ${C.bg})`,
      position: 'relative',
    }}>
      {/* Background orb */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.cyan}08, transparent 70%)`,
        top: '20%', left: '60%', pointerEvents: 'none',
        animation: 'landing-orb-drift-2 20s ease-in-out infinite',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: 72 }}
        >
          <p style={{
            fontSize: 12, fontFamily: FB, color: C.cyan,
            letterSpacing: '2.5px', textTransform: 'uppercase',
            fontWeight: 600, marginBottom: 16,
          }}>Nasıl Çalışır?</p>
          <h2 style={{
            fontFamily: F, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900,
            color: C.text, letterSpacing: '-0.02em', lineHeight: 1.15,
          }}>
            Siparişten Teslimata,{' '}
            <span style={{
              backgroundImage: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Kesintisiz Akış</span>
          </h2>
        </motion.div>

        {/* Interactive Process */}
        <div style={{
          display: 'grid', gridTemplateColumns: '320px 1fr',
          gap: 48, alignItems: 'start',
        }}>
          {/* Left: Step list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: isActive ? `${step.color}15` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? `${step.color}30` : 'rgba(255,255,255,0.05)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s ease',
                  }}>
                    <Icon size={18} color={isActive ? step.color : C.muted} strokeWidth={1.8} />
                  </div>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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
              width: 250, height: 250, borderRadius: '50%',
              background: `radial-gradient(circle, ${steps[activeStep].color}12, transparent 70%)`,
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Step number */}
              <span style={{
                fontFamily: F, fontSize: 64, fontWeight: 900,
                color: `${steps[activeStep].color}15`,
                position: 'absolute', top: -20, right: 0,
                lineHeight: 1,
              }}>0{activeStep + 1}</span>

              {/* Icon */}
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: `${steps[activeStep].color}12`,
                border: `1px solid ${steps[activeStep].color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 24,
              }}>
                {(() => {
                  const Icon = steps[activeStep].icon;
                  return <Icon size={26} color={steps[activeStep].color} strokeWidth={1.8} />;
                })()}
              </div>

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
                  <div
                    key={i}
                    onClick={() => setActiveStep(i)}
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

        {/* Responsive */}
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
