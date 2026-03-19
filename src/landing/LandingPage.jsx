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

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      color: C.text,
      fontFamily: FB,
    }}>
      <Navbar />
      {/* overflowX:hidden sadece orb/animasyon taşması olan bölümlerde */}
      <div style={{ overflowX: 'hidden' }}>
        <HeroSection />
        <TrustedBy />
        <div id="ozellikler"><FeaturesBento /></div>
        <Stats />
      </div>
      {/* InteractiveShowcase: overflow yok — useScroll serbest çalışır */}
      <InteractiveShowcase />
      <div style={{ overflowX: 'hidden' }}>
        <div id="musteriler"><Testimonials /></div>
        <FinalCTA />
        <Footer />
      </div>
    </div>
  );
}
