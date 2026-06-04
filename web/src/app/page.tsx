import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeatureSection } from '@/components/landing/FeatureSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { Footer } from '@/components/layout/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <StatsSection />
      <Footer />
    </main>
  );
}
