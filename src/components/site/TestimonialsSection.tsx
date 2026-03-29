import { ArrowUpRight, Quote } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  listFeaturedPublicTestimonials,
  listPublicTestimonials,
  type PublicTestimonial,
} from "../../services/site/testimonials-api";
import { RevealSection } from "./RevealSection";
import { TestimonialStars } from "./TestimonialStars";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const featuredTestimonials = await listFeaturedPublicTestimonials();
        const nextItems =
          featuredTestimonials.length > 0
            ? featuredTestimonials
            : await listPublicTestimonials();

        if (!isMounted) {
          return;
        }

        setTestimonials(nextItems.slice(0, 3));
        setErrorMessage(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setTestimonials([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os depoimentos publicados.",
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

  const [featuredTestimonial, ...secondaryTestimonials] = testimonials;

  return (
    <RevealSection className="site-section relative overflow-hidden bg-surface" id="depoimentos">
      <div className="hero-gradient absolute inset-0 opacity-20" />
      <div className="absolute left-[8%] top-24 h-48 w-48 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="mb-20 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.35em] text-primary">
              Vozes da Escala
            </p>
            <h2 className="text-5xl font-black leading-none tracking-tight md:text-6xl">
              Relatos de quem viu a marca ganhar <span className="text-gradient">densidade e resultado.</span>
            </h2>
          </div>
          <div className="max-w-xl">
            <p className="text-lg leading-relaxed text-on-surface-variant">
              Quando estratégia, design e performance passam a atuar em conjunto, a percepção da
              empresa muda por dentro e por fora. Esses relatos mostram esse ponto de virada.
            </p>
            <Link
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary"
              to="/depoimentos"
            >
              Ver todos os depoimentos
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="glass-card rounded-[2.5rem] border border-outline-variant/15 p-8 md:p-10">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div className="h-4 w-24 animate-pulse rounded-full bg-surface-container-high" />
                <div className="h-12 w-12 animate-pulse rounded-2xl bg-surface-container-high" />
              </div>
              <div className="space-y-4">
                <div className="h-8 w-full animate-pulse rounded-full bg-surface-container-high" />
                <div className="h-8 w-[92%] animate-pulse rounded-full bg-surface-container-high" />
                <div className="h-8 w-[74%] animate-pulse rounded-full bg-surface-container-high" />
              </div>
              <div className="mt-10 grid gap-6 border-t border-outline-variant/10 pt-8 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <div className="h-5 w-40 animate-pulse rounded-full bg-surface-container-high" />
                  <div className="mt-3 h-4 w-56 animate-pulse rounded-full bg-surface-container-high" />
                </div>
                <div className="rounded-[1.75rem] border border-outline-variant/15 bg-surface-container px-6 py-5 md:min-w-[14rem]">
                  <div className="h-3 w-20 animate-pulse rounded-full bg-surface-container-high" />
                  <div className="mt-4 h-10 w-24 animate-pulse rounded-full bg-surface-container-high" />
                  <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-surface-container-high" />
                </div>
              </div>
            </div>
            <div className="grid gap-6">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  className="rounded-[2rem] border border-outline-variant/15 bg-surface-container-low p-7"
                  key={index}
                >
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="h-3 w-20 animate-pulse rounded-full bg-surface-container-high" />
                      <div className="mt-3 h-4 w-32 animate-pulse rounded-full bg-surface-container-high" />
                      <div className="mt-2 h-3 w-28 animate-pulse rounded-full bg-surface-container-high" />
                    </div>
                    <div className="h-4 w-20 animate-pulse rounded-full bg-surface-container-high" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-full animate-pulse rounded-full bg-surface-container-high" />
                    <div className="h-4 w-[88%] animate-pulse rounded-full bg-surface-container-high" />
                    <div className="h-4 w-[72%] animate-pulse rounded-full bg-surface-container-high" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : errorMessage ? (
          <div className="rounded-[2rem] border border-outline-variant/15 bg-surface-container-low px-8 py-10">
            <p className="text-sm font-semibold text-on-surface">Não foi possível carregar os depoimentos.</p>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{errorMessage}</p>
          </div>
        ) : featuredTestimonial ? (
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              transition={{ duration: 0.65, ease: EASE_OUT }}
              viewport={{ once: true, amount: 0.24 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <Link
                className="glass-card block rounded-[2.5rem] border border-outline-variant/15 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/24 md:p-10"
                state={{ from: "/#depoimentos" }}
                to={`/depoimentos/${featuredTestimonial.id}`}
              >
                <div className="mb-8 flex items-center justify-between gap-4">
                  <TestimonialStars rating={featuredTestimonial.rating} size="md" />
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-outline-variant/15 bg-surface-container-high text-primary">
                    <Quote className="h-5 w-5" />
                  </div>
                </div>

                <p className="max-w-3xl text-2xl font-semibold leading-relaxed text-on-surface md:text-3xl">
                  "{featuredTestimonial.message}"
                </p>

                <div className="mt-10 grid gap-6 border-t border-outline-variant/10 pt-8 md:grid-cols-[1fr_auto] md:items-end">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-primary">
                      {featuredTestimonial.brand}
                    </p>
                    <p className="mt-3 text-base font-bold text-on-surface">{featuredTestimonial.authorName}</p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {featuredTestimonial.authorRole}
                    </p>
                  </div>

                  {(featuredTestimonial.highlightValue || featuredTestimonial.highlightLabel) ? (
                    <div className="rounded-[1.75rem] border border-outline-variant/15 bg-surface-container px-6 py-5 md:min-w-[14rem]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                        Impacto percebido
                      </p>
                      {featuredTestimonial.highlightValue ? (
                        <p className="mt-3 text-4xl font-black text-primary">{featuredTestimonial.highlightValue}</p>
                      ) : null}
                      {featuredTestimonial.highlightLabel ? (
                        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                          {featuredTestimonial.highlightLabel}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </Link>
            </motion.div>

            <div className="grid gap-6">
              {secondaryTestimonials.map((testimonial, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  key={testimonial.id}
                  transition={{ duration: 0.6, delay: index * 0.08, ease: EASE_OUT }}
                  viewport={{ once: true, amount: 0.24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <Link
                    className="block rounded-[2rem] border border-outline-variant/15 bg-surface-container-low p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/24"
                    state={{ from: "/#depoimentos" }}
                    to={`/depoimentos/${testimonial.id}`}
                  >
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-primary">
                          {testimonial.brand}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-on-surface">
                          {testimonial.authorName}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-on-surface-variant">
                          {testimonial.authorRole}
                        </p>
                      </div>
                      <TestimonialStars rating={testimonial.rating} />
                    </div>

                    <p className="text-base leading-relaxed text-on-surface-variant">
                      "{testimonial.message}"
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-outline-variant/15 bg-surface-container-low px-8 py-10">
            <p className="text-sm font-semibold text-on-surface">Nenhum depoimento publicado ainda.</p>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              Assim que os relatos forem publicados no painel, eles aparecerão aqui automaticamente.
            </p>
          </div>
        )}
      </div>
    </RevealSection>
  );
}
