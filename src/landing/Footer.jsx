import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

const footerLinks = [
  {
    title: 'Ürün',
    links: [
      { label: 'Özellikler', href: '#ozellikler' },
      { label: 'Fiyatlandırma', href: '#fiyat' },
      { label: 'Entegrasyonlar', href: '#' },
      { label: 'Güncelleme Notları', href: '#' },
    ],
  },
  {
    title: 'Şirket',
    links: [
      { label: 'Hakkımızda', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Kariyer', href: '#' },
      { label: 'İletişim', href: '#' },
    ],
  },
  {
    title: 'Destek',
    links: [
      { label: 'Yardım Merkezi', href: '#' },
      { label: 'Dokümantasyon', href: '#' },
      { label: 'API Referansı', href: '#' },
      { label: 'Durum Sayfası', href: '#' },
    ],
  },
  {
    title: 'Yasal',
    links: [
      { label: 'Gizlilik Politikası', href: '#' },
      { label: 'Kullanım Koşulları', href: '#' },
      { label: 'KVKK', href: '#' },
      { label: 'Çerez Politikası', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.04)',
      background: C.s1,
      padding: '80px 24px 40px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Top row: Brand + Links */}
        <div style={{
          display: 'grid', gridTemplateColumns: '280px 1fr',
          gap: 64, marginBottom: 64,
        }}>
          {/* Brand */}
          <div>
            <div style={{
              fontFamily: F, fontSize: 22, fontWeight: 900,
              backgroundImage: `linear-gradient(135deg, ${C.text}, ${C.cyan})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: 16,
            }}>Atölye OS</div>
            <p style={{
              fontFamily: FB, fontSize: 13, lineHeight: 1.7,
              color: C.sub, marginBottom: 24,
            }}>
              Türkiye'nin üretim atölyeleri için tasarlanmış dijital yönetim platformu.
              Siparişten sevkiyata, stoktan maliyete — tek çatı altında.
            </p>

            {/* Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="mailto:info@atolyeos.com" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: FB, fontSize: 12.5, color: C.muted,
                textDecoration: 'none', transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = C.cyan}
              onMouseLeave={e => e.currentTarget.style.color = C.muted}
              >
                <Mail size={14} strokeWidth={1.5} />
                info@atolyeos.com
              </a>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: FB, fontSize: 12.5, color: C.muted,
              }}>
                <MapPin size={14} strokeWidth={1.5} />
                İstanbul, Türkiye
              </span>
            </div>
          </div>

          {/* Link columns */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
          }}>
            {footerLinks.map((col, i) => (
              <div key={i}>
                <h4 style={{
                  fontFamily: F, fontSize: 12, fontWeight: 700,
                  color: C.text, letterSpacing: '1px', textTransform: 'uppercase',
                  marginBottom: 20,
                }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href={link.href} style={{
                        fontFamily: FB, fontSize: 13, color: C.muted,
                        textDecoration: 'none', transition: 'color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = C.sub}
                      onMouseLeave={e => e.currentTarget.style.color = C.muted}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: 1, background: 'rgba(255,255,255,0.04)',
          marginBottom: 32,
        }} />

        {/* Bottom row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16,
        }}>
          <p style={{
            fontFamily: FB, fontSize: 12, color: C.muted,
          }}>
            © {new Date().getFullYear()} Atölye OS. Tüm hakları saklıdır.
          </p>

          <div style={{ display: 'flex', gap: 20 }}>
            {['Twitter', 'LinkedIn', 'YouTube'].map((social, i) => (
              <a key={i} href="#" style={{
                fontFamily: FB, fontSize: 12, color: C.muted,
                textDecoration: 'none', transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = C.sub}
              onMouseLeave={e => e.currentTarget.style.color = C.muted}
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 800px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          footer > div > div:first-child > div:last-child {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 500px) {
          footer > div > div:first-child > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
