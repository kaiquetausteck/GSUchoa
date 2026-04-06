import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Funnel,
  LoaderCircle,
  MousePointerClick,
  RefreshCcw,
  Target,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { PanelAnalyticsCard } from "../../components/painel/PanelAnalyticsCard";
import { PanelLineChart } from "../../components/painel/PanelLineChart";
import { PanelMetricCard } from "../../components/painel/PanelMetricCard";
import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { PanelProgressList } from "../../components/painel/PanelProgressList";
import { PANEL_PAID_MEDIA_DASHBOARD_SOURCE_LABELS } from "../../config/painel/paid-media";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import { useToast } from "../../context/shared/ToastContext";
import {
  getPanelPaidMediaCampaignById,
  getPanelPaidMediaCampaignDashboardFunnel,
  getPanelPaidMediaCampaignDashboardSummary,
  getPanelPaidMediaCampaignDashboardTable,
  getPanelPaidMediaCampaignDashboardTimeline,
  type PanelPaidMediaCampaignDetailRecord,
  type PanelPaidMediaDashboardFunnelRecord,
  type PanelPaidMediaDashboardSummaryRecord,
  type PanelPaidMediaDashboardTableRecord,
  type PanelPaidMediaDashboardTimelineRecord,
} from "../../services/painel/paid-media-api";

type DashboardRangePreset = "30d" | "7d" | "custom" | "today";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getPresetRange(preset: DashboardRangePreset) {
  const today = new Date();
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDate = new Date(endDate);

  if (preset === "today") {
    return {
      endDate: toDateInputValue(endDate),
      startDate: toDateInputValue(startDate),
    };
  }

  if (preset === "7d") {
    startDate.setDate(startDate.getDate() - 6);
  } else if (preset === "30d") {
    startDate.setDate(startDate.getDate() - 29);
  }

  return {
    endDate: toDateInputValue(endDate),
    startDate: toDateInputValue(startDate),
  };
}

function resolvePresetFromDates(startDate: string, endDate: string): DashboardRangePreset {
  if (!startDate || !endDate) {
    return "custom";
  }

  const comparablePresets: DashboardRangePreset[] = ["today", "7d", "30d"];

  for (const preset of comparablePresets) {
    const presetRange = getPresetRange(preset);

    if (presetRange.startDate === startDate && presetRange.endDate === endDate) {
      return preset;
    }
  }

  return "custom";
}

function resolveInitialRange(campaign: PanelPaidMediaCampaignDetailRecord) {
  const campaignStartDate = campaign.startDate?.slice(0, 10) ?? "";
  const campaignEndDate = campaign.endDate?.slice(0, 10) ?? "";

  if (campaignStartDate || campaignEndDate) {
    return {
      endDate: campaignEndDate,
      preset: resolvePresetFromDates(campaignStartDate, campaignEndDate),
      startDate: campaignStartDate,
    };
  }

  const fallbackRange = getPresetRange("30d");

  return {
    ...fallbackRange,
    preset: "30d" as const,
  };
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
  const parsedValue = new Date(value);

  if (Number.isNaN(parsedValue.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
  }).format(parsedValue);
}

function formatDateRangeSummary(startDate: string, endDate: string) {
  if (startDate && endDate) {
    return `${formatDate(startDate)} a ${formatDate(endDate)}`;
  }

  if (startDate) {
    return `A partir de ${formatDate(startDate)}`;
  }

  if (endDate) {
    return `Até ${formatDate(endDate)}`;
  }

  return "Período não definido";
}

function resolveChartRange(totalPoints: number): "12m" | "30d" | "7d" {
  if (totalPoints > 45) {
    return "12m";
  }

  if (totalPoints > 7) {
    return "30d";
  }

  return "7d";
}

export default function PaidMediaMetaCampaignDashboardPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { token } = usePanelAuth();
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<PanelPaidMediaCampaignDetailRecord | null>(null);
  const [summary, setSummary] = useState<PanelPaidMediaDashboardSummaryRecord | null>(null);
  const [timeline, setTimeline] = useState<PanelPaidMediaDashboardTimelineRecord | null>(null);
  const [funnelData, setFunnelData] = useState<PanelPaidMediaDashboardFunnelRecord | null>(null);
  const [tableData, setTableData] = useState<PanelPaidMediaDashboardTableRecord | null>(null);
  const [rangePreset, setRangePreset] = useState<DashboardRangePreset>("custom");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCampaignLoading, setIsCampaignLoading] = useState(true);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [hasInitializedRange, setHasInitializedRange] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadCampaign = useCallback(async () => {
    if (!token || !id) {
      return;
    }

    setIsCampaignLoading(true);
    setHasInitializedRange(false);
    setLoadError(null);
    setSummary(null);
    setTimeline(null);
    setFunnelData(null);
    setTableData(null);

    try {
      const nextCampaign = await getPanelPaidMediaCampaignById(token, id);
      const initialRange = resolveInitialRange(nextCampaign);

      setCampaign(nextCampaign);
      setStartDate(initialRange.startDate);
      setEndDate(initialRange.endDate);
      setRangePreset(initialRange.preset);
      setHasInitializedRange(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar a campanha agora.";

      setLoadError(message);
      toast.error({
        title: "Falha ao carregar campanha",
        description: message,
      });
    } finally {
      setIsCampaignLoading(false);
    }
  }, [id, toast, token]);

  useEffect(() => {
    void loadCampaign();
  }, [loadCampaign]);

  const loadDashboard = useCallback(async () => {
    if (!token || !id || !hasInitializedRange) {
      return;
    }

    setIsDashboardLoading(true);
    setLoadError(null);

    try {
      const query = {
        endDate: endDate || undefined,
        startDate: startDate || undefined,
      };

      const [nextSummary, nextTimeline, nextFunnel, nextTable] = await Promise.all([
        getPanelPaidMediaCampaignDashboardSummary(token, id, query),
        getPanelPaidMediaCampaignDashboardTimeline(token, id, query),
        getPanelPaidMediaCampaignDashboardFunnel(token, id, query),
        getPanelPaidMediaCampaignDashboardTable(token, id, query),
      ]);

      setSummary(nextSummary);
      setTimeline(nextTimeline);
      setFunnelData(nextFunnel);
      setTableData(nextTable);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o dashboard da campanha agora.";

      setLoadError(message);
      toast.error({
        title: "Falha ao carregar dashboard",
        description: message,
      });
    } finally {
      setIsDashboardLoading(false);
    }
  }, [endDate, hasInitializedRange, id, startDate, toast, token]);

  useEffect(() => {
    if (!hasInitializedRange) {
      return;
    }

    void loadDashboard();
  }, [hasInitializedRange, loadDashboard]);

  const isLoading = isCampaignLoading || isDashboardLoading;

  const metricCards = useMemo(() => {
    if (!summary) {
      return [];
    }

    return [
      {
        description: "Volume total investido no período selecionado para a campanha.",
        icon: <Wallet className="h-5 w-5" />,
        label: "Investimento",
        value: formatNumber(summary.spend, 2),
      },
      {
        description: "Alcance potencial da campanha no intervalo analisado.",
        icon: <Activity className="h-5 w-5" />,
        label: "Alcance",
        value: formatNumber(summary.reach),
      },
      {
        description: "Quantidade total de impressões registradas no período.",
        icon: <BarChart3 className="h-5 w-5" />,
        label: "Impressões",
        value: formatNumber(summary.impressions),
      },
      {
        description: "Cliques gerados a partir da operação da campanha.",
        icon: <MousePointerClick className="h-5 w-5" />,
        label: "Cliques",
        value: formatNumber(summary.clicks),
      },
      {
        description: "Taxa de clique consolidada no período analisado.",
        icon: <Target className="h-5 w-5" />,
        label: "CTR",
        value: formatPercent(summary.ctr),
      },
      {
        description: "Eficiência média por resultado no período selecionado.",
        icon: <Funnel className="h-5 w-5" />,
        label: "Custo por resultado",
        value: formatNumber(summary.costPerResult, 2),
      },
    ];
  }, [summary]);

  const timelineSeries = useMemo(() => {
    if (!timeline) {
      return [];
    }

    return [
      {
        color: "#2262f0",
        label: "Investimento",
        valueFormatter: (value: number) => formatNumber(value, 2),
        values: timeline.data.map((item) => item.spend),
      },
      {
        color: "#2dc7a3",
        label: "Cliques",
        valueFormatter: (value: number) => formatNumber(value),
        values: timeline.data.map((item) => item.clicks),
      },
      {
        color: "#f59e0b",
        label: "Resultados",
        valueFormatter: (value: number) => formatNumber(value),
        values: timeline.data.map((item) => item.resultsCount),
      },
    ];
  }, [timeline]);

  const funnelItems = useMemo(() => {
    if (!funnelData) {
      return [];
    }

    return [
      {
        color: "linear-gradient(90deg, #2262f0 0%, #5b8cff 100%)",
        helper: "Pessoas alcançadas no período.",
        label: "Alcance",
        value: funnelData.reach,
      },
      {
        color: "linear-gradient(90deg, #1f8fdd 0%, #2dc7a3 100%)",
        helper: "Interações registradas em forma de clique.",
        label: "Cliques",
        value: funnelData.clicks,
      },
      {
        color: "linear-gradient(90deg, #f59e0b 0%, #f97316 100%)",
        helper: "Resultados atribuídos pelo backend no mesmo período.",
        label: "Resultados",
        value: funnelData.resultsCount,
      },
      {
        color: "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
        helper: "Conversões consolidadas pela API da campanha.",
        label: "Conversões",
        value: funnelData.conversions,
      },
    ];
  }, [funnelData]);

  const sourceLabel = summary
    ? PANEL_PAID_MEDIA_DASHBOARD_SOURCE_LABELS[summary.source]
    : timeline
      ? PANEL_PAID_MEDIA_DASHBOARD_SOURCE_LABELS[timeline.source]
      : "Sem fonte de dados";

  return (
    <div className="space-y-6">
      <PanelPageHeader
        actions={(
          <>
          {campaign ? (
              <button
                className="panel-card-muted inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                onClick={() => navigate(`/painel/trafego-pago/meta/campanhas/${campaign.id}`)}
                type="button"
              >
                Editar campanha
                <ArrowUpRight className="h-4 w-4" />
              </button>
            ) : null}
            <button
              className="panel-card-muted inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
              onClick={() => void loadDashboard()}
              type="button"
            >
              <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </button>
            <button
              className="panel-card-muted inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
              onClick={() => navigate("/painel/trafego-pago/meta")}
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          </>
        )}
        breadcrumbs={[
          { label: "Painel", to: "/painel/dashboard" },
          { label: "Tráfego pago", to: "/painel/trafego-pago/meta" },
          { label: "Meta", to: "/painel/trafego-pago/meta" },
          { label: campaign?.name || "Dashboard da campanha" },
        ]}
        description={
          campaign
            ? `${campaign.name} • ${formatDateRangeSummary(startDate, endDate)}`
            : "Leitura consolidada da campanha Meta no período selecionado."
        }
        title={campaign?.name || "Dashboard da campanha Meta"}
      />

      <section className="panel-card rounded-[1.9rem] border p-5 md:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-primary">
              Período do dashboard
            </p>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              Fonte atual: <span className="font-semibold text-on-surface">{sourceLabel}</span>
            </p>
          </div>

          <div className="flex flex-col gap-3 xl:items-end">
            <div className="panel-card-muted inline-flex flex-wrap items-center gap-1 rounded-2xl border p-1">
              {([
                { label: "Hoje", value: "today" },
                { label: "7 dias", value: "7d" },
                { label: "30 dias", value: "30d" },
                { label: "Personalizado", value: "custom" },
              ] as const).map((option) => {
                const isActive = option.value === rangePreset;

                return (
                  <button
                    className={`rounded-[1rem] px-3.5 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-primary text-white shadow-[0_12px_28px_rgba(34,98,240,0.24)]"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    key={option.value}
                    onClick={() => {
                      setRangePreset(option.value);
                      if (option.value !== "custom") {
                        const nextRange = getPresetRange(option.value);
                        setStartDate(nextRange.startDate);
                        setEndDate(nextRange.endDate);
                      }
                    }}
                    type="button"
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-semibold text-on-surface">Início</span>
                <div className="panel-input flex items-center rounded-2xl border px-4">
                  <CalendarDays className="h-4 w-4 text-on-surface-variant" />
                  <input
                    className="w-full bg-transparent px-3 py-3 text-on-surface outline-none"
                    onChange={(event) => {
                      setRangePreset("custom");
                      setStartDate(event.target.value);
                    }}
                    type="date"
                    value={startDate}
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold text-on-surface">Fim</span>
                <div className="panel-input flex items-center rounded-2xl border px-4">
                  <CalendarDays className="h-4 w-4 text-on-surface-variant" />
                  <input
                    className="w-full bg-transparent px-3 py-3 text-on-surface outline-none"
                    onChange={(event) => {
                      setRangePreset("custom");
                      setEndDate(event.target.value);
                    }}
                    type="date"
                    value={endDate}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>
      </section>

      {isLoading && !campaign && !summary ? (
        <section className="panel-card rounded-[2rem] border p-8">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
            Carregando dados da campanha e preparando o período inicial do dashboard...
          </div>
        </section>
      ) : null}

      {loadError ? (
        <section className="panel-card rounded-[1.8rem] border border-red-500/14 bg-red-500/6 px-5 py-4">
          <p className="text-sm font-semibold text-on-surface">
            O dashboard não pôde ser carregado neste momento
          </p>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{loadError}</p>
        </section>
      ) : null}

      {metricCards.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {metricCards.map((item) => (
            <PanelMetricCard
              description={item.description}
              icon={item.icon}
              key={item.label}
              label={item.label}
              value={item.value}
            />
          ))}
        </section>
      ) : null}

      <section className="grid gap-6 2xl:grid-cols-[1.35fr_0.65fr]">
        <PanelAnalyticsCard
          description="Evolução diária da campanha no período selecionado, pronta para acompanhar investimento, cliques e resultados com consistência."
          eyebrow="Timeline"
          title="Linha do tempo de performance"
        >
          <PanelLineChart
            labels={timeline?.data.map((item) => item.date) ?? []}
            range={resolveChartRange(timeline?.data.length ?? 0)}
            series={timelineSeries}
          />
        </PanelAnalyticsCard>

        <PanelAnalyticsCard
          description="Leitura resumida do avanço da campanha entre alcance, cliques, resultados e conversões."
          eyebrow="Funil"
          title="Funil consolidado"
        >
          <PanelProgressList items={funnelItems} />
        </PanelAnalyticsCard>
      </section>

      <PanelAnalyticsCard
        description="Tabela analítica por entidade trazida pelo backend para apoiar leitura rápida e comparativa da campanha."
        eyebrow="Detalhamento"
        title="Tabela de desempenho"
      >
        {tableData?.data.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-outline-variant/10 text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold">Entidade</th>
                  <th className="px-4 py-3 font-semibold">Nível</th>
                  <th className="px-4 py-3 font-semibold">Investimento</th>
                  <th className="px-4 py-3 font-semibold">Impressões</th>
                  <th className="px-4 py-3 font-semibold">Cliques</th>
                  <th className="px-4 py-3 font-semibold">Resultados</th>
                  <th className="px-4 py-3 font-semibold">Custo/resultado</th>
                </tr>
              </thead>
              <tbody>
                {tableData.data.map((row) => (
                  <tr
                    className="border-b border-outline-variant/8 text-on-surface transition-colors hover:bg-surface-container-low/55 last:border-b-0"
                    key={`${row.entityLevel}-${row.entityId}`}
                  >
                    <td className="min-w-[18rem] px-4 py-4">
                      <p className="font-semibold">{row.name}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">{row.entityId}</p>
                    </td>
                    <td className="px-4 py-4 text-on-surface-variant">{row.entityLevel}</td>
                    <td className="px-4 py-4">{formatNumber(row.investment, 2)}</td>
                    <td className="px-4 py-4">{formatNumber(row.impressions)}</td>
                    <td className="px-4 py-4">{formatNumber(row.clicks)}</td>
                    <td className="px-4 py-4">{formatNumber(row.resultsCount)}</td>
                    <td className="px-4 py-4">{formatNumber(row.costPerResult, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-outline-variant/20 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-on-surface">Nenhuma linha analítica disponível</p>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              Assim que o backend retornar dados para a campanha e o período selecionado, a
              tabela será preenchida automaticamente.
            </p>
          </div>
        )}
      </PanelAnalyticsCard>
    </div>
  );
}
