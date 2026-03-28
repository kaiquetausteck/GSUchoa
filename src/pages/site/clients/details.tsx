import { ArrowLeft, Building2, Globe2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { ClientCard } from "../../../components/site/ClientCard";
import { ClientCardSkeleton } from "../../../components/site/ClientCardSkeleton";
import { SiteRouteShell } from "../../../components/site/SiteRouteShell";
import {
  getPublicClientBySlug,
  listFeaturedPublicClients,
  listPublicClients,
  type PublicClient,
  type PublicClientDetail,
} from "../../../services/site/clients-api";

function ClientDetailsSkeleton() {
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
              <div className="mt-8 h-20 w-full animate-pulse rounded-[1.5rem] bg-surface-container-high" />
            </div>
            <div className="partner-logo-card flex min-h-[18rem] items-center justify-center rounded-[2.25rem] border px-10 py-10">
              <div className="h-16 w-56 animate-pulse rounded-full bg-surface-container-high" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 md:px-8">
        <div className="mb-10 h-10 w-72 animate-pulse rounded-[1.5rem] bg-surface-container-high" />
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <ClientCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </article>
  );
}

export default function ClientDetailsPage() {
  const { slug = "" } = useParams();
  const location = useLocation();
  const [client, setClient] = useState<PublicClientDetail | null>(null);
  const [relatedClients, setRelatedClients] = useState<PublicClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRelatedLoading, setIsRelatedLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const backTarget =
    typeof (location.state as { from?: string } | null)?.from === "string"
      ? (location.state as { from?: string }).from!
      : "/clientes";

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsRelatedLoading(true);

    void (async () => {
      try {
        const detail = await getPublicClientBySlug(slug);

        if (!isMounted) {
          return;
        }

        setClient(detail);
        setErrorMessage(null);

        try {
          const [featuredItems, allItems] = await Promise.all([
            listFeaturedPublicClients(),
            listPublicClients(),
          ]);

          const seenSlugs = new Set<string>([detail.slug]);
          const nextRelated = [...featuredItems, ...allItems].filter((item) => {
            if (seenSlugs.has(item.slug)) {
              return false;
            }

            seenSlugs.add(item.slug);
            return true;
          }).slice(0, 3);

          if (isMounted) {
            setRelatedClients(nextRelated);
          }
        } catch {
          if (isMounted) {
            setRelatedClients([]);
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

        setClient(null);
        setRelatedClients([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar esse cliente.",
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
      <SiteRouteShell>
        <ClientDetailsSkeleton />
      </SiteRouteShell>
    );
  }

  if (!client) {
    return (
      <SiteRouteShell>
        <section className="mx-auto max-w-7xl px-6 py-28 md:px-8">
          <div className="max-w-2xl rounded-[2.25rem] border border-outline-variant/12 bg-surface-container-low p-10">
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-primary">
              Cliente nao encontrado
            </p>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-on-surface">
              Esse cliente nao existe ou ainda nao foi publicado.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-on-surface-variant">
              {errorMessage ?? "Voce pode voltar para a listagem geral e navegar pelas outras marcas publicadas."}
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
    <SiteRouteShell>
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
                  Cliente publicado
                </p>
                <h1 className="mt-6 text-5xl font-black leading-none tracking-tight md:text-7xl">
                  {client.name}
                </h1>
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                  /{client.slug}
                </p>

                {client.description ? (
                  <p className="mt-8 max-w-3xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
                    {client.description}
                  </p>
                ) : (
                  <p className="mt-8 max-w-3xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
                    Uma marca parceira presente na vitrine publica da GSUCHOA.
                  </p>
                )}

                {client.website ? (
                  <a
                    className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-5 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
                    href={client.website}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Globe2 className="h-4 w-4" />
                    Visitar site
                  </a>
                ) : null}
              </div>

              <div className="partner-logo-card flex min-h-[18rem] items-center justify-center rounded-[2.25rem] border px-10 py-10 md:min-h-[22rem]">
                <img
                  alt={client.name}
                  className="partner-logo-image max-h-24 w-full object-contain md:max-h-28"
                  src={client.logoUrl}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8 md:px-8">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-primary">
              Outras marcas
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-on-surface">
              Continue navegando pelas empresas que confiam na GSUCHOA.
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {isRelatedLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <ClientCardSkeleton key={index} />
                ))
              : relatedClients.map((item) => (
                  <ClientCard client={item} key={item.id} />
                ))}
          </div>
        </section>
      </article>
    </SiteRouteShell>
  );
}
