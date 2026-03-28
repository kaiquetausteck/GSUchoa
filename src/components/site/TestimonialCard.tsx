import { ArrowUpRight, Quote } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import type { PublicTestimonial } from "../../services/site/testimonials-api";
import { TestimonialStars } from "./TestimonialStars";

export function TestimonialCard({
  testimonial,
  from,
  className,
}: {
  testimonial: PublicTestimonial;
  from?: string;
  className?: string;
}) {
  const location = useLocation();
  const linkFrom = from ?? `${location.pathname}${location.hash}`;

  return (
    <Link
      className={`group block rounded-[2rem] border border-outline-variant/12 bg-surface-container-low p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/24 ${className ?? ""}`}
      state={{ from: linkFrom }}
      to={`/depoimentos/${testimonial.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            {testimonial.brand}
          </p>
          <h3 className="mt-3 text-xl font-black tracking-tight text-on-surface transition-colors group-hover:text-primary">
            {testimonial.authorName}
          </h3>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-on-surface-variant">
            {testimonial.authorRole}
          </p>
        </div>
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl border border-outline-variant/12 bg-surface text-primary">
          <Quote className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-5">
        <TestimonialStars rating={testimonial.rating} />
      </div>

      <p className="mt-5 line-clamp-4 text-base leading-relaxed text-on-surface-variant">
        "{testimonial.message}"
      </p>

      {(testimonial.highlightValue || testimonial.highlightLabel) ? (
        <div className="mt-6 rounded-[1.5rem] border border-outline-variant/12 bg-surface px-4 py-4">
          {testimonial.highlightValue ? (
            <p className="text-2xl font-black text-primary">{testimonial.highlightValue}</p>
          ) : null}
          {testimonial.highlightLabel ? (
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {testimonial.highlightLabel}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">
        Abrir depoimento
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
