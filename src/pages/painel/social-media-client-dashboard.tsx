import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Camera,
  Eye,
  Heart,
  Image,
  MessageSquare,
  RefreshCcw,
  Search,
  Share2,
  Sparkles,
  Bookmark,
  Clapperboard,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { PanelAnalyticsCard } from "../../components/painel/PanelAnalyticsCard";
import {
  PanelMetaFilterMultiSelect,
  type PanelMetaFilterOption,
} from "../../components/painel/PanelMetaFilterMultiSelect";
import { PanelMetricCard } from "../../components/painel/PanelMetricCard";
import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { PanelProgressList } from "../../components/painel/PanelProgressList";
import { PanelSocialMediaContentTable } from "../../components/painel/PanelSocialMediaContentTable";
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
import { useDebouncedValue } from "../../hooks/painel/useDebouncedValue";
import {
  getPanelMetaConnectionStatus,
  type PanelMetaConnectionStatusRecord,
} from "../../services/painel/meta-api";
import {
  getPanelMetaSocialDashboardSummary,
  getPanelMetaSocialDashboardTimeline,
  listPanelMetaSocialAccounts,
  listPanelMetaSocialContent,
  listPanelMetaSocialInstagramAccounts,
  syncPanelMetaSocialCatalog,
  type PanelSocialMediaAccountRecord,
  type PanelSocialMediaContentItemRecord,
  type PanelSocialMediaContentKind,
  type PanelSocialMediaContentListFilters,
  type PanelSocialMediaContentListResponse,
  type PanelSocialMediaDashboardQuery,
  type PanelSocialMediaDashboardSummaryRecord,
  type PanelSocialMediaDashboardTimelineRecord,
  type PanelSocialMediaInstagramAccountFilterRecord,
  type PanelSocialMediaPlatform,
  type PanelSocialMediaSyncResponse,
} from "../../services/painel/social-media-api";
import { PanelLineChart } from "../../components/painel/PanelLineChart";

type DashboardPeriodPreset = "30d" | "7d" | "custom" | "today";
type PlatformFilter = PanelSocialMediaPlatform | "all";
type ContentKindFilter = PanelSocialMediaContentKind | "all";

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

function formatNumber(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
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

function buildHint(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" • ");
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

function getContentKindLabel(value: ContentKindFilter) {
  switch (value) {
    case "facebook_post":
      return "Posts Facebook";
    case "instagram_post":
      return "Posts Instagram";
    case "reel":
      return "Reels";
    default:
      return "Todos os formatos";
  }
}

function buildEmptySummary(
  pageId: string,
  startDate: string,
  endDate: string,
  instagramUserIds: string[],
  contentIds: string[] = [],
): PanelSocialMediaDashboardSummaryRecord {
  return {
    averageEngagementPerItem: 0,
    commentsCount: 0,
    contentIds,
    endDate,
    engagementsCount: 0,
    facebookPosts: 0,
    hasData: false,
    instagramMedia: 0,
    instagramPosts: 0,
    instagramUserIds,
    pageIds: [pageId],
    reach: 0,
    reactionsCount: 0,
    reels: 0,
    savedCount: 0,
    sharesCount: 0,
    startDate,
    totalItems: 0,
    viewsCount: 0,
  };
}

function buildEmptyTimeline(
  pageId: string,
  startDate: string,
  endDate: string,
  instagramUserIds: string[],
  contentIds: string[] = [],
): PanelSocialMediaDashboardTimelineRecord {
  return {
    contentIds,
    data: [],
    endDate,
    hasData: false,
    instagramUserIds,
    pageIds: [pageId],
    startDate,
  };
}

function buildEmptyContentResponse(
  page: number,
  perPage: number,
): PanelSocialMediaContentListResponse {
  return {
    items: [],
    page,
    perPage,
    total: 0,
    totalPages: 1,
  };
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

export default function SocialMediaClientDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pageId: rawPageId = "" } = useParams();
  const resolvedPageId = decodeURIComponent(rawPageId);
  const toast = useToast();
  const { token } = usePanelAuth();
  const [accounts, setAccounts] = useState<PanelSocialMediaAccountRecord[]>([]);
  const [instagramAccounts, setInstagramAccounts] = useState<PanelSocialMediaInstagramAccountFilterRecord[]>([]);
  const [metaStatus, setMetaStatus] = useState<PanelMetaConnectionStatusRecord | null>(null);
  const [summary, setSummary] = useState<PanelSocialMediaDashboardSummaryRecord | null>(null);
  const [timeline, setTimeline] = useState<PanelSocialMediaDashboardTimelineRecord | null>(null);
  const [contentResponse, setContentResponse] = useState<PanelSocialMediaContentListResponse | null>(null);
  const [contentCatalog, setContentCatalog] = useState<PanelSocialMediaContentItemRecord[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [contentKindFilter, setContentKindFilter] = useState<ContentKindFilter>("all");
  const [periodPreset, setPeriodPreset] = useState<DashboardPeriodPreset>("30d");
  const [startDate, setStartDate] = useState(() => getPresetRange("30d").startDate);
  const [endDate, setEndDate] = useState(() => getPresetRange("30d").endDate);
  const [selectedInstagramUserIds, setSelectedInstagramUserIds] = useState<string[]>([]);
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<PanelSocialMediaSyncResponse | null>(null);
  const dashboardRequestRef = useRef(0);
  const contentRequestRef = useRef(0);
  const catalogRequestRef = useRef(0);
  const debouncedSearchValue = useDebouncedValue(searchValue, 350);

  const activeAccount = useMemo(
    () => accounts.find((item) => item.pageId === resolvedPageId) ?? null,
    [accounts, resolvedPageId],
  );

  const activeInstagramAccounts = useMemo(
    () => instagramAccounts.filter((item) => item.pageId === resolvedPageId),
    [instagramAccounts, resolvedPageId],
  );

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
        setAccounts([]);
        setInstagramAccounts([]);
        setSummary(null);
        setTimeline(null);
        setContentResponse(null);
        setContentCatalog([]);
        return;
      }

      const [nextAccounts, nextInstagramAccounts] = await Promise.all([
        listPanelMetaSocialAccounts(token),
        listPanelMetaSocialInstagramAccounts(token, {
          pageIds: resolvedPageId ? [resolvedPageId] : undefined,
        }),
      ]);

      setAccounts(nextAccounts);
      setInstagramAccounts(nextInstagramAccounts);
    } catch (error) {
      setMetaStatus(null);
      setAccounts([]);
      setInstagramAccounts([]);
      setSummary(null);
      setTimeline(null);
      setContentResponse(null);
      setContentCatalog([]);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Não foi possível abrir o dashboard social desse cliente agora.",
      );
    } finally {
      setIsHydrating(false);
    }
  }, [resolvedPageId, token]);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  useEffect(() => {
    setSelectedInstagramUserIds((currentValues) =>
      currentValues.filter((value) =>
        activeInstagramAccounts.some((item) => item.instagramUserId === value),
      ),
    );
  }, [activeInstagramAccounts]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchValue, endDate, platformFilter, selectedInstagramUserIds, selectedContentIds, contentKindFilter, startDate]);

  const contentCatalogQuery = useMemo<PanelSocialMediaContentListFilters | null>(() => {
    if (metaStatus?.status !== "CONNECTED" || !resolvedPageId) {
      return null;
    }

    return {
      endDate: endDate || undefined,
      instagramUserIds: selectedInstagramUserIds.length > 0 ? selectedInstagramUserIds : undefined,
      page: 1,
      pageIds: [resolvedPageId],
      perPage: 100,
      platform: platformFilter === "all" ? undefined : platformFilter,
      startDate: startDate || undefined,
    };
  }, [endDate, metaStatus?.status, platformFilter, resolvedPageId, selectedInstagramUserIds, startDate]);

  const loadContentCatalog = useCallback(async (query: PanelSocialMediaContentListFilters | null) => {
    if (!token || !query || metaStatus?.status !== "CONNECTED") {
      setContentCatalog([]);
      return;
    }

    const requestId = catalogRequestRef.current + 1;
    catalogRequestRef.current = requestId;
    setIsCatalogLoading(true);

    try {
      const response = await listPanelMetaSocialContent(token, query);

      if (requestId !== catalogRequestRef.current) {
        return;
      }

      setContentCatalog(response.items);
    } catch {
      if (requestId !== catalogRequestRef.current) {
        return;
      }

      setContentCatalog([]);
    } finally {
      if (requestId === catalogRequestRef.current) {
        setIsCatalogLoading(false);
      }
    }
  }, [metaStatus?.status, token]);

  useEffect(() => {
    void loadContentCatalog(contentCatalogQuery);
  }, [contentCatalogQuery, loadContentCatalog]);

  useEffect(() => {
    setSelectedContentIds((currentValues) =>
      currentValues.filter((value) =>
        contentCatalog.some((item) => item.contentId === value),
      ),
    );
  }, [contentCatalog]);

  const kindResolvedContentIds = useMemo(() => {
    if (contentKindFilter === "all") {
      return [];
    }

    return contentCatalog
      .filter((item) => item.contentKind === contentKindFilter)
      .map((item) => item.contentId);
  }, [contentCatalog, contentKindFilter]);

  const resolvedContentIds = useMemo(() => {
    if (selectedContentIds.length > 0) {
      return selectedContentIds;
    }

    if (contentKindFilter === "all") {
      return [];
    }

    return kindResolvedContentIds;
  }, [contentKindFilter, kindResolvedContentIds, selectedContentIds]);

  const hasResolvedContentFilterEmpty =
    contentKindFilter !== "all" &&
    selectedContentIds.length === 0 &&
    !isCatalogLoading &&
    kindResolvedContentIds.length === 0;

  const dashboardQuery = useMemo<PanelSocialMediaDashboardQuery | null>(() => {
    if (metaStatus?.status !== "CONNECTED" || !resolvedPageId) {
      return null;
    }

    return {
      contentIds: resolvedContentIds.length > 0 ? resolvedContentIds : undefined,
      endDate: endDate || undefined,
      instagramUserIds: selectedInstagramUserIds.length > 0 ? selectedInstagramUserIds : undefined,
      pageIds: [resolvedPageId],
      startDate: startDate || undefined,
    };
  }, [endDate, metaStatus?.status, resolvedContentIds, resolvedPageId, selectedInstagramUserIds, startDate]);

  const contentQuery = useMemo<PanelSocialMediaContentListFilters | null>(() => {
    if (metaStatus?.status !== "CONNECTED" || !resolvedPageId) {
      return null;
    }

    return {
      contentIds: resolvedContentIds.length > 0 ? resolvedContentIds : undefined,
      endDate: endDate || undefined,
      instagramUserIds: selectedInstagramUserIds.length > 0 ? selectedInstagramUserIds : undefined,
      page,
      pageIds: [resolvedPageId],
      perPage: 12,
      platform: platformFilter === "all" ? undefined : platformFilter,
      search: debouncedSearchValue.trim() || undefined,
      startDate: startDate || undefined,
    };
  }, [debouncedSearchValue, endDate, metaStatus?.status, page, platformFilter, resolvedContentIds, resolvedPageId, selectedInstagramUserIds, startDate]);

  const loadDashboardData = useCallback(async (
    query: PanelSocialMediaDashboardQuery | null,
    shouldReturnEmpty: boolean,
  ) => {
    if (!resolvedPageId) {
      setSummary(null);
      setTimeline(null);
      setDashboardError(null);
      return;
    }

    if (!token || !query || metaStatus?.status !== "CONNECTED") {
      setSummary(null);
      setTimeline(null);
      setDashboardError(null);
      return;
    }

    if (shouldReturnEmpty) {
      setSummary(buildEmptySummary(
        resolvedPageId,
        startDate,
        endDate,
        selectedInstagramUserIds,
        [],
      ));
      setTimeline(buildEmptyTimeline(
        resolvedPageId,
        startDate,
        endDate,
        selectedInstagramUserIds,
        [],
      ));
      setDashboardError(null);
      return;
    }

    const requestId = dashboardRequestRef.current + 1;
    dashboardRequestRef.current = requestId;
    setIsDashboardLoading(true);
    setDashboardError(null);

    try {
      const [nextSummary, nextTimeline] = await Promise.all([
        getPanelMetaSocialDashboardSummary(token, query),
        getPanelMetaSocialDashboardTimeline(token, query),
      ]);

      if (requestId !== dashboardRequestRef.current) {
        return;
      }

      setSummary(nextSummary);
      setTimeline(nextTimeline);
    } catch (error) {
      if (requestId !== dashboardRequestRef.current) {
        return;
      }

      setDashboardError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o dashboard de social media agora.",
      );
      setSummary(null);
      setTimeline(null);
    } finally {
      if (requestId === dashboardRequestRef.current) {
        setIsDashboardLoading(false);
      }
    }
  }, [endDate, metaStatus?.status, resolvedPageId, selectedInstagramUserIds, startDate, token]);

  const loadContent = useCallback(async (
    query: PanelSocialMediaContentListFilters | null,
    shouldReturnEmpty: boolean,
  ) => {
    if (!query) {
      setContentResponse(null);
      setContentError(null);
      return;
    }

    if (!token || metaStatus?.status !== "CONNECTED") {
      setContentResponse(null);
      setContentError(null);
      return;
    }

    if (shouldReturnEmpty) {
      setContentResponse(buildEmptyContentResponse(query.page, query.perPage));
      setContentError(null);
      return;
    }

    const requestId = contentRequestRef.current + 1;
    contentRequestRef.current = requestId;
    setIsContentLoading(true);
    setContentError(null);

    try {
      const nextContent = await listPanelMetaSocialContent(token, query);

      if (requestId !== contentRequestRef.current) {
        return;
      }

      setContentResponse(nextContent);
    } catch (error) {
      if (requestId !== contentRequestRef.current) {
        return;
      }

      setContentError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os conteúdos sociais agora.",
      );
      setContentResponse(null);
    } finally {
      if (requestId === contentRequestRef.current) {
        setIsContentLoading(false);
      }
    }
  }, [metaStatus?.status, token]);

  useEffect(() => {
    void loadDashboardData(dashboardQuery, hasResolvedContentFilterEmpty);
  }, [dashboardQuery, hasResolvedContentFilterEmpty, loadDashboardData]);

  useEffect(() => {
    void loadContent(contentQuery, hasResolvedContentFilterEmpty);
  }, [contentQuery, hasResolvedContentFilterEmpty, loadContent]);

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
    void loadContentCatalog(contentCatalogQuery);
    void loadDashboardData(dashboardQuery, hasResolvedContentFilterEmpty);
    void loadContent(contentQuery, hasResolvedContentFilterEmpty);
  }, [
    contentCatalogQuery,
    contentQuery,
    dashboardQuery,
    hasResolvedContentFilterEmpty,
    loadContent,
    loadContentCatalog,
    loadContext,
    loadDashboardData,
  ]);

  const handleSync = useCallback(async () => {
    if (!token || metaStatus?.status !== "CONNECTED" || !resolvedPageId) {
      return;
    }

    setIsSyncing(true);

    try {
      const response = await syncPanelMetaSocialCatalog(token, {
        instagramMediaLimit: 35,
        instagramUserIds: selectedInstagramUserIds.length > 0 ? selectedInstagramUserIds : undefined,
        pageIds: [resolvedPageId],
        pagePostsLimit: 35,
      });

      setLastSyncResult(response);
      toast.success({
        title: "Catálogo social sincronizado",
        description: `${formatNumber(response.pagePostsSynced)} posts de página e ${formatNumber(response.instagramMediaSynced)} mídias do Instagram atualizados.`,
      });

      void loadContext();
      void loadContentCatalog(contentCatalogQuery);
      void loadDashboardData(dashboardQuery, hasResolvedContentFilterEmpty);
      void loadContent(contentQuery, hasResolvedContentFilterEmpty);
    } catch (error) {
      toast.error({
        title: "Falha ao sincronizar",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível sincronizar o catálogo social agora.",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [
    contentCatalogQuery,
    contentQuery,
    dashboardQuery,
    hasResolvedContentFilterEmpty,
    loadContent,
    loadContentCatalog,
    loadContext,
    loadDashboardData,
    metaStatus?.status,
    resolvedPageId,
    selectedInstagramUserIds,
    toast,
    token,
  ]);

  const instagramAccountOptions = useMemo<PanelMetaFilterOption[]>(
    () =>
      activeInstagramAccounts.map((item) => ({
        hint: buildHint([
          item.name,
          item.followersCount !== null ? `${formatNumber(item.followersCount)} seguidores` : null,
          item.mediaCount !== null ? `${formatNumber(item.mediaCount)} mídias` : null,
        ]),
        label: `@${item.username}`,
        value: item.instagramUserId,
      })),
    [activeInstagramAccounts],
  );

  const contentOptions = useMemo<PanelMetaFilterOption[]>(
    () =>
      contentCatalog.map((item) => ({
        hint: buildHint([
          getContentKindLabel(item.contentKind),
          formatCompactDate(item.publishedAt),
          `${formatNumber(item.engagementsCount)} engajamentos`,
        ]),
        label: item.title,
        value: item.contentId,
      })),
    [contentCatalog],
  );

  const summaryCards = useMemo(() => {
    return [
      {
        description: "Total de conteúdos do recorte atual, somando posts e reels disponíveis para o cliente.",
        icon: <Image className="h-5 w-5" />,
        label: "Conteúdos",
        meta: [
          { label: "Facebook", value: formatNumber(summary?.facebookPosts ?? 0) },
          { label: "Instagram", value: formatNumber(summary?.instagramPosts ?? 0) },
          { label: "Reels", value: formatNumber(summary?.reels ?? 0) },
        ],
        numberFormatter: (value: number) => formatNumber(value),
        toneClassName: "border-primary/18 bg-primary/10 text-primary",
        valueNumber: summary?.totalItems ?? 0,
      },
      {
        description: "Quantidade de reels no período selecionado.",
        icon: <Clapperboard className="h-5 w-5" />,
        label: "Reels",
        numberFormatter: (value: number) => formatNumber(value),
        toneClassName: "border-fuchsia-500/16 bg-fuchsia-500/10 text-fuchsia-500",
        valueNumber: summary?.reels ?? 0,
        valueToneClassName: "text-fuchsia-500",
      },
      {
        description: "Soma de interações capturadas no conjunto de conteúdos filtrado.",
        icon: <Activity className="h-5 w-5" />,
        label: "Engajamentos",
        meta: [
          { label: "Média por item", value: formatNumber(summary?.averageEngagementPerItem ?? 0, 1) },
        ],
        numberFormatter: (value: number) => formatNumber(value),
        toneClassName: "border-emerald-500/16 bg-emerald-500/10 text-emerald-500",
        valueNumber: summary?.engagementsCount ?? 0,
        valueToneClassName: "text-emerald-500",
      },
      {
        description: "Visualizações somadas dos conteúdos em que a API expôs esse dado.",
        icon: <Eye className="h-5 w-5" />,
        label: "Visualizações",
        numberFormatter: (value: number) => formatNumber(value),
        toneClassName: "border-sky-500/16 bg-sky-500/10 text-sky-500",
        valueNumber: summary?.viewsCount ?? 0,
        valueToneClassName: "text-sky-500",
      },
      {
        description: "Alcance estimado das publicações no recorte do relatório.",
        icon: <UsersRound className="h-5 w-5" />,
        label: "Alcance",
        numberFormatter: (value: number) => formatNumber(value),
        toneClassName: "border-amber-500/16 bg-amber-500/10 text-amber-500",
        valueNumber: summary?.reach ?? 0,
        valueToneClassName: "text-amber-500",
      },
      {
        description: "Quantidade de salvamentos conhecida no período filtrado.",
        icon: <Bookmark className="h-5 w-5" />,
        label: "Salvos",
        numberFormatter: (value: number) => formatNumber(value),
        toneClassName: "border-violet-500/16 bg-violet-500/10 text-violet-500",
        valueNumber: summary?.savedCount ?? 0,
        valueToneClassName: "text-violet-500",
      },
    ];
  }, [summary]);

  const timelineLabels = useMemo(
    () => timeline?.data.map((item) => item.date) ?? [],
    [timeline],
  );

  const timelineSeries = useMemo(
    () => [
      {
        color: "#10b981",
        label: "Engajamentos",
        values: timeline?.data.map((item) => item.engagementsCount) ?? [],
      },
      {
        color: "#7c3aed",
        label: "Reels",
        values: timeline?.data.map((item) => item.reels) ?? [],
      },
      {
        color: "#2262f0",
        label: "Posts Instagram",
        values: timeline?.data.map((item) => item.instagramPosts) ?? [],
      },
      {
        color: "#f59e0b",
        label: "Posts Facebook",
        values: timeline?.data.map((item) => item.facebookPosts) ?? [],
      },
    ],
    [timeline],
  );

  const performanceBreakdown = useMemo(
    () => [
      {
        color: "linear-gradient(90deg,#2262f0,#60a5fa)",
        helper: "Posts do Facebook capturados no período.",
        label: "Posts Facebook",
        value: summary?.facebookPosts ?? 0,
      },
      {
        color: "linear-gradient(90deg,#7c3aed,#a78bfa)",
        helper: "Posts de feed do Instagram retornados pela integração.",
        label: "Posts Instagram",
        value: summary?.instagramPosts ?? 0,
      },
      {
        color: "linear-gradient(90deg,#ec4899,#f9a8d4)",
        helper: "Reels identificados dentro do recorte filtrado.",
        label: "Reels",
        value: summary?.reels ?? 0,
      },
      {
        color: "linear-gradient(90deg,#ef4444,#fb7185)",
        helper: "Reações consolidadas nas publicações selecionadas.",
        label: "Reações",
        value: summary?.reactionsCount ?? 0,
      },
      {
        color: "linear-gradient(90deg,#f59e0b,#fbbf24)",
        helper: "Comentários somados no conjunto de conteúdos.",
        label: "Comentários",
        value: summary?.commentsCount ?? 0,
      },
      {
        color: "linear-gradient(90deg,#14b8a6,#5eead4)",
        helper: "Compartilhamentos identificados pela API.",
        label: "Compartilhamentos",
        value: summary?.sharesCount ?? 0,
      },
      {
        color: "linear-gradient(90deg,#8b5cf6,#c084fc)",
        helper: "Salvamentos conhecidos nas publicações filtradas.",
        label: "Salvos",
        value: summary?.savedCount ?? 0,
      },
    ],
    [summary],
  );

  const currentPeriodLabel = formatDashboardPeriodLabel(startDate, endDate);
  const activeFilterHighlights = [
    currentPeriodLabel,
    platformFilter === "all"
      ? "Todas as plataformas"
      : platformFilter === "instagram"
        ? "Somente Instagram"
        : "Somente Facebook",
    getContentKindLabel(contentKindFilter),
    ...(selectedInstagramUserIds.length > 0
      ? [formatSelectionSummary(selectedInstagramUserIds.length, "perfil IG", "perfis IG")]
      : activeInstagramAccounts.length > 0
        ? [formatSelectionSummary(activeInstagramAccounts.length, "perfil conectado", "perfis conectados")]
        : []),
    ...(selectedContentIds.length > 0
      ? [formatSelectionSummary(selectedContentIds.length, "conteúdo escolhido", "conteúdos escolhidos")]
      : []),
  ];
  const lastSyncLabel = lastSyncResult?.syncedAt
    ? formatDateTime(lastSyncResult.syncedAt)
    : "Ainda não sincronizado nesta sessão";
  const totalKnownFollowers = activeInstagramAccounts.reduce(
    (total, item) => total + (item.followersCount ?? 0),
    0,
  );
  const totalKnownMedia = activeInstagramAccounts.reduce(
    (total, item) => total + (item.mediaCount ?? 0),
    0,
  );
  const highlightItems = useMemo(() => {
    return [...contentCatalog]
      .sort((first, second) => {
        if (second.engagementsCount !== first.engagementsCount) {
          return second.engagementsCount - first.engagementsCount;
        }

        return new Date(second.publishedAt).getTime() - new Date(first.publishedAt).getTime();
      })
      .slice(0, 6);
  }, [contentCatalog]);
  const isRefreshing =
    isHydrating ||
    isDashboardLoading ||
    isContentLoading ||
    isCatalogLoading;

  if (isHydrating && !metaStatus && !loadError) {
    return (
      <StateCard
        description="Estamos validando a conexão Meta e preparando o dashboard social dessa conta."
        title="Carregando dashboard de social media"
      />
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
        title="Falha ao abrir o dashboard social"
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
            Ir para Contas e integrações
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        )}
        description="A integração Meta ainda não está conectada. Conecte a conta primeiro para abrir dashboards por cliente."
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
            Revisar integração
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        )}
        description={getPanelMetaStatusDescription(metaStatus.status)}
        title={`Integração Meta em atenção: ${getPanelMetaStatusLabel(metaStatus.status)}`}
      />
    );
  }

  if (accounts.length === 0) {
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
        description="A conexão Meta está ativa, mas nenhuma conta social foi retornada pela API neste momento."
        title="Nenhuma conta social disponível"
      />
    );
  }

  if (!activeAccount) {
    return (
      <StateCard
        action={(
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/16 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
            onClick={() => navigate("/painel/social-media")}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para contas
          </button>
        )}
        description={`A conta social ${resolvedPageId} não foi encontrada entre as contas liberadas pela integração atual.`}
        title="Conta social indisponível"
      />
    );
  }

  return (
    <>
      <Seo
        description={`Dashboard social da conta ${activeAccount.pageName}, com foco em posts, reels e análise por período.`}
        noindex
        path={location.pathname}
        structuredData={null}
        title={`Social Media • ${activeAccount.pageName}`}
      />

      <div className="space-y-6">
        <PanelPageHeader
          actions={(
            <>
              <MetaStatusBadge status={metaStatus.status} />
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSyncing}
                onClick={() => void handleSync()}
                type="button"
              >
                <Sparkles className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Sincronizando..." : "Sincronizar"}
              </button>
              <button
                className="panel-card-muted inline-flex h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                onClick={handleRefresh}
                type="button"
              >
                <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Atualizar
              </button>
            </>
          )}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Resultados" },
            { label: "Social Media", to: "/painel/social-media" },
            { label: activeAccount.pageName },
          ]}
          description="Dashboard mensal por conta social, com leitura de posts, reels, desempenho por período e seleção de conteúdos específicos."
          title={activeAccount.pageName}
        />

        <section className="panel-card relative overflow-hidden rounded-[2.2rem] border px-5 py-6 md:px-6 md:py-7">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[30rem] max-w-full bg-[radial-gradient(circle_at_top_right,rgba(34,98,240,0.16),transparent_58%)]" />

          <div className="relative z-10 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-primary/18 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em] text-primary">
                  Conta social ativa
                </span>
                <span className="rounded-full border border-outline-variant/12 bg-surface-container-low px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                  Relatório mensal
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-on-surface md:text-4xl">
                {activeAccount.pageName}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant md:text-base">
                A leitura abaixo usa a conta social retornada pela Meta para consolidar posts,
                reels, métricas de desempenho e destaques do período selecionado.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {activeFilterHighlights.map((item) => (
                  <span
                    className="inline-flex rounded-full border border-outline-variant/12 bg-surface-container-low px-3 py-1.5 text-xs font-semibold text-on-surface"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  className="panel-card-muted inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                  onClick={() => navigate("/painel/social-media")}
                  type="button"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para contas
                </button>
                <button
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-[linear-gradient(135deg,#2262f0,#4f86ff)] px-4 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(34,98,240,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(34,98,240,0.34)]"
                  onClick={() => void handleSync()}
                  type="button"
                >
                  <Sparkles className="h-4 w-4" />
                  Atualizar conteúdos da conta
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="panel-card-muted rounded-[1.5rem] border p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                  Página Meta
                </p>
                <p className="mt-3 text-lg font-semibold text-on-surface">{activeAccount.pageId}</p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {activeAccount.pageCategory || "Categoria não informada"}
                </p>
              </div>

              <div className="panel-card-muted rounded-[1.5rem] border p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                  Instagram principal
                </p>
                <p className="mt-3 text-lg font-semibold text-on-surface">
                  {activeAccount.instagramUsername ? `@${activeAccount.instagramUsername}` : "Não vinculado"}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {activeAccount.instagramName || "Sem perfil associado"}
                </p>
              </div>

              <div className="panel-card-muted rounded-[1.5rem] border p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                  Base conhecida
                </p>
                <p className="mt-3 text-lg font-semibold text-on-surface">
                  {formatNumber(totalKnownFollowers)} seguidores
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {formatNumber(totalKnownMedia)} mídias conhecidas nos perfis vinculados.
                </p>
              </div>

              <div className="panel-card-muted rounded-[1.5rem] border p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                  Última sync
                </p>
                <p className="mt-3 text-lg font-semibold text-on-surface">{lastSyncLabel}</p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Atualização mais recente registrada nesta sessão do painel.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="panel-card rounded-[2rem] border p-5 md:p-6">
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(12rem,0.32fr)_minmax(12rem,0.32fr)_minmax(0,0.42fr)]">
              <AppInput
                className="py-0"
                leadingIcon={<Search className="h-4 w-4" />}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Buscar título do conteúdo para filtrar a lista detalhada"
                value={searchValue}
                wrapperClassName="h-12 rounded-[1.2rem]"
              />

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
                label="Formato"
                onChange={(event) => setContentKindFilter(event.target.value as ContentKindFilter)}
                value={contentKindFilter}
              >
                <option value="all">Todos</option>
                <option value="facebook_post">Post Facebook</option>
                <option value="instagram_post">Post Instagram</option>
                <option value="reel">Reel</option>
              </AppSelect>

              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-1">
                <button
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    periodPreset === "today"
                      ? "border-primary bg-primary text-white"
                      : "panel-card-muted text-on-surface hover:border-primary/30 hover:text-primary"
                  }`}
                  onClick={() => handlePresetChange("today")}
                  type="button"
                >
                  Hoje
                </button>
                <button
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    periodPreset === "7d"
                      ? "border-primary bg-primary text-white"
                      : "panel-card-muted text-on-surface hover:border-primary/30 hover:text-primary"
                  }`}
                  onClick={() => handlePresetChange("7d")}
                  type="button"
                >
                  7 dias
                </button>
                <button
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    periodPreset === "30d"
                      ? "border-primary bg-primary text-white"
                      : "panel-card-muted text-on-surface hover:border-primary/30 hover:text-primary"
                  }`}
                  onClick={() => handlePresetChange("30d")}
                  type="button"
                >
                  30 dias
                </button>
                <button
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    periodPreset === "custom"
                      ? "border-primary bg-primary text-white"
                      : "panel-card-muted text-on-surface hover:border-primary/30 hover:text-primary"
                  }`}
                  onClick={() => handlePresetChange("custom")}
                  type="button"
                >
                  Personalizado
                </button>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-4">
              <AppInput
                label="Data inicial"
                leadingIcon={<CalendarDays className="h-4 w-4" />}
                onChange={(event) => handleStartDateChange(event.target.value)}
                type="date"
                value={startDate}
                wrapperClassName="rounded-[1.2rem]"
              />

              <AppInput
                label="Data final"
                leadingIcon={<CalendarDays className="h-4 w-4" />}
                onChange={(event) => handleEndDateChange(event.target.value)}
                type="date"
                value={endDate}
                wrapperClassName="rounded-[1.2rem]"
              />

              <PanelMetaFilterMultiSelect
                label="Perfis do Instagram"
                loading={isHydrating}
                onChange={setSelectedInstagramUserIds}
                options={instagramAccountOptions}
                placeholder="Todos os perfis vinculados"
                values={selectedInstagramUserIds}
              />

              <PanelMetaFilterMultiSelect
                label="Conteúdos"
                loading={isCatalogLoading}
                onChange={setSelectedContentIds}
                options={contentOptions}
                placeholder="Todos os conteúdos do recorte"
                values={selectedContentIds}
              />
            </div>
          </div>
        </section>

        {dashboardError ? (
          <section className="panel-card rounded-[1.8rem] border border-red-500/14 bg-red-500/6 px-5 py-4">
            <p className="text-sm font-semibold text-on-surface">
              Não foi possível carregar o dashboard de social media
            </p>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{dashboardError}</p>
          </section>
        ) : null}

        {contentError ? (
          <section className="panel-card rounded-[1.8rem] border border-red-500/14 bg-red-500/6 px-5 py-4">
            <p className="text-sm font-semibold text-on-surface">
              Não foi possível carregar a lista de conteúdos sociais
            </p>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{contentError}</p>
          </section>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-6">
          {summaryCards.map((item) => (
            <PanelMetricCard
              description={item.description}
              icon={item.icon}
              key={item.label}
              label={item.label}
              loading={isDashboardLoading}
              meta={item.meta}
              numberFormatter={item.numberFormatter}
              toneClassName={item.toneClassName}
              value={item.numberFormatter(item.valueNumber)}
              valueNumber={item.valueNumber}
              valueToneClassName={item.valueToneClassName}
            />
          ))}
        </section>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.95fr)]">
          <PanelAnalyticsCard
            description="Evolução diária de posts, reels e engajamento dentro do período escolhido."
            eyebrow="Timeline"
            title="Linha do tempo do período"
          >
            <PanelLineChart
              labels={timelineLabels}
              loading={isDashboardLoading}
              range={resolveChartRange(timelineLabels.length)}
              series={timelineSeries}
            />
          </PanelAnalyticsCard>

          <PanelAnalyticsCard
            description="Leitura rápida da composição do resultado por formato e interação."
            eyebrow="Composição"
            title="Distribuição do período"
          >
            <PanelProgressList
              formatValue={(value) => formatNumber(value)}
              items={performanceBreakdown}
              loading={isDashboardLoading}
            />
          </PanelAnalyticsCard>
        </div>

        <PanelAnalyticsCard
          description="Seleção visual dos conteúdos mais fortes do período para apoiar a apresentação mensal ao cliente."
          eyebrow="Destaques"
          title="Posts, reels e conteúdos em evidência"
        >
          <PanelSocialMediaHighlightsGrid
            isLoading={isCatalogLoading}
            items={highlightItems}
          />
        </PanelAnalyticsCard>

        <PanelSocialMediaContentTable
          currentPage={contentResponse?.page ?? page}
          isLoading={isContentLoading}
          items={contentResponse?.items ?? []}
          onPageChange={setPage}
          total={contentResponse?.total ?? 0}
          totalPages={contentResponse?.totalPages ?? 1}
        />
      </div>
    </>
  );
}
