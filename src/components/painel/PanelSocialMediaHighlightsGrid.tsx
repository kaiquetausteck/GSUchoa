import {
  ExternalLink,
  Image as ImageIcon,
  Images,
  Play,
  Sparkles,
} from "lucide-react";

import { type PanelSocialMediaContentRecord } from "./PanelSocialMediaContentTable";

type PanelSocialMediaHighlightsGridProps = {
  isLoading: boolean;
  items: PanelSocialMediaContentRecord[];
};

function formatDate(value: string | null) {
  if (!value) {
    return "Sem data";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
  }).format(parsedDate);
}

function getMediaKindIcon(kind: PanelSocialMediaContentRecord["mediaKind"]) {
  switch (kind) {
    case "carousel":
      return <Images className="h-3.5 w-3.5" />;
    case "reel":
    case "video":
      return <Play className="h-3.5 w-3.5" />;
    case "photo":
      return <ImageIcon className="h-3.5 w-3.5" />;
    default:
      return <Sparkles className="h-3.5 w-3.5" />;
  }
}

function getContentKindLabel(kind: PanelSocialMediaContentRecord["kind"]) {
  switch (kind) {
    case "reel":
      return "Reel";
    case "instagram_post":
      return "Post Instagram";
    default:
      return "Post Facebook";
  }
}

function getPlatformBadgeClassName(platform: PanelSocialMediaContentRecord["platform"]) {
  return platform === "instagram"
    ? "border-fuchsia-500/18 bg-fuchsia-500/10 text-fuchsia-500"
    : "border-sky-500/18 bg-sky-500/10 text-sky-500";
}

function getCardFrameClassName(item: PanelSocialMediaContentRecord) {
  if (item.mediaKind === "carousel") {
    return "rounded-[1.6rem] border border-outline-variant/14 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-3";
  }

  return "";
}

export function PanelSocialMediaHighlightsGrid({
  isLoading,
  items,
}: PanelSocialMediaHighlightsGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            className="panel-card-muted h-[24rem] animate-pulse rounded-[1.7rem] border"
            key={index}
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-outline-variant/16 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-outline-variant/16 bg-surface-container-low text-primary">
          <ImageIcon className="h-5 w-5" />
        </div>
        <p className="mt-4 text-base font-semibold text-on-surface">
          Nenhum destaque visual disponível
        </p>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-on-surface-variant">
          Assim que a página tiver posts ou mídias retornadas pela integração, eles aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article
          className="group overflow-hidden rounded-[1.7rem] border border-outline-variant/12 bg-surface-container-low/65"
          key={`${item.platform}-${item.id}`}
        >
          <div className="relative">
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 p-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-black/55 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                {getMediaKindIcon(item.mediaKind)}
                {getContentKindLabel(item.kind)}
              </span>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold backdrop-blur-sm ${getPlatformBadgeClassName(
                  item.platform,
                )}`}
              >
                {item.platform === "instagram" ? "Instagram" : "Facebook"}
              </span>
            </div>

            <div className={`aspect-[4/4.9] overflow-hidden bg-surface-container-high ${getCardFrameClassName(item)}`}>
              {item.mediaKind === "carousel" && item.previewUrl ? (
                <div className="relative h-full w-full">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 translate-x-4 translate-y-4 rounded-[1.2rem] border border-white/10 bg-cover bg-center opacity-25 blur-[2px]"
                    style={{ backgroundImage: `url(${item.previewUrl})` }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 translate-x-2 translate-y-2 rounded-[1.2rem] border border-white/10 bg-cover bg-center opacity-45"
                    style={{ backgroundImage: `url(${item.previewUrl})` }}
                  />
                  <div className="relative h-full overflow-hidden rounded-[1.2rem] border border-white/10">
                    <img
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      src={item.previewUrl}
                    />
                  </div>
                </div>
              ) : item.previewUrl ? (
                <img
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  src={item.previewUrl}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-on-surface-variant">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <p className="line-clamp-2 text-base font-semibold leading-snug text-on-surface">
                {item.title}
              </p>
              <p className="mt-2 text-xs text-on-surface-variant">
                {item.sourceLabel} • {formatDate(item.publishedAt)}
              </p>
            </div>

            {item.excerpt ? (
              <p className="line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
                {item.excerpt}
              </p>
            ) : null}

            {item.metrics && item.metrics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {item.metrics.map((metric) => (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-outline-variant/12 bg-surface px-3 py-1 text-[11px] font-semibold text-on-surface-variant"
                    key={`${item.id}-${metric.label}`}
                  >
                    <span className="text-on-surface">{metric.value}</span>
                    {metric.label}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3 border-t border-outline-variant/10 pt-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                  Tipo
                </p>
                <p className="mt-1 text-sm font-semibold text-on-surface">
                  {item.rawType || getContentKindLabel(item.kind)}
                </p>
              </div>

              {item.permalinkUrl ? (
                <a
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/16 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                  href={item.permalinkUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Abrir
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <span className="text-xs text-on-surface-variant">Sem link público</span>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
