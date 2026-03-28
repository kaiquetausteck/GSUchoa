import { AboutSection } from "../../components/site/AboutSection";
import { ContactSection } from "../../components/site/ContactSection";
import { CtaSection } from "../../components/site/CtaSection";
import { HeroSection } from "../../components/site/HeroSection";
import { PortfolioSection } from "../../components/site/PortfolioSection";
import { ProcessSection } from "../../components/site/ProcessSection";
import { ResultsSection } from "../../components/site/ResultsSection";
import { ServicesSection } from "../../components/site/ServicesSection";
import { SiteFooter } from "../../components/site/SiteFooter";
import { SiteNavbar } from "../../components/site/SiteNavbar";
import { TestimonialsSection } from "../../components/site/TestimonialsSection";
import { useSectionAnchors } from "../../hooks/site/useSectionAnchors";

export default function SitePage() {
  const { activeSectionId, navigateToSection } = useSectionAnchors();

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <SiteNavbar
        activeSectionId={activeSectionId}
        onNavigate={navigateToSection}
      />
      <main>
        <HeroSection onNavigate={navigateToSection} />
        <ResultsSection />
        <AboutSection onNavigate={navigateToSection} />
        <ServicesSection />
        <ProcessSection />
        <PortfolioSection onNavigate={navigateToSection} />
        <TestimonialsSection />
        <ContactSection />
        <CtaSection onNavigate={navigateToSection} />
      </main>
      <SiteFooter onNavigate={navigateToSection} />
    </div>
  );
}
