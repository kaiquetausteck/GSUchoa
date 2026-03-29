import { ArrowUpRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import type { PublicPortfolioListItem } from "../../services/site/portfolio-api";

export function CaseStudyCard({
  caseStudy,
  from,
  className,
}: {
  caseStudy: PublicPortfolioListItem;
  from?: string;
  className?: string;
}) {
  const location = useLocation();
  const linkFrom = from ?? `${location.pathname}${location.hash}`;

  return (
    <Link
      className={`group block overflow-hidden rounded-[2rem] border border-outline-variant/12 bg-surface-container-low transition-all duration-300 hover:-translate-y-1 hover:border-primary/24 ${className ?? ""}`}
      state={{ from: linkFrom }}
      to={`/cases/${caseStudy.slug}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          alt={caseStudy.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
          src={caseStudy.thumbnail}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/14 bg-background/72 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur-md">
            {caseStudy.sector}
          </span>
          {caseStudy.categories.slice(1, 3).map((category) => (
            <span
              className="rounded-full border border-white/10 bg-background/48 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md"
              key={category}
            >
              {category}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-5 p-7">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            {caseStudy.client}
          </p>
          <h3 className="mt-3 text-2xl font-black tracking-tight text-on-surface transition-colors group-hover:text-primary">
            {caseStudy.name}
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Problema", value: caseStudy.labels.problem },
            { label: "Solução", value: caseStudy.labels.solution },
            { label: "Resultado", value: caseStudy.labels.result },
          ].map((item) => (
            <div
              className="rounded-[1.35rem] border border-outline-variant/12 bg-surface px-4 py-4"
              key={item.label}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                {item.label}
              </p>
              <p className={`mt-2 text-sm font-semibold ${item.label === "Resultado" ? "text-primary" : "text-on-surface"}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="inline-flex items-center gap-2 text-sm font-bold text-primary">
          Ver case
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
