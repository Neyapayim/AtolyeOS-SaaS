import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ClipboardList, AlertTriangle, Factory, Truck, CheckCircle
} from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

/* ══════════════════════════════════════════════════════════════════════════════
   SİPARİŞ HİKAYESİ: Karaca Mobilya — SP-2026-041
   Tek sipariş, 4 sahne, uçtan uca ürün akışı.
   ══════════════════════════════════════════════════════════════════════════════ */

const GLASS = {
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
};

/* ── Scroll Ranges ──────────────────────────────────────────────────────────
   300vh section (400vh - 100vh sticky = 300vh scroll distance).
   scrollYProgress 0→1 arası 4 sahne.
   Her sahne: giriş %3, plato ~%19, çıkış %3 (son sahne çıkışsız).
   TÜM diziler strictly increasing — duplicate yok.
   ─────────────────────────────────────────────────────────────────────────── */
const R = [
  [0.00, 0.03, 0.22, 0.25],   // Sahne 0: baştan görünür, 0.22'de çıkmaya başlar
  [0.22, 0.25, 0.47, 0.50],   // Sahne 1
  [0.47, 0.50, 0.72, 0.75],   // Sahne 2
  [0.72, 0.75, 0.98, 0.99],   // Sahne 3: çıkışta opacity 1 kalır (aşağıda output'ta)
];

/* ── Sol metin bileşeni ─────────────────────────────────────────────────── */
function NarrationPanel({ index, progress, children }) {
  const [a, b, c, d] = R[index];
  const isFirst = index === 0;
  const isLast = index === 3;
  const opacity = useTransform(progress, [a, b, c, d], [isFirst ? 1 : 0, 1, 1, isLast ? 1 : 0]);
  const y = useTransform(progress, [a, b, c, d], [isFirst ? 0 : 36, 0, 0, isLast ? 0 : -36]);

  return (
    <motion.div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      opacity, y,
      willChange: 'transform, opacity',
    }}>
      {children}
    </motion.div>
  );
}

/* ── Sağ mock bileşeni (3D geçiş) ──────────────────────────────────────── */
function ScenePanel({ index, progress, children }) {
  const [a, b, c, d] = R[index];
  const isFirst = index === 0;
  const isLast = index === 3;
  const opacity = useTransform(progress, [a, b, c, d], [isFirst ? 1 : 0, 1, 1, isLast ? 1 : 0]);
  const x = useTransform(progress, [a, b, c, d], [isFirst ? 0 : 80, 0, 0, isLast ? 0 : -80]);
  const rY = useTransform(progress, [a, b, c, d], [isFirst ? 0 : 12, 0, 0, isLast ? 0 : -12]);
  const sc = useTransform(progress, [a, b, c, d], [isFirst ? 1 : 0.92, 1, 1, isLast ? 1 : 0.92]);

  return (
    <motion.div style={{
      position: 'absolute', inset: 0,
      opacity, x, rotateY: rY, scale: sc,
      transformOrigin: 'center center',
      willChange: 'transform, opacity',
    }}>
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   4 SAHNE — Karaca Mobilya SP-2026-041
   ══════════════════════════════════════════════════════════════════════════════ */

/* ── Sahne 1: Sipariş Alındı ── */
function Scene1() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClipboardList size={14} color={C.cyan} />
          <span style={{ fontFamily: F, fontSize: 12, fontWeight: 700, color: C.text }}>Sipariş Detayı</span>
        </div>
        <span style={{ fontSize: 9, fontFamily: FB, fontWeight: 600, color: '#3DB88A', background: '#3DB88A15', padding: '3px 10px', borderRadius: 6 }}>Onaylandı</span>
      </div>

      {/* Sipariş kartı */}
      <div style={{ background: 'rgba(255,255,255,0.02)', ...GLASS, borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span style={{ fontFamily: F, fontSize: 14, fontWeight: 800, color: C.cyan, letterSpacing: '-0.5px' }}>SP-2026-041</span>
          <span style={{ fontSize: 9, fontFamily: FB, color: C.muted }}>📅 Termin: 12 Nisan 2026</span>
        </div>
        <div style={{ fontSize: 11, fontFamily: FB, color: C.text, marginBottom: 2 }}>Karaca Mobilya</div>
        <div style={{ fontSize: 9.5, fontFamily: FB, color: C.muted }}>📍 Ankara Armada Şubesi · Bahar Koleksiyonu</div>
      </div>

      {/* Kalemler */}
      <div style={{ fontSize: 9, fontFamily: FB, color: C.muted, marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Sipariş Kalemleri</div>
      {[
        { ad: 'Atlas Sandalye', adet: 24, durum: 'Üretime Hazır', c: C.cyan },
        { ad: 'Atlas Masa 140 cm', adet: 6, durum: 'Stok Yetersiz', c: C.gold },
        { ad: 'Karşılama Bankosu 220 cm', adet: 1, durum: 'Özel Üretim', c: C.lav },
      ].map((k, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', marginBottom: 4,
          background: 'rgba(255,255,255,0.015)', borderRadius: 8,
          borderLeft: `2px solid ${k.c}40`,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontFamily: FB, fontWeight: 600, color: C.text }}>{k.ad}</div>
            <div style={{ fontSize: 9, fontFamily: FB, color: C.muted, marginTop: 1 }}>{k.adet} adet</div>
          </div>
          <span style={{ fontSize: 8, fontFamily: FB, fontWeight: 600, color: k.c, background: `${k.c}12`, padding: '2px 8px', borderRadius: 5 }}>{k.durum}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Sahne 2: Stok & Tedarik ── */
function Scene2() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} color="#DC3C3C" />
          <span style={{ fontFamily: F, fontSize: 12, fontWeight: 700, color: C.text }}>Eksik Malzeme — SP-2026-041</span>
        </div>
        <span style={{ fontSize: 9, fontFamily: FB, fontWeight: 600, color: '#DC3C3C', background: '#DC3C3C15', padding: '3px 10px', borderRadius: 6 }}>4 Kalem Eksik</span>
      </div>

      {[
        { ad: '40×20 Profil HR', stok: '12 boy', gerek: '48 boy', eksik: '36 boy', acil: true },
        { ad: '18 mm MDF Tabla Paneli', stok: '4 levha', gerek: '14 levha', eksik: '10 levha', acil: true },
        { ad: 'Elektrostatik Boya — Siyah', stok: '2 kg', gerek: '8 kg', eksik: '6 kg', acil: false },
        { ad: 'Ayarlı Pingo Ayak M10', stok: '40 adet', gerek: '120 adet', eksik: '80 adet', acil: false },
      ].map((m, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 4, borderRadius: 9,
          background: m.acil ? 'rgba(220,60,60,0.03)' : 'rgba(255,255,255,0.015)',
          border: m.acil ? '1px solid rgba(220,60,60,0.08)' : '1px solid rgba(255,255,255,0.03)',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, fontFamily: FB, fontWeight: 600, color: C.text }}>{m.ad}</div>
            <div style={{ fontSize: 9, fontFamily: FB, color: C.muted, marginTop: 2 }}>
              Stok: {m.stok} · Gerekli: {m.gerek} · <span style={{ color: '#DC3C3C', fontWeight: 600 }}>Eksik: {m.eksik}</span>
            </div>
          </div>
          <div style={{ fontSize: 8, fontFamily: FB, fontWeight: 600, color: C.cyan, background: `${C.cyan}12`, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', flexShrink: 0 }}>Tedarik Et</div>
        </div>
      ))}
    </div>
  );
}

/* ── Sahne 3: Üretim Takip ── */
function Scene3() {
  const ist = [
    { ad: 'Kesim', op: 'Fatma H.', pct: 100, c: '#3DB88A', durum: 'Tamamlandı' },
    { ad: 'Kaynak', op: 'Mehmet', pct: 100, c: '#3DB88A', durum: 'Tamamlandı' },
    { ad: 'Boya (Fason)', op: 'Dış Kaynak', pct: 75, c: C.lav, durum: 'Devam Ediyor' },
    { ad: 'Montaj', op: 'Ahmet Usta', pct: 30, c: C.cyan, durum: 'Başladı' },
    { ad: 'Paketleme', op: 'Mehmet', pct: 0, c: C.muted, durum: 'Bekliyor' },
  ];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Factory size={14} color={C.cyan} />
          <span style={{ fontFamily: F, fontSize: 12, fontWeight: 700, color: C.text }}>Üretim Hattı — SP-2026-041</span>
        </div>
        <span style={{ fontSize: 9, fontFamily: FB, fontWeight: 600, color: C.cyan, background: `${C.cyan}12`, padding: '3px 10px', borderRadius: 6 }}>Üretimde</span>
      </div>

      {ist.map((s, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.c }} />
              <span style={{ fontSize: 10.5, fontFamily: FB, fontWeight: 600, color: C.text }}>{s.ad}</span>
              {s.ad.includes('Fason') && <span style={{ fontSize: 7.5, fontFamily: FB, fontWeight: 600, color: C.lav, background: `${C.lav}15`, padding: '1px 6px', borderRadius: 4 }}>FASON</span>}
            </div>
            <span style={{ fontSize: 9, fontFamily: FB, color: C.muted }}>{s.op} · %{s.pct}</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
            <div style={{ width: `${s.pct}%`, height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${s.c}60, ${s.c})` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Sahne 4: Sevkiyat & Teslim ── */
function Scene4() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: '#3DB88A12', border: '1px solid #3DB88A20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <CheckCircle size={26} color="#3DB88A" strokeWidth={1.6} />
      </div>
      <div style={{ fontFamily: F, fontSize: 18, fontWeight: 900, color: '#3DB88A', letterSpacing: '-0.5px', marginBottom: 4 }}>Teslim Edildi</div>
      <div style={{ fontFamily: FB, fontSize: 10.5, color: C.sub, marginBottom: 20 }}>SP-2026-041 · Karaca Mobilya · Ankara Armada Şubesi</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, maxWidth: 300, margin: '0 auto', textAlign: 'left' }}>
        {[
          { l: 'İrsaliye', v: '#IRN-4821' },
          { l: 'Nakliyeci', v: 'Horoz Lojistik' },
          { l: 'Teslim Tarihi', v: '10 Nisan 2026' },
          { l: 'Sevk İçeriği', v: '31 kalem · 4 palet' },
        ].map((x, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)', padding: '8px 10px' }}>
            <div style={{ fontSize: 8, color: C.muted, fontFamily: FB, marginBottom: 2 }}>{x.l}</div>
            <div style={{ fontSize: 10.5, color: C.text, fontFamily: F, fontWeight: 700 }}>{x.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Anlatı metinleri ───────────────────────────────────────────────────── */
const narrations = [
  { num: '01', title: 'Sipariş sisteme girdi', sub: 'Karaca Mobilya · Ankara Armada Şubesi', desc: 'Bahar koleksiyonu açılışı için 24 sandalye, 6 masa ve 1 karşılama bankosu. Sistem siparişi aldı, stok analizini başlattı.' },
  { num: '02', title: 'Eksik malzemeler belirlendi', sub: '4 kalem tedarik gerekiyor', desc: 'BOM reçetesi patlatıldı; profil, tabla, boya ve ayak eksik. Tedarikçilere tek tıkla sipariş oluşturuldu.' },
  { num: '03', title: 'Üretim hattı çalışıyor', sub: '5 istasyon · 3 operatör · 1 fason', desc: 'Kesim ve kaynak tamamlandı. Boya fason atölyesinde. Montaj başladı, paketleme sırada bekliyor.' },
  { num: '04', title: 'Sevkiyat tamamlandı', sub: 'Teslim: 10 Nisan 2026 · Horoz Lojistik', desc: '31 kalem, 4 palet halinde Ankara Armada Şubesine teslim edildi. Maliyet raporu ve kâr analizi hazır.' },
];

const scenes = [Scene1, Scene2, Scene3, Scene4];

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN — Scroll-Driven Sticky Showcase
   SIFIR useState. Tüm useTransform hook'ları component body'de.
   ══════════════════════════════════════════════════════════════════════════════ */
export default function InteractiveShowcase() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  /* Section fade — giriş ve çıkışta hafif fade */
  const sectionOp = useTransform(scrollYProgress, [0, 0.01, 0.98, 1], [0.5, 1, 1, 0.7]);

  return (
    <section
      ref={sectionRef}
      id="nasil"
      style={{ height: '400vh', position: 'relative' }}
    >
      <motion.div style={{
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', alignItems: 'center',
        background: C.bg,
        opacity: sectionOp,
      }}>
        {/* Subtle ambient */}
        <div style={{
          position: 'absolute', top: '40%', left: '55%', transform: 'translate(-50%,-50%)',
          width: 500, height: 350, borderRadius: '50%',
          background: `radial-gradient(ellipse, ${C.cyan}06, transparent 55%)`,
          pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: 1100, width: '100%', margin: '0 auto', padding: '0 24px',
          display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 48,
          alignItems: 'center',
        }}>
          {/* ═══ SOL: Anlatı ═══ */}
          <div style={{ position: 'relative', minHeight: 260 }}>
            {/* Label */}
            <p style={{
              position: 'absolute', top: -44, left: 0,
              fontSize: 11, fontFamily: FB, color: C.cyan,
              letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600,
            }}>Nasıl Çalışır?</p>

            {narrations.map((n, i) => (
              <NarrationPanel key={i} index={i} progress={scrollYProgress}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
                  <span style={{
                    fontFamily: F, fontSize: 32, fontWeight: 900,
                    color: C.cyan, opacity: 0.3, letterSpacing: '-2px',
                  }}>{n.num}</span>
                  <h3 style={{
                    fontFamily: F, fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800,
                    color: C.text, letterSpacing: '-1px', lineHeight: 1.15,
                  }}>{n.title}</h3>
                </div>
                <p style={{
                  fontFamily: FB, fontSize: 12, fontWeight: 500,
                  color: C.cyan, marginBottom: 10, opacity: 0.7,
                }}>{n.sub}</p>
                <p style={{
                  fontFamily: FB, fontSize: 14.5, lineHeight: 1.75,
                  color: C.sub, maxWidth: 380,
                }}>{n.desc}</p>
              </NarrationPanel>
            ))}
          </div>

          {/* ═══ SAĞ: Cam Ekran ═══ */}
          <div style={{ perspective: '1000px' }}>
            <div style={{
              background: 'rgba(8,8,11,0.88)',
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              ...GLASS,
              borderRadius: 18, overflow: 'hidden',
              boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
            }}>
              {/* Title bar */}
              <div style={{
                padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6,
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: 'rgba(255,255,255,0.01)',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC3C3C', opacity: 0.6 }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FBBF24', opacity: 0.6 }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3DB88A', opacity: 0.6 }} />
                <span style={{ marginLeft: 8, fontSize: 10, color: C.muted, fontFamily: FB }}>Atölye OS · SP-2026-041</span>
              </div>

              {/* Scene container */}
              <div style={{ position: 'relative', padding: '20px 22px', minHeight: 340 }}>
                {scenes.map((SceneComp, i) => (
                  <ScenePanel key={i} index={i} progress={scrollYProgress}>
                    <SceneComp />
                  </ScenePanel>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`@media(max-width:900px){section>div>div:nth-child(2){grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}
