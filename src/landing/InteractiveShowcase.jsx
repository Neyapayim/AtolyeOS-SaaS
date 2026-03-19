import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, AlertTriangle, Factory, ScanBarcode,
  CheckCircle, Clock, Package, Truck
} from 'lucide-react';
import { C, F, FB, GLASS } from '../config/constants.js';

/* ══════════════════════════════════════════════════════════════════════════════
   4 AŞAMA VERİLERİ
   ══════════════════════════════════════════════════════════════════════════════ */
const steps = [
  {
    num: '01',
    title: '1 Tıkla Siparişi Alın',
    sub: 'Kanepeler, Masalar ve Teslimat Tarihleri',
    desc: 'Müşteri aradığında siparişi saniyeler içinde girin. Çoklu kalem, alt müşteri, termin tarihi — hepsi tek formda. Stok analizi otomatik başlar.',
  },
  {
    num: '02',
    title: 'Malzeme İhtiyacını Anında Görün',
    sub: 'Stokları Tüketen ve Otomatik Hesaplayan Zeka',
    desc: 'BOM reçetesi üzerinden rekürsif malzeme patlatma. Hangi ham madde eksik, ne kadar lazım — saniyeler içinde belli. Tedarikçiye tek tıkla sipariş.',
  },
  {
    num: '03',
    title: 'Üretim Hattını Ateşleyin',
    sub: 'İstasyonlar, CNC, Döşeme ve Operatör Barları',
    desc: 'Kanban tahtasında aşama takibi, canlı zamanlayıcılar, iş günlüğü. Hangi istasyon ne yapıyor, kim ne kadar çalışmış — hepsi görünür.',
  },
  {
    num: '04',
    title: 'Barkodu Okutun, Sevk Edin',
    sub: 'İrsaliye ve Teslimat Raporları',
    desc: 'Üretim tamamlandı, sevkiyat emri oluşturuldu, nakliye takibi başladı. Stok hareketleri otomatik güncellenir. Teslim edildi damgası.',
  },
];

/* ══════════════════════════════════════════════════════════════════════════════
   AŞAMA MOCK-UP'LARI (Sağ panel içeriği)
   ══════════════════════════════════════════════════════════════════════════════ */

/* ── Aşama 1: Gelen Siparişler Tablosu ── */
function MockOrders() {
  const rows = [
    { no: '#1042', musteri: 'Karaca Mobilya', urun: '3\'lü Kanepe Seti', durum: 'Onaylandı', color: '#3DB88A' },
    { no: '#1043', musteri: 'Demir Metal', urun: 'Endüstriyel Raf (x24)', durum: 'Bekliyor', color: C.cyan },
    { no: '#1044', musteri: 'Yılmaz Atölye', urun: 'Yemek Masası Takımı', durum: 'Acil', color: '#DC3C3C' },
    { no: '#1045', musteri: 'Özkan Tekstil', urun: 'Ofis Koltuğu (x40)', durum: 'Onaylandı', color: '#3DB88A' },
    { no: '#1046', musteri: 'Atlas Dekor', urun: 'Sehpa + TV Ünitesi', durum: 'Bekliyor', color: C.cyan },
  ];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <ShoppingCart size={16} color={C.cyan} />
        <span style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: '-0.5px' }}>Gelen Siparişler</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: FB, color: C.muted }}>Bugün · 5 yeni</span>
      </div>
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 1fr 80px', gap: 8, padding: '8px 14px', background: 'rgba(255,255,255,0.015)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          {['No', 'Müşteri', 'Ürün', 'Durum'].map(h => (
            <span key={h} style={{ fontSize: 9, color: C.muted, fontFamily: FB, fontWeight: 600 }}>{h}</span>
          ))}
        </div>
        {rows.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            style={{
              display: 'grid', gridTemplateColumns: '64px 1fr 1fr 80px', gap: 8,
              padding: '10px 14px', alignItems: 'center',
              borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.025)' : 'none',
            }}
          >
            <span style={{ fontSize: 11, fontFamily: F, fontWeight: 700, color: C.sub }}>{r.no}</span>
            <span style={{ fontSize: 10.5, fontFamily: FB, color: C.sub }}>{r.musteri}</span>
            <span style={{ fontSize: 10.5, fontFamily: FB, color: C.muted }}>{r.urun}</span>
            <span style={{
              fontSize: 9, fontFamily: FB, fontWeight: 600, color: r.color,
              background: `${r.color}12`, borderRadius: 6, padding: '3px 8px', textAlign: 'center',
            }}>{r.durum}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Aşama 2: Stok Uyarı ve Tedarik Listesi ── */
function MockStockAlert() {
  const alerts = [
    { madde: 'Sünger 30D (Levha)', stok: '2 adet', ihtiyac: '18 adet', acil: true },
    { madde: 'Kumaş Keten Gri', stok: '4.2 mt', ihtiyac: '28 mt', acil: true },
    { madde: 'Profil 40x20 HR', stok: '12 boy', ihtiyac: '48 boy', acil: false },
    { madde: 'Cila Vernik (Lt)', stok: '3 lt', ihtiyac: '8 lt', acil: false },
  ];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <AlertTriangle size={16} color="#DC3C3C" />
        <span style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: '-0.5px' }}>Stok Uyarıları</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: FB, background: '#DC3C3C20', color: '#DC3C3C', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>4 eksik</span>
      </div>
      {alerts.map((a, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', marginBottom: 6, borderRadius: 10,
            background: a.acil ? 'rgba(220,60,60,0.04)' : 'rgba(255,255,255,0.015)',
            border: a.acil ? '1px solid rgba(220,60,60,0.12)' : '1px solid rgba(255,255,255,0.03)',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, fontFamily: FB, fontWeight: 600, color: C.text }}>{a.madde}</div>
            <div style={{ fontSize: 9.5, fontFamily: FB, color: C.muted, marginTop: 2 }}>Stok: {a.stok} → İhtiyaç: {a.ihtiyac}</div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              fontSize: 9, fontFamily: FB, fontWeight: 600,
              background: `${C.cyan}15`, color: C.cyan, borderRadius: 7,
              padding: '5px 12px', cursor: 'pointer',
            }}
          >Tedarik Et</motion.div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Aşama 3: Üretim İstasyon Raporu ── */
function MockProduction() {
  const stations = [
    { name: 'Kesim Masası', operator: 'Fatma H.', pct: 100, color: '#3DB88A' },
    { name: 'Döşeme Tezgahı', operator: 'Ahmet Usta', pct: 62, color: C.cyan },
    { name: 'Montaj İstasyonu', operator: 'Mehmet', pct: 35, color: C.gold },
    { name: 'Statik Boya (Fason)', operator: 'Dış Kaynak', pct: 80, color: C.lav },
    { name: 'Paketleme', operator: 'Mehmet', pct: 0, color: C.muted },
  ];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Factory size={16} color={C.cyan} />
        <span style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: '-0.5px' }}>Üretim Hattı — UE #1042</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: FB, color: '#3DB88A' }}>●  Aktif</span>
      </div>
      {stations.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.09, duration: 0.4 }}
          style={{ marginBottom: 12 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, fontFamily: FB, fontWeight: 600, color: C.text }}>{s.name}</span>
            <span style={{ fontSize: 10, fontFamily: FB, color: C.muted }}>{s.operator} · %{s.pct}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${s.pct}%` }}
              transition={{ delay: 0.3 + i * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${s.color}80, ${s.color})` }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Aşama 4: Sevkiyat / Teslim Edildi ── */
function MockShipment() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{
          width: 80, height: 80, borderRadius: 24,
          background: `linear-gradient(135deg, #3DB88A15, #3DB88A08)`,
          border: '1px solid rgba(61,184,138,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <ScanBarcode size={36} color="#3DB88A" strokeWidth={1.5} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{
          fontFamily: F, fontSize: 22, fontWeight: 900, color: '#3DB88A',
          letterSpacing: '-1px', marginBottom: 8,
        }}>Teslim Edildi ✓</div>
        <div style={{ fontFamily: FB, fontSize: 12, color: C.sub, marginBottom: 20 }}>Sipariş #1042 · Karaca Mobilya · 3'lü Kanepe Seti</div>
      </motion.div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, width: '100%', maxWidth: 320,
      }}>
        {[
          { label: 'İrsaliye', val: '#IRN-4821' },
          { label: 'Nakliyeci', val: 'Aras Kargo' },
          { label: 'Kâr Marjı', val: '%28.4' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
            style={{
              background: 'rgba(255,255,255,0.02)', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.04)',
              padding: '10px 12px', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 9, color: C.muted, fontFamily: FB, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: C.text, fontFamily: F, fontWeight: 700 }}>{item.val}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const mockComponents = [MockOrders, MockStockAlert, MockProduction, MockShipment];

/* ══════════════════════════════════════════════════════════════════════════════
   SCROLL-MASKED STICKY SHOWCASE
   ══════════════════════════════════════════════════════════════════════════════ */
export default function InteractiveShowcase() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  /* 0→1 scroll → 0,1,2,3 step index */
  const stepIndex = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0, 0, 1, 2, 3]);

  return (
    <section
      ref={containerRef}
      style={{ height: '400vh', position: 'relative' }}
    >
      {/* ── STICKY VIEWPORT ── */}
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        background: C.bg,
      }}>
        {/* Ambient glow behind screen */}
        <div style={{
          position: 'absolute', top: '50%', left: '60%',
          transform: 'translate(-50%,-50%)',
          width: 700, height: 500, borderRadius: '50%',
          background: `radial-gradient(ellipse, ${C.cyan}0A, transparent 60%)`,
          pointerEvents: 'none', mixBlendMode: 'color-dodge',
        }} />
        <div style={{
          position: 'absolute', top: '30%', left: '30%',
          width: 400, height: 400, borderRadius: '50%',
          background: `radial-gradient(ellipse, ${C.gold}08, transparent 60%)`,
          pointerEvents: 'none', mixBlendMode: 'color-dodge',
        }} />

        <div style={{
          maxWidth: 1140, width: '100%', margin: '0 auto', padding: '0 24px',
          display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 64,
          alignItems: 'center', position: 'relative', zIndex: 1,
        }}>
          {/* ════ SOL: Hikaye / Metin ════ */}
          <div>
            {/* Section label */}
            <motion.p
              style={{ opacity: useTransform(scrollYProgress, [0, 0.05], [0, 1]) }}
            >
              <span style={{
                fontSize: 12, fontFamily: FB, color: C.cyan,
                letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600,
              }}>Nasıl Çalışır?</span>
            </motion.p>

            <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 28 }}>
              {steps.map((s, i) => (
                <StepText key={i} step={s} index={i} scrollProgress={scrollYProgress} />
              ))}
            </div>
          </div>

          {/* ════ SAĞ: Sinematik Mock-up Ekranı ════ */}
          <div style={{ position: 'relative' }}>
            {/* Outer glow */}
            <motion.div style={{
              position: 'absolute', inset: -8,
              background: `linear-gradient(135deg, ${C.cyan}18, transparent 40%, ${C.gold}12, transparent 75%)`,
              borderRadius: 28, filter: 'blur(30px)',
              opacity: useTransform(scrollYProgress, [0, 0.08], [0, 1]),
            }} />

            {/* The screen */}
            <motion.div
              style={{
                position: 'relative',
                background: 'rgba(8,8,11,0.9)',
                backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: `0 50px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)`,
                borderRadius: 22, overflow: 'hidden',
                opacity: useTransform(scrollYProgress, [0, 0.08], [0, 1]),
                scale: useTransform(scrollYProgress, [0, 0.08], [0.95, 1]),
              }}
            >
              {/* Top bar */}
              <div style={{
                padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 7,
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: 'rgba(255,255,255,0.012)',
              }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#DC3C3C', opacity: 0.7 }} />
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#FBBF24', opacity: 0.7 }} />
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#3DB88A', opacity: 0.7 }} />
                <span style={{ marginLeft: 12, fontSize: 10.5, color: C.muted, fontFamily: FB }}>Atölye OS</span>
              </div>

              {/* Content area */}
              <div style={{ padding: '24px 28px', minHeight: 380 }}>
                <MockContent scrollProgress={scrollYProgress} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Step Text with scroll-driven opacity ── */
function StepText({ step, index, scrollProgress }) {
  const ranges = [
    [0.00, 0.10, 0.22],
    [0.22, 0.30, 0.47],
    [0.47, 0.55, 0.72],
    [0.72, 0.78, 1.00],
  ];
  const [fadeIn, peak, fadeOut] = ranges[index];

  const opacity = useTransform(
    scrollProgress,
    [fadeIn, peak, fadeOut],
    [0.15, 1, 0.15]
  );
  const scale = useTransform(
    scrollProgress,
    [fadeIn, peak, fadeOut],
    [0.94, 1, 0.94]
  );
  const y = useTransform(
    scrollProgress,
    [fadeIn, peak, fadeOut],
    [8, 0, -8]
  );

  return (
    <motion.div style={{ opacity, scale, y, transformOrigin: 'left center' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
        <span style={{
          fontFamily: F, fontSize: 32, fontWeight: 900,
          backgroundImage: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-2px', lineHeight: 1,
        }}>{step.num}</span>
        <h3 style={{
          fontFamily: F, fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 900,
          color: C.text, letterSpacing: '-1.5px', lineHeight: 1.1,
        }}>{step.title}</h3>
      </div>
      <p style={{
        fontFamily: FB, fontSize: 12, fontWeight: 600,
        color: C.cyan, letterSpacing: '0.5px', marginBottom: 8,
        textTransform: 'uppercase',
      }}>{step.sub}</p>
      <p style={{
        fontFamily: FB, fontSize: 14, lineHeight: 1.75,
        color: C.sub, maxWidth: 420,
      }}>{step.desc}</p>
    </motion.div>
  );
}

/* ── Mock Content Switcher with AnimatePresence ── */
function MockContent({ scrollProgress }) {
  const stepIndex = useTransform(scrollProgress, [0, 0.24, 0.25, 0.49, 0.50, 0.74, 0.75, 1], [0, 0, 1, 1, 2, 2, 3, 3]);

  return (
    <motion.div>
      <MockContentInner stepMotion={stepIndex} />
    </motion.div>
  );
}

function MockContentInner({ stepMotion }) {
  /* We need a React state from a motion value */
  const [activeIdx, setActiveIdx] = useState(0);

  /* Sync motion value to state */
  useMotionValueEvent(stepMotion, setActiveIdx);

  const ActiveMock = mockComponents[activeIdx] || mockComponents[0];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeIdx}
        initial={{ opacity: 0, filter: 'blur(8px)', y: 16 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        exit={{ opacity: 0, filter: 'blur(8px)', y: -16 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <ActiveMock />
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Helper: subscribe to MotionValue changes ── */
function useMotionValueEvent(motionValue, setter) {
  useEffect(() => {
    const unsubscribe = motionValue.on('change', (v) => {
      setter(Math.round(v));
    });
    return unsubscribe;
  }, [motionValue, setter]);
}
