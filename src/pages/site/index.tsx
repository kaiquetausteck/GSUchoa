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
import { Seo } from "../../components/shared/Seo";
import {
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_TITLE,
  buildAbsoluteUrl,
  createBreadcrumbStructuredData,
} from "../../config/site/seo";
import { useSectionAnchors } from "../../hooks/site/useSectionAnchors";

export default function SitePage() {
  const { activeSectionId, navigateToSection } = useSectionAnchors();
  const structuredData = [
    createBreadcrumbStructuredData([
      { name: "Início", path: "/" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: DEFAULT_SITE_TITLE,
      description: DEFAULT_SITE_DESCRIPTION,
      url: buildAbsoluteUrl("/"),
      inLanguage: "pt-BR",
      about: [
        "Estratégia digital",
        "Design",
        "Conteúdo",
        "Tráfego pago",
      ],
    },
  ];

  return (
    <div className="site-shell min-h-screen bg-background text-on-surface">
      <Seo
        description={DEFAULT_SITE_DESCRIPTION}
        path="/"
        structuredData={structuredData}
        title={DEFAULT_SITE_TITLE}
      />
      <SiteNavbar
        activeSectionId={activeSectionId}
        onNavigate={navigateToSection}
      />
      <main className="site-shell">
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
