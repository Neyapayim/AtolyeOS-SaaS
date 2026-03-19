import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

const testimonials = [
  {
    name: 'Mehmet Karaca',
    role: 'Karaca Mobilya — Kurucu',
    text: 'Excel\'de 3 saat süren stok sayımını artık 10 dakikada yapıyoruz. Siparişlerin hangi aşamada olduğunu anlık görmek, müşterilerimize net tarih verebilmemizi sağladı.',
    avatar: 'MK',
    color: C.cyan,
  },
  {
    name: 'Ayşe Demir',
    role: 'Demir Metal — Üretim Müdürü',
    text: 'Fason takibi tamamen kontrolümüzde artık. Hangi parçanın boyada, hangisinin kaynak atölyesinde olduğunu tek ekrandan görüyoruz. İş kayıplarımız %35 azaldı.',
    avatar: 'AD',
    color: '#3DB88A',
  },
  {
    name: 'Hakan Yılmaz',
    role: 'Yılmaz Atölye — İşletme Sahibi',
    text: 'Maliyet kartlarını görünce ürünlerimizin yarısının kârsız olduğunu fark ettik. Fiyatlarımızı güncelledik, ilk ayda %20 daha fazla kâr elde ettik.',
    avatar: 'HY',
    color: C.gold,
  },
  {
    name: 'Fatma Özkan',
    role: 'Özkan Tekstil — Operasyon Yöneticisi',
    text: 'Tedarik zinciri modülü hayat kurtarıcı. Malzeme siparişleri, nakliye takibi ve stok girişi tek akışta. Artık telefon ve WhatsApp ile takip yapmıyoruz.',
    avatar: 'FÖ',
    color: C.lav,
  },
];

function StarRating() {
  return (
    <div style={{ display: 'flex', gap: 3, marginBottom: 20 }}>
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={14} fill="#FBBF24" color="#FBBF24" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setActive(prev => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const navigate = (dir) => {
    setDirection(dir);
    setActive(prev => {
      const next = prev + dir;
      if (next < 0) return testimonials.length - 1;
      if (next >= testimonials.length) return 0;
      return next;
    });
  };

  const t = testimonials[active];

  return (
    <section style={{
      padding: '120px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.lav}08, transparent 70%)`,
        top: '10%', left: '5%', pointerEvents: 'none',
        animation: 'landing-orb-drift-3 18s ease-in-out infinite',
      }} />

      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
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
          }}>Müşteri Görüşleri</p>
          <h2 style={{
            fontFamily: F, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900,
            color: C.text, letterSpacing: '-0.02em',
          }}>
            Atölyeler Ne Diyor?
          </h2>
        </motion.div>

        {/* Testimonial Card */}
        <div style={{ position: 'relative', minHeight: 280 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 24, padding: '48px 52px',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Quote icon */}
              <Quote
                size={48}
                color={`${t.color}15`}
                style={{ position: 'absolute', top: 28, right: 40 }}
              />

              <StarRating />

              <p style={{
                fontFamily: FB, fontSize: 17, lineHeight: 1.8,
                color: C.text, fontWeight: 400, fontStyle: 'italic',
                marginBottom: 32, maxWidth: 640,
                opacity: 0.9,
              }}>
                "{t.text}"
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Avatar */}
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${t.color}15`,
                  border: `1px solid ${t.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: F, fontSize: 16, fontWeight: 800, color: t.color,
                }}>{t.avatar}</div>
                <div>
                  <div style={{
                    fontFamily: F, fontSize: 15, fontWeight: 700, color: C.text,
                  }}>{t.name}</div>
                  <div style={{
                    fontFamily: FB, fontSize: 13, color: C.sub, marginTop: 2,
                  }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 16, marginTop: 32,
        }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: C.sub,
            }}
          >
            <ChevronLeft size={18} />
          </motion.button>

          <div style={{ display: 'flex', gap: 8 }}>
            {testimonials.map((_, i) => (
              <div
                key={i}
                onClick={() => { setDirection(i > active ? 1 : -1); setActive(i); }}
                style={{
                  width: i === active ? 24 : 8, height: 8,
                  borderRadius: 4, cursor: 'pointer',
                  background: i === active ? testimonials[active].color : 'rgba(255,255,255,0.08)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(1)}
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: C.sub,
            }}
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
