import {
  ArrowLeft,
  BarChart3,
  Check,
  Camera,
  Eye,
  EyeOff,
  FileDown,
  Globe2,
  Image as ImageIcon,
  Link2,
  LayoutGrid,
  LoaderCircle,
  MessageSquareText,
  Send,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { PanelAnalyticsCard } from "../../components/painel/PanelAnalyticsCard";
import { PanelLineChart } from "../../components/painel/PanelLineChart";
import { PanelMetricCard } from "../../components/painel/PanelMetricCard";
import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { PanelSocialMediaPostPicker } from "../../components/painel/PanelSocialMediaPostPicker";
import {
  PanelSocialMediaContentTable,
  type PanelSocialMediaContentRecord,
} from "../../components/painel/PanelSocialMediaContentTable";
import { PanelSocialMediaHighlightsGrid } from "../../components/painel/PanelSocialMediaHighlightsGrid";
import { Seo } from "../../components/shared/Seo";
import { AppInput } from "../../components/shared/ui/AppInput";
import { AppSelect } from "../../components/shared/ui/AppSelect";
import { AppTextarea } from "../../components/shared/ui/AppTextarea";
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
import {
  deletePanelMetaInstagramComment,
  listPanelMetaInstagramBusinessAccounts,
  listPanelMetaInstagramComments,
  listPanelMetaInstagramInsights,
  listPanelMetaPageInsights,
  listPanelMetaSocialInstagramAccounts,
  listPanelMetaSocialInstagramMedia,
  listPanelMetaSocialPagePosts,
  listPanelMetaSocialPages,
  publishPanelMetaInstagramMedia,
  publishPanelMetaPagePost,
  replyPanelMetaInstagramComment,
  resolvePanelMetaSocialInstagramSources,
  updatePanelMetaInstagramCommentVisibility,
  type PanelMetaInstagramBusinessAccountRecord,
  type PanelMetaInstagramCommentRecord,
  type PanelMetaInstagramInsightsRecord,
  type PanelMetaPageInsightsRecord,
  type PanelMetaSocialInsightMetricRecord,
  type PanelMetaSocialInsightPeriod,
  type PanelMetaSocialInstagramAccountRecord,
  type PanelMetaSocialInstagramMediaRecord,
  type PanelMetaSocialInstagramSourceRecord,
  type PanelMetaSocialPagePostRecord,
  type PanelMetaSocialPageRecord,
  type PanelSocialMediaContentKind,
  type PanelSocialMediaMediaKind,
  type PanelSocialMediaPlatform,
} from "../../services/painel/social-media-api";

type PlatformFilter = PanelSocialMediaPlatform | "all";

type InstagramMediaEntry = {
  account: PanelMetaSocialInstagramSourceRecord;
  media: PanelMetaSocialInstagramMediaRecord;
};

type InsightMetricCardDefinition = {
  description: string;
  icon: ReactNode;
  label: string;
  toneClassName: string;
  valueNumber: number;
  valueToneClassName: string;
};

const DEFAULT_INSIGHT_PERIOD: PanelMetaSocialInsightPeriod = "day";
const CURRENT_INSIGHT_BUCKET_KEY = "__current__";

function toDateInputValue(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
    value.getDate(),
  ).padStart(2, "0")}`;
}

function getDefaultInsightRange() {
  const today = new Date();
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 29);

  return {
    endDate: toDateInputValue(endDate),
    startDate: toDateInputValue(startDate),
  };
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Nao disponivel";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Nao disponivel";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

function formatCompactDate(value: string | null) {
  if (!value) {
    return "Nao disponivel";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Nao disponivel";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

function formatInsightWindowLabel(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  period: PanelMetaSocialInsightPeriod,
) {
  if (period === "lifetime") {
    return "Acumulado vitalicio";
  }

  const normalizedStartDate = startDate?.trim() || null;
  const normalizedEndDate = endDate?.trim() || null;

  if (normalizedStartDate && normalizedEndDate) {
    return `${formatCompactDate(normalizedStartDate)} a ${formatCompactDate(normalizedEndDate)}`;
  }

  if (normalizedStartDate) {
    return `A partir de ${formatCompactDate(normalizedStartDate)}`;
  }

  if (normalizedEndDate) {
    return `Ate ${formatCompactDate(normalizedEndDate)}`;
  }

  return "Ultimos 30 dias";
}

function resolveInsightPeriodLabel(period: PanelMetaSocialInsightPeriod) {
  switch (period) {
    case "week":
      return "Semanal";
    case "days_28":
      return "28 dias";
    case "lifetime":
      return "Lifetime";
    default:
      return "Diario";
  }
}

function formatInteger(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function createContentTitle(value: string | null, fallback: string) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return fallback;
  }

  return normalizedValue.length > 110
    ? `${normalizedValue.slice(0, 107).trimEnd()}...`
    : normalizedValue;
}

function getInstagramSourceLabel(source: PanelMetaSocialInstagramSourceRecord) {
  if (source.username) {
    return `@${source.username}`;
  }

  if (source.name) {
    return source.name;
  }

  return `Instagram ${source.instagramAccountId}`;
}

function getInstagramMediaSelectionLabel(entry: InstagramMediaEntry) {
  return `${getInstagramSourceLabel(entry.account)} • ${formatCompactDate(entry.media.timestamp)} • ${createContentTitle(
    entry.media.caption,
    "Midia do Instagram",
  )}`;
}

function normalizeSearchText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function resolveFacebookMediaKind(post: PanelMetaSocialPagePostRecord): PanelSocialMediaMediaKind {
  const normalizedStatus = post.statusType?.trim().toLowerCase() ?? "";

  if (normalizedStatus.includes("video")) {
    return "video";
  }

  if (post.fullPictureUrl) {
    return "photo";
  }

  return "post";
}

function resolveInstagramContentKind(mediaType: string | null): PanelSocialMediaContentKind {
  const normalizedType = mediaType?.trim().toUpperCase() ?? "";

  return normalizedType.includes("REEL") ? "reel" : "instagram_post";
}

function resolveInstagramMediaKind(mediaType: string | null): PanelSocialMediaMediaKind {
  const normalizedType = mediaType?.trim().toUpperCase() ?? "";

  if (normalizedType.includes("REEL")) {
    return "reel";
  }

  if (normalizedType.includes("CAROUSEL")) {
    return "carousel";
  }

  if (normalizedType.includes("VIDEO")) {
    return "video";
  }

  if (normalizedType.includes("IMAGE") || normalizedType.includes("PHOTO")) {
    return "photo";
  }

  return "unknown";
}

function getLatestPublishedAt(items: PanelSocialMediaContentRecord[]) {
  if (items.length === 0) {
    return null;
  }

  return [...items]
    .map((item) => item.publishedAt)
    .filter((value): value is string => Boolean(value))
    .sort((first, second) => new Date(second).getTime() - new Date(first).getTime())[0] ?? null;
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

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage;
}

function sortInsightBuckets(first: string, second: string) {
  if (first === CURRENT_INSIGHT_BUCKET_KEY) {
    return 1;
  }

  if (second === CURRENT_INSIGHT_BUCKET_KEY) {
    return -1;
  }

  return new Date(first).getTime() - new Date(second).getTime();
}

function getInsightBucketKey(endTime: string | null) {
  return endTime ?? CURRENT_INSIGHT_BUCKET_KEY;
}

function getLatestMetricValue(metric: PanelMetaSocialInsightMetricRecord | null | undefined) {
  if (!metric) {
    return 0;
  }

  const latestMetricValue = [...metric.values]
    .filter((item) => item.numericValue !== null)
    .sort((first, second) => {
      return sortInsightBuckets(
        getInsightBucketKey(first.endTime),
        getInsightBucketKey(second.endTime),
      );
    })
    .at(-1);

  return latestMetricValue?.numericValue ?? 0;
}

function aggregateInsightMetrics(records: Array<{ metrics: PanelMetaSocialInsightMetricRecord[] }>) {
  const metricMap = new Map<
    string,
    {
      description: string | null;
      metric: string;
      period: PanelMetaSocialInsightPeriod | null;
      title: string | null;
      values: Map<
        string,
        {
          endTime: string | null;
          numericValue: number;
        }
      >;
    }
  >();

  records.forEach((record) => {
    record.metrics.forEach((metric) => {
      const currentMetric = metricMap.get(metric.metric) ?? {
        description: metric.description,
        metric: metric.metric,
        period: metric.period,
        title: metric.title,
        values: new Map(),
      };

      metric.values.forEach((value) => {
        const bucketKey = getInsightBucketKey(value.endTime);
        const currentValue = currentMetric.values.get(bucketKey);
        const nextNumericValue = (currentValue?.numericValue ?? 0) + (value.numericValue ?? 0);

        currentMetric.values.set(bucketKey, {
          endTime: value.endTime,
          numericValue: nextNumericValue,
        });
      });

      metricMap.set(metric.metric, currentMetric);
    });
  });

  return [...metricMap.values()].map((metric) => ({
    description: metric.description,
    metric: metric.metric,
    period: metric.period,
    title: metric.title,
    values: [...metric.values.entries()]
      .sort(([firstKey], [secondKey]) => sortInsightBuckets(firstKey, secondKey))
      .map(([, value]) => ({
        displayValue: formatInteger(value.numericValue),
        endTime: value.endTime,
        numericValue: value.numericValue,
        rawValue: value.numericValue,
      })),
  }));
}

function resolveInsightMetricConfig(platform: PanelSocialMediaPlatform, metric: string) {
  if (platform === "instagram") {
    switch (metric) {
      case "reach":
        return {
          color: "#c026d3",
          description: "Alcance organico consolidado das contas Instagram vinculadas.",
          icon: <Camera className="h-5 w-5" />,
          label: "Alcance Instagram",
          toneClassName: "border-fuchsia-500/16 bg-fuchsia-500/10 text-fuchsia-500",
          valueToneClassName: "text-fuchsia-500",
        };
      case "profile_views":
        return {
          color: "#0f766e",
          description: "Visualizacoes de perfil agregadas entre as contas Instagram disponiveis.",
          icon: <Eye className="h-5 w-5" />,
          label: "Views de perfil",
          toneClassName: "border-teal-500/16 bg-teal-500/10 text-teal-500",
          valueToneClassName: "text-teal-500",
        };
      default:
        return {
          color: "#7c3aed",
          description: "Impressoes organicas agregadas das contas Instagram vinculadas.",
          icon: <ImageIcon className="h-5 w-5" />,
          label: "Impressoes Instagram",
          toneClassName: "border-violet-500/16 bg-violet-500/10 text-violet-500",
          valueToneClassName: "text-violet-500",
        };
    }
  }

  switch (metric) {
    case "page_post_engagements":
      return {
        color: "#f59e0b",
        description: "Engajamentos organicos retornados pelos posts da pagina selecionada.",
        icon: <UsersRound className="h-5 w-5" />,
        label: "Engajamentos Facebook",
        toneClassName: "border-amber-500/16 bg-amber-500/10 text-amber-500",
        valueToneClassName: "text-amber-500",
      };
    case "page_follows":
      return {
        color: "#059669",
        description: "Follows consolidados da pagina no periodo atual dos insights.",
        icon: <Check className="h-5 w-5" />,
        label: "Follows Facebook",
        toneClassName: "border-emerald-500/16 bg-emerald-500/10 text-emerald-500",
        valueToneClassName: "text-emerald-500",
      };
    default:
      return {
        color: "#2563eb",
        description: "Visualizacoes organicas de midia retornadas pela pagina do Facebook.",
        icon: <BarChart3 className="h-5 w-5" />,
        label: "Views Facebook",
        toneClassName: "border-primary/18 bg-primary/10 text-primary",
        valueToneClassName: "text-primary",
      };
  }
}

function orderMetrics(platform: PanelSocialMediaPlatform, metrics: PanelMetaSocialInsightMetricRecord[]) {
  const referenceOrder =
    platform === "instagram"
      ? ["impressions", "reach", "profile_views"]
      : ["page_media_view", "page_post_engagements", "page_follows"];

  return [...metrics].sort((first, second) => {
    const firstIndex = referenceOrder.indexOf(first.metric);
    const secondIndex = referenceOrder.indexOf(second.metric);

    if (firstIndex === -1 && secondIndex === -1) {
      return first.metric.localeCompare(second.metric);
    }

    if (firstIndex === -1) {
      return 1;
    }

    if (secondIndex === -1) {
      return -1;
    }

    return firstIndex - secondIndex;
  });
}

function buildInsightChartData(
  platform: PanelSocialMediaPlatform,
  metrics: PanelMetaSocialInsightMetricRecord[],
) {
  const orderedMetrics = orderMetrics(
    platform,
    metrics.filter((metric) => metric.values.length > 0),
  );
  const labelKeys = Array.from(
    new Set(
      orderedMetrics.flatMap((metric) =>
        metric.values.map((value) => getInsightBucketKey(value.endTime)),
      ),
    ),
  ).sort(sortInsightBuckets);

  return {
    labels: labelKeys.map((item) => (item === CURRENT_INSIGHT_BUCKET_KEY ? "Atual" : item)),
    series: orderedMetrics.map((metric) => {
      const config = resolveInsightMetricConfig(platform, metric.metric);
      const valuesByLabel = new Map(
        metric.values.map((value) => [
          getInsightBucketKey(value.endTime),
          value.numericValue ?? 0,
        ]),
      );

      return {
        color: config.color,
        label: config.label,
        values: labelKeys.map((item) => valuesByLabel.get(item) ?? 0),
      };
    }),
  };
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
const PDF_EXPORT_FRAME_ID = "panel-social-media-meta-pdf-export-frame";
const PDF_CHART_PADDING = {
  top: 20,
  right: 24,
  bottom: 38,
  left: 24,
};

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

  return Array.from(
    new Set([
      0,
      Math.floor((total - 1) * 0.2),
      Math.floor((total - 1) * 0.4),
      Math.floor((total - 1) * 0.6),
      Math.floor((total - 1) * 0.8),
      total - 1,
    ]),
  ).sort((first, second) => first - second);
}

function buildPdfLineChartSvg(
  labels: string[],
  series: Array<{ color: string; label: string; values: number[] }>,
  range: "12m" | "30d" | "7d",
) {
  if (!labels.length || !series.length) {
    return `<div class="pdf-empty-state">Ainda nao ha pontos suficientes para exibir o grafico.</div>`;
  }

  const allValues = series.flatMap((item) => item.values);
  const maxValue = Math.max(...allValues, 0);
  const hasData = allValues.some((value) => value > 0);

  if (!hasData) {
    return `<div class="pdf-empty-state">Nenhuma atividade registrada no periodo selecionado.</div>`;
  }

  const tickIndexes = getPdfTickIndexes(labels.length);
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

  const dots = series
    .map((item) => {
      const innerWidth = PDF_CHART_WIDTH - PDF_CHART_PADDING.left - PDF_CHART_PADDING.right;
      const innerHeight = PDF_CHART_HEIGHT - PDF_CHART_PADDING.top - PDF_CHART_PADDING.bottom;
      const safeMaxValue = Math.max(maxValue, 1);
      const denominator = Math.max(item.values.length - 1, 1);

      return item.values
        .map((value, index) => {
          const x = PDF_CHART_PADDING.left + (innerWidth * index) / denominator;
          const y = PDF_CHART_PADDING.top + innerHeight - (value / safeMaxValue) * innerHeight;

          return `<circle cx="${x}" cy="${y}" r="${index === item.values.length - 1 ? 4.5 : 3}" fill="${item.color}" stroke="#ffffff" stroke-width="1.5" />`;
        })
        .join("");
    })
    .join("");

  const ticks = tickIndexes
    .map((index) => {
      const innerWidth = PDF_CHART_WIDTH - PDF_CHART_PADDING.left - PDF_CHART_PADDING.right;
      const denominator = Math.max(labels.length - 1, 1);
      const x = PDF_CHART_PADDING.left + (innerWidth * index) / denominator;
      const anchor = index === 0 ? "start" : index === labels.length - 1 ? "end" : "middle";
      const label = labels[index] === "Atual" ? "Atual" : formatCompactDate(labels[index]);

      return `<text x="${x}" y="${PDF_CHART_HEIGHT - 10}" fill="#5e6878" font-size="10" text-anchor="${anchor}">${escapeHtml(
        label,
      )}</text>`;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${PDF_CHART_WIDTH} ${PDF_CHART_HEIGHT}" class="pdf-line-chart" role="img" aria-label="Grafico do dashboard social">
      ${seriesPaths}
      ${dots}
      ${ticks}
    </svg>
  `;
}

function buildSocialDashboardPdfHtml(input: {
  facebookChart: { labels: string[]; series: Array<{ color: string; label: string; values: number[] }> };
  generatedAt: string;
  instagramChart: { labels: string[]; series: Array<{ color: string; label: string; values: number[] }> };
  insightCards: Array<{ label: string; value: string }>;
  periodLabel: string;
  posts: PanelSocialMediaContentRecord[];
  postsAreCurated: boolean;
  primaryInstagramLabel: string | null;
  secondarySummaryCards: Array<{ label: string; value: string; helper: string }>;
  title: string;
}) {
  const facebookChartSvg = buildPdfLineChartSvg(
    input.facebookChart.labels,
    input.facebookChart.series,
    resolveChartRange(input.facebookChart.labels.length),
  );
  const instagramChartSvg = buildPdfLineChartSvg(
    input.instagramChart.labels,
    input.instagramChart.series,
    resolveChartRange(input.instagramChart.labels.length),
  );

  return `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(`Dashboard social • ${input.title}`)}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 14mm;
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
            background:
              linear-gradient(145deg, rgba(255,255,255,0.98), rgba(239,244,251,0.92)),
              radial-gradient(circle at top right, rgba(34, 98, 240, 0.16), transparent 34%);
          }

          .pdf-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
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

          .pdf-copy {
            margin: 12px 0 0;
            color: #5e6878;
            font-size: 13px;
            line-height: 1.6;
          }

          .pdf-grid {
            display: grid;
            gap: 12px;
          }

          .pdf-grid.four {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .pdf-grid.three {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .pdf-card {
            border: 1px solid #d7dfeb;
            border-radius: 18px;
            background: rgba(244, 247, 251, 0.9);
            padding: 14px 16px;
          }

          .pdf-kpi {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.03em;
            margin-top: 6px;
          }

          .pdf-label {
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: #5e6878;
          }

          .pdf-sub {
            margin-top: 6px;
            font-size: 12px;
            color: #5e6878;
            line-height: 1.5;
          }

          .pdf-chart-shell {
            border: 1px solid #d7dfeb;
            border-radius: 18px;
            background: #ffffff;
            padding: 16px;
          }

          .pdf-empty-state {
            min-height: 180px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #5e6878;
            font-size: 12px;
            text-align: center;
          }

          .pdf-post-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
          }

          .pdf-post-card {
            overflow: hidden;
            border: 1px solid #d7dfeb;
            border-radius: 20px;
            background: #ffffff;
          }

          .pdf-post-media {
            height: 210px;
            background: #edf2f7;
          }

          .pdf-post-media img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .pdf-post-body {
            padding: 14px;
          }

          .pdf-post-title {
            font-size: 15px;
            font-weight: 700;
            line-height: 1.35;
            margin: 0;
          }

          .pdf-post-meta {
            margin-top: 6px;
            font-size: 11px;
            color: #5e6878;
          }

          .pdf-post-excerpt {
            margin-top: 10px;
            font-size: 12px;
            line-height: 1.55;
            color: #3c4658;
          }

          .pdf-post-chip-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
          }

          .pdf-chip {
            padding: 6px 10px;
            border-radius: 999px;
            background: #f4f7fb;
            border: 1px solid #d7dfeb;
            font-size: 11px;
            font-weight: 700;
            color: #141821;
          }

          @media print {
            body {
              background: #ffffff;
            }
          }
        </style>
      </head>
      <body>
        <main class="pdf-report">
          <section class="pdf-section pdf-hero">
            <div class="pdf-badge">Dashboard Social</div>
            <h1 class="pdf-title">${escapeHtml(input.title)}</h1>
            <p class="pdf-copy">
              Relatorio visual pensado para apresentar resultado, leitura organica e destaques editoriais da presenca social.
            </p>
            <div class="pdf-grid four" style="margin-top:18px;">
              <div class="pdf-card">
                <div class="pdf-label">Periodo</div>
                <div class="pdf-kpi">${escapeHtml(input.periodLabel)}</div>
              </div>
              <div class="pdf-card">
                <div class="pdf-label">Instagram principal</div>
                <div class="pdf-kpi">${escapeHtml(input.primaryInstagramLabel ?? "Nao vinculado")}</div>
              </div>
              <div class="pdf-card">
                <div class="pdf-label">Curadoria</div>
                <div class="pdf-kpi">${input.postsAreCurated ? "Posts escolhidos" : "Mais recentes"}</div>
              </div>
              <div class="pdf-card">
                <div class="pdf-label">Gerado em</div>
                <div class="pdf-kpi">${escapeHtml(input.generatedAt)}</div>
              </div>
            </div>
          </section>

          <section class="pdf-section">
            <div class="pdf-grid four">
              ${input.insightCards
                .map(
                  (item) => `
                    <div class="pdf-card">
                      <div class="pdf-label">${escapeHtml(item.label)}</div>
                      <div class="pdf-kpi">${escapeHtml(item.value)}</div>
                    </div>
                  `,
                )
                .join("")}
            </div>
          </section>

          <section class="pdf-section">
            <div class="pdf-grid three">
              ${input.secondarySummaryCards
                .map(
                  (item) => `
                    <div class="pdf-card">
                      <div class="pdf-label">${escapeHtml(item.label)}</div>
                      <div class="pdf-kpi">${escapeHtml(item.value)}</div>
                      <div class="pdf-sub">${escapeHtml(item.helper)}</div>
                    </div>
                  `,
                )
                .join("")}
            </div>
          </section>

          <section class="pdf-section">
            <div class="pdf-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));">
              <div class="pdf-chart-shell">
                <div class="pdf-label">Facebook</div>
                <div class="pdf-sub">Linha do tempo organica da pagina.</div>
                ${facebookChartSvg}
              </div>
              <div class="pdf-chart-shell">
                <div class="pdf-label">Instagram</div>
                <div class="pdf-sub">Linha do tempo organica dos perfis vinculados.</div>
                ${instagramChartSvg}
              </div>
            </div>
          </section>

          <section class="pdf-section">
            <div class="pdf-label">Posts em destaque</div>
            <div class="pdf-copy" style="margin-top:8px;">
              ${input.postsAreCurated ? "Selecao editorial definida pela agencia para apresentacao." : "Selecao automatica com base nos conteudos mais recentes."}
            </div>
            <div class="pdf-post-grid" style="margin-top:16px;">
              ${input.posts
                .map(
                  (item) => `
                    <article class="pdf-post-card">
                      <div class="pdf-post-media">
                        ${
                          item.previewUrl
                            ? `<img src="${escapeHtml(item.previewUrl)}" alt="${escapeHtml(item.title)}" />`
                            : ""
                        }
                      </div>
                      <div class="pdf-post-body">
                        <h2 class="pdf-post-title">${escapeHtml(item.title)}</h2>
                        <div class="pdf-post-meta">${escapeHtml(item.sourceLabel)} • ${escapeHtml(
                          formatCompactDate(item.publishedAt),
                        )}</div>
                        ${
                          item.excerpt
                            ? `<p class="pdf-post-excerpt">${escapeHtml(item.excerpt)}</p>`
                            : ""
                        }
                        ${
                          item.metrics && item.metrics.length > 0
                            ? `<div class="pdf-post-chip-row">${item.metrics
                                .map(
                                  (metric) => `<span class="pdf-chip">${escapeHtml(metric.value)} ${escapeHtml(metric.label)}</span>`,
                                )
                                .join("")}</div>`
                            : ""
                        }
                      </div>
                    </article>
                  `,
                )
                .join("")}
            </div>
          </section>
        </main>
      </body>
    </html>
  `;
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

export default function SocialMediaMetaDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pageId: rawPageId = "" } = useParams<{ pageId: string }>();
  const resolvedPageId = useMemo(() => decodeURIComponent(rawPageId), [rawPageId]);
  const { token } = usePanelAuth();
  const toast = useToast();
  const initialInsightRange = useMemo(() => getDefaultInsightRange(), []);
  const [metaStatus, setMetaStatus] = useState<PanelMetaConnectionStatusRecord | null>(null);
  const [pages, setPages] = useState<PanelMetaSocialPageRecord[]>([]);
  const [instagramAccounts, setInstagramAccounts] = useState<PanelMetaSocialInstagramAccountRecord[]>(
    [],
  );
  const [instagramBusinessAccounts, setInstagramBusinessAccounts] = useState<
    PanelMetaInstagramBusinessAccountRecord[]
  >([]);
  const [pagePosts, setPagePosts] = useState<PanelMetaSocialPagePostRecord[]>([]);
  const [instagramMediaEntries, setInstagramMediaEntries] = useState<InstagramMediaEntry[]>([]);
  const [pageInsights, setPageInsights] = useState<PanelMetaPageInsightsRecord | null>(null);
  const [instagramInsights, setInstagramInsights] = useState<PanelMetaInstagramInsightsRecord[]>([]);
  const [instagramFollowersByAccountId, setInstagramFollowersByAccountId] = useState<
    Record<string, number>
  >({});
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const [instagramCommentCountByMediaId, setInstagramCommentCountByMediaId] = useState<
    Record<string, number>
  >({});
  const [searchValue, setSearchValue] = useState("");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [limit, setLimit] = useState(25);
  const [insightPeriod, setInsightPeriod] =
    useState<PanelMetaSocialInsightPeriod>(DEFAULT_INSIGHT_PERIOD);
  const [startDate, setStartDate] = useState(initialInsightRange.startDate);
  const [endDate, setEndDate] = useState(initialInsightRange.endDate);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const [isContentMetricsLoading, setIsContentMetricsLoading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [contentMetricsError, setContentMetricsError] = useState<string | null>(null);
  const contentRequestRef = useRef(0);
  const insightsRequestRef = useRef(0);
  const contentMetricsRequestRef = useRef(0);

  const activePage = useMemo(
    () => pages.find((item) => item.pageId === resolvedPageId) ?? null,
    [pages, resolvedPageId],
  );

  const activeInstagramSources = useMemo(() => {
    if (!activePage) {
      return [];
    }

    return resolvePanelMetaSocialInstagramSources({
      instagramAccounts,
      instagramBusinessAccounts,
      page: activePage,
    });
  }, [activePage, instagramAccounts, instagramBusinessAccounts]);


  const loadContext = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsHydrating(true);
    setLoadError(null);

    try {
      const nextStatus = await getPanelMetaConnectionStatus(token);
      setMetaStatus(nextStatus);

      if (nextStatus.status !== "CONNECTED") {
        setPages([]);
        setInstagramAccounts([]);
        setInstagramBusinessAccounts([]);
        setPagePosts([]);
        setInstagramMediaEntries([]);
        setPageInsights(null);
        setInstagramInsights([]);
        setInstagramFollowersByAccountId({});
        setInstagramCommentCountByMediaId({});
        setContentMetricsError(null);
        return;
      }

      const [nextPagesResult, nextInstagramAccountsResult, nextInstagramBusinessAccountsResult] =
        await Promise.allSettled([
          listPanelMetaSocialPages(token),
          listPanelMetaSocialInstagramAccounts(token),
          listPanelMetaInstagramBusinessAccounts(token),
        ]);

      if (nextPagesResult.status === "rejected") {
        throw nextPagesResult.reason;
      }

      setPages(nextPagesResult.value);
      setInstagramAccounts(
        nextInstagramAccountsResult.status === "fulfilled"
          ? nextInstagramAccountsResult.value
          : [],
      );
      setInstagramBusinessAccounts(
        nextInstagramBusinessAccountsResult.status === "fulfilled"
          ? nextInstagramBusinessAccountsResult.value
          : [],
      );
    } catch (error) {
      setMetaStatus(null);
      setPages([]);
      setInstagramAccounts([]);
      setInstagramBusinessAccounts([]);
      setPagePosts([]);
      setInstagramMediaEntries([]);
      setPageInsights(null);
      setInstagramInsights([]);
      setInstagramFollowersByAccountId({});
      setInstagramCommentCountByMediaId({});
      setContentMetricsError(null);
      setLoadError(
        getErrorMessage(error, "Nao foi possivel abrir o modulo social dessa pagina agora."),
      );
    } finally {
      setIsHydrating(false);
    }
  }, [token]);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  const loadContent = useCallback(async () => {
    if (!token || !activePage || metaStatus?.status !== "CONNECTED") {
      setPagePosts([]);
      setInstagramMediaEntries([]);
      setContentError(null);
      return;
    }

    const requestId = contentRequestRef.current + 1;
    contentRequestRef.current = requestId;
    setIsContentLoading(true);
    setContentError(null);

    const errorMessages: string[] = [];

    try {
      const [pagePostsResult, instagramMediaResults] = await Promise.all([
        listPanelMetaSocialPagePosts(token, {
          limit,
          pageId: activePage.pageId,
        })
          .then((value) => ({ status: "fulfilled" as const, value }))
          .catch((reason: unknown) => ({ status: "rejected" as const, reason })),
        Promise.allSettled(
          activeInstagramSources.map(async (account) => {
            const items = await listPanelMetaSocialInstagramMedia(token, {
              instagramAccountId: account.instagramAccountId,
              limit,
            });

            return items.map((media) => ({
              account: {
                instagramAccountId: account.instagramAccountId,
                name: account.name,
                origin: account.origin,
                pageId: account.pageId,
                pageName: account.pageName,
                profilePictureUrl: account.profilePictureUrl,
                username: account.username ?? media.username,
              },
              media,
            }));
          }),
        ),
      ]);

      if (requestId !== contentRequestRef.current) {
        return;
      }

      if (pagePostsResult.status === "fulfilled") {
        setPagePosts(pagePostsResult.value);
      } else {
        setPagePosts([]);
        errorMessages.push(
          getErrorMessage(
            pagePostsResult.reason,
            "Nao foi possivel carregar os posts do Facebook desta pagina.",
          ),
        );
      }

      const nextInstagramMediaEntries = instagramMediaResults.flatMap((result) => {
        if (result.status === "fulfilled") {
          return result.value;
        }

        errorMessages.push(
          getErrorMessage(
            result.reason,
            "Nao foi possivel carregar parte das midias do Instagram desta pagina.",
          ),
        );

        return [];
      }).sort((first, second) => {
        const firstValue = first.media.timestamp ? new Date(first.media.timestamp).getTime() : 0;
        const secondValue = second.media.timestamp ? new Date(second.media.timestamp).getTime() : 0;

        return secondValue - firstValue;
      });

      setInstagramMediaEntries(nextInstagramMediaEntries);
      setContentError(errorMessages.length > 0 ? errorMessages.join(" ") : null);
    } finally {
      if (requestId === contentRequestRef.current) {
        setIsContentLoading(false);
      }
    }
  }, [activeInstagramSources, activePage, limit, metaStatus?.status, token]);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const loadInsights = useCallback(async () => {
    if (!token || !activePage || metaStatus?.status !== "CONNECTED") {
      setPageInsights(null);
      setInstagramInsights([]);
      setInsightsError(null);
      return;
    }

    const requestId = insightsRequestRef.current + 1;
    insightsRequestRef.current = requestId;
    setIsInsightsLoading(true);
    setInsightsError(null);

    const errorMessages: string[] = [];
    const startDateQuery = insightPeriod === "lifetime" ? undefined : startDate || undefined;
    const endDateQuery = insightPeriod === "lifetime" ? undefined : endDate || undefined;

    try {
      const [pageInsightsResult, instagramInsightsResults] = await Promise.all([
        listPanelMetaPageInsights(token, {
          endDate: endDateQuery,
          pageId: activePage.pageId,
          period: insightPeriod,
          startDate: startDateQuery,
        })
          .then((value) => ({ status: "fulfilled" as const, value }))
          .catch((reason: unknown) => ({ status: "rejected" as const, reason })),
        Promise.allSettled(
          activeInstagramSources.map((account) =>
            listPanelMetaInstagramInsights(token, {
              endDate: endDateQuery,
              instagramAccountId: account.instagramAccountId,
              period: insightPeriod,
              startDate: startDateQuery,
            }),
          ),
        ),
      ]);

      if (requestId !== insightsRequestRef.current) {
        return;
      }

      if (pageInsightsResult.status === "fulfilled") {
        setPageInsights(pageInsightsResult.value);
      } else {
        setPageInsights(null);
        errorMessages.push(
          getErrorMessage(
            pageInsightsResult.reason,
            "Nao foi possivel carregar os insights da pagina do Facebook.",
          ),
        );
      }

      const nextInstagramInsights = instagramInsightsResults.flatMap((result) => {
        if (result.status === "fulfilled") {
          return [result.value];
        }

        errorMessages.push(
          getErrorMessage(
            result.reason,
            "Nao foi possivel carregar parte dos insights do Instagram desta pagina.",
          ),
        );

        return [];
      });

      setInstagramInsights(nextInstagramInsights);
      setInsightsError(errorMessages.length > 0 ? errorMessages.join(" ") : null);
    } finally {
      if (requestId === insightsRequestRef.current) {
        setIsInsightsLoading(false);
      }
    }
  }, [activeInstagramSources, activePage, endDate, insightPeriod, metaStatus?.status, startDate, token]);

  useEffect(() => {
    void loadInsights();
  }, [loadInsights]);

  const loadFollowerInsights = useCallback(async () => {
    if (!token || activeInstagramSources.length === 0 || metaStatus?.status !== "CONNECTED") {
      setInstagramFollowersByAccountId({});
      return;
    }

    const results = await Promise.allSettled(
      activeInstagramSources.map(async (account) => {
        const response = await listPanelMetaInstagramInsights(token, {
          instagramAccountId: account.instagramAccountId,
          metrics: ["follower_count"],
          period: "lifetime",
        });

        const followerMetric = response.metrics.find((item) => item.metric === "follower_count");

        return {
          followerCount: getLatestMetricValue(followerMetric),
          instagramAccountId: account.instagramAccountId,
        };
      }),
    );

    const nextFollowersByAccountId: Record<string, number> = {};

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        nextFollowersByAccountId[result.value.instagramAccountId] = result.value.followerCount;
      }
    });

    setInstagramFollowersByAccountId(nextFollowersByAccountId);
  }, [activeInstagramSources, metaStatus?.status, token]);

  useEffect(() => {
    void loadFollowerInsights();
  }, [loadFollowerInsights]);

  const contentItems = useMemo<PanelSocialMediaContentRecord[]>(() => {
    if (!activePage) {
      return [];
    }

    const facebookItems = pagePosts.map((post) => ({
      excerpt: post.message,
      id: post.postId,
      kind: "facebook_post" as const,
      mediaKind: resolveFacebookMediaKind(post),
      permalinkUrl: post.permalinkUrl,
      platform: "facebook" as const,
      previewUrl: post.fullPictureUrl,
      publishedAt: post.createdTime,
      rawType: post.statusType,
      sourceId: post.postId,
      sourceLabel: activePage.name,
      title: createContentTitle(post.message, "Post do Facebook"),
    }));

    const instagramItems = instagramMediaEntries.map(({ account, media }) => ({
      excerpt: media.caption,
      id: media.mediaId,
      kind: resolveInstagramContentKind(media.mediaType),
      mediaKind: resolveInstagramMediaKind(media.mediaType),
      permalinkUrl: media.permalink,
      platform: "instagram" as const,
      previewUrl: media.thumbnailUrl ?? media.mediaUrl,
      publishedAt: media.timestamp,
      rawType: media.mediaType,
      sourceId: media.mediaId,
      sourceLabel: getInstagramSourceLabel(account),
      title: createContentTitle(media.caption, "Midia do Instagram"),
    }));

    return [...facebookItems, ...instagramItems].sort((first, second) => {
      const firstValue = first.publishedAt ? new Date(first.publishedAt).getTime() : 0;
      const secondValue = second.publishedAt ? new Date(second.publishedAt).getTime() : 0;

      return secondValue - firstValue;
    });
  }, [activePage, instagramMediaEntries, pagePosts]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = normalizeSearchText(searchValue);

    return contentItems.filter((item) => {
      const matchesPlatform = platformFilter === "all" || item.platform === platformFilter;

      if (!matchesPlatform) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [item.title, item.excerpt, item.sourceId, item.sourceLabel, item.rawType]
        .filter(Boolean)
        .some((value) => normalizeSearchText(value).includes(normalizedSearch));
    });
  }, [contentItems, platformFilter, searchValue]);

  const contentItemsById = useMemo(
    () => new Map(contentItems.map((item) => [item.id, item])),
    [contentItems],
  );
  const postPickerOptions = useMemo(
    () =>
      contentItems.map((item) => ({
        id: item.id,
        meta: `${item.platform === "instagram" ? "Instagram" : "Facebook"} • ${item.sourceLabel} • ${formatCompactDate(
          item.publishedAt,
        )}`,
        title: item.title,
      })),
    [contentItems],
  );
  const selectedDashboardItems = useMemo(
    () =>
      selectedContentIds
        .map((item) => contentItemsById.get(item))
        .filter((item): item is PanelSocialMediaContentRecord => Boolean(item)),
    [contentItemsById, selectedContentIds],
  );
  const dashboardItems = useMemo(
    () => (selectedDashboardItems.length > 0 ? selectedDashboardItems : contentItems.slice(0, 6)),
    [contentItems, selectedDashboardItems],
  );
  const highlights = useMemo(() => dashboardItems.slice(0, 12), [dashboardItems]);
  const primaryInstagramSource = activeInstagramSources[0] ?? null;
  const aggregatedInstagramMetrics = useMemo(
    () => aggregateInsightMetrics(instagramInsights),
    [instagramInsights],
  );
  const pageMetricsByName = useMemo(
    () => new Map((pageInsights?.metrics ?? []).map((item) => [item.metric, item])),
    [pageInsights],
  );
  const instagramMetricsByName = useMemo(
    () => new Map(aggregatedInstagramMetrics.map((item) => [item.metric, item])),
    [aggregatedInstagramMetrics],
  );
  const facebookChart = useMemo(
    () => buildInsightChartData("facebook", pageInsights?.metrics ?? []),
    [pageInsights],
  );
  const instagramChart = useMemo(
    () => buildInsightChartData("instagram", aggregatedInstagramMetrics),
    [aggregatedInstagramMetrics],
  );
  const totalInstagramFollowers = useMemo(() => {
    const values = Object.values(instagramFollowersByAccountId).filter((item) => Number.isFinite(item));

    return values.length > 0 ? values.reduce((sum, item) => sum + item, 0) : null;
  }, [instagramFollowersByAccountId]);

  useEffect(() => {
    setSelectedContentIds((current) => current.filter((item) => contentItemsById.has(item)));
  }, [contentItemsById]);

  const dashboardInstagramMediaEntries = useMemo(() => {
    const entryMap = new Map(instagramMediaEntries.map((item) => [item.media.mediaId, item]));

    return dashboardItems
      .filter((item) => item.platform === "instagram")
      .map((item) => entryMap.get(item.id))
      .filter((item): item is InstagramMediaEntry => Boolean(item));
  }, [dashboardItems, instagramMediaEntries]);

  useEffect(() => {
    if (!token || dashboardInstagramMediaEntries.length === 0 || metaStatus?.status !== "CONNECTED") {
      setInstagramCommentCountByMediaId({});
      setContentMetricsError(null);
      return;
    }

    const requestId = contentMetricsRequestRef.current + 1;
    contentMetricsRequestRef.current = requestId;
    setIsContentMetricsLoading(true);
    setContentMetricsError(null);

    void Promise.allSettled(
      dashboardInstagramMediaEntries.map(async (entry) => {
        const comments = await listPanelMetaInstagramComments(token, {
          instagramAccountId: entry.account.instagramAccountId,
          limit: 100,
          mediaId: entry.media.mediaId,
        });

        return {
          commentsCount: comments.length,
          mediaId: entry.media.mediaId,
        };
      }),
    )
      .then((results) => {
        if (requestId !== contentMetricsRequestRef.current) {
          return;
        }

        const nextCommentCountByMediaId: Record<string, number> = {};
        const errors: string[] = [];

        results.forEach((result) => {
          if (result.status === "fulfilled") {
            nextCommentCountByMediaId[result.value.mediaId] = result.value.commentsCount;
            return;
          }

          errors.push(
            getErrorMessage(
              result.reason,
              "Nao foi possivel carregar todas as metricas complementares dos posts do Instagram.",
            ),
          );
        });

        setInstagramCommentCountByMediaId(nextCommentCountByMediaId);
        setContentMetricsError(errors.length > 0 ? errors.join(" ") : null);
      })
      .finally(() => {
        if (requestId === contentMetricsRequestRef.current) {
          setIsContentMetricsLoading(false);
        }
      });
  }, [dashboardInstagramMediaEntries, metaStatus?.status, token]);

  const dashboardHighlights = useMemo(
    () =>
      highlights.map((item) => {
        if (item.platform !== "instagram") {
          return item;
        }

        const commentsCount = instagramCommentCountByMediaId[item.id];

        return {
          ...item,
          metrics: commentsCount !== undefined
            ? [
                {
                  label: commentsCount >= 100 ? "comentarios lidos" : "comentarios",
                  value: commentsCount >= 100 ? "100+" : formatInteger(commentsCount),
                },
              ]
            : [],
        };
      }),
    [highlights, instagramCommentCountByMediaId],
  );

  const insightCards = useMemo<InsightMetricCardDefinition[]>(() => {
    return [
      "page_media_view",
      "page_post_engagements",
      "page_follows",
    ].map((metric) => {
      const config = resolveInsightMetricConfig("facebook", metric);

      return {
        description: config.description,
        icon: config.icon,
        label: config.label,
        toneClassName: config.toneClassName,
        valueNumber: getLatestMetricValue(pageMetricsByName.get(metric)),
        valueToneClassName: config.valueToneClassName,
      };
    }).concat(
      ["impressions", "reach", "profile_views"].map((metric) => {
        const config = resolveInsightMetricConfig("instagram", metric);

        return {
          description: config.description,
          icon: config.icon,
          label: config.label,
          toneClassName: config.toneClassName,
          valueNumber: getLatestMetricValue(instagramMetricsByName.get(metric)),
          valueToneClassName: config.valueToneClassName,
        };
      }),
    );
  }, [instagramMetricsByName, pageMetricsByName]);

  const contentSummaryCards = useMemo(() => {
    const instagramPostsCount = contentItems.filter((item) => item.kind === "instagram_post").length;
    const reelsCount = contentItems.filter((item) => item.kind === "reel").length;

    return [
      {
        description: "Total de conteudos lidos para montar o dashboard social do cliente.",
        icon: <LayoutGrid className="h-5 w-5" />,
        label: "Conteudos",
        toneClassName: "border-primary/18 bg-primary/10 text-primary",
        valueNumber: contentItems.length,
        valueToneClassName: "text-primary",
      },
      {
        description: "Posts do Facebook disponiveis para curadoria no relatorio visual.",
        icon: <Globe2 className="h-5 w-5" />,
        label: "Posts Facebook",
        toneClassName: "border-sky-500/16 bg-sky-500/10 text-sky-500",
        valueNumber: pagePosts.length,
        valueToneClassName: "text-sky-500",
      },
      {
        description: "Midias do Instagram disponiveis para destacar resultado e criativo.",
        icon: <ImageIcon className="h-5 w-5" />,
        label: "Posts Instagram",
        toneClassName: "border-fuchsia-500/16 bg-fuchsia-500/10 text-fuchsia-500",
        valueNumber: instagramPostsCount,
        valueToneClassName: "text-fuchsia-500",
      },
      {
        description: "Reels identificados entre as midias do Instagram carregadas.",
        icon: <Sparkles className="h-5 w-5" />,
        label: "Reels",
        toneClassName: "border-amber-500/16 bg-amber-500/10 text-amber-500",
        valueNumber: reelsCount,
        valueToneClassName: "text-amber-500",
      },
      {
        description: "Perfis Instagram conectados e prontos para leitura de performance.",
        icon: <Camera className="h-5 w-5" />,
        label: "Perfis Instagram",
        toneClassName: "border-violet-500/16 bg-violet-500/10 text-violet-500",
        valueNumber: activeInstagramSources.length,
        valueToneClassName: "text-violet-500",
      },
      {
        description: "Quantidade de posts escolhidos para aparecer no dashboard e no PDF.",
        icon: <ShieldCheck className="h-5 w-5" />,
        label: "Posts no dashboard",
        meta: [{ label: "Mais recente", value: formatCompactDate(getLatestPublishedAt(contentItems)) }],
        toneClassName: "border-emerald-500/16 bg-emerald-500/10 text-emerald-500",
        valueNumber: dashboardItems.length,
        valueToneClassName: "text-emerald-500",
      },
      {
        description:
          totalInstagramFollowers !== null
            ? "Seguidores consolidados das contas Instagram que a API conseguiu resolver."
            : "Follower count ainda nao foi retornado pela API para os perfis vinculados.",
        icon: <UsersRound className="h-5 w-5" />,
        label: "Seguidores Instagram",
        meta: [
          {
            label: "Perfis resolvidos",
            value: `${Object.keys(instagramFollowersByAccountId).length}/${activeInstagramSources.length}`,
          },
        ],
        toneClassName: "border-teal-500/16 bg-teal-500/10 text-teal-500",
        value: totalInstagramFollowers !== null ? formatInteger(totalInstagramFollowers) : "Nao disponivel",
        valueToneClassName: "text-teal-500",
      },
    ];
  }, [
    activeInstagramSources.length,
    contentItems,
    dashboardItems.length,
    instagramFollowersByAccountId,
    pagePosts.length,
    totalInstagramFollowers,
  ]);
  const canExportPdf =
    !isHydrating &&
    !loadError &&
    !isContentLoading &&
    !isInsightsLoading &&
    Boolean(activePage);

  const handleRefresh = useCallback(() => {
    void loadContext();
    void loadContent();
    void loadInsights();
    void loadFollowerInsights();
  }, [loadContext, loadContent, loadFollowerInsights, loadInsights]);

  const handleExportPdf = useCallback(() => {
    if (!activePage) {
      return;
    }

    if (!canExportPdf) {
      toast.error({
        title: "PDF indisponivel",
        description: "Aguarde o dashboard terminar de carregar antes de exportar.",
      });
      return;
    }

    setIsExportingPdf(true);

    try {
      const html = buildSocialDashboardPdfHtml({
        facebookChart,
        generatedAt: formatDateTime(new Date().toISOString()),
        instagramChart,
        insightCards: insightCards.map((item) => ({
          label: item.label,
          value: formatInteger(item.valueNumber),
        })),
        periodLabel: `${resolveInsightPeriodLabel(insightPeriod)} • ${formatInsightWindowLabel(
          startDate,
          endDate,
          insightPeriod,
        )}`,
        posts: dashboardHighlights,
        postsAreCurated: selectedContentIds.length > 0,
        primaryInstagramLabel: primaryInstagramSource ? getInstagramSourceLabel(primaryInstagramSource) : null,
        secondarySummaryCards: [
          {
            helper: "Conteudos disponiveis no acervo carregado da pagina.",
            label: "Conteudos",
            value: formatInteger(contentItems.length),
          },
          {
            helper: "Posts escolhidos para aparecer no dashboard e no PDF.",
            label: "Curadoria",
            value: formatInteger(dashboardItems.length),
          },
          {
            helper:
              totalInstagramFollowers !== null
                ? "Soma das contas Instagram que retornaram follower_count."
                : "Sem follower_count disponivel na API para os perfis vinculados.",
            label: "Seguidores Instagram",
            value: totalInstagramFollowers !== null ? formatInteger(totalInstagramFollowers) : "Nao disponivel",
          },
        ],
        title: activePage.name,
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
            title: "Falha ao gerar o PDF",
            description: "O navegador nao conseguiu preparar a visualizacao para impressao.",
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
              title: "Falha ao abrir a impressao",
              description:
                error instanceof Error
                  ? error.message
                  : "Nao foi possivel iniciar a impressao do relatorio.",
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
          description: "Nao foi possivel montar o relatorio para impressao.",
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
            : "Nao foi possivel montar o relatorio do dashboard agora.",
      });
    }
  }, [
    activePage,
    canExportPdf,
    contentItems.length,
    dashboardHighlights,
    dashboardItems.length,
    endDate,
    facebookChart,
    insightCards,
    insightPeriod,
    instagramChart,
    primaryInstagramSource,
    selectedContentIds.length,
    startDate,
    toast,
    totalInstagramFollowers,
  ]);

  if (isHydrating) {
    return (
      <section className="panel-card rounded-[1.9rem] border p-8">
        <div className="flex min-h-[14rem] flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LoaderCircle className="h-6 w-6 animate-spin" />
          </div>
          <h2 className="mt-5 text-xl font-black tracking-tight text-on-surface">
            Carregando Social Media • Meta
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-on-surface-variant">
            Estamos validando a pagina da rota e preparando o resgate de posts, midias e insights.
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
        title="Falha ao abrir a pagina social"
      />
    );
  }

  if (!metaStatus || metaStatus.status === "NOT_CONNECTED") {
    return (
      <StateCard
        action={(
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            onClick={() => navigate("/painel/contas-integracao/meta")}
            type="button"
          >
            Ir para Contas e integracoes
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        )}
        description="A integracao Meta ainda nao esta conectada. Conecte a conta primeiro para abrir o modulo social por pagina."
        title="Conecte a Meta para continuar"
      />
    );
  }

  if (panelMetaStatusNeedsReconnect(metaStatus.status)) {
    return (
      <StateCard
        action={(
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            onClick={() => navigate("/painel/contas-integracao/meta")}
            type="button"
          >
            Revisar integracao
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        )}
        description={getPanelMetaStatusDescription(metaStatus.status)}
        title={`Integracao Meta em atencao: ${getPanelMetaStatusLabel(metaStatus.status)}`}
      />
    );
  }

  if (pages.length === 0) {
    return (
      <StateCard
        action={(
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/16 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
            onClick={() => void loadContext()}
            type="button"
          >
            <RefreshCcw className="h-4 w-4" />
            Atualizar paginas
          </button>
        )}
        description="A conexao Meta esta ativa, mas nenhuma pagina foi retornada pela API neste momento."
        title="Nenhuma pagina Meta disponivel"
      />
    );
  }

  if (!activePage) {
    return (
      <StateCard
        action={(
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/16 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
            onClick={() => navigate("/painel/social-media/meta")}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para paginas
          </button>
        )}
        description={`A pagina ${resolvedPageId} nao foi encontrada entre as paginas liberadas pela integracao atual.`}
        title="Pagina Meta indisponivel"
      />
    );
  }

  return (
    <>
      <Seo
        description={`Dashboard social da pagina ${activePage.name}, com leitura premium de resultados do Facebook e do Instagram.`}
        noindex
        path={location.pathname}
        structuredData={null}
        title={`Social Media • ${activePage.name}`}
      />

      <div className="space-y-6">
        <PanelPageHeader
          actions={(
            <>
              <MetaStatusBadge status={metaStatus.status} />
              <button
                className="panel-card-muted inline-flex h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                onClick={handleRefresh}
                type="button"
              >
                <RefreshCcw
                  className={`h-4 w-4 ${isContentLoading || isInsightsLoading ? "animate-spin" : ""}`}
                />
                Atualizar
              </button>
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-primary/24 bg-primary/10 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/12 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!canExportPdf || isExportingPdf}
                onClick={handleExportPdf}
                type="button"
              >
                <FileDown className="h-4 w-4" />
                {isExportingPdf ? "Preparando PDF..." : "Exportar PDF"}
              </button>
            </>
          )}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Social media", to: "/painel/social-media/meta" },
            { label: "Meta", to: "/painel/social-media/meta" },
            { label: activePage.name },
          ]}
          description="Dashboard premium de social media, pensado para leitura clara de resultados e apresentacao ao cliente."
          title={activePage.name}
        />

        <section className="panel-card relative overflow-hidden rounded-[2.2rem] border px-5 py-6 md:px-6 md:py-7">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[30rem] max-w-full bg-[radial-gradient(circle_at_top_right,rgba(34,98,240,0.16),transparent_58%)]" />

          <div className="relative z-10 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-sky-500/18 bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em] text-sky-500">
                  Facebook ativo
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em] ${
                    activeInstagramSources.length > 0 || activePage.hasInstagramBusinessAccount
                      ? "border-fuchsia-500/18 bg-fuchsia-500/10 text-fuchsia-500"
                      : "border-outline-variant/12 bg-surface-container-low text-on-surface-variant"
                  }`}
                >
                  {activeInstagramSources.length > 0 || activePage.hasInstagramBusinessAccount
                    ? "Instagram disponivel"
                    : "Sem Instagram"}
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-on-surface md:text-4xl">
                {activePage.name}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant md:text-base">
                Este painel usa a pagina do Facebook como base e, quando houver, cruza tambem o
                Instagram Business vinculado para montar uma leitura visual, objetiva e apresentavel.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  className="panel-card-muted inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                  onClick={() => navigate("/painel/social-media/meta")}
                  type="button"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para paginas
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="panel-card-muted rounded-[1.5rem] border p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                  Pagina Meta
                </p>
                <p className="mt-3 text-lg font-semibold text-on-surface">{activePage.pageId}</p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {activePage.category || "Categoria nao informada"}
                </p>
              </div>

              <div className="panel-card-muted rounded-[1.5rem] border p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                  Instagram principal
                </p>
                <p className="mt-3 text-lg font-semibold text-on-surface">
                  {primaryInstagramSource?.username
                    ? `@${primaryInstagramSource.username}`
                    : primaryInstagramSource
                      ? "Conta detectada pela pagina"
                      : "Nao vinculado"}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {primaryInstagramSource?.name ||
                    (primaryInstagramSource
                      ? `ID ${primaryInstagramSource.instagramAccountId}`
                      : "Sem perfil associado")}
                </p>
              </div>

              <div className="panel-card-muted rounded-[1.5rem] border p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                  Seguidores Instagram
                </p>
                <p className="mt-3 text-lg font-semibold text-on-surface">
                  {totalInstagramFollowers !== null ? formatInteger(totalInstagramFollowers) : "Nao disponivel"}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {activeInstagramSources.length > 0
                    ? `${Object.keys(instagramFollowersByAccountId).length}/${activeInstagramSources.length} perfil(is) resolveram follower_count.`
                    : "Nenhuma conta do Instagram vinculada no momento."}
                </p>
              </div>

              <div className="panel-card-muted rounded-[1.5rem] border p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                  Janela dos insights
                </p>
                <p className="mt-3 text-lg font-semibold text-on-surface">
                  {resolveInsightPeriodLabel(insightPeriod)}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {formatInsightWindowLabel(startDate, endDate, insightPeriod)}
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
                placeholder="Buscar por titulo, legenda, ID ou origem"
                value={searchValue}
                wrapperClassName="h-12 rounded-[1.2rem]"
              />
            </div>

            <AppSelect
              label="Plataforma"
              onChange={(event) => setPlatformFilter(event.target.value as PlatformFilter)}
              value={platformFilter}
            >
              <option value="all">Todas</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
            </AppSelect>

            <AppSelect
              label="Periodo insights"
              onChange={(event) =>
                setInsightPeriod(event.target.value as PanelMetaSocialInsightPeriod)
              }
              value={insightPeriod}
            >
              <option value="day">Diario</option>
              <option value="week">Semanal</option>
              <option value="days_28">28 dias</option>
              <option value="lifetime">Lifetime</option>
            </AppSelect>

            <AppInput
              disabled={insightPeriod === "lifetime"}
              label="Data inicial"
              onChange={(event) => setStartDate(event.target.value)}
              type="date"
              value={startDate}
            />

            <AppInput
              disabled={insightPeriod === "lifetime"}
              label="Data final"
              onChange={(event) => setEndDate(event.target.value)}
              type="date"
              value={endDate}
            />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_14rem]">
            <div className="rounded-[1.2rem] border border-outline-variant/12 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
              Insights em <span className="font-semibold text-on-surface">{resolveInsightPeriodLabel(insightPeriod)}</span> •{" "}
              {formatInsightWindowLabel(startDate, endDate, insightPeriod)}. Se nenhum post for
              escolhido na curadoria, o dashboard usa automaticamente os mais recentes.
            </div>

            <AppSelect
              label="Limite de conteudo"
              onChange={(event) => setLimit(Number(event.target.value))}
              value={String(limit)}
            >
              <option value="12">12 itens</option>
              <option value="25">25 itens</option>
              <option value="50">50 itens</option>
            </AppSelect>
          </div>

          <div className="mt-4">
            <PanelSocialMediaPostPicker
              emptyMessage="Nenhum post selecionado. O dashboard usa automaticamente os conteúdos mais recentes."
              label="Curadoria de posts"
              onChange={setSelectedContentIds}
              options={postPickerOptions}
              placeholder="Buscar posts para exibir no dashboard e no PDF"
              selectedIds={selectedContentIds}
            />
          </div>
        </section>

        {insightsError ? (
          <section className="panel-card rounded-[1.8rem] border border-amber-500/14 bg-amber-500/6 px-5 py-4">
            <p className="text-sm font-semibold text-on-surface">
              Alguns insights nao puderam ser carregados por completo
            </p>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{insightsError}</p>
          </section>
        ) : null}

        {contentError ? (
          <section className="panel-card rounded-[1.8rem] border border-amber-500/14 bg-amber-500/6 px-5 py-4">
            <p className="text-sm font-semibold text-on-surface">
              Parte dos conteudos nao foi carregada por completo
            </p>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{contentError}</p>
          </section>
        ) : null}

        {contentMetricsError ? (
          <section className="panel-card rounded-[1.8rem] border border-amber-500/14 bg-amber-500/6 px-5 py-4">
            <p className="text-sm font-semibold text-on-surface">
              Parte das metricas complementares dos posts nao foi carregada por completo
            </p>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{contentMetricsError}</p>
          </section>
        ) : null}

        <section className="space-y-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
              Insights organicos
            </p>
            <h2 className="mt-2 text-lg font-bold tracking-tight text-on-surface md:text-xl">
              Facebook e Instagram no periodo filtrado
            </h2>
          </div>

          <section className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
            {insightCards.map((item) => (
              <PanelMetricCard
                description={item.description}
                icon={item.icon}
                key={item.label}
                label={item.label}
                loading={isInsightsLoading}
                numberFormatter={formatInteger}
                toneClassName={item.toneClassName}
                value={formatInteger(item.valueNumber)}
                valueNumber={item.valueNumber}
                valueToneClassName={item.valueToneClassName}
              />
            ))}
          </section>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <PanelAnalyticsCard
            actions={(
              <span className="rounded-full border border-sky-500/16 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-500">
                {pageInsights?.requestedMetrics.length ?? 0} metrica(s)
              </span>
            )}
            description={`Serie organica da pagina do Facebook em ${resolveInsightPeriodLabel(
              pageInsights?.period ?? insightPeriod,
            ).toLowerCase()} • ${formatInsightWindowLabel(
              pageInsights?.startDate ?? startDate,
              pageInsights?.endDate ?? endDate,
              pageInsights?.period ?? insightPeriod,
            )}.`}
            eyebrow="Facebook"
            title="Linha do tempo da pagina"
          >
            <PanelLineChart
              labels={facebookChart.labels}
              loading={isInsightsLoading}
              range={resolveChartRange(facebookChart.labels.length)}
              series={facebookChart.series}
            />
          </PanelAnalyticsCard>

          <PanelAnalyticsCard
            actions={(
              <span className="rounded-full border border-fuchsia-500/16 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold text-fuchsia-500">
                {activeInstagramSources.length} perfil(is)
              </span>
            )}
            description={`Serie organica consolidada do Instagram em ${resolveInsightPeriodLabel(
              insightPeriod,
            ).toLowerCase()} • ${formatInsightWindowLabel(startDate, endDate, insightPeriod)}.`}
            eyebrow="Instagram"
            title="Linha do tempo dos perfis"
          >
            <PanelLineChart
              labels={instagramChart.labels}
              loading={isInsightsLoading}
              range={resolveChartRange(instagramChart.labels.length)}
              series={instagramChart.series}
            />
          </PanelAnalyticsCard>
        </section>

        <section className="space-y-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
              Curadoria visual
            </p>
            <h2 className="mt-2 text-lg font-bold tracking-tight text-on-surface md:text-xl">
              Acervo lido e posts escolhidos
            </h2>
          </div>

          <section className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
            {contentSummaryCards.map((item) => (
              <PanelMetricCard
                description={item.description}
                icon={item.icon}
                key={item.label}
                label={item.label}
                loading={isContentLoading}
                meta={"meta" in item ? item.meta : undefined}
                numberFormatter={"valueNumber" in item ? formatInteger : undefined}
                toneClassName={item.toneClassName}
                value={"value" in item ? item.value : formatInteger(item.valueNumber)}
                valueNumber={"valueNumber" in item ? item.valueNumber : undefined}
                valueToneClassName={item.valueToneClassName}
              />
            ))}
          </section>
        </section>

        <PanelAnalyticsCard
          description="Selecao visual dos posts que contam melhor a historia do resultado. Quando ha curadoria manual, o PDF usa exatamente esta mesma vitrine."
          eyebrow="Destaques"
          title="Vitrine do dashboard"
        >
          <PanelSocialMediaHighlightsGrid isLoading={isContentLoading} items={dashboardHighlights} />
        </PanelAnalyticsCard>

        <PanelSocialMediaContentTable isLoading={isContentLoading} items={filteredItems} />

        {activeInstagramSources.length === 0 ? (
          <section className="panel-card rounded-[1.9rem] border border-dashed px-6 py-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl border border-outline-variant/12 bg-surface-container-low text-on-surface-variant">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Instagram ainda nao disponivel para esta pagina
                </p>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  A leitura atual ja exibe os posts do Facebook. Quando existir conta do Instagram
                  Business vinculada, os posts, reels, seguidores e insights dela passam a
                  aparecer automaticamente neste mesmo fluxo de relatorio.
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="panel-card rounded-[1.9rem] border p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="panel-card-muted rounded-[1.4rem] border p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                Curadoria ativa
              </p>
              <p className="mt-3 text-lg font-semibold text-on-surface">
                {selectedContentIds.length > 0 ? `${selectedContentIds.length} post(s)` : "Automatico"}
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                {selectedContentIds.length > 0
                  ? "Posts escolhidos manualmente para o dashboard e o PDF."
                  : "O painel usa os conteudos mais recentes quando nao ha curadoria manual."}
              </p>
            </div>

            <div className="panel-card-muted rounded-[1.4rem] border p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                Ultimo bucket de insight
              </p>
              <p className="mt-3 text-lg font-semibold text-on-surface">
                {formatDateTime(
                  pageInsights?.metrics
                    .flatMap((metric) => metric.values.map((value) => value.endTime))
                    .filter((value): value is string => Boolean(value))
                    .sort((first, second) => new Date(second).getTime() - new Date(first).getTime())[0] ??
                    null,
                )}
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Data de fechamento mais recente retornada pelos insights do Facebook.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
