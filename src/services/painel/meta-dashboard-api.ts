import { getPanelApiBaseUrl } from "./auth-api";

const PANEL_API_BASE_URL = getPanelApiBaseUrl();
const PANEL_META_FILTER_CAMPAIGNS_PATH =
  import.meta.env.VITE_PANEL_META_FILTER_CAMPAIGNS_PATH ?? "/meta/filters/campaigns";
const PANEL_META_FILTER_ADSETS_PATH =
  import.meta.env.VITE_PANEL_META_FILTER_ADSETS_PATH ?? "/meta/filters/adsets";
const PANEL_META_FILTER_ADS_PATH =
  import.meta.env.VITE_PANEL_META_FILTER_ADS_PATH ?? "/meta/filters/ads";
const PANEL_META_DASHBOARD_SUMMARY_PATH =
  import.meta.env.VITE_PANEL_META_DASHBOARD_SUMMARY_PATH ?? "/meta/dashboard/summary";
const PANEL_META_DASHBOARD_TIMELINE_PATH =
  import.meta.env.VITE_PANEL_META_DASHBOARD_TIMELINE_PATH ?? "/meta/dashboard/timeline";
const PANEL_META_DASHBOARD_FUNNEL_PATH =
  import.meta.env.VITE_PANEL_META_DASHBOARD_FUNNEL_PATH ?? "/meta/dashboard/funnel";
const PANEL_META_DASHBOARD_TABLE_PATH =
  import.meta.env.VITE_PANEL_META_DASHBOARD_TABLE_PATH ?? "/meta/dashboard/table";

export const PANEL_META_DASHBOARD_TABLE_LEVEL_VALUES = ["campaign", "adset", "ad"] as const;
export type PanelMetaDashboardTableLevel =
  (typeof PANEL_META_DASHBOARD_TABLE_LEVEL_VALUES)[number];

export type PanelMetaFiltersCampaignRecord = {
  id: string;
  metaCampaignId: string;
  name: string;
  objective: string | null;
  status: string | null;
  effectiveStatus: string | null;
};

export type PanelMetaFiltersAdsetRecord = {
  id: string;
  metaAdsetId: string;
  metaCampaignId: string;
  name: string;
  status: string | null;
  effectiveStatus: string | null;
};

export type PanelMetaFiltersAdRecord = {
  id: string;
  metaAdId: string;
  metaAdsetId: string;
  metaCampaignId: string | null;
  name: string;
  status: string | null;
  effectiveStatus: string | null;
};

export type PanelMetaFiltersCampaignsQuery = {
  adAccountId?: string;
  search?: string;
};

export type PanelMetaFiltersAdsetsQuery = {
  adAccountId?: string;
  campaignIds?: string[];
  search?: string;
};

export type PanelMetaFiltersAdsQuery = {
  adAccountId?: string;
  adsetIds?: string[];
  campaignIds?: string[];
  search?: string;
};

export type PanelMetaDashboardQuery = {
  adAccountId?: string;
  adIds?: string[];
  adsetIds?: string[];
  campaignIds?: string[];
  endDate?: string;
  startDate?: string;
};

export type PanelMetaDashboardSummaryRecord = {
  adAccountId: string;
  adAccountName: string;
  adIds: string[];
  adsetIds: string[];
  campaignIds: string[];
  clicks: number;
  costPerResult: number;
  cpc: number;
  cpm: number;
  ctr: number;
  endDate: string;
  hasData: boolean;
  impressions: number;
  reach: number;
  resultsCount: number;
  spend: number;
  startDate: string;
};

export type PanelMetaDashboardTimelineItemRecord = {
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

export type PanelMetaDashboardTimelineRecord = Omit<PanelMetaDashboardSummaryRecord, "clicks" | "costPerResult" | "cpc" | "cpm" | "ctr" | "impressions" | "reach" | "resultsCount" | "spend"> & {
  data: PanelMetaDashboardTimelineItemRecord[];
};

export type PanelMetaDashboardFunnelRecord = Omit<PanelMetaDashboardSummaryRecord, "clicks" | "costPerResult" | "cpc" | "cpm" | "ctr" | "impressions" | "spend"> & {
  clicks: number;
  conversions: number;
  reach: number;
  resultsCount: number;
};

export type PanelMetaDashboardTableRowRecord = {
  clicks: number;
  costPerResult: number;
  cpc: number;
  cpm: number;
  ctr: number;
  id: string;
  impressions: number;
  level: PanelMetaDashboardTableLevel;
  name: string;
  reach: number;
  resultsCount: number;
  spend: number;
};

export type PanelMetaDashboardTableRecord = Omit<PanelMetaDashboardSummaryRecord, "clicks" | "costPerResult" | "cpc" | "cpm" | "ctr" | "impressions" | "reach" | "resultsCount" | "spend"> & {
  data: PanelMetaDashboardTableRowRecord[];
  level: PanelMetaDashboardTableLevel;
};

type JsonRecord = Record<string, unknown>;

class PanelMetaDashboardApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PanelMetaDashboardApiError";
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
    throw new PanelMetaDashboardApiError(
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

function buildDashboardQuery(query: PanelMetaDashboardQuery & { level?: PanelMetaDashboardTableLevel }) {
  const params = new URLSearchParams();

  appendQueryValue(params, "adAccountId", query.adAccountId);
  appendQueryValue(params, "startDate", query.startDate);
  appendQueryValue(params, "endDate", query.endDate);
  appendQueryArray(params, "campaignIds", query.campaignIds);
  appendQueryArray(params, "adsetIds", query.adsetIds);
  appendQueryArray(params, "adIds", query.adIds);

  if (query.level) {
    appendQueryValue(params, "level", query.level);
  }

  return params;
}

function buildFiltersQuery(
  query:
    | PanelMetaFiltersCampaignsQuery
    | PanelMetaFiltersAdsetsQuery
    | PanelMetaFiltersAdsQuery,
) {
  const params = new URLSearchParams();

  appendQueryValue(params, "adAccountId", query.adAccountId);
  appendQueryValue(params, "search", query.search);

  if ("campaignIds" in query) {
    appendQueryArray(params, "campaignIds", query.campaignIds);
  }

  if ("adsetIds" in query) {
    appendQueryArray(params, "adsetIds", query.adsetIds);
  }

  return params;
}

function normalizeDashboardBaseRecord(payload: unknown) {
  const root = resolvePayloadRoot(payload);

  if (!isRecord(root)) {
    return null;
  }

  const adAccountId = getFirstString([root.adAccountId]);
  const adAccountName = getFirstString([root.adAccountName]);
  const startDate = getFirstString([root.startDate]);
  const endDate = getFirstString([root.endDate]);

  if (!adAccountId || !adAccountName || !startDate || !endDate) {
    return null;
  }

  return {
    adAccountId,
    adAccountName,
    adIds: extractStringList(root.adIds),
    adsetIds: extractStringList(root.adsetIds),
    campaignIds: extractStringList(root.campaignIds),
    endDate,
    hasData: Boolean(root.hasData),
    startDate,
  };
}

function normalizeFiltersCampaignRecord(payload: unknown): PanelMetaFiltersCampaignRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id]);
  const metaCampaignId = getFirstString([payload.metaCampaignId]);
  const name = getFirstString([payload.name]);

  if (!id || !metaCampaignId || !name) {
    return null;
  }

  return {
    effectiveStatus: getFirstString([payload.effectiveStatus]),
    id,
    metaCampaignId,
    name,
    objective: getFirstString([payload.objective]),
    status: getFirstString([payload.status]),
  };
}

function normalizeFiltersAdsetRecord(payload: unknown): PanelMetaFiltersAdsetRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id]);
  const metaAdsetId = getFirstString([payload.metaAdsetId]);
  const metaCampaignId = getFirstString([payload.metaCampaignId]);
  const name = getFirstString([payload.name]);

  if (!id || !metaAdsetId || !metaCampaignId || !name) {
    return null;
  }

  return {
    effectiveStatus: getFirstString([payload.effectiveStatus]),
    id,
    metaAdsetId,
    metaCampaignId,
    name,
    status: getFirstString([payload.status]),
  };
}

function normalizeFiltersAdRecord(payload: unknown): PanelMetaFiltersAdRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id]);
  const metaAdId = getFirstString([payload.metaAdId]);
  const metaAdsetId = getFirstString([payload.metaAdsetId]);
  const name = getFirstString([payload.name]);

  if (!id || !metaAdId || !metaAdsetId || !name) {
    return null;
  }

  return {
    effectiveStatus: getFirstString([payload.effectiveStatus]),
    id,
    metaAdId,
    metaAdsetId,
    metaCampaignId: getFirstString([payload.metaCampaignId]),
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

function normalizeSummaryRecord(payload: unknown): PanelMetaDashboardSummaryRecord | null {
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

function normalizeTimelineItem(payload: unknown): PanelMetaDashboardTimelineItemRecord | null {
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

function normalizeTimelineRecord(payload: unknown): PanelMetaDashboardTimelineRecord | null {
  const baseRecord = normalizeDashboardBaseRecord(payload);
  const root = resolvePayloadRoot(payload);

  if (!baseRecord || !isRecord(root) || !Array.isArray(root.data)) {
    return null;
  }

  return {
    ...baseRecord,
    data: root.data
      .map((item) => normalizeTimelineItem(item))
      .filter((item): item is PanelMetaDashboardTimelineItemRecord => item !== null),
  };
}

function normalizeFunnelRecord(payload: unknown): PanelMetaDashboardFunnelRecord | null {
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

function normalizeTableLevel(value: unknown): PanelMetaDashboardTableLevel | null {
  if (typeof value !== "string") {
    return null;
  }

  return PANEL_META_DASHBOARD_TABLE_LEVEL_VALUES.includes(value as PanelMetaDashboardTableLevel)
    ? (value as PanelMetaDashboardTableLevel)
    : null;
}

function normalizeTableRow(payload: unknown): PanelMetaDashboardTableRowRecord | null {
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

function normalizeTableRecord(payload: unknown): PanelMetaDashboardTableRecord | null {
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
      .filter((item): item is PanelMetaDashboardTableRowRecord => item !== null),
    level,
  };
}

export async function listPanelMetaFilterCampaigns(
  token: string,
  query: PanelMetaFiltersCampaignsQuery = {},
) {
  const { payload, response } = await requestJson(
    PANEL_META_FILTER_CAMPAIGNS_PATH,
    token,
    buildFiltersQuery(query),
  );

  if (!response.ok) {
    throw new PanelMetaDashboardApiError(
      extractMessage(payload, "Não foi possível carregar as campanhas da Meta."),
      response.status,
    );
  }

  return normalizeFiltersCollection(payload, ["campaigns", "items"], normalizeFiltersCampaignRecord);
}

export async function listPanelMetaFilterAdsets(
  token: string,
  query: PanelMetaFiltersAdsetsQuery = {},
) {
  const { payload, response } = await requestJson(
    PANEL_META_FILTER_ADSETS_PATH,
    token,
    buildFiltersQuery(query),
  );

  if (!response.ok) {
    throw new PanelMetaDashboardApiError(
      extractMessage(payload, "Não foi possível carregar os conjuntos da Meta."),
      response.status,
    );
  }

  return normalizeFiltersCollection(payload, ["adsets", "items"], normalizeFiltersAdsetRecord);
}

export async function listPanelMetaFilterAds(
  token: string,
  query: PanelMetaFiltersAdsQuery = {},
) {
  const { payload, response } = await requestJson(
    PANEL_META_FILTER_ADS_PATH,
    token,
    buildFiltersQuery(query),
  );

  if (!response.ok) {
    throw new PanelMetaDashboardApiError(
      extractMessage(payload, "Não foi possível carregar os anúncios da Meta."),
      response.status,
    );
  }

  return normalizeFiltersCollection(payload, ["ads", "items"], normalizeFiltersAdRecord);
}

export async function getPanelMetaDashboardSummary(
  token: string,
  query: PanelMetaDashboardQuery,
) {
  const { payload, response } = await requestJson(
    PANEL_META_DASHBOARD_SUMMARY_PATH,
    token,
    buildDashboardQuery(query),
  );

  if (!response.ok) {
    throw new PanelMetaDashboardApiError(
      extractMessage(payload, "Não foi possível carregar o resumo da conta Meta."),
      response.status,
    );
  }

  const record = normalizeSummaryRecord(payload);

  if (!record) {
    throw new PanelMetaDashboardApiError(
      "A API respondeu ao resumo da Meta, mas o formato retornado não foi reconhecido.",
      response.status,
    );
  }

  return record;
}

export async function getPanelMetaDashboardTimeline(
  token: string,
  query: PanelMetaDashboardQuery,
) {
  const { payload, response } = await requestJson(
    PANEL_META_DASHBOARD_TIMELINE_PATH,
    token,
    buildDashboardQuery(query),
  );

  if (!response.ok) {
    throw new PanelMetaDashboardApiError(
      extractMessage(payload, "Não foi possível carregar a linha do tempo da Meta."),
      response.status,
    );
  }

  const record = normalizeTimelineRecord(payload);

  if (!record) {
    throw new PanelMetaDashboardApiError(
      "A API respondeu à timeline da Meta, mas o formato retornado não foi reconhecido.",
      response.status,
    );
  }

  return record;
}

export async function getPanelMetaDashboardFunnel(
  token: string,
  query: PanelMetaDashboardQuery,
) {
  const { payload, response } = await requestJson(
    PANEL_META_DASHBOARD_FUNNEL_PATH,
    token,
    buildDashboardQuery(query),
  );

  if (!response.ok) {
    throw new PanelMetaDashboardApiError(
      extractMessage(payload, "Não foi possível carregar o funil da conta Meta."),
      response.status,
    );
  }

  const record = normalizeFunnelRecord(payload);

  if (!record) {
    throw new PanelMetaDashboardApiError(
      "A API respondeu ao funil da Meta, mas o formato retornado não foi reconhecido.",
      response.status,
    );
  }

  return record;
}

export async function getPanelMetaDashboardTable(
  token: string,
  query: PanelMetaDashboardQuery & { level?: PanelMetaDashboardTableLevel },
) {
  const { payload, response } = await requestJson(
    PANEL_META_DASHBOARD_TABLE_PATH,
    token,
    buildDashboardQuery(query),
  );

  if (!response.ok) {
    throw new PanelMetaDashboardApiError(
      extractMessage(payload, "Não foi possível carregar a tabela detalhada da Meta."),
      response.status,
    );
  }

  const record = normalizeTableRecord(payload);

  if (!record) {
    throw new PanelMetaDashboardApiError(
      "A API respondeu à tabela da Meta, mas o formato retornado não foi reconhecido.",
      response.status,
    );
  }

  return record;
}
