import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShoppingCart, AlertTriangle, Factory, ScanBarcode } from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

const GLASS = {
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
};

/* ══════════════════════════════════════════════════════════════════════════════
   SCROLL RANGE — Her adım %25'lik dilim
   Adım 0: 0.00→0.25  |  Adım 1: 0.25→0.50  |  Adım 2: 0.50→0.75  |  Adım 3: 0.75→1.00
   Giriş: ilk %5  |  Plato: ortadaki %15  |  Çıkış: son %5 (son adımda çıkış yok)
   ══════════════════════════════════════════════════════════════════════════════ */
function rng(i) {
  const s = i * 0.25;
  return {
    a: s,            // giriş başlangıcı
    b: s + 0.05,     // giriş bitişi (plato başı)
    c: s + 0.20,     // çıkış başlangıcı (plato sonu)
    d: i === 3 ? 2 : s + 0.25,  // çıkış bitişi (son adımda asla kaybolmaz → 2 = ulaşılamaz)
  };
}

/* ── SOL: Metin — position:absolute üst üste ── */
function StepText({ step, index, progress }) {
  const { a, b, c, d } = rng(index);
  return (
    <motion.div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      opacity: useTransform(progress, [a, b, c, d], [0, 1, 1, 0]),
      y: useTransform(progress, [a, b, c, d], [50, 0, 0, -50]),
      willChange: 'transform, opacity',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 12 }}>
        <span style={{
          fontFamily: F, fontSize: 40, fontWeight: 900,
          backgroundImage: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-2px', lineHeight: 1,
        }}>{step.num}</span>
        <h3 style={{
          fontFamily: F, fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 900,
          color: C.text, letterSpacing: '-1.5px', lineHeight: 1.1,
        }}>{step.title}</h3>
      </div>
      <p style={{
        fontFamily: FB, fontSize: 12, fontWeight: 600,
        color: C.cyan, letterSpacing: '0.5px', marginBottom: 12,
        textTransform: 'uppercase',
      }}>{step.sub}</p>
      <p style={{
        fontFamily: FB, fontSize: 15, lineHeight: 1.8,
        color: C.sub, maxWidth: 400,
      }}>{step.desc}</p>
    </motion.div>
  );
}

/* ── SAĞ: 3D Mock Panel — position:absolute üst üste ── */
function MockPanel({ index, progress, children }) {
  const { a, b, c, d } = rng(index);
  return (
    <motion.div style={{
      position: 'absolute', inset: 0,
      opacity: useTransform(progress, [a, b, c, d], [0, 1, 1, 0]),
      x: useTransform(progress, [a, b, c, d], ['100%', '0%', '0%', '-100%']),
      rotateY: useTransform(progress, [a, b, c, d], [20, 0, 0, -20]),
      scale: useTransform(progress, [a, b, c, d], [0.85, 1, 1, 0.85]),
      transformOrigin: 'center center',
      willChange: 'transform, opacity',
    }}>
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   4 MOCK İÇERİKLERİ
   ══════════════════════════════════════════════════════════════════════════════ */
function Mock1() {
  const rows = [
    { no: '#1042', m: 'Karaca Mobilya', u: '3\'lü Kanepe Seti', d: 'Onaylandı', c: '#3DB88A' },
    { no: '#1043', m: 'Demir Metal', u: 'Endüstriyel Raf (x24)', d: 'Bekliyor', c: C.cyan },
    { no: '#1044', m: 'Yılmaz Atölye', u: 'Yemek Masası Takımı', d: 'Acil', c: '#DC3C3C' },
    { no: '#1045', m: 'Özkan Tekstil', u: 'Ofis Koltuğu (x40)', d: 'Onaylandı', c: '#3DB88A' },
    { no: '#1046', m: 'Atlas Dekor', u: 'Sehpa + TV Ünitesi', d: 'Bekliyor', c: C.cyan },
  ];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <ShoppingCart size={15} color={C.cyan} />
        <span style={{ fontFamily: F, fontSize: 12.5, fontWeight: 700, color: C.text, letterSpacing: '-0.5px' }}>Gelen Siparişler</span>
        <span style={{ marginLeft: 'auto', fontSize: 9.5, fontFamily: FB, color: C.muted }}>Bugün · 5 yeni</span>
      </div>
      <div style={{ borderRadius: 11, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '58px 1fr 1fr 72px', gap: 6, padding: '7px 12px', background: 'rgba(255,255,255,0.015)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          {['No', 'Müşteri', 'Ürün', 'Durum'].map(h => <span key={h} style={{ fontSize: 8.5, color: C.muted, fontFamily: FB, fontWeight: 600 }}>{h}</span>)}
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '58px 1fr 1fr 72px', gap: 6, padding: '9px 12px', alignItems: 'center', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.02)' : 'none' }}>
            <span style={{ fontSize: 10.5, fontFamily: F, fontWeight: 700, color: C.sub }}>{r.no}</span>
            <span style={{ fontSize: 10, fontFamily: FB, color: C.sub }}>{r.m}</span>
            <span style={{ fontSize: 10, fontFamily: FB, color: C.muted }}>{r.u}</span>
            <span style={{ fontSize: 8.5, fontFamily: FB, fontWeight: 600, color: r.c, background: `${r.c}12`, borderRadius: 5, padding: '2px 7px', textAlign: 'center' }}>{r.d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Mock2() {
  const alerts = [
    { m: 'Sünger 30D (Levha)', stok: '2 adet', iht: '18 adet', acil: true },
    { m: 'Kumaş Keten Gri', stok: '4.2 mt', iht: '28 mt', acil: true },
    { m: 'Profil 40x20 HR', stok: '12 boy', iht: '48 boy', acil: false },
    { m: 'Cila Vernik (Lt)', stok: '3 lt', iht: '8 lt', acil: false },
  ];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <AlertTriangle size={15} color="#DC3C3C" />
        <span style={{ fontFamily: F, fontSize: 12.5, fontWeight: 700, color: C.text, letterSpacing: '-0.5px' }}>Stok Uyarıları</span>
        <span style={{ marginLeft: 'auto', fontSize: 9, fontFamily: FB, background: '#DC3C3C20', color: '#DC3C3C', borderRadius: 5, padding: '2px 7px', fontWeight: 600 }}>4 eksik</span>
      </div>
      {alerts.map((a, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', marginBottom: 5, borderRadius: 9, background: a.acil ? 'rgba(220,60,60,0.04)' : 'rgba(255,255,255,0.012)', border: a.acil ? '1px solid rgba(220,60,60,0.1)' : '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontFamily: FB, fontWeight: 600, color: C.text }}>{a.m}</div>
            <div style={{ fontSize: 9, fontFamily: FB, color: C.muted, marginTop: 2 }}>Stok: {a.stok} → İhtiyaç: {a.iht}</div>
          </div>
          <div style={{ fontSize: 8.5, fontFamily: FB, fontWeight: 600, background: `${C.cyan}15`, color: C.cyan, borderRadius: 6, padding: '4px 10px' }}>Tedarik Et</div>
        </div>
      ))}
    </div>
  );
}

function Mock3() {
  const st = [
    { n: 'Kesim Masası', o: 'Fatma H.', p: 100, c: '#3DB88A' },
    { n: 'Döşeme Tezgahı', o: 'Ahmet Usta', p: 62, c: C.cyan },
    { n: 'Montaj İstasyonu', o: 'Mehmet', p: 35, c: C.gold },
    { n: 'Statik Boya (Fason)', o: 'Dış Kaynak', p: 80, c: C.lav },
    { n: 'Paketleme', o: 'Mehmet', p: 0, c: C.muted },
  ];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <Factory size={15} color={C.cyan} />
        <span style={{ fontFamily: F, fontSize: 12.5, fontWeight: 700, color: C.text, letterSpacing: '-0.5px' }}>Üretim Hattı — UE #1042</span>
        <span style={{ marginLeft: 'auto', fontSize: 9.5, fontFamily: FB, color: '#3DB88A' }}>● Aktif</span>
      </div>
      {st.map((s, i) => (
        <div key={i} style={{ marginBottom: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 10.5, fontFamily: FB, fontWeight: 600, color: C.text }}>{s.n}</span>
            <span style={{ fontSize: 9.5, fontFamily: FB, color: C.muted }}>{s.o} · %{s.p}</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
            <div style={{ width: `${s.p}%`, height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${s.c}70, ${s.c})` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Mock4() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 260, textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg, rgba(61,184,138,0.12), rgba(61,184,138,0.05))', border: '1px solid rgba(61,184,138,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}>
        <ScanBarcode size={32} color="#3DB88A" strokeWidth={1.5} />
      </div>
      <div style={{ fontFamily: F, fontSize: 20, fontWeight: 900, color: '#3DB88A', letterSpacing: '-1px', marginBottom: 6 }}>Teslim Edildi ✓</div>
      <div style={{ fontFamily: FB, fontSize: 11.5, color: C.sub, marginBottom: 20 }}>Sipariş #1042 · Karaca Mobilya</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, width: '100%', maxWidth: 300 }}>
        {[{ l: 'İrsaliye', v: '#IRN-4821' }, { l: 'Nakliyeci', v: 'Aras Kargo' }, { l: 'Kâr Marjı', v: '%28.4' }].map((item, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 9, border: '1px solid rgba(255,255,255,0.04)', padding: '9px 10px' }}>
            <div style={{ fontSize: 8.5, color: C.muted, fontFamily: FB, marginBottom: 3 }}>{item.l}</div>
            <div style={{ fontSize: 11.5, color: C.text, fontFamily: F, fontWeight: 700 }}>{item.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN — %100 useTransform, SIFIR useState
   ══════════════════════════════════════════════════════════════════════════════ */
const stepData = [
  { num: '01', title: '1 Tıkla Siparişi Alın', sub: 'Kanepeler, Masalar ve Teslimat Tarihleri', desc: 'Müşteri aradığında siparişi saniyeler içinde girin. Çoklu kalem, alt müşteri, termin tarihi — hepsi tek formda. Stok analizi otomatik başlar.' },
  { num: '02', title: 'Malzeme İhtiyacını Anında Görün', sub: 'Stokları Tüketen ve Otomatik Hesaplayan Zeka', desc: 'BOM reçetesi üzerinden rekürsif malzeme patlatma. Hangi ham madde eksik, ne kadar lazım — saniyeler içinde belli.' },
  { num: '03', title: 'Üretim Hattını Ateşleyin', sub: 'İstasyonlar, CNC, Döşeme ve Operatör Barları', desc: 'Kanban tahtasında aşama takibi, canlı zamanlayıcılar, iş günlüğü. Hangi istasyon ne yapıyor, kim ne kadar çalışmış — hepsi görünür.' },
  { num: '04', title: 'Barkodu Okutun, Sevk Edin', sub: 'İrsaliye ve Teslimat Raporları', desc: 'Üretim tamamlandı, sevkiyat emri oluşturuldu. Stok hareketleri otomatik güncellenir, kâr marjı raporlanır.' },
];

export default function InteractiveShowcase() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  return (
    <section ref={ref} style={{ height: '400vh', position: 'relative' }}>
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', alignItems: 'center',
        background: C.bg,
      }}>
        {/* Ambient */}
        <div style={{ position: 'absolute', top: '35%', left: '58%', transform: 'translate(-50%,-50%)', width: 550, height: 400, borderRadius: '50%', background: `radial-gradient(ellipse, ${C.cyan}08, transparent 60%)`, pointerEvents: 'none', mixBlendMode: 'color-dodge' }} />
        <div style={{ position: 'absolute', top: '65%', left: '25%', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(ellipse, ${C.gold}06, transparent 55%)`, pointerEvents: 'none', mixBlendMode: 'color-dodge' }} />

        <div style={{
          maxWidth: 1140, width: '100%', margin: '0 auto', padding: '0 24px',
          display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 56,
          alignItems: 'center', position: 'relative', zIndex: 1,
        }}>
          {/* ═══ SOL: Yazılar ═══ */}
          <div style={{ position: 'relative', minHeight: 280 }}>
            <motion.p style={{
              position: 'absolute', top: -52, left: 0,
              fontSize: 12, fontFamily: FB, color: C.cyan,
              letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600,
              opacity: useTransform(scrollYProgress, [0, 0.04], [0, 1]),
            }}>Nasıl Çalışır?</motion.p>

            {stepData.map((s, i) => (
              <StepText key={i} step={s} index={i} progress={scrollYProgress} />
            ))}
          </div>

          {/* ═══ SAĞ: 3D Cam Ekran ═══ */}
          <div style={{ position: 'relative', perspective: '1200px' }}>
            <div style={{
              position: 'absolute', inset: -8,
              background: `linear-gradient(135deg, ${C.cyan}15, transparent 40%, ${C.gold}0C, transparent 75%)`,
              borderRadius: 28, filter: 'blur(30px)', pointerEvents: 'none',
            }} />

            <div style={{
              position: 'relative',
              background: 'rgba(8,8,11,0.9)',
              backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
              ...GLASS,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 50px 120px rgba(0,0,0,0.6)`,
              borderRadius: 22, overflow: 'hidden',
            }}>
              {/* Title bar */}
              <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.012)' }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#DC3C3C', opacity: 0.65 }} />
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#FBBF24', opacity: 0.65 }} />
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#3DB88A', opacity: 0.65 }} />
                <span style={{ marginLeft: 10, fontSize: 10, color: C.muted, fontFamily: FB }}>Atölye OS</span>
              </div>

              {/* 4 mock üst üste */}
              <div style={{ position: 'relative', padding: '22px 24px', minHeight: 340, perspective: '800px' }}>
                <MockPanel index={0} progress={scrollYProgress}><Mock1 /></MockPanel>
                <MockPanel index={1} progress={scrollYProgress}><Mock2 /></MockPanel>
                <MockPanel index={2} progress={scrollYProgress}><Mock3 /></MockPanel>
                <MockPanel index={3} progress={scrollYProgress}><Mock4 /></MockPanel>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:900px){section>div>div>div:last-child{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}
