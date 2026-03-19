import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList, Factory, TrendingUp, Package,
  Truck, Users, BarChart3
} from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

const features = [
  {
    icon: ClipboardList, title: 'Sipariş Yönetimi',
    desc: 'Çoklu kalem desteği, stok analizi, otomatik üretim emri oluşturma. Her siparişin nerede olduğunu anlık takip edin.',
    color: C.cyan, span: 'wide',
  },
  {
    icon: Factory, title: 'Üretim Takip',
    desc: 'Kanban tahtası, aşama yönetimi, canlı zamanlayıcılar ve iş günlüğü. Üretim hattınızı uçtan uca görün.',
    color: '#3DB88A', span: 'tall',
  },
  {
    icon: Package, title: 'Stok & Depo',
    desc: 'Ham madde, yarı mamül, ürün ve hizmet stokları. Otomatik rezervasyon ve minimum stok uyarıları.',
    color: '#3E7BD4', span: 'normal',
  },
  {
    icon: TrendingUp, title: 'Maliyet Analizi',
    desc: 'Rekürsif BOM maliyet hesabı, KDV dahil birim fiyat, kar marjı analizi. Her ürünün gerçek maliyetini bilin.',
    color: C.gold, span: 'normal',
  },
  {
    icon: Truck, title: 'Tedarik Zinciri',
    desc: 'Tedarikçi yönetimi, sipariş takibi, nakliye kaydı, otomatik stok girişi. Teslimattan depoya kesintisiz akış.',
    color: '#D46B2A', span: 'normal',
  },
  {
    icon: Users, title: 'Fason Takip',
    desc: 'Dış kaynak üretim süreçlerinizi firma bazlı izleyin. Gönderim, dönüş ve maliyet takibi tek ekranda.',
    color: C.lav, span: 'normal',
  },
  {
    icon: BarChart3, title: 'Dashboard',
    desc: 'Anlık KPI\'lar, stok uyarıları, çalışan durumları, geciken siparişler — tüm atölye bir bakışta.',
    color: '#22D3EE', span: 'wide',
  },
];

/* ── Cursor Spotlight + Animated Border Card ───────────────────────────────── */
function BentoCard({ feature, index }) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const Icon = feature.icon;

  const isWide = feature.span === 'wide';
  const isTall = feature.span === 'tall';

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  /* Unique animation ID for the border */
  const borderId = `bento-border-${index}`;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMousePos({ x: 0, y: 0 }); }}
      style={{
        gridColumn: isWide ? 'span 2' : 'span 1',
        gridRow: isTall ? 'span 2' : 'span 1',
        position: 'relative',
        borderRadius: 20,
        padding: 1, /* space for animated border */
        cursor: 'default',
        overflow: 'hidden',
      }}
    >
      {/* ── ANIMATED BORDER GLOW ── */}
      {/* This is the outer wrapper that creates the border animation */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 20, overflow: 'hidden',
        opacity: hovered ? 1 : 0.3,
        transition: 'opacity 0.5s ease',
      }}>
        {/* Rotating conic gradient border */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: '200%', height: '200%',
          transform: 'translate(-50%,-50%)',
          background: `conic-gradient(from 0deg, transparent, ${feature.color}50, transparent, ${feature.color}30, transparent)`,
          animation: `landing-border-rotate 4s linear infinite`,
        }} />
      </div>

      {/* ── CURSOR SPOTLIGHT ── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 20,
        background: hovered
          ? `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, ${feature.color}12, transparent 40%)`
          : 'none',
        pointerEvents: 'none', zIndex: 1,
        transition: 'opacity 0.3s ease',
      }} />

      {/* ── INNER CARD CONTENT ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        background: hovered ? 'rgba(8,8,12,0.92)' : 'rgba(8,8,12,0.88)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 19,
        padding: isTall ? '36px 32px' : '32px 28px',
        height: '100%',
        transition: 'background 0.4s ease',
      }}>
        {/* Corner glow on hover */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 220, height: 220, borderRadius: '50%',
          background: `radial-gradient(circle, ${feature.color}${hovered ? '18' : '05'}, transparent 70%)`,
          transition: 'all 0.5s ease',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Icon with spring bounce */}
          <motion.div
            whileHover={{ scale: 1.15, rotate: 3 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            style={{
              width: 48, height: 48, borderRadius: 14,
              background: `${feature.color}10`,
              border: `1px solid ${feature.color}20`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20, cursor: 'pointer',
            }}
          >
            <Icon size={22} color={feature.color} strokeWidth={1.8} />
          </motion.div>

          {/* Title */}
          <h3 style={{
            fontFamily: F, fontSize: 18, fontWeight: 800,
            color: C.text, marginBottom: 10, letterSpacing: '-0.01em',
          }}>{feature.title}</h3>

          {/* Description */}
          <p style={{
            fontFamily: FB, fontSize: 14, lineHeight: 1.7,
            color: C.sub, maxWidth: isWide ? 500 : 320,
          }}>{feature.desc}</p>

          {isTall && (
            <div style={{ marginTop: 28 }}>
              {['Hammadde Girişi', 'Kesim', 'Montaj', 'Boya', 'Paketleme'].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', marginBottom: 6,
                    background: i === 2 ? `${feature.color}10` : 'rgba(255,255,255,0.02)',
                    borderRadius: 10,
                    border: i === 2 ? `1px solid ${feature.color}25` : '1px solid transparent',
                  }}
                >
                  {/* Icon with spring bounce */}
                  <motion.div
                    whileHover={{ scale: 1.3 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: i < 2 ? '#3DB88A' : i === 2 ? feature.color : 'rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{
                    fontFamily: FB, fontSize: 12.5, color: i === 2 ? C.text : C.sub,
                    fontWeight: i === 2 ? 600 : 400,
                  }}>{step}</span>
                  {i < 2 && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#3DB88A' }}>✓</span>}
                  {i === 2 && (
                    <span style={{
                      marginLeft: 'auto', fontSize: 10, color: feature.color,
                      animation: 'pulse-dot 2s infinite',
                    }}>●</span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Cinematic Section Title ───────────────────────────────────────────────── */
function CinematicTitle({ words, gradientWords = [], delay = 0 }) {
  return (
    <>
      {words.map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
          <motion.span
            initial={{ y: '100%', rotateX: 40, opacity: 0 }}
            whileInView={{ y: '0%', rotateX: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: delay + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'inline-block',
              transformOrigin: 'bottom center',
              ...(gradientWords.includes(word) ? {
                backgroundImage: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              } : {}),
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </>
  );
}

export default function FeaturesBento() {
  return (
    <section style={{
      padding: '120px 24px', maxWidth: 1100, margin: '0 auto',
    }}>
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: 64, perspective: '600px' }}
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
        >Modüller</motion.p>
        <h2 style={{
          fontFamily: F, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900,
          color: C.text, letterSpacing: '-0.02em', lineHeight: 1.15,
          marginBottom: 16,
        }}>
          <CinematicTitle
            words={['Her', 'Şey', 'Tek', 'Platformda,', 'Sıfır', 'Karmaşa']}
            gradientWords={['Sıfır', 'Karmaşa']}
            delay={0.1}
          />
        </h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5 }}
          style={{
            fontFamily: FB, fontSize: 16, color: C.sub, lineHeight: 1.7,
            maxWidth: 520, margin: '0 auto',
          }}
        >
          Sipariş girişinden maliyet analizine, stok takibinden fason yönetimine —
          atölyenizin ihtiyaç duyduğu her modül entegre çalışır.
        </motion.p>
      </motion.div>

      {/* Bento Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 4,
      }}>
        {features.map((f, i) => (
          <BentoCard key={i} feature={f} index={i} />
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          section > div:last-of-type {
            grid-template-columns: 1fr !important;
          }
          section > div:last-of-type > div {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
        }
      `}</style>
    </section>
  );
}
