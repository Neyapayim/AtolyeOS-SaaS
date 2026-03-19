import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList, Factory, TrendingUp, Package,
  Truck, Users, BarChart3
} from 'lucide-react';
import { C, F, FB, GLASS } from '../config/constants.js';

const ease = [0.25, 0.1, 0.25, 1];

const features = [
  { icon: ClipboardList, title: 'Sipariş Yönetimi', desc: 'Çoklu kalemli sipariş girişi, anlık stok analizi ve otomatik üretim emri oluşturma. Müşterinize termin sorusuna hemen cevap verin.', color: C.cyan, span: 2 },
  { icon: Factory, title: 'Üretim Takip', desc: 'İş emirlerini Kanban tahtasında yönetin. Aşama ilerlemesi, canlı zamanlayıcılar ve iş günlüğü ile üretim süreciniz şeffaf.', color: '#3DB88A', span: 1 },
  { icon: Package, title: 'Stok & Depo', desc: 'Ham madde, yarı mamül ve ürün stokları. Minimum stok uyarıları ve otomatik rezervasyon ile depo sürpriz yapmaz.', color: '#3E7BD4', span: 1 },
  { icon: TrendingUp, title: 'Maliyet Kartı', desc: 'Reçete bazlı maliyet hesabı, KDV dahil birim fiyat ve kâr marjı analizi. Hangi ürün kazandırıyor, hangisi kaybettiriyor — bilin.', color: C.gold, span: 1 },
  { icon: Truck, title: 'Tedarik Zinciri', desc: 'Eksik malzeme tespit, tedarikçi siparişi, nakliye takibi ve otomatik stok girişi. Tek akışta.', color: '#D46B2A', span: 1 },
  { icon: Users, title: 'Fason Takip', desc: 'Dışarı gönderdiğiniz işleri firma bazlı izleyin. Gönderim, dönüş ve maliyet kontrolü tek ekranda.', color: C.lav, span: 1 },
  { icon: BarChart3, title: 'Dashboard', desc: 'Geciken siparişler, kritik stoklar, bugünkü iş emirleri — sabah açtığınızda atölyeniz bir bakışta.', color: '#22D3EE', span: 1 },
];

function Card({ feature, index }) {
  const ref = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const Icon = feature.icon;

  const onMove = useCallback((e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setMouse({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.05, ease }}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMouse({ x: 0, y: 0 }); }}
      style={{
        gridColumn: `span ${feature.span}`,
        position: 'relative',
        background: C.s1,
        ...GLASS,
        borderColor: hovered ? 'rgba(255,255,255,0.1)' : undefined,
        borderRadius: 14,
        padding: '32px 28px',
        transition: 'border-color 0.3s ease, transform 0.3s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        overflow: 'hidden',
      }}
    >
      {/* Cursor spotlight — subtle */}
      {hovered && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 14,
          background: `radial-gradient(500px circle at ${mouse.x}px ${mouse.y}px, ${feature.color}06, transparent 40%)`,
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${feature.color}0A`,
          border: `1px solid ${feature.color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <Icon size={20} color={feature.color} strokeWidth={1.8} />
        </div>

        <h3 style={{
          fontFamily: F, fontSize: 16, fontWeight: 700,
          color: C.text, marginBottom: 8,
          letterSpacing: '-0.02em',
        }}>{feature.title}</h3>

        <p style={{
          fontFamily: FB, fontSize: 13.5, lineHeight: 1.7,
          color: C.sub,
        }}>{feature.desc}</p>
      </div>
    </motion.article>
  );
}

export default function FeaturesBento() {
  return (
    <section aria-labelledby="features-title" style={{
      padding: '120px 24px', maxWidth: 1080, margin: '0 auto',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease }}
        style={{ textAlign: 'center', marginBottom: 64 }}
      >
        <p style={{
          fontSize: 12, fontFamily: FB, color: C.cyan,
          letterSpacing: '2px', textTransform: 'uppercase',
          fontWeight: 500, marginBottom: 12,
        }}>Modüller</p>
        <h2 id="features-title" style={{
          fontFamily: F, fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800,
          color: C.text, letterSpacing: '-0.03em', lineHeight: 1.15,
          marginBottom: 14,
        }}>
          Atölyenizin ihtiyaç duyduğu her şey
        </h2>
        <p style={{
          fontFamily: FB, fontSize: 15, color: C.sub, lineHeight: 1.7,
          maxWidth: 480, margin: '0 auto',
        }}>
          Sipariş girişinden maliyet analizine, stok takibinden fason yönetimine —
          birbirine bağlı modüller, tek platform.
        </p>
      </motion.div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
      }}>
        {features.map((f, i) => <Card key={i} feature={f} index={i} />)}
      </div>

      <style>{`
        @media (max-width: 768px) {
          section > div:last-of-type { grid-template-columns: 1fr !important; }
          section > div:last-of-type > article { grid-column: span 1 !important; }
        }
      `}</style>
    </section>
  );
}
