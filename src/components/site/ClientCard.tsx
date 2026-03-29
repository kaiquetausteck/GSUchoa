import { ArrowUpRight, Globe2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import type { PublicClient } from "../../services/site/clients-api";

export function ClientCard({
  client,
  from,
  className,
}: {
  client: PublicClient;
  from?: string;
  className?: string;
}) {
  const location = useLocation();
  const linkFrom = from ?? `${location.pathname}${location.hash}`;

  return (
    <Link
      className={`group block rounded-[2rem] border border-outline-variant/12 bg-surface-container-low p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/24 ${className ?? ""}`}
      state={{ from: linkFrom }}
      to={`/clientes/${client.slug}`}
    >
      <div className="partner-logo-card flex h-24 items-center justify-center rounded-[1.75rem] border px-6 py-5">
        <img
          alt={client.name}
          className="partner-logo-image max-h-12 w-full object-contain md:max-h-14"
          src={client.logoUrl}
        />
      </div>

      <div className="mt-6">
        <p className="text-2xl font-black tracking-tight text-on-surface transition-colors group-hover:text-primary">
          {client.name}
        </p>
        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-on-surface-variant">
          /{client.slug}
        </p>
      </div>

      {client.website ? (
        <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
          <Globe2 className="h-4 w-4" />
          {client.website.replace(/^https?:\/\//, "")}
        </div>
      ) : null}

      <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">
        Ver cliente
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
