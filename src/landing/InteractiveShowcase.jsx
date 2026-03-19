import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, ClipboardCheck, Factory, Package,
  Truck, CheckCircle
} from 'lucide-react';
import { C, F, FB, GLASS } from '../config/constants.js';

const ease = [0.25, 0.1, 0.25, 1];

const steps = [
  { icon: ShoppingCart, title: 'Sipariş girin', desc: 'Müşteriden gelen siparişi çoklu kalem, alt müşteri ve termin bilgisiyle kaydedin.', detail: 'Sipariş girişiyle birlikte stok analizi otomatik çalışır. Stokta varsa ürün direkt sevkiyata hazır olarak işaretlenir; yoksa eksik malzeme listesi oluşur.', color: C.cyan },
  { icon: ClipboardCheck, title: 'Stok kontrol edilsin', desc: 'Her ham madde ve yarı mamül kontrol edilir, eksik olanlar hesaplanır.', detail: 'Ürün reçetesi (BOM) üzerinden rekürsif malzeme patlatma yapılır. Hangi depoda ne kadar var, neye ne kadar lazım — saniyeler içinde belli olur.', color: '#3E7BD4' },
  { icon: Factory, title: 'Üretime gönderin', desc: 'Tek tıkla toplu iş emirleri oluşturun. Aşamalar ve sorumlular otomatik atanır.', detail: 'Kanban tahtasında aşama takibi, canlı zamanlayıcılar ve iş günlüğüyle üretim hattınız tamamen görünür hale gelir.', color: '#3DB88A' },
  { icon: Package, title: 'Eksikleri tedarik edin', desc: 'Tedarikçiye sipariş, nakliye takibi, otomatik stok girişi — tek akışta.', detail: 'Toplu, ürün bazlı veya sipariş bazlı üç farklı görünüm. Teslim alındığında stok otomatik güncellenir.', color: C.gold },
  { icon: Truck, title: 'Sevk edin', desc: 'Üretim bitti mi? Sevkiyat emri oluşturun, nakliye ve teslimatı izleyin.', detail: 'Stok hareketleri otomatik güncellenir. İrsaliye, fatura ve nakliye bilgisi kaydedilir.', color: '#D46B2A' },
  { icon: CheckCircle, title: 'Tamamlayın', desc: 'Sipariş teslim edildi. Gerçek maliyet ve kâr raporunuz hazır.', detail: 'Siparişten teslimata kadar geçen tüm süreç tek ekrandan görülür ve raporlanır. "Bu sipariş bize ne kazandırdı?" sorusunun cevabı burada.', color: '#3DB88A' },
];

export default function InteractiveShowcase() {
  const [active, setActive] = useState(0);

  return (
    <section aria-labelledby="howit-title" style={{
      padding: '120px 24px',
      background: C.s1,
    }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
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
          }}>İş akışı</p>
          <h2 id="howit-title" style={{
            fontFamily: F, fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800,
            color: C.text, letterSpacing: '-0.03em',
          }}>
            Siparişten teslimata, altı adım
          </h2>
        </motion.div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 40,
          alignItems: 'start',
        }}>
          {/* Step list */}
          <div role="tablist" aria-label="İş akışı adımları" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = active === i;
              return (
                <button
                  key={i}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="step-detail"
                  onClick={() => setActive(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                    background: isActive ? C.s2 : 'transparent',
                    border: isActive ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
                    transition: 'all 0.25s ease',
                    textAlign: 'left', width: '100%',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: isActive ? `${s.color}0C` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isActive ? `${s.color}20` : 'rgba(255,255,255,0.04)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.25s ease',
                  }}>
                    <Icon size={16} color={isActive ? s.color : C.muted} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div style={{
                      fontFamily: F, fontSize: 13.5, fontWeight: 700,
                      color: isActive ? C.text : C.sub,
                      letterSpacing: '-0.01em', transition: 'color 0.2s',
                    }}>{s.title}</div>
                    <div style={{
                      fontFamily: FB, fontSize: 11.5, color: C.muted,
                      lineHeight: 1.4, marginTop: 2,
                    }}>{s.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          <div id="step-detail" role="tabpanel">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease }}
                style={{
                  background: C.s2, ...GLASS,
                  borderRadius: 16, padding: '44px 36px',
                  minHeight: 340,
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}
              >
                <span style={{
                  fontFamily: F, fontSize: 56, fontWeight: 900,
                  color: 'rgba(255,255,255,0.03)', lineHeight: 1,
                  marginBottom: 20, display: 'block',
                }}>0{active + 1}</span>

                <h3 style={{
                  fontFamily: F, fontSize: 24, fontWeight: 800,
                  color: C.text, marginBottom: 14, letterSpacing: '-0.02em',
                }}>{steps[active].title}</h3>

                <p style={{
                  fontFamily: FB, fontSize: 15, lineHeight: 1.75,
                  color: C.sub, maxWidth: 440,
                }}>{steps[active].detail}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            section > div > div:last-of-type { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}
