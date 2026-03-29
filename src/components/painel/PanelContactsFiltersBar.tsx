import * as Popover from "@radix-ui/react-popover";
import { RefreshCcw, Search, SlidersHorizontal, X } from "lucide-react";

import {
  PANEL_CONTACT_STATUS_ORDER,
  getPanelContactStatusLabel,
} from "../../config/painel/contact-status";
import type {
  PanelContactSort,
  PanelContactStatus,
} from "../../services/painel/contact-api";
import { AppInput } from "../shared/ui/AppInput";
import { AppSelect } from "../shared/ui/AppSelect";

type PanelContactsFiltersBarProps = {
  createdFromValue: string;
  createdToValue: string;
  hasActiveFilters: boolean;
  isLoading: boolean;
  onCreatedFromChange: (value: string) => void;
  onCreatedToChange: (value: string) => void;
  onPerPageChange: (value: number) => void;
  onRefresh: () => void;
  onResetFilters: () => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: PanelContactSort) => void;
  onStatusChange: (value: "all" | PanelContactStatus) => void;
  perPage: number;
  searchValue: string;
  sortValue: PanelContactSort;
  statusValue: "all" | PanelContactStatus;
  view: "list" | "funnel";
};

const SORT_OPTIONS: Array<{ label: string; value: PanelContactSort }> = [
  { label: "Criação recente", value: "createdAt-desc" },
  { label: "Criação antiga", value: "createdAt-asc" },
  { label: "Nome de A a Z", value: "fullName-asc" },
  { label: "Nome de Z a A", value: "fullName-desc" },
  { label: "Status de A a Z", value: "status-asc" },
  { label: "Status de Z a A", value: "status-desc" },
];

function getDateRangeLabel(createdFromValue: string, createdToValue: string) {
  if (!createdFromValue && !createdToValue) {
    return "Período completo";
  }

  if (createdFromValue && createdToValue) {
    return `${createdFromValue} até ${createdToValue}`;
  }

  if (createdFromValue) {
    return `A partir de ${createdFromValue}`;
  }

  return `Até ${createdToValue}`;
}

export function PanelContactsFiltersBar({
  createdFromValue,
  createdToValue,
  hasActiveFilters,
  isLoading,
  onCreatedFromChange,
  onCreatedToChange,
  onPerPageChange,
  onRefresh,
  onResetFilters,
  onSearchChange,
  onSortChange,
  onStatusChange,
  perPage,
  searchValue,
  sortValue,
  statusValue,
  view,
}: PanelContactsFiltersBarProps) {
  const sortLabel = SORT_OPTIONS.find((option) => option.value === sortValue)?.label ?? "Criação recente";
  const statusLabel = statusValue === "all" ? "Todos os status" : getPanelContactStatusLabel(statusValue);
  const searchPlaceholder =
    view === "funnel"
      ? "Filtrar cards por nome, e-mail ou WhatsApp"
      : "Buscar por nome, e-mail ou WhatsApp";

  return (
    <div className="panel-card rounded-[1.75rem] border p-5 md:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <AppInput
            className="py-0"
            leadingIcon={<Search className="h-4 w-4" />}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            value={searchValue}
            wrapperClassName="h-12 rounded-[1.2rem]"
          />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="panel-card-muted inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold text-on-surface">
              {view === "list" ? "Listagem" : "Funil"}
            </span>

            {view === "list" ? (
              <>
                <span className="panel-card-muted inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold text-on-surface">
                  {statusLabel}
                </span>
                <span className="panel-card-muted inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold text-on-surface">
                  {sortLabel}
                </span>
                <span className="panel-card-muted inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold text-on-surface">
                  {perPage} por página
                </span>
              </>
            ) : null}

            <span className="panel-card-muted inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold text-on-surface">
              {getDateRangeLabel(createdFromValue, createdToValue)}
            </span>

            {hasActiveFilters ? (
              <button
                className="inline-flex items-center gap-1 rounded-full border border-outline-variant/20 px-3 py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
                onClick={onResetFilters}
                type="button"
              >
                <X className="h-3.5 w-3.5" />
                Limpar filtros
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:self-start">
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                className="panel-card-muted relative inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                type="button"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {hasActiveFilters ? (
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                ) : null}
              </button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                align="end"
                className="panel-popover z-[120] w-[24rem] rounded-[1.5rem] border p-4 shadow-lg"
                sideOffset={10}
              >
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                      Filtros
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-on-surface">
                      Ajustar {view === "list" ? "listagem" : "funil"}
                    </h3>
                  </div>

                  {view === "list" ? (
                    <>
                      <AppSelect
                        label="Status"
                        onChange={(event) => onStatusChange(event.target.value as "all" | PanelContactStatus)}
                        value={statusValue}
                      >
                        <option value="all">Todos</option>
                        {PANEL_CONTACT_STATUS_ORDER.map((status) => (
                          <option key={status} value={status}>
                            {getPanelContactStatusLabel(status)}
                          </option>
                        ))}
                      </AppSelect>

                      <AppSelect
                        label="Ordenação"
                        onChange={(event) => onSortChange(event.target.value as PanelContactSort)}
                        value={sortValue}
                      >
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </AppSelect>

                      <AppSelect
                        label="Por página"
                        onChange={(event) => onPerPageChange(Number(event.target.value))}
                        value={String(perPage)}
                      >
                        {[10, 20, 30, 50, 100].map((value) => (
                          <option key={value} value={String(value)}>
                            {value}
                          </option>
                        ))}
                      </AppSelect>
                    </>
                  ) : (
                    <div className="rounded-[1.2rem] border border-dashed border-outline-variant/20 px-4 py-3 text-sm leading-relaxed text-on-surface-variant">
                      A busca no funil é aplicada localmente aos cards carregados. Use o período para
                      recarregar os dados a partir da API.
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <AppInput
                      label="Criado de"
                      onChange={(event) => onCreatedFromChange(event.target.value)}
                      type="date"
                      value={createdFromValue}
                    />
                    <AppInput
                      label="Criado até"
                      onChange={(event) => onCreatedToChange(event.target.value)}
                      type="date"
                      value={createdToValue}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-outline-variant/10 pt-3">
                    <button
                      className="text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
                      onClick={onResetFilters}
                      type="button"
                    >
                      Restaurar padrão
                    </button>
                    <Popover.Close asChild>
                      <button
                        className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        type="button"
                      >
                        Concluir
                      </button>
                    </Popover.Close>
                  </div>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <button
            className="panel-card-muted inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
            onClick={onRefresh}
            type="button"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>
      </div>
    </div>
  );
}
