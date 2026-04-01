import { BarChart3 } from "lucide-react";

import { AppSelect } from "../shared/ui/AppSelect";
import {
  PANEL_GOOGLE_DASHBOARD_TABLE_LEVEL_VALUES,
  type PanelGoogleDashboardTableLevel,
  type PanelGoogleDashboardTableRowRecord,
} from "../../services/painel/google-dashboard-api";

type PanelGoogleDashboardTableProps = {
  isLoading: boolean;
  level: PanelGoogleDashboardTableLevel;
  onLevelChange: (value: PanelGoogleDashboardTableLevel) => void;
  rows: PanelGoogleDashboardTableRowRecord[];
};

const TABLE_LEVEL_LABELS: Record<PanelGoogleDashboardTableLevel, string> = {
  ad: "Anúncios",
  adgroup: "Grupos",
  campaign: "Campanhas",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value);
}

function formatNumber(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

function formatPercent(value: number) {
  return `${formatNumber(value, 2)}%`;
}

export function PanelGoogleDashboardTable({
  isLoading,
  level,
  onLevelChange,
  rows,
}: PanelGoogleDashboardTableProps) {
  return (
    <section className="panel-premium-card rounded-[2rem] border p-6 md:p-7">
      <div className="flex flex-col gap-4 border-b border-outline-variant/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
            Visão detalhada
          </p>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-on-surface md:text-xl">
            Desempenho por {TABLE_LEVEL_LABELS[level].toLowerCase()}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
            Acompanhe os dados detalhados da conta Google Ads no nível mais útil para a análise atual.
          </p>
        </div>

        <div className="w-full max-w-[13rem]">
          <AppSelect
            label="Nível da tabela"
            onChange={(event) => onLevelChange(event.target.value as PanelGoogleDashboardTableLevel)}
            value={level}
          >
            {PANEL_GOOGLE_DASHBOARD_TABLE_LEVEL_VALUES.map((item) => (
              <option key={item} value={item}>
                {TABLE_LEVEL_LABELS[item]}
              </option>
            ))}
          </AppSelect>
        </div>
      </div>

      <div className="pt-5">
        {isLoading ? (
          <div className="space-y-3">
            <div className="grid grid-cols-[minmax(15rem,1.6fr)_minmax(10rem,1fr)_repeat(7,minmax(6rem,0.7fr))] gap-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <div className="panel-skeleton h-4 rounded-full" key={index} />
              ))}
            </div>

            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <div
                className="grid grid-cols-[minmax(15rem,1.6fr)_minmax(10rem,1fr)_repeat(7,minmax(6rem,0.7fr))] gap-3 rounded-[1.3rem] border border-outline-variant/10 bg-surface-container-low/60 px-4 py-4"
                key={rowIndex}
              >
                {Array.from({ length: 9 }).map((__, cellIndex) => (
                  <div className="panel-skeleton h-4 rounded-full" key={cellIndex} />
                ))}
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && rows.length === 0 ? (
          <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-outline-variant/16 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-outline-variant/16 bg-surface-container-low text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>
            <p className="mt-4 text-base font-semibold text-on-surface">
              Nenhum dado detalhado foi encontrado
            </p>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-on-surface-variant">
              Ajuste o período ou os filtros da conta para carregar novamente a visão detalhada.
            </p>
          </div>
        ) : null}

        {!isLoading && rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                  <th className="px-4 py-2">Nome</th>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2 text-right">Investimento</th>
                  <th className="px-4 py-2 text-right">Resultados</th>
                  <th className="px-4 py-2 text-right">CTR</th>
                  <th className="px-4 py-2 text-right">CPC</th>
                  <th className="px-4 py-2 text-right">CPM</th>
                  <th className="px-4 py-2 text-right">Cliques</th>
                  <th className="px-4 py-2 text-right">Impressões</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    className="bg-surface-container-low/75 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-surface-container-low"
                    key={`${row.level}-${row.id}`}
                  >
                    <td className="rounded-l-[1.2rem] px-4 py-4">
                      <div className="min-w-[16rem]">
                        <p className="font-semibold text-on-surface">{row.name}</p>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          {TABLE_LEVEL_LABELS[row.level]}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-on-surface-variant">{row.id}</td>
                    <td className="px-4 py-4 text-right font-semibold text-on-surface">
                      {formatCurrency(row.spend)}
                    </td>
                    <td className="px-4 py-4 text-right text-on-surface">
                      <div className="font-semibold">{formatNumber(row.resultsCount)}</div>
                      <div className="text-xs text-on-surface-variant">
                        {formatCurrency(row.costPerResult)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-on-surface">
                      {formatPercent(row.ctr)}
                    </td>
                    <td className="px-4 py-4 text-right text-on-surface">
                      {formatCurrency(row.cpc)}
                    </td>
                    <td className="px-4 py-4 text-right text-on-surface">
                      {formatCurrency(row.cpm)}
                    </td>
                    <td className="px-4 py-4 text-right text-on-surface">
                      {formatNumber(row.clicks)}
                    </td>
                    <td className="rounded-r-[1.2rem] px-4 py-4 text-right text-on-surface">
                      {formatNumber(row.impressions)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}
