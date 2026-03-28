import { ArrowLeft, Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { SiteRouteShell } from "../../../components/site/SiteRouteShell";
import { TestimonialCard } from "../../../components/site/TestimonialCard";
import { TestimonialCardSkeleton } from "../../../components/site/TestimonialCardSkeleton";
import { TestimonialStars } from "../../../components/site/TestimonialStars";
import {
  getPublicTestimonialById,
  listFeaturedPublicTestimonials,
  listPublicTestimonials,
  type PublicTestimonial,
} from "../../../services/site/testimonials-api";

function TestimonialDetailsSkeleton() {
  return (
    <article className="pb-24">
      <section className="relative overflow-hidden py-20">
        <div className="hero-gradient absolute inset-0 opacity-20" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <div className="h-4 w-24 animate-pulse rounded-full bg-surface-container-high" />
          <div className="mt-10 grid gap-12 xl:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="h-4 w-40 animate-pulse rounded-full bg-surface-container-high" />
              <div className="mt-6 h-16 w-4/5 animate-pulse rounded-[1.5rem] bg-surface-container-high" />
              <div className="mt-8 h-32 w-full animate-pulse rounded-[1.5rem] bg-surface-container-high" />
            </div>
            <div className="panel-card-muted rounded-[2.25rem] border p-8">
              <div className="h-4 w-24 animate-pulse rounded-full bg-surface-container-high" />
              <div className="mt-4 h-8 w-28 animate-pulse rounded-full bg-surface-container-high" />
              <div className="mt-5 h-4 w-4/5 animate-pulse rounded-full bg-surface-container-high" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 md:px-8">
        <div className="mb-10 h-10 w-72 animate-pulse rounded-[1.5rem] bg-surface-container-high" />
        <div className="grid gap-8 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <TestimonialCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </article>
  );
}

export default function TestimonialDetailsPage() {
  const { id = "" } = useParams();
  const location = useLocation();
  const [testimonial, setTestimonial] = useState<PublicTestimonial | null>(null);
  const [relatedTestimonials, setRelatedTestimonials] = useState<PublicTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRelatedLoading, setIsRelatedLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const backTarget =
    typeof (location.state as { from?: string } | null)?.from === "string"
      ? (location.state as { from?: string }).from!
      : "/depoimentos";

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsRelatedLoading(true);

    void (async () => {
      try {
        const detail = await getPublicTestimonialById(id);

        if (!isMounted) {
          return;
        }

        setTestimonial(detail);
        setErrorMessage(null);

        try {
          const [featuredItems, allItems] = await Promise.all([
            listFeaturedPublicTestimonials(),
            listPublicTestimonials(),
          ]);

          const seenIds = new Set<string>([detail.id]);
          const nextRelated = [...featuredItems, ...allItems].filter((item) => {
            if (seenIds.has(item.id)) {
              return false;
            }

            seenIds.add(item.id);
            return true;
          }).slice(0, 2);

          if (isMounted) {
            setRelatedTestimonials(nextRelated);
          }
        } catch {
          if (isMounted) {
            setRelatedTestimonials([]);
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

        setTestimonial(null);
        setRelatedTestimonials([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar esse depoimento.",
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
  }, [id]);

  if (isLoading) {
    return (
      <SiteRouteShell activeNavKey="depoimentos">
        <TestimonialDetailsSkeleton />
      </SiteRouteShell>
    );
  }

  if (!testimonial) {
    return (
      <SiteRouteShell activeNavKey="depoimentos">
        <section className="mx-auto max-w-7xl px-6 py-28 md:px-8">
          <div className="max-w-2xl rounded-[2.25rem] border border-outline-variant/12 bg-surface-container-low p-10">
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-primary">
              Depoimento nao encontrado
            </p>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-on-surface">
              Esse depoimento nao existe ou ainda nao foi publicado.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-on-surface-variant">
              {errorMessage ?? "Voce pode voltar para a listagem geral e navegar pelos outros relatos publicados."}
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
    <SiteRouteShell activeNavKey="depoimentos">
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

            <div className="mt-10 grid gap-12 xl:grid-cols-[1.05fr_0.95fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.34em] text-primary">
                  {testimonial.brand}
                </p>
                <h1 className="mt-6 text-5xl font-black leading-none tracking-tight md:text-7xl">
                  Relato de <span className="text-gradient">{testimonial.authorName}</span>
                </h1>
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                  {testimonial.authorRole}
                </p>

                <div className="mt-8">
                  <TestimonialStars rating={testimonial.rating} size="md" />
                </div>

                <p className="mt-8 max-w-3xl text-2xl font-semibold leading-relaxed text-on-surface md:text-3xl">
                  "{testimonial.message}"
                </p>
              </div>

              <div className="rounded-[2.25rem] border border-outline-variant/12 bg-surface-container-low p-8 md:p-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] border border-outline-variant/12 bg-surface text-primary">
                  <Quote className="h-5 w-5" />
                </div>

                <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.26em] text-primary">
                  Marca
                </p>
                <p className="mt-3 text-2xl font-black text-on-surface">{testimonial.brand}</p>

                {(testimonial.highlightValue || testimonial.highlightLabel) ? (
                  <div className="mt-8 rounded-[1.75rem] border border-outline-variant/12 bg-surface px-5 py-5">
                    {testimonial.highlightValue ? (
                      <p className="text-4xl font-black text-primary">{testimonial.highlightValue}</p>
                    ) : null}
                    {testimonial.highlightLabel ? (
                      <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                        {testimonial.highlightLabel}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-8 text-sm leading-relaxed text-on-surface-variant">
                    Um relato publicado para documentar percepcao de valor, clareza estrategica e resultado percebido na parceria com a GSUCHOA.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8 md:px-8">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-primary">
              Outros relatos
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-on-surface">
              Continue explorando outras vozes da escala.
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {isRelatedLoading
              ? Array.from({ length: 2 }).map((_, index) => (
                  <TestimonialCardSkeleton key={index} />
                ))
              : relatedTestimonials.map((item) => (
                  <TestimonialCard key={item.id} testimonial={item} />
                ))}
          </div>
        </section>
      </article>
    </SiteRouteShell>
  );
}
