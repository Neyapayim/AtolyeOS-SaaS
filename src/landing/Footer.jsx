import { Link } from 'react-router-dom';
import { C, F, FB } from '../config/constants.js';

const cols = [
  { title: 'Ürün', links: [{ l: 'Özellikler', h: '#ozellikler' }, { l: 'İş Akışı', h: '#nasil' }, { l: 'Fiyatlandırma', h: '#' }] },
  { title: 'Şirket', links: [{ l: 'Hakkımızda', h: '#' }, { l: 'Blog', h: '#' }, { l: 'İletişim', h: '#' }] },
  { title: 'Destek', links: [{ l: 'Yardım', h: '#' }, { l: 'Dokümantasyon', h: '#' }, { l: 'Durum', h: '#' }] },
  { title: 'Yasal', links: [{ l: 'Gizlilik', h: '#' }, { l: 'Koşullar', h: '#' }, { l: 'KVKK', h: '#' }] },
];

export default function Footer() {
  return (
    <footer role="contentinfo" style={{
      borderTop: '1px solid rgba(255,255,255,0.04)',
      padding: '72px 24px 40px',
    }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 56, marginBottom: 56 }}>
          {/* Brand */}
          <div>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontFamily: F, fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: '-0.03em' }}>Atölye OS</span>
            </Link>
            <p style={{ fontFamily: FB, fontSize: 13, lineHeight: 1.7, color: C.muted, marginTop: 14 }}>
              Üretim atölyeleri için sipariş, stok, maliyet ve tedarik yönetim platformu.
            </p>
          </div>

          {/* Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {cols.map((c, i) => (
              <div key={i}>
                <h4 style={{ fontFamily: FB, fontSize: 11, fontWeight: 600, color: C.sub, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>{c.title}</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {c.links.map((link, j) => (
                    <li key={j}>
                      <a href={link.h} style={{ fontFamily: FB, fontSize: 13, color: C.muted, textDecoration: 'none', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = C.sub}
                        onMouseLeave={e => e.currentTarget.style.color = C.muted}
                      >{link.l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', marginBottom: 28 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontFamily: FB, fontSize: 12, color: C.muted }}>© {new Date().getFullYear()} Atölye OS</p>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Twitter', 'LinkedIn'].map(s => (
              <a key={s} href="#" style={{ fontFamily: FB, fontSize: 12, color: C.muted, textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = C.sub}
                onMouseLeave={e => e.currentTarget.style.color = C.muted}
              >{s}</a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          footer > div > div:first-child { grid-template-columns: 1fr !important; gap: 32px !important; }
          footer > div > div:first-child > div:last-child { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </footer>
  );
}
