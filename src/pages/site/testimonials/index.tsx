import { Quote } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { SiteRouteShell } from "../../../components/site/SiteRouteShell";
import { SitePagination } from "../../../components/site/SitePagination";
import { TestimonialCard } from "../../../components/site/TestimonialCard";
import { TestimonialCardSkeleton } from "../../../components/site/TestimonialCardSkeleton";
import {
  listFeaturedPublicTestimonials,
  listPublicTestimonials,
  type PublicTestimonial,
} from "../../../services/site/testimonials-api";

const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "featured", label: "Destaques" },
] as const;

const ITEMS_PER_PAGE = 6;

export default function TestimonialsPagePublic() {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [items, setItems] = useState<PublicTestimonial[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    void (async () => {
      try {
        const nextItems =
          activeFilter === "featured"
            ? await listFeaturedPublicTestimonials()
            : await listPublicTestimonials();

        if (!isMounted) {
          return;
        }

        setItems(nextItems);
        setErrorMessage(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setItems([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar os depoimentos publicados.",
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
  }, [activeFilter]);

  useEffect(() => {
    setPage(1);
  }, [activeFilter]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  }, [items, page]);

  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));

  return (
    <SiteRouteShell activeNavKey="depoimentos">
      <section className="relative overflow-hidden py-24 md:py-28">
        <div className="hero-gradient absolute inset-0 opacity-25" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <div className="max-w-4xl">
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.36em] text-primary">
              Vozes da Escala
            </p>
            <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl">
              Prova social organizada para navegar por <span className="text-gradient">relato e contexto.</span>
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
              Uma camada editorial com depoimentos publicados, destaques e diferentes percepcoes
              sobre o impacto da GSUCHOA em operacao, marca e crescimento.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant/12 bg-surface-container-high px-4 py-3 text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">
              <Quote className="h-4 w-4 text-primary" />
              Filtrar depoimentos
            </div>
            {FILTERS.map((filter) => (
              <button
                className={`rounded-full border px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] transition-colors ${
                  activeFilter === filter.key
                    ? "border-primary bg-primary text-white"
                    : "border-outline-variant/15 bg-surface-container-low text-on-surface-variant hover:border-primary/24 hover:text-primary"
                }`}
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="mt-16 flex items-center justify-between gap-6">
            <p className="text-sm text-on-surface-variant">
              {isLoading
                ? "Carregando depoimentos..."
                : `${items.length} depoimento${items.length === 1 ? "" : "s"} encontrado${items.length === 1 ? "" : "s"}.`}
            </p>
          </div>

          {errorMessage ? (
            <div className="mt-10 rounded-[2rem] border border-outline-variant/12 bg-surface-container-low px-8 py-10 text-center">
              <p className="text-sm font-semibold text-on-surface">Nao foi possivel carregar os depoimentos.</p>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                {errorMessage}
              </p>
            </div>
          ) : (
            <>
              <div className="mt-10 grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <TestimonialCardSkeleton key={index} />
                    ))
                  : paginatedItems.map((testimonial) => (
                      <TestimonialCard from="/depoimentos" key={testimonial.id} testimonial={testimonial} />
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
