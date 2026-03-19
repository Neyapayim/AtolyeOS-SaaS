import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { C, F, FB } from '../config/constants.js';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { label: 'Özellikler', href: '#ozellikler' },
    { label: 'Nasıl Çalışır?', href: '#nasil' },
    { label: 'Müşteriler', href: '#musteriler' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: scrolled ? '12px 24px' : '20px 24px',
          transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
          background: scrolled ? 'rgba(6,6,8,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.04)' : '1px solid transparent',
        }}
      >
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{
              fontFamily: F, fontSize: 20, fontWeight: 900,
              backgroundImage: `linear-gradient(135deg, ${C.text}, ${C.cyan})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>Atölye OS</div>
          </Link>

          {/* Desktop links */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 32,
          }}>
            {navItems.map((item, i) => (
              <a key={i} href={item.href} style={{
                fontFamily: FB, fontSize: 13.5, fontWeight: 500,
                color: C.sub, textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = C.text}
              onMouseLeave={e => e.currentTarget.style.color = C.sub}
              >{item.label}</a>
            ))}

            <Link to="/login" style={{
              fontFamily: FB, fontSize: 13.5, fontWeight: 500,
              color: C.sub, textDecoration: 'none',
              transition: 'color 0.2s',
            }}>Giriş Yap</Link>

            <Link to="/register" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
                  borderRadius: 10, padding: '9px 20px',
                  fontWeight: 600, fontSize: 13, color: '#0C0800',
                  fontFamily: FB, cursor: 'pointer',
                }}
              >
                Ücretsiz Başla
                <ArrowRight size={14} />
              </motion.div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none', background: 'none', border: 'none',
              color: C.text, cursor: 'pointer', padding: 4,
            }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'fixed', top: 60, left: 0, right: 0, zIndex: 99,
              background: 'rgba(6,6,8,0.95)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16,
            }}
          >
            {navItems.map((item, i) => (
              <a key={i} href={item.href} onClick={() => setMobileOpen(false)} style={{
                fontFamily: FB, fontSize: 15, color: C.sub,
                textDecoration: 'none', padding: '8px 0',
              }}>{item.label}</a>
            ))}
            <Link to="/login" onClick={() => setMobileOpen(false)} style={{
              fontFamily: FB, fontSize: 15, color: C.sub,
              textDecoration: 'none', padding: '8px 0',
            }}>Giriş Yap</Link>
            <Link to="/register" onClick={() => setMobileOpen(false)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: `linear-gradient(135deg, ${C.cyan}, ${C.gold})`,
              borderRadius: 10, padding: '12px 24px', width: 'fit-content',
              fontWeight: 600, fontSize: 14, color: '#0C0800',
              fontFamily: FB, textDecoration: 'none',
            }}>
              Ücretsiz Başla <ArrowRight size={14} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          nav > div > div:nth-child(2) { display: none !important; }
        }
      `}</style>
    </>
  );
}
