import { useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

/* ═══════════════════════════════════════════════════════════════════════════
   GLASSMORPHISM TOKENS  (PROJE-HAFIZA.md altın kuralı)
   border:     1px solid rgba(255,255,255,0.06)
   box-shadow: inset 0 1px 0 rgba(255,255,255,0.1)
   ═══════════════════════════════════════════════════════════════════════════ */
const GLASS = {
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
};

/* ── Magnetic Button ───────────────────────────────────────────────────── */
function useMagnetic(strength = 0.3) {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const onMove = useCallback((e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setOffset({ x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength });
  }, [strength]);
  const onLeave = useCallback(() => setOffset({ x: 0, y: 0 }), []);
  return { ref, offset, onMove, onLeave };
}

function MagneticButton({ children, to, primary = false }) {
  const { ref, offset, onMove, onLeave } = useMagnetic(0.35);
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <motion.div
        ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
        animate={{ x: offset.x, y: offset.y }}
        transition={{ type: 'spring', stiffness: 220, damping: 18, mass: 0.6 }}
        whileTap={{ scale: 0.96 }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          fontFamily: FB, cursor: 'pointer', position: 'relative', overflow: 'hidden',
          ...(primary ? {
            background: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
            borderRadius: 14, padding: '18px 40px',
            fontWeight: 700, fontSize: 15, color: '#0C0800',
            boxShadow: `0 8px 40px rgba(232,145,74,0.35), inset 0 1px 0 rgba(255,255,255,0.25)`,
            animation: 'landing-breathe 4s ease-in-out infinite',
          } : {
            background: 'rgba(255,255,255,0.025)',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            ...GLASS,
            borderRadius: 14, padding: '18px 36px',
            fontWeight: 500, fontSize: 15, color: C.sub,
          }),
        }}
      >
        {primary && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)', animation: 'landing-glow-line 3s ease-in-out infinite' }} />}
        {children}
      </motion.div>
    </Link>
  );
}

/* ── Cinematic Word Reveal ─────────────────────────────────────────────── */
function CinematicText({ text, delay = 0, gradient = false }) {
  return (
    <span style={{ display: 'inline' }}>
      {text.split(' ').map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
          <motion.span
            initial={{ y: '115%', rotateX: 50, opacity: 0 }}
            animate={{ y: '0%', rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: delay + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'inline-block', transformOrigin: 'bottom center',
              ...(gradient ? { backgroundImage: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}),
            }}
          >{word}</motion.span>
          {'\u00A0'}
        </span>
      ))}
    </span>
  );
}

/* ── Color-Dodge Orbs ──────────────────────────────────────────────────── */
function Orb({ size, color, top, left, delay = 0, duration = 18, anim = 'landing-orb-drift' }) {
  return (
    <div style={{
      position: 'absolute', width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle, ${color}30, ${color}10 40%, transparent 65%)`,
      top, left, filter: 'blur(4px)',
      mixBlendMode: 'color-dodge',
      animation: `${anim} ${duration}s ease-in-out ${delay}s infinite`,
      willChange: 'transform', pointerEvents: 'none',
    }} />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DEVASA DASHBOARD MOCK-UP  —  "Show, Don't Tell"
   ═══════════════════════════════════════════════════════════════════════════ */
function DashboardMock() {
  /* KPI data */
  const kpis = [
    { label: 'Aktif Siparişler', val: '24', sub: '+3 bu hafta', color: C.cyan },
    { label: 'Üretimde', val: '12', sub: '4 aşamada', color: '#3DB88A' },
    { label: 'Sevk Bekleyen', val: '7', sub: '₺214K değer', color: '#3E7BD4' },
    { label: 'Aylık Ciro', val: '₺847K', sub: '↑ %12 artış', color: C.gold },
  ];

  /* Fake order rows */
  const orders = [
    { no: '#1042', musteri: 'Karaca Mobilya', durum: 'tamamlandi', renk: '#3DB88A', ilerleme: 100 },
    { no: '#1043', musteri: 'Demir Metal', durum: 'üretimde', renk: C.cyan, ilerleme: 68 },
    { no: '#1044', musteri: 'Yılmaz Atölye', durum: 'tedarik', renk: C.gold, ilerleme: 35 },
    { no: '#1045', musteri: 'Özkan Tekstil', durum: 'bekliyor', renk: C.sub, ilerleme: 10 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 70, rotateX: 12, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      transition={{ duration: 1.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: '1400px', width: '100%', maxWidth: 860, margin: '72px auto 0', position: 'relative' }}
    >
      {/* Outer glow */}
      <div style={{
        position: 'absolute', inset: -6,
        background: `linear-gradient(135deg, ${C.cyan}25, transparent 35%, ${C.gold}18, transparent 75%)`,
        borderRadius: 28, filter: 'blur(40px)', zIndex: 0,
      }} />

      {/* Main window */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(8,8,11,0.88)',
        backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
        ...GLASS,
        borderRadius: 22, overflow: 'hidden',
        boxShadow: `0 60px 140px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03), ${GLASS.boxShadow}`,
      }}>
        {/* ─ macOS title bar ─ */}
        <div style={{
          padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 8,
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(255,255,255,0.012)',
        }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#DC3C3C' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FBBF24' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#3DB88A' }} />
          <span style={{ marginLeft: 16, fontSize: 11, color: C.muted, fontFamily: FB, letterSpacing: 0.6 }}>
            Atölye OS — Dashboard
          </span>
        </div>

        <div style={{ display: 'flex' }}>
          {/* ─ Mini sidebar ─ */}
          <div style={{
            width: 52, borderRight: '1px solid rgba(255,255,255,0.04)',
            padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
            background: 'rgba(255,255,255,0.01)',
          }}>
            {['📊', '🏭', '📦', '🚚', '💰', '⚙️'].map((e, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: i === 0 ? 1 : 0.4, scale: 1 }}
                transition={{ delay: 1.4 + i * 0.06, duration: 0.4 }}
                style={{
                  width: 32, height: 32, borderRadius: 8, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i === 0 ? `${C.cyan}12` : 'transparent',
                  border: i === 0 ? `1px solid ${C.cyan}20` : '1px solid transparent',
                }}
              >{e}</motion.div>
            ))}
          </div>

          {/* ─ Content area ─ */}
          <div style={{ flex: 1, padding: '20px 24px 24px' }}>
            {/* KPI row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
              {kpis.map((k, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20, scale: 0.88 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 1.3 + i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    background: 'rgba(255,255,255,0.018)',
                    ...GLASS,
                    borderRadius: 14, padding: '16px 14px',
                  }}
                >
                  <div style={{ fontSize: 9.5, color: C.muted, fontFamily: FB, marginBottom: 8, letterSpacing: 0.3 }}>{k.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, fontFamily: F, color: k.color, letterSpacing: '-1px' }}>{k.val}</div>
                  <div style={{ fontSize: 9, color: `${k.color}90`, fontFamily: FB, marginTop: 6 }}>{k.sub}</div>
                </motion.div>
              ))}
            </div>

            {/* ─ Order list ─ */}
            <div style={{
              background: 'rgba(255,255,255,0.012)',
              ...GLASS,
              borderRadius: 14, overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '80px 1fr 100px 1fr',
                gap: 8, padding: '10px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                {['Sipariş', 'Müşteri', 'Durum', 'İlerleme'].map((h, i) => (
                  <div key={i} style={{ fontSize: 9, color: C.muted, fontFamily: FB, fontWeight: 600, letterSpacing: 0.5 }}>{h}</div>
                ))}
              </div>

              {/* Rows */}
              {orders.map((o, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.7 + i * 0.1, duration: 0.5 }}
                  style={{
                    display: 'grid', gridTemplateColumns: '80px 1fr 100px 1fr',
                    gap: 8, padding: '11px 16px', alignItems: 'center',
                    borderBottom: i < orders.length - 1 ? '1px solid rgba(255,255,255,0.025)' : 'none',
                    background: i === 0 ? `${o.renk}05` : 'transparent',
                  }}
                >
                  <span style={{ fontSize: 11.5, fontFamily: F, fontWeight: 700, color: o.renk }}>{o.no}</span>
                  <span style={{ fontSize: 11, fontFamily: FB, color: C.sub }}>{o.musteri}</span>
                  <span style={{
                    fontSize: 9.5, fontFamily: FB, fontWeight: 600,
                    color: o.renk, textTransform: 'uppercase', letterSpacing: 0.4,
                  }}>{o.durum}</span>
                  {/* Progress bar */}
                  <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${o.ilerleme}%` }}
                      transition={{ delay: 2.0 + i * 0.12, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        height: '100%', borderRadius: 3,
                        background: `linear-gradient(90deg, ${o.renk}80, ${o.renk})`,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ─ Mini chart ─ */}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <div style={{
                flex: 2,
                background: 'rgba(255,255,255,0.012)', ...GLASS,
                borderRadius: 14, height: 100, display: 'flex', alignItems: 'flex-end',
                padding: '12px 12px 10px', gap: 4, overflow: 'hidden',
              }}>
                {[35, 50, 42, 68, 55, 82, 45, 88, 60, 75, 92, 67, 85, 48, 78, 90, 58, 95].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 2.2 + i * 0.03, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      flex: 1, minWidth: 0, borderRadius: '3px 3px 0 0',
                      background: `linear-gradient(180deg, ${C.cyan}90, ${C.cyan}20)`,
                    }}
                  />
                ))}
              </div>
              <div style={{
                flex: 1,
                background: 'rgba(255,255,255,0.012)', ...GLASS,
                borderRadius: 14, padding: 14,
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}>
                <div style={{ fontSize: 9, color: C.muted, fontFamily: FB, marginBottom: 6 }}>Bu Hafta Üretim</div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5, duration: 0.6 }}
                  style={{ fontSize: 28, fontWeight: 900, fontFamily: F, color: '#3DB88A', letterSpacing: '-1px' }}
                >47</motion.div>
                <div style={{ fontSize: 9, color: '#3DB88A90', fontFamily: FB, marginTop: 4 }}>↑ 12 geçen haftaya göre</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════════════════════════ */
export default function HeroSection() {
  return (
    <section style={{
      position: 'relative', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '140px 24px 100px', overflow: 'hidden',
      isolation: 'isolate',
    }}>
      {/* ─ Color-Dodge Orbs ─ */}
      <Orb size={750} color={C.cyan} top="-18%" left="-10%" duration={20} anim="landing-orb-drift" />
      <Orb size={600} color={C.lav}  top="12%" left="62%" delay={2} duration={24} anim="landing-orb-drift-2" />
      <Orb size={550} color={C.gold} top="52%" left="2%"  delay={4} duration={22} anim="landing-orb-drift-3" />
      <Orb size={450} color={C.sky}  top="-5%" left="42%" delay={1} duration={18} anim="landing-orb-drift" />
      <Orb size={350} color="#DC3C3C" top="38%" left="78%" delay={3} duration={26} anim="landing-orb-drift-3" />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 85% 60% at 50% 38%, transparent 0%, ${C.bg}ee 65%, ${C.bg} 100%)`,
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Film grain */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.025,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '128px', pointerEvents: 'none', zIndex: 1,
      }} />

      {/* ─ Content ─ */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 880 }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(232,145,74,0.05)',
            border: '1px solid rgba(232,145,74,0.12)',
            borderRadius: 100, padding: '9px 22px 9px 15px',
            marginBottom: 40, fontSize: 13, fontFamily: FB, color: C.cyan, fontWeight: 500,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.cyan, animation: 'pulse-dot 2s ease-in-out infinite' }} />
          Excel Tablolarına Son — Dijital Atölye Çağı
        </motion.div>

        {/* ── Cinematic heading ── */}
        <h1 style={{
          fontFamily: F,
          fontSize: 'clamp(40px, 7vw, 80px)',
          fontWeight: 900,
          lineHeight: 1.02,
          letterSpacing: '-2px',               /* ALTIN KURAL */
          color: C.text,
          marginBottom: 32,
          perspective: '600px',
        }}>
          <CinematicText text="Siparişi Girin," delay={0.15} />
          <br />
          <CinematicText text="Üretim Hızına" delay={0.5} gradient />
          {' '}
          <CinematicText text="Hükmedin" delay={0.75} gradient />
        </h1>

        {/* Subtitle — B2B pain-point */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: FB, fontSize: 'clamp(16px, 2.2vw, 20px)', lineHeight: 1.75,
            color: C.sub, maxWidth: 580, margin: '0 auto 52px', fontWeight: 400,
          }}
        >
          WhatsApp gruplarından, dağınık Excel tablolarından ve kağıt
          üretim emirlerinden kurtulun. Malzeme ihtiyacından teslimata —
          tüm atölye tek ekranda.
        </motion.p>

        {/* ── Magnetic CTAs ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <MagneticButton to="/register" primary>
            <span style={{ position: 'relative', zIndex: 1 }}>Hemen Ücretsiz Başla</span>
            <ArrowRight size={16} style={{ position: 'relative', zIndex: 1 }} />
          </MagneticButton>
          <MagneticButton to="/login">
            <Play size={14} />
            <span>Demoyu İncele</span>
          </MagneticButton>
        </motion.div>
      </div>

      {/* ── Dashboard Mock ── */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 960 }}>
        <DashboardMock />
      </div>

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 220,
        background: `linear-gradient(transparent, ${C.bg})`,
        pointerEvents: 'none', zIndex: 3,
      }} />
    </section>
  );
}
