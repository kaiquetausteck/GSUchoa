import { getPanelApiBaseUrl } from "./auth-api";

const PANEL_API_BASE_URL = getPanelApiBaseUrl();
const PANEL_GOOGLE_FILTER_CAMPAIGNS_PATH =
  import.meta.env.VITE_PANEL_GOOGLE_FILTER_CAMPAIGNS_PATH ?? "/google/filters/campaigns";
const PANEL_GOOGLE_FILTER_AD_GROUPS_PATH =
  import.meta.env.VITE_PANEL_GOOGLE_FILTER_AD_GROUPS_PATH ?? "/google/filters/ad-groups";
const PANEL_GOOGLE_FILTER_ADS_PATH =
  import.meta.env.VITE_PANEL_GOOGLE_FILTER_ADS_PATH ?? "/google/filters/ads";
const PANEL_GOOGLE_DASHBOARD_SUMMARY_PATH =
  import.meta.env.VITE_PANEL_GOOGLE_DASHBOARD_SUMMARY_PATH ?? "/google/dashboard/summary";
const PANEL_GOOGLE_DASHBOARD_TIMELINE_PATH =
  import.meta.env.VITE_PANEL_GOOGLE_DASHBOARD_TIMELINE_PATH ?? "/google/dashboard/timeline";
const PANEL_GOOGLE_DASHBOARD_FUNNEL_PATH =
  import.meta.env.VITE_PANEL_GOOGLE_DASHBOARD_FUNNEL_PATH ?? "/google/dashboard/funnel";
const PANEL_GOOGLE_DASHBOARD_TABLE_PATH =
  import.meta.env.VITE_PANEL_GOOGLE_DASHBOARD_TABLE_PATH ?? "/google/dashboard/table";

export const PANEL_GOOGLE_DASHBOARD_TABLE_LEVEL_VALUES = ["campaign", "adgroup", "ad"] as const;
export type PanelGoogleDashboardTableLevel =
  (typeof PANEL_GOOGLE_DASHBOARD_TABLE_LEVEL_VALUES)[number];

export type PanelGoogleFiltersCampaignRecord = {
  advertisingChannelSubType: string | null;
  advertisingChannelType: string | null;
  googleCampaignId: string;
  id: string;
  name: string;
  status: string | null;
};

export type PanelGoogleFiltersAdGroupRecord = {
  googleAdGroupId: string;
  googleCampaignId: string;
  id: string;
  name: string;
  status: string | null;
  type: string | null;
};

export type PanelGoogleFiltersAdRecord = {
  adType: string | null;
  finalUrl: string | null;
  googleAdGroupId: string;
  googleAdId: string;
  googleCampaignId: string | null;
  id: string;
  name: string;
  status: string | null;
};

export type PanelGoogleFiltersCampaignsQuery = {
  customerId?: string;
  search?: string;
};

export type PanelGoogleFiltersAdGroupsQuery = {
  campaignIds?: string[];
  customerId?: string;
  search?: string;
};

export type PanelGoogleFiltersAdsQuery = {
  adGroupIds?: string[];
  campaignIds?: string[];
  customerId?: string;
  search?: string;
};

export type PanelGoogleDashboardQuery = {
  adGroupIds?: string[];
  adIds?: string[];
  campaignIds?: string[];
  customerId?: string;
  endDate?: string;
  startDate?: string;
};

export type PanelGoogleDashboardSummaryRecord = {
  adGroupIds: string[];
  adIds: string[];
  campaignIds: string[];
  clicks: number;
  costPerResult: number;
  cpc: number;
  cpm: number;
  ctr: number;
  customerId: string;
  customerName: string;
  endDate: string;
  hasData: boolean;
  impressions: number;
  reach: number;
  resultsCount: number;
  spend: number;
  startDate: string;
};

export type PanelGoogleDashboardTimelineItemRecord = {
  clicks: number;
  costPerResult: number;
  cpc: number;
  cpm: number;
  ctr: number;
  date: string;
  impressions: number;
  reach: number;
  resultsCount: number;
  spend: number;
};

export type PanelGoogleDashboardTimelineRecord = Omit<
  PanelGoogleDashboardSummaryRecord,
  "clicks" | "costPerResult" | "cpc" | "cpm" | "ctr" | "impressions" | "reach" | "resultsCount" | "spend"
> & {
  data: PanelGoogleDashboardTimelineItemRecord[];
};

export type PanelGoogleDashboardFunnelRecord = Omit<
  PanelGoogleDashboardSummaryRecord,
  "clicks" | "costPerResult" | "cpc" | "cpm" | "ctr" | "impressions" | "spend"
> & {
  clicks: number;
  conversions: number;
  reach: number;
  resultsCount: number;
};

export type PanelGoogleDashboardTableRowRecord = {
  clicks: number;
  costPerResult: number;
  cpc: number;
  cpm: number;
  ctr: number;
  id: string;
  impressions: number;
  level: PanelGoogleDashboardTableLevel;
  name: string;
  reach: number;
  resultsCount: number;
  spend: number;
};

export type PanelGoogleDashboardTableRecord = Omit<
  PanelGoogleDashboardSummaryRecord,
  "clicks" | "costPerResult" | "cpc" | "cpm" | "ctr" | "impressions" | "reach" | "resultsCount" | "spend"
> & {
  data: PanelGoogleDashboardTableRowRecord[];
  level: PanelGoogleDashboardTableLevel;
};

type JsonRecord = Record<string, unknown>;

class PanelGoogleDashboardApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PanelGoogleDashboardApiError";
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

function resolvePayloadRoot(payload: unknown) {
  if (isRecord(payload) && isRecord(payload.data)) {
    return payload.data;
  }

  return payload;
}

function getFirstString(values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getFirstNumber(values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsedValue = Number(value);

      if (Number.isFinite(parsedValue)) {
        return parsedValue;
      }
    }
  }

  return null;
}

function extractStringList(value: unknown): string[] {
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => extractStringList(item)).filter(Boolean);
}

function extractMessage(payload: unknown, fallbackMessage: string) {
  if (!payload) {
    return fallbackMessage;
  }

  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  if (!isRecord(payload)) {
    return fallbackMessage;
  }

  const directMessages = extractStringList(payload.message);

  if (directMessages.length > 0) {
    return directMessages.join(" ");
  }

  const nestedMessages = isRecord(payload.data) ? extractStringList(payload.data.message) : [];

  if (nestedMessages.length > 0) {
    return nestedMessages.join(" ");
  }

  return getFirstString([payload.error, payload.detail, payload.path]) ?? fallbackMessage;
}

async function parseJsonSafe(response: Response) {
  const rawText = await response.text();

  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    return { message: rawText } satisfies JsonRecord;
  }
}

async function requestJson(path: string, token: string, query?: URLSearchParams) {
  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new PanelGoogleDashboardApiError(
      `Não foi possível conectar com a API em ${PANEL_API_BASE_URL}. Verifique se o backend está ativo.`,
    );
  }

  const payload = await parseJsonSafe(response);

  return {
    payload,
    response,
  };
}

function appendQueryValue(params: URLSearchParams, key: string, value: string | undefined) {
  if (!value?.trim()) {
    return;
  }

  params.set(key, value.trim());
}

function appendQueryArray(params: URLSearchParams, key: string, values?: string[]) {
  const normalizedValues = values?.map((value) => value.trim()).filter(Boolean) ?? [];

  if (normalizedValues.length === 0) {
    return;
  }

  params.set(key, normalizedValues.join(","));
}

function buildDashboardQuery(query: PanelGoogleDashboardQuery & { level?: PanelGoogleDashboardTableLevel }) {
  const params = new URLSearchParams();

  appendQueryValue(params, "customerId", query.customerId);
  appendQueryValue(params, "startDate", query.startDate);
  appendQueryValue(params, "endDate", query.endDate);
  appendQueryArray(params, "campaignIds", query.campaignIds);
  appendQueryArray(params, "adGroupIds", query.adGroupIds);
  appendQueryArray(params, "adIds", query.adIds);

  if (query.level) {
    appendQueryValue(params, "level", query.level);
  }

  return params;
}

function buildFiltersQuery(
  query:
    | PanelGoogleFiltersCampaignsQuery
    | PanelGoogleFiltersAdGroupsQuery
    | PanelGoogleFiltersAdsQuery,
) {
  const params = new URLSearchParams();

  appendQueryValue(params, "customerId", query.customerId);
  appendQueryValue(params, "search", query.search);

  if ("campaignIds" in query) {
    appendQueryArray(params, "campaignIds", query.campaignIds);
  }

  if ("adGroupIds" in query) {
    appendQueryArray(params, "adGroupIds", query.adGroupIds);
  }

  return params;
}

function normalizeDashboardBaseRecord(payload: unknown) {
  const root = resolvePayloadRoot(payload);

  if (!isRecord(root)) {
    return null;
  }

  const customerId = getFirstString([root.customerId]);
  const customerName = getFirstString([root.customerName]);
  const startDate = getFirstString([root.startDate]);
  const endDate = getFirstString([root.endDate]);

  if (!customerId || !customerName || !startDate || !endDate) {
    return null;
  }

  return {
    adGroupIds: extractStringList(root.adGroupIds),
    adIds: extractStringList(root.adIds),
    campaignIds: extractStringList(root.campaignIds),
    customerId,
    customerName,
    endDate,
    hasData: Boolean(root.hasData),
    startDate,
  };
}

function normalizeFiltersCampaignRecord(payload: unknown): PanelGoogleFiltersCampaignRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id]);
  const googleCampaignId = getFirstString([payload.googleCampaignId]);
  const name = getFirstString([payload.name]);

  if (!id || !googleCampaignId || !name) {
    return null;
  }

  return {
    advertisingChannelSubType: getFirstString([payload.advertisingChannelSubType]),
    advertisingChannelType: getFirstString([payload.advertisingChannelType]),
    googleCampaignId,
    id,
    name,
    status: getFirstString([payload.status]),
  };
}

function normalizeFiltersAdGroupRecord(payload: unknown): PanelGoogleFiltersAdGroupRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id]);
  const googleAdGroupId = getFirstString([payload.googleAdGroupId]);
  const googleCampaignId = getFirstString([payload.googleCampaignId]);
  const name = getFirstString([payload.name]);

  if (!id || !googleAdGroupId || !googleCampaignId || !name) {
    return null;
  }

  return {
    googleAdGroupId,
    googleCampaignId,
    id,
    name,
    status: getFirstString([payload.status]),
    type: getFirstString([payload.type]),
  };
}

function normalizeFiltersAdRecord(payload: unknown): PanelGoogleFiltersAdRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id]);
  const googleAdId = getFirstString([payload.googleAdId]);
  const googleAdGroupId = getFirstString([payload.googleAdGroupId]);
  const name = getFirstString([payload.name]);

  if (!id || !googleAdId || !googleAdGroupId || !name) {
    return null;
  }

  return {
    adType: getFirstString([payload.adType]),
    finalUrl: getFirstString([payload.finalUrl]),
    googleAdGroupId,
    googleAdId,
    googleCampaignId: getFirstString([payload.googleCampaignId]),
    id,
    name,
    status: getFirstString([payload.status]),
  };
}

function normalizeFiltersCollection<TRecord>(
  payload: unknown,
  candidateKeys: string[],
  normalizeItem: (value: unknown) => TRecord | null,
) {
  const root = resolvePayloadRoot(payload);
  const source = Array.isArray(root)
    ? root
    : isRecord(root)
      ? candidateKeys.find((key) => Array.isArray(root[key]))
        ? (root[candidateKeys.find((key) => Array.isArray(root[key]))!] as unknown[])
        : []
      : [];

  return source
    .map((item) => normalizeItem(item))
    .filter((item): item is TRecord => item !== null);
}

function normalizeSummaryRecord(payload: unknown): PanelGoogleDashboardSummaryRecord | null {
  const baseRecord = normalizeDashboardBaseRecord(payload);
  const root = resolvePayloadRoot(payload);

  if (!baseRecord || !isRecord(root)) {
    return null;
  }

  return {
    ...baseRecord,
    clicks: getFirstNumber([root.clicks]) ?? 0,
    costPerResult: getFirstNumber([root.costPerResult]) ?? 0,
    cpc: getFirstNumber([root.cpc]) ?? 0,
    cpm: getFirstNumber([root.cpm]) ?? 0,
    ctr: getFirstNumber([root.ctr]) ?? 0,
    impressions: getFirstNumber([root.impressions]) ?? 0,
    reach: getFirstNumber([root.reach]) ?? 0,
    resultsCount: getFirstNumber([root.resultsCount]) ?? 0,
    spend: getFirstNumber([root.spend]) ?? 0,
  };
}

function normalizeTimelineItem(payload: unknown): PanelGoogleDashboardTimelineItemRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const date = getFirstString([payload.date]);

  if (!date) {
    return null;
  }

  return {
    clicks: getFirstNumber([payload.clicks]) ?? 0,
    costPerResult: getFirstNumber([payload.costPerResult]) ?? 0,
    cpc: getFirstNumber([payload.cpc]) ?? 0,
    cpm: getFirstNumber([payload.cpm]) ?? 0,
    ctr: getFirstNumber([payload.ctr]) ?? 0,
    date,
    impressions: getFirstNumber([payload.impressions]) ?? 0,
    reach: getFirstNumber([payload.reach]) ?? 0,
    resultsCount: getFirstNumber([payload.resultsCount]) ?? 0,
    spend: getFirstNumber([payload.spend]) ?? 0,
  };
}

function normalizeTimelineRecord(payload: unknown): PanelGoogleDashboardTimelineRecord | null {
  const baseRecord = normalizeDashboardBaseRecord(payload);
  const root = resolvePayloadRoot(payload);

  if (!baseRecord || !isRecord(root) || !Array.isArray(root.data)) {
    return null;
  }

  return {
    ...baseRecord,
    data: root.data
      .map((item) => normalizeTimelineItem(item))
      .filter((item): item is PanelGoogleDashboardTimelineItemRecord => item !== null),
  };
}

function normalizeFunnelRecord(payload: unknown): PanelGoogleDashboardFunnelRecord | null {
  const baseRecord = normalizeDashboardBaseRecord(payload);
  const root = resolvePayloadRoot(payload);

  if (!baseRecord || !isRecord(root)) {
    return null;
  }

  return {
    ...baseRecord,
    clicks: getFirstNumber([root.clicks]) ?? 0,
    conversions: getFirstNumber([root.conversions]) ?? 0,
    reach: getFirstNumber([root.reach]) ?? 0,
    resultsCount: getFirstNumber([root.resultsCount]) ?? 0,
  };
}

function normalizeTableLevel(value: unknown): PanelGoogleDashboardTableLevel | null {
  if (typeof value !== "string") {
    return null;
  }

  return PANEL_GOOGLE_DASHBOARD_TABLE_LEVEL_VALUES.includes(value as PanelGoogleDashboardTableLevel)
    ? (value as PanelGoogleDashboardTableLevel)
    : null;
}

function normalizeTableRow(payload: unknown): PanelGoogleDashboardTableRowRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id]);
  const name = getFirstString([payload.name]);
  const level = normalizeTableLevel(payload.level);

  if (!id || !name || !level) {
    return null;
  }

  return {
    clicks: getFirstNumber([payload.clicks]) ?? 0,
    costPerResult: getFirstNumber([payload.costPerResult]) ?? 0,
    cpc: getFirstNumber([payload.cpc]) ?? 0,
    cpm: getFirstNumber([payload.cpm]) ?? 0,
    ctr: getFirstNumber([payload.ctr]) ?? 0,
    id,
    impressions: getFirstNumber([payload.impressions]) ?? 0,
    level,
    name,
    reach: getFirstNumber([payload.reach]) ?? 0,
    resultsCount: getFirstNumber([payload.resultsCount]) ?? 0,
    spend: getFirstNumber([payload.spend]) ?? 0,
  };
}

function normalizeTableRecord(payload: unknown): PanelGoogleDashboardTableRecord | null {
  const baseRecord = normalizeDashboardBaseRecord(payload);
  const root = resolvePayloadRoot(payload);

  if (!baseRecord || !isRecord(root) || !Array.isArray(root.data)) {
    return null;
  }

  const level = normalizeTableLevel(root.level);

  if (!level) {
    return null;
  }

  return {
    ...baseRecord,
    data: root.data
      .map((item) => normalizeTableRow(item))
      .filter((item): item is PanelGoogleDashboardTableRowRecord => item !== null),
    level,
  };
}

export async function listPanelGoogleFilterCampaigns(
  token: string,
  query: PanelGoogleFiltersCampaignsQuery = {},
) {
  const { payload, response } = await requestJson(
    PANEL_GOOGLE_FILTER_CAMPAIGNS_PATH,
    token,
    buildFiltersQuery(query),
  );

  if (!response.ok) {
    throw new PanelGoogleDashboardApiError(
      extractMessage(payload, "Não foi possível carregar as campanhas do Google Ads."),
      response.status,
    );
  }

  return normalizeFiltersCollection(payload, ["campaigns", "items"], normalizeFiltersCampaignRecord);
}

export async function listPanelGoogleFilterAdGroups(
  token: string,
  query: PanelGoogleFiltersAdGroupsQuery = {},
) {
  const { payload, response } = await requestJson(
    PANEL_GOOGLE_FILTER_AD_GROUPS_PATH,
    token,
    buildFiltersQuery(query),
  );

  if (!response.ok) {
    throw new PanelGoogleDashboardApiError(
      extractMessage(payload, "Não foi possível carregar os grupos do Google Ads."),
      response.status,
    );
  }

  return normalizeFiltersCollection(
    payload,
    ["adGroups", "adgroups", "items"],
    normalizeFiltersAdGroupRecord,
  );
}

export async function listPanelGoogleFilterAds(
  token: string,
  query: PanelGoogleFiltersAdsQuery = {},
) {
  const { payload, response } = await requestJson(
    PANEL_GOOGLE_FILTER_ADS_PATH,
    token,
    buildFiltersQuery(query),
  );

  if (!response.ok) {
    throw new PanelGoogleDashboardApiError(
      extractMessage(payload, "Não foi possível carregar os anúncios do Google Ads."),
      response.status,
    );
  }

  return normalizeFiltersCollection(payload, ["ads", "items"], normalizeFiltersAdRecord);
}

export async function getPanelGoogleDashboardSummary(
  token: string,
  query: PanelGoogleDashboardQuery,
) {
  const { payload, response } = await requestJson(
    PANEL_GOOGLE_DASHBOARD_SUMMARY_PATH,
    token,
    buildDashboardQuery(query),
  );

  if (!response.ok) {
    throw new PanelGoogleDashboardApiError(
      extractMessage(payload, "Não foi possível carregar o resumo da conta Google Ads."),
      response.status,
    );
  }

  const record = normalizeSummaryRecord(payload);

  if (!record) {
    throw new PanelGoogleDashboardApiError(
      "A API respondeu ao resumo do Google Ads, mas o formato retornado não foi reconhecido.",
      response.status,
    );
  }

  return record;
}

export async function getPanelGoogleDashboardTimeline(
  token: string,
  query: PanelGoogleDashboardQuery,
) {
  const { payload, response } = await requestJson(
    PANEL_GOOGLE_DASHBOARD_TIMELINE_PATH,
    token,
    buildDashboardQuery(query),
  );

  if (!response.ok) {
    throw new PanelGoogleDashboardApiError(
      extractMessage(payload, "Não foi possível carregar a linha do tempo do Google Ads."),
      response.status,
    );
  }

  const record = normalizeTimelineRecord(payload);

  if (!record) {
    throw new PanelGoogleDashboardApiError(
      "A API respondeu à timeline do Google Ads, mas o formato retornado não foi reconhecido.",
      response.status,
    );
  }

  return record;
}

export async function getPanelGoogleDashboardFunnel(
  token: string,
  query: PanelGoogleDashboardQuery,
) {
  const { payload, response } = await requestJson(
    PANEL_GOOGLE_DASHBOARD_FUNNEL_PATH,
    token,
    buildDashboardQuery(query),
  );

  if (!response.ok) {
    throw new PanelGoogleDashboardApiError(
      extractMessage(payload, "Não foi possível carregar o funil da conta Google Ads."),
      response.status,
    );
  }

  const record = normalizeFunnelRecord(payload);

  if (!record) {
    throw new PanelGoogleDashboardApiError(
      "A API respondeu ao funil do Google Ads, mas o formato retornado não foi reconhecido.",
      response.status,
    );
  }

  return record;
}

export async function getPanelGoogleDashboardTable(
  token: string,
  query: PanelGoogleDashboardQuery & { level?: PanelGoogleDashboardTableLevel },
) {
  const { payload, response } = await requestJson(
    PANEL_GOOGLE_DASHBOARD_TABLE_PATH,
    token,
    buildDashboardQuery(query),
  );

  if (!response.ok) {
    throw new PanelGoogleDashboardApiError(
      extractMessage(payload, "Não foi possível carregar a tabela detalhada do Google Ads."),
      response.status,
    );
  }

  const record = normalizeTableRecord(payload);

  if (!record) {
    throw new PanelGoogleDashboardApiError(
      "A API respondeu à tabela do Google Ads, mas o formato retornado não foi reconhecido.",
      response.status,
    );
  }

  return record;
}
