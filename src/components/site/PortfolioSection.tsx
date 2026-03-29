import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { type SectionId } from "../../hooks/site/useSectionAnchors";
import { listFeaturedPublicPortfolio, type PublicPortfolioListItem } from "../../services/site/portfolio-api";
import { LogoIconAnimated } from "../shared/LogoIconAnimated";
import { CaseStudyCard } from "./CaseStudyCard";
import { CaseStudyCardSkeleton } from "./CaseStudyCardSkeleton";
import { RevealSection } from "./RevealSection";

export function PortfolioSection({
  onNavigate: _onNavigate,
}: {
  onNavigate: (sectionId: SectionId) => void;
}) {
  const [items, setItems] = useState<PublicPortfolioListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const nextItems = await listFeaturedPublicPortfolio();

        if (!isMounted) {
          return;
        }

        setItems(nextItems.slice(0, 2));
        setErrorMessage(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setItems([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os cases em destaque.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <RevealSection className="site-section relative overflow-hidden bg-surface-container-low" id="cases">
      <div className="brand-watermark pointer-events-none absolute bottom-[-10%] left-[-15%] w-[60%] select-none opacity-[0.02]">
        <LogoIconAnimated animated={false} className="logo-icon-theme h-auto w-full" decorative />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="mb-24 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Nosso portfólio
            </h2>
            <p className="text-5xl font-black leading-none tracking-tight">Cases de sucesso</p>
          </div>
          <Link
            className="group flex items-center gap-2 font-bold text-primary transition-opacity hover:opacity-80"
            to="/cases"
          >
            Ver todos os cases
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <CaseStudyCardSkeleton className="h-full" />
            <CaseStudyCardSkeleton className="h-full" />
          </div>
        ) : errorMessage ? (
          <div className="rounded-[2rem] border border-outline-variant/12 bg-surface px-8 py-10 text-center">
            <p className="text-sm font-semibold text-on-surface">Não foi possível carregar o portfólio.</p>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {errorMessage}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {items.map((caseStudy) => (
              <CaseStudyCard
                caseStudy={caseStudy}
                className="h-full"
                from="/#cases"
                key={caseStudy.slug}
              />
            ))}
          </div>
        )}
      </div>
    </RevealSection>
  );
}
