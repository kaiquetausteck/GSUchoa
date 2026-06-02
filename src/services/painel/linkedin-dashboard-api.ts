import { getPanelApiBaseUrl } from "./auth-api";

const PANEL_API_BASE_URL = getPanelApiBaseUrl();
const PANEL_LINKEDIN_DASHBOARD_SUMMARY_PATH =
  import.meta.env.VITE_PANEL_LINKEDIN_DASHBOARD_SUMMARY_PATH ?? "/linkedin/dashboard/summary";
const PANEL_LINKEDIN_DASHBOARD_TIMELINE_PATH =
  import.meta.env.VITE_PANEL_LINKEDIN_DASHBOARD_TIMELINE_PATH ?? "/linkedin/dashboard/timeline";
const PANEL_LINKEDIN_DASHBOARD_FUNNEL_PATH =
  import.meta.env.VITE_PANEL_LINKEDIN_DASHBOARD_FUNNEL_PATH ?? "/linkedin/dashboard/funnel";
const PANEL_LINKEDIN_DASHBOARD_TABLE_PATH =
  import.meta.env.VITE_PANEL_LINKEDIN_DASHBOARD_TABLE_PATH ?? "/linkedin/dashboard/table";

export const PANEL_LINKEDIN_DASHBOARD_TABLE_LEVEL_VALUES = ["campaign", "creative"] as const;
export type PanelLinkedInDashboardTableLevel =
  (typeof PANEL_LINKEDIN_DASHBOARD_TABLE_LEVEL_VALUES)[number];

export type PanelLinkedInDashboardQuery = {
  accountId: string;
  endDate?: string;
  startDate?: string;
};

export type PanelLinkedInDashboardSummaryRecord = {
  accountId: string;
  accountName: string;
  clicks: number;
  costPerResult: number;
  cpc: number;
  cpm: number;
  ctr: number;
  endDate: string;
  hasData: boolean;
  impressions: number;
  landingPageClicks: number;
  resultsCount: number;
  spend: number;
  startDate: string;
};

export type PanelLinkedInDashboardTimelineItemRecord = Omit<
  PanelLinkedInDashboardSummaryRecord,
  "accountId" | "accountName" | "endDate" | "hasData" | "startDate"
> & {
  date: string;
};

export type PanelLinkedInDashboardTimelineRecord = Pick<
  PanelLinkedInDashboardSummaryRecord,
  "accountId" | "accountName" | "endDate" | "hasData" | "startDate"
> & {
  data: PanelLinkedInDashboardTimelineItemRecord[];
};

export type PanelLinkedInDashboardFunnelRecord = Pick<
  PanelLinkedInDashboardSummaryRecord,
  "accountId" | "accountName" | "endDate" | "hasData" | "impressions" | "startDate"
> & {
  clicks: number;
  conversions: number;
  landingPageClicks: number;
};

export type PanelLinkedInDashboardTableRowRecord = Omit<
  PanelLinkedInDashboardTimelineItemRecord,
  "date"
> & {
  id: string;
  level: PanelLinkedInDashboardTableLevel;
  name: string;
};

export type PanelLinkedInDashboardTableRecord = Pick<
  PanelLinkedInDashboardSummaryRecord,
  "accountId" | "accountName" | "endDate" | "hasData" | "startDate"
> & {
  data: PanelLinkedInDashboardTableRowRecord[];
  level: PanelLinkedInDashboardTableLevel;
};

type JsonRecord = Record<string, unknown>;

class PanelLinkedInDashboardApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PanelLinkedInDashboardApiError";
    this.status = status;
  }
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function buildUrl(path: string, query?: URLSearchParams) {
  const baseUrl = `${PANEL_API_BASE_URL}${normalizePath(path)}`;
  const queryString = query?.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
}

function getBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

async function parseJsonSafe(response: Response) {
  const rawText = await response.text();

  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    return { message: rawText };
  }
}

function extractMessage(payload: unknown, fallbackMessage: string) {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  if (!isRecord(payload)) {
    return fallbackMessage;
  }

  const message = getString(payload.message) ?? getString(payload.error) ?? getString(payload.detail);
  return message ?? fallbackMessage;
}

function resolvePayloadRoot(payload: unknown) {
  return isRecord(payload) && isRecord(payload.data) ? payload.data : payload;
}

function buildDashboardQuery(query: PanelLinkedInDashboardQuery & { level?: PanelLinkedInDashboardTableLevel }) {
  const params = new URLSearchParams();
  params.set("accountId", query.accountId);

  if (query.startDate) {
    params.set("startDate", query.startDate);
  }

  if (query.endDate) {
    params.set("endDate", query.endDate);
  }

  if (query.level) {
    params.set("level", query.level);
  }

  return params;
}

async function requestJson(path: string, token: string, query: URLSearchParams) {
  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new PanelLinkedInDashboardApiError(
      `Não foi possível conectar com a API em ${PANEL_API_BASE_URL}. Verifique se o backend está ativo.`,
    );
  }

  const payload = await parseJsonSafe(response);
  return { payload, response };
}

function normalizeSummary(payload: unknown): PanelLinkedInDashboardSummaryRecord | null {
  const root = resolvePayloadRoot(payload);

  if (!isRecord(root)) {
    return null;
  }

  const accountId = getString(root.accountId);
  const accountName = getString(root.accountName);
  const startDate = getString(root.startDate);
  const endDate = getString(root.endDate);

  if (!accountId || !accountName || !startDate || !endDate) {
    return null;
  }

  return {
    accountId,
    accountName,
    clicks: getNumber(root.clicks) ?? 0,
    costPerResult: getNumber(root.costPerResult) ?? 0,
    cpc: getNumber(root.cpc) ?? 0,
    cpm: getNumber(root.cpm) ?? 0,
    ctr: getNumber(root.ctr) ?? 0,
    endDate,
    hasData: getBoolean(root.hasData) ?? false,
    impressions: getNumber(root.impressions) ?? 0,
    landingPageClicks: getNumber(root.landingPageClicks) ?? 0,
    resultsCount: getNumber(root.resultsCount) ?? 0,
    spend: getNumber(root.spend) ?? 0,
    startDate,
  };
}

function normalizeTimeline(payload: unknown): PanelLinkedInDashboardTimelineRecord | null {
  const summary = normalizeSummary(payload);
  const root = resolvePayloadRoot(payload);

  if (!summary || !isRecord(root)) {
    return null;
  }

  return {
    accountId: summary.accountId,
    accountName: summary.accountName,
    data: Array.isArray(root.data)
      ? root.data
        .filter(isRecord)
        .map((item) => ({
          clicks: getNumber(item.clicks) ?? 0,
          costPerResult: getNumber(item.costPerResult) ?? 0,
          cpc: getNumber(item.cpc) ?? 0,
          cpm: getNumber(item.cpm) ?? 0,
          ctr: getNumber(item.ctr) ?? 0,
          date: getString(item.date) ?? summary.startDate,
          impressions: getNumber(item.impressions) ?? 0,
          landingPageClicks: getNumber(item.landingPageClicks) ?? 0,
          resultsCount: getNumber(item.resultsCount) ?? 0,
          spend: getNumber(item.spend) ?? 0,
        }))
      : [],
    endDate: summary.endDate,
    hasData: summary.hasData,
    startDate: summary.startDate,
  };
}

function normalizeFunnel(payload: unknown): PanelLinkedInDashboardFunnelRecord | null {
  const summary = normalizeSummary(payload);
  const root = resolvePayloadRoot(payload);

  if (!summary || !isRecord(root)) {
    return null;
  }

  return {
    accountId: summary.accountId,
    accountName: summary.accountName,
    clicks: getNumber(root.clicks) ?? 0,
    conversions: getNumber(root.conversions) ?? 0,
    endDate: summary.endDate,
    hasData: summary.hasData,
    impressions: summary.impressions,
    landingPageClicks: summary.landingPageClicks,
    startDate: summary.startDate,
  };
}

function normalizeTable(payload: unknown): PanelLinkedInDashboardTableRecord | null {
  const summary = normalizeSummary(payload);
  const root = resolvePayloadRoot(payload);

  if (!summary || !isRecord(root)) {
    return null;
  }

  return {
    accountId: summary.accountId,
    accountName: summary.accountName,
    data: Array.isArray(root.data)
      ? root.data
        .filter(isRecord)
        .map((item) => ({
          clicks: getNumber(item.clicks) ?? 0,
          costPerResult: getNumber(item.costPerResult) ?? 0,
          cpc: getNumber(item.cpc) ?? 0,
          cpm: getNumber(item.cpm) ?? 0,
          ctr: getNumber(item.ctr) ?? 0,
          id: getString(item.id) ?? "",
          impressions: getNumber(item.impressions) ?? 0,
          landingPageClicks: getNumber(item.landingPageClicks) ?? 0,
          level: getString(item.level) === "creative" ? "creative" : "campaign",
          name: getString(item.name) ?? "Item LinkedIn Ads",
          resultsCount: getNumber(item.resultsCount) ?? 0,
          spend: getNumber(item.spend) ?? 0,
        }))
      : [],
    endDate: summary.endDate,
    hasData: summary.hasData,
    level: getString(root.level) === "creative" ? "creative" : "campaign",
    startDate: summary.startDate,
  };
}

async function requestDashboard<T>(
  token: string,
  path: string,
  query: PanelLinkedInDashboardQuery & { level?: PanelLinkedInDashboardTableLevel },
  normalize: (payload: unknown) => T | null,
  fallbackMessage: string,
): Promise<T> {
  const { payload, response } = await requestJson(path, token, buildDashboardQuery(query));

  if (!response.ok) {
    throw new PanelLinkedInDashboardApiError(extractMessage(payload, fallbackMessage), response.status);
  }

  const normalized = normalize(payload);

  if (!normalized) {
    throw new PanelLinkedInDashboardApiError(fallbackMessage, response.status);
  }

  return normalized;
}

export function getPanelLinkedInDashboardSummary(token: string, query: PanelLinkedInDashboardQuery) {
  return requestDashboard(
    token,
    PANEL_LINKEDIN_DASHBOARD_SUMMARY_PATH,
    query,
    normalizeSummary,
    "O backend não retornou um resumo LinkedIn Ads válido.",
  );
}

export function getPanelLinkedInDashboardTimeline(token: string, query: PanelLinkedInDashboardQuery) {
  return requestDashboard(
    token,
    PANEL_LINKEDIN_DASHBOARD_TIMELINE_PATH,
    query,
    normalizeTimeline,
    "O backend não retornou uma linha do tempo LinkedIn Ads válida.",
  );
}

export function getPanelLinkedInDashboardFunnel(token: string, query: PanelLinkedInDashboardQuery) {
  return requestDashboard(
    token,
    PANEL_LINKEDIN_DASHBOARD_FUNNEL_PATH,
    query,
    normalizeFunnel,
    "O backend não retornou um funil LinkedIn Ads válido.",
  );
}

export function getPanelLinkedInDashboardTable(
  token: string,
  query: PanelLinkedInDashboardQuery & { level?: PanelLinkedInDashboardTableLevel },
) {
  return requestDashboard(
    token,
    PANEL_LINKEDIN_DASHBOARD_TABLE_PATH,
    query,
    normalizeTable,
    "O backend não retornou uma tabela LinkedIn Ads válida.",
  );
}
