import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

const footerLinks = [
  { title: 'Ürün', links: [{ label: 'Özellikler', href: '#ozellikler' }, { label: 'Fiyatlandırma', href: '#fiyat' }, { label: 'Entegrasyonlar', href: '#' }, { label: 'Güncelleme Notları', href: '#' }] },
  { title: 'Şirket', links: [{ label: 'Hakkımızda', href: '#' }, { label: 'Blog', href: '#' }, { label: 'Kariyer', href: '#' }, { label: 'İletişim', href: '#' }] },
  { title: 'Destek', links: [{ label: 'Yardım Merkezi', href: '#' }, { label: 'Dokümantasyon', href: '#' }, { label: 'API Referansı', href: '#' }, { label: 'Durum Sayfası', href: '#' }] },
  { title: 'Yasal', links: [{ label: 'Gizlilik Politikası', href: '#' }, { label: 'Kullanım Koşulları', href: '#' }, { label: 'KVKK', href: '#' }, { label: 'Çerez Politikası', href: '#' }] },
];

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.035)',
      background: C.s1,
      padding: '96px 24px 48px',
    }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 72, marginBottom: 72 }}>
          {/* Brand */}
          <div>
            <div style={{
              fontFamily: F, fontSize: 24, fontWeight: 900, letterSpacing: '-1px',
              backgroundImage: `linear-gradient(135deg, ${C.text}, ${C.cyan})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: 20,
            }}>Atölye OS</div>
            <p style={{ fontFamily: FB, fontSize: 13.5, lineHeight: 1.75, color: C.sub, marginBottom: 28 }}>
              Türkiye'nin üretim atölyeleri için tasarlanmış dijital yönetim platformu.
              Excel tablolarına ve WhatsApp gruplarına veda edin.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="mailto:info@atolyeos.com" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FB, fontSize: 13, color: C.muted, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = C.cyan} onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                <Mail size={14} strokeWidth={1.4} /> info@atolyeos.com
              </a>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FB, fontSize: 13, color: C.muted }}>
                <MapPin size={14} strokeWidth={1.4} /> İstanbul, Türkiye
              </span>
            </div>
          </div>

          {/* Link columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28 }}>
            {footerLinks.map((col, i) => (
              <div key={i}>
                <h4 style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: C.text, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 22 }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {col.links.map((l, j) => (
                    <li key={j}>
                      <a href={l.href} style={{ fontFamily: FB, fontSize: 13, color: C.muted, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = C.sub} onMouseLeave={e => e.currentTarget.style.color = C.muted}>{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.035)', marginBottom: 36 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontFamily: FB, fontSize: 12, color: C.muted }}>© {new Date().getFullYear()} Atölye OS. Tüm hakları saklıdır.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Twitter', 'LinkedIn', 'YouTube'].map((s, i) => (
              <a key={i} href="#" style={{ fontFamily: FB, fontSize: 12, color: C.muted, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = C.sub} onMouseLeave={e => e.currentTarget.style.color = C.muted}>{s}</a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          footer > div > div:first-child { grid-template-columns: 1fr !important; gap: 44px !important; }
          footer > div > div:first-child > div:last-child { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 500px) {
          footer > div > div:first-child > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
