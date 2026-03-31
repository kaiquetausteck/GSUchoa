import { ArrowUpRight, FolderPlus, Megaphone, PencilLine } from "lucide-react";
import type { ReactNode } from "react";

import {
  getPanelPaidMediaCampaignStatusBadgeClassName,
  PANEL_PAID_MEDIA_CAMPAIGN_STATUS_LABELS,
  PANEL_PAID_MEDIA_PLATFORM_LABELS,
} from "../../config/painel/paid-media";
import type { PanelPaidMediaCampaignSummaryRecord } from "../../services/painel/paid-media-api";

type PanelPaidMediaCampaignsTableProps = {
  footer?: ReactNode;
  isLoading: boolean;
  items: PanelPaidMediaCampaignSummaryRecord[];
  onCreate: () => void;
  onEdit: (item: PanelPaidMediaCampaignSummaryRecord) => void;
  onOpenDashboard: (item: PanelPaidMediaCampaignSummaryRecord) => void;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Sem registro";
  }

  const parsedValue = new Date(value);

  if (Number.isNaN(parsedValue.getTime())) {
    return "Sem registro";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
  }).format(parsedValue);
}

function formatPeriod(startDate: string | null, endDate: string | null) {
  if (!startDate && !endDate) {
    return "Período não definido";
  }

  if (startDate && endDate) {
    return `${formatDate(startDate)} até ${formatDate(endDate)}`;
  }

  if (startDate) {
    return `A partir de ${formatDate(startDate)}`;
  }

  return `Até ${formatDate(endDate)}`;
}

export function PanelPaidMediaCampaignsTable({
  footer,
  isLoading,
  items,
  onCreate,
  onEdit,
  onOpenDashboard,
}: PanelPaidMediaCampaignsTableProps) {
  if (isLoading) {
    return (
      <div className="panel-card overflow-hidden rounded-[1.85rem] border">
        <div className="space-y-3 p-4 md:p-5">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              className="panel-card-muted h-24 animate-pulse rounded-2xl border"
              key={index}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <section className="panel-card rounded-[2rem] border border-dashed px-6 py-14 text-center md:px-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.6rem] border border-primary/18 bg-primary/10 text-primary">
          <Megaphone className="h-7 w-7" />
        </div>
        <h2 className="mt-6 text-2xl font-black tracking-tight text-on-surface">
          Nenhuma campanha Meta cadastrada ainda
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant md:text-base">
          Crie a primeira campanha interna para organizar objetivo, período, cliente e a futura
          leitura de performance do time de tráfego pago.
        </p>
        <button
          className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          onClick={onCreate}
          type="button"
        >
          <FolderPlus className="h-4 w-4" />
          Criar primeira campanha
        </button>
      </section>
    );
  }

  return (
    <div className="panel-card overflow-hidden rounded-[1.85rem] border">
      <div className="overflow-x-auto overflow-y-visible">
        <table className="min-w-full text-left text-sm">
          <thead className="panel-card-muted border-b border-outline-variant/12">
            <tr className="text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
              <th className="px-6 py-4 font-semibold">Campanha</th>
              <th className="px-6 py-4 font-semibold">Cliente</th>
              <th className="px-6 py-4 font-semibold">Período</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Criada em</th>
              <th className="px-6 py-4 text-right font-semibold">Ações</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                className="border-b border-outline-variant/10 transition-colors hover:bg-surface-container-low/55 last:border-b-0"
                key={item.id}
              >
                <td className="min-w-[22rem] px-6 py-5 align-top">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[15px] font-semibold text-on-surface">{item.name}</p>
                      <span className="inline-flex rounded-full border border-primary/16 bg-primary/8 px-2.5 py-1 text-[11px] font-semibold text-primary">
                        {PANEL_PAID_MEDIA_PLATFORM_LABELS[item.platform]}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {item.objective || "Objetivo ainda não definido"}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-on-surface-variant">
                      <span className="panel-card-muted rounded-full border px-2.5 py-1">
                        {item.linkedEntitiesCount} entidades vinculadas
                      </span>
                      {item.metaAdAccount?.name ? (
                        <span className="panel-card-muted rounded-full border px-2.5 py-1">
                          {item.metaAdAccount.name}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </td>

                <td className="min-w-[14rem] px-6 py-5 align-top text-on-surface-variant">
                  <p className="font-medium text-on-surface">
                    {item.client?.name || "Sem cliente vinculado"}
                  </p>
                  {item.client?.id ? (
                    <p className="mt-1 text-xs">{item.client.id}</p>
                  ) : (
                    <p className="mt-1 text-xs">Campanha interna livre</p>
                  )}
                </td>

                <td className="min-w-[16rem] px-6 py-5 align-top text-on-surface-variant">
                  <p className="font-medium text-on-surface">{formatPeriod(item.startDate, item.endDate)}</p>
                  <p className="mt-1 text-xs">
                    Início: {formatDate(item.startDate)} • Fim: {formatDate(item.endDate)}
                  </p>
                </td>

                <td className="px-6 py-5 align-top">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPanelPaidMediaCampaignStatusBadgeClassName(
                      item.status,
                    )}`}
                  >
                    {PANEL_PAID_MEDIA_CAMPAIGN_STATUS_LABELS[item.status]}
                  </span>
                </td>

                <td className="whitespace-nowrap px-6 py-5 align-top text-on-surface-variant">
                  {formatDate(item.createdAt)}
                </td>

                <td className="px-6 py-5 align-top">
                  <div className="flex justify-end gap-2">
                    <button
                      className="panel-card-muted inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                      onClick={() => onEdit(item)}
                      type="button"
                    >
                      <PencilLine className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      onClick={() => onOpenDashboard(item)}
                      type="button"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      Dashboard
                    </button>
                  </div>
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
