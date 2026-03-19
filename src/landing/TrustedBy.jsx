import { C, F, FB } from '../config/constants.js';

const sectors = [
  'Mobilya Atölyeleri',
  'Metal İşleme',
  'CNC & Torna',
  'Tekstil Üretimi',
  'Fason İmalat',
  'Makine Atölyeleri',
  'Mobilya Atölyeleri',
  'Metal İşleme',
  'CNC & Torna',
  'Tekstil Üretimi',
  'Fason İmalat',
  'Makine Atölyeleri',
];

export default function TrustedBy() {
  return (
    <section aria-label="Hizmet verilen sektörler" style={{
      padding: '48px 0',
      borderTop: '1px solid rgba(255,255,255,0.03)',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
      overflow: 'hidden',
    }}>
      <p style={{
        textAlign: 'center', fontSize: 11, fontFamily: FB,
        color: C.muted, letterSpacing: '2px', textTransform: 'uppercase',
        fontWeight: 500, marginBottom: 28,
      }}>
        Her sektörden atölye kullanıyor
      </p>
      <div style={{
        display: 'flex', width: 'max-content',
        animation: 'landing-marquee 40s linear infinite',
      }}>
        {sectors.map((name, i) => (
          <span key={i} style={{
            padding: '0 36px', whiteSpace: 'nowrap',
            fontFamily: F, fontSize: 13, fontWeight: 700,
            color: C.muted, letterSpacing: '0.02em',
          }}>{name}</span>
        ))}
      </div>
    </section>
  );
}
