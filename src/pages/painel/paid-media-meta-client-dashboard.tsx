import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Eye,
  FileDown,
  LoaderCircle,
  Megaphone,
  MousePointerClick,
  RefreshCcw,
  SearchCheck,
  ShieldCheck,
  Target,
  UsersRound,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { PanelAnalyticsCard } from "../../components/painel/PanelAnalyticsCard";
import {
  PanelMetaFilterMultiSelect,
  type PanelMetaFilterOption,
} from "../../components/painel/PanelMetaFilterMultiSelect";
import { PanelMetaDashboardTable } from "../../components/painel/PanelMetaDashboardTable";
import {
  PanelMetaObjectiveFunnel,
  type PanelMetaObjectiveFunnelKpi,
  type PanelMetaObjectiveFunnelMetric,
  type PanelMetaObjectiveFunnelStage,
} from "../../components/painel/PanelMetaObjectiveFunnel";
import { PanelLineChart } from "../../components/painel/PanelLineChart";
import { PanelMetricCard } from "../../components/painel/PanelMetricCard";
import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { Seo } from "../../components/shared/Seo";
import { AppInput } from "../../components/shared/ui/AppInput";
import {
  getPanelMetaStatusBadgeClassName,
  getPanelMetaStatusDescription,
  getPanelMetaStatusLabel,
  panelMetaStatusNeedsReconnect,
} from "../../config/painel/meta-status";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import { useToast } from "../../context/shared/ToastContext";
import { useDebouncedValue } from "../../hooks/painel/useDebouncedValue";
import {
  getPanelMetaConnectionStatus,
  listPanelMetaAdAccounts,
  type PanelMetaAdAccountRecord,
  type PanelMetaConnectionStatusRecord,
} from "../../services/painel/meta-api";
import {
  getPanelMetaDashboardFunnel,
  getPanelMetaDashboardSummary,
  getPanelMetaDashboardTable,
  getPanelMetaDashboardTimeline,
  listPanelMetaFilterAds,
  listPanelMetaFilterAdsets,
  listPanelMetaFilterCampaigns,
  type PanelMetaDashboardFunnelRecord,
  type PanelMetaDashboardQuery,
  type PanelMetaDashboardSummaryRecord,
  type PanelMetaDashboardTableLevel,
  type PanelMetaDashboardTableRecord,
  type PanelMetaDashboardTimelineRecord,
  type PanelMetaFiltersAdRecord,
  type PanelMetaFiltersAdsetRecord,
  type PanelMetaFiltersCampaignRecord,
} from "../../services/painel/meta-dashboard-api";

type DashboardPeriodPreset = "30d" | "7d" | "custom" | "today";

type DashboardRequestSnapshot = PanelMetaDashboardQuery & {
  adAccountId: string;
  level: PanelMetaDashboardTableLevel;
};

type MetaCampaignObjectiveCategory =
  | "app_promotion"
  | "awareness"
  | "engagement"
  | "leads"
  | "mixed"
  | "overview"
  | "sales"
  | "traffic"
  | "unknown";

type MetaObjectiveContext = {
  category: MetaCampaignObjectiveCategory;
  label: string;
  note: string | null;
};

type ObjectiveAwareFunnelMetricKey = "clicks" | "conversions" | "impressions" | "reach" | "resultsCount";

type ObjectiveAwareFunnelStageTemplate = {
  helper: string;
  label: string;
  metricKey: ObjectiveAwareFunnelMetricKey;
};

type ObjectiveAwareFunnelModel = {
  badge: string;
  description: string;
  kpis: PanelMetaObjectiveFunnelKpi[];
  metrics: PanelMetaObjectiveFunnelMetric[];
  note: string | null;
  stages: PanelMetaObjectiveFunnelStage[];
  title: string;
};

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

  if (preset === "7d") {
    startDate.setDate(startDate.getDate() - 6);
  } else {
    startDate.setDate(startDate.getDate() - 29);
  }

  return {
    endDate: toDateInputValue(endDate),
    startDate: toDateInputValue(startDate),
  };
}

function resolvePresetFromDates(startDate: string, endDate: string): DashboardPeriodPreset {
  if (!startDate || !endDate) {
    return "custom";
  }

  const comparablePresets: Array<Exclude<DashboardPeriodPreset, "custom">> = ["today", "7d", "30d"];

  for (const preset of comparablePresets) {
    const range = getPresetRange(preset);

    if (range.startDate === startDate && range.endDate === endDate) {
      return preset;
    }
  }

  return "custom";
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

function calculatePercent(numerator: number, denominator: number) {
  return denominator > 0 ? (numerator / denominator) * 100 : 0;
}

function calculateFrequency(impressions: number, reach: number) {
  return reach > 0 ? impressions / reach : 0;
}

function normalizeObjectiveValue(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();
}

function humanizeObjectiveValue(value: string | null | undefined) {
  const cleaned = (value ?? "")
    .trim()
    .replace(/^OUTCOME[_\s-]+/i, "")
    .replace(/^OBJETIVO[_\s-]+/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "Objetivo não identificado";
  }

  return cleaned
    .toLowerCase()
    .split(" ")
    .map((part) => (part ? `${part[0]!.toUpperCase()}${part.slice(1)}` : ""))
    .join(" ");
}

function resolveMetaObjectiveCategory(value: string | null | undefined): MetaCampaignObjectiveCategory {
  const normalized = normalizeObjectiveValue(value);

  if (!normalized) {
    return "unknown";
  }

  if (normalized.includes("APP") || normalized.includes("INSTALL")) {
    return "app_promotion";
  }

  if (
    normalized.includes("LEAD") ||
    normalized.includes("CADAST") ||
    normalized.includes("FORM") ||
    normalized.includes("CONTATO")
  ) {
    return "leads";
  }

  if (
    normalized.includes("SALE") ||
    normalized.includes("VENDA") ||
    normalized.includes("PURCHASE") ||
    normalized.includes("COMPRA") ||
    normalized.includes("CATALOG")
  ) {
    return "sales";
  }

  if (
    normalized.includes("TRAFFIC") ||
    normalized.includes("TRAFEGO") ||
    normalized.includes("LANDING") ||
    normalized.includes("VISIT")
  ) {
    return "traffic";
  }

  if (
    normalized.includes("ENGAGEMENT") ||
    normalized.includes("ENGAJ") ||
    normalized.includes("MESSAGE") ||
    normalized.includes("VIDEO") ||
    normalized.includes("INTERACTION")
  ) {
    return "engagement";
  }

  if (
    normalized.includes("AWARENESS") ||
    normalized.includes("REACH") ||
    normalized.includes("ALCANCE") ||
    normalized.includes("RECONHEC") ||
    normalized.includes("BRAND")
  ) {
    return "awareness";
  }

  if (normalized.includes("CONVERSION")) {
    return "sales";
  }

  return "unknown";
}

function getMetaObjectiveLabel(category: MetaCampaignObjectiveCategory) {
  switch (category) {
    case "app_promotion":
      return "Promoção de app";
    case "awareness":
      return "Reconhecimento";
    case "engagement":
      return "Engajamento";
    case "leads":
      return "Leads";
    case "mixed":
      return "Múltiplos objetivos";
    case "overview":
      return "Visão consolidada";
    case "sales":
      return "Vendas";
    case "traffic":
      return "Tráfego";
    default:
      return "Objetivo não mapeado";
  }
}

const OBJECTIVE_FUNNEL_STAGE_COLORS = [
  "linear-gradient(135deg, rgba(56, 189, 248, 0.96) 0%, rgba(37, 99, 235, 0.92) 100%)",
  "linear-gradient(135deg, rgba(96, 165, 250, 0.96) 0%, rgba(59, 130, 246, 0.92) 100%)",
  "linear-gradient(135deg, rgba(129, 140, 248, 0.96) 0%, rgba(79, 70, 229, 0.92) 100%)",
  "linear-gradient(135deg, rgba(45, 212, 191, 0.94) 0%, rgba(14, 116, 144, 0.92) 100%)",
];

function getObjectiveMetricValue(
  metricKey: ObjectiveAwareFunnelMetricKey,
  summary: PanelMetaDashboardSummaryRecord | null,
  funnel: PanelMetaDashboardFunnelRecord | null,
) {
  switch (metricKey) {
    case "clicks":
      return funnel?.clicks ?? summary?.clicks ?? 0;
    case "conversions":
      return funnel?.conversions ?? 0;
    case "impressions":
      return summary?.impressions ?? 0;
    case "reach":
      return summary?.reach ?? funnel?.reach ?? 0;
    case "resultsCount":
      return funnel?.resultsCount ?? summary?.resultsCount ?? 0;
    default:
      return 0;
  }
}

function createObjectiveFunnelStages(
  templates: ObjectiveAwareFunnelStageTemplate[],
  summary: PanelMetaDashboardSummaryRecord | null,
  funnel: PanelMetaDashboardFunnelRecord | null,
) {
  return templates.map((template, index) => {
    const rawValue = getObjectiveMetricValue(template.metricKey, summary, funnel);

    return {
      color: OBJECTIVE_FUNNEL_STAGE_COLORS[index % OBJECTIVE_FUNNEL_STAGE_COLORS.length]!,
      helper: template.helper,
      label: template.label,
      rawValue,
      value: formatNumber(rawValue),
    } satisfies PanelMetaObjectiveFunnelStage;
  });
}

function buildObjectiveAwareFunnel({
  funnel,
  objectiveContext,
  summary,
}: {
  funnel: PanelMetaDashboardFunnelRecord | null;
  objectiveContext: MetaObjectiveContext;
  summary: PanelMetaDashboardSummaryRecord | null;
}): ObjectiveAwareFunnelModel {
  const impressions = summary?.impressions ?? 0;
  const reach = summary?.reach ?? funnel?.reach ?? 0;
  const clicks = funnel?.clicks ?? summary?.clicks ?? 0;
  const resultsCount = funnel?.resultsCount ?? summary?.resultsCount ?? 0;
  const conversions = funnel?.conversions ?? 0;
  const frequency = calculateFrequency(impressions, reach);
  const spend = summary?.spend ?? 0;
  const cpc = summary?.cpc ?? 0;
  const cpm = summary?.cpm ?? 0;
  const costPerResult = summary?.costPerResult ?? 0;
  const ctr = summary?.ctr ?? 0;

  switch (objectiveContext.category) {
    case "awareness":
      return {
        badge: objectiveContext.label,
        description:
          "Leitura do volume de entrega até os sinais gerados pelas campanhas de reconhecimento.",
        kpis: [
          { label: "Alcance", value: formatNumber(reach) },
          { label: "Frequência", value: formatNumber(frequency, 2) },
          { label: "CPM", value: formatCurrency(cpm) },
          { label: "Investimento", value: formatCurrency(spend) },
        ],
        metrics: [
          {
            helper: "Volume médio de impressões por pessoa alcançada.",
            label: "Frequência média",
            value: formatNumber(frequency, 2),
          },
          {
            helper: "Percentual de cliques sobre o total de impressões exibidas.",
            label: "CTR médio",
            value: formatPercent(ctr),
          },
          {
            helper: "Quanto do alcance virou resposta ativa ao anúncio.",
            label: "Alcance -> clique",
            value: formatPercent(calculatePercent(clicks, reach)),
          },
        ],
        note: objectiveContext.note,
        stages: createObjectiveFunnelStages(
          [
            {
              helper: "Volume total de exibições dos anúncios no período filtrado.",
              label: "Impressões",
              metricKey: "impressions",
            },
            {
              helper: "Pessoas únicas impactadas pelo investimento de mídia.",
              label: "Alcance",
              metricKey: "reach",
            },
            {
              helper: "Respostas ativas geradas depois da entrega do anúncio.",
              label: "Cliques",
              metricKey: "clicks",
            },
            {
              helper: "Resultado principal reportado pela Meta para awareness.",
              label: "Resultado de awareness",
              metricKey: "resultsCount",
            },
          ],
          summary,
          funnel,
        ),
        title: "Funil de reconhecimento",
      };
    case "engagement":
      return {
        badge: objectiveContext.label,
        description:
          "Leitura da entrega até os engajamentos e respostas geradas pelas campanhas sociais.",
        kpis: [
          { label: "Engajamentos", value: formatNumber(resultsCount) },
          { label: "Custo/resultado", value: formatCurrency(costPerResult) },
          { label: "Frequência", value: formatNumber(frequency, 2) },
          { label: "Investimento", value: formatCurrency(spend) },
        ],
        metrics: [
          {
            helper: "Percentual de cliques sobre o total de impressões exibidas.",
            label: "CTR médio",
            value: formatPercent(ctr),
          },
          {
            helper: "Quanto dos cliques virou engajamento principal da campanha.",
            label: "Clique -> engajamento",
            value: formatPercent(calculatePercent(resultsCount, clicks)),
          },
          {
            helper: "Evolução do engajamento até uma conversão assistida.",
            label: "Engajamento -> conversão",
            value: formatPercent(calculatePercent(conversions, resultsCount)),
          },
        ],
        note: objectiveContext.note,
        stages: createObjectiveFunnelStages(
          [
            {
              helper: "Volume total de exibições que alimentou o engajamento.",
              label: "Impressões",
              metricKey: "impressions",
            },
            {
              helper: "Cliques e interações que saíram da etapa de entrega.",
              label: "Cliques",
              metricKey: "clicks",
            },
            {
              helper: "Resultado principal otimizado para engajamento.",
              label: "Engajamentos",
              metricKey: "resultsCount",
            },
            {
              helper: "Conversões assistidas depois do engajamento inicial.",
              label: "Conversões assistidas",
              metricKey: "conversions",
            },
          ],
          summary,
          funnel,
        ),
        title: "Funil de engajamento",
      };
    case "leads":
      return {
        badge: objectiveContext.label,
        description:
          "Leitura das etapas de entrega até a geração e qualificação dos leads da campanha.",
        kpis: [
          { label: "Leads", value: formatNumber(resultsCount) },
          { label: "Custo por lead", value: formatCurrency(costPerResult) },
          { label: "Frequência", value: formatNumber(frequency, 2) },
          { label: "Investimento", value: formatCurrency(spend) },
        ],
        metrics: [
          {
            helper: "Percentual de cliques sobre o total de impressões exibidas.",
            label: "CTR médio",
            value: formatPercent(ctr),
          },
          {
            helper: "Quanto dos cliques virou lead registrado pela Meta.",
            label: "Clique -> lead",
            value: formatPercent(calculatePercent(resultsCount, clicks)),
          },
          {
            helper: "Taxa de qualificação dos leads até a conversão final.",
            label: "Lead -> conversão",
            value: formatPercent(calculatePercent(conversions, resultsCount)),
          },
        ],
        note: objectiveContext.note,
        stages: createObjectiveFunnelStages(
          [
            {
              helper: "Entrega total dos anúncios para abrir o topo do funil.",
              label: "Impressões",
              metricKey: "impressions",
            },
            {
              helper: "Cliques que avançaram para o ambiente de captura.",
              label: "Cliques",
              metricKey: "clicks",
            },
            {
              helper: "Leads gerados no evento principal da campanha.",
              label: "Leads gerados",
              metricKey: "resultsCount",
            },
            {
              helper: "Leads que avançaram para uma conversão qualificada.",
              label: "Conversões qualificadas",
              metricKey: "conversions",
            },
          ],
          summary,
          funnel,
        ),
        title: "Funil de leads",
      };
    case "sales":
      return {
        badge: objectiveContext.label,
        description:
          "Acompanha a entrega, a resposta do clique e a evolução até as conversões comerciais.",
        kpis: [
          { label: "Resultados", value: formatNumber(resultsCount) },
          { label: "Custo/resultado", value: formatCurrency(costPerResult) },
          { label: "Frequência", value: formatNumber(frequency, 2) },
          { label: "Investimento", value: formatCurrency(spend) },
        ],
        metrics: [
          {
            helper: "Percentual de cliques sobre o total de impressões exibidas.",
            label: "CTR médio",
            value: formatPercent(ctr),
          },
          {
            helper: "Quanto dos cliques virou o resultado principal de venda.",
            label: "Clique -> resultado",
            value: formatPercent(calculatePercent(resultsCount, clicks)),
          },
          {
            helper: "Evolução dos resultados até a conversão final do funil.",
            label: "Resultado -> conversão",
            value: formatPercent(calculatePercent(conversions, resultsCount)),
          },
        ],
        note: objectiveContext.note,
        stages: createObjectiveFunnelStages(
          [
            {
              helper: "Volume total de entregas que abasteceu o funil de vendas.",
              label: "Impressões",
              metricKey: "impressions",
            },
            {
              helper: "Cliques que sinalizaram intenção comercial inicial.",
              label: "Cliques",
              metricKey: "clicks",
            },
            {
              helper: "Resultado principal otimizado para venda pela campanha.",
              label: "Resultados de venda",
              metricKey: "resultsCount",
            },
            {
              helper: "Conversões comerciais consolidadas no período filtrado.",
              label: "Conversões",
              metricKey: "conversions",
            },
          ],
          summary,
          funnel,
        ),
        title: "Funil de vendas",
      };
    case "traffic":
      return {
        badge: objectiveContext.label,
        description:
          "Leitura da entrega até as conversões geradas pelas campanhas orientadas a tráfego.",
        kpis: [
          { label: "Cliques", value: formatNumber(clicks) },
          { label: "Frequência", value: formatNumber(frequency, 2) },
          { label: "CPC", value: formatCurrency(cpc) },
          { label: "CPM", value: formatCurrency(cpm) },
        ],
        metrics: [
          {
            helper: "Percentual de cliques sobre o total de impressões exibidas.",
            label: "CTR médio",
            value: formatPercent(ctr),
          },
          {
            helper: "Quanto dos cliques virou o resultado principal de tráfego.",
            label: "Clique -> resultado",
            value: formatPercent(calculatePercent(resultsCount, clicks)),
          },
          {
            helper: "Quanto dos resultados continuou avançando até a conversão final.",
            label: "Resultado -> conversão",
            value: formatPercent(calculatePercent(conversions, resultsCount)),
          },
        ],
        note: objectiveContext.note,
        stages: createObjectiveFunnelStages(
          [
            {
              helper: "Volume total de entregas que abasteceu o tráfego da campanha.",
              label: "Impressões",
              metricKey: "impressions",
            },
            {
              helper: "Cliques que saíram da entrega para a etapa seguinte.",
              label: "Cliques",
              metricKey: "clicks",
            },
            {
              helper: "Resultado principal de tráfego retornado pela Meta.",
              label: "Resultados de tráfego",
              metricKey: "resultsCount",
            },
            {
              helper: "Conversões observadas depois do avanço no funil.",
              label: "Conversões",
              metricKey: "conversions",
            },
          ],
          summary,
          funnel,
        ),
        title: "Funil de tráfego",
      };
    case "app_promotion":
      return {
        badge: objectiveContext.label,
        description:
          "Leitura do impacto da campanha até os resultados e conversões pós-instalação.",
        kpis: [
          { label: "Resultados", value: formatNumber(resultsCount) },
          { label: "Custo/resultado", value: formatCurrency(costPerResult) },
          { label: "Frequência", value: formatNumber(frequency, 2) },
          { label: "Investimento", value: formatCurrency(spend) },
        ],
        metrics: [
          {
            helper: "Percentual de cliques sobre o total de impressões exibidas.",
            label: "CTR médio",
            value: formatPercent(ctr),
          },
          {
            helper: "Quanto dos cliques virou instalação ou resultado principal.",
            label: "Clique -> resultado",
            value: formatPercent(calculatePercent(resultsCount, clicks)),
          },
          {
            helper: "Avanço dos resultados até uma conversão pós-instalação.",
            label: "Resultado -> conversão",
            value: formatPercent(calculatePercent(conversions, resultsCount)),
          },
        ],
        note: objectiveContext.note,
        stages: createObjectiveFunnelStages(
          [
            {
              helper: "Volume de entregas que iniciou a jornada de instalação.",
              label: "Impressões",
              metricKey: "impressions",
            },
            {
              helper: "Cliques que levaram a uma intenção de instalar ou abrir o app.",
              label: "Cliques",
              metricKey: "clicks",
            },
            {
              helper: "Resultado principal de promoção de app reportado pela Meta.",
              label: "Resultados de app",
              metricKey: "resultsCount",
            },
            {
              helper: "Conversões posteriores à instalação ou ao clique inicial.",
              label: "Conversões pós-instalação",
              metricKey: "conversions",
            },
          ],
          summary,
          funnel,
        ),
        title: "Funil de promoção de app",
      };
    case "mixed":
      return {
        badge: objectiveContext.label,
        description:
          "Visão consolidada com nomenclaturas neutras para acomodar campanhas com objetivos diferentes.",
        kpis: [
          { label: "Custo/resultado", value: formatCurrency(costPerResult) },
          { label: "CPC", value: formatCurrency(cpc) },
          { label: "CPM", value: formatCurrency(cpm) },
          { label: "Investimento", value: formatCurrency(spend) },
        ],
        metrics: [
          {
            helper: "Volume médio de impressões por pessoa alcançada.",
            label: "Frequência média",
            value: formatNumber(frequency, 2),
          },
          {
            helper: "Percentual de cliques sobre o total de impressões exibidas.",
            label: "CTR médio",
            value: formatPercent(ctr),
          },
          {
            helper: "Quanto dos cliques virou o resultado principal retornado pela Meta.",
            label: "Clique -> resultado",
            value: formatPercent(calculatePercent(resultsCount, clicks)),
          },
        ],
        note: objectiveContext.note,
        stages: createObjectiveFunnelStages(
          [
            {
              helper: "Volume total de entregas do recorte filtrado.",
              label: "Impressões",
              metricKey: "impressions",
            },
            {
              helper: "Pessoas únicas impactadas pela operação no período.",
              label: "Alcance",
              metricKey: "reach",
            },
            {
              helper: "Cliques e interações diretas geradas pelos anúncios.",
              label: "Cliques",
              metricKey: "clicks",
            },
            {
              helper: "Resultado principal consolidado pela Meta para o recorte.",
              label: "Resultados",
              metricKey: "resultsCount",
            },
          ],
          summary,
          funnel,
        ),
        title: "Funil Meta multiobjetivo",
      };
    case "overview":
    case "unknown":
    default:
      return {
        badge: objectiveContext.label,
        description:
          "Visão geral do recorte atual com etapas neutras para preservar a leitura consolidada do dashboard.",
        kpis: [
          { label: "Custo/resultado", value: formatCurrency(costPerResult) },
          { label: "CPC", value: formatCurrency(cpc) },
          { label: "CPM", value: formatCurrency(cpm) },
          { label: "Investimento", value: formatCurrency(spend) },
        ],
        metrics: [
          {
            helper: "Volume médio de impressões por pessoa alcançada.",
            label: "Frequência média",
            value: formatNumber(frequency, 2),
          },
          {
            helper: "Percentual de cliques sobre o total de impressões exibidas.",
            label: "CTR médio",
            value: formatPercent(ctr),
          },
          {
            helper: "Quanto dos cliques virou o resultado principal retornado pela Meta.",
            label: "Clique -> resultado",
            value: formatPercent(calculatePercent(resultsCount, clicks)),
          },
        ],
        note: objectiveContext.note,
        stages: createObjectiveFunnelStages(
          [
            {
              helper: "Volume total de entregas do recorte filtrado.",
              label: "Impressões",
              metricKey: "impressions",
            },
            {
              helper: "Pessoas únicas impactadas pela operação no período.",
              label: "Alcance",
              metricKey: "reach",
            },
            {
              helper: "Cliques e interações diretas geradas pelos anúncios.",
              label: "Cliques",
              metricKey: "clicks",
            },
            {
              helper: "Resultado principal consolidado pela Meta para o recorte.",
              label: "Resultados",
              metricKey: "resultsCount",
            },
          ],
          summary,
          funnel,
        ),
        title: "Funil Meta consolidado",
      };
  }
}

function resolveObjectiveContext({
  adOptions,
  adsetOptions,
  campaignOptions,
  selectedAdIds,
  selectedAdsetIds,
  selectedCampaignIds,
}: {
  adOptions: PanelMetaFiltersAdRecord[];
  adsetOptions: PanelMetaFiltersAdsetRecord[];
  campaignOptions: PanelMetaFiltersCampaignRecord[];
  selectedAdIds: string[];
  selectedAdsetIds: string[];
  selectedCampaignIds: string[];
}): MetaObjectiveContext {
  const rawObjectives = new Set<string>();
  const campaignById = new Map(campaignOptions.map((item) => [item.id, item] as const));
  const campaignByMetaId = new Map(campaignOptions.map((item) => [item.metaCampaignId, item] as const));
  const adsetById = new Map(adsetOptions.map((item) => [item.id, item] as const));
  const adById = new Map(adOptions.map((item) => [item.id, item] as const));

  const collectObjective = (objective: string | null | undefined) => {
    const normalizedObjective = objective?.trim();

    if (normalizedObjective) {
      rawObjectives.add(normalizedObjective);
    }
  };

  selectedCampaignIds.forEach((id) => {
    collectObjective(campaignById.get(id)?.objective);
  });

  selectedAdsetIds.forEach((id) => {
    const metaCampaignId = adsetById.get(id)?.metaCampaignId;

    if (metaCampaignId) {
      collectObjective(campaignByMetaId.get(metaCampaignId)?.objective);
    }
  });

  selectedAdIds.forEach((id) => {
    const metaCampaignId = adById.get(id)?.metaCampaignId;

    if (metaCampaignId) {
      collectObjective(campaignByMetaId.get(metaCampaignId)?.objective);
    }
  });

  const normalizedObjectives = Array.from(
    new Set(
      Array.from(rawObjectives)
        .map((objective) => resolveMetaObjectiveCategory(objective))
        .filter((objective): objective is MetaCampaignObjectiveCategory => objective !== "unknown"),
    ),
  );

  if (normalizedObjectives.length === 1) {
    const category = normalizedObjectives[0]!;

    return {
      category,
      label: getMetaObjectiveLabel(category),
      note: null,
    };
  }

  if (normalizedObjectives.length > 1) {
    return {
      category: "mixed",
      label: getMetaObjectiveLabel("mixed"),
      note:
        "Os filtros atuais misturam campanhas com objetivos diferentes. O funil usa uma leitura neutra para evitar interpretações erradas.",
    };
  }

  const hasEntityFilters =
    selectedCampaignIds.length > 0 || selectedAdsetIds.length > 0 || selectedAdIds.length > 0;

  if (!hasEntityFilters) {
    const accountObjectives = Array.from(
      new Set(
        campaignOptions
          .map((item) => resolveMetaObjectiveCategory(item.objective))
          .filter((objective): objective is MetaCampaignObjectiveCategory => objective !== "unknown"),
      ),
    );

    if (accountObjectives.length === 1) {
      const category = accountObjectives[0]!;

      return {
        category,
        label: getMetaObjectiveLabel(category),
        note: null,
      };
    }

    return {
      category: "overview",
      label: getMetaObjectiveLabel("overview"),
      note:
        "Selecione uma campanha específica para renomear as etapas de acordo com o objetivo principal dela.",
    };
  }

  if (rawObjectives.size === 1) {
    const [singleObjective] = Array.from(rawObjectives);

    return {
      category: "unknown",
      label: humanizeObjectiveValue(singleObjective),
      note:
        "O objetivo selecionado ainda não está mapeado na interface, então o funil foi mantido com nomenclaturas genéricas.",
    };
  }

  return {
    category: "unknown",
    label: getMetaObjectiveLabel("unknown"),
    note:
      "Não foi possível identificar um objetivo único para os filtros atuais, então o funil foi mantido em modo genérico.",
  };
}

function formatCompactDate(value: string | null) {
  if (!value) {
    return "Não disponível";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Não disponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

function formatCompactTime(value: string | null) {
  if (!value) {
    return "Não disponível";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Não disponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Não disponível";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Não disponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

function formatDashboardPeriodLabel(startDate: string, endDate: string) {
  const parsedStartDate = startDate ? new Date(startDate) : null;
  const parsedEndDate = endDate ? new Date(endDate) : null;
  const hasStartDate = Boolean(parsedStartDate && !Number.isNaN(parsedStartDate.getTime()));
  const hasEndDate = Boolean(parsedEndDate && !Number.isNaN(parsedEndDate.getTime()));

  if (hasStartDate && hasEndDate && parsedStartDate && parsedEndDate) {
    const shortFormatter = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
    });
    const yearFormatter = new Intl.DateTimeFormat("pt-BR", {
      year: "numeric",
    });
    const sameYear = parsedStartDate.getFullYear() === parsedEndDate.getFullYear();

    if (sameYear) {
      return `${shortFormatter.format(parsedStartDate)} - ${shortFormatter.format(parsedEndDate)} ${yearFormatter.format(parsedEndDate)}`;
    }

    return `${shortFormatter.format(parsedStartDate)} ${yearFormatter.format(parsedStartDate)} - ${shortFormatter.format(parsedEndDate)} ${yearFormatter.format(parsedEndDate)}`;
  }

  if (hasStartDate) {
    return `A partir de ${formatCompactDate(startDate)}`;
  }

  if (hasEndDate) {
    return `Até ${formatCompactDate(endDate)}`;
  }

  return "Período não definido";
}

function formatSelectionSummary(count: number, singularLabel: string, pluralLabel: string) {
  return `${count} ${count === 1 ? singularLabel : pluralLabel}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const PDF_CHART_WIDTH = 920;
const PDF_CHART_HEIGHT = 280;
const PDF_EXPORT_FRAME_ID = "panel-meta-dashboard-pdf-export-frame";
const PDF_CHART_PADDING = {
  top: 20,
  right: 24,
  bottom: 38,
  left: 24,
};

function formatPdfTickLabel(rawDate: string, range: "12m" | "30d" | "7d") {
  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    return rawDate;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: range === "12m" ? undefined : "2-digit",
    month: range === "12m" ? "short" : "2-digit",
  }).format(date);
}

function getPdfTimelineSeriesHelper(label: string, currency: string) {
  if (label === "Investimento") {
    return `Linha azul com o valor investido no período (${currency}).`;
  }

  if (label === "Resultados") {
    return "Linha roxa com a quantidade de resultados retornada pela Meta.";
  }

  return "Série exportada com base nos filtros ativos do dashboard.";
}

function buildPdfLinePath(values: number[], maxValue: number) {
  if (values.length === 0) {
    return "";
  }

  const innerWidth = PDF_CHART_WIDTH - PDF_CHART_PADDING.left - PDF_CHART_PADDING.right;
  const innerHeight = PDF_CHART_HEIGHT - PDF_CHART_PADDING.top - PDF_CHART_PADDING.bottom;
  const safeMaxValue = Math.max(maxValue, 1);
  const denominator = Math.max(values.length - 1, 1);

  return values
    .map((value, index) => {
      const x = PDF_CHART_PADDING.left + (innerWidth * index) / denominator;
      const y = PDF_CHART_PADDING.top + innerHeight - (value / safeMaxValue) * innerHeight;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function getPdfTickIndexes(total: number) {
  if (total <= 6) {
    return Array.from({ length: total }, (_, index) => index);
  }

  return Array.from(new Set([
    0,
    Math.floor((total - 1) * 0.2),
    Math.floor((total - 1) * 0.4),
    Math.floor((total - 1) * 0.6),
    Math.floor((total - 1) * 0.8),
    total - 1,
  ])).sort((first, second) => first - second);
}

function buildPdfLineChartSvg(
  labels: string[],
  series: Array<{ color: string; label: string; values: number[] }>,
  range: "12m" | "30d" | "7d",
) {
  if (!labels.length || !series.length) {
    return `<div class="pdf-empty-state">Ainda não há pontos suficientes para exibir o gráfico.</div>`;
  }

  const allValues = series.flatMap((item) => item.values);
  const maxValue = Math.max(...allValues, 0);
  const hasData = allValues.some((value) => value > 0);

  if (!hasData) {
    return `<div class="pdf-empty-state">Nenhuma atividade registrada no período selecionado.</div>`;
  }

  const tickIndexes = getPdfTickIndexes(labels.length);
  const gridValues = Array.from({ length: 4 }, (_, index) => {
    return Math.round((maxValue / 4) * (4 - index));
  });

  const gridLines = gridValues
    .map((value) => {
      const innerHeight = PDF_CHART_HEIGHT - PDF_CHART_PADDING.top - PDF_CHART_PADDING.bottom;
      const y = PDF_CHART_PADDING.top + innerHeight - (value / Math.max(maxValue, 1)) * innerHeight;

      return `
        <g>
          <line
            x1="${PDF_CHART_PADDING.left}"
            x2="${PDF_CHART_WIDTH - PDF_CHART_PADDING.right}"
            y1="${y}"
            y2="${y}"
            stroke="rgba(94, 104, 120, 0.16)"
            stroke-dasharray="4 8"
          />
          <text
            x="${PDF_CHART_WIDTH - PDF_CHART_PADDING.right}"
            y="${Math.max(y - 6, 12)}"
            fill="#5e6878"
            font-size="10"
            text-anchor="end"
          >
            ${value}
          </text>
        </g>
      `;
    })
    .join("");

  const seriesPaths = series
    .map((item) => {
      const path = buildPdfLinePath(item.values, maxValue);

      return `
        <path
          d="${path}"
          fill="none"
          stroke="${item.color}"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      `;
    })
    .join("");

  const seriesDots = series
    .map((item) => {
      const innerWidth = PDF_CHART_WIDTH - PDF_CHART_PADDING.left - PDF_CHART_PADDING.right;
      const innerHeight = PDF_CHART_HEIGHT - PDF_CHART_PADDING.top - PDF_CHART_PADDING.bottom;
      const safeMaxValue = Math.max(maxValue, 1);
      const denominator = Math.max(item.values.length - 1, 1);

      return item.values
        .map((value, index) => {
          const x = PDF_CHART_PADDING.left + (innerWidth * index) / denominator;
          const y = PDF_CHART_PADDING.top + innerHeight - (value / safeMaxValue) * innerHeight;

          return `
            <circle
              cx="${x}"
              cy="${y}"
              r="${index === item.values.length - 1 ? 4.5 : 3}"
              fill="${item.color}"
              stroke="#ffffff"
              stroke-width="1.5"
            />
          `;
        })
        .join("");
    })
    .join("");

  const tickLabels = tickIndexes
    .map((index) => {
      const innerWidth = PDF_CHART_WIDTH - PDF_CHART_PADDING.left - PDF_CHART_PADDING.right;
      const denominator = Math.max(labels.length - 1, 1);
      const x = PDF_CHART_PADDING.left + (innerWidth * index) / denominator;
      const textAnchor = index === 0 ? "start" : index === labels.length - 1 ? "end" : "middle";

      return `
        <text
          x="${x}"
          y="${PDF_CHART_HEIGHT - 10}"
          fill="#5e6878"
          font-size="10"
          text-anchor="${textAnchor}"
        >
          ${escapeHtml(formatPdfTickLabel(labels[index], range))}
        </text>
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${PDF_CHART_WIDTH} ${PDF_CHART_HEIGHT}" class="pdf-line-chart" role="img" aria-label="Gráfico de linha do dashboard Meta">
      ${gridLines}
      ${seriesPaths}
      ${seriesDots}
      ${tickLabels}
    </svg>
  `;
}

function buildDashboardPdfHtml({
  accountName,
  accountId,
  currentPeriodLabel,
  currency,
  filterHighlights,
  funnelDescription,
  generatedAt,
  lastValidatedAt,
  metrics,
  tableLevelLabel,
  tableRows,
  timelineLabels,
  timelineSeries,
  timezone,
  funnelItems,
  funnelTitle,
}: {
  accountName: string;
  accountId: string;
  currentPeriodLabel: string;
  currency: string;
  filterHighlights: string[];
  funnelDescription: string;
  generatedAt: string;
  lastValidatedAt: string;
  metrics: Array<{
    accent: string;
    description: string;
    label: string;
    meta?: Array<{ label: string; value: string }>;
    value: string;
  }>;
  tableLevelLabel: string;
  tableRows: Array<{
    clicks: string;
    costPerResult: string;
    cpc: string;
    cpm: string;
    ctr: string;
    id: string;
    impressions: string;
    name: string;
    resultsCount: string;
    spend: string;
  }>;
  timelineLabels: string[];
  timelineSeries: Array<{ color: string; label: string; values: number[] }>;
  timezone: string;
  funnelItems: PanelMetaObjectiveFunnelStage[];
  funnelTitle: string;
}) {
  const chartRange = resolveChartRange(timelineLabels.length);
  const chartSvg = buildPdfLineChartSvg(timelineLabels, timelineSeries, chartRange);
  const funnelMaxValue = Math.max(...funnelItems.map((item) => item.rawValue), 1);
  const hasTableRows = tableRows.length > 0;

  return `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(`Dashboard Meta • ${accountName}`)}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 14mm;
          }

          :root {
            color-scheme: light;
          }

          * {
            box-sizing: border-box;
          }

          html {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body {
            margin: 0;
            font-family: Inter, ui-sans-serif, system-ui, sans-serif;
            background: #f4f7fb;
            color: #141821;
          }

          .pdf-report {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .pdf-section {
            background: rgba(255, 255, 255, 0.96);
            border: 1px solid #d7dfeb;
            border-radius: 24px;
            padding: 20px 22px;
            box-shadow: 0 18px 42px rgba(15, 23, 42, 0.06);
          }

          .pdf-hero {
            position: relative;
            overflow: hidden;
            background:
              linear-gradient(145deg, rgba(255,255,255,0.98), rgba(239,244,251,0.92)),
              radial-gradient(circle at top right, rgba(34, 98, 240, 0.14), transparent 34%);
          }

          .pdf-hero::before {
            content: "";
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at top right, rgba(34, 98, 240, 0.12), transparent 32%);
            pointer-events: none;
          }

          .pdf-hero > * {
            position: relative;
            z-index: 1;
          }

          .pdf-brand {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 7px 12px;
            border-radius: 999px;
            border: 1px solid rgba(34, 98, 240, 0.14);
            background: rgba(34, 98, 240, 0.08);
            color: #2262f0;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.26em;
            text-transform: uppercase;
          }

          .pdf-title {
            margin: 14px 0 0;
            font-size: 34px;
            line-height: 1.05;
            font-weight: 900;
            letter-spacing: -0.04em;
          }

          .pdf-description {
            margin: 12px 0 0;
            max-width: 920px;
            color: #5e6878;
            font-size: 13px;
            line-height: 1.6;
          }

          .pdf-meta-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
            margin-top: 18px;
          }

          .pdf-meta-card {
            border: 1px solid #d7dfeb;
            border-radius: 18px;
            background: rgba(244, 247, 251, 0.88);
            padding: 14px 16px;
          }

          .pdf-eyebrow {
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: #5e6878;
          }

          .pdf-meta-value {
            margin-top: 8px;
            font-size: 14px;
            line-height: 1.5;
            font-weight: 700;
            color: #141821;
            word-break: break-word;
          }

          .pdf-chip-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 16px;
          }

          .pdf-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 12px;
            border-radius: 999px;
            border: 1px solid #d7dfeb;
            background: #ffffff;
            color: #141821;
            font-size: 11px;
            font-weight: 700;
          }

          .pdf-metric-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
          }

          .pdf-metric-card {
            border: 1px solid #d7dfeb;
            border-radius: 20px;
            background: #ffffff;
            padding: 16px 18px;
            break-inside: avoid;
          }

          .pdf-metric-card::before {
            content: "";
            display: block;
            width: 100%;
            height: 4px;
            border-radius: 999px;
            background: var(--accent-color, #2262f0);
            margin-bottom: 14px;
          }

          .pdf-metric-label {
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.24em;
            text-transform: uppercase;
            color: #5e6878;
          }

          .pdf-metric-value {
            margin-top: 10px;
            font-size: 28px;
            line-height: 1.05;
            font-weight: 900;
            letter-spacing: -0.04em;
            color: #141821;
          }

          .pdf-metric-description {
            margin-top: 10px;
            color: #5e6878;
            font-size: 12px;
            line-height: 1.5;
          }

          .pdf-metric-meta {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
            margin-top: 14px;
            padding-top: 12px;
            border-top: 1px solid #e4eaf3;
          }

          .pdf-analytics-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
            gap: 16px;
          }

          .pdf-legend {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 14px;
          }

          .pdf-legend-item {
            display: inline-flex;
            align-items: flex-start;
            gap: 10px;
            min-width: 0;
            padding: 10px 12px;
            border: 1px solid #d7dfeb;
            border-radius: 16px;
            background: #ffffff;
          }

          .pdf-legend-swatch {
            flex: none;
            display: block;
            width: 34px;
            height: 12px;
            margin-top: 2px;
          }

          .pdf-legend-copy {
            display: flex;
            min-width: 0;
            flex-direction: column;
            gap: 3px;
          }

          .pdf-legend-label {
            color: #141821;
            font-size: 12px;
            font-weight: 700;
            line-height: 1.25;
          }

          .pdf-legend-helper {
            color: #5e6878;
            font-size: 11px;
            line-height: 1.4;
          }

          .pdf-chart-shell {
            margin-top: 16px;
            border: 1px solid #e4eaf3;
            border-radius: 18px;
            background: #f8fafc;
            padding: 14px;
          }

          .pdf-line-chart {
            display: block;
            width: 100%;
            height: auto;
          }

          .pdf-chart-note {
            margin: 12px 0 0;
            color: #5e6878;
            font-size: 11px;
            line-height: 1.5;
          }

          .pdf-empty-state {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 240px;
            border: 1px dashed #cbd4e1;
            border-radius: 18px;
            background: #f8fafc;
            color: #5e6878;
            font-size: 13px;
            text-align: center;
            padding: 24px;
          }

          .pdf-funnel-list {
            display: flex;
            flex-direction: column;
            gap: 14px;
            margin-top: 16px;
          }

          .pdf-funnel-item {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .pdf-funnel-row {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 12px;
          }

          .pdf-funnel-label {
            font-size: 13px;
            font-weight: 700;
            color: #141821;
          }

          .pdf-funnel-helper {
            margin-top: 3px;
            color: #5e6878;
            font-size: 11px;
            line-height: 1.4;
          }

          .pdf-funnel-value {
            font-size: 13px;
            font-weight: 800;
            color: #141821;
            white-space: nowrap;
          }

          .pdf-funnel-bar {
            height: 10px;
            border-radius: 999px;
            background: #e4eaf3;
            overflow: hidden;
          }

          .pdf-funnel-bar > span {
            display: block;
            height: 100%;
            border-radius: inherit;
          }

          .pdf-table-wrapper {
            margin-top: 16px;
            overflow: hidden;
            border-radius: 20px;
            border: 1px solid #d7dfeb;
            background: #ffffff;
          }

          .pdf-table {
            width: 100%;
            border-collapse: collapse;
          }

          .pdf-table thead {
            display: table-header-group;
          }

          .pdf-table th {
            padding: 12px 14px;
            border-bottom: 1px solid #e4eaf3;
            text-align: left;
            color: #5e6878;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            background: #f8fafc;
          }

          .pdf-table td {
            padding: 14px;
            border-bottom: 1px solid #edf2f9;
            color: #141821;
            font-size: 11px;
            vertical-align: top;
          }

          .pdf-table tbody tr:last-child td {
            border-bottom: none;
          }

          .pdf-table td.is-right,
          .pdf-table th.is-right {
            text-align: right;
          }

          .pdf-table-secondary {
            display: block;
            margin-top: 4px;
            color: #5e6878;
            font-size: 10px;
          }

          .pdf-section-title {
            margin: 4px 0 0;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.03em;
          }

          .pdf-section-description {
            margin: 8px 0 0;
            color: #5e6878;
            font-size: 12px;
            line-height: 1.55;
          }

          @media print {
            html,
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background: #ffffff;
            }

            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .pdf-section,
            .pdf-metric-card {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <main class="pdf-report">
          <section class="pdf-section pdf-hero">
            <div class="pdf-brand">GSUCHOA • Dashboard Meta</div>
            <h1 class="pdf-title">${escapeHtml(accountName)}</h1>
            <p class="pdf-description">
              Relatório exportado com o recorte atual do dashboard Meta, incluindo totais, gráfico de evolução,
              funil consolidado e tabela detalhada por ${escapeHtml(tableLevelLabel.toLowerCase())}.
            </p>

            <div class="pdf-meta-grid">
              <div class="pdf-meta-card">
                <div class="pdf-eyebrow">Ad account</div>
                <div class="pdf-meta-value">${escapeHtml(accountId)}</div>
              </div>
              <div class="pdf-meta-card">
                <div class="pdf-eyebrow">Período</div>
                <div class="pdf-meta-value">${escapeHtml(currentPeriodLabel)}</div>
              </div>
              <div class="pdf-meta-card">
                <div class="pdf-eyebrow">Última validação</div>
                <div class="pdf-meta-value">${escapeHtml(lastValidatedAt)}</div>
              </div>
              <div class="pdf-meta-card">
                <div class="pdf-eyebrow">Contexto</div>
                <div class="pdf-meta-value">${escapeHtml(`${currency} • ${timezone}`)}</div>
              </div>
            </div>

            <div class="pdf-chip-row">
              ${filterHighlights
                .map((item) => `<span class="pdf-chip">${escapeHtml(item)}</span>`)
                .join("")}
              <span class="pdf-chip">Gerado em ${escapeHtml(generatedAt)}</span>
            </div>
          </section>

          <section class="pdf-section">
            <div class="pdf-eyebrow">Totais</div>
            <h2 class="pdf-section-title">Resumo consolidado</h2>
            <p class="pdf-section-description">
              Totais do dashboard com base no período e nos filtros ativos no momento da exportação.
            </p>

            <div class="pdf-metric-grid" style="margin-top: 16px;">
              ${metrics
                .map((item) => `
                  <article class="pdf-metric-card" style="--accent-color:${item.accent}">
                    <div class="pdf-metric-label">${escapeHtml(item.label)}</div>
                    <div class="pdf-metric-value">${escapeHtml(item.value)}</div>
                    <p class="pdf-metric-description">${escapeHtml(item.description)}</p>
                    ${item.meta && item.meta.length > 0
                      ? `
                        <div class="pdf-metric-meta">
                          ${item.meta
                            .map((metaItem) => `
                              <div>
                                <div class="pdf-eyebrow">${escapeHtml(metaItem.label)}</div>
                                <div class="pdf-meta-value" style="margin-top:6px;font-size:12px;">${escapeHtml(metaItem.value)}</div>
                              </div>
                            `)
                            .join("")}
                        </div>
                      `
                      : ""}
                  </article>
                `)
                .join("")}
            </div>
          </section>

          <section class="pdf-analytics-grid">
            <section class="pdf-section">
              <div class="pdf-eyebrow">Timeline</div>
              <h2 class="pdf-section-title">Evolução do período</h2>
              <p class="pdf-section-description">
                Investimento e resultados ao longo do recorte exportado.
              </p>

              <div class="pdf-legend">
                ${timelineSeries
                  .map((item) => `
                    <div class="pdf-legend-item">
                      <svg class="pdf-legend-swatch" viewBox="0 0 34 12" aria-hidden="true">
                        <line
                          x1="2"
                          y1="6"
                          x2="32"
                          y2="6"
                          stroke="${item.color}"
                          stroke-width="2.5"
                          stroke-linecap="round"
                        />
                        <circle
                          cx="17"
                          cy="6"
                          r="3.5"
                          fill="${item.color}"
                          stroke="#ffffff"
                          stroke-width="1.2"
                        />
                      </svg>
                      <div class="pdf-legend-copy">
                        <span class="pdf-legend-label">${escapeHtml(item.label)}</span>
                        <span class="pdf-legend-helper">${escapeHtml(getPdfTimelineSeriesHelper(item.label, currency))}</span>
                      </div>
                    </div>
                  `)
                  .join("")}
              </div>

              <div class="pdf-chart-shell">
                ${chartSvg}
              </div>
              <p class="pdf-chart-note">
                Azul representa o investimento financeiro exportado. Roxo representa o volume de resultados no mesmo período.
              </p>
            </section>

            <section class="pdf-section">
              <div class="pdf-eyebrow">Funil</div>
              <h2 class="pdf-section-title">${escapeHtml(funnelTitle)}</h2>
              <p class="pdf-section-description">
                ${escapeHtml(funnelDescription)}
              </p>

              <div class="pdf-funnel-list">
                ${funnelItems
                  .map((item) => {
                    const progress = Math.min((item.rawValue / funnelMaxValue) * 100, 100);

                    return `
                      <div class="pdf-funnel-item">
                        <div class="pdf-funnel-row">
                          <div>
                            <div class="pdf-funnel-label">${escapeHtml(item.label)}</div>
                            <div class="pdf-funnel-helper">${escapeHtml(item.helper)}</div>
                          </div>
                          <div class="pdf-funnel-value">${escapeHtml(item.value)}</div>
                        </div>
                        <div class="pdf-funnel-bar">
                          <span style="width:${progress}%;background:${item.color};"></span>
                        </div>
                      </div>
                    `;
                  })
                  .join("")}
              </div>
            </section>
          </section>

          <section class="pdf-section">
            <div class="pdf-eyebrow">Tabela detalhada</div>
            <h2 class="pdf-section-title">Desempenho por ${escapeHtml(tableLevelLabel.toLowerCase())}</h2>
            <p class="pdf-section-description">
              Visão detalhada exportada no nível selecionado no dashboard no momento da geração do PDF.
            </p>

            ${hasTableRows
              ? `
                <div class="pdf-table-wrapper">
                  <table class="pdf-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>ID</th>
                        <th class="is-right">Investimento</th>
                        <th class="is-right">Resultados</th>
                        <th class="is-right">CTR</th>
                        <th class="is-right">CPC</th>
                        <th class="is-right">CPM</th>
                        <th class="is-right">Cliques</th>
                        <th class="is-right">Impressões</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${tableRows
                        .map((row) => `
                          <tr>
                            <td>${escapeHtml(row.name)}</td>
                            <td>${escapeHtml(row.id)}</td>
                            <td class="is-right">${escapeHtml(row.spend)}</td>
                            <td class="is-right">
                              ${escapeHtml(row.resultsCount)}
                              <span class="pdf-table-secondary">${escapeHtml(row.costPerResult)}</span>
                            </td>
                            <td class="is-right">${escapeHtml(row.ctr)}</td>
                            <td class="is-right">${escapeHtml(row.cpc)}</td>
                            <td class="is-right">${escapeHtml(row.cpm)}</td>
                            <td class="is-right">${escapeHtml(row.clicks)}</td>
                            <td class="is-right">${escapeHtml(row.impressions)}</td>
                          </tr>
                        `)
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
              : `<div class="pdf-empty-state" style="min-height:200px;">Nenhum dado detalhado foi encontrado para o nível atual.</div>`}
          </section>
        </main>
      </body>
    </html>
  `;
}

function buildHint(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" • ");
}

function toCampaignOptions(items: PanelMetaFiltersCampaignRecord[]): PanelMetaFilterOption[] {
  return items.map((item) => ({
    hint: buildHint([item.objective, item.effectiveStatus ?? item.status]),
    label: item.name,
    value: item.id,
  }));
}

function toAdsetOptions(items: PanelMetaFiltersAdsetRecord[]): PanelMetaFilterOption[] {
  return items.map((item) => ({
    hint: buildHint([item.effectiveStatus ?? item.status, `Campanha ${item.metaCampaignId}`]),
    label: item.name,
    value: item.id,
  }));
}

function toAdOptions(items: PanelMetaFiltersAdRecord[]): PanelMetaFilterOption[] {
  return items.map((item) => ({
    hint: buildHint([item.effectiveStatus ?? item.status, `Conjunto ${item.metaAdsetId}`]),
    label: item.name,
    value: item.id,
  }));
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

function areSameStringArrays(first: string[], second: string[]) {
  if (first.length !== second.length) {
    return false;
  }

  return first.every((value, index) => value === second[index]);
}

function MetaStatusBadge({
  status,
}: {
  status: PanelMetaConnectionStatusRecord["status"];
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPanelMetaStatusBadgeClassName(
        status,
      )}`}
    >
      {getPanelMetaStatusLabel(status)}
    </span>
  );
}

function StateCard({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="panel-card rounded-[2rem] border p-8">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-black tracking-tight text-on-surface">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{description}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </section>
  );
}

export default function PaidMediaMetaAccountDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { token } = usePanelAuth();
  const { adAccountId: routeAdAccountId = "" } = useParams<{ adAccountId: string }>();
  const adAccountId = useMemo(() => decodeURIComponent(routeAdAccountId), [routeAdAccountId]);
  const [statusRecord, setStatusRecord] = useState<PanelMetaConnectionStatusRecord | null>(null);
  const [adAccounts, setAdAccounts] = useState<PanelMetaAdAccountRecord[]>([]);
  const [campaignOptions, setCampaignOptions] = useState<PanelMetaFiltersCampaignRecord[]>([]);
  const [adsetOptions, setAdsetOptions] = useState<PanelMetaFiltersAdsetRecord[]>([]);
  const [adOptions, setAdOptions] = useState<PanelMetaFiltersAdRecord[]>([]);
  const [summary, setSummary] = useState<PanelMetaDashboardSummaryRecord | null>(null);
  const [timeline, setTimeline] = useState<PanelMetaDashboardTimelineRecord | null>(null);
  const [funnel, setFunnel] = useState<PanelMetaDashboardFunnelRecord | null>(null);
  const [tableData, setTableData] = useState<PanelMetaDashboardTableRecord | null>(null);
  const [periodPreset, setPeriodPreset] = useState<DashboardPeriodPreset>("30d");
  const [startDate, setStartDate] = useState(() => getPresetRange("30d").startDate);
  const [endDate, setEndDate] = useState(() => getPresetRange("30d").endDate);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [selectedAdsetIds, setSelectedAdsetIds] = useState<string[]>([]);
  const [selectedAdIds, setSelectedAdIds] = useState<string[]>([]);
  const [tableLevel, setTableLevel] = useState<PanelMetaDashboardTableLevel>("campaign");
  const [isHydrating, setIsHydrating] = useState(true);
  const [isCampaignsLoading, setIsCampaignsLoading] = useState(false);
  const [isAdsetsLoading, setIsAdsetsLoading] = useState(false);
  const [isAdsLoading, setIsAdsLoading] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isDashboardTransitioning, setIsDashboardTransitioning] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const campaignRequestRef = useRef(0);
  const adsetRequestRef = useRef(0);
  const adRequestRef = useRef(0);
  const dashboardRequestRef = useRef(0);
  const lastCampaignFiltersKeyRef = useRef("");
  const lastAdsetFiltersKeyRef = useRef("");
  const lastAdFiltersKeyRef = useRef("");
  const lastDashboardKeyRef = useRef("");

  const loadContext = useCallback(async () => {
    if (!token || !adAccountId) {
      return;
    }

    setIsHydrating(true);
    setLoadError(null);

    try {
      const nextStatus = await getPanelMetaConnectionStatus(token);
      setStatusRecord(nextStatus);

      if (nextStatus.status !== "CONNECTED") {
        setAdAccounts([]);
        return;
      }

      const nextAccounts = await listPanelMetaAdAccounts(token);
      setAdAccounts(nextAccounts);
    } catch (error) {
      setStatusRecord(null);
      setAdAccounts([]);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o dashboard da conta Meta agora.",
      );
    } finally {
      setIsHydrating(false);
    }
  }, [adAccountId, token]);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  useEffect(() => {
    setSelectedCampaignIds([]);
    setSelectedAdsetIds([]);
    setSelectedAdIds([]);
    setCampaignOptions([]);
    setAdsetOptions([]);
    setAdOptions([]);
    setSummary(null);
    setTimeline(null);
    setFunnel(null);
    setTableData(null);
    setDashboardError(null);
    lastCampaignFiltersKeyRef.current = "";
    lastAdsetFiltersKeyRef.current = "";
    lastAdFiltersKeyRef.current = "";
    lastDashboardKeyRef.current = "";
  }, [adAccountId]);

  const activeAccount = useMemo(
    () => adAccounts.find((item) => item.adAccountId === adAccountId) ?? null,
    [adAccountId, adAccounts],
  );

  const loadCampaignFilters = useCallback(async (force = false) => {
    if (!token || !activeAccount || statusRecord?.status !== "CONNECTED") {
      setCampaignOptions([]);
      return;
    }

    const nextKey = JSON.stringify({ adAccountId: activeAccount.adAccountId });
    if (!force && lastCampaignFiltersKeyRef.current === nextKey) {
      return;
    }

    lastCampaignFiltersKeyRef.current = nextKey;
    const requestId = campaignRequestRef.current + 1;
    campaignRequestRef.current = requestId;
    setIsCampaignsLoading(true);

    try {
      const nextOptions = await listPanelMetaFilterCampaigns(token, {
        adAccountId: activeAccount.adAccountId,
      });

      if (requestId !== campaignRequestRef.current) {
        return;
      }

      setCampaignOptions(nextOptions);
    } catch {
      if (requestId !== campaignRequestRef.current) {
        return;
      }

      setCampaignOptions([]);
    } finally {
      if (requestId === campaignRequestRef.current) {
        setIsCampaignsLoading(false);
      }
    }
  }, [activeAccount, statusRecord?.status, token]);

  useEffect(() => {
    void loadCampaignFilters();
  }, [loadCampaignFilters]);

  const loadAdsetFilters = useCallback(async (force = false) => {
    if (!token || !activeAccount || statusRecord?.status !== "CONNECTED") {
      setAdsetOptions([]);
      return;
    }

    const nextKey = JSON.stringify({
      adAccountId: activeAccount.adAccountId,
      campaignIds: selectedCampaignIds,
    });
    if (!force && lastAdsetFiltersKeyRef.current === nextKey) {
      return;
    }

    lastAdsetFiltersKeyRef.current = nextKey;
    const requestId = adsetRequestRef.current + 1;
    adsetRequestRef.current = requestId;
    setIsAdsetsLoading(true);

    try {
      const nextOptions = await listPanelMetaFilterAdsets(token, {
        adAccountId: activeAccount.adAccountId,
        campaignIds: selectedCampaignIds.length > 0 ? selectedCampaignIds : undefined,
      });

      if (requestId !== adsetRequestRef.current) {
        return;
      }

      setAdsetOptions(nextOptions);
    } catch {
      if (requestId !== adsetRequestRef.current) {
        return;
      }

      setAdsetOptions([]);
    } finally {
      if (requestId === adsetRequestRef.current) {
        setIsAdsetsLoading(false);
      }
    }
  }, [activeAccount, selectedCampaignIds, statusRecord?.status, token]);

  useEffect(() => {
    void loadAdsetFilters();
  }, [loadAdsetFilters]);

  const loadAdFilters = useCallback(async (force = false) => {
    if (!token || !activeAccount || statusRecord?.status !== "CONNECTED") {
      setAdOptions([]);
      return;
    }

    const nextKey = JSON.stringify({
      adAccountId: activeAccount.adAccountId,
      adsetIds: selectedAdsetIds,
      campaignIds: selectedCampaignIds,
    });
    if (!force && lastAdFiltersKeyRef.current === nextKey) {
      return;
    }

    lastAdFiltersKeyRef.current = nextKey;
    const requestId = adRequestRef.current + 1;
    adRequestRef.current = requestId;
    setIsAdsLoading(true);

    try {
      const nextOptions = await listPanelMetaFilterAds(token, {
        adAccountId: activeAccount.adAccountId,
        adsetIds: selectedAdsetIds.length > 0 ? selectedAdsetIds : undefined,
        campaignIds: selectedCampaignIds.length > 0 ? selectedCampaignIds : undefined,
      });

      if (requestId !== adRequestRef.current) {
        return;
      }

      setAdOptions(nextOptions);
    } catch {
      if (requestId !== adRequestRef.current) {
        return;
      }

      setAdOptions([]);
    } finally {
      if (requestId === adRequestRef.current) {
        setIsAdsLoading(false);
      }
    }
  }, [activeAccount, selectedAdsetIds, selectedCampaignIds, statusRecord?.status, token]);

  useEffect(() => {
    void loadAdFilters();
  }, [loadAdFilters]);

  useEffect(() => {
    setSelectedCampaignIds((currentValues) => {
      const nextValues = currentValues.filter((value) => campaignOptions.some((item) => item.id === value));
      return areSameStringArrays(currentValues, nextValues) ? currentValues : nextValues;
    });
  }, [campaignOptions]);

  useEffect(() => {
    setSelectedAdsetIds((currentValues) => {
      const nextValues = currentValues.filter((value) => adsetOptions.some((item) => item.id === value));
      return areSameStringArrays(currentValues, nextValues) ? currentValues : nextValues;
    });
  }, [adsetOptions]);

  useEffect(() => {
    setSelectedAdIds((currentValues) => {
      const nextValues = currentValues.filter((value) => adOptions.some((item) => item.id === value));
      return areSameStringArrays(currentValues, nextValues) ? currentValues : nextValues;
    });
  }, [adOptions]);

  const dashboardRequest = useMemo((): DashboardRequestSnapshot | null => {
    if (!activeAccount) {
      return null;
    }

    return {
      adAccountId: activeAccount.adAccountId,
      adIds: selectedAdIds.length > 0 ? selectedAdIds : undefined,
      adsetIds: selectedAdsetIds.length > 0 ? selectedAdsetIds : undefined,
      campaignIds: selectedCampaignIds.length > 0 ? selectedCampaignIds : undefined,
      endDate: endDate || undefined,
      level: tableLevel,
      startDate: startDate || undefined,
    };
  }, [activeAccount, endDate, selectedAdIds, selectedAdsetIds, selectedCampaignIds, startDate, tableLevel]);

  const dashboardRequestKey = useMemo(
    () => (dashboardRequest ? JSON.stringify(dashboardRequest) : ""),
    [dashboardRequest],
  );
  const debouncedDashboardRequestKey = useDebouncedValue(dashboardRequestKey, 350);

  useEffect(() => {
    if (!dashboardRequestKey) {
      setIsDashboardTransitioning(false);
      return;
    }

    setIsDashboardTransitioning(true);
  }, [dashboardRequestKey]);

  const loadDashboard = useCallback(async (
    requestSnapshot: DashboardRequestSnapshot | null,
    force = false,
  ) => {
    if (!token || !requestSnapshot) {
      setSummary(null);
      setTimeline(null);
      setFunnel(null);
      setTableData(null);
      setIsDashboardTransitioning(false);
      return;
    }

    const requestKey = JSON.stringify(requestSnapshot);
    if (!force && lastDashboardKeyRef.current === requestKey) {
      return;
    }

    lastDashboardKeyRef.current = requestKey;
    const requestId = dashboardRequestRef.current + 1;
    dashboardRequestRef.current = requestId;
    setIsDashboardLoading(true);
    setDashboardError(null);

    try {
      const [nextSummary, nextTimeline, nextFunnel, nextTable] = await Promise.all([
        getPanelMetaDashboardSummary(token, requestSnapshot),
        getPanelMetaDashboardTimeline(token, requestSnapshot),
        getPanelMetaDashboardFunnel(token, requestSnapshot),
        getPanelMetaDashboardTable(token, requestSnapshot),
      ]);

      if (requestId !== dashboardRequestRef.current) {
        return;
      }

      setSummary(nextSummary);
      setTimeline(nextTimeline);
      setFunnel(nextFunnel);
      setTableData(nextTable);
    } catch (error) {
      if (requestId !== dashboardRequestRef.current) {
        return;
      }

      setDashboardError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o dashboard desta conta Meta.",
      );
    } finally {
      if (requestId === dashboardRequestRef.current) {
        setIsDashboardLoading(false);
        setIsDashboardTransitioning(false);
      }
    }
  }, [token]);

  useEffect(() => {
    if (!debouncedDashboardRequestKey) {
      setSummary(null);
      setTimeline(null);
      setFunnel(null);
      setTableData(null);
      return;
    }

    const requestSnapshot = JSON.parse(debouncedDashboardRequestKey) as DashboardRequestSnapshot;
    void loadDashboard(requestSnapshot);
  }, [debouncedDashboardRequestKey, loadDashboard]);

  const handlePresetChange = useCallback((preset: DashboardPeriodPreset) => {
    if (preset === "custom") {
      setPeriodPreset("custom");
      return;
    }

    const nextRange = getPresetRange(preset);
    setPeriodPreset(preset);
    setStartDate(nextRange.startDate);
    setEndDate(nextRange.endDate);
  }, []);

  const handleStartDateChange = useCallback((value: string) => {
    setStartDate(value);
    setPeriodPreset(resolvePresetFromDates(value, endDate));
  }, [endDate]);

  const handleEndDateChange = useCallback((value: string) => {
    setEndDate(value);
    setPeriodPreset(resolvePresetFromDates(startDate, value));
  }, [startDate]);

  const handleRefresh = useCallback(() => {
    void loadContext();
    void loadCampaignFilters(true);
    void loadAdsetFilters(true);
    void loadAdFilters(true);
    void loadDashboard(dashboardRequest, true);
  }, [dashboardRequest, loadAdFilters, loadAdsetFilters, loadCampaignFilters, loadContext, loadDashboard]);

  const timelineLabels = useMemo(
    () => timeline?.data.map((item) => item.date) ?? [],
    [timeline],
  );

  const timelineSeries = useMemo(
    () => [
      {
        color: "#2563eb",
        label: "Investimento",
        valueFormatter: formatCurrency,
        values: timeline?.data.map((item) => item.spend) ?? [],
      },
      {
        color: "#7c3aed",
        label: "Resultados",
        valueFormatter: (value: number) => formatNumber(value),
        values: timeline?.data.map((item) => item.resultsCount) ?? [],
      },
    ],
    [timeline],
  );

  const summaryCards = useMemo(() => {
    return [
      {
        description: "Valor investido no período filtrado da conta Meta.",
        icon: <Wallet className="h-5 w-5" />,
        label: "Investimento",
        numberFormatter: formatCurrency,
        toneClassName: "border-primary/18 bg-primary/10 text-primary",
        valueNumber: summary?.spend ?? 0,
        valueToneClassName: "text-primary",
      },
      {
        description: "Total de pessoas alcançadas pelas campanhas selecionadas.",
        icon: <UsersRound className="h-5 w-5" />,
        label: "Alcance",
        numberFormatter: (value: number) => formatNumber(value),
        toneClassName: "border-emerald-500/16 bg-emerald-500/10 text-emerald-500",
        valueNumber: summary?.reach ?? 0,
      },
      {
        description: "Volume total de impressões registrado no período.",
        icon: <Eye className="h-5 w-5" />,
        label: "Impressões",
        numberFormatter: (value: number) => formatNumber(value),
        toneClassName: "border-sky-500/16 bg-sky-500/10 text-sky-500",
        valueNumber: summary?.impressions ?? 0,
      },
      {
        description: "Cliques capturados pelas campanhas reais da Meta.",
        icon: <MousePointerClick className="h-5 w-5" />,
        label: "Cliques",
        numberFormatter: (value: number) => formatNumber(value),
        toneClassName: "border-violet-500/16 bg-violet-500/10 text-violet-500",
        valueNumber: summary?.clicks ?? 0,
      },
      {
        description: "Taxa de cliques média considerando todo o recorte filtrado.",
        icon: <Activity className="h-5 w-5" />,
        label: "CTR",
        numberFormatter: formatPercent,
        toneClassName: "border-sky-500/16 bg-sky-500/10 text-sky-500",
        valueNumber: summary?.ctr ?? 0,
        valueToneClassName: "text-sky-500",
      },
      {
        description: "Custo médio por clique obtido com os filtros atuais.",
        icon: <SearchCheck className="h-5 w-5" />,
        label: "CPC",
        numberFormatter: formatCurrency,
        toneClassName: "border-amber-500/16 bg-amber-500/10 text-amber-500",
        valueNumber: summary?.cpc ?? 0,
        valueToneClassName: "text-amber-500",
      },
      {
        description: "Custo por mil impressões para a conta Meta em análise.",
        icon: <Megaphone className="h-5 w-5" />,
        label: "CPM",
        numberFormatter: formatCurrency,
        toneClassName: "border-rose-500/16 bg-rose-500/10 text-rose-500",
        valueNumber: summary?.cpm ?? 0,
        valueToneClassName: "text-rose-500",
      },
      {
        description: "Resultados consolidados e custo médio por resultado no período.",
        icon: <Target className="h-5 w-5" />,
        label: "Resultados",
        meta: summary
          ? [{ label: "Custo por resultado", value: formatCurrency(summary.costPerResult) }]
          : [{ label: "Custo por resultado", value: "R$ 0,00" }],
        numberFormatter: (value: number) => formatNumber(value),
        toneClassName: "border-emerald-500/16 bg-emerald-500/10 text-emerald-500",
        valueNumber: summary?.resultsCount ?? 0,
        valueToneClassName: "text-emerald-500",
      },
    ];
  }, [summary]);
  const objectiveContext = useMemo(
    () =>
      resolveObjectiveContext({
        adOptions,
        adsetOptions,
        campaignOptions,
        selectedAdIds,
        selectedAdsetIds,
        selectedCampaignIds,
      }),
    [adOptions, adsetOptions, campaignOptions, selectedAdIds, selectedAdsetIds, selectedCampaignIds],
  );
  const objectiveFunnel = useMemo(
    () =>
      buildObjectiveAwareFunnel({
        funnel,
        objectiveContext,
        summary,
      }),
    [funnel, objectiveContext, summary],
  );
  const funnelProgressItems = objectiveFunnel.stages;

  const showDashboardBlocks =
    Boolean(dashboardRequest) || Boolean(summary || timeline || funnel || tableData);
  const metricCardsLoading = !dashboardError && (isDashboardTransitioning || isDashboardLoading || !summary);
  const timelineLoading = !dashboardError && (isDashboardTransitioning || isDashboardLoading || !timeline);
  const funnelLoading = !dashboardError && (isDashboardTransitioning || isDashboardLoading || !funnel);
  const tableLoading = !dashboardError && (isDashboardTransitioning || isDashboardLoading || !tableData);

  const campaignFilterOptions = useMemo(() => toCampaignOptions(campaignOptions), [campaignOptions]);
  const adsetFilterOptions = useMemo(() => toAdsetOptions(adsetOptions), [adsetOptions]);
  const adFilterOptions = useMemo(() => toAdOptions(adOptions), [adOptions]);
  const currentPeriodLabel = formatDashboardPeriodLabel(startDate, endDate);
  const accountSummaryItems = activeAccount
    ? [
        {
          label: "Ad account da rota",
          value: activeAccount.adAccountId,
          valueClassName: "break-all text-sm md:text-base",
        },
        {
          label: "Moeda operacional",
          value: activeAccount.currency || "Não informada",
          valueClassName: "text-base md:text-lg",
        },
        {
          label: "Fuso da conta",
          value: activeAccount.timezoneName || "Não informado",
          valueClassName: "break-all text-sm md:text-base",
        },
      ]
    : [];
  const activeFilterHighlights =
    selectedCampaignIds.length > 0 || selectedAdsetIds.length > 0 || selectedAdIds.length > 0
      ? [
          ...(selectedCampaignIds.length > 0
            ? [formatSelectionSummary(selectedCampaignIds.length, "campanha", "campanhas")]
            : []),
          ...(selectedAdsetIds.length > 0
            ? [formatSelectionSummary(selectedAdsetIds.length, "conjunto", "conjuntos")]
            : []),
          ...(selectedAdIds.length > 0
            ? [formatSelectionSummary(selectedAdIds.length, "anúncio", "anúncios")]
            : []),
        ]
      : ["Conta completa"];
  const isRefreshingContext =
    isDashboardLoading ||
    isDashboardTransitioning ||
    isCampaignsLoading ||
    isAdsetsLoading ||
    isAdsLoading;
  const tableLevelLabel =
    tableLevel === "campaign"
      ? "Campanhas"
      : tableLevel === "adset"
        ? "Conjuntos"
        : "Anúncios";
  const canExportPdf =
    Boolean(activeAccount && summary && timeline && funnel && tableData) &&
    !dashboardError &&
    !isRefreshingContext;

  const handleExportPdf = useCallback(() => {
    if (!activeAccount || !summary || !timeline || !funnel || !tableData) {
      toast.error({
        title: "PDF indisponível",
        description: "Aguarde o carregamento completo do dashboard antes de exportar.",
      });
      return;
    }

    setIsExportingPdf(true);

    try {
      const generatedAt = new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date());

      const metrics = summaryCards.map((item) => {
        const accentByLabel: Record<string, string> = {
          Alcance: "#10b981",
          CPC: "#f59e0b",
          CPM: "#f43f5e",
          Cliques: "#7c3aed",
          CTR: "#0ea5e9",
          Impressões: "#0284c7",
          Investimento: "#2262f0",
          Resultados: "#10b981",
        };

        return {
          accent: accentByLabel[item.label] ?? "#2262f0",
          description: item.description,
          label: item.label,
          meta: item.meta,
          value: item.numberFormatter(item.valueNumber),
        };
      });

      const tableRows = tableData.data.map((row) => ({
        clicks: formatNumber(row.clicks),
        costPerResult: formatCurrency(row.costPerResult),
        cpc: formatCurrency(row.cpc),
        cpm: formatCurrency(row.cpm),
        ctr: formatPercent(row.ctr),
        id: row.id,
        impressions: formatNumber(row.impressions),
        name: row.name,
        resultsCount: formatNumber(row.resultsCount),
        spend: formatCurrency(row.spend),
      }));

      const html = buildDashboardPdfHtml({
        accountId: activeAccount.adAccountId,
        accountName: activeAccount.name,
        currency: activeAccount.currency || "Moeda não informada",
        currentPeriodLabel,
        filterHighlights: activeFilterHighlights,
        funnelDescription: objectiveFunnel.note
          ? `${objectiveFunnel.description} ${objectiveFunnel.note}`
          : objectiveFunnel.description,
        funnelItems: funnelProgressItems,
        funnelTitle: objectiveFunnel.title,
        generatedAt,
        lastValidatedAt: formatDateTime(statusRecord?.lastValidatedAt ?? null),
        metrics,
        tableLevelLabel,
        tableRows,
        timelineLabels,
        timelineSeries,
        timezone: activeAccount.timezoneName || "Fuso não informado",
      });

      document.getElementById(PDF_EXPORT_FRAME_ID)?.remove();

      const frame = document.createElement("iframe");
      frame.id = PDF_EXPORT_FRAME_ID;
      frame.setAttribute("aria-hidden", "true");
      frame.style.position = "fixed";
      frame.style.right = "0";
      frame.style.bottom = "0";
      frame.style.width = "1px";
      frame.style.height = "1px";
      frame.style.opacity = "0";
      frame.style.pointerEvents = "none";
      frame.style.border = "0";

      let cleanupTimeoutId: number | null = null;

      const cleanup = () => {
        if (cleanupTimeoutId) {
          window.clearTimeout(cleanupTimeoutId);
        }

        frame.onload = null;
        frame.onerror = null;
        frame.remove();
      };

      frame.onload = () => {
        const frameWindow = frame.contentWindow;

        if (!frameWindow) {
          cleanup();
          setIsExportingPdf(false);
          toast.error({
            title: "Não foi possível gerar o PDF",
            description: "O navegador não conseguiu preparar a visualização para impressão.",
          });
          return;
        }

        frameWindow.onafterprint = () => {
          cleanup();
        };

        cleanupTimeoutId = window.setTimeout(() => {
          cleanup();
        }, 60000);

        window.setTimeout(() => {
          try {
            frameWindow.focus();
            frameWindow.print();
          } catch (error) {
            cleanup();
            toast.error({
              title: "Falha ao abrir a impressão",
              description:
                error instanceof Error
                  ? error.message
                  : "Não foi possível iniciar a impressão do relatório.",
            });
          } finally {
            setIsExportingPdf(false);
          }
        }, 250);
      };

      frame.onerror = () => {
        cleanup();
        setIsExportingPdf(false);
        toast.error({
          title: "Falha ao preparar o PDF",
          description: "Não foi possível montar o relatório para impressão.",
        });
      };

      document.body.appendChild(frame);
      frame.srcdoc = html;
    } catch (error) {
      document.getElementById(PDF_EXPORT_FRAME_ID)?.remove();
      setIsExportingPdf(false);
      toast.error({
        title: "Falha ao gerar o PDF",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível montar o relatório do dashboard agora.",
      });
    }
  }, [
    activeAccount,
    activeFilterHighlights,
    currentPeriodLabel,
    funnel,
    funnelProgressItems,
    isRefreshingContext,
    objectiveFunnel,
    summary,
    summaryCards,
    tableData,
    tableLevelLabel,
    timeline,
    timelineLabels,
    timelineSeries,
    statusRecord?.lastValidatedAt,
    toast,
  ]);

  if (isHydrating) {
    return (
      <section className="panel-card rounded-[1.9rem] border p-8">
        <div className="flex min-h-[14rem] flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LoaderCircle className="h-6 w-6 animate-spin" />
          </div>
          <h2 className="mt-5 text-xl font-black tracking-tight text-on-surface">
            Carregando dashboard Meta
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-on-surface-variant">
            Estamos validando a conta da rota e preparando os widgets do dashboard.
          </p>
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <StateCard
        action={(
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/16 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
            onClick={() => void loadContext()}
            type="button"
          >
            <RefreshCcw className="h-4 w-4" />
            Tentar novamente
          </button>
        )}
        description={loadError}
        title="Falha ao abrir o dashboard Meta"
      />
    );
  }

  if (!statusRecord || statusRecord.status === "NOT_CONNECTED") {
    return (
      <StateCard
        action={(
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            onClick={() => navigate("/painel/contas-integracao/meta")}
            type="button"
          >
            Ir para Contas e integrações
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        )}
        description="A integração Meta ainda não está conectada. Conecte a conta primeiro para abrir dashboards por conta."
        title="Conecte a Meta para continuar"
      />
    );
  }

  if (panelMetaStatusNeedsReconnect(statusRecord.status)) {
    return (
      <StateCard
        action={(
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            onClick={() => navigate("/painel/contas-integracao/meta")}
            type="button"
          >
            Revisar integração
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        )}
        description={getPanelMetaStatusDescription(statusRecord.status)}
        title={`Integração Meta em atenção: ${getPanelMetaStatusLabel(statusRecord.status)}`}
      />
    );
  }

  if (adAccounts.length === 0) {
    return (
      <StateCard
        action={(
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/16 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
            onClick={() => void loadContext()}
            type="button"
          >
            <RefreshCcw className="h-4 w-4" />
            Atualizar contas
          </button>
        )}
        description="A conexão Meta está ativa, mas nenhuma conta de anúncio foi retornada pela API neste momento."
        title="Nenhuma conta Meta disponível"
      />
    );
  }

  if (!activeAccount) {
    return (
      <StateCard
        action={(
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/16 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
            onClick={() => navigate("/painel/trafego-pago/meta")}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para contas
          </button>
        )}
        description={`A conta ${adAccountId} não foi encontrada entre as contas liberadas pela integração atual.`}
        title="Conta Meta indisponível"
      />
    );
  }

  return (
    <>
      <Seo
        description={`Dashboard Meta da conta ${activeAccount.name}.`}
        noindex
        path={location.pathname}
        structuredData={null}
        title={`Meta • ${activeAccount.name}`}
      />

      <div className="space-y-6">
        <PanelPageHeader
          actions={statusRecord ? <MetaStatusBadge status={statusRecord.status} /> : undefined}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Tráfego pago", to: "/painel/trafego-pago/meta" },
            { label: "Meta", to: "/painel/trafego-pago/meta" },
            { label: activeAccount.name },
          ]}
          description="Dashboard operacional por conta Meta, com filtros de período, campanhas, conjuntos e anúncios aplicados diretamente sobre o adAccountId da rota."
          title={activeAccount.name}
        />

        <section className="panel-premium-card rounded-[2rem] border p-6 md:p-7">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[32rem] max-w-full bg-[radial-gradient(circle_at_top_right,rgba(34,98,240,0.18),transparent_58%)]" />

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.32fr)_minmax(24rem,0.98fr)]">
            <div className="rounded-[1.9rem] border border-outline-variant/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015)),radial-gradient(circle_at_top_right,rgba(34,98,240,0.14),transparent_35%)] p-6 md:p-7">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full border border-primary/18 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em] text-primary">
                  Conta Meta ativa
                </span>
                <span className="rounded-full border border-outline-variant/12 bg-surface-container-low/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                  Dashboard por ad account
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight text-on-surface md:text-[2.35rem]">
                {activeAccount.name}
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
                Esta conta concentra o recorte operacional usado pelos cards, timeline, funil e
                tabela. O período e os filtros abaixo atualizam toda a leitura em sincronia.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {accountSummaryItems.map((item) => (
                  <div
                    className="panel-dashboard-soft-card rounded-[1.45rem] border px-4 py-4"
                    key={item.label}
                    title={item.value}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                      {item.label}
                    </p>
                    <p className={`mt-2.5 font-semibold leading-relaxed text-on-surface ${item.valueClassName}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.45rem] border border-outline-variant/12 bg-surface/55 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                  Contexto aplicado agora
                </p>
                <p className="mt-2 text-sm font-semibold text-on-surface">
                  {currentPeriodLabel}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {activeFilterHighlights.map((item) => (
                    <span
                      className="panel-dashboard-soft-pill rounded-full border px-3 py-1.5 text-xs font-semibold text-on-surface"
                      key={item}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <div className="panel-dashboard-soft-card rounded-[1.7rem] border p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                        Período sincronizado
                      </p>
                      <h3 className="mt-3 text-xl font-bold leading-tight text-on-surface">
                        {currentPeriodLabel}
                      </h3>
                    </div>
                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl border border-primary/16 bg-primary/10 text-primary">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                    <div className="rounded-[1.2rem] border border-outline-variant/12 bg-surface-container-low/70 px-3.5 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                        Início
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-on-surface">
                        {formatCompactDate(startDate)}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-outline-variant/12 bg-surface-container-low/70 px-3.5 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                        Fim
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-on-surface">
                        {formatCompactDate(endDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="panel-dashboard-soft-card rounded-[1.7rem] border p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                        Última validação
                      </p>
                      <h3 className="mt-3 text-xl font-bold leading-tight text-on-surface">
                        {formatCompactDate(statusRecord.lastValidatedAt)}
                      </h3>
                    </div>
                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl border border-emerald-500/16 bg-emerald-500/10 text-emerald-500">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="panel-dashboard-soft-pill rounded-full border px-3 py-1.5 text-sm font-semibold text-on-surface">
                      {formatCompactTime(statusRecord.lastValidatedAt)}
                    </span>
                    <span className="rounded-full border border-emerald-500/18 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-500">
                      Integração verificada
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
                    {formatDateTime(statusRecord.lastValidatedAt)}
                  </p>
                </div>
              </div>

              <div className="panel-dashboard-soft-card rounded-[1.7rem] border p-4 md:p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                  Ações rápidas
                </p>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  Volte para a lista de contas ou force uma nova sincronização do contexto e dos widgets.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    className="panel-dashboard-action-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1.15rem] border px-4 text-sm font-semibold text-on-surface transition-all hover:text-primary"
                    onClick={() => navigate("/painel/trafego-pago/meta")}
                    type="button"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para contas
                  </button>
                  <button
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1.15rem] border border-primary/30 bg-[linear-gradient(135deg,#2262f0,#4f86ff)] px-4 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(34,98,240,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(34,98,240,0.34)] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isRefreshingContext}
                    onClick={handleRefresh}
                    type="button"
                  >
                    <RefreshCcw className={`h-4 w-4 ${isRefreshingContext ? "animate-spin" : ""}`} />
                    {isRefreshingContext ? "Atualizando..." : "Atualizar leitura"}
                  </button>
                  <button
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1.15rem] border border-rose-500/18 bg-rose-500/10 px-4 text-sm font-semibold text-rose-500 transition-all hover:-translate-y-0.5 hover:bg-rose-500/14 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
                    disabled={!canExportPdf || isExportingPdf}
                    onClick={handleExportPdf}
                    type="button"
                  >
                    <FileDown className="h-4 w-4" />
                    {isExportingPdf ? "Preparando PDF..." : "Exportar PDF"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel-premium-card rounded-[2rem] border p-6 md:p-7">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
                  Filtros
                </p>
                <h2 className="mt-2 text-lg font-bold tracking-tight text-on-surface md:text-xl">
                  Período e recortes da Meta
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  Refine a leitura da conta <span className="font-semibold text-on-surface">{activeAccount.adAccountId}</span> por período, campanhas, conjuntos e anúncios sem perder a visão consolidada do dashboard.
                </p>
              </div>

              <div className="panel-dashboard-soft-pill inline-flex flex-wrap gap-2 rounded-[1.3rem] border p-1.5">
                {([
                  { label: "Hoje", value: "today" },
                  { label: "7 dias", value: "7d" },
                  { label: "30 dias", value: "30d" },
                  { label: "Personalizado", value: "custom" },
                ] as Array<{ label: string; value: DashboardPeriodPreset }>).map((item) => {
                  const active = periodPreset === item.value;

                  return (
                    <button
                      className={`inline-flex h-10 items-center justify-center rounded-[1rem] px-4 text-sm font-semibold transition-all ${
                        active
                          ? "bg-primary text-white shadow-[0_14px_30px_rgba(34,98,240,0.28)]"
                          : "text-on-surface-variant hover:bg-surface-container-high/80 hover:text-on-surface"
                      }`}
                      key={item.value}
                      onClick={() => handlePresetChange(item.value)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.55rem] border border-outline-variant/12 bg-surface-container-low/55 p-4 md:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                    Recorte aplicado agora
                  </p>
                  <p className="mt-2 text-sm font-semibold text-on-surface">
                    {currentPeriodLabel}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {activeFilterHighlights.map((item) => (
                    <span
                      className="panel-dashboard-soft-pill rounded-full border px-3 py-1.5 text-xs font-semibold text-on-surface"
                      key={item}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
                <AppInput
                  label="Data inicial"
                  onChange={(event) => handleStartDateChange(event.target.value)}
                  type="date"
                  value={startDate}
                />
                <AppInput
                  label="Data final"
                  onChange={(event) => handleEndDateChange(event.target.value)}
                  type="date"
                  value={endDate}
                />
                <PanelMetaFilterMultiSelect
                  label="Campanhas"
                  loading={isCampaignsLoading}
                  onChange={setSelectedCampaignIds}
                  options={campaignFilterOptions}
                  placeholder="Todas as campanhas"
                  values={selectedCampaignIds}
                />
                <PanelMetaFilterMultiSelect
                  label="Conjuntos"
                  loading={isAdsetsLoading}
                  onChange={setSelectedAdsetIds}
                  options={adsetFilterOptions}
                  placeholder="Todos os conjuntos"
                  values={selectedAdsetIds}
                />
                <PanelMetaFilterMultiSelect
                  label="Anúncios"
                  loading={isAdsLoading}
                  onChange={setSelectedAdIds}
                  options={adFilterOptions}
                  placeholder="Todos os anúncios"
                  values={selectedAdIds}
                />
              </div>
            </div>
          </div>
        </section>

        {dashboardError ? (
          <section className="panel-card rounded-[1.8rem] border border-red-500/14 bg-red-500/6 px-5 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Não foi possível carregar o dashboard desta conta
                </p>
                <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{dashboardError}</p>
              </div>
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/18 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                onClick={handleRefresh}
                type="button"
              >
                <RefreshCcw className="h-4 w-4" />
                Tentar novamente
              </button>
            </div>
          </section>
        ) : null}

        {showDashboardBlocks ? (
          <>
            <section className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-4">
              {summaryCards.map((item) => (
                <PanelMetricCard
                  description={item.description}
                  icon={item.icon}
                  key={item.label}
                  label={item.label}
                  loading={metricCardsLoading}
                  meta={item.meta}
                  numberFormatter={item.numberFormatter}
                  toneClassName={item.toneClassName}
                  value={item.numberFormatter(item.valueNumber)}
                  valueNumber={item.valueNumber}
                  valueToneClassName={item.valueToneClassName}
                />
              ))}
            </section>

            <div className="grid gap-6">
              <PanelAnalyticsCard
                description="Evolução diária do investimento e dos resultados da conta Meta no período selecionado."
                eyebrow="Timeline"
                title="Linha do tempo"
              >
                <PanelLineChart
                  labels={timelineLabels}
                  loading={timelineLoading}
                  range={resolveChartRange(timelineLabels.length)}
                  series={timelineSeries}
                />
              </PanelAnalyticsCard>

              <PanelAnalyticsCard
                actions={(
                  <span className="panel-card-muted inline-flex rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface">
                    {objectiveFunnel.badge}
                  </span>
                )}
                description={objectiveFunnel.description}
                eyebrow="Funil"
                title={objectiveFunnel.title}
              >
                <PanelMetaObjectiveFunnel
                  kpis={objectiveFunnel.kpis}
                  loading={funnelLoading}
                  metrics={objectiveFunnel.metrics}
                  note={objectiveFunnel.note}
                  objectiveLabel={objectiveFunnel.badge}
                  stages={funnelProgressItems}
                />
              </PanelAnalyticsCard>
            </div>

            <PanelMetaDashboardTable
              isLoading={tableLoading}
              level={tableLevel}
              onLevelChange={setTableLevel}
              rows={tableData?.data ?? []}
            />
          </>
        ) : null}
      </div>
    </>
  );
}
