import { ArrowLeft, ArrowUpRight, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { CaseMediaDialog } from "../../../components/site/CaseMediaDialog";
import { CaseStudyCard } from "../../../components/site/CaseStudyCard";
import { CaseStudyCardSkeleton } from "../../../components/site/CaseStudyCardSkeleton";
import { SiteRouteShell } from "../../../components/site/SiteRouteShell";
import {
  getPublicPortfolioBySlug,
  listFeaturedPublicPortfolio,
  listPublicPortfolio,
  type PublicPortfolioDetail,
  type PublicPortfolioListItem,
} from "../../../services/site/portfolio-api";

function CaseDetailsSkeleton() {
  return (
    <article className="pb-24">
      <section className="relative overflow-hidden py-20">
        <div className="hero-gradient absolute inset-0 opacity-20" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <div className="h-4 w-24 animate-pulse rounded-full bg-surface-container-high" />

          <div className="mt-10 grid gap-14 xl:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="mb-6 flex gap-2">
                <div className="h-8 w-24 animate-pulse rounded-full bg-surface-container-high" />
                <div className="h-8 w-24 animate-pulse rounded-full bg-surface-container-high" />
              </div>
              <div className="h-3 w-48 animate-pulse rounded-full bg-surface-container-high" />
              <div className="mt-6 h-16 w-4/5 animate-pulse rounded-[1.5rem] bg-surface-container-high" />
              <div className="mt-8 h-24 w-full animate-pulse rounded-[1.5rem] bg-surface-container-high" />

              <div className="mt-12 grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    className="rounded-[1.75rem] border border-outline-variant/12 bg-surface-container-low p-5"
                    key={index}
                  >
                    <div className="h-3 w-16 animate-pulse rounded-full bg-surface-container-high" />
                    <div className="mt-3 h-5 w-24 animate-pulse rounded-full bg-surface-container-high" />
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-[2.5rem] border border-outline-variant/12 bg-surface-container-low">
              <div className="aspect-[16/14] h-full w-full animate-pulse bg-surface-container-high" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 md:px-8">
        <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] border border-outline-variant/12 bg-surface-container-low p-8">
            <div className="h-3 w-16 animate-pulse rounded-full bg-surface-container-high" />
            <div className="mt-6 flex flex-wrap gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  className="h-11 w-28 animate-pulse rounded-full bg-surface-container-high"
                  key={index}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                className="rounded-[2rem] border border-outline-variant/12 bg-surface-container-low p-7"
                key={index}
              >
                <div className="h-3 w-20 animate-pulse rounded-full bg-surface-container-high" />
                <div className="mt-4 h-24 animate-pulse rounded-[1.5rem] bg-surface-container-high" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 md:px-8">
        <div className="mb-10">
          <div className="h-3 w-28 animate-pulse rounded-full bg-surface-container-high" />
          <div className="mt-4 h-10 w-72 animate-pulse rounded-[1.5rem] bg-surface-container-high" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              className="overflow-hidden rounded-[2rem] border border-outline-variant/12 bg-surface-container-low"
              key={index}
            >
              <div className="aspect-[16/10] animate-pulse bg-surface-container-high" />
              <div className="p-5">
                <div className="h-4 w-4/5 animate-pulse rounded-full bg-surface-container-high" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

export default function CaseDetailsPage() {
  const { slug = "" } = useParams();
  const location = useLocation();
  const [caseStudy, setCaseStudy] = useState<PublicPortfolioDetail | null>(null);
  const [relatedCases, setRelatedCases] = useState<PublicPortfolioListItem[]>([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRelatedLoading, setIsRelatedLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const backTarget =
    typeof (location.state as { from?: string } | null)?.from === "string"
      ? (location.state as { from?: string }).from!
      : "/cases";

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsRelatedLoading(true);

    void (async () => {
      try {
        const detail = await getPublicPortfolioBySlug(slug);

        if (!isMounted) {
          return;
        }

        setCaseStudy(detail);
        setActiveMediaIndex(null);
        setErrorMessage(null);

        try {
          const primaryCategory = detail.categories[0];
          const relatedFromCategory = primaryCategory
            ? await listPublicPortfolio({
                category: primaryCategory,
                page: 1,
                perPage: 3,
                sort: "publishedAt-desc",
              })
            : null;

          let nextRelated = (relatedFromCategory?.items ?? [])
            .filter((item) => item.slug !== detail.slug)
            .slice(0, 2);

          if (nextRelated.length < 2) {
            const featuredItems = await listFeaturedPublicPortfolio();
            const seenSlugs = new Set([detail.slug, ...nextRelated.map((item) => item.slug)]);

            nextRelated = [
              ...nextRelated,
              ...featuredItems.filter((item) => {
                if (seenSlugs.has(item.slug)) {
                  return false;
                }

                seenSlugs.add(item.slug);
                return true;
              }),
            ].slice(0, 2);
          }

          if (isMounted) {
            setRelatedCases(nextRelated);
          }
        } catch {
          if (isMounted) {
            setRelatedCases([]);
          }
        } finally {
          if (isMounted) {
            setIsRelatedLoading(false);
          }
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setCaseStudy(null);
        setRelatedCases([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar esse estudo de caso.",
        );
        setIsRelatedLoading(false);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <SiteRouteShell activeNavKey="cases">
        <CaseDetailsSkeleton />
      </SiteRouteShell>
    );
  }

  if (!caseStudy) {
    return (
      <SiteRouteShell activeNavKey="cases">
        <section className="mx-auto max-w-7xl px-6 py-28 md:px-8">
          <div className="max-w-2xl rounded-[2.25rem] border border-outline-variant/12 bg-surface-container-low p-10">
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-primary">
              Case nao encontrado
            </p>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-on-surface">
              Esse estudo de caso nao existe ou ainda nao foi publicado.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-on-surface-variant">
              {errorMessage ?? "Enquanto isso, voce pode voltar para a listagem geral e navegar pelos outros projetos."}
            </p>
            <Link
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-white"
              to={backTarget}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>
        </section>
      </SiteRouteShell>
    );
  }

  return (
    <SiteRouteShell activeNavKey="cases">
      <article className="pb-24">
        <section className="relative overflow-hidden py-20">
          <div className="hero-gradient absolute inset-0 opacity-20" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
            <Link
              className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant transition-colors hover:text-primary"
              to={backTarget}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>

            <div className="mt-10 grid gap-14 xl:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="mb-6 flex flex-wrap gap-2">
                  <span className="rounded-full border border-outline-variant/12 bg-surface-container-low px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                    {caseStudy.sector}
                  </span>
                  {caseStudy.categories.map((category) => (
                    <span
                      className="rounded-full border border-outline-variant/12 bg-surface-container-low px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant"
                      key={category}
                    >
                      {category}
                    </span>
                  ))}
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.34em] text-primary">
                  Estudo de Caso • {caseStudy.client} • {caseStudy.year}
                </p>
                <h1 className="mt-6 text-5xl font-black leading-none tracking-tight md:text-7xl">
                  {caseStudy.name}
                </h1>
                <p className="mt-8 max-w-3xl text-xl leading-relaxed text-on-surface-variant">
                  {caseStudy.overview}
                </p>

                <div className="mt-12 grid gap-4 md:grid-cols-3">
                  {[
                    { label: "Problema", value: caseStudy.labels.problem },
                    { label: "Solucao", value: caseStudy.labels.solution },
                    { label: "Resultado", value: caseStudy.labels.result },
                  ].map((item) => (
                    <div
                      className="rounded-[1.75rem] border border-outline-variant/12 bg-surface-container-low p-5"
                      key={item.label}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                        {item.label}
                      </p>
                      <p className={`mt-3 text-base font-semibold leading-relaxed ${item.label === "Resultado" ? "text-primary" : "text-on-surface"}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[2.5rem] border border-outline-variant/12 bg-surface-container-low">
                <img
                  alt={caseStudy.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  src={caseStudy.thumbnail}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8 md:px-8">
          <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-[2rem] border border-outline-variant/12 bg-surface-container-low p-8">
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-primary">
                Escopo
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {caseStudy.scope.map((item) => (
                  <span
                    className="rounded-full border border-outline-variant/12 bg-surface px-4 py-3 text-xs font-semibold text-on-surface"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {caseStudy.story.map((block) => (
                <div
                  className="rounded-[2rem] border border-outline-variant/12 bg-surface-container-low p-7"
                  key={`${block.title}-${block.sortOrder}`}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">
                    {block.title}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                    {block.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8 md:px-8">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-primary">
                Galeria do projeto
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight text-on-surface">
                Assets e registros do case
              </h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {caseStudy.media.map((media, index) => (
              <button
                aria-label={media.alt}
                className={`group overflow-hidden rounded-[2rem] border border-outline-variant/12 bg-surface-container-low text-left transition-colors hover:border-primary/24 ${
                  index === 0 ? "md:col-span-2" : ""
                }`}
                key={`${media.src}-${index}`}
                onClick={() => setActiveMediaIndex(index)}
                type="button"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                  {media.type === "image" ? (
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.02]"
                      style={{ backgroundImage: `url("${media.src}")` }}
                    />
                  ) : (
                    <>
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-cover bg-center"
                        style={media.poster ? { backgroundImage: `url("${media.poster}")` } : undefined}
                      />
                      <div className="absolute inset-0 bg-background/35 transition-colors group-hover:bg-background/24" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-[0_20px_40px_rgba(34,98,240,0.28)] transition-transform duration-300 group-hover:scale-105">
                          <PlayCircle className="h-8 w-8" />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/45 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/88 backdrop-blur-md">
                    {media.type === "image" ? "Abrir imagem" : "Assistir video"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pt-12 md:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-primary">
                Continuar explorando
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight text-on-surface">
                Outros cases no mesmo ecossistema
              </h2>
            </div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-bold text-primary"
              to="/cases"
            >
              Ver biblioteca completa
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {isRelatedLoading
              ? Array.from({ length: 2 }).map((_, index) => (
                  <CaseStudyCardSkeleton key={index} />
                ))
              : relatedCases.map((item) => (
                  <CaseStudyCard
                    caseStudy={item}
                    className="h-full"
                    from={backTarget}
                    key={item.slug}
                  />
                ))}
          </div>
        </section>
      </article>

      <CaseMediaDialog
        media={activeMediaIndex !== null ? caseStudy.media[activeMediaIndex] ?? null : null}
        onClose={() => setActiveMediaIndex(null)}
        open={activeMediaIndex !== null}
      />
    </SiteRouteShell>
  );
}
