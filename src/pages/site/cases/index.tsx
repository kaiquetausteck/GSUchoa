import { Filter } from "lucide-react";
import { useEffect, useState } from "react";

import { CaseStudyCard } from "../../../components/site/CaseStudyCard";
import { CaseStudyCardSkeleton } from "../../../components/site/CaseStudyCardSkeleton";
import { SiteRouteShell } from "../../../components/site/SiteRouteShell";
import { SitePagination } from "../../../components/site/SitePagination";
import {
  listPublicPortfolio,
  listPublicPortfolioCategories,
  type PublicPortfolioListItem,
} from "../../../services/site/portfolio-api";

const ALL_FILTER = "Todos";

export default function CasesPage() {
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);
  const [filters, setFilters] = useState<string[]>([ALL_FILTER]);
  const [items, setItems] = useState<PublicPortfolioListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const categories = await listPublicPortfolioCategories();

        if (!isMounted) {
          return;
        }

        setFilters([ALL_FILTER, ...categories]);
      } catch {
        if (isMounted) {
          setFilters([ALL_FILTER]);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    void (async () => {
      try {
        const response = await listPublicPortfolio({
          category: activeFilter === ALL_FILTER ? undefined : activeFilter,
          page,
          perPage: 12,
          sort: "publishedAt-desc",
        });

        if (!isMounted) {
          return;
        }

        setItems(response.items);
        setTotalPages(response.totalPages);
        setErrorMessage(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setItems([]);
        setTotalPages(1);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar os cases publicados.",
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
  }, [activeFilter, page]);

  return (
    <SiteRouteShell activeNavKey="cases">
      <section className="relative overflow-hidden py-24 md:py-28">
        <div className="hero-gradient absolute inset-0 opacity-25" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <div className="max-w-4xl">
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.36em] text-primary">
              Nosso Portfolio
            </p>
            <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl">
              Cases organizados para explorar por <span className="text-gradient">setor e contexto.</span>
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
              Uma visao expandida dos projetos da GSUCHOA, com filtros por categoria e acesso
              rapido ao contexto, a solucao aplicada e ao resultado de cada entrega.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant/12 bg-surface-container-high px-4 py-3 text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">
              <Filter className="h-4 w-4 text-primary" />
              Filtrar por categoria
            </div>
            {filters.map((filter) => (
              <button
                className={`rounded-full border px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] transition-colors ${
                  activeFilter === filter
                    ? "border-primary bg-primary text-white"
                    : "border-outline-variant/15 bg-surface-container-low text-on-surface-variant hover:border-primary/24 hover:text-primary"
                }`}
                key={filter}
                onClick={() => {
                  setPage(1);
                  setActiveFilter(filter);
                }}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="mt-16 flex items-center justify-between gap-6">
            <p className="text-sm text-on-surface-variant">
              {isLoading
                ? "Carregando cases..."
                : `${items.length} case${items.length === 1 ? "" : "s"} nesta pagina.`}
            </p>
          </div>

          {errorMessage ? (
            <div className="mt-10 rounded-[2rem] border border-outline-variant/12 bg-surface-container-low px-8 py-10 text-center">
              <p className="text-sm font-semibold text-on-surface">Nao foi possivel carregar os cases.</p>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                {errorMessage}
              </p>
            </div>
          ) : (
            <>
              <div className="mt-10 grid gap-8 lg:grid-cols-2">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <CaseStudyCardSkeleton key={index} />
                    ))
                  : items.map((caseStudy) => (
                      <CaseStudyCard caseStudy={caseStudy} from="/cases" key={caseStudy.slug} />
                    ))}
              </div>

              {!isLoading ? (
                <SitePagination
                  currentPage={page}
                  onPageChange={setPage}
                  totalPages={totalPages}
                />
              ) : null}
            </>
          )}
        </div>
      </section>
    </SiteRouteShell>
  );
}
