import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarRange,
  CheckCircle2,
  CircleAlert,
  Clock3,
  ExternalLink,
  Image as ImageIcon,
  LoaderCircle,
  MousePointerClick,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { PanelLineChart } from "../../components/painel/PanelLineChart";
import { PanelMetricCard } from "../../components/painel/PanelMetricCard";
import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { Seo } from "../../components/shared/Seo";
import {
  getPanelLinkedInStatusBadgeClassName,
  getPanelLinkedInStatusDescription,
  getPanelLinkedInStatusLabel,
  panelLinkedInStatusNeedsReconnect,
} from "../../config/painel/linkedin-status";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import type { PanelDashboardRange } from "../../services/painel/dashboard-api";
import {
  getPanelLinkedInConnectionStatus,
  getPanelLinkedInSocialDashboard,
  listPanelLinkedInSocialContents,
  type PanelLinkedInConnectionStatusRecord,
  type PanelLinkedInSocialContentItemRecord,
  type PanelLinkedInSocialDashboardBestSlotRecord,
  type PanelLinkedInSocialDashboardComparisonMetricRecord,
  type PanelLinkedInSocialDashboardRecord,
  type PanelLinkedInSocialMediaContentType,
  type PanelLinkedInSocialMediaPerformanceBenchmark,
} from "../../services/painel/linkedin-api";

function formatDate(value: string | null) {
  if (!value) {
    return "Não disponível";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Não disponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
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

function formatNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "N/D";
  }

  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercentage(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "N/D";
  }

  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: value < 0.1 ? 2 : 1,
    minimumFractionDigits: 1,
    style: "percent",
  }).format(value);
}

function formatPerformanceMetricValue(
  value: number | null | undefined,
  benchmark: PanelLinkedInSocialMediaPerformanceBenchmark | null,
) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "N/D";
  }

  if (benchmark === "engagementRate" || (benchmark === null && value >= 0 && value <= 1)) {
    return formatPercentage(value);
  }

  return formatNumber(value);
}

function formatSignedValue(value: number | null | undefined, formatter: (value: number) => string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Sem base";
  }

  if (value === 0) {
    return "0";
  }

  return `${value > 0 ? "+" : ""}${formatter(value)}`;
}

function getContentTypeLabel(value: PanelLinkedInSocialMediaContentType) {
  switch (value) {
    case "image":
      return "Imagem";
    case "video":
      return "Vídeo";
    case "article":
      return "Artigo";
    case "document":
      return "Documento";
    case "carousel":
      return "Carrossel";
    case "poll":
      return "Enquete";
    case "event":
      return "Evento";
    case "other":
      return "Outro";
    default:
      return "Post";
  }
}

function getPerformanceClassificationLabel(
  value: PanelLinkedInSocialContentItemRecord["performance"]["classification"],
) {
  if (value === "above_average") {
    return "Acima da média";
  }

  if (value === "below_average") {
    return "Abaixo da média";
  }

  return "Sem classificação";
}

function getPerformanceClassificationToneClassName(
  value: PanelLinkedInSocialContentItemRecord["performance"]["classification"],
) {
  if (value === "above_average") {
    return "border-emerald-500/18 bg-emerald-500/10 text-emerald-500";
  }

  if (value === "below_average") {
    return "border-amber-500/18 bg-amber-500/10 text-amber-600";
  }

  return "border-outline-variant/14 bg-surface text-on-surface-variant";
}

function resolveChartRange(startDate: string, endDate: string): PanelDashboardRange {
  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);
  const diffInMs = parsedEndDate.getTime() - parsedStartDate.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (!Number.isFinite(diffInDays) || diffInDays <= 7) {
    return "7d";
  }

  if (diffInDays >= 180) {
    return "12m";
  }

  return "30d";
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

function LinkedInStatusBadge({
  status,
}: {
  status: PanelLinkedInConnectionStatusRecord["status"];
}) {
  const Icon =
    status === "CONNECTED"
      ? CheckCircle2
      : status === "EXPIRED"
        ? Clock3
        : CircleAlert;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getPanelLinkedInStatusBadgeClassName(
        status,
      )}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {getPanelLinkedInStatusLabel(status)}
    </span>
  );
}

function ComparisonCard({
  icon: Icon,
  label,
  metric,
  valueFormatter,
}: {
  icon: LucideIcon;
  label: string;
  metric: PanelLinkedInSocialDashboardComparisonMetricRecord;
  valueFormatter: (value: number) => string;
}) {
  return (
    <article className="panel-card-muted rounded-[1.6rem] border p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            {label}
          </p>
          <p className="mt-3 text-2xl font-black tracking-tight text-on-surface">
            {typeof metric.current === "number" ? valueFormatter(metric.current) : "N/D"}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/16 bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <p className="text-on-surface-variant">
          Anterior: <span className="font-semibold text-on-surface">{typeof metric.previous === "number" ? valueFormatter(metric.previous) : "N/D"}</span>
        </p>
        <p className="text-on-surface-variant">
          Delta: <span className="font-semibold text-on-surface">{formatSignedValue(metric.delta, valueFormatter)}</span>
        </p>
        <p className="text-on-surface-variant">
          Variação: <span className="font-semibold text-on-surface">{formatSignedValue(metric.deltaPercentage, formatPercentage)}</span>
        </p>
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
    <article className="panel-card-muted rounded-[1.6rem] border p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            {title}
          </p>
          <p className="mt-3 text-2xl font-black tracking-tight text-on-surface">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/16 bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">{description}</p>
    </article>
  );
}

function RankingCard({
  item,
}: {
  item: PanelLinkedInSocialContentItemRecord;
}) {
  const title = item.caption?.trim() || `${getContentTypeLabel(item.contentType)} do LinkedIn`;

  return (
    <article className="panel-premium-card rounded-[1.8rem] border p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-[1.2rem] border border-outline-variant/12 bg-surface-container-low">
          {item.thumbnailUrl ? (
            <img
              alt={title}
              className="h-full w-full object-cover"
              src={item.thumbnailUrl}
            />
          ) : (
            <BriefcaseBusiness className="h-5 w-5 text-primary" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-full border border-primary/14 bg-primary/8 px-3 py-1 text-[11px] font-semibold text-primary">
              {getContentTypeLabel(item.contentType)}
            </span>
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${getPerformanceClassificationToneClassName(
                item.performance.classification,
              )}`}
            >
              {getPerformanceClassificationLabel(item.performance.classification)}
            </span>
          </div>

          <p className="mt-3 line-clamp-3 text-sm font-semibold leading-relaxed text-on-surface">
            {title}
          </p>
          <p className="mt-2 text-xs text-on-surface-variant">{formatDateTime(item.publishedAt)}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex rounded-full border border-outline-variant/14 bg-surface px-2.5 py-1 text-[10px] font-semibold text-on-surface-variant">
              {formatNumber(item.metrics.impressions)} impressões
            </span>
            <span className="inline-flex rounded-full border border-outline-variant/14 bg-surface px-2.5 py-1 text-[10px] font-semibold text-on-surface-variant">
              {formatNumber(item.metrics.engagement)} engajamentos
            </span>
            <span className="inline-flex rounded-full border border-outline-variant/14 bg-surface px-2.5 py-1 text-[10px] font-semibold text-on-surface-variant">
              {formatPerformanceMetricValue(item.performance.value, item.performance.benchmark)}{" "}
              {item.performance.benchmark || "benchmark"}
            </span>
          </div>

          {item.permalink ? (
            <a
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
              href={item.permalink}
              rel="noreferrer"
              target="_blank"
            >
              Abrir publicação
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function buildPublicationPatternSummary({
  bestSlot,
  benchmark,
  emptyLabel,
}: {
  bestSlot: PanelLinkedInSocialDashboardBestSlotRecord | null;
  benchmark: PanelLinkedInSocialMediaPerformanceBenchmark | null;
  emptyLabel: string;
}) {
  if (!bestSlot) {
    return emptyLabel;
  }

  const performanceLabel = bestSlot.averagePerformanceValue === null
    ? "sem média consolidada"
    : `${formatPerformanceMetricValue(bestSlot.averagePerformanceValue, benchmark)} de média em ${benchmark || "benchmark"}`;

  return `${bestSlot.label} • ${bestSlot.contentCount} conteúdo(s) • ${performanceLabel}`;
}

export default function SocialMediaLinkedInDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { accountId } = useParams<{ accountId: string }>();
  const { token } = usePanelAuth();
  const [linkedinStatus, setLinkedInStatus] =
    useState<PanelLinkedInConnectionStatusRecord | null>(null);
  const [dashboard, setDashboard] = useState<PanelLinkedInSocialDashboardRecord | null>(null);
  const [contents, setContents] = useState<PanelLinkedInSocialContentItemRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadContext = useCallback(async (refreshOnly = false) => {
    if (!token || !accountId) {
      return;
    }

    if (refreshOnly) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setLoadError(null);

    try {
      const nextStatus = await getPanelLinkedInConnectionStatus(token);
      setLinkedInStatus(nextStatus);

      if (nextStatus.status !== "CONNECTED") {
        setDashboard(null);
        setContents([]);
        return;
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const [nextDashboard, nextContentsResponse] = await Promise.all([
        getPanelLinkedInSocialDashboard(token, {
          accountId,
          rankingLimit: 6,
          timezone,
        }),
        listPanelLinkedInSocialContents(token, {
          accountId,
          limit: 12,
          orderBy: "publishedAt",
          orderDirection: "desc",
          timezone,
        }),
      ]);

      setDashboard(nextDashboard);
      setContents(nextContentsResponse.data);
    } catch (error) {
      setDashboard(null);
      setContents([]);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o dashboard social do LinkedIn agora.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [accountId, token]);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  const chartRange = useMemo(() => {
    if (!dashboard) {
      return "30d" satisfies PanelDashboardRange;
    }

    return resolveChartRange(dashboard.startDate, dashboard.endDate);
  }, [dashboard]);

  const timelineLabels = useMemo(
    () => dashboard?.timeSeries.map((item) => item.bucketStart) ?? [],
    [dashboard],
  );
  const timelineSeries = useMemo(
    () => dashboard
      ? [
          {
            color: "#0A66C2",
            label: "Impressões",
            values: dashboard.timeSeries.map((item) => item.metrics.impressions),
          },
          {
            color: "#22C55E",
            label: "Cliques",
            values: dashboard.timeSeries.map((item) => item.metrics.clicks),
          },
          {
            color: "#F97316",
            label: "Engajamento",
            values: dashboard.timeSeries.map((item) => item.metrics.engagement),
          },
        ]
      : [],
    [dashboard],
  );

  const contentTypeCards = useMemo(
    () => dashboard?.engagementRateByContentType.slice(0, 4) ?? [],
    [dashboard],
  );
  const rankingItems = useMemo(
    () => dashboard?.ranking.slice(0, 6) ?? [],
    [dashboard],
  );
  const profileUrl = dashboard?.account.profileUrl ?? null;
  const accountTitle = dashboard?.account.displayName ?? accountId ?? "Organization";

  return (
    <>
      <Seo
        description="Dashboard social do LinkedIn com visão consolidada, comparativo do período, timeline e biblioteca de conteúdos da organization selecionada."
        noindex
        path={location.pathname}
        structuredData={null}
        title={`Social Media • LinkedIn • ${accountTitle}`}
      />

      <div className="space-y-6">
        <PanelPageHeader
          actions={(
            <>
              {linkedinStatus ? <LinkedInStatusBadge status={linkedinStatus.status} /> : null}
              {profileUrl ? (
                <a
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/16 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                  href={profileUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Ver company page
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isRefreshing}
                onClick={() => void loadContext(true)}
                type="button"
              >
                <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Atualizar
              </button>
            </>
          )}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Social media", to: "/painel/social-media/linkedin" },
            { label: "LinkedIn", to: "/painel/social-media/linkedin" },
            { label: accountTitle },
          ]}
          description={dashboard?.account.description || "Leitura social inicial do LinkedIn com foco em performance orgânica, padrão de publicação e conteúdos recentes."}
          title={accountTitle}
        />

        <div className="flex flex-wrap gap-3">
          <button
            className="panel-card-muted inline-flex h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
            onClick={() => navigate("/painel/social-media/linkedin")}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para organizations
          </button>
        </div>

        {isLoading ? (
          <section className="panel-premium-card overflow-hidden rounded-[2.2rem] border p-8">
            <div className="flex min-h-[18rem] flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.7rem] border border-primary/14 bg-primary/10 text-primary">
                <LoaderCircle className="h-7 w-7 animate-spin" />
              </div>
              <h2 className="mt-6 text-2xl font-black tracking-tight text-on-surface">
                Carregando dashboard LinkedIn
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-on-surface-variant">
                Estamos consolidando o overview da organization, a série temporal e os conteúdos do período.
              </p>
            </div>
          </section>
        ) : null}

        {!isLoading && loadError ? (
          <StateCard
            action={(
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                onClick={() => void loadContext()}
                type="button"
              >
                <RefreshCcw className="h-4 w-4" />
                Tentar novamente
              </button>
            )}
            description={loadError}
            title="Não foi possível carregar o dashboard do LinkedIn"
          />
        ) : null}

        {!isLoading && linkedinStatus?.status === "NOT_CONNECTED" ? (
          <StateCard
            action={(
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                onClick={() => navigate("/painel/contas-integracao/linkedin")}
                type="button"
              >
                Ir para Contas e integrações
                <ArrowUpRight className="h-4 w-4" />
              </button>
            )}
            description="A integração LinkedIn ainda não está conectada. Conclua a autenticação para liberar esta leitura social."
            title="Conecte o LinkedIn para abrir o dashboard"
          />
        ) : null}

        {!isLoading && linkedinStatus && panelLinkedInStatusNeedsReconnect(linkedinStatus.status) ? (
          <StateCard
            action={(
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                onClick={() => navigate("/painel/contas-integracao/linkedin")}
                type="button"
              >
                Revisar integração
                <ArrowUpRight className="h-4 w-4" />
              </button>
            )}
            description={getPanelLinkedInStatusDescription(linkedinStatus.status)}
            title={`Operação LinkedIn em atenção: ${getPanelLinkedInStatusLabel(linkedinStatus.status)}`}
          />
        ) : null}

        {!isLoading && dashboard && linkedinStatus?.status === "CONNECTED" ? (
          <>
            <section className="panel-card rounded-[2rem] border px-5 py-6 md:px-6 md:py-7">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <PanelMetricCard
                  description={`Volume de impressões orgânicas entre ${formatDate(dashboard.startDate)} e ${formatDate(dashboard.endDate)}.`}
                  icon={<BarChart3 className="h-5 w-5" />}
                  label="Impressões"
                  numberFormatter={formatCompactNumber}
                  toneClassName="border-primary/18 bg-primary/10 text-primary"
                  value={formatNumber(dashboard.overview.metrics.impressions)}
                  valueNumber={dashboard.overview.metrics.impressions}
                />
                <PanelMetricCard
                  description="Cliques somados no período, úteis para avaliar tração e intenção sobre o conteúdo."
                  icon={<MousePointerClick className="h-5 w-5" />}
                  label="Cliques"
                  numberFormatter={formatCompactNumber}
                  toneClassName="border-emerald-500/18 bg-emerald-500/10 text-emerald-500"
                  value={formatNumber(dashboard.overview.metrics.clicks)}
                  valueNumber={dashboard.overview.metrics.clicks}
                />
                <PanelMetricCard
                  description="Engajamentos totais combinando likes, comentários, compartilhamentos e ações agregadas."
                  icon={<TrendingUp className="h-5 w-5" />}
                  label="Engajamento"
                  numberFormatter={formatCompactNumber}
                  toneClassName="border-orange-500/18 bg-orange-500/10 text-orange-500"
                  value={formatNumber(dashboard.overview.metrics.engagement)}
                  valueNumber={dashboard.overview.metrics.engagement}
                />
                <PanelMetricCard
                  description="Taxa média de engajamento utilizada como benchmark do recorte atual."
                  icon={<Sparkles className="h-5 w-5" />}
                  label="Engagement rate"
                  numberFormatter={formatPercentage}
                  toneClassName="border-violet-500/18 bg-violet-500/10 text-violet-500"
                  value={formatPercentage(dashboard.overview.metrics.engagementRate)}
                  valueNumber={dashboard.overview.metrics.engagementRate ?? undefined}
                />
              </div>
            </section>

            {!dashboard.hasData ? (
              <StateCard
                description="A organization foi encontrada, mas ainda não há dados suficientes no período padrão retornado pela API para montar o overview."
                title="Sem atividade consolidada no recorte atual"
              />
            ) : (
              <>
                <section className="panel-premium-card rounded-[2rem] border p-6 md:p-7">
                  <div className="flex flex-col gap-4 border-b border-outline-variant/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
                        Linha do tempo
                      </p>
                      <h2 className="mt-2 text-lg font-bold tracking-tight text-on-surface md:text-xl">
                        Evolução do período
                      </h2>
                      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
                        Série temporal consolidada com base na granularidade definida pelo backend para o intervalo de {formatDate(dashboard.startDate)} até {formatDate(dashboard.endDate)}.
                      </p>
                    </div>

                    <div className="rounded-[1.2rem] border border-outline-variant/12 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
                      {dashboard.granularity} • {dashboard.timezone}
                    </div>
                  </div>

                  <div className="pt-5">
                    <PanelLineChart
                      labels={timelineLabels}
                      range={chartRange}
                      series={timelineSeries}
                    />
                  </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-3">
                  <ComparisonCard
                    icon={CalendarRange}
                    label="Conteúdos"
                    metric={dashboard.comparison.contentCount}
                    valueFormatter={formatCompactNumber}
                  />
                  <ComparisonCard
                    icon={BarChart3}
                    label="Impressões"
                    metric={dashboard.comparison.impressions}
                    valueFormatter={formatCompactNumber}
                  />
                  <ComparisonCard
                    icon={Sparkles}
                    label="Engagement rate"
                    metric={dashboard.comparison.engagementRate}
                    valueFormatter={formatPercentage}
                  />
                </section>

                <section className="grid gap-4 xl:grid-cols-3">
                  <PatternCard
                    description={`Período avaliado: ${formatDate(dashboard.startDate)} até ${formatDate(dashboard.endDate)}.`}
                    icon={CalendarRange}
                    title="Recorte"
                    value={`${formatDate(dashboard.startDate)} - ${formatDate(dashboard.endDate)}`}
                  />
                  <PatternCard
                    description={buildPublicationPatternSummary({
                      bestSlot: dashboard.bestDayOfWeek,
                      benchmark: dashboard.overview.performanceBenchmark,
                      emptyLabel: "O backend ainda não indicou um melhor dia da semana.",
                    })}
                    icon={TrendingUp}
                    title="Melhor dia"
                    value={dashboard.bestDayOfWeek?.label ?? "Sem destaque"}
                  />
                  <PatternCard
                    description={buildPublicationPatternSummary({
                      bestSlot: dashboard.bestHourOfDay,
                      benchmark: dashboard.overview.performanceBenchmark,
                      emptyLabel: "O backend ainda não indicou um melhor horário de publicação.",
                    })}
                    icon={Clock3}
                    title="Melhor horário"
                    value={dashboard.bestHourOfDay?.label ?? "Sem destaque"}
                  />
                </section>

                <section className="panel-premium-card rounded-[2rem] border p-6 md:p-7">
                  <div className="flex flex-col gap-3 border-b border-outline-variant/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
                        Tipos de conteúdo
                      </p>
                      <h2 className="mt-2 text-lg font-bold tracking-tight text-on-surface md:text-xl">
                        Engagement rate por formato
                      </h2>
                    </div>
                    <div className="rounded-[1.2rem] border border-outline-variant/12 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
                      Benchmark: {dashboard.overview.performanceBenchmark || "não informado"}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {contentTypeCards.length > 0 ? contentTypeCards.map((item) => (
                      <article className="panel-card-muted rounded-[1.5rem] border p-4" key={`${item.contentType}-${item.contentCount}`}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                          {getContentTypeLabel(item.contentType)}
                        </p>
                        <p className="mt-3 text-2xl font-black tracking-tight text-on-surface">
                          {formatPercentage(item.averageEngagementRate)}
                        </p>
                        <div className="mt-4 space-y-2 text-sm text-on-surface-variant">
                          <p>{item.contentCount} conteúdo(s)</p>
                          <p>{formatNumber(item.metrics.engagement)} engajamentos</p>
                          <p>{formatNumber(item.metrics.impressions)} impressões</p>
                        </div>
                      </article>
                    )) : (
                      <div className="rounded-[1.5rem] border border-dashed border-outline-variant/16 px-6 py-10 text-center text-sm text-on-surface-variant md:col-span-2 xl:col-span-4">
                        O backend ainda não retornou um breakdown por tipo de conteúdo para este período.
                      </div>
                    )}
                  </div>
                </section>

                <section className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
                      Ranking
                    </p>
                    <h2 className="mt-2 text-lg font-bold tracking-tight text-on-surface md:text-xl">
                      Conteúdos em destaque
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                      Seleção retornada pelo dashboard com base no benchmark principal definido pelo backend.
                    </p>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    {rankingItems.length > 0 ? rankingItems.map((item) => (
                      <RankingCard item={item} key={item.id} />
                    )) : (
                      <div className="rounded-[1.75rem] border border-dashed border-outline-variant/16 px-6 py-12 text-center text-sm text-on-surface-variant xl:col-span-2">
                        O ranking ainda não retornou conteúdos destacados para este recorte.
                      </div>
                    )}
                  </div>
                </section>

                <section className="panel-premium-card rounded-[2rem] border p-6 md:p-7">
                  <div className="flex flex-col gap-4 border-b border-outline-variant/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
                        Biblioteca social
                      </p>
                      <h2 className="mt-2 text-lg font-bold tracking-tight text-on-surface md:text-xl">
                        Conteúdos recentes
                      </h2>
                      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
                        Últimos conteúdos retornados pelo endpoint paginado do LinkedIn, preservando classificação de performance e acesso rápido ao link original.
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-outline-variant/12 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
                      {contents.length} item{contents.length === 1 ? "" : "s"}
                    </div>
                  </div>

                  <div className="mt-5 overflow-x-auto">
                    {contents.length > 0 ? (
                      <table className="min-w-full border-separate border-spacing-y-2 text-left">
                        <thead>
                          <tr className="text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                            <th className="px-4 py-2">Conteúdo</th>
                            <th className="px-4 py-2">Métricas</th>
                            <th className="px-4 py-2">Performance</th>
                            <th className="px-4 py-2">Publicado em</th>
                            <th className="px-4 py-2 text-right">Link</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contents.map((item) => (
                            <tr
                              className="bg-surface-container-low/75 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-surface-container-low"
                              key={item.id}
                            >
                              <td className="rounded-l-[1.2rem] px-4 py-4">
                                <div className="flex min-w-[24rem] items-start gap-4">
                                  <div className="flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-[1.2rem] border border-outline-variant/10 bg-surface-container-high">
                                    {item.thumbnailUrl ? (
                                      <img
                                        alt={item.caption || item.id}
                                        className="h-full w-full object-cover"
                                        src={item.thumbnailUrl}
                                      />
                                    ) : (
                                      <ImageIcon className="h-5 w-5 text-on-surface-variant" />
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="line-clamp-2 text-sm font-semibold text-on-surface">
                                      {item.caption?.trim() || `${getContentTypeLabel(item.contentType)} do LinkedIn`}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      <span className="inline-flex rounded-full border border-primary/14 bg-primary/8 px-2.5 py-1 text-[10px] font-semibold text-primary">
                                        {getContentTypeLabel(item.contentType)}
                                      </span>
                                      <span
                                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getPerformanceClassificationToneClassName(
                                          item.performance.classification,
                                        )}`}
                                      >
                                        {getPerformanceClassificationLabel(item.performance.classification)}
                                      </span>
                                    </div>
                                    <p className="mt-3 truncate text-[11px] text-on-surface-variant/85">
                                      {item.sourceId}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex min-w-[15rem] flex-wrap gap-2">
                                  <span className="inline-flex rounded-full border border-outline-variant/12 bg-surface px-2.5 py-1 text-[10px] font-semibold text-on-surface-variant">
                                    {formatNumber(item.metrics.impressions)} impressões
                                  </span>
                                  <span className="inline-flex rounded-full border border-outline-variant/12 bg-surface px-2.5 py-1 text-[10px] font-semibold text-on-surface-variant">
                                    {formatNumber(item.metrics.clicks)} cliques
                                  </span>
                                  <span className="inline-flex rounded-full border border-outline-variant/12 bg-surface px-2.5 py-1 text-[10px] font-semibold text-on-surface-variant">
                                    {formatNumber(item.metrics.likes)} likes
                                  </span>
                                  <span className="inline-flex rounded-full border border-outline-variant/12 bg-surface px-2.5 py-1 text-[10px] font-semibold text-on-surface-variant">
                                    {formatNumber(item.metrics.comments)} comentários
                                  </span>
                                  <span className="inline-flex rounded-full border border-outline-variant/12 bg-surface px-2.5 py-1 text-[10px] font-semibold text-on-surface-variant">
                                    {formatNumber(item.metrics.shares)} compartilhamentos
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-on-surface">
                                    {formatPerformanceMetricValue(item.performance.value, item.performance.benchmark)}
                                  </p>
                                  <p className="text-xs text-on-surface-variant">
                                    Média: {formatPerformanceMetricValue(item.performance.average, item.performance.benchmark)}
                                  </p>
                                  <p className="text-xs text-on-surface-variant">
                                    Benchmark: {item.performance.benchmark || "não informado"}
                                  </p>
                                </div>
                              </td>

                              <td className="px-4 py-4 text-sm text-on-surface-variant">
                                {formatDateTime(item.publishedAt)}
                              </td>

                              <td className="rounded-r-[1.2rem] px-4 py-4 text-right">
                                {item.permalink ? (
                                  <a
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-outline-variant/16 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                                    href={item.permalink}
                                    rel="noreferrer"
                                    target="_blank"
                                  >
                                    Abrir
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                ) : (
                                  <span className="text-sm text-on-surface-variant">Sem link</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="flex min-h-[14rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-outline-variant/16 px-6 text-center">
                        <p className="text-base font-semibold text-on-surface">
                          Nenhum conteúdo retornado para esta organization
                        </p>
                        <p className="mt-2 max-w-lg text-sm leading-relaxed text-on-surface-variant">
                          Assim que a API devolver posts normalizados para o recorte padrão, eles aparecerão aqui com métricas e classificação.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}
          </>
        ) : null}
      </div>
    </>
  );
}
