import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList, Factory, TrendingUp, Package,
  Truck, Users, BarChart3, Settings
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

function BentoCard({ feature, index }) {
  const [hovered, setHovered] = useState(false);
  const Icon = feature.icon;

  const isWide = feature.span === 'wide';
  const isTall = feature.span === 'tall';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: isWide ? 'span 2' : 'span 1',
        gridRow: isTall ? 'span 2' : 'span 1',
        position: 'relative',
        background: hovered
          ? 'rgba(255,255,255,0.035)'
          : 'rgba(255,255,255,0.018)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${hovered ? `${feature.color}30` : 'rgba(255,255,255,0.05)'}`,
        borderRadius: 20,
        padding: isTall ? '36px 32px' : '32px 28px',
        cursor: 'default',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
      }}
    >
      {/* Corner glow on hover */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 180, height: 180, borderRadius: '50%',
        background: `radial-gradient(circle, ${feature.color}${hovered ? '15' : '05'}, transparent 70%)`,
        transition: 'all 0.5s ease',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: `${feature.color}10`,
          border: `1px solid ${feature.color}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
          transition: 'all 0.3s ease',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
        }}>
          <Icon size={22} color={feature.color} strokeWidth={1.8} />
        </div>

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
            {/* Mini workflow visualization */}
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
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: i < 2 ? '#3DB88A' : i === 2 ? feature.color : 'rgba(255,255,255,0.1)',
                }} />
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
    </motion.div>
  );
}

export default function FeaturesBento() {
  return (
    <section style={{
      padding: '120px 24px', maxWidth: 1100, margin: '0 auto',
    }}>
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', marginBottom: 64 }}
      >
        <p style={{
          fontSize: 12, fontFamily: FB, color: C.cyan,
          letterSpacing: '2.5px', textTransform: 'uppercase',
          fontWeight: 600, marginBottom: 16,
        }}>Modüller</p>
        <h2 style={{
          fontFamily: F, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900,
          color: C.text, letterSpacing: '-0.02em', lineHeight: 1.15,
          marginBottom: 16,
        }}>
          Her Şey Tek Platformda,{' '}
          <span style={{
            backgroundImage: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Sıfır Karmaşa</span>
        </h2>
        <p style={{
          fontFamily: FB, fontSize: 16, color: C.sub, lineHeight: 1.7,
          maxWidth: 520, margin: '0 auto',
        }}>
          Sipariş girişinden maliyet analizine, stok takibinden fason yönetimine —
          atölyenizin ihtiyaç duyduğu her modül entegre çalışır.
        </p>
      </motion.div>

      {/* Bento Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
      }}>
        {features.map((f, i) => (
          <BentoCard key={i} feature={f} index={i} />
        ))}
      </div>

      {/* Responsive: on smaller screens make it single column */}
      <style>{`
        @media (max-width: 900px) {
          section > div:last-child {
            grid-template-columns: 1fr !important;
          }
          section > div:last-child > div {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
        }
      `}</style>
    </section>
  );
}
