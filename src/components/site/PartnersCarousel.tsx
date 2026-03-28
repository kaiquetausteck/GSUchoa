import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listFeaturedPublicClients, listPublicClients, type PublicClient } from "../../services/site/clients-api";

export function PartnersCarousel() {
  const [items, setItems] = useState<PublicClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const featuredClients = await listFeaturedPublicClients();
        const nextItems =
          featuredClients.length > 0
            ? featuredClients
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
            : "Nao foi possivel carregar os clientes publicados.",
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

  if (isLoading) {
    return (
      <div className="overflow-hidden">
        <div className="flex items-center gap-4 py-2 md:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              className="partner-logo-card flex h-24 w-[11rem] flex-none items-center justify-center rounded-[1.75rem] border px-6 py-5 md:h-28 md:w-[12.5rem]"
              key={index}
            >
              <div className="h-8 w-24 animate-pulse rounded-full bg-surface-container-high" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (errorMessage || items.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-outline-variant/12 bg-surface-container-low px-6 py-6 text-center">
        <p className="text-sm font-semibold text-on-surface">Nao foi possivel carregar os clientes.</p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          {errorMessage ?? "Assim que os clientes forem publicados no painel, eles aparecerao aqui."}
        </p>
      </div>
    );
  }

  const marqueeClients = [...items, ...items];

  return (
    <div className="partners-marquee overflow-hidden">
      <div className="partners-marquee-track flex w-max items-center gap-4 py-2 md:gap-6">
        {marqueeClients.map((client, index) => (
          <Link
            aria-hidden={index >= items.length}
            className="partner-logo-card flex h-24 w-[11rem] flex-none items-center justify-center rounded-[1.75rem] border px-6 py-5 transition-all duration-300 md:h-28 md:w-[12.5rem]"
            key={`${client.id}-${index}`}
            state={{ from: "/#resultados" }}
            tabIndex={index >= items.length ? -1 : 0}
            to={`/clientes/${client.slug}`}
          >
            <img
              alt={client.name}
              className="partner-logo-image max-h-12 w-full object-contain md:max-h-14"
              draggable={false}
              loading="lazy"
              src={client.logoUrl}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
