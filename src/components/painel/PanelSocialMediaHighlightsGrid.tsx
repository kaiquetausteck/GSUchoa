import {
  Bookmark,
  Eye,
  ExternalLink,
  Heart,
  Image as ImageIcon,
  Images,
  MessageSquare,
  Play,
  Share2,
  Sparkles,
  UsersRound,
} from "lucide-react";

import type {
  PanelSocialMediaContentItemRecord,
  PanelSocialMediaContentKind,
  PanelSocialMediaContentMediaKind,
} from "../../services/painel/social-media-api";

type PanelSocialMediaHighlightsGridProps = {
  isLoading: boolean;
  items: PanelSocialMediaContentItemRecord[];
};

function formatNumber(value: number | null) {
  return new Intl.NumberFormat("pt-BR").format(value ?? 0);
}

function formatDate(value: string) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
  }).format(parsedDate);
}

function getMediaKindLabel(kind: PanelSocialMediaContentMediaKind) {
  switch (kind) {
    case "carousel":
      return "Carrossel";
    case "photo":
      return "Foto";
    case "reel":
      return "Reel";
    case "video":
      return "Vídeo";
    case "post":
      return "Post";
    default:
      return "Conteúdo";
  }
}

function getContentKindLabel(kind: PanelSocialMediaContentKind) {
  switch (kind) {
    case "facebook_post":
      return "Post Facebook";
    case "instagram_post":
      return "Post Instagram";
    case "reel":
      return "Reel";
  }
}

function getMediaKindIcon(kind: PanelSocialMediaContentMediaKind) {
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

function getPlatformBadgeClassName(platform: PanelSocialMediaContentItemRecord["platform"]) {
  return platform === "instagram"
    ? "border-fuchsia-500/18 bg-fuchsia-500/10 text-fuchsia-500"
    : "border-sky-500/18 bg-sky-500/10 text-sky-500";
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
            className="panel-card-muted h-[25rem] animate-pulse rounded-[1.7rem] border"
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
          Nenhum destaque visual disponível no período
        </p>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-on-surface-variant">
          Sincronize novamente ou amplie o recorte para montar uma apresentação mensal com mais
          conteúdos visuais.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article
          className="group overflow-hidden rounded-[1.7rem] border border-outline-variant/12 bg-surface-container-low/65"
          key={`${item.platform}-${item.contentId}`}
        >
          <div className="relative">
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 p-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-black/55 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                {getMediaKindIcon(item.mediaKind)}
                {getContentKindLabel(item.contentKind)}
              </span>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold backdrop-blur-sm ${getPlatformBadgeClassName(
                  item.platform,
                )}`}
              >
                {item.platform === "instagram" ? "Instagram" : "Facebook"}
              </span>
            </div>

            <div className="aspect-[4/4.6] overflow-hidden bg-surface-container-high">
              {item.mediaPreviewUrl ? (
                <img
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  src={item.mediaPreviewUrl}
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
                {item.accountName} • {formatDate(item.publishedAt)}
              </p>
            </div>

            {item.caption ? (
              <p className="line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
                {item.caption}
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-3 text-xs text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/10 bg-surface px-3 py-2">
                <Heart className="h-3.5 w-3.5" />
                {formatNumber(item.reactionsCount)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/10 bg-surface px-3 py-2">
                <MessageSquare className="h-3.5 w-3.5" />
                {formatNumber(item.commentsCount)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/10 bg-surface px-3 py-2">
                <Share2 className="h-3.5 w-3.5" />
                {formatNumber(item.sharesCount)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/10 bg-surface px-3 py-2">
                <Bookmark className="h-3.5 w-3.5" />
                {formatNumber(item.savedCount)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/10 bg-surface px-3 py-2">
                <Eye className="h-3.5 w-3.5" />
                {formatNumber(item.viewsCount)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/10 bg-surface px-3 py-2">
                <UsersRound className="h-3.5 w-3.5" />
                {formatNumber(item.reach)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/10 bg-surface px-3 py-2 font-semibold text-on-surface">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {formatNumber(item.engagementsCount)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-outline-variant/10 pt-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                  Conteúdo
                </p>
                <p className="mt-1 text-sm font-semibold text-on-surface">
                  {formatNumber(item.engagementsCount)} engajamentos
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
