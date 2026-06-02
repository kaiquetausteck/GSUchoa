import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  LoaderCircle,
  MousePointerClick,
  RefreshCcw,
  Target,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { PanelMetricCard } from "../../components/painel/PanelMetricCard";
import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { Seo } from "../../components/shared/Seo";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import {
  getPanelLinkedInDashboardSummary,
  getPanelLinkedInDashboardTable,
  getPanelLinkedInDashboardTimeline,
  type PanelLinkedInDashboardSummaryRecord,
  type PanelLinkedInDashboardTableRecord,
  type PanelLinkedInDashboardTimelineRecord,
} from "../../services/painel/linkedin-dashboard-api";

type DashboardPeriodPreset = "30d" | "7d" | "custom" | "today";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getPresetRange(preset: Exclude<DashboardPeriodPreset, "custom">) {
  const today = new Date();
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDate = new Date(endDate);

  if (preset === "today") {
    return {
      endDate: toDateInputValue(endDate),
      startDate: toDateInputValue(startDate),
    };
  }

  startDate.setDate(startDate.getDate() - (preset === "7d" ? 6 : 29));

  return {
    endDate: toDateInputValue(endDate),
    startDate: toDateInputValue(startDate),
  };
}

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

function formatDate(value: string) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(parsedDate);
}

export default function PaidMediaLinkedInAccountDashboardPage() {
  const navigate = useNavigate();
  const { token } = usePanelAuth();
  const { accountId } = useParams<{ accountId: string }>();
  const initialRange = useMemo(() => getPresetRange("30d"), []);
  const [rangePreset, setRangePreset] = useState<DashboardPeriodPreset>("30d");
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [summary, setSummary] = useState<PanelLinkedInDashboardSummaryRecord | null>(null);
  const [timeline, setTimeline] = useState<PanelLinkedInDashboardTimelineRecord | null>(null);
  const [table, setTable] = useState<PanelLinkedInDashboardTableRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!token || !accountId) {
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const query = {
        accountId,
        endDate,
        startDate,
      };
      const [nextSummary, nextTimeline, nextTable] = await Promise.all([
        getPanelLinkedInDashboardSummary(token, query),
        getPanelLinkedInDashboardTimeline(token, query),
        getPanelLinkedInDashboardTable(token, { ...query, level: "campaign" }),
      ]);

      setSummary(nextSummary);
      setTimeline(nextTimeline);
      setTable(nextTable);
    } catch (error) {
      setSummary(null);
      setTimeline(null);
      setTable(null);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o dashboard LinkedIn Ads agora.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [accountId, endDate, startDate, token]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handlePresetChange = useCallback((preset: DashboardPeriodPreset) => {
    setRangePreset(preset);

    if (preset !== "custom") {
      const nextRange = getPresetRange(preset);
      setStartDate(nextRange.startDate);
      setEndDate(nextRange.endDate);
    }
  }, []);

  return (
    <>
      <Seo
        description="Dashboard operacional de LinkedIn Ads com métricas pagas por conta."
        noindex
        path={`/painel/trafego-pago/linkedin/${accountId ?? ""}/dashboard`}
        structuredData={null}
        title="LinkedIn Ads • Dashboard"
      />

      <div className="space-y-6">
        <PanelPageHeader
          actions={(
            <button
              className="panel-card-muted inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
              onClick={() => navigate("/painel/trafego-pago/linkedin")}
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          )}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Tráfego pago", to: "/painel/trafego-pago/linkedin" },
            { label: "LinkedIn", to: "/painel/trafego-pago/linkedin" },
            { label: "Dashboard" },
          ]}
          description={summary ? `${summary.accountName} • ${formatDate(startDate)} a ${formatDate(endDate)}` : "Carregando métricas pagas do LinkedIn Ads."}
          title="Dashboard LinkedIn Ads"
        />

        <section className="panel-card rounded-[2rem] border p-5 md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {([
                ["today", "Hoje"],
                ["7d", "7 dias"],
                ["30d", "30 dias"],
                ["custom", "Personalizado"],
              ] as Array<[DashboardPeriodPreset, string]>).map(([value, label]) => (
                <button
                  className={`h-11 rounded-2xl border px-4 text-sm font-semibold transition-colors ${
                    rangePreset === value
                      ? "border-primary/35 bg-primary/10 text-primary"
                      : "border-outline-variant/16 text-on-surface hover:border-primary/30 hover:text-primary"
                  }`}
                  key={value}
                  onClick={() => handlePresetChange(value)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex h-11 items-center gap-2 rounded-2xl border border-outline-variant/16 px-3 text-sm text-on-surface">
                <CalendarDays className="h-4 w-4 text-primary" />
                <input
                  className="bg-transparent text-sm outline-none"
                  onChange={(event) => {
                    setRangePreset("custom");
                    setStartDate(event.target.value);
                  }}
                  type="date"
                  value={startDate}
                />
              </label>
              <label className="flex h-11 items-center gap-2 rounded-2xl border border-outline-variant/16 px-3 text-sm text-on-surface">
                <CalendarDays className="h-4 w-4 text-primary" />
                <input
                  className="bg-transparent text-sm outline-none"
                  onChange={(event) => {
                    setRangePreset("custom");
                    setEndDate(event.target.value);
                  }}
                  type="date"
                  value={endDate}
                />
              </label>
              <button
                className="panel-card-muted inline-flex h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                onClick={() => void loadDashboard()}
                type="button"
              >
                <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Atualizar
              </button>
            </div>
          </div>
        </section>

        {loadError ? (
          <section className="panel-card rounded-[1.8rem] border border-red-500/14 bg-red-500/6 px-5 py-4">
            <p className="text-sm font-semibold text-on-surface">Falha ao carregar LinkedIn Ads</p>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{loadError}</p>
          </section>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-4">
          <PanelMetricCard
            description="Investimento informado pelo LinkedIn Ads no período selecionado."
            icon={<Wallet className="h-6 w-6" />}
            label="Investimento"
            loading={isLoading}
            numberFormatter={formatCurrency}
            value={summary ? formatCurrency(summary.spend) : "R$ 0,00"}
            valueNumber={summary?.spend}
          />
          <PanelMetricCard
            description="Volume total de impressões pagas retornadas pelo relatório."
            icon={<BriefcaseBusiness className="h-6 w-6" />}
            label="Impressões"
            loading={isLoading}
            numberFormatter={(value) => formatNumber(value)}
            value={summary ? formatNumber(summary.impressions) : "0"}
            valueNumber={summary?.impressions}
          />
          <PanelMetricCard
            description="Cliques totais registrados nas campanhas da conta."
            icon={<MousePointerClick className="h-6 w-6" />}
            label="Cliques"
            loading={isLoading}
            numberFormatter={(value) => formatNumber(value)}
            value={summary ? formatNumber(summary.clicks) : "0"}
            valueNumber={summary?.clicks}
          />
          <PanelMetricCard
            description="Conversões externas reportadas pelo LinkedIn Ads."
            icon={<Target className="h-6 w-6" />}
            label="Resultados"
            loading={isLoading}
            numberFormatter={(value) => formatNumber(value)}
            value={summary ? formatNumber(summary.resultsCount) : "0"}
            valueNumber={summary?.resultsCount}
          />
        </section>

        <section className="panel-card rounded-[2rem] border p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Campanhas</p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-on-surface">Distribuição de performance</h2>
            </div>
            {isLoading ? <LoaderCircle className="h-5 w-5 animate-spin text-primary" /> : null}
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-outline-variant/12 text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
                <tr>
                  <th className="px-3 py-3 font-semibold">Campanha</th>
                  <th className="px-3 py-3 text-right font-semibold">Investimento</th>
                  <th className="px-3 py-3 text-right font-semibold">Impressões</th>
                  <th className="px-3 py-3 text-right font-semibold">Cliques</th>
                  <th className="px-3 py-3 text-right font-semibold">CTR</th>
                </tr>
              </thead>
              <tbody>
                {(table?.data ?? []).map((item) => (
                  <tr className="border-b border-outline-variant/10 last:border-b-0" key={item.id}>
                    <td className="px-3 py-4 font-semibold text-on-surface">{item.name}</td>
                    <td className="px-3 py-4 text-right text-on-surface-variant">{formatCurrency(item.spend)}</td>
                    <td className="px-3 py-4 text-right text-on-surface-variant">{formatNumber(item.impressions)}</td>
                    <td className="px-3 py-4 text-right text-on-surface-variant">{formatNumber(item.clicks)}</td>
                    <td className="px-3 py-4 text-right text-on-surface-variant">{formatPercent(item.ctr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!isLoading && !table?.data.length ? (
              <p className="py-8 text-center text-sm text-on-surface-variant">
                Nenhuma campanha com dados no período selecionado.
              </p>
            ) : null}
          </div>
        </section>

        {timeline?.data.length ? (
          <p className="text-xs text-on-surface-variant">
            Linha do tempo carregada com {timeline.data.length} ponto(s). A visualização gráfica pode seguir o mesmo componente dos dashboards Meta e Google.
          </p>
        ) : null}
      </div>
    </>
  );
}
