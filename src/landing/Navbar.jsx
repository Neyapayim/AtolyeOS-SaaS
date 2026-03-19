import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

const links = [
  { label: 'Özellikler', href: '#ozellikler' },
  { label: 'Nasıl Çalışır', href: '#nasil' },
  { label: 'Müşteriler', href: '#musteriler' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <>
      <nav
        role="navigation"
        aria-label="Ana navigasyon"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: scrolled ? '14px 24px' : '20px 24px',
          background: scrolled ? 'rgba(6,6,8,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.04)' : '1px solid transparent',
          transition: 'all 0.35s ease',
        }}
      >
        <div style={{
          maxWidth: 1080, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link to="/" style={{ textDecoration: 'none' }} aria-label="Ana sayfa">
            <span style={{
              fontFamily: F, fontSize: 18, fontWeight: 800,
              color: C.text, letterSpacing: '-0.03em',
            }}>Atölye OS</span>
          </Link>

          {/* Desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="nav-desktop">
            {links.map((l, i) => (
              <a key={i} href={l.href} style={{
                fontFamily: FB, fontSize: 13.5, fontWeight: 450,
                color: C.sub, textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = C.text}
              onMouseLeave={e => e.currentTarget.style.color = C.sub}
              >{l.label}</a>
            ))}
            <Link to="/login" style={{
              fontFamily: FB, fontSize: 13.5, fontWeight: 450,
              color: C.sub, textDecoration: 'none',
            }}>Giriş</Link>
            <Link to="/register" style={{
              fontFamily: FB, fontSize: 13.5, fontWeight: 600,
              color: '#0C0800', textDecoration: 'none',
              background: C.cyan, borderRadius: 8,
              padding: '8px 18px',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >Ücretsiz Başla</Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={open}
            className="nav-mobile-btn"
            style={{
              display: 'none', background: 'none', border: 'none',
              color: C.text, cursor: 'pointer', padding: 4,
            }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            role="menu"
            style={{
              position: 'fixed', top: 56, left: 0, right: 0, zIndex: 99,
              background: 'rgba(6,6,8,0.96)',
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12,
            }}
          >
            {links.map((l, i) => (
              <a key={i} href={l.href} role="menuitem" onClick={() => setOpen(false)} style={{
                fontFamily: FB, fontSize: 15, color: C.sub, textDecoration: 'none', padding: '8px 0',
              }}>{l.label}</a>
            ))}
            <Link to="/login" role="menuitem" onClick={() => setOpen(false)} style={{
              fontFamily: FB, fontSize: 15, color: C.sub, textDecoration: 'none', padding: '8px 0',
            }}>Giriş</Link>
            <Link to="/register" role="menuitem" onClick={() => setOpen(false)} style={{
              fontFamily: FB, fontSize: 14, fontWeight: 600, color: '#0C0800',
              background: C.cyan, borderRadius: 8, padding: '12px 20px',
              textDecoration: 'none', width: 'fit-content',
            }}>Ücretsiz Başla</Link>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .nav-mobile-btn { display: block !important; }
          .nav-desktop { display: none !important; }
        }
      `}</style>
    </>
  );
}
