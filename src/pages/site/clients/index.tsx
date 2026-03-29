import { Building2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ClientCard } from "../../../components/site/ClientCard";
import { ClientCardSkeleton } from "../../../components/site/ClientCardSkeleton";
import { SitePagination } from "../../../components/site/SitePagination";
import { SiteRouteShell } from "../../../components/site/SiteRouteShell";
import { Seo } from "../../../components/shared/Seo";
import {
  buildAbsoluteUrl,
  createBreadcrumbStructuredData,
} from "../../../config/site/seo";
import {
  listFeaturedPublicClients,
  listPublicClients,
  type PublicClient,
} from "../../../services/site/clients-api";

const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "featured", label: "Destaques" },
] as const;

const ITEMS_PER_PAGE = 12;
const SEO_DESCRIPTION =
  "Veja as marcas que confiam na GSUCHOA e navegue pela vitrine pública de clientes e parceiros atendidos.";

export default function ClientsPagePublic() {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [items, setItems] = useState<PublicClient[]>([]);
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
            ? await listFeaturedPublicClients()
            : await listPublicClients();

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
            : "Não foi possível carregar os clientes publicados.",
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
  const structuredData = [
    createBreadcrumbStructuredData([
      { name: "Início", path: "/" },
      { name: "Clientes", path: "/clientes" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Clientes da GSUCHOA",
      description: SEO_DESCRIPTION,
      url: buildAbsoluteUrl("/clientes"),
      inLanguage: "pt-BR",
    },
  ];

  return (
    <SiteRouteShell>
      <Seo
        description={SEO_DESCRIPTION}
        path="/clientes"
        structuredData={structuredData}
        title="Clientes e Marcas Atendidas"
      />
      <section className="site-section relative overflow-hidden">
        <div className="hero-gradient absolute inset-0 opacity-25" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <div className="max-w-4xl">
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.36em] text-primary">
              Clientes
            </p>
            <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl">
              Marcas atendidas com prova social organizada em uma <span className="text-gradient">vitrine viva.</span>
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
              Uma camada pública para navegar pelas marcas que confiam na GSUCHOA e entender como essa parceria aparece na nossa presença digital.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-3">
            <div className="mobile-wrap-control inline-flex max-w-full items-center gap-2 rounded-full border border-outline-variant/12 bg-surface-container-high px-4 py-3 text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">
              <Building2 className="h-4 w-4 text-primary" />
              Filtrar clientes
            </div>
            {FILTERS.map((filter) => (
              <button
                className={`mobile-wrap-control max-w-full rounded-full border px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] transition-colors ${
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
                ? "Carregando clientes..."
                : `${items.length} cliente${items.length === 1 ? "" : "s"} encontrado${items.length === 1 ? "" : "s"}.`}
            </p>
          </div>

          {errorMessage ? (
            <div className="mt-10 rounded-[2rem] border border-outline-variant/12 bg-surface-container-low px-8 py-10 text-center">
              <p className="text-sm font-semibold text-on-surface">Não foi possível carregar os clientes.</p>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                {errorMessage}
              </p>
            </div>
          ) : (
            <>
              <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <ClientCardSkeleton key={index} />
                    ))
                  : paginatedItems.map((client) => (
                      <ClientCard client={client} from="/clientes" key={client.id} />
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
