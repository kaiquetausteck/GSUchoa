import type { ReactNode } from "react";

import type { PanelPortfolioSummaryRecord } from "../../services/painel/portfolio-api";
import { PanelPortfolioActionMenu } from "./PanelPortfolioActionMenu";

type PanelPortfolioTableProps = {
  footer?: ReactNode;
  isLoading: boolean;
  items: PanelPortfolioSummaryRecord[];
  onDelete: (item: PanelPortfolioSummaryRecord) => void;
  onEdit: (item: PanelPortfolioSummaryRecord) => void;
  onToggleFeatured: (item: PanelPortfolioSummaryRecord) => void;
  onTogglePublished: (item: PanelPortfolioSummaryRecord) => void;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Sem registro";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Sem registro";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsedDate);
}

export function PanelPortfolioTable({
  footer,
  isLoading,
  items,
  onDelete,
  onEdit,
  onToggleFeatured,
  onTogglePublished,
}: PanelPortfolioTableProps) {
  if (isLoading) {
    return (
      <div className="panel-card overflow-hidden rounded-[1.75rem] border">
        <div className="space-y-3 p-4 md:p-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              className="panel-card-muted h-20 animate-pulse rounded-2xl border"
              key={index}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="panel-card rounded-[1.75rem] border border-dashed px-6 py-12 text-center">
        <p className="text-sm font-semibold text-on-surface">Nenhum portfolio encontrado</p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          Ajuste os filtros ou crie um novo case para alimentar a vitrine do site.
        </p>
      </div>
    );
  }

  return (
    <div className="panel-card overflow-hidden rounded-[1.75rem] border">
      <div className="overflow-x-auto overflow-y-visible">
        <table className="min-w-full text-left text-sm">
          <thead className="panel-card-muted border-b border-outline-variant/12">
            <tr className="text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
              <th className="px-6 py-4 font-semibold">Portfolio</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Setor</th>
              <th className="px-6 py-4 font-semibold">Atualizado em</th>
              <th className="px-6 py-4 text-right font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                className="border-b border-outline-variant/10 transition-colors hover:bg-surface-container-low/55 last:border-b-0"
                key={item.id}
              >
                <td className="min-w-[22rem] px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="panel-card-muted h-16 w-24 flex-none overflow-hidden rounded-2xl border">
                      <img
                        alt={item.name}
                        className="h-full w-full object-cover"
                        src={item.thumbnail}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-on-surface">{item.name}</p>
                      <p className="mt-1 truncate text-xs text-on-surface-variant">
                        {item.client} · {item.year} · /{item.slug}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.categories.slice(0, 3).map((category) => (
                          <span
                            className="inline-flex rounded-full border border-outline-variant/14 px-2.5 py-1 text-[11px] font-semibold text-on-surface-variant"
                            key={category}
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                        item.isPublished
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                          : "border-amber-500/20 bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {item.isPublished ? "Publicado" : "Rascunho"}
                    </span>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                        item.featured
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-outline-variant/16 bg-surface-container-low text-on-surface-variant"
                      }`}
                    >
                      {item.featured ? "Em destaque" : "Sem destaque"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-on-surface-variant">
                  <p>{item.sector}</p>
                  {item.publishedAt ? (
                    <p className="mt-1 text-xs">Publicado em {formatDate(item.publishedAt)}</p>
                  ) : null}
                </td>
                <td className="px-6 py-5 text-on-surface-variant">{formatDate(item.updatedAt)}</td>
                <td className="px-6 py-5 text-right">
                  <PanelPortfolioActionMenu
                    featured={item.featured}
                    isPublished={item.isPublished}
                    onDelete={() => onDelete(item)}
                    onEdit={() => onEdit(item)}
                    onToggleFeatured={() => onToggleFeatured(item)}
                    onTogglePublished={() => onTogglePublished(item)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {footer ? (
        <div className="panel-card-muted border-t border-outline-variant/10 px-4 py-4 md:px-6">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
