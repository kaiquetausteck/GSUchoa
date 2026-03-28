import { Star } from "lucide-react";
import type { ReactNode } from "react";

import type { PanelTestimonialSummaryRecord } from "../../services/painel/testimonials-api";
import { PanelTestimonialsActionMenu } from "./PanelTestimonialsActionMenu";

type PanelTestimonialsTableProps = {
  footer?: ReactNode;
  isLoading: boolean;
  items: PanelTestimonialSummaryRecord[];
  onDelete: (item: PanelTestimonialSummaryRecord) => void;
  onEdit: (item: PanelTestimonialSummaryRecord) => void;
  onToggleFeatured: (item: PanelTestimonialSummaryRecord) => void;
  onTogglePublished: (item: PanelTestimonialSummaryRecord) => void;
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

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 text-primary">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          className={`h-3.5 w-3.5 ${index < rating ? "fill-current" : "opacity-25"}`}
          key={index}
        />
      ))}
    </div>
  );
}

export function PanelTestimonialsTable({
  footer,
  isLoading,
  items,
  onDelete,
  onEdit,
  onToggleFeatured,
  onTogglePublished,
}: PanelTestimonialsTableProps) {
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
        <p className="text-sm font-semibold text-on-surface">Nenhum depoimento encontrado</p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          Ajuste os filtros ou crie um novo depoimento para alimentar a prova social do site.
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
              <th className="px-6 py-4 font-semibold">Depoimento</th>
              <th className="px-6 py-4 font-semibold">Nota</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Ordem</th>
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
                <td className="min-w-[25rem] px-6 py-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[15px] font-semibold text-on-surface">{item.brand}</p>
                      <span className="inline-flex rounded-full border border-outline-variant/14 px-2.5 py-1 text-[11px] font-semibold text-on-surface-variant">
                        {item.authorName}
                      </span>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-on-surface-variant">
                      {item.authorRole}
                    </p>
                    <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
                      {item.message}
                    </p>
                    {(item.highlightValue || item.highlightLabel) ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {item.highlightValue ? (
                          <span className="rounded-full border border-primary/18 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            {item.highlightValue}
                          </span>
                        ) : null}
                        {item.highlightLabel ? (
                          <span className="text-xs font-medium text-on-surface-variant">
                            {item.highlightLabel}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="space-y-2">
                    <RatingStars rating={item.rating} />
                    <p className="text-xs font-semibold text-on-surface-variant">{item.rating}/5</p>
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
                  <p className="font-medium text-on-surface">#{item.sortOrder}</p>
                  {item.publishedAt ? (
                    <p className="mt-1 text-xs">Publicado em {formatDate(item.publishedAt)}</p>
                  ) : null}
                </td>
                <td className="px-6 py-5 text-on-surface-variant">{formatDate(item.updatedAt)}</td>
                <td className="px-6 py-5 text-right">
                  <PanelTestimonialsActionMenu
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
