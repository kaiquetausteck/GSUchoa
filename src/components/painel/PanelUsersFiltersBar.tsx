import * as Popover from "@radix-ui/react-popover";
import { RefreshCcw, Search, SlidersHorizontal, X } from "lucide-react";

import { AppInput } from "../shared/ui/AppInput";
import { AppSelect } from "../shared/ui/AppSelect";

type PanelUsersFiltersBarProps = {
  hasActiveFilters: boolean;
  isLoading: boolean;
  onPerPageChange: (value: number) => void;
  onRefresh: () => void;
  onResetFilters: () => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "all" | "active" | "inactive") => void;
  perPage: number;
  searchValue: string;
  statusValue: "all" | "active" | "inactive";
};

export function PanelUsersFiltersBar({
  hasActiveFilters,
  isLoading,
  onPerPageChange,
  onRefresh,
  onResetFilters,
  onSearchChange,
  onStatusChange,
  perPage,
  searchValue,
  statusValue,
}: PanelUsersFiltersBarProps) {
  const statusLabel =
    statusValue === "active" ? "Ativos" : statusValue === "inactive" ? "Inativos" : "Todos";

  return (
    <div className="panel-card rounded-[1.75rem] border p-5 md:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <AppInput
            className="py-0"
            leadingIcon={<Search className="h-4 w-4" />}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nome, e-mail ou identificador"
            value={searchValue}
            wrapperClassName="h-12 rounded-[1.2rem]"
          />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="panel-card-muted inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold text-on-surface">
              {statusLabel}
            </span>
            <span className="panel-card-muted inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold text-on-surface">
              {perPage} por pagina
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
                className="panel-popover z-[120] w-[22rem] rounded-[1.5rem] border p-4 shadow-lg"
                sideOffset={10}
              >
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                      Filtros
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-on-surface">
                      Ajustar listagem
                    </h3>
                  </div>

                  <AppSelect
                    label="Status"
                    onChange={(event) => onStatusChange(event.target.value as "all" | "active" | "inactive")}
                    value={statusValue}
                  >
                    <option value="all">Todos</option>
                    <option value="active">Ativos</option>
                    <option value="inactive">Inativos</option>
                  </AppSelect>

                  <AppSelect
                    label="Por pagina"
                    onChange={(event) => onPerPageChange(Number(event.target.value))}
                    value={String(perPage)}
                  >
                    {[10, 20, 30, 50].map((value) => (
                      <option key={value} value={String(value)}>
                        {value}
                      </option>
                    ))}
                  </AppSelect>

                  <div className="flex items-center justify-between gap-3 border-t border-outline-variant/10 pt-3">
                    <button
                      className="text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
                      onClick={onResetFilters}
                      type="button"
                    >
                      Restaurar padrao
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
