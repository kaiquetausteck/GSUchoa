import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Eye,
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
import { PanelGoogleDashboardTable } from "../../components/painel/PanelGoogleDashboardTable";
import {
  PanelMetaFilterMultiSelect,
  type PanelMetaFilterOption,
} from "../../components/painel/PanelMetaFilterMultiSelect";
import { PanelLineChart } from "../../components/painel/PanelLineChart";
import { PanelMetricCard } from "../../components/painel/PanelMetricCard";
import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { PanelProgressList } from "../../components/painel/PanelProgressList";
import { Seo } from "../../components/shared/Seo";
import { AppInput } from "../../components/shared/ui/AppInput";
import {
  getPanelGoogleStatusBadgeClassName,
  getPanelGoogleStatusDescription,
  getPanelGoogleStatusLabel,
  panelGoogleStatusNeedsReconnect,
} from "../../config/painel/google-status";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import { useDebouncedValue } from "../../hooks/painel/useDebouncedValue";
import {
  getPanelGoogleConnectionStatus,
  listPanelGoogleAdsCustomers,
  type PanelGoogleAdsCustomerRecord,
  type PanelGoogleConnectionStatusRecord,
} from "../../services/painel/google-api";
import {
  getPanelGoogleDashboardFunnel,
  getPanelGoogleDashboardSummary,
  getPanelGoogleDashboardTable,
  getPanelGoogleDashboardTimeline,
  listPanelGoogleFilterAdGroups,
  listPanelGoogleFilterAds,
  listPanelGoogleFilterCampaigns,
  type PanelGoogleDashboardFunnelRecord,
  type PanelGoogleDashboardQuery,
  type PanelGoogleDashboardSummaryRecord,
  type PanelGoogleDashboardTableLevel,
  type PanelGoogleDashboardTableRecord,
  type PanelGoogleDashboardTimelineRecord,
  type PanelGoogleFiltersAdGroupRecord,
  type PanelGoogleFiltersAdRecord,
  type PanelGoogleFiltersCampaignRecord,
} from "../../services/painel/google-dashboard-api";

type DashboardPeriodPreset = "30d" | "7d" | "custom" | "today";

type DashboardRequestSnapshot = PanelGoogleDashboardQuery & {
  customerId: string;
  level: PanelGoogleDashboardTableLevel;
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

function buildHint(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" • ");
}

function toCampaignOptions(items: PanelGoogleFiltersCampaignRecord[]): PanelMetaFilterOption[] {
  return items.map((item) => ({
    hint: buildHint([item.advertisingChannelType, item.advertisingChannelSubType, item.status]),
    label: item.name,
    value: item.id,
  }));
}

function toAdGroupOptions(items: PanelGoogleFiltersAdGroupRecord[]): PanelMetaFilterOption[] {
  return items.map((item) => ({
    hint: buildHint([item.type ?? item.status, `Campanha ${item.googleCampaignId}`]),
    label: item.name,
    value: item.id,
  }));
}

function toAdOptions(items: PanelGoogleFiltersAdRecord[]): PanelMetaFilterOption[] {
  return items.map((item) => ({
    hint: buildHint([item.adType ?? item.status, `Grupo ${item.googleAdGroupId}`]),
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

function GoogleStatusBadge({
  status,
}: {
  status: PanelGoogleConnectionStatusRecord["status"];
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPanelGoogleStatusBadgeClassName(
        status,
      )}`}
    >
      {getPanelGoogleStatusLabel(status)}
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

export default function PaidMediaGoogleAccountDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = usePanelAuth();
  const { customerId: routeCustomerId = "" } = useParams<{ customerId: string }>();
  const customerId = useMemo(() => decodeURIComponent(routeCustomerId), [routeCustomerId]);
  const [statusRecord, setStatusRecord] = useState<PanelGoogleConnectionStatusRecord | null>(null);
  const [customers, setCustomers] = useState<PanelGoogleAdsCustomerRecord[]>([]);
  const [campaignOptions, setCampaignOptions] = useState<PanelGoogleFiltersCampaignRecord[]>([]);
  const [adGroupOptions, setAdGroupOptions] = useState<PanelGoogleFiltersAdGroupRecord[]>([]);
  const [adOptions, setAdOptions] = useState<PanelGoogleFiltersAdRecord[]>([]);
  const [summary, setSummary] = useState<PanelGoogleDashboardSummaryRecord | null>(null);
  const [timeline, setTimeline] = useState<PanelGoogleDashboardTimelineRecord | null>(null);
  const [funnel, setFunnel] = useState<PanelGoogleDashboardFunnelRecord | null>(null);
  const [tableData, setTableData] = useState<PanelGoogleDashboardTableRecord | null>(null);
  const [periodPreset, setPeriodPreset] = useState<DashboardPeriodPreset>("30d");
  const [startDate, setStartDate] = useState(() => getPresetRange("30d").startDate);
  const [endDate, setEndDate] = useState(() => getPresetRange("30d").endDate);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [selectedAdGroupIds, setSelectedAdGroupIds] = useState<string[]>([]);
  const [selectedAdIds, setSelectedAdIds] = useState<string[]>([]);
  const [tableLevel, setTableLevel] = useState<PanelGoogleDashboardTableLevel>("campaign");
  const [isHydrating, setIsHydrating] = useState(true);
  const [isCampaignsLoading, setIsCampaignsLoading] = useState(false);
  const [isAdGroupsLoading, setIsAdGroupsLoading] = useState(false);
  const [isAdsLoading, setIsAdsLoading] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isDashboardTransitioning, setIsDashboardTransitioning] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const campaignRequestRef = useRef(0);
  const adGroupRequestRef = useRef(0);
  const adRequestRef = useRef(0);
  const dashboardRequestRef = useRef(0);
  const lastCampaignFiltersKeyRef = useRef("");
  const lastAdGroupFiltersKeyRef = useRef("");
  const lastAdFiltersKeyRef = useRef("");
  const lastDashboardKeyRef = useRef("");

  const loadContext = useCallback(async () => {
    if (!token || !customerId) {
      return;
    }

    setIsHydrating(true);
    setLoadError(null);

    try {
      const nextStatus = await getPanelGoogleConnectionStatus(token);
      setStatusRecord(nextStatus);

      if (nextStatus.status !== "CONNECTED") {
        setCustomers([]);
        return;
      }

      const nextCustomers = await listPanelGoogleAdsCustomers(token);
      setCustomers(nextCustomers);
    } catch (error) {
      setStatusRecord(null);
      setCustomers([]);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o dashboard da conta Google Ads agora.",
      );
    } finally {
      setIsHydrating(false);
    }
  }, [customerId, token]);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  useEffect(() => {
    setSelectedCampaignIds([]);
    setSelectedAdGroupIds([]);
    setSelectedAdIds([]);
    setCampaignOptions([]);
    setAdGroupOptions([]);
    setAdOptions([]);
    setSummary(null);
    setTimeline(null);
    setFunnel(null);
    setTableData(null);
    setDashboardError(null);
    lastCampaignFiltersKeyRef.current = "";
    lastAdGroupFiltersKeyRef.current = "";
    lastAdFiltersKeyRef.current = "";
    lastDashboardKeyRef.current = "";
  }, [customerId]);

  const activeCustomer = useMemo(
    () => customers.find((item) => item.customerId === customerId) ?? null,
    [customerId, customers],
  );

  const loadCampaignFilters = useCallback(async (force = false) => {
    if (!token || !activeCustomer || statusRecord?.status !== "CONNECTED") {
      setCampaignOptions([]);
      return;
    }

    const nextKey = JSON.stringify({ customerId: activeCustomer.customerId });
    if (!force && lastCampaignFiltersKeyRef.current === nextKey) {
      return;
    }

    lastCampaignFiltersKeyRef.current = nextKey;
    const requestId = campaignRequestRef.current + 1;
    campaignRequestRef.current = requestId;
    setIsCampaignsLoading(true);

    try {
      const nextOptions = await listPanelGoogleFilterCampaigns(token, {
        customerId: activeCustomer.customerId,
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
  }, [activeCustomer, statusRecord?.status, token]);

  useEffect(() => {
    void loadCampaignFilters();
  }, [loadCampaignFilters]);

  const loadAdGroupFilters = useCallback(async (force = false) => {
    if (!token || !activeCustomer || statusRecord?.status !== "CONNECTED") {
      setAdGroupOptions([]);
      return;
    }

    const nextKey = JSON.stringify({
      campaignIds: selectedCampaignIds,
      customerId: activeCustomer.customerId,
    });
    if (!force && lastAdGroupFiltersKeyRef.current === nextKey) {
      return;
    }

    lastAdGroupFiltersKeyRef.current = nextKey;
    const requestId = adGroupRequestRef.current + 1;
    adGroupRequestRef.current = requestId;
    setIsAdGroupsLoading(true);

    try {
      const nextOptions = await listPanelGoogleFilterAdGroups(token, {
        campaignIds: selectedCampaignIds.length > 0 ? selectedCampaignIds : undefined,
        customerId: activeCustomer.customerId,
      });

      if (requestId !== adGroupRequestRef.current) {
        return;
      }

      setAdGroupOptions(nextOptions);
    } catch {
      if (requestId !== adGroupRequestRef.current) {
        return;
      }

      setAdGroupOptions([]);
    } finally {
      if (requestId === adGroupRequestRef.current) {
        setIsAdGroupsLoading(false);
      }
    }
  }, [activeCustomer, selectedCampaignIds, statusRecord?.status, token]);

  useEffect(() => {
    void loadAdGroupFilters();
  }, [loadAdGroupFilters]);

  const loadAdFilters = useCallback(async (force = false) => {
    if (!token || !activeCustomer || statusRecord?.status !== "CONNECTED") {
      setAdOptions([]);
      return;
    }

    const nextKey = JSON.stringify({
      adGroupIds: selectedAdGroupIds,
      campaignIds: selectedCampaignIds,
      customerId: activeCustomer.customerId,
    });
    if (!force && lastAdFiltersKeyRef.current === nextKey) {
      return;
    }

    lastAdFiltersKeyRef.current = nextKey;
    const requestId = adRequestRef.current + 1;
    adRequestRef.current = requestId;
    setIsAdsLoading(true);

    try {
      const nextOptions = await listPanelGoogleFilterAds(token, {
        adGroupIds: selectedAdGroupIds.length > 0 ? selectedAdGroupIds : undefined,
        campaignIds: selectedCampaignIds.length > 0 ? selectedCampaignIds : undefined,
        customerId: activeCustomer.customerId,
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
  }, [activeCustomer, selectedAdGroupIds, selectedCampaignIds, statusRecord?.status, token]);

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
    setSelectedAdGroupIds((currentValues) => {
      const nextValues = currentValues.filter((value) => adGroupOptions.some((item) => item.id === value));
      return areSameStringArrays(currentValues, nextValues) ? currentValues : nextValues;
    });
  }, [adGroupOptions]);

  useEffect(() => {
    setSelectedAdIds((currentValues) => {
      const nextValues = currentValues.filter((value) => adOptions.some((item) => item.id === value));
      return areSameStringArrays(currentValues, nextValues) ? currentValues : nextValues;
    });
  }, [adOptions]);

  const dashboardRequest = useMemo((): DashboardRequestSnapshot | null => {
    if (!activeCustomer) {
      return null;
    }

    return {
      adGroupIds: selectedAdGroupIds.length > 0 ? selectedAdGroupIds : undefined,
      adIds: selectedAdIds.length > 0 ? selectedAdIds : undefined,
      campaignIds: selectedCampaignIds.length > 0 ? selectedCampaignIds : undefined,
      customerId: activeCustomer.customerId,
      endDate: endDate || undefined,
      level: tableLevel,
      startDate: startDate || undefined,
    };
  }, [activeCustomer, endDate, selectedAdGroupIds, selectedAdIds, selectedCampaignIds, startDate, tableLevel]);

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
        getPanelGoogleDashboardSummary(token, requestSnapshot),
        getPanelGoogleDashboardTimeline(token, requestSnapshot),
        getPanelGoogleDashboardFunnel(token, requestSnapshot),
        getPanelGoogleDashboardTable(token, requestSnapshot),
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
          : "Não foi possível carregar o dashboard desta conta Google Ads.",
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
    void loadAdGroupFilters(true);
    void loadAdFilters(true);
    void loadDashboard(dashboardRequest, true);
  }, [dashboardRequest, loadAdFilters, loadAdGroupFilters, loadCampaignFilters, loadContext, loadDashboard]);

  const timelineLabels = useMemo(
    () => timeline?.data.map((item) => item.date) ?? [],
    [timeline],
  );

  const timelineSeries = useMemo(
    () => [
      {
        color: "#2563eb",
        label: "Investimento",
        values: timeline?.data.map((item) => item.spend) ?? [],
      },
      {
        color: "#f59e0b",
        label: "Resultados",
        values: timeline?.data.map((item) => item.resultsCount) ?? [],
      },
    ],
    [timeline],
  );

  const summaryCards = useMemo(() => {
    return [
      {
        description: "Valor investido no período filtrado da conta Google Ads.",
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
        description: "Cliques gerados pelas campanhas do Google Ads no recorte atual.",
        icon: <MousePointerClick className="h-5 w-5" />,
        label: "Cliques",
        numberFormatter: (value: number) => formatNumber(value),
        toneClassName: "border-violet-500/16 bg-violet-500/10 text-violet-500",
        valueNumber: summary?.clicks ?? 0,
      },
      {
        description: "Taxa de cliques média considerando todo o período filtrado.",
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
        description: "Custo por mil impressões da conta Google Ads em análise.",
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

  const funnelProgressItems = useMemo(() => {
    return [
      {
        color: "linear-gradient(90deg,#2563eb,#60a5fa)",
        helper: "Pessoas alcançadas pela conta no período.",
        label: "Alcance",
        rawValue: funnel?.reach ?? 0,
      },
      {
        color: "linear-gradient(90deg,#7c3aed,#a78bfa)",
        helper: "Cliques gerados pelos anúncios filtrados.",
        label: "Cliques",
        rawValue: funnel?.clicks ?? 0,
      },
      {
        color: "linear-gradient(90deg,#10b981,#34d399)",
        helper: "Resultados consolidados pela API.",
        label: "Resultados",
        rawValue: funnel?.resultsCount ?? 0,
      },
      {
        color: "linear-gradient(90deg,#f97316,#fb923c)",
        helper: "Conversões retornadas pelo backend para o recorte atual.",
        label: "Conversões",
        rawValue: funnel?.conversions ?? 0,
      },
    ];
  }, [funnel]);

  const showDashboardBlocks =
    Boolean(dashboardRequest) || Boolean(summary || timeline || funnel || tableData);
  const metricCardsLoading = !dashboardError && (isDashboardTransitioning || isDashboardLoading || !summary);
  const timelineLoading = !dashboardError && (isDashboardTransitioning || isDashboardLoading || !timeline);
  const funnelLoading = !dashboardError && (isDashboardTransitioning || isDashboardLoading || !funnel);
  const tableLoading = !dashboardError && (isDashboardTransitioning || isDashboardLoading || !tableData);

  const campaignFilterOptions = useMemo(() => toCampaignOptions(campaignOptions), [campaignOptions]);
  const adGroupFilterOptions = useMemo(() => toAdGroupOptions(adGroupOptions), [adGroupOptions]);
  const adFilterOptions = useMemo(() => toAdOptions(adOptions), [adOptions]);
  const currentPeriodLabel = formatDashboardPeriodLabel(startDate, endDate);
  const accountSummaryItems = activeCustomer
    ? [
        {
          label: "Customer da rota",
          value: activeCustomer.customerId,
          valueClassName: "break-all text-sm md:text-base",
        },
        {
          label: "Moeda operacional",
          value: activeCustomer.currencyCode || "Não informada",
          valueClassName: "text-base md:text-lg",
        },
        {
          label: "Fuso da conta",
          value: activeCustomer.timeZone || "Não informado",
          valueClassName: "break-all text-sm md:text-base",
        },
      ]
    : [];
  const activeFilterHighlights =
    selectedCampaignIds.length > 0 || selectedAdGroupIds.length > 0 || selectedAdIds.length > 0
      ? [
          ...(selectedCampaignIds.length > 0
            ? [formatSelectionSummary(selectedCampaignIds.length, "campanha", "campanhas")]
            : []),
          ...(selectedAdGroupIds.length > 0
            ? [formatSelectionSummary(selectedAdGroupIds.length, "grupo", "grupos")]
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
    isAdGroupsLoading ||
    isAdsLoading;

  if (isHydrating) {
    return (
      <section className="panel-card rounded-[1.9rem] border p-8">
        <div className="flex min-h-[14rem] flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LoaderCircle className="h-6 w-6 animate-spin" />
          </div>
          <h2 className="mt-5 text-xl font-black tracking-tight text-on-surface">
            Carregando dashboard Google Ads
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
        title="Falha ao abrir o dashboard Google Ads"
      />
    );
  }

  if (!statusRecord || statusRecord.status === "NOT_CONNECTED") {
    return (
      <StateCard
        action={(
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            onClick={() => navigate("/painel/contas-integracao/google")}
            type="button"
          >
            Ir para Contas e integrações
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        )}
        description="A integração Google ainda não está conectada. Conecte a conta primeiro para abrir dashboards por conta."
        title="Conecte o Google para continuar"
      />
    );
  }

  if (panelGoogleStatusNeedsReconnect(statusRecord.status)) {
    return (
      <StateCard
        action={(
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            onClick={() => navigate("/painel/contas-integracao/google")}
            type="button"
          >
            Revisar integração
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        )}
        description={getPanelGoogleStatusDescription(statusRecord.status)}
        title={`Integração Google em atenção: ${getPanelGoogleStatusLabel(statusRecord.status)}`}
      />
    );
  }

  if (customers.length === 0) {
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
        description="A conexão Google está ativa, mas nenhuma conta do Google Ads foi retornada pela API neste momento."
        title="Nenhuma conta Google Ads disponível"
      />
    );
  }

  if (!activeCustomer) {
    return (
      <StateCard
        action={(
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/16 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
            onClick={() => navigate("/painel/trafego-pago/google")}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para contas
          </button>
        )}
        description={`A conta ${customerId} não foi encontrada entre as contas liberadas pela integração atual.`}
        title="Conta Google Ads indisponível"
      />
    );
  }

  return (
    <>
      <Seo
        description={`Dashboard Google Ads da conta ${activeCustomer.descriptiveName}.`}
        noindex
        path={location.pathname}
        structuredData={null}
        title={`Google Ads • ${activeCustomer.descriptiveName}`}
      />

      <div className="space-y-6">
        <PanelPageHeader
          actions={statusRecord ? <GoogleStatusBadge status={statusRecord.status} /> : undefined}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Tráfego pago", to: "/painel/trafego-pago/google" },
            { label: "Google", to: "/painel/trafego-pago/google" },
            { label: activeCustomer.descriptiveName },
          ]}
          description="Dashboard operacional por conta Google Ads, com filtros de período, campanhas, grupos e anúncios aplicados diretamente sobre o customerId da rota."
          title={activeCustomer.descriptiveName}
        />

        <section className="panel-premium-card rounded-[2rem] border p-6 md:p-7">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[32rem] max-w-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_58%)]" />

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.32fr)_minmax(24rem,0.98fr)]">
            <div className="rounded-[1.9rem] border border-outline-variant/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015)),radial-gradient(circle_at_top_right,rgba(37,99,235,0.14),transparent_35%)] p-6 md:p-7">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full border border-primary/18 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em] text-primary">
                  Conta Google Ads ativa
                </span>
                <span className="rounded-full border border-outline-variant/12 bg-surface-container-low/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                  Dashboard por customerId
                </span>
                {activeCustomer.manager ? (
                  <span className="rounded-full border border-primary/18 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    MCC
                  </span>
                ) : null}
                {activeCustomer.testAccount ? (
                  <span className="rounded-full border border-amber-500/18 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
                    Teste
                  </span>
                ) : null}
                {activeCustomer.hidden ? (
                  <span className="rounded-full border border-outline-variant/12 bg-surface-container-low/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                    Oculta
                  </span>
                ) : null}
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight text-on-surface md:text-[2.35rem]">
                {activeCustomer.descriptiveName}
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
                    onClick={() => navigate("/painel/trafego-pago/google")}
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
                  Período e recortes do Google Ads
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  Refine a leitura da conta <span className="font-semibold text-on-surface">{activeCustomer.customerId}</span> por período, campanhas, grupos e anúncios sem perder a visão consolidada do dashboard.
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
                  label="Grupos"
                  loading={isAdGroupsLoading}
                  onChange={setSelectedAdGroupIds}
                  options={adGroupFilterOptions}
                  placeholder="Todos os grupos"
                  values={selectedAdGroupIds}
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

            <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.95fr)]">
              <PanelAnalyticsCard
                description="Evolução diária do investimento e dos resultados da conta Google Ads no período selecionado."
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
                description="Leitura rápida do funil consolidado com base nos filtros atuais."
                eyebrow="Funil"
                title="Funil Google Ads"
              >
                <PanelProgressList
                  formatValue={(value) => formatNumber(value)}
                  items={funnelProgressItems.map((item) => ({
                    color: item.color,
                    helper: item.helper,
                    label: item.label,
                    value: item.rawValue,
                  }))}
                  loading={funnelLoading}
                />
              </PanelAnalyticsCard>
            </div>

            <PanelGoogleDashboardTable
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
