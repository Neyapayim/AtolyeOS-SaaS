import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, AlertTriangle, Factory, ScanBarcode } from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

/* ══════════════════════════════════════════════════════════════════════════════
   STEP DATA
   ══════════════════════════════════════════════════════════════════════════════ */
const stepData = [
  { num: '01', title: '1 Tıkla Siparişi Alın', sub: 'Kanepeler, Masalar ve Teslimat Tarihleri', desc: 'Müşteri aradığında siparişi saniyeler içinde girin. Çoklu kalem, alt müşteri, termin tarihi — hepsi tek formda. Stok analizi otomatik başlar.' },
  { num: '02', title: 'Malzeme İhtiyacını Anında Görün', sub: 'Stokları Tüketen ve Otomatik Hesaplayan Zeka', desc: 'BOM reçetesi üzerinden rekürsif malzeme patlatma. Hangi ham madde eksik, ne kadar lazım — saniyeler içinde belli.' },
  { num: '03', title: 'Üretim Hattını Ateşleyin', sub: 'İstasyonlar, CNC, Döşeme ve Operatör Barları', desc: 'Kanban tahtasında aşama takibi, canlı zamanlayıcılar, iş günlüğü. Hangi istasyon ne yapıyor, kim ne kadar çalışmış — hepsi görünür.' },
  { num: '04', title: 'Barkodu Okutun, Sevk Edin', sub: 'İrsaliye ve Teslimat Raporları', desc: 'Üretim tamamlandı, sevkiyat emri oluşturuldu. Stok hareketleri otomatik güncellenir, kâr marjı raporlanır.' },
];

/* ══════════════════════════════════════════════════════════════════════════════
   MOCK İÇERİKLERİ
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

const mocks = [Mock1, Mock2, Mock3, Mock4];

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN — Tıklama bazlı tab showcase (useScroll YOK, crash riski SIFIR)
   Aynı görsel kalite, sıfır risk.
   ══════════════════════════════════════════════════════════════════════════════ */
export default function InteractiveShowcase() {
  const [active, setActive] = useState(0);
  const ActiveMock = mocks[active];

  return (
    <section id="nasil" style={{
      padding: '160px 24px',
      background: `linear-gradient(180deg, ${C.bg}, ${C.s1} 25%, ${C.s1} 75%, ${C.bg})`,
      position: 'relative',
    }}>
      {/* Ambient */}
      <div style={{ position: 'absolute', top: '35%', left: '58%', transform: 'translate(-50%,-50%)', width: 550, height: 400, borderRadius: '50%', background: `radial-gradient(ellipse, ${C.cyan}08, transparent 60%)`, pointerEvents: 'none', mixBlendMode: 'color-dodge' }} />
      <div style={{ position: 'absolute', top: '65%', left: '25%', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(ellipse, ${C.gold}06, transparent 55%)`, pointerEvents: 'none', mixBlendMode: 'color-dodge' }} />

      <div style={{ maxWidth: 1140, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: 80 }}
        >
          <p style={{ fontSize: 12, fontFamily: FB, color: C.cyan, letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 20 }}>Nasıl Çalışır?</p>
          <h2 style={{ fontFamily: F, fontSize: 'clamp(30px, 4.5vw, 48px)', fontWeight: 900, color: C.text, letterSpacing: '-2px', lineHeight: 1.08 }}>
            Siparişten Teslimata,{' '}
            <span style={{ backgroundImage: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Kesintisiz Akış</span>
          </h2>
        </motion.div>

        {/* Content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 56, alignItems: 'start' }}>
          {/* SOL: Adım listesi */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {stepData.map((s, i) => {
              const isActive = active === i;
              return (
                <motion.button
                  key={i}
                  onClick={() => setActive(i)}
                  whileHover={{ scale: 1.01 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 16,
                    padding: '18px 20px', borderRadius: 16, cursor: 'pointer',
                    background: isActive ? `${C.cyan}06` : 'transparent',
                    border: isActive ? `1px solid ${C.cyan}18` : '1px solid transparent',
                    transition: 'all 0.3s ease',
                    textAlign: 'left', width: '100%',
                  }}
                >
                  <span style={{
                    fontFamily: F, fontSize: 28, fontWeight: 900,
                    backgroundImage: isActive ? `linear-gradient(135deg, ${C.cyan}, ${C.gold})` : 'none',
                    WebkitBackgroundClip: isActive ? 'text' : 'unset',
                    WebkitTextFillColor: isActive ? 'transparent' : 'unset',
                    color: isActive ? undefined : C.muted,
                    letterSpacing: '-1.5px', lineHeight: 1, flexShrink: 0,
                    transition: 'color 0.3s',
                  }}>{s.num}</span>
                  <div>
                    <div style={{
                      fontFamily: F, fontSize: 15, fontWeight: 800,
                      color: isActive ? C.text : C.sub,
                      letterSpacing: '-0.5px', transition: 'color 0.3s',
                      marginBottom: 4,
                    }}>{s.title}</div>
                    <div style={{
                      fontFamily: FB, fontSize: 11.5, color: C.muted,
                      lineHeight: 1.5,
                    }}>{s.desc}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* SAĞ: Cam Ekran + AnimatePresence mock geçişi */}
          <div style={{ position: 'relative', perspective: '1200px' }}>
            {/* Glow */}
            <div style={{
              position: 'absolute', inset: -8,
              background: `linear-gradient(135deg, ${C.cyan}15, transparent 40%, ${C.gold}0C, transparent 75%)`,
              borderRadius: 28, filter: 'blur(30px)', pointerEvents: 'none',
            }} />

            {/* Ekran */}
            <div style={{
              position: 'relative',
              background: 'rgba(8,8,11,0.9)',
              backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 50px 120px rgba(0,0,0,0.6)',
              borderRadius: 22, overflow: 'hidden',
            }}>
              {/* macOS bar */}
              <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.012)' }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#DC3C3C', opacity: 0.65 }} />
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#FBBF24', opacity: 0.65 }} />
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#3DB88A', opacity: 0.65 }} />
                <span style={{ marginLeft: 10, fontSize: 10, color: C.muted, fontFamily: FB }}>Atölye OS</span>
              </div>

              {/* Mock content with 3D transitions */}
              <div style={{ padding: '22px 24px', minHeight: 340 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, x: 60, rotateY: 12, scale: 0.92 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -60, rotateY: -12, scale: 0.92 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ActiveMock />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive */}
      <style>{`@media(max-width:900px){section>div:last-child>div:last-child{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}
