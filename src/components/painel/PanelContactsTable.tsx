import type { ReactNode } from "react";

import {
  PANEL_CONTACT_FUNNEL_STATUSES,
  PANEL_CONTACT_STATUS_ORDER,
  getPanelContactStatusLabel,
} from "../../config/painel/contact-status";
import type {
  PanelContactStatus,
  PanelContactSummaryRecord,
} from "../../services/painel/contact-api";
import { PanelContactStatusBadge } from "./PanelContactStatusBadge";
import { PanelContactsActionMenu } from "./PanelContactsActionMenu";
import { formatPanelContactDateTime } from "./panelContactUtils";

type PanelContactsTableProps = {
  footer?: ReactNode;
  isLoading: boolean;
  items: PanelContactSummaryRecord[];
  onArchive: (item: PanelContactSummaryRecord) => void;
  onOpenDetails: (item: PanelContactSummaryRecord) => void;
  onStatusChange: (item: PanelContactSummaryRecord, status: PanelContactStatus) => void;
  updatingIds: string[];
};

function getAvailableStatusOptions(status: PanelContactStatus) {
  return status === "archived" ? PANEL_CONTACT_STATUS_ORDER : PANEL_CONTACT_FUNNEL_STATUSES;
}

export function PanelContactsTable({
  footer,
  isLoading,
  items,
  onArchive,
  onOpenDetails,
  onStatusChange,
  updatingIds,
}: PanelContactsTableProps) {
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
        <p className="text-sm font-semibold text-on-surface">Nenhum contato encontrado</p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          Ajuste a busca, os filtros ou aguarde novas entradas do formulário institucional.
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
              <th className="px-6 py-4 font-semibold">Nome</th>
              <th className="px-6 py-4 font-semibold">E-mail</th>
              <th className="px-6 py-4 font-semibold">WhatsApp</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Origem</th>
              <th className="px-6 py-4 font-semibold">Criado em</th>
              <th className="px-6 py-4 font-semibold">Atualizado em</th>
              <th className="px-6 py-4 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isBusy = updatingIds.includes(item.id);
              const nextStatusOptions = getAvailableStatusOptions(item.status);

              return (
                <tr
                  className="border-b border-outline-variant/10 transition-colors hover:bg-surface-container-low/55 last:border-b-0"
                  key={item.id}
                >
                  <td className="min-w-[16rem] px-6 py-5">
                    <button
                      className="text-left transition-colors hover:text-primary"
                      onClick={() => onOpenDetails(item)}
                      type="button"
                    >
                      <p className="text-[15px] font-semibold text-on-surface">{item.fullName}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Lead #{item.id.slice(0, 8).toUpperCase()}
                      </p>
                    </button>
                  </td>
                  <td className="min-w-[15rem] px-6 py-5">
                    <a
                      className="font-medium text-primary transition-opacity hover:opacity-80"
                      href={`mailto:${item.email}`}
                    >
                      {item.email}
                    </a>
                  </td>
                  <td className="min-w-[12rem] px-6 py-5">
                    <a
                      className="font-medium text-on-surface transition-colors hover:text-primary"
                      href={`https://wa.me/55${item.whatsapp.replace(/\D/g, "").slice(-11)}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {item.whatsapp}
                    </a>
                  </td>
                  <td className="min-w-[15rem] px-6 py-5">
                    <div className="space-y-2">
                      <PanelContactStatusBadge status={item.status} />
                      <select
                        className="panel-input w-full rounded-xl border px-3 py-2 text-xs font-semibold text-on-surface outline-none transition-colors focus:border-primary/35 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isBusy}
                        onChange={(event) => {
                          const nextStatus = event.target.value as PanelContactStatus;

                          if (nextStatus === item.status) {
                            return;
                          }

                          onStatusChange(item, nextStatus);
                        }}
                        value={item.status}
                      >
                        {nextStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {getPanelContactStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="min-w-[10rem] px-6 py-5">
                    {item.source ? (
                      <code className="rounded-full border border-outline-variant/14 bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant">
                        {item.source}
                      </code>
                    ) : (
                      <span className="text-xs text-on-surface-variant">Não informada</span>
                    )}
                  </td>
                  <td className="min-w-[9rem] px-6 py-5 text-on-surface-variant">
                    {formatPanelContactDateTime(item.createdAt)}
                  </td>
                  <td className="min-w-[9rem] px-6 py-5 text-on-surface-variant">
                    {formatPanelContactDateTime(item.updatedAt ?? item.createdAt)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <PanelContactsActionMenu
                      contactName={item.fullName}
                      isArchived={item.status === "archived"}
                      isBusy={isBusy}
                      onArchive={() => onArchive(item)}
                      onOpenDetails={() => onOpenDetails(item)}
                    />
                  </td>
                </tr>
              );
            })}
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
