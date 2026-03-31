import { CalendarRange, RefreshCcw, Search, SlidersHorizontal, X } from "lucide-react";

import type { PanelPaidMediaCampaignSort, PanelPaidMediaCampaignStatus } from "../../services/painel/paid-media-api";
import { AppInput } from "../shared/ui/AppInput";
import { AppSelect } from "../shared/ui/AppSelect";

type PanelPaidMediaFiltersBarProps = {
  clientOptions: Array<{ label: string; value: string }>;
  clientValue: string;
  hasActiveFilters: boolean;
  isClientsLoading: boolean;
  isLoading: boolean;
  onClientChange: (value: string) => void;
  onPeriodEndChange: (value: string) => void;
  onPeriodStartChange: (value: string) => void;
  onRefresh: () => void;
  onResetFilters: () => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: PanelPaidMediaCampaignSort) => void;
  onStatusChange: (value: "all" | PanelPaidMediaCampaignStatus) => void;
  periodEndValue: string;
  periodStartValue: string;
  searchValue: string;
  sortValue: PanelPaidMediaCampaignSort;
  statusValue: "all" | PanelPaidMediaCampaignStatus;
};

const SORT_OPTIONS: Array<{ label: string; value: PanelPaidMediaCampaignSort }> = [
  { label: "Criação recente", value: "createdAt-desc" },
  { label: "Criação antiga", value: "createdAt-asc" },
  { label: "Nome A-Z", value: "name-asc" },
  { label: "Nome Z-A", value: "name-desc" },
  { label: "Início mais próximo", value: "startDate-asc" },
  { label: "Início mais distante", value: "startDate-desc" },
];

export function PanelPaidMediaFiltersBar({
  clientOptions,
  clientValue,
  hasActiveFilters,
  isClientsLoading,
  isLoading,
  onClientChange,
  onPeriodEndChange,
  onPeriodStartChange,
  onRefresh,
  onResetFilters,
  onSearchChange,
  onSortChange,
  onStatusChange,
  periodEndValue,
  periodStartValue,
  searchValue,
  sortValue,
  statusValue,
}: PanelPaidMediaFiltersBarProps) {
  return (
    <section className="panel-card rounded-[1.9rem] border p-5 md:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <AppInput
              className="py-0"
              leadingIcon={<Search className="h-4 w-4" />}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar por nome ou objetivo"
              value={searchValue}
              wrapperClassName="h-12 rounded-[1.2rem]"
            />
            <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
              Filtre campanhas internas da Meta por status, cliente e janela de período.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 xl:self-start">
            <button
              className="panel-card-muted inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
              onClick={onRefresh}
              type="button"
            >
              <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </button>
            <button
              className="panel-card-muted inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!hasActiveFilters}
              onClick={onResetFilters}
              type="button"
            >
              <X className="h-4 w-4" />
              Limpar
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr_0.9fr_0.7fr_0.7fr]">
          <AppSelect
            label="Status"
            onChange={(event) => onStatusChange(event.target.value as "all" | PanelPaidMediaCampaignStatus)}
            value={statusValue}
          >
            <option value="all">Todos</option>
            <option value="draft">Rascunho</option>
            <option value="active">Ativa</option>
            <option value="paused">Pausada</option>
            <option value="completed">Concluída</option>
            <option value="archived">Arquivada</option>
          </AppSelect>

          <AppSelect
            label="Cliente"
            onChange={(event) => onClientChange(event.target.value)}
            value={clientValue}
          >
            <option value="">{isClientsLoading ? "Carregando clientes..." : "Todos os clientes"}</option>
            {clientOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AppSelect>

          <AppSelect
            label="Ordenação"
            onChange={(event) => onSortChange(event.target.value as PanelPaidMediaCampaignSort)}
            value={sortValue}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AppSelect>

          <AppInput
            label="Período inicial"
            leadingIcon={<CalendarRange className="h-4 w-4" />}
            onChange={(event) => onPeriodStartChange(event.target.value)}
            type="date"
            value={periodStartValue}
          />

          <AppInput
            label="Período final"
            leadingIcon={<SlidersHorizontal className="h-4 w-4" />}
            onChange={(event) => onPeriodEndChange(event.target.value)}
            type="date"
            value={periodEndValue}
          />
        </div>
      </div>
    </section>
  );
}
