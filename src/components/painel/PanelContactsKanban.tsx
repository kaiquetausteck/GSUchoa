import { GripVertical } from "lucide-react";
import { useMemo, useState } from "react";

import {
  PANEL_CONTACT_FUNNEL_STATUSES,
  getPanelContactStatusLabel,
} from "../../config/painel/contact-status";
import type {
  PanelContactFunnelRecord,
  PanelContactStatus,
} from "../../services/painel/contact-api";
import { PanelContactsActionMenu } from "./PanelContactsActionMenu";
import {
  buildPanelContactWhatsAppHref,
  formatPanelContactDateTime,
  getPanelContactMessagePreview,
} from "./panelContactUtils";

const COLUMN_MIN_WIDTH_REM = 18.5;
const COLUMN_GAP_REM = 1.25;

type PanelContactsKanbanProps = {
  isLoading: boolean;
  items: PanelContactFunnelRecord[];
  onArchive: (item: PanelContactFunnelRecord) => void;
  onOpenDetails: (item: PanelContactFunnelRecord) => void;
  onStatusChange: (item: PanelContactFunnelRecord, status: PanelContactStatus) => void;
  updatingIds: string[];
};

export function PanelContactsKanban({
  isLoading,
  items,
  onArchive,
  onOpenDetails,
  onStatusChange,
  updatingIds,
}: PanelContactsKanbanProps) {
  const [draggedContactId, setDraggedContactId] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState<PanelContactStatus | null>(null);

  const columns = useMemo(
    () =>
      PANEL_CONTACT_FUNNEL_STATUSES.map((status) => ({
        status,
        items: items.filter((item) => item.status === status),
      })),
    [items],
  );
  const boardStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${columns.length}, minmax(${COLUMN_MIN_WIDTH_REM}rem, 1fr))`,
      minWidth: `max(100%, calc(${columns.length} * ${COLUMN_MIN_WIDTH_REM}rem + ${(columns.length - 1) * COLUMN_GAP_REM}rem))`,
    }),
    [columns.length],
  );

  if (isLoading) {
    return (
      <section className="panel-funnel-stage">
        <div className="panel-funnel-scroll">
          <div className="panel-funnel-board grid gap-5" style={boardStyle}>
            {Array.from({ length: 7 }).map((_, index) => (
              <div className="panel-funnel-column rounded-[1.9rem] p-4 md:p-5" key={index}>
                <div className="panel-card-muted h-10 animate-pulse rounded-2xl border" />
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, cardIndex) => (
                    <div
                      className="panel-card-muted h-40 animate-pulse rounded-[1.5rem] border"
                      key={cardIndex}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel-funnel-stage">
      <div className="panel-funnel-scroll">
        <div className="panel-funnel-board grid gap-5" style={boardStyle}>
        {columns.map((column) => {
          const isDropActive = activeColumn === column.status;

          return (
            <section
              className={`panel-funnel-column flex min-h-0 flex-col overflow-hidden rounded-[1.9rem] p-4 transition-[border-color,background-color,transform] md:p-5 ${
                isDropActive ? "border-primary/40 bg-primary/5" : ""
              }`}
              key={column.status}
              onDragEnter={() => setActiveColumn(column.status)}
              onDragOver={(event) => {
                event.preventDefault();
                setActiveColumn(column.status);
              }}
              onDragLeave={(event) => {
                if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  return;
                }

                setActiveColumn((current) => (current === column.status ? null : current));
              }}
              onDrop={(event) => {
                event.preventDefault();

                const draggedContact = items.find((item) => item.id === draggedContactId);
                setActiveColumn(null);
                setDraggedContactId(null);

                if (!draggedContact || draggedContact.status === column.status) {
                  return;
                }

                onStatusChange(draggedContact, column.status);
              }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-outline-variant/10 pb-4">
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {getPanelContactStatusLabel(column.status)}
                  </p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {column.items.length} {column.items.length === 1 ? "lead" : "leads"}
                  </p>
                </div>
                <span className="rounded-full border border-outline-variant/14 bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant">
                  {column.items.length}
                </span>
              </div>

              <div className="panel-funnel-column-body mt-4 flex min-h-0 flex-1 flex-col gap-3 pr-1">
                {column.items.length ? (
                  column.items.map((item) => {
                    const isBusy = updatingIds.includes(item.id);

                    return (
                      <article
                        className={`panel-funnel-card rounded-[1.5rem] p-4 transition-transform ${
                          draggedContactId === item.id ? "scale-[0.99] opacity-75" : ""
                        }`}
                        draggable={!isBusy}
                        key={item.id}
                        onDragEnd={() => {
                          setActiveColumn(null);
                          setDraggedContactId(null);
                        }}
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", item.id);
                          setDraggedContactId(item.id);
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-on-surface">{item.fullName}</p>
                            <p className="mt-1 truncate text-xs text-on-surface-variant">{item.email}</p>
                            <a
                              className="mt-1 inline-flex text-xs font-medium text-on-surface-variant transition-colors hover:text-primary"
                              href={buildPanelContactWhatsAppHref(item.whatsapp)}
                              rel="noreferrer"
                              target="_blank"
                            >
                              {item.whatsapp}
                            </a>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-outline-variant/14 bg-surface text-on-surface-variant">
                              <GripVertical className="h-4 w-4" />
                            </span>
                            <PanelContactsActionMenu
                              contactName={item.fullName}
                              isArchived={false}
                              isBusy={isBusy}
                              onArchive={() => onArchive(item)}
                              onOpenDetails={() => onOpenDetails(item)}
                            />
                          </div>
                        </div>

                        <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                          {getPanelContactMessagePreview(item.message)}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-outline-variant/12 bg-surface px-3 py-1 text-[11px] font-semibold text-on-surface-variant">
                            Entrada em {formatPanelContactDateTime(item.createdAt)}
                          </span>
                          {item.source ? (
                            <code className="rounded-full border border-outline-variant/12 bg-surface px-3 py-1 text-[11px] font-semibold text-on-surface-variant">
                              {item.source}
                            </code>
                          ) : null}
                        </div>

                        <div className="mt-4 grid gap-2">
                          <select
                            className="panel-input w-full rounded-xl border px-3 py-2.5 text-xs font-semibold text-on-surface outline-none transition-colors focus:border-primary/35 disabled:cursor-not-allowed disabled:opacity-60"
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
                            {PANEL_CONTACT_FUNNEL_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {getPanelContactStatusLabel(status)}
                              </option>
                            ))}
                          </select>

                          <button
                            className="panel-card inline-flex items-center justify-center rounded-xl border px-3 py-2.5 text-xs font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                            onClick={() => onOpenDetails(item)}
                            type="button"
                          >
                            Ver detalhes
                          </button>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="panel-funnel-empty flex flex-1 items-center justify-center rounded-[1.4rem] px-4 py-8 text-center text-sm leading-relaxed text-on-surface-variant">
                    Nenhum lead nesta etapa no momento.
                  </div>
                )}
              </div>
            </section>
          );
        })}
        </div>
      </div>
    </section>
  );
}
