import {
  Activity,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Clock3,
  Eye,
  FileDown,
  FileText,
  Heart,
  RefreshCcw,
  Search,
  ShieldCheck,
  TrendingUp,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { PanelAnalyticsCard } from "../../components/painel/PanelAnalyticsCard";
import { PanelLineChart } from "../../components/painel/PanelLineChart";
import { PanelMetricCard } from "../../components/painel/PanelMetricCard";
import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import {
  PanelSocialMediaContentTable,
  type PanelSocialMediaContentRecord,
} from "../../components/painel/PanelSocialMediaContentTable";
import { PanelSocialMediaHighlightsGrid } from "../../components/painel/PanelSocialMediaHighlightsGrid";
import { Seo } from "../../components/shared/Seo";
import { AppInput } from "../../components/shared/ui/AppInput";
import { AppSelect } from "../../components/shared/ui/AppSelect";
import {
  getPanelMetaStatusBadgeClassName,
  getPanelMetaStatusDescription,
  getPanelMetaStatusLabel,
  panelMetaStatusNeedsReconnect,
} from "../../config/painel/meta-status";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import { useToast } from "../../context/shared/ToastContext";
import {
  getPanelMetaConnectionStatus,
  type PanelMetaConnectionStatusRecord,
} from "../../services/painel/meta-api";
import type { PanelDashboardRange } from "../../services/painel/dashboard-api";
import {
  getPanelMetaSocialMediaDashboard,
  listPanelMetaSocialMediaAccounts,
  listPanelMetaSocialMediaContents,
  type PanelMetaSocialMediaAccountRecord,
  type PanelMetaSocialMediaContentItemRecord,
  type PanelMetaSocialMediaContentOrderBy,
  type PanelMetaSocialMediaContentOrderDirection,
  type PanelMetaSocialMediaContentType,
  type PanelMetaSocialMediaDashboardComparisonMetricRecord,
  type PanelMetaSocialMediaDashboardRecord,
  type PanelMetaSocialMediaPerformanceBenchmark,
} from "../../services/painel/social-media-api";

type ContentTypeFilter = PanelMetaSocialMediaContentType | "all";

type OverviewCardDefinition = {
  description: string;
  icon: ReactNode;
  label: string;
  meta?: Array<{ label: string; value: string }>;
  numberFormatter?: (value: number) => string;
  toneClassName: string;
  value: string;
  valueNumber?: number;
  valueToneClassName?: string;
};

type ComparisonCardDefinition = {
  description: string;
  label: string;
  metric: PanelMetaSocialMediaDashboardComparisonMetricRecord;
  valueFormatter: (value: number) => string;
};

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

function MetaStatusBadge({
  status,
}: {
  status: PanelMetaConnectionStatusRecord["status"];
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getPanelMetaStatusBadgeClassName(
        status,
      )}`}
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      {getPanelMetaStatusLabel(status)}
    </span>
  );
}

function ComparisonCard({
  description,
  label,
  metric,
  valueFormatter,
}: ComparisonCardDefinition) {
  const deltaToneClassName =
    (metric.deltaPercentage ?? metric.delta ?? 0) > 0
      ? "text-emerald-500"
      : (metric.deltaPercentage ?? metric.delta ?? 0) < 0
        ? "text-rose-500"
        : "text-on-surface-variant";

  const currentValue =
    metric.current === null ? "Sem dado" : valueFormatter(metric.current);
  const previousValue =
    metric.previous === null ? "Sem base" : valueFormatter(metric.previous);
  const deltaValue =
    metric.deltaPercentage !== null
      ? formatSignedPercentage(metric.deltaPercentage)
      : metric.delta !== null
        ? formatSignedValue(metric.delta, valueFormatter)
        : "Sem variação";

  return (
    <article className="panel-card-muted rounded-[1.5rem] border p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">{label}</p>
      <p className="mt-3 text-2xl font-black tracking-tight text-on-surface">{currentValue}</p>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{description}</p>

      <div className="mt-4 grid gap-3 border-t border-outline-variant/10 pt-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
            Período anterior
          </p>
          <p className="mt-1 text-sm font-semibold text-on-surface">{previousValue}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
            Delta
          </p>
          <p className={`mt-1 text-sm font-semibold ${deltaToneClassName}`}>{deltaValue}</p>
        </div>
      </div>
    </article>
  );
}

function PatternCard({
  description,
  icon: Icon,
  title,
  value,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
  value: string;
}) {
  return (
    <article className="panel-card-muted rounded-[1.5rem] border p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">{title}</p>
          <p className="mt-3 text-xl font-black tracking-tight text-on-surface">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/16 bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{description}</p>
    </article>
  );
}

function toDateInputValue(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
    value.getDate(),
  ).padStart(2, "0")}`;
}

function getDefaultDateRange() {
  const today = new Date();
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 29);

  return {
    endDate: toDateInputValue(endDate),
    startDate: toDateInputValue(startDate),
  };
}

function formatInteger(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function formatPercentage(value: number) {
  return `${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(value * 100)}%`;
}

function formatSignedPercentage(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatPercentage(Math.abs(value))}`;
}

function formatSignedValue(value: number, formatter: (value: number) => string) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatter(Math.abs(value))}`;
}

function formatSignedInteger(value: number) {
  return formatSignedValue(value, formatInteger);
}

function formatCompactDate(value: string | null | undefined) {
  if (!value) {
    return "Sem data";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

function formatDateRangeLabel(startDate: string | null | undefined, endDate: string | null | undefined) {
  if (startDate && endDate) {
    return `${formatCompactDate(startDate)} a ${formatCompactDate(endDate)}`;
  }

  if (startDate) {
    return `A partir de ${formatCompactDate(startDate)}`;
  }

  if (endDate) {
    return `Até ${formatCompactDate(endDate)}`;
  }

  return "Período indefinido";
}

function resolveChartRange(startDate: string, endDate: string): PanelDashboardRange {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "30d";
  }

  const diffInDays = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );

  if (diffInDays <= 7) {
    return "7d";
  }

  if (diffInDays <= 45) {
    return "30d";
  }

  return "12m";
}

function getPerformanceBenchmarkLabel(value: PanelMetaSocialMediaPerformanceBenchmark | null) {
  switch (value) {
    case "engagement":
      return "Engajamento";
    case "engagementRate":
      return "Taxa de engajamento";
    case "reach":
      return "Alcance";
    case "views":
      return "Visualizações";
    default:
      return "Benchmark";
  }
}

function getPerformanceBenchmarkDescription(value: PanelMetaSocialMediaPerformanceBenchmark | null) {
  switch (value) {
    case "engagement":
      return "Comparativo calculado pelo total de interações do conteúdo.";
    case "engagementRate":
      return "Comparativo calculado pela taxa média de engajamento da conta.";
    case "reach":
      return "Comparativo calculado pelo alcance médio das publicações.";
    case "views":
      return "Comparativo calculado pelo volume médio de visualizações.";
    default:
      return "Comparativo de performance retornado pela API.";
  }
}

function formatBenchmarkValue(
  benchmark: PanelMetaSocialMediaPerformanceBenchmark | null,
  value: number | null,
) {
  if (value === null) {
    return "Não disponível";
  }

  return benchmark === "engagementRate" ? formatPercentage(value) : formatInteger(value);
}

function getContentTypeLabel(value: PanelMetaSocialMediaContentType) {
  switch (value) {
    case "carousel":
      return "Carrossel";
    case "image":
      return "Imagem";
    case "other":
      return "Outro";
    case "post":
      return "Post";
    case "reel":
      return "Reel";
    case "story":
      return "Story";
    case "video":
      return "Vídeo";
    default:
      return "Conteúdo";
  }
}

function getPerformanceClassificationLabel(value: PanelMetaSocialMediaContentItemRecord["performance"]["classification"]) {
  switch (value) {
    case "above_average":
      return "Acima da média";
    case "below_average":
      return "Abaixo da média";
    default:
      return "Sem classificação";
  }
}

function createContentTitle(value: string | null, fallback: string) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return fallback;
  }

  return normalizedValue.length > 96
    ? `${normalizedValue.slice(0, 93).trimEnd()}...`
    : normalizedValue;
}

function normalizeSearchText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function resolveContentKind(
  item: PanelMetaSocialMediaContentItemRecord,
): PanelSocialMediaContentRecord["kind"] {
  switch (item.contentType) {
    case "carousel":
      return "carousel";
    case "image":
      return "image";
    case "other":
      return "other";
    case "post":
      return "post";
    case "reel":
      return "reel";
    case "story":
      return "story";
    case "video":
      return "video";
    default:
      return item.source === "instagram" ? "instagram_post" : "facebook_post";
  }
}

function resolveMediaKind(
  item: PanelMetaSocialMediaContentItemRecord,
): PanelSocialMediaContentRecord["mediaKind"] {
  switch (item.contentType) {
    case "carousel":
      return "carousel";
    case "image":
      return "image";
    case "post":
      return "post";
    case "reel":
      return "reel";
    case "story":
      return "story";
    case "video":
      return "video";
    default:
      return "unknown";
  }
}

function getSourceLabel(
  item: PanelMetaSocialMediaContentItemRecord,
  account: PanelMetaSocialMediaAccountRecord | null,
) {
  const matchingPlatform = account?.platforms.find((platform) => platform.platform === item.source);

  if (item.source === "instagram") {
    if (matchingPlatform?.username) {
      return `@${matchingPlatform.username}`;
    }

    return matchingPlatform?.displayName ?? account?.instagramUsername ?? "Instagram";
  }

  return matchingPlatform?.displayName ?? account?.pageName ?? "Facebook";
}

function buildContentMetrics(
  item: PanelMetaSocialMediaContentItemRecord,
): PanelSocialMediaContentRecord["metrics"] {
  const metrics: NonNullable<PanelSocialMediaContentRecord["metrics"]> = [];

  if (item.metrics.likes !== null) {
    metrics.push({
      label: "Likes",
      value: formatInteger(item.metrics.likes),
    });
  }

  if (item.metrics.comments !== null) {
    metrics.push({
      label: "Comentários",
      value: formatInteger(item.metrics.comments),
    });
  }

  if (item.metrics.shares !== null) {
    metrics.push({
      label: "Compart.",
      value: formatInteger(item.metrics.shares),
    });
  }

  if (item.metrics.saves !== null) {
    metrics.push({
      label: "Salvos",
      value: formatInteger(item.metrics.saves),
    });
  }

  if (item.performance.value !== null) {
    metrics.push({
      label: getPerformanceBenchmarkLabel(item.performance.benchmark),
      value: formatBenchmarkValue(item.performance.benchmark, item.performance.value),
    });
  }

  if (item.metrics.engagementRate !== null) {
    metrics.push({
      label: "Taxa",
      value: formatPercentage(item.metrics.engagementRate),
    });
  }

  if (item.metrics.engagement > 0) {
    metrics.push({
      label: "Engajamento",
      value: formatInteger(item.metrics.engagement),
    });
  }

  if (item.metrics.reach !== null) {
    metrics.push({
      label: "Alcance",
      value: formatInteger(item.metrics.reach),
    });
  } else if (item.metrics.views !== null) {
    metrics.push({
      label: "Views",
      value: formatInteger(item.metrics.views),
    });
  } else if (item.metrics.impressions !== null) {
    metrics.push({
      label: "Impressões",
      value: formatInteger(item.metrics.impressions),
    });
  }

  metrics.push({
    label: "Classificação",
    value: getPerformanceClassificationLabel(item.performance.classification),
  });

  return metrics;
}

function mapContentRecord(
  item: PanelMetaSocialMediaContentItemRecord,
  account: PanelMetaSocialMediaAccountRecord | null,
): PanelSocialMediaContentRecord {
  const fallbackTitle = `${getContentTypeLabel(item.contentType)} ${item.source === "instagram" ? "do Instagram" : "do Facebook"}`;
  const title = createContentTitle(item.caption, fallbackTitle);

  return {
    excerpt: item.caption && item.caption.trim() !== title ? item.caption.trim() : null,
    id: item.id,
    kind: resolveContentKind(item),
    mediaKind: resolveMediaKind(item),
    metrics: buildContentMetrics(item),
    permalinkUrl: item.permalink,
    platform: item.source,
    previewUrl: item.thumbnailUrl,
    publishedAt: item.publishedAt,
    rawType: item.sourceType,
    sourceId: item.sourceId,
    sourceLabel: getSourceLabel(item, account),
    title,
  };
}

function pickPrimaryVolumeMetric(
  dashboard: PanelMetaSocialMediaDashboardRecord | null,
) {
  const metrics = dashboard?.overview.metrics;
  const availability = dashboard?.overview.metricAvailability;

  if (!metrics || !availability) {
    return {
      color: "#38bdf8",
      description: "Total de alcance distribuído no período filtrado.",
      icon: Eye,
      key: "reach" as const,
      label: "Alcance",
      value: null as number | null,
    };
  }

  if (availability.reach || metrics.reach !== null) {
    return {
      color: "#38bdf8",
      description: "Total de contas alcançadas no período filtrado.",
      icon: Eye,
      key: "reach" as const,
      label: "Alcance",
      value: metrics.reach,
    };
  }

  if (availability.impressions || metrics.impressions !== null) {
    return {
      color: "#8b5cf6",
      description: "Volume de impressões acumulado no recorte atual.",
      icon: BarChart3,
      key: "impressions" as const,
      label: "Impressões",
      value: metrics.impressions,
    };
  }

  return {
    color: "#22c55e",
    description: "Volume consolidado de visualizações retornado pela API.",
    icon: Eye,
    key: "views" as const,
    label: "Visualizações",
    value: metrics.views,
  };
}

function getComparisonMetricByBenchmark(
  dashboard: PanelMetaSocialMediaDashboardRecord | null,
) {
  if (!dashboard) {
    return {
      label: "Benchmark",
      metric: {
        current: null,
        delta: null,
        deltaPercentage: null,
        previous: null,
      } satisfies PanelMetaSocialMediaDashboardComparisonMetricRecord,
      valueFormatter: formatInteger,
    };
  }

  const benchmark = dashboard.overview.performanceBenchmark;

  if (benchmark === "engagementRate") {
    return {
      label: "Taxa de engajamento",
      metric: dashboard.comparison.engagementRate,
      valueFormatter: formatPercentage,
    };
  }

  if (benchmark === "reach") {
    return {
      label: "Alcance",
      metric: dashboard.comparison.reach,
      valueFormatter: formatInteger,
    };
  }

  if (benchmark === "views") {
    return {
      label: "Visualizações",
      metric: dashboard.comparison.views,
      valueFormatter: formatInteger,
    };
  }

  return {
    label: "Engajamento",
    metric: dashboard.comparison.engagement,
    valueFormatter: formatInteger,
  };
}

function resolvePlatformLabel(account: PanelMetaSocialMediaAccountRecord | null) {
  if (!account) {
    return "Conta Meta";
  }

  if (account.type === "both") {
    return "Facebook + Instagram";
  }

  return account.type === "instagram" ? "Instagram" : "Facebook";
}

function matchesRouteIdentifier(
  account: PanelMetaSocialMediaAccountRecord,
  routeIdentifier: string,
) {
  const normalizedIdentifier = routeIdentifier.trim();

  if (!normalizedIdentifier) {
    return false;
  }

  return (
    account.id === normalizedIdentifier ||
    account.pageId === normalizedIdentifier ||
    account.instagramAccountId === normalizedIdentifier ||
    account.relation.pageId === normalizedIdentifier ||
    account.relation.instagramAccountId === normalizedIdentifier ||
    account.platforms.some((platform) => platform.externalId === normalizedIdentifier)
  );
}

function formatDateTime(value: string | null | undefined) {
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

function getGranularityLabel(value: "auto" | "day" | "week") {
  switch (value) {
    case "day":
      return "Diária";
    case "week":
      return "Semanal";
    default:
      return "Automática";
  }
}

function getContentOrderByLabel(value: PanelMetaSocialMediaContentOrderBy) {
  switch (value) {
    case "comments":
      return "Comentários";
    case "engagement":
      return "Engajamento";
    case "engagementRate":
      return "Taxa de engajamento";
    case "impressions":
      return "Impressões";
    case "likes":
      return "Curtidas";
    case "publishedAt":
      return "Data de publicação";
    case "reach":
      return "Alcance";
    case "saves":
      return "Salvos";
    case "shares":
      return "Compartilhamentos";
    case "views":
      return "Visualizações";
    default:
      return "Ordenação";
  }
}

function getContentOrderDirectionLabel(value: PanelMetaSocialMediaContentOrderDirection) {
  return value === "asc" ? "Menor para maior" : "Maior para menor";
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
const PDF_EXPORT_FRAME_ID = "panel-meta-social-dashboard-pdf-export-frame";
const PDF_CHART_PADDING = {
  top: 20,
  right: 24,
  bottom: 38,
  left: 24,
};

function formatPdfTickLabel(rawDate: string, range: PanelDashboardRange) {
  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    return rawDate;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: range === "12m" ? undefined : "2-digit",
    month: range === "12m" ? "short" : "2-digit",
  }).format(date);
}

function getPdfTimelineSeriesHelper(label: string) {
  if (label === "Engajamento") {
    return "Linha complementar com o total de interações orgânicas retornadas pela API.";
  }

  return `Linha principal com ${label.toLowerCase()} consolidado no período exportado.`;
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
  range: PanelDashboardRange,
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
            ${formatInteger(value)}
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
          ${escapeHtml(formatPdfTickLabel(labels[index] ?? "", range))}
        </text>
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${PDF_CHART_WIDTH} ${PDF_CHART_HEIGHT}" class="pdf-line-chart" role="img" aria-label="Gráfico de linha do dashboard social da Meta">
      ${gridLines}
      ${seriesPaths}
      ${seriesDots}
      ${tickLabels}
    </svg>
  `;
}

function buildSocialDashboardPdfHtml({
  accountId,
  accountName,
  benchmarkLabel,
  benchmarkValue,
  chartRange,
  comparisonItems,
  contentRows,
  contentSummaryLabel,
  currentPeriodLabel,
  filterHighlights,
  generatedAt,
  patternItems,
  platformLabel,
  rankingItems,
  summaryCards,
  timelineLabels,
  timelineSeries,
  timezone,
}: {
  accountId: string;
  accountName: string;
  benchmarkLabel: string;
  benchmarkValue: string;
  chartRange: PanelDashboardRange;
  comparisonItems: Array<{
    currentValue: string;
    deltaToneClassName: "negative" | "neutral" | "positive";
    deltaValue: string;
    description: string;
    label: string;
    previousValue: string;
  }>;
  contentRows: Array<{
    format: string;
    metrics: string;
    platform: string;
    publishedAt: string;
    source: string;
    title: string;
  }>;
  contentSummaryLabel: string;
  currentPeriodLabel: string;
  filterHighlights: string[];
  generatedAt: string;
  patternItems: Array<{
    description: string;
    label: string;
    value: string;
  }>;
  platformLabel: string;
  rankingItems: Array<{
    classification: string;
    performanceLabel: string;
    performanceValue: string;
    publishedAt: string;
    sourceLabel: string;
    title: string;
  }>;
  summaryCards: Array<{
    accent: string;
    description: string;
    label: string;
    meta?: Array<{ label: string; value: string }>;
    value: string;
  }>;
  timelineLabels: string[];
  timelineSeries: Array<{ color: string; label: string; values: number[] }>;
  timezone: string;
}) {
  const chartSvg = buildPdfLineChartSvg(timelineLabels, timelineSeries, chartRange);
  const hasContentRows = contentRows.length > 0;
  const hasRankingItems = rankingItems.length > 0;

  return `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(`Social Media Meta • ${accountName}`)}</title>
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
            break-inside: avoid;
          }

          .pdf-hero {
            position: relative;
            overflow: hidden;
            background:
              linear-gradient(145deg, rgba(255,255,255,0.98), rgba(239,244,251,0.92)),
              radial-gradient(circle at top right, rgba(236, 72, 153, 0.14), transparent 34%),
              radial-gradient(circle at bottom left, rgba(56, 189, 248, 0.14), transparent 38%);
          }

          .pdf-hero::before {
            content: "";
            position: absolute;
            inset: 0;
            background:
              radial-gradient(circle at top right, rgba(236, 72, 153, 0.1), transparent 32%),
              radial-gradient(circle at bottom left, rgba(56, 189, 248, 0.1), transparent 36%);
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
            border: 1px solid rgba(236, 72, 153, 0.14);
            background: rgba(236, 72, 153, 0.08);
            color: #db2777;
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

          .pdf-metric-grid {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 12px;
            margin-top: 16px;
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
            grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
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
            min-height: 220px;
            border: 1px dashed #cbd4e1;
            border-radius: 18px;
            background: #f8fafc;
            color: #5e6878;
            font-size: 13px;
            text-align: center;
            padding: 24px;
          }

          .pdf-comparison-grid,
          .pdf-pattern-grid,
          .pdf-ranking-grid {
            display: grid;
            gap: 12px;
            margin-top: 16px;
          }

          .pdf-comparison-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .pdf-pattern-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }

          .pdf-ranking-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .pdf-card {
            border: 1px solid #d7dfeb;
            border-radius: 18px;
            background: #ffffff;
            padding: 14px 16px;
          }

          .pdf-card-title {
            margin: 0;
            font-size: 16px;
            font-weight: 800;
            letter-spacing: -0.02em;
            color: #141821;
          }

          .pdf-card-copy {
            margin: 10px 0 0;
            color: #5e6878;
            font-size: 11px;
            line-height: 1.55;
          }

          .pdf-card-value {
            margin-top: 10px;
            font-size: 22px;
            line-height: 1.05;
            font-weight: 900;
            letter-spacing: -0.04em;
            color: #141821;
          }

          .pdf-card-subgrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
            margin-top: 14px;
            padding-top: 12px;
            border-top: 1px solid #e4eaf3;
          }

          .pdf-delta-positive {
            color: #059669;
          }

          .pdf-delta-negative {
            color: #e11d48;
          }

          .pdf-delta-neutral {
            color: #5e6878;
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

          .pdf-table-secondary {
            display: block;
            margin-top: 4px;
            color: #5e6878;
            font-size: 10px;
            line-height: 1.45;
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
            .pdf-card,
            .pdf-metric-card {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <main class="pdf-report">
          <section class="pdf-section pdf-hero">
            <div class="pdf-brand">GSUCHOA • Social Media Meta</div>
            <h1 class="pdf-title">${escapeHtml(accountName)}</h1>
            <p class="pdf-description">
              Relatório exportado com o recorte atual do dashboard social da Meta, incluindo resumo consolidado,
              evolução temporal, comparativos, padrões de publicação, destaques do período e a biblioteca visível.
            </p>

            <div class="pdf-meta-grid">
              <div class="pdf-meta-card">
                <div class="pdf-eyebrow">Conta unificada</div>
                <div class="pdf-meta-value">${escapeHtml(accountId)}</div>
              </div>
              <div class="pdf-meta-card">
                <div class="pdf-eyebrow">Plataformas</div>
                <div class="pdf-meta-value">${escapeHtml(platformLabel)}</div>
              </div>
              <div class="pdf-meta-card">
                <div class="pdf-eyebrow">Período</div>
                <div class="pdf-meta-value">${escapeHtml(currentPeriodLabel)}</div>
              </div>
              <div class="pdf-meta-card">
                <div class="pdf-eyebrow">Benchmark</div>
                <div class="pdf-meta-value">${escapeHtml(`${benchmarkLabel} • ${benchmarkValue}`)}</div>
              </div>
            </div>

            <div class="pdf-chip-row">
              ${filterHighlights
                .map((item) => `<span class="pdf-chip">${escapeHtml(item)}</span>`)
                .join("")}
              <span class="pdf-chip">Timezone ${escapeHtml(timezone)}</span>
              <span class="pdf-chip">Gerado em ${escapeHtml(generatedAt)}</span>
            </div>
          </section>

          <section class="pdf-section">
            <div class="pdf-eyebrow">Totais</div>
            <h2 class="pdf-section-title">Resumo consolidado</h2>
            <p class="pdf-section-description">
              Indicadores principais do período exportado a partir dos dados sociais normalizados da Meta.
            </p>

            <div class="pdf-metric-grid">
              ${summaryCards
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
              <h2 class="pdf-section-title">Linha do tempo social</h2>
              <p class="pdf-section-description">
                Evolução do principal indicador de distribuição e do engajamento orgânico no período selecionado.
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
                        <span class="pdf-legend-helper">${escapeHtml(getPdfTimelineSeriesHelper(item.label))}</span>
                      </div>
                    </div>
                  `)
                  .join("")}
              </div>

              <div class="pdf-chart-shell">
                ${chartSvg}
              </div>
              <p class="pdf-chart-note">
                O gráfico replica a leitura do dashboard no momento da exportação, preservando o mesmo período e os mesmos filtros ativos.
              </p>
            </section>

            <section class="pdf-section">
              <div class="pdf-eyebrow">Comparativo</div>
              <h2 class="pdf-section-title">Período anterior</h2>
              <p class="pdf-section-description">
                Comparação direta entre o período atual e a janela imediatamente anterior calculada pela API.
              </p>

              <div class="pdf-comparison-grid">
                ${comparisonItems
                  .map((item) => `
                    <article class="pdf-card">
                      <div class="pdf-eyebrow">${escapeHtml(item.label)}</div>
                      <div class="pdf-card-value">${escapeHtml(item.currentValue)}</div>
                      <p class="pdf-card-copy">${escapeHtml(item.description)}</p>
                      <div class="pdf-card-subgrid">
                        <div>
                          <div class="pdf-eyebrow">Período anterior</div>
                          <div class="pdf-meta-value" style="margin-top:6px;font-size:12px;">${escapeHtml(item.previousValue)}</div>
                        </div>
                        <div>
                          <div class="pdf-eyebrow">Delta</div>
                          <div class="pdf-meta-value pdf-delta-${item.deltaToneClassName}" style="margin-top:6px;font-size:12px;">${escapeHtml(item.deltaValue)}</div>
                        </div>
                      </div>
                    </article>
                  `)
                  .join("")}
              </div>
            </section>
          </section>

          <section class="pdf-section">
            <div class="pdf-eyebrow">Padrões</div>
            <h2 class="pdf-section-title">Comportamento do conteúdo</h2>
            <p class="pdf-section-description">
              Leitura complementar sobre horários, frequência de publicação e ritmo de crescimento orgânico.
            </p>

            <div class="pdf-pattern-grid">
              ${patternItems
                .map((item) => `
                  <article class="pdf-card">
                    <div class="pdf-eyebrow">${escapeHtml(item.label)}</div>
                    <div class="pdf-card-value">${escapeHtml(item.value)}</div>
                    <p class="pdf-card-copy">${escapeHtml(item.description)}</p>
                  </article>
                `)
                .join("")}
            </div>
          </section>

          <section class="pdf-section">
            <div class="pdf-eyebrow">Destaques</div>
            <h2 class="pdf-section-title">Ranking do período</h2>
            <p class="pdf-section-description">
              Conteúdos com melhor performance conforme o ranking consolidado da API social da Meta.
            </p>

            ${hasRankingItems
              ? `
                <div class="pdf-ranking-grid">
                  ${rankingItems
                    .map((item) => `
                      <article class="pdf-card">
                        <p class="pdf-card-title">${escapeHtml(item.title)}</p>
                        <p class="pdf-card-copy">${escapeHtml(`${item.sourceLabel} • ${item.publishedAt}`)}</p>
                        <div class="pdf-card-value">${escapeHtml(item.performanceValue)}</div>
                        <div class="pdf-card-subgrid">
                          <div>
                            <div class="pdf-eyebrow">Benchmark</div>
                            <div class="pdf-meta-value" style="margin-top:6px;font-size:12px;">${escapeHtml(item.performanceLabel)}</div>
                          </div>
                          <div>
                            <div class="pdf-eyebrow">Classificação</div>
                            <div class="pdf-meta-value" style="margin-top:6px;font-size:12px;">${escapeHtml(item.classification)}</div>
                          </div>
                        </div>
                      </article>
                    `)
                    .join("")}
                </div>
              `
              : `<div class="pdf-empty-state">Nenhum destaque de ranking foi retornado para o período selecionado.</div>`}
          </section>

          <section class="pdf-section">
            <div class="pdf-eyebrow">Biblioteca</div>
            <h2 class="pdf-section-title">Conteúdos visíveis no dashboard</h2>
            <p class="pdf-section-description">
              ${escapeHtml(contentSummaryLabel)}
            </p>

            ${hasContentRows
              ? `
                <div class="pdf-table-wrapper">
                  <table class="pdf-table">
                    <thead>
                      <tr>
                        <th>Conteúdo</th>
                        <th>Plataforma</th>
                        <th>Formato</th>
                        <th>Publicado em</th>
                        <th>Origem</th>
                        <th>Métricas</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${contentRows
                        .map((row) => `
                          <tr>
                            <td>${escapeHtml(row.title)}</td>
                            <td>${escapeHtml(row.platform)}</td>
                            <td>${escapeHtml(row.format)}</td>
                            <td>${escapeHtml(row.publishedAt)}</td>
                            <td>${escapeHtml(row.source)}</td>
                            <td>
                              ${escapeHtml(row.metrics)}
                              <span class="pdf-table-secondary">Biblioteca filtrada do recorte atual.</span>
                            </td>
                          </tr>
                        `)
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
              : `<div class="pdf-empty-state">Nenhum conteúdo ficou visível com os filtros atuais no momento da exportação.</div>`}
          </section>
        </main>
      </body>
    </html>
  `;
}

export default function SocialMediaMetaDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { accountId: rawAccountId = "" } = useParams<{ accountId: string }>();
  const { token } = usePanelAuth();
  const { endDate: defaultEndDate, startDate: defaultStartDate } = getDefaultDateRange();
  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);
  const [metaStatus, setMetaStatus] = useState<PanelMetaConnectionStatusRecord | null>(null);
  const [accounts, setAccounts] = useState<PanelMetaSocialMediaAccountRecord[]>([]);
  const [dashboard, setDashboard] = useState<PanelMetaSocialMediaDashboardRecord | null>(null);
  const [contents, setContents] = useState<Awaited<
    ReturnType<typeof listPanelMetaSocialMediaContents>
  > | null>(null);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [granularity, setGranularity] = useState<"auto" | "day" | "week">("auto");
  const [rankingLimit, setRankingLimit] = useState(6);
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentTypeFilter>("all");
  const [orderBy, setOrderBy] = useState<PanelMetaSocialMediaContentOrderBy>("publishedAt");
  const [orderDirection, setOrderDirection] =
    useState<PanelMetaSocialMediaContentOrderDirection>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isContextLoading, setIsContextLoading] = useState(true);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [isContentsLoading, setIsContentsLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [contentsError, setContentsError] = useState<string | null>(null);

  const resolvedRouteIdentifier = useMemo(() => {
    try {
      return decodeURIComponent(rawAccountId);
    } catch {
      return rawAccountId;
    }
  }, [rawAccountId]);

  const resolvedTimezone = useMemo(() => {
    if (typeof Intl === "undefined") {
      return "America/Sao_Paulo";
    }

    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
  }, []);

  const hasInvalidDateRange = Boolean(startDate && endDate && startDate > endDate);
  const matchedAccountFromContext = useMemo(
    () => accounts.find((item) => matchesRouteIdentifier(item, resolvedRouteIdentifier)) ?? null,
    [accounts, resolvedRouteIdentifier],
  );
  const resolvedQueryAccountId = useMemo(
    () => matchedAccountFromContext?.id ?? resolvedRouteIdentifier,
    [matchedAccountFromContext?.id, resolvedRouteIdentifier],
  );
  const canonicalAccountDashboardPath = useMemo(
    () =>
      matchedAccountFromContext
        ? `/painel/social-media/meta/${encodeURIComponent(matchedAccountFromContext.id)}/dashboard`
        : null,
    [matchedAccountFromContext],
  );

  const loadContext = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsContextLoading(true);
    setContextError(null);

    try {
      const nextStatus = await getPanelMetaConnectionStatus(token);
      setMetaStatus(nextStatus);

      if (nextStatus.status !== "CONNECTED") {
        setAccounts([]);
        return;
      }
    } catch (error) {
      setMetaStatus(null);
      setAccounts([]);
      setContextError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o contexto social da Meta.",
      );
      return;
    }

    try {
      const nextAccounts = await listPanelMetaSocialMediaAccounts(token);
      setAccounts(nextAccounts);
    } catch (error) {
      setAccounts([]);
      setContextError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as contas sociais da Meta.",
      );
    } finally {
      setIsContextLoading(false);
    }
  }, [token]);

  const loadDashboard = useCallback(async () => {
    if (!token || !resolvedQueryAccountId) {
      setDashboard(null);
      setIsDashboardLoading(false);
      return;
    }

    if (hasInvalidDateRange) {
      setDashboard(null);
      setDashboardError("A data inicial precisa ser anterior ou igual à data final.");
      setIsDashboardLoading(false);
      return;
    }

    setIsDashboardLoading(true);
    setDashboardError(null);

    try {
      const nextDashboard = await getPanelMetaSocialMediaDashboard(token, {
        accountId: resolvedQueryAccountId,
        endDate,
        granularity,
        rankingLimit,
        startDate,
        timezone: resolvedTimezone,
      });
      setDashboard(nextDashboard);
    } catch (error) {
      setDashboard(null);
      setDashboardError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o dashboard social consolidado.",
      );
    } finally {
      setIsDashboardLoading(false);
    }
  }, [
    endDate,
    granularity,
    hasInvalidDateRange,
    rankingLimit,
    resolvedQueryAccountId,
    resolvedTimezone,
    startDate,
    token,
  ]);

  const loadContents = useCallback(async () => {
    if (!token || !resolvedQueryAccountId) {
      setContents(null);
      setIsContentsLoading(false);
      return;
    }

    if (hasInvalidDateRange) {
      setContents(null);
      setContentsError("A data inicial precisa ser anterior ou igual à data final.");
      setIsContentsLoading(false);
      return;
    }

    setIsContentsLoading(true);
    setContentsError(null);

    try {
      const nextContents = await listPanelMetaSocialMediaContents(token, {
        accountId: resolvedQueryAccountId,
        contentTypes: contentTypeFilter === "all" ? undefined : [contentTypeFilter],
        endDate,
        limit: pageSize,
        orderBy,
        orderDirection,
        page,
        startDate,
        timezone: resolvedTimezone,
      });
      setContents(nextContents);
    } catch (error) {
      setContents(null);
      setContentsError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar a biblioteca de conteúdos sociais.",
      );
    } finally {
      setIsContentsLoading(false);
    }
  }, [
    contentTypeFilter,
    endDate,
    hasInvalidDateRange,
    orderBy,
    orderDirection,
    page,
    pageSize,
    resolvedQueryAccountId,
    resolvedTimezone,
    startDate,
    token,
  ]);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  useEffect(() => {
    if (!canonicalAccountDashboardPath || matchedAccountFromContext?.id === resolvedRouteIdentifier) {
      return;
    }

    navigate(canonicalAccountDashboardPath, { replace: true });
  }, [
    canonicalAccountDashboardPath,
    matchedAccountFromContext?.id,
    navigate,
    resolvedRouteIdentifier,
  ]);

  useEffect(() => {
    setPage(1);
  }, [contentTypeFilter, orderBy, orderDirection, pageSize, resolvedRouteIdentifier, startDate, endDate]);

  useEffect(() => {
    if (isContextLoading) {
      return;
    }

    if (metaStatus?.status !== "CONNECTED") {
      setDashboard(null);
      setContents(null);
      setIsDashboardLoading(false);
      setIsContentsLoading(false);
      return;
    }

    void loadDashboard();
  }, [isContextLoading, loadDashboard, metaStatus?.status]);

  useEffect(() => {
    if (isContextLoading) {
      return;
    }

    if (metaStatus?.status !== "CONNECTED") {
      setContents(null);
      setIsContentsLoading(false);
      return;
    }

    void loadContents();
  }, [isContextLoading, loadContents, metaStatus?.status]);

  const activeAccount = useMemo(
    () => matchedAccountFromContext ?? dashboard?.account ?? contents?.account ?? null,
    [contents?.account, dashboard?.account, matchedAccountFromContext],
  );

  const primaryVolumeMetric = useMemo(() => pickPrimaryVolumeMetric(dashboard), [dashboard]);

  const rankingRecords = useMemo(
    () => (dashboard?.ranking ?? []).map((item) => mapContentRecord(item, activeAccount)),
    [activeAccount, dashboard?.ranking],
  );

  const contentRecords = useMemo(
    () => (contents?.data ?? []).map((item) => mapContentRecord(item, activeAccount)),
    [activeAccount, contents?.data],
  );

  const filteredContentRecords = useMemo(() => {
    const normalizedSearch = normalizeSearchText(deferredSearchValue);

    if (!normalizedSearch) {
      return contentRecords;
    }

    return contentRecords.filter((item) =>
      [
        item.title,
        item.excerpt,
        item.sourceId,
        item.sourceLabel,
        item.rawType,
        ...((item.metrics ?? []).map((metric) => `${metric.label} ${metric.value}`)),
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearch)),
    );
  }, [contentRecords, deferredSearchValue]);

  const overviewCards = useMemo<OverviewCardDefinition[]>(() => {
    const nextCards: OverviewCardDefinition[] = [];
    const overview = dashboard?.overview;
    const overviewMetrics = overview?.metrics;
    const overviewClassification = overview?.classification;
    const overviewBenchmark = overview?.performanceBenchmark ?? null;
    const overviewEngagementRate = overviewMetrics?.engagementRate ?? null;
    const audienceGrowth = dashboard?.audienceGrowth ?? null;

    nextCards.push({
      description: "Quantidade total de conteúdos analisados no período selecionado.",
      icon: <FileText className="h-5 w-5" />,
      label: "Conteúdos",
      meta: [
        {
          label: "Classificação",
          value: `${overviewClassification?.aboveAverage ?? 0} acima da média`,
        },
      ],
      numberFormatter: formatInteger,
      toneClassName: "border-primary/18 bg-primary/10 text-primary",
      value: formatInteger(overview?.contentCount ?? 0),
      valueNumber: overview?.contentCount ?? 0,
      valueToneClassName: "text-primary",
    });

    nextCards.push({
      description: "Total consolidado de interações retornado pela API social da Meta.",
      icon: <Heart className="h-5 w-5" />,
      label: "Engajamento",
      meta: [
        {
          label: "Comentários",
          value: formatInteger(overviewMetrics?.comments ?? 0),
        },
      ],
      numberFormatter: formatInteger,
      toneClassName: "border-rose-500/18 bg-rose-500/10 text-rose-500",
      value: formatInteger(overviewMetrics?.engagement ?? 0),
      valueNumber: overviewMetrics?.engagement ?? 0,
      valueToneClassName: "text-rose-500",
    });

    nextCards.push({
      description: primaryVolumeMetric.description,
      icon: <primaryVolumeMetric.icon className="h-5 w-5" />,
      label: primaryVolumeMetric.label,
      meta: overview?.medianViews
        ? [
            {
              label: "Mediana de views",
              value: formatInteger(overview.medianViews),
            },
          ]
        : undefined,
      numberFormatter: formatInteger,
      toneClassName: "border-sky-500/18 bg-sky-500/10 text-sky-500",
      value:
        primaryVolumeMetric.value === null
          ? "Não disponível"
          : formatInteger(primaryVolumeMetric.value),
      valueNumber: primaryVolumeMetric.value ?? undefined,
      valueToneClassName: "text-sky-500",
    });

    nextCards.push({
      description: getPerformanceBenchmarkDescription(overviewBenchmark),
      icon: <TrendingUp className="h-5 w-5" />,
      label: "Benchmark médio",
      meta: [
        {
          label: "Critério",
          value: getPerformanceBenchmarkLabel(overviewBenchmark),
        },
        {
          label: "Abaixo da média",
          value: formatInteger(overviewClassification?.belowAverage ?? 0),
        },
      ],
      numberFormatter:
        overviewBenchmark === "engagementRate" ? formatPercentage : formatInteger,
      toneClassName: "border-amber-500/18 bg-amber-500/10 text-amber-500",
      value: formatBenchmarkValue(overviewBenchmark, overview?.averagePerformanceValue ?? null),
      valueNumber: overview?.averagePerformanceValue ?? undefined,
      valueToneClassName: "text-amber-500",
    });

    if (audienceGrowth) {
      nextCards.push({
        description: "Ganho líquido de seguidores/audiência orgânica retornado pela API para o período.",
        icon: <UsersRound className="h-5 w-5" />,
        label: "Seguidores ganhos",
        meta: [
          {
            label: "Base inicial",
            value: formatInteger(audienceGrowth.startValue),
          },
          {
            label: "Base final",
            value: formatInteger(audienceGrowth.endValue),
          },
          ...(audienceGrowth.growthRate !== null
            ? [
                {
                  label: "Taxa",
                  value: formatSignedPercentage(audienceGrowth.growthRate),
                },
              ]
            : []),
        ],
        numberFormatter: formatSignedInteger,
        toneClassName: "border-emerald-500/18 bg-emerald-500/10 text-emerald-500",
        value: formatSignedInteger(audienceGrowth.delta),
        valueNumber: audienceGrowth.delta,
        valueToneClassName: "text-emerald-500",
      });
    } else {
      nextCards.push({
        description: "Taxa média de engajamento total do período selecionado.",
        icon: <Activity className="h-5 w-5" />,
        label: "Taxa de engajamento",
        toneClassName: "border-violet-500/18 bg-violet-500/10 text-violet-500",
        value:
          overviewEngagementRate === null
            ? "Não disponível"
            : formatPercentage(overviewEngagementRate),
        valueNumber: overviewEngagementRate ?? undefined,
        numberFormatter: formatPercentage,
        valueToneClassName: "text-violet-400",
      });
    }

    return nextCards;
  }, [dashboard, primaryVolumeMetric]);

  const chartRange = useMemo(
    () => resolveChartRange(dashboard?.startDate ?? startDate, dashboard?.endDate ?? endDate),
    [dashboard?.endDate, dashboard?.startDate, endDate, startDate],
  );

  const timeSeriesLabels = useMemo(
    () => (dashboard?.timeSeries ?? []).map((item) => item.bucketStart),
    [dashboard?.timeSeries],
  );

  const lineChartSeries = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return [
      {
        color: primaryVolumeMetric.color,
        label: primaryVolumeMetric.label,
        valueFormatter: formatInteger,
        values: dashboard.timeSeries.map((item) => {
          const metricValue = item.metrics[primaryVolumeMetric.key];
          return typeof metricValue === "number" ? metricValue : 0;
        }),
      },
      {
        color: "#8b5cf6",
        label: "Engajamento",
        valueFormatter: formatInteger,
        values: dashboard.timeSeries.map((item) => item.metrics.engagement),
      },
    ];
  }, [dashboard, primaryVolumeMetric.color, primaryVolumeMetric.key, primaryVolumeMetric.label]);

  const comparisonCards = useMemo(() => {
    const benchmarkComparison = getComparisonMetricByBenchmark(dashboard);

    return [
      {
        description: "Comparação do volume de conteúdos publicados entre o período atual e o anterior.",
        label: "Conteúdos",
        metric: dashboard?.comparison.contentCount ?? {
          current: null,
          delta: null,
          deltaPercentage: null,
          previous: null,
        },
        valueFormatter: formatInteger,
      },
      {
        description: "Comparação do total de engajamento consolidado pela API social da Meta.",
        label: "Engajamento",
        metric: dashboard?.comparison.engagement ?? {
          current: null,
          delta: null,
          deltaPercentage: null,
          previous: null,
        },
        valueFormatter: formatInteger,
      },
      {
        description: `Comparação de ${primaryVolumeMetric.label.toLowerCase()} contra o período imediatamente anterior.`,
        label: primaryVolumeMetric.label,
        metric:
          dashboard?.comparison[primaryVolumeMetric.key] ?? {
            current: null,
            delta: null,
            deltaPercentage: null,
            previous: null,
          },
        valueFormatter: formatInteger,
      },
      {
        description: `Comparação do benchmark principal: ${benchmarkComparison.label.toLowerCase()}.`,
        label: benchmarkComparison.label,
        metric: benchmarkComparison.metric,
        valueFormatter: benchmarkComparison.valueFormatter,
      },
    ] satisfies ComparisonCardDefinition[];
  }, [dashboard, primaryVolumeMetric.label, primaryVolumeMetric.key]);

  const weeklyPublicationCards = useMemo(
    () => (dashboard?.weeklyPublicationVolume ?? []).slice(-6),
    [dashboard?.weeklyPublicationVolume],
  );

  const activePlatforms = activeAccount?.platforms ?? [];
  const accountPlatformLabel = resolvePlatformLabel(activeAccount);
  const patternItems = useMemo(() => {
    const overviewBenchmark = dashboard?.overview.performanceBenchmark ?? null;
    const bestDayOfWeek = dashboard?.bestDayOfWeek ?? null;
    const bestHourOfDay = dashboard?.bestHourOfDay ?? null;
    const audienceGrowth = dashboard?.audienceGrowth ?? null;

    return [
      {
        description: bestDayOfWeek
          ? `${formatInteger(bestDayOfWeek.contentCount)} publicação(ões) com média de ${formatBenchmarkValue(
              overviewBenchmark,
              bestDayOfWeek.averagePerformanceValue,
            )}.`
          : "A API ainda não retornou um melhor dia da semana para a conta.",
        label: "Melhor dia",
        value: bestDayOfWeek?.label ?? "Não identificado",
      },
      {
        description: bestHourOfDay
          ? `${formatInteger(bestHourOfDay.contentCount)} publicação(ões) com média de ${formatBenchmarkValue(
              overviewBenchmark,
              bestHourOfDay.averagePerformanceValue,
            )}.`
          : "A API ainda não retornou um melhor horário para a conta.",
        label: "Melhor horário",
        value: bestHourOfDay?.label ?? "Não identificado",
      },
      {
        description: audienceGrowth
          ? `De ${formatInteger(audienceGrowth.startValue)} para ${formatInteger(
              audienceGrowth.endValue,
            )} no recorte selecionado${
              audienceGrowth.growthRate !== null
                ? `, com variação de ${formatSignedPercentage(audienceGrowth.growthRate)}.`
                : "."
            }`
          : "Sem dado confiável de ganho de seguidores disponível para o período.",
        label: "Seguidores ganhos",
        value: audienceGrowth ? formatSignedInteger(audienceGrowth.delta) : "Não disponível",
      },
      {
        description: audienceGrowth
          ? `Fonte do crescimento orgânico: ${audienceGrowth.source}.`
          : "A API não informou a origem da série de seguidores para esta conta.",
        label: "Base final",
        value: audienceGrowth ? formatInteger(audienceGrowth.endValue) : "Não disponível",
      },
      {
        description:
          "Distribuição dos conteúdos classificados acima, abaixo ou sem benchmark comparável.",
        label: "Classificação",
        value: `${formatInteger(dashboard?.overview.classification.aboveAverage ?? 0)} acima`,
      },
    ];
  }, [dashboard]);
  const exportFilterHighlights = useMemo(() => {
    const nextItems = [
      `Granularidade ${getGranularityLabel(granularity)}`,
      `Tipo ${contentTypeFilter === "all" ? "Todos" : getContentTypeLabel(contentTypeFilter)}`,
      `Ordenação ${getContentOrderByLabel(orderBy)} (${getContentOrderDirectionLabel(orderDirection).toLowerCase()})`,
      `Ranking Top ${rankingLimit}`,
      `Página ${contents?.meta.page ?? page} de ${contents?.meta.totalPages ?? 1}`,
    ];
    const normalizedSearch = deferredSearchValue.trim();

    if (normalizedSearch) {
      nextItems.push(`Busca "${normalizedSearch}"`);
    }

    return nextItems;
  }, [
    contentTypeFilter,
    contents?.meta.page,
    contents?.meta.totalPages,
    deferredSearchValue,
    granularity,
    orderBy,
    orderDirection,
    page,
    rankingLimit,
  ]);
  const isRefreshingContext = isContextLoading || isDashboardLoading || isContentsLoading;
  const canExportPdf =
    Boolean(activeAccount && dashboard && contents) &&
    !hasInvalidDateRange &&
    !isRefreshingContext &&
    !dashboardError &&
    !contentsError;

  const handleRefresh = useCallback(() => {
    void loadContext();
    void loadDashboard();
    void loadContents();
  }, [loadContext, loadDashboard, loadContents]);

  const handleExportPdf = useCallback(() => {
    if (hasInvalidDateRange) {
      toast.error({
        title: "PDF indisponível",
        description: "Ajuste o intervalo de datas antes de exportar o dashboard social.",
      });
      return;
    }

    if (!activeAccount || !dashboard || !contents || isRefreshingContext) {
      toast.error({
        title: "PDF indisponível",
        description: "Aguarde o carregamento completo do dashboard social antes de exportar.",
      });
      return;
    }

    setIsExportingPdf(true);

    try {
      const generatedAt = formatDateTime(new Date().toISOString());
      const benchmarkLabel = getPerformanceBenchmarkLabel(dashboard.overview.performanceBenchmark);
      const benchmarkValue = formatBenchmarkValue(
        dashboard.overview.performanceBenchmark,
        dashboard.overview.averagePerformanceValue,
      );
      const accentByLabel: Record<string, string> = {
        "Benchmark médio": "#f59e0b",
        "Conteúdos": "#2262f0",
        "Engajamento": "#e11d48",
        "Seguidores ganhos": "#059669",
        "Taxa de engajamento": "#7c3aed",
      };
      accentByLabel[primaryVolumeMetric.label] = primaryVolumeMetric.color;

      const summaryCardsForPdf = overviewCards.map((item) => ({
        accent: accentByLabel[item.label] ?? "#2262f0",
        description: item.description,
        label: item.label,
        meta: item.meta,
        value: item.value,
      }));

      const comparisonItems = comparisonCards.map((item) => {
        const deltaReference = item.metric.deltaPercentage ?? item.metric.delta ?? 0;

        return {
          currentValue:
            item.metric.current === null ? "Sem dado" : item.valueFormatter(item.metric.current),
          deltaToneClassName:
            deltaReference > 0
              ? "positive"
              : deltaReference < 0
                ? "negative"
                : "neutral",
          deltaValue:
            item.metric.deltaPercentage !== null
              ? formatSignedPercentage(item.metric.deltaPercentage)
              : item.metric.delta !== null
                ? formatSignedValue(item.metric.delta, item.valueFormatter)
                : "Sem variação",
          description: item.description,
          label: item.label,
          previousValue:
            item.metric.previous === null ? "Sem base" : item.valueFormatter(item.metric.previous),
        } as const;
      });

      const rankingItems = rankingRecords.slice(0, rankingLimit).map((item) => {
        const benchmarkMetric =
          item.metrics?.find((metric) => metric.label === benchmarkLabel) ??
          item.metrics?.find((metric) => metric.label === "Taxa") ??
          item.metrics?.find((metric) => metric.label === "Engajamento") ??
          item.metrics?.[0];
        const classificationMetric = item.metrics?.find((metric) => metric.label === "Classificação");

        return {
          classification: classificationMetric?.value ?? "Sem classificação",
          performanceLabel: benchmarkMetric?.label ?? benchmarkLabel,
          performanceValue: benchmarkMetric?.value ?? "Não disponível",
          publishedAt: formatDateTime(item.publishedAt),
          sourceLabel: item.sourceLabel,
          title: item.title,
        };
      });

      const contentRows = filteredContentRecords.map((item) => ({
        format: item.rawType || getContentTypeLabel(item.kind === "instagram_post" || item.kind === "facebook_post" ? "post" : item.kind),
        metrics:
          item.metrics && item.metrics.length > 0
            ? item.metrics
                .slice(0, 4)
                .map((metric) => `${metric.label}: ${metric.value}`)
                .join(" • ")
            : "Sem métricas complementares",
        platform: item.platform === "instagram" ? "Instagram" : "Facebook",
        publishedAt: formatDateTime(item.publishedAt),
        source: item.sourceLabel,
        title: item.title,
      }));

      const contentSummaryLabel =
        contents.meta.total > 0
          ? `A exportação inclui ${formatInteger(filteredContentRecords.length)} item(ns) visíveis na página ${contents.meta.page} de ${contents.meta.totalPages}, dentro de um total de ${formatInteger(contents.meta.total)} retornado pela API.`
          : "A biblioteca não retornou conteúdos para o recorte atual.";
      const platformSummary =
        activePlatforms.length > 0
          ? activePlatforms
              .map((platform) =>
                platform.platform === "instagram"
                  ? platform.username
                    ? `Instagram @${platform.username}`
                    : "Instagram"
                  : platform.displayName || "Facebook",
              )
              .join(" • ")
          : accountPlatformLabel;
      const html = buildSocialDashboardPdfHtml({
        accountId: activeAccount.id,
        accountName: activeAccount.displayName,
        benchmarkLabel,
        benchmarkValue,
        chartRange,
        comparisonItems,
        contentRows,
        contentSummaryLabel,
        currentPeriodLabel: formatDateRangeLabel(dashboard.startDate, dashboard.endDate),
        filterHighlights: exportFilterHighlights,
        generatedAt,
        patternItems,
        platformLabel: platformSummary,
        rankingItems,
        summaryCards: summaryCardsForPdf,
        timelineLabels: timeSeriesLabels,
        timelineSeries: lineChartSeries,
        timezone: dashboard.timezone || resolvedTimezone,
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
                  : "Não foi possível iniciar a impressão do relatório social.",
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
            : "Não foi possível montar o relatório do dashboard social agora.",
      });
    }
  }, [
    accountPlatformLabel,
    activeAccount,
    activePlatforms,
    canExportPdf,
    chartRange,
    comparisonCards,
    contents,
    exportFilterHighlights,
    filteredContentRecords,
    hasInvalidDateRange,
    isRefreshingContext,
    lineChartSeries,
    overviewCards,
    patternItems,
    primaryVolumeMetric.color,
    primaryVolumeMetric.label,
    rankingLimit,
    rankingRecords,
    resolvedTimezone,
    timeSeriesLabels,
    toast,
    dashboard,
  ]);

  if (isContextLoading && !metaStatus) {
    return (
      <StateCard
        description="Estamos carregando a conexão Meta, a conta social selecionada e os dados do dashboard consolidado."
        title="Preparando o dashboard social"
      />
    );
  }

  if (!metaStatus && contextError) {
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
        description={contextError}
        title="Não foi possível preparar a conta social"
      />
    );
  }

  if (metaStatus?.status === "NOT_CONNECTED") {
    return (
      <StateCard
        action={(
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            onClick={() => navigate("/painel/contas-integracao/meta")}
            type="button"
          >
            Ir para Contas e integrações
          </button>
        )}
        description="A integração Meta ainda não está conectada. Assim que a conexão estiver ativa, o dashboard social consolidado ficará disponível."
        title="Conecte a Meta para abrir o dashboard"
      />
    );
  }

  if (metaStatus && panelMetaStatusNeedsReconnect(metaStatus.status)) {
    return (
      <StateCard
        action={(
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            onClick={() => navigate("/painel/contas-integracao/meta")}
            type="button"
          >
            Revisar integração
          </button>
        )}
        description={getPanelMetaStatusDescription(metaStatus.status)}
        title={`Operação Meta em atenção: ${getPanelMetaStatusLabel(metaStatus.status)}`}
      />
    );
  }

  if (metaStatus?.status === "CONNECTED" && !isContextLoading && accounts.length === 0 && !activeAccount) {
    return (
      <StateCard
        action={(
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/16 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
            onClick={() => navigate("/painel/social-media/meta")}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para contas
          </button>
        )}
        description="A conexão Meta está ativa, mas nenhuma conta social foi retornada para esta operação neste momento."
        title="Nenhuma conta social disponível"
      />
    );
  }

  if (!activeAccount && !isDashboardLoading && !isContentsLoading) {
    return (
      <StateCard
        action={(
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/16 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
            onClick={() => navigate("/painel/social-media/meta")}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para contas
          </button>
        )}
        description={`A conta/página ${resolvedRouteIdentifier} não foi encontrada entre as contas sociais disponíveis para a conexão atual.`}
        title="Conta social indisponível"
      />
    );
  }

  return (
    <>
      <Seo
        description={`Dashboard social Meta da conta ${activeAccount?.displayName ?? resolvedRouteIdentifier}, com visão consolidada, comparativos, ranking e conteúdos normalizados.`}
        noindex
        path={location.pathname}
        structuredData={null}
        title={`Social Media • ${activeAccount?.displayName ?? "Meta"}`}
      />

      <div className="space-y-6">
        <PanelPageHeader
          actions={(
            <>
              {metaStatus ? <MetaStatusBadge status={metaStatus.status} /> : null}
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-rose-500/18 bg-rose-500/10 px-4 text-sm font-semibold text-rose-500 transition-colors hover:border-rose-500/30 hover:bg-rose-500/14 disabled:cursor-not-allowed disabled:opacity-55"
                disabled={!canExportPdf || isExportingPdf}
                onClick={handleExportPdf}
                type="button"
              >
                <FileDown className="h-4 w-4" />
                {isExportingPdf ? "Preparando PDF..." : "Exportar PDF"}
              </button>
              <button
                className="panel-card-muted inline-flex h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                onClick={handleRefresh}
                type="button"
              >
                <RefreshCcw className={`h-4 w-4 ${isDashboardLoading || isContentsLoading ? "animate-spin" : ""}`} />
                Atualizar
              </button>
            </>
          )}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Social media", to: "/painel/social-media/meta" },
            { label: "Meta", to: "/painel/social-media/meta" },
            { label: activeAccount?.displayName ?? "Conta social" },
          ]}
          description="Dashboard reconstruído com os endpoints unificados de social media da Meta: contas, visão consolidada e biblioteca de conteúdos normalizados."
          title={activeAccount?.displayName ?? "Conta social Meta"}
        />

        <section className="panel-card relative overflow-hidden rounded-[2.2rem] border px-5 py-6 md:px-6 md:py-7">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[30rem] max-w-full bg-[radial-gradient(circle_at_top_right,rgba(34,98,240,0.16),transparent_58%)]" />

          <div className="relative z-10 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-primary/16 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em] text-primary">
                  {accountPlatformLabel}
                </span>
                {activePlatforms.map((platform) => (
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em] ${
                      platform.platform === "instagram"
                        ? "border-fuchsia-500/18 bg-fuchsia-500/10 text-fuchsia-500"
                        : "border-sky-500/18 bg-sky-500/10 text-sky-500"
                    }`}
                    key={`${platform.platform}-${platform.externalId}`}
                  >
                    {platform.platform === "instagram"
                      ? platform.username
                        ? `@${platform.username}`
                        : "Instagram"
                      : "Facebook"}
                  </span>
                ))}
                <span className="rounded-full border border-outline-variant/12 bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em] text-on-surface-variant">
                  {activeAccount?.relation.linked ? "Canais vinculados" : "Conta individual"}
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-on-surface md:text-4xl">
                {activeAccount?.displayName ?? "Conta social Meta"}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant md:text-base">
                Esta leitura usa o contrato novo de social media da Meta para combinar visão geral,
                comparação contra período anterior, melhores janelas de publicação, ranking e uma
                biblioteca normalizada de conteúdos.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  className="panel-card-muted inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                  onClick={() => navigate("/painel/social-media/meta")}
                  type="button"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para contas
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="panel-card-muted rounded-[1.5rem] border p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                  Conta unificada
                </p>
                <p className="mt-3 text-lg font-semibold text-on-surface">
                  {activeAccount?.id ?? resolvedQueryAccountId}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {activeAccount?.pageId
                    ? `Página ${activeAccount.pageId}`
                    : activeAccount?.instagramAccountId
                      ? `Instagram ${activeAccount.instagramAccountId}`
                      : "Identificador consolidado da conta"}
                </p>
              </div>

              <div className="panel-card-muted rounded-[1.5rem] border p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                  Janela analisada
                </p>
                <p className="mt-3 text-lg font-semibold text-on-surface">
                  {formatDateRangeLabel(dashboard?.startDate ?? startDate, dashboard?.endDate ?? endDate)}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Timezone {dashboard?.timezone ?? resolvedTimezone}
                </p>
              </div>

              <div className="panel-card-muted rounded-[1.5rem] border p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                  Benchmark principal
                </p>
                <p className="mt-3 text-lg font-semibold text-on-surface">
                  {getPerformanceBenchmarkLabel(dashboard?.overview.performanceBenchmark ?? null)}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {formatBenchmarkValue(
                    dashboard?.overview.performanceBenchmark ?? null,
                    dashboard?.overview.averagePerformanceValue ?? null,
                  )}
                </p>
              </div>

              <div className="panel-card-muted rounded-[1.5rem] border p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                  Biblioteca
                </p>
                <p className="mt-3 text-lg font-semibold text-on-surface">
                  {contents?.summary.totalContents
                    ? `${formatInteger(contents.summary.totalContents)} conteúdos`
                    : "Sem conteúdos"}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Ordenação em {orderBy} • página {contents?.meta.page ?? page}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="panel-card rounded-[2rem] border p-5 md:p-6">
          <div className="grid gap-4 xl:grid-cols-6">
            <div className="xl:col-span-2">
              <AppInput
                className="py-0"
                label="Busca local"
                leadingIcon={<Search className="h-4 w-4" />}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Buscar por legenda, ID, origem, tipo ou performance"
                value={searchValue}
                wrapperClassName="h-12 rounded-[1.2rem]"
              />
            </div>

            <AppSelect
              label="Granularidade"
              onChange={(event) => setGranularity(event.target.value as "auto" | "day" | "week")}
              value={granularity}
            >
              <option value="auto">Automática</option>
              <option value="day">Diária</option>
              <option value="week">Semanal</option>
            </AppSelect>

            <AppSelect
              label="Tipo de conteúdo"
              onChange={(event) => setContentTypeFilter(event.target.value as ContentTypeFilter)}
              value={contentTypeFilter}
            >
              <option value="all">Todos</option>
              <option value="post">Post</option>
              <option value="reel">Reel</option>
              <option value="video">Vídeo</option>
              <option value="image">Imagem</option>
              <option value="carousel">Carrossel</option>
              <option value="story">Story</option>
              <option value="other">Outros</option>
            </AppSelect>

            <AppInput
              label="Data inicial"
              onChange={(event) => setStartDate(event.target.value)}
              type="date"
              value={startDate}
            />

            <AppInput
              label="Data final"
              onChange={(event) => setEndDate(event.target.value)}
              type="date"
              value={endDate}
            />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-4">
            <AppSelect
              label="Ordenar conteúdos por"
              onChange={(event) => setOrderBy(event.target.value as PanelMetaSocialMediaContentOrderBy)}
              value={orderBy}
            >
              <option value="publishedAt">Data de publicação</option>
              <option value="engagementRate">Taxa de engajamento</option>
              <option value="engagement">Engajamento</option>
              <option value="reach">Alcance</option>
              <option value="views">Visualizações</option>
              <option value="impressions">Impressões</option>
              <option value="likes">Curtidas</option>
              <option value="comments">Comentários</option>
              <option value="shares">Compartilhamentos</option>
              <option value="saves">Salvos</option>
            </AppSelect>

            <AppSelect
              label="Direção"
              onChange={(event) =>
                setOrderDirection(event.target.value as PanelMetaSocialMediaContentOrderDirection)
              }
              value={orderDirection}
            >
              <option value="desc">Maior para menor</option>
              <option value="asc">Menor para maior</option>
            </AppSelect>

            <AppSelect
              label="Ranking do topo"
              onChange={(event) => setRankingLimit(Number(event.target.value))}
              value={String(rankingLimit)}
            >
              <option value="5">Top 5</option>
              <option value="6">Top 6</option>
              <option value="8">Top 8</option>
              <option value="10">Top 10</option>
            </AppSelect>

            <AppSelect
              label="Itens por página"
              onChange={(event) => setPageSize(Number(event.target.value))}
              value={String(pageSize)}
            >
              <option value="12">12 itens</option>
              <option value="20">20 itens</option>
              <option value="40">40 itens</option>
            </AppSelect>
          </div>

          <div className="mt-4 rounded-[1.2rem] border border-outline-variant/12 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
            Leitura em <span className="font-semibold text-on-surface">{accountPlatformLabel}</span> •{" "}
            <span className="font-semibold text-on-surface">
              {formatDateRangeLabel(startDate, endDate)}
            </span>{" "}
            • timezone{" "}
            <span className="font-semibold text-on-surface">{resolvedTimezone}</span> • ordenação por{" "}
            <span className="font-semibold text-on-surface">{orderBy}</span>.
          </div>
        </section>

        {hasInvalidDateRange ? (
          <section className="panel-card rounded-[1.8rem] border border-red-500/14 bg-red-500/6 px-5 py-4">
            <p className="text-sm font-semibold text-on-surface">
              Ajuste o intervalo de datas para continuar
            </p>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
              A data inicial precisa ser menor ou igual à data final antes de consultar o dashboard.
            </p>
          </section>
        ) : null}

        {contextError ? (
          <section className="panel-card rounded-[1.8rem] border border-amber-500/14 bg-amber-500/6 px-5 py-4">
            <p className="text-sm font-semibold text-on-surface">
              O contexto de contas foi carregado com atenção
            </p>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{contextError}</p>
          </section>
        ) : null}

        {dashboardError ? (
          <section className="panel-card rounded-[1.8rem] border border-amber-500/14 bg-amber-500/6 px-5 py-4">
            <p className="text-sm font-semibold text-on-surface">
              O dashboard consolidado não foi carregado por completo
            </p>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{dashboardError}</p>
          </section>
        ) : null}

        {contentsError ? (
          <section className="panel-card rounded-[1.8rem] border border-amber-500/14 bg-amber-500/6 px-5 py-4">
            <p className="text-sm font-semibold text-on-surface">
              A biblioteca de conteúdos não foi carregada por completo
            </p>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{contentsError}</p>
          </section>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          {overviewCards.map((item) => (
            <PanelMetricCard
              description={item.description}
              icon={item.icon}
              key={item.label}
              label={item.label}
              loading={isDashboardLoading}
              meta={item.meta}
              numberFormatter={item.numberFormatter}
              toneClassName={item.toneClassName}
              value={item.value}
              valueNumber={item.valueNumber}
              valueToneClassName={item.valueToneClassName}
            />
          ))}
        </section>

        <PanelAnalyticsCard
          description="Evolução temporal do principal indicador de distribuição da conta e do engajamento consolidado no período selecionado."
          eyebrow="Timeline"
          title="Linha do tempo social"
        >
          <PanelLineChart
            labels={timeSeriesLabels}
            loading={isDashboardLoading}
            range={chartRange}
            series={lineChartSeries}
          />

          {!isDashboardLoading ? (
            <div className="mt-5 grid gap-3 border-t border-outline-variant/10 pt-5 md:grid-cols-2 xl:grid-cols-3">
              {weeklyPublicationCards.length > 0 ? (
                weeklyPublicationCards.map((item) => (
                  <div className="panel-card-muted rounded-[1.25rem] border p-4" key={item.weekStart}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                      Semana
                    </p>
                    <p className="mt-2 text-sm font-semibold text-on-surface">
                      {formatCompactDate(item.weekStart)} a {formatCompactDate(item.weekEnd)}
                    </p>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      {formatInteger(item.contentCount)} publicação(ões)
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-outline-variant/16 px-4 py-6 text-sm text-on-surface-variant md:col-span-2 xl:col-span-3">
                  A API ainda não retornou volume semanal de publicação para este recorte.
                </div>
              )}
            </div>
          ) : null}
        </PanelAnalyticsCard>

        <PanelAnalyticsCard
          description={`Comparação do período atual contra ${formatDateRangeLabel(
            dashboard?.comparison.previousStartDate,
            dashboard?.comparison.previousEndDate,
          )}.`}
          eyebrow="Comparativo"
          title="Período anterior"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {comparisonCards.map((item) => (
              <ComparisonCard
                description={item.description}
                key={item.label}
                label={item.label}
                metric={item.metric}
                valueFormatter={item.valueFormatter}
              />
            ))}
          </div>
        </PanelAnalyticsCard>

        <PanelAnalyticsCard
          description="Leituras complementares para entender padrões de publicação, melhores janelas e distribuição por formatos."
          eyebrow="Padrões"
          title="Comportamento do conteúdo"
        >
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <PatternCard
              description={
                dashboard?.bestDayOfWeek
                  ? `${formatInteger(dashboard.bestDayOfWeek.contentCount)} publicação(ões) com média de ${formatBenchmarkValue(
                      dashboard.overview.performanceBenchmark,
                      dashboard.bestDayOfWeek.averagePerformanceValue,
                    )}.`
                  : "A API ainda não retornou um melhor dia da semana para a conta."
              }
              icon={CalendarDays}
              title="Melhor dia"
              value={dashboard?.bestDayOfWeek?.label ?? "Não identificado"}
            />
            <PatternCard
              description={
                dashboard?.bestHourOfDay
                  ? `${formatInteger(dashboard.bestHourOfDay.contentCount)} publicação(ões) com média de ${formatBenchmarkValue(
                      dashboard.overview.performanceBenchmark,
                      dashboard.bestHourOfDay.averagePerformanceValue,
                    )}.`
                  : "A API ainda não retornou um melhor horário para a conta."
              }
              icon={Clock3}
              title="Melhor horário"
              value={dashboard?.bestHourOfDay?.label ?? "Não identificado"}
            />
            <PatternCard
              description={
                dashboard?.audienceGrowth
                  ? `De ${formatInteger(dashboard.audienceGrowth.startValue)} para ${formatInteger(
                      dashboard.audienceGrowth.endValue,
                    )} no recorte selecionado${
                      dashboard.audienceGrowth.growthRate !== null
                        ? `, com variação de ${formatSignedPercentage(dashboard.audienceGrowth.growthRate)}.`
                        : "."
                    }`
                  : "Sem dado confiável de ganho de seguidores disponível para o período."
              }
              icon={UsersRound}
              title="Seguidores ganhos"
              value={
                dashboard?.audienceGrowth
                  ? formatSignedInteger(dashboard.audienceGrowth.delta)
                  : "Não disponível"
              }
            />
            <PatternCard
              description={
                dashboard?.audienceGrowth
                  ? `Fonte do crescimento orgânico: ${dashboard.audienceGrowth.source}.`
                  : "A API não informou a origem da série de seguidores para esta conta."
              }
              icon={TrendingUp}
              title="Base final"
              value={
                dashboard?.audienceGrowth
                  ? formatInteger(dashboard.audienceGrowth.endValue)
                    : "Não disponível"
              }
            />
            <PatternCard
              description="Distribuição dos conteúdos classificados acima, abaixo ou sem benchmark comparável."
              icon={BarChart3}
              title="Classificação"
              value={`${formatInteger(dashboard?.overview.classification.aboveAverage ?? 0)} acima`}
            />
          </div>

          {!isDashboardLoading ? (
            <div className="mt-5 grid gap-3 border-t border-outline-variant/10 pt-5 md:grid-cols-2 xl:grid-cols-3">
              {(dashboard?.engagementRateByContentType ?? dashboard?.overview.contentByType ?? []).length > 0 ? (
                (dashboard?.engagementRateByContentType ?? dashboard?.overview.contentByType ?? []).map((item) => (
                  <div className="panel-card-muted rounded-[1.25rem] border p-4" key={item.contentType}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                      {getContentTypeLabel(item.contentType)}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-on-surface">
                      {formatInteger(item.contentCount)} conteúdo(s)
                    </p>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      Engajamento médio:{" "}
                      <span className="font-semibold text-on-surface">
                        {item.averageEngagementRate === null
                          ? "Não disponível"
                          : formatPercentage(item.averageEngagementRate)}
                      </span>
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-outline-variant/16 px-4 py-6 text-sm text-on-surface-variant md:col-span-2 xl:col-span-3">
                  Nenhuma distribuição por tipo de conteúdo foi retornada para este recorte.
                </div>
              )}
            </div>
          ) : null}
        </PanelAnalyticsCard>

        <PanelAnalyticsCard
          description="Conteúdos com melhor performance conforme o ranking retornado pelo dashboard consolidado."
          eyebrow="Ranking"
          title="Destaques do período"
        >
          <PanelSocialMediaHighlightsGrid
            isLoading={isDashboardLoading}
            items={rankingRecords.slice(0, rankingLimit)}
          />
        </PanelAnalyticsCard>

        <div className="space-y-4">
          <PanelSocialMediaContentTable
            isLoading={isContentsLoading}
            items={filteredContentRecords}
          />

          <section className="panel-card rounded-[1.75rem] border px-5 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-on-surface-variant">
                {contents?.meta.total ? (
                  <>
                    Exibindo{" "}
                    <span className="font-semibold text-on-surface">
                      {filteredContentRecords.length}
                    </span>{" "}
                    item(ns) na página atual de um total de{" "}
                    <span className="font-semibold text-on-surface">
                      {formatInteger(contents.meta.total)}
                    </span>
                    .
                  </>
                ) : (
                  "A paginação ficará disponível assim que a API retornar conteúdos para a conta."
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-on-surface-variant">
                  Página {contents?.meta.page ?? page} de {contents?.meta.totalPages ?? 1}
                </span>
                <button
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-outline-variant/16 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={isContentsLoading || (contents?.meta.page ?? page) <= 1}
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  type="button"
                >
                  Anterior
                </button>
                <button
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-outline-variant/16 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={
                    isContentsLoading ||
                    (contents?.meta.totalPages ?? 1) <= (contents?.meta.page ?? page)
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.min(current + 1, contents?.meta.totalPages ?? current + 1),
                    )
                  }
                  type="button"
                >
                  Próxima
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
