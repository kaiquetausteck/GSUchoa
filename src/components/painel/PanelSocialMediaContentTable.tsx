import {
  ExternalLink,
  Image as ImageIcon,
  Images,
  Play,
  Sparkles,
} from "lucide-react";

import type {
  PanelSocialMediaContentKind,
  PanelSocialMediaMediaKind,
  PanelSocialMediaPlatform,
} from "../../services/painel/social-media-api";

export type PanelSocialMediaContentRecord = {
  excerpt: string | null;
  id: string;
  kind: PanelSocialMediaContentKind;
  metrics?: Array<{ label: string; value: string }>;
  mediaKind: PanelSocialMediaMediaKind;
  permalinkUrl: string | null;
  platform: PanelSocialMediaPlatform;
  previewUrl: string | null;
  publishedAt: string | null;
  rawType: string | null;
  sourceId: string;
  sourceLabel: string;
  title: string;
};

type PanelSocialMediaContentTableProps = {
  isLoading: boolean;
  items: PanelSocialMediaContentRecord[];
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Sem data";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

function getPlatformLabel(value: PanelSocialMediaPlatform) {
  return value === "instagram" ? "Instagram" : "Facebook";
}

function getPlatformBadgeClassName(value: PanelSocialMediaPlatform) {
  return value === "instagram"
    ? "border-fuchsia-500/18 bg-fuchsia-500/10 text-fuchsia-500"
    : "border-sky-500/18 bg-sky-500/10 text-sky-500";
}

function getContentKindLabel(value: PanelSocialMediaContentKind) {
  switch (value) {
    case "carousel":
      return "Carrossel";
    case "image":
      return "Imagem";
    case "instagram_post":
      return "Post Instagram";
    case "post":
      return "Post";
    case "reel":
      return "Reel";
    case "story":
      return "Story";
    case "video":
      return "Vídeo";
    default:
      return "Post Facebook";
  }
}

function getMediaKindLabel(value: PanelSocialMediaMediaKind) {
  switch (value) {
    case "carousel":
      return "Carrossel";
    case "image":
      return "Imagem";
    case "photo":
      return "Foto";
    case "post":
      return "Post";
    case "reel":
      return "Reel";
    case "story":
      return "Story";
    case "video":
      return "Vídeo";
    default:
      return "Conteúdo";
  }
}

function getMediaKindIcon(value: PanelSocialMediaMediaKind) {
  switch (value) {
    case "carousel":
      return <Images className="h-3.5 w-3.5" />;
    case "image":
    case "photo":
      return <ImageIcon className="h-3.5 w-3.5" />;
    case "reel":
    case "video":
      return <Play className="h-3.5 w-3.5" />;
    default:
      return <Sparkles className="h-3.5 w-3.5" />;
  }
}

export function PanelSocialMediaContentTable({
  isLoading,
  items,
}: PanelSocialMediaContentTableProps) {
  return (
    <section className="panel-premium-card rounded-[2rem] border p-6 md:p-7">
      <div className="flex flex-col gap-4 border-b border-outline-variant/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
            Conteúdos normalizados
          </p>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-on-surface md:text-xl">
            Biblioteca social da conta
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
            Consulte o feed consolidado da API com tipos padronizados, ordenação por performance
            e indicadores orgânicos como likes, comentários, alcance e acesso rápido ao link original de cada publicação.
          </p>
        </div>

        <div className="rounded-[1.2rem] border border-outline-variant/12 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
          {items.length} item{items.length === 1 ? "" : "s"} carregado{items.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="pt-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                className="panel-card-muted h-24 animate-pulse rounded-[1.4rem] border"
                key={index}
              />
            ))}
          </div>
        ) : null}

        {!isLoading && items.length === 0 ? (
          <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-outline-variant/16 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-outline-variant/16 bg-surface-container-low text-primary">
              <ImageIcon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-base font-semibold text-on-surface">
              Nenhum conteúdo encontrado para esta página
            </p>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-on-surface-variant">
              Atualize a leitura ou escolha outra plataforma dentro da busca para tentar novamente.
            </p>
          </div>
        ) : null}

        {!isLoading && items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-left">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                  <th className="px-4 py-2">Conteúdo</th>
                  <th className="px-4 py-2">Plataforma</th>
                  <th className="px-4 py-2">Formato</th>
                  <th className="px-4 py-2">Publicado em</th>
                  <th className="px-4 py-2">Origem</th>
                  <th className="px-4 py-2 text-right">Link</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    className="bg-surface-container-low/75 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-surface-container-low"
                    key={`${item.platform}-${item.id}`}
                  >
                    <td className="rounded-l-[1.2rem] px-4 py-4">
                      <div className="flex min-w-[22rem] items-start gap-4">
                        <div className="flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-[1.2rem] border border-outline-variant/10 bg-surface-container-high">
                          {item.previewUrl ? (
                            <img
                              alt={item.title}
                              className="h-full w-full object-cover"
                              src={item.previewUrl}
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-on-surface-variant" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-semibold text-on-surface">
                            {item.title}
                          </p>
                          {item.excerpt ? (
                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-on-surface-variant">
                              {item.excerpt}
                            </p>
                          ) : null}
                          {item.metrics && item.metrics.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.metrics.slice(0, 6).map((metric) => (
                                <span
                                  className="inline-flex items-center gap-1 rounded-full border border-outline-variant/12 bg-surface px-2.5 py-1 text-[10px] font-semibold text-on-surface-variant"
                                  key={`${item.id}-${metric.label}`}
                                >
                                  <span className="text-on-surface">{metric.value}</span>
                                  {metric.label}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          <p className="mt-2 truncate text-[11px] text-on-surface-variant/85">
                            {item.sourceId}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPlatformBadgeClassName(
                          item.platform,
                        )}`}
                      >
                        {getPlatformLabel(item.platform)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant/12 bg-surface px-3 py-1 text-xs font-semibold text-on-surface-variant">
                          {getMediaKindIcon(item.mediaKind)}
                          {getContentKindLabel(item.kind)}
                        </span>
                        <span className="inline-flex rounded-full border border-outline-variant/12 bg-surface px-3 py-1 text-xs font-semibold text-on-surface-variant">
                          {item.rawType || getMediaKindLabel(item.mediaKind)}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-on-surface-variant">
                      {formatDateTime(item.publishedAt)}
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-on-surface">{item.sourceLabel}</p>
                    </td>

                    <td className="rounded-r-[1.2rem] px-4 py-4 text-right">
                      {item.permalinkUrl ? (
                        <a
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-outline-variant/16 px-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                          href={item.permalinkUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Abrir
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-xs text-on-surface-variant">Sem link</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}
