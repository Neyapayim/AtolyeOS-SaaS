import { C, FB } from '../config/constants.js';
import Navbar from './Navbar.jsx';
import HeroSection from './HeroSection.jsx';
import TrustedBy from './TrustedBy.jsx';
import FeaturesBento from './FeaturesBento.jsx';
import InteractiveShowcase from './InteractiveShowcase.jsx';
import Stats from './Stats.jsx';
import Testimonials from './Testimonials.jsx';
import FinalCTA from './FinalCTA.jsx';
import Footer from './Footer.jsx';

/*
  ÖNEMLİ: Ana wrapper'da overflowX: 'hidden' KULLANILMIYOR.
  Bu, useScroll'un window scroll'unu doğru okumasını sağlar.
  Taşan bölümler (orbs vb.) kendi section overflow:hidden'larıyla kontrol edilir.
*/
export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      color: C.text,
      fontFamily: FB,
    }}>
      <Navbar />
      <div style={{ overflowX: 'hidden' }}>
        <HeroSection />
        <TrustedBy />
      </div>
      <div id="ozellikler" style={{ overflowX: 'hidden' }}>
        <FeaturesBento />
      </div>
      <div style={{ overflowX: 'hidden' }}>
        <Stats />
      </div>
      {/* InteractiveShowcase kendi 400vh section'ı — overflow yok, useScroll serbest */}
      <div id="nasil">
        <InteractiveShowcase />
      </div>
      <div id="musteriler" style={{ overflowX: 'hidden' }}>
        <Testimonials />
      </div>
      <div style={{ overflowX: 'hidden' }}>
        <FinalCTA />
      </div>
      <Footer />
    </div>
  );
}
