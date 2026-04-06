import {
  Activity,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Clock3,
  Eye,
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

export default function SocialMediaMetaDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
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

    if (dashboard?.audienceGrowth) {
      nextCards.push({
        description: "Ganho líquido de seguidores/audiência orgânica retornado pela API para o período.",
        icon: <UsersRound className="h-5 w-5" />,
        label: "Seguidores ganhos",
        meta: [
          {
            label: "Base inicial",
            value: formatInteger(dashboard.audienceGrowth.startValue),
          },
          {
            label: "Base final",
            value: formatInteger(dashboard.audienceGrowth.endValue),
          },
          ...(dashboard.audienceGrowth.growthRate !== null
            ? [
                {
                  label: "Taxa",
                  value: formatSignedPercentage(dashboard.audienceGrowth.growthRate),
                },
              ]
            : []),
        ],
        numberFormatter: formatSignedInteger,
        toneClassName: "border-emerald-500/18 bg-emerald-500/10 text-emerald-500",
        value: formatSignedInteger(dashboard.audienceGrowth.delta),
        valueNumber: dashboard.audienceGrowth.delta,
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

  const handleRefresh = useCallback(() => {
    void loadContext();
    void loadDashboard();
    void loadContents();
  }, [loadContext, loadDashboard, loadContents]);

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
