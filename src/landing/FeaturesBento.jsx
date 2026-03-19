import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList, Factory, TrendingUp, Package,
  Truck, Users, BarChart3
} from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

/* ═══ GLASSMORPHISM TOKENS ═══ */
const GLASS = {
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
};

const features = [
  {
    icon: ClipboardList, title: 'Sipariş Yönetimi',
    desc: 'Telefonu bırakın, siparişi girin. Çoklu kalem, termin ve stok analizi — müşterinize "ne zaman teslim?" sorusuna anında cevap verin.',
    color: C.cyan, span: 'wide',
  },
  {
    icon: Factory, title: 'Üretim Takip',
    desc: 'Kanban tahtasında hangi iş hangi aşamada, canlı zamanlayıcılarla kim ne kadar çalışmış — üretim hattınız artık görünür.',
    color: '#3DB88A', span: 'tall',
  },
  {
    icon: Package, title: 'Stok & Depo',
    desc: 'Ham madde bitmeden alarm, yarı mamül rezervasyonu, minimum stok uyarıları. Depo artık sürpriz yapmaz.',
    color: '#3E7BD4', span: 'normal',
  },
  {
    icon: TrendingUp, title: 'Maliyet Kartı',
    desc: 'Hangi ürün kârlı, hangisi zararda? Rekürsif BOM maliyet hesabı ile gerçek marjınızı bilin, fiyatlarınızı düzeltin.',
    color: C.gold, span: 'normal',
  },
  {
    icon: Truck, title: 'Tedarik Zinciri',
    desc: 'Eksik malzeme tespit edildi, tedarikçiye sipariş açıldı, nakliye takibi yapıldı, depoya girdi — tek akışta.',
    color: '#D46B2A', span: 'normal',
  },
  {
    icon: Users, title: 'Fason Takip',
    desc: 'Boyacıdaki parçalar, kaynak atölyesindeki profiller — dışarı gönderdiğiniz her iş firma bazlı izlenir.',
    color: C.lav, span: 'normal',
  },
  {
    icon: BarChart3, title: 'Dashboard',
    desc: 'Sabah bir kahveyle açın: geciken sipariş, kritik stok, bugünkü iş emirleri — atölyeniz bir bakışta.',
    color: '#22D3EE', span: 'wide',
  },
];

/* ── Cursor Spotlight + Animated Border Card ───────────────────────────── */
function BentoCard({ feature, index }) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const Icon = feature.icon;
  const isWide = feature.span === 'wide';
  const isTall = feature.span === 'tall';

  const onMove = useCallback((e) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMousePos({ x: 0, y: 0 }); }}
      style={{
        gridColumn: isWide ? 'span 2' : 'span 1',
        gridRow: isTall ? 'span 2' : 'span 1',
        position: 'relative', borderRadius: 22,
        padding: 1, cursor: 'default', overflow: 'hidden',
      }}
    >
      {/* ── ROTATING CONIC BORDER ── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 22, overflow: 'hidden',
        opacity: hovered ? 1 : 0.25, transition: 'opacity 0.6s ease',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: '200%', height: '200%',
          background: `conic-gradient(from 0deg, transparent, ${feature.color}45, transparent, ${feature.color}25, transparent)`,
          animation: 'landing-border-rotate 5s linear infinite',
        }} />
      </div>

      {/* ── CURSOR SPOTLIGHT ── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 22,
        background: hovered
          ? `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, ${feature.color}10, transparent 40%)`
          : 'none',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* ── INNER CONTENT ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        background: hovered ? 'rgba(6,6,8,0.94)' : 'rgba(6,6,8,0.90)',
        backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
        borderRadius: 21,
        padding: isTall ? '44px 36px' : '40px 32px',
        height: '100%',
        transition: 'background 0.4s ease',
        boxShadow: GLASS.boxShadow,
      }}>
        {/* Corner ambient */}
        <div style={{
          position: 'absolute', top: -90, right: -90,
          width: 240, height: 240, borderRadius: '50%',
          background: `radial-gradient(circle, ${feature.color}${hovered ? '16' : '04'}, transparent 65%)`,
          transition: 'all 0.6s ease', pointerEvents: 'none',
          mixBlendMode: 'color-dodge',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Spring-bounce icon */}
          <motion.div
            whileHover={{ scale: 1.18, rotate: 4 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            style={{
              width: 52, height: 52, borderRadius: 16,
              background: `${feature.color}0A`,
              ...GLASS,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 24, cursor: 'pointer',
            }}
          >
            <Icon size={23} color={feature.color} strokeWidth={1.7} />
          </motion.div>

          <h3 style={{
            fontFamily: F, fontSize: 19, fontWeight: 800,
            color: C.text, marginBottom: 12,
            letterSpacing: '-1px',              /* ALTIN KURAL */
          }}>{feature.title}</h3>

          <p style={{
            fontFamily: FB, fontSize: 14, lineHeight: 1.75,
            color: C.sub, maxWidth: isWide ? 520 : 340,
          }}>{feature.desc}</p>

          {/* Tall card: mini workflow */}
          {isTall && (
            <div style={{ marginTop: 32 }}>
              {['Hammadde Girişi', 'Kesim', 'Montaj', 'Boya', 'Paketleme'].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 16px', marginBottom: 6,
                    background: i === 2 ? `${feature.color}08` : 'rgba(255,255,255,0.015)',
                    borderRadius: 11,
                    border: i === 2 ? `1px solid ${feature.color}20` : '1px solid transparent',
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.4 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 14 }}
                    style={{
                      width: 8, height: 8, borderRadius: '50%', cursor: 'pointer',
                      background: i < 2 ? '#3DB88A' : i === 2 ? feature.color : 'rgba(255,255,255,0.08)',
                    }}
                  />
                  <span style={{
                    fontFamily: FB, fontSize: 12.5,
                    color: i === 2 ? C.text : C.sub,
                    fontWeight: i === 2 ? 600 : 400,
                  }}>{step}</span>
                  {i < 2 && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#3DB88A' }}>✓</span>}
                  {i === 2 && <span style={{ marginLeft: 'auto', fontSize: 10, color: feature.color, animation: 'pulse-dot 2s infinite' }}>●</span>}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Cinematic Section Title ── */
function CTitle({ words, glow = [], delay = 0 }) {
  return words.map((w, i) => (
    <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
      <motion.span
        initial={{ y: '105%', rotateX: 45, opacity: 0 }}
        whileInView={{ y: '0%', rotateX: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: delay + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: 'inline-block', transformOrigin: 'bottom center',
          ...(glow.includes(w) ? { backgroundImage: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}),
        }}
      >{w}</motion.span>
      {i < words.length - 1 && '\u00A0'}
    </span>
  ));
}

export default function FeaturesBento() {
  return (
    <section style={{ padding: '160px 24px', maxWidth: 1140, margin: '0 auto' }}>
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: 80, perspective: '600px' }}
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            fontSize: 12, fontFamily: FB, color: C.cyan,
            letterSpacing: '3px', textTransform: 'uppercase',
            fontWeight: 600, marginBottom: 20,
          }}
        >Modüller</motion.p>
        <h2 style={{
          fontFamily: F, fontSize: 'clamp(30px, 4.5vw, 48px)', fontWeight: 900,
          color: C.text, letterSpacing: '-2px', lineHeight: 1.1,
          marginBottom: 20,
        }}>
          <CTitle words={['Her', 'Şey', 'Tek', 'Platformda,', 'Sıfır', 'Karmaşa']} glow={['Sıfır', 'Karmaşa']} delay={0.1} />
        </h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5 }}
          style={{ fontFamily: FB, fontSize: 16, color: C.sub, lineHeight: 1.75, maxWidth: 540, margin: '0 auto' }}
        >
          Sipariş girişinden maliyet analizine, stok takibinden fason yönetimine —
          atölyenizin ihtiyaç duyduğu her modül entegre çalışır.
        </motion.p>
      </motion.div>

      {/* ── Bento Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
        {features.map((f, i) => <BentoCard key={i} feature={f} index={i} />)}
      </div>

      <style>{`
        @media (max-width: 900px) {
          section > div:last-of-type { grid-template-columns: 1fr !important; }
          section > div:last-of-type > div { grid-column: span 1 !important; grid-row: span 1 !important; }
        }
      `}</style>
    </section>
  );
}
