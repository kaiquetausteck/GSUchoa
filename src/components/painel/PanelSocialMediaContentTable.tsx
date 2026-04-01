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
  PanelSocialMediaContentKind,
  PanelSocialMediaContentItemRecord,
  PanelSocialMediaContentMediaKind,
} from "../../services/painel/social-media-api";
import { PanelPagination } from "./PanelPagination";

type PanelSocialMediaContentTableProps = {
  currentPage: number;
  isLoading: boolean;
  items: PanelSocialMediaContentItemRecord[];
  onPageChange: (page: number) => void;
  total: number;
  totalPages: number;
};

function formatNumber(value: number | null) {
  return new Intl.NumberFormat("pt-BR").format(value ?? 0);
}

function formatDateTime(value: string) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

function getPlatformLabel(value: PanelSocialMediaContentItemRecord["platform"]) {
  return value === "instagram" ? "Instagram" : "Facebook";
}

function getPlatformBadgeClassName(value: PanelSocialMediaContentItemRecord["platform"]) {
  return value === "instagram"
    ? "border-fuchsia-500/18 bg-fuchsia-500/10 text-fuchsia-500"
    : "border-sky-500/18 bg-sky-500/10 text-sky-500";
}

function getMediaKindLabel(value: PanelSocialMediaContentMediaKind) {
  switch (value) {
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

function getContentKindLabel(value: PanelSocialMediaContentKind) {
  switch (value) {
    case "facebook_post":
      return "Post Facebook";
    case "instagram_post":
      return "Post Instagram";
    case "reel":
      return "Reel";
  }
}

function getMediaKindIcon(value: PanelSocialMediaContentMediaKind) {
  switch (value) {
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

export function PanelSocialMediaContentTable({
  currentPage,
  isLoading,
  items,
  onPageChange,
  total,
  totalPages,
}: PanelSocialMediaContentTableProps) {
  return (
    <section className="panel-premium-card rounded-[2rem] border p-6 md:p-7">
      <div className="flex flex-col gap-4 border-b border-outline-variant/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
            Conteúdo sincronizado
          </p>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-on-surface md:text-xl">
            Posts e mídias da operação social
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
            Acompanhe os conteúdos coletados pela integração Meta, compare engajamento e abra
            rapidamente o link original de cada publicação.
          </p>
        </div>

        <div className="rounded-[1.2rem] border border-outline-variant/12 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
          {formatNumber(total)} item{total === 1 ? "" : "s"} no recorte atual
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
              Nenhum conteúdo encontrado para os filtros atuais
            </p>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-on-surface-variant">
              Ajuste período, plataforma ou contas sincronizadas para carregar novamente a
              operação social.
            </p>
          </div>
        ) : null}

        {!isLoading && items.length > 0 ? (
          <div className="space-y-5">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                    <th className="px-4 py-2">Conteúdo</th>
                    <th className="px-4 py-2">Plataforma</th>
                    <th className="px-4 py-2">Publicado em</th>
                    <th className="px-4 py-2 text-right">Engajamentos</th>
                    <th className="px-4 py-2 text-right">Métricas</th>
                    <th className="px-4 py-2 text-right">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      className="bg-surface-container-low/75 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-surface-container-low"
                      key={`${item.platform}-${item.contentId}`}
                    >
                      <td className="rounded-l-[1.2rem] px-4 py-4">
                        <div className="flex min-w-[22rem] items-start gap-4">
                          <div className="flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-[1.2rem] border border-outline-variant/10 bg-surface-container-high">
                            {item.thumbnailUrl ? (
                              <img
                                alt={item.title}
                                className="h-full w-full object-cover"
                                src={item.thumbnailUrl}
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-on-surface-variant" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-semibold text-on-surface">
                              {item.title}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant/12 bg-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                                {getMediaKindIcon(item.mediaKind)}
                                {getContentKindLabel(item.contentKind)}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-xs text-on-surface-variant">
                              {item.accountName} • {item.pageName}
                            </p>
                            {item.caption ? (
                              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-on-surface-variant">
                                {item.caption}
                              </p>
                            ) : null}
                            <p className="mt-1 truncate text-[11px] text-on-surface-variant/85">
                              {item.contentId}
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

                      <td className="px-4 py-4 text-sm text-on-surface-variant">
                        {formatDateTime(item.publishedAt)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="text-base font-semibold text-on-surface">
                          {formatNumber(item.engagementsCount)}
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          total no item
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="flex min-w-[18rem] justify-end gap-3 text-xs text-on-surface-variant">
                          <span className="inline-flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5" />
                            {formatNumber(item.reactionsCount)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {formatNumber(item.commentsCount)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Share2 className="h-3.5 w-3.5" />
                            {formatNumber(item.sharesCount)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Bookmark className="h-3.5 w-3.5" />
                            {formatNumber(item.savedCount)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {formatNumber(item.viewsCount)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <UsersRound className="h-3.5 w-3.5" />
                            {formatNumber(item.reach)}
                          </span>
                        </div>
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

            <PanelPagination
              currentPage={currentPage}
              onPageChange={onPageChange}
              totalPages={totalPages}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
