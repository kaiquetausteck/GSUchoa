import { getPanelApiBaseUrl } from "./auth-api";

const PANEL_API_BASE_URL = getPanelApiBaseUrl();
const PANEL_PAID_MEDIA_CAMPAIGNS_PATH =
  import.meta.env.VITE_PANEL_PAID_MEDIA_CAMPAIGNS_PATH ?? "/paid-media/campaigns";
const PANEL_PAID_MEDIA_CAMPAIGN_DETAIL_PATH =
  import.meta.env.VITE_PANEL_PAID_MEDIA_CAMPAIGN_DETAIL_PATH ?? "/paid-media/campaigns/:id";
const PANEL_PAID_MEDIA_CAMPAIGN_SUMMARY_PATH =
  import.meta.env.VITE_PANEL_PAID_MEDIA_CAMPAIGN_SUMMARY_PATH ??
  "/paid-media/campaigns/:id/dashboard/summary";
const PANEL_PAID_MEDIA_CAMPAIGN_TIMELINE_PATH =
  import.meta.env.VITE_PANEL_PAID_MEDIA_CAMPAIGN_TIMELINE_PATH ??
  "/paid-media/campaigns/:id/dashboard/timeline";
const PANEL_PAID_MEDIA_CAMPAIGN_FUNNEL_PATH =
  import.meta.env.VITE_PANEL_PAID_MEDIA_CAMPAIGN_FUNNEL_PATH ??
  "/paid-media/campaigns/:id/dashboard/funnel";
const PANEL_PAID_MEDIA_CAMPAIGN_TABLE_PATH =
  import.meta.env.VITE_PANEL_PAID_MEDIA_CAMPAIGN_TABLE_PATH ??
  "/paid-media/campaigns/:id/dashboard/table";

export const PANEL_PAID_MEDIA_PLATFORM_VALUES = ["META", "GOOGLE", "LINKEDIN"] as const;
export type PanelPaidMediaPlatform = (typeof PANEL_PAID_MEDIA_PLATFORM_VALUES)[number];

export const PANEL_PAID_MEDIA_CAMPAIGN_STATUS_VALUES = [
  "draft",
  "active",
  "paused",
  "completed",
  "archived",
] as const;

export type PanelPaidMediaCampaignStatus =
  (typeof PANEL_PAID_MEDIA_CAMPAIGN_STATUS_VALUES)[number];

export const PANEL_PAID_MEDIA_CAMPAIGN_SORT_VALUES = [
  "createdAt-desc",
  "createdAt-asc",
  "name-asc",
  "name-desc",
  "startDate-asc",
  "startDate-desc",
] as const;

export type PanelPaidMediaCampaignSort =
  (typeof PANEL_PAID_MEDIA_CAMPAIGN_SORT_VALUES)[number];

export const PANEL_PAID_MEDIA_DASHBOARD_DATA_SOURCE_VALUES = [
  "LINKED_ENTITIES",
  "ACCOUNT_FALLBACK",
  "EMPTY",
] as const;

export type PanelPaidMediaDashboardDataSource =
  (typeof PANEL_PAID_MEDIA_DASHBOARD_DATA_SOURCE_VALUES)[number];

export type PanelPaidMediaLinkedEntityType = "CAMPAIGN" | "ADSET" | "AD";
export type PanelPaidMediaInsightLevel = "ACCOUNT" | "CAMPAIGN" | "ADSET" | "AD";

export type PanelPaidMediaCampaignClientRecord = {
  id: string;
  name: string;
};

export type PanelPaidMediaCampaignMetaAdAccountRecord = {
  adAccountId: string;
  name: string;
  currency: string | null;
  timezoneName: string | null;
};

export type PanelPaidMediaCampaignLinkedEntityRecord = {
  id: string;
  entityType: PanelPaidMediaLinkedEntityType;
  externalId: string;
  name: string;
  metaAdAccountId: string;
  metaCampaignId: string | null;
  metaAdsetId: string | null;
  metaAdId: string | null;
};

export type PanelPaidMediaCampaignSummaryRecord = {
  id: string;
  name: string;
  platform: PanelPaidMediaPlatform;
  objective: string | null;
  status: PanelPaidMediaCampaignStatus;
  startDate: string | null;
  endDate: string | null;
  client: PanelPaidMediaCampaignClientRecord | null;
  metaAdAccount: PanelPaidMediaCampaignMetaAdAccountRecord | null;
  linkedEntitiesCount: number;
  createdAt: string;
};

export type PanelPaidMediaCampaignDetailRecord = PanelPaidMediaCampaignSummaryRecord & {
  notes: string | null;
  updatedAt: string;
  links: PanelPaidMediaCampaignLinkedEntityRecord[];
};

export type PanelPaidMediaCampaignListFilters = {
  clientId?: string;
  metaAdAccountId?: string;
  page: number;
  perPage: number;
  periodEnd?: string;
  periodStart?: string;
  platform?: PanelPaidMediaPlatform;
  search?: string;
  sort?: PanelPaidMediaCampaignSort;
  status?: "all" | PanelPaidMediaCampaignStatus;
};

export type PanelPaidMediaCampaignListResponse = {
  items: PanelPaidMediaCampaignSummaryRecord[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type PanelPaidMediaCreateCampaignInput = {
  clientId?: string;
  endDate?: string;
  linkedMetaAdIds?: string[];
  linkedMetaAdsetIds?: string[];
  linkedMetaCampaignIds?: string[];
  metaAdAccountId?: string;
  name: string;
  notes?: string;
  objective?: string;
  platform?: PanelPaidMediaPlatform;
  startDate?: string;
  status?: PanelPaidMediaCampaignStatus;
};

export type PanelPaidMediaUpdateCampaignInput = {
  clientId?: string | null;
  endDate?: string | null;
  linkedMetaAdIds?: string[];
  linkedMetaAdsetIds?: string[];
  linkedMetaCampaignIds?: string[];
  metaAdAccountId?: string | null;
  name?: string;
  notes?: string | null;
  objective?: string | null;
  platform?: PanelPaidMediaPlatform;
  startDate?: string | null;
  status?: PanelPaidMediaCampaignStatus;
};

export type PanelPaidMediaDashboardQuery = {
  endDate?: string;
  startDate?: string;
};

export type PanelPaidMediaDashboardSummaryRecord = {
  clicks: number;
  costPerResult: number;
  cpc: number;
  cpm: number;
  ctr: number;
  endDate: string;
  hasData: boolean;
  hasLinkedEntities: boolean;
  impressions: number;
  reach: number;
  resultsCount: number;
  source: PanelPaidMediaDashboardDataSource;
  spend: number;
  startDate: string;
};

export type PanelPaidMediaDashboardTimelineItemRecord = {
  clicks: number;
  date: string;
  impressions: number;
  reach: number;
  resultsCount: number;
  spend: number;
};

export type PanelPaidMediaDashboardTimelineRecord = {
  data: PanelPaidMediaDashboardTimelineItemRecord[];
  endDate: string;
  hasData: boolean;
  hasLinkedEntities: boolean;
  source: PanelPaidMediaDashboardDataSource;
  startDate: string;
};

export type PanelPaidMediaDashboardFunnelRecord = {
  clicks: number;
  conversions: number;
  endDate: string;
  hasData: boolean;
  hasLinkedEntities: boolean;
  reach: number;
  resultsCount: number;
  source: PanelPaidMediaDashboardDataSource;
  startDate: string;
};

export type PanelPaidMediaDashboardTableRowRecord = {
  clicks: number;
  costPerResult: number;
  entityId: string;
  entityLevel: PanelPaidMediaInsightLevel;
  impressions: number;
  investment: number;
  name: string;
  resultsCount: number;
};

export type PanelPaidMediaDashboardTableRecord = {
  data: PanelPaidMediaDashboardTableRowRecord[];
  endDate: string;
  hasData: boolean;
  hasLinkedEntities: boolean;
  source: PanelPaidMediaDashboardDataSource;
  startDate: string;
};

type JsonRecord = Record<string, unknown>;

class PanelPaidMediaApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PanelPaidMediaApiError";
    this.status = status;
  }
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function buildUrl(path: string) {
  return `${PANEL_API_BASE_URL}${normalizePath(path)}`;
}

function buildPathWithId(path: string, id: string) {
  return path.replace(":id", encodeURIComponent(id));
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

  const directMessageList = extractStringList(payload.message);
  if (directMessageList.length > 0) {
    return directMessageList.join(" ");
  }

  const nestedMessageList = isRecord(payload.data)
    ? extractStringList(payload.data.message)
    : [];
  if (nestedMessageList.length > 0) {
    return nestedMessageList.join(" ");
  }

  return getFirstString([payload.error, payload.detail, payload.path]) ?? fallbackMessage;
}

async function requestJson(path: string, token: string, init: RequestInit = {}) {
  const hasJsonBody =
    init.body !== undefined &&
    typeof init.body === "string" &&
    !(init.headers instanceof Headers);

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new PanelPaidMediaApiError(
      `Não foi possível conectar com a API em ${PANEL_API_BASE_URL}. Verifique se o backend está ativo.`,
    );
  }

  const payload = await parseJsonSafe(response);

  return {
    payload,
    response,
  };
}

function normalizeDateTime(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsedValue = new Date(value);

  return Number.isNaN(parsedValue.getTime()) ? null : parsedValue.toISOString();
}

function normalizeDateString(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return value.trim();
}

function normalizePlatform(value: unknown): PanelPaidMediaPlatform | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toUpperCase();

  return PANEL_PAID_MEDIA_PLATFORM_VALUES.includes(normalizedValue as PanelPaidMediaPlatform)
    ? (normalizedValue as PanelPaidMediaPlatform)
    : null;
}

function normalizeCampaignStatus(value: unknown): PanelPaidMediaCampaignStatus | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();

  return PANEL_PAID_MEDIA_CAMPAIGN_STATUS_VALUES.includes(
    normalizedValue as PanelPaidMediaCampaignStatus,
  )
    ? (normalizedValue as PanelPaidMediaCampaignStatus)
    : null;
}

function normalizeDashboardSource(value: unknown): PanelPaidMediaDashboardDataSource | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toUpperCase();

  return PANEL_PAID_MEDIA_DASHBOARD_DATA_SOURCE_VALUES.includes(
    normalizedValue as PanelPaidMediaDashboardDataSource,
  )
    ? (normalizedValue as PanelPaidMediaDashboardDataSource)
    : null;
}

function normalizeInsightLevel(value: unknown): PanelPaidMediaInsightLevel | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toUpperCase();

  return ["ACCOUNT", "CAMPAIGN", "ADSET", "AD"].includes(normalizedValue)
    ? (normalizedValue as PanelPaidMediaInsightLevel)
    : null;
}

function normalizeLinkedEntityType(value: unknown): PanelPaidMediaLinkedEntityType | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toUpperCase();

  return ["CAMPAIGN", "ADSET", "AD"].includes(normalizedValue)
    ? (normalizedValue as PanelPaidMediaLinkedEntityType)
    : null;
}

function normalizeClientRecord(value: unknown): PanelPaidMediaCampaignClientRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = getFirstString([value.id]);
  const name = getFirstString([value.name]);

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
  };
}

function normalizeMetaAdAccountRecord(
  value: unknown,
): PanelPaidMediaCampaignMetaAdAccountRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  const adAccountId = getFirstString([value.adAccountId]);
  const name = getFirstString([value.name]);

  if (!adAccountId || !name) {
    return null;
  }

  return {
    adAccountId,
    currency: getFirstString([value.currency]),
    name,
    timezoneName: getFirstString([value.timezoneName]),
  };
}

function normalizeLinkedEntityRecord(
  value: unknown,
): PanelPaidMediaCampaignLinkedEntityRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = getFirstString([value.id]);
  const entityType = normalizeLinkedEntityType(value.entityType);
  const externalId = getFirstString([value.externalId]);
  const name = getFirstString([value.name]);
  const metaAdAccountId = getFirstString([value.metaAdAccountId]);

  if (!id || !entityType || !externalId || !name || !metaAdAccountId) {
    return null;
  }

  return {
    entityType,
    externalId,
    id,
    metaAdAccountId,
    metaAdId: getFirstString([value.metaAdId]),
    metaAdsetId: getFirstString([value.metaAdsetId]),
    metaCampaignId: getFirstString([value.metaCampaignId]),
    name,
  };
}

function normalizeCampaignSummaryRecord(
  payload: unknown,
): PanelPaidMediaCampaignSummaryRecord | null {
  const root = resolvePayloadRoot(payload);

  if (!isRecord(root)) {
    return null;
  }

  const id = getFirstString([root.id]);
  const name = getFirstString([root.name]);
  const platform = normalizePlatform(root.platform);
  const status = normalizeCampaignStatus(root.status);
  const createdAt = normalizeDateTime(root.createdAt);

  if (!id || !name || !platform || !status || !createdAt) {
    return null;
  }

  return {
    client: normalizeClientRecord(root.client),
    createdAt,
    endDate: normalizeDateTime(root.endDate),
    id,
    linkedEntitiesCount: getFirstNumber([root.linkedEntitiesCount]) ?? 0,
    metaAdAccount: normalizeMetaAdAccountRecord(root.metaAdAccount),
    name,
    objective: getFirstString([root.objective]),
    platform,
    startDate: normalizeDateTime(root.startDate),
    status,
  };
}

function normalizeCampaignDetailRecord(
  payload: unknown,
): PanelPaidMediaCampaignDetailRecord | null {
  const root = resolvePayloadRoot(payload);
  const summaryRecord = normalizeCampaignSummaryRecord(root);

  if (!summaryRecord || !isRecord(root)) {
    return null;
  }

  const updatedAt = normalizeDateTime(root.updatedAt);

  if (!updatedAt) {
    return null;
  }

  return {
    ...summaryRecord,
    links: Array.isArray(root.links)
      ? root.links
        .map((item) => normalizeLinkedEntityRecord(item))
        .filter((item): item is PanelPaidMediaCampaignLinkedEntityRecord => item !== null)
      : [],
    notes: getFirstString([root.notes]),
    updatedAt,
  };
}

function normalizeCampaignListResponse(payload: unknown): PanelPaidMediaCampaignListResponse {
  const root = isRecord(payload) ? payload : null;
  const itemsRaw = Array.isArray(root?.data) ? root.data : Array.isArray(payload) ? payload : [];
  const meta = isRecord(root?.meta) ? root.meta : null;

  const items = itemsRaw
    .map((item) => normalizeCampaignSummaryRecord(item))
    .filter((item): item is PanelPaidMediaCampaignSummaryRecord => item !== null);

  const page = getFirstNumber([meta?.page]) ?? 1;
  const perPage = getFirstNumber([meta?.limit, meta?.perPage]) ?? Math.max(items.length, 10);
  const total = getFirstNumber([meta?.total]) ?? items.length;
  const totalPages =
    getFirstNumber([meta?.totalPages]) ?? Math.max(1, Math.ceil(total / Math.max(perPage, 1)));

  return {
    items,
    page,
    perPage,
    total,
    totalPages,
  };
}

function normalizeDashboardSummary(
  payload: unknown,
): PanelPaidMediaDashboardSummaryRecord | null {
  const root = resolvePayloadRoot(payload);

  if (!isRecord(root)) {
    return null;
  }

  const source = normalizeDashboardSource(root.source);
  const startDate = normalizeDateString(root.startDate);
  const endDate = normalizeDateString(root.endDate);

  if (!source || !startDate || !endDate) {
    return null;
  }

  return {
    clicks: getFirstNumber([root.clicks]) ?? 0,
    costPerResult: getFirstNumber([root.costPerResult]) ?? 0,
    cpc: getFirstNumber([root.cpc]) ?? 0,
    cpm: getFirstNumber([root.cpm]) ?? 0,
    ctr: getFirstNumber([root.ctr]) ?? 0,
    endDate,
    hasData: Boolean(root.hasData),
    hasLinkedEntities: Boolean(root.hasLinkedEntities),
    impressions: getFirstNumber([root.impressions]) ?? 0,
    reach: getFirstNumber([root.reach]) ?? 0,
    resultsCount: getFirstNumber([root.resultsCount]) ?? 0,
    source,
    spend: getFirstNumber([root.spend]) ?? 0,
    startDate,
  };
}

function normalizeDashboardTimeline(
  payload: unknown,
): PanelPaidMediaDashboardTimelineRecord | null {
  const root = resolvePayloadRoot(payload);

  if (!isRecord(root)) {
    return null;
  }

  const source = normalizeDashboardSource(root.source);
  const startDate = normalizeDateString(root.startDate);
  const endDate = normalizeDateString(root.endDate);

  if (!source || !startDate || !endDate) {
    return null;
  }

  const data = Array.isArray(root.data)
    ? root.data
      .map((item) => {
        if (!isRecord(item)) {
          return null;
        }

        const date = normalizeDateString(item.date);

        if (!date) {
          return null;
        }

        return {
          clicks: getFirstNumber([item.clicks]) ?? 0,
          date,
          impressions: getFirstNumber([item.impressions]) ?? 0,
          reach: getFirstNumber([item.reach]) ?? 0,
          resultsCount: getFirstNumber([item.resultsCount]) ?? 0,
          spend: getFirstNumber([item.spend]) ?? 0,
        } satisfies PanelPaidMediaDashboardTimelineItemRecord;
      })
      .filter((item): item is PanelPaidMediaDashboardTimelineItemRecord => item !== null)
    : [];

  return {
    data,
    endDate,
    hasData: Boolean(root.hasData),
    hasLinkedEntities: Boolean(root.hasLinkedEntities),
    source,
    startDate,
  };
}

function normalizeDashboardFunnel(
  payload: unknown,
): PanelPaidMediaDashboardFunnelRecord | null {
  const root = resolvePayloadRoot(payload);

  if (!isRecord(root)) {
    return null;
  }

  const source = normalizeDashboardSource(root.source);
  const startDate = normalizeDateString(root.startDate);
  const endDate = normalizeDateString(root.endDate);

  if (!source || !startDate || !endDate) {
    return null;
  }

  return {
    clicks: getFirstNumber([root.clicks]) ?? 0,
    conversions: getFirstNumber([root.conversions]) ?? 0,
    endDate,
    hasData: Boolean(root.hasData),
    hasLinkedEntities: Boolean(root.hasLinkedEntities),
    reach: getFirstNumber([root.reach]) ?? 0,
    resultsCount: getFirstNumber([root.resultsCount]) ?? 0,
    source,
    startDate,
  };
}

function normalizeDashboardTable(
  payload: unknown,
): PanelPaidMediaDashboardTableRecord | null {
  const root = resolvePayloadRoot(payload);

  if (!isRecord(root)) {
    return null;
  }

  const source = normalizeDashboardSource(root.source);
  const startDate = normalizeDateString(root.startDate);
  const endDate = normalizeDateString(root.endDate);

  if (!source || !startDate || !endDate) {
    return null;
  }

  const data = Array.isArray(root.data)
    ? root.data
      .map((item) => {
        if (!isRecord(item)) {
          return null;
        }

        const entityLevel = normalizeInsightLevel(item.entityLevel);
        const entityId = getFirstString([item.entityId]);
        const name = getFirstString([item.name]);

        if (!entityLevel || !entityId || !name) {
          return null;
        }

        return {
          clicks: getFirstNumber([item.clicks]) ?? 0,
          costPerResult: getFirstNumber([item.costPerResult]) ?? 0,
          entityId,
          entityLevel,
          impressions: getFirstNumber([item.impressions]) ?? 0,
          investment: getFirstNumber([item.investment]) ?? 0,
          name,
          resultsCount: getFirstNumber([item.resultsCount]) ?? 0,
        } satisfies PanelPaidMediaDashboardTableRowRecord;
      })
      .filter((item): item is PanelPaidMediaDashboardTableRowRecord => item !== null)
    : [];

  return {
    data,
    endDate,
    hasData: Boolean(root.hasData),
    hasLinkedEntities: Boolean(root.hasLinkedEntities),
    source,
    startDate,
  };
}

function createDashboardSearchParams(query: PanelPaidMediaDashboardQuery) {
  const searchParams = new URLSearchParams();

  if (query.startDate?.trim()) {
    searchParams.set("startDate", query.startDate.trim());
  }

  if (query.endDate?.trim()) {
    searchParams.set("endDate", query.endDate.trim());
  }

  return searchParams.toString();
}

export async function listPanelPaidMediaCampaigns(
  token: string,
  filters: PanelPaidMediaCampaignListFilters,
) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(filters.page));
  searchParams.set("limit", String(filters.perPage));

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim());
  }

  if (filters.platform) {
    searchParams.set("platform", filters.platform);
  }

  if (filters.status && filters.status !== "all") {
    searchParams.set("status", filters.status);
  }

  if (filters.clientId?.trim()) {
    searchParams.set("clientId", filters.clientId.trim());
  }

  if (filters.metaAdAccountId?.trim()) {
    searchParams.set("metaAdAccountId", filters.metaAdAccountId.trim());
  }

  if (filters.periodStart?.trim()) {
    searchParams.set("periodStart", filters.periodStart.trim());
  }

  if (filters.periodEnd?.trim()) {
    searchParams.set("periodEnd", filters.periodEnd.trim());
  }

  if (filters.sort) {
    searchParams.set("sort", filters.sort);
  }

  const { payload, response } = await requestJson(
    `${PANEL_PAID_MEDIA_CAMPAIGNS_PATH}?${searchParams.toString()}`,
    token,
  );

  if (!response.ok) {
    throw new PanelPaidMediaApiError(
      extractMessage(payload, "Não foi possível carregar as campanhas de tráfego pago."),
      response.status,
    );
  }

  return normalizeCampaignListResponse(payload);
}

export async function getPanelPaidMediaCampaignById(token: string, id: string) {
  const { payload, response } = await requestJson(
    buildPathWithId(PANEL_PAID_MEDIA_CAMPAIGN_DETAIL_PATH, id),
    token,
  );

  if (!response.ok) {
    throw new PanelPaidMediaApiError(
      extractMessage(payload, "Não foi possível carregar essa campanha."),
      response.status,
    );
  }

  const item = normalizeCampaignDetailRecord(payload);

  if (!item) {
    throw new PanelPaidMediaApiError(
      "A API respondeu à campanha, mas o formato retornado não foi reconhecido.",
      response.status,
    );
  }

  return item;
}

export async function createPanelPaidMediaCampaign(
  token: string,
  input: PanelPaidMediaCreateCampaignInput,
) {
  const { payload, response } = await requestJson(PANEL_PAID_MEDIA_CAMPAIGNS_PATH, token, {
    body: JSON.stringify(input),
    method: "POST",
  });

  if (!response.ok) {
    throw new PanelPaidMediaApiError(
      extractMessage(payload, "Não foi possível criar essa campanha."),
      response.status,
    );
  }

  const item = normalizeCampaignDetailRecord(payload);

  if (!item) {
    throw new PanelPaidMediaApiError(
      "A API respondeu à criação da campanha, mas o retorno não foi reconhecido.",
      response.status,
    );
  }

  return item;
}

export async function updatePanelPaidMediaCampaign(
  token: string,
  id: string,
  input: PanelPaidMediaUpdateCampaignInput,
) {
  const { payload, response } = await requestJson(
    buildPathWithId(PANEL_PAID_MEDIA_CAMPAIGN_DETAIL_PATH, id),
    token,
    {
      body: JSON.stringify(input),
      method: "PATCH",
    },
  );

  if (!response.ok) {
    throw new PanelPaidMediaApiError(
      extractMessage(payload, "Não foi possível salvar essa campanha."),
      response.status,
    );
  }

  const item = normalizeCampaignDetailRecord(payload);

  if (!item) {
    throw new PanelPaidMediaApiError(
      "A API respondeu à atualização da campanha, mas o retorno não foi reconhecido.",
      response.status,
    );
  }

  return item;
}

export async function deletePanelPaidMediaCampaign(token: string, id: string) {
  const { payload, response } = await requestJson(
    buildPathWithId(PANEL_PAID_MEDIA_CAMPAIGN_DETAIL_PATH, id),
    token,
    {
      method: "DELETE",
    },
  );

  if (!response.ok && response.status !== 204) {
    throw new PanelPaidMediaApiError(
      extractMessage(payload, "Não foi possível remover essa campanha."),
      response.status,
    );
  }
}

export async function getPanelPaidMediaCampaignDashboardSummary(
  token: string,
  id: string,
  query: PanelPaidMediaDashboardQuery,
) {
  const searchParams = createDashboardSearchParams(query);
  const path = buildPathWithId(PANEL_PAID_MEDIA_CAMPAIGN_SUMMARY_PATH, id);
  const { payload, response } = await requestJson(
    searchParams ? `${path}?${searchParams}` : path,
    token,
  );

  if (!response.ok) {
    throw new PanelPaidMediaApiError(
      extractMessage(payload, "Não foi possível carregar o resumo da campanha."),
      response.status,
    );
  }

  const record = normalizeDashboardSummary(payload);

  if (!record) {
    throw new PanelPaidMediaApiError(
      "A API respondeu ao resumo da campanha, mas o retorno não foi reconhecido.",
      response.status,
    );
  }

  return record;
}

export async function getPanelPaidMediaCampaignDashboardTimeline(
  token: string,
  id: string,
  query: PanelPaidMediaDashboardQuery,
) {
  const searchParams = createDashboardSearchParams(query);
  const path = buildPathWithId(PANEL_PAID_MEDIA_CAMPAIGN_TIMELINE_PATH, id);
  const { payload, response } = await requestJson(
    searchParams ? `${path}?${searchParams}` : path,
    token,
  );

  if (!response.ok) {
    throw new PanelPaidMediaApiError(
      extractMessage(payload, "Não foi possível carregar a timeline da campanha."),
      response.status,
    );
  }

  const record = normalizeDashboardTimeline(payload);

  if (!record) {
    throw new PanelPaidMediaApiError(
      "A API respondeu à timeline da campanha, mas o retorno não foi reconhecido.",
      response.status,
    );
  }

  return record;
}

export async function getPanelPaidMediaCampaignDashboardFunnel(
  token: string,
  id: string,
  query: PanelPaidMediaDashboardQuery,
) {
  const searchParams = createDashboardSearchParams(query);
  const path = buildPathWithId(PANEL_PAID_MEDIA_CAMPAIGN_FUNNEL_PATH, id);
  const { payload, response } = await requestJson(
    searchParams ? `${path}?${searchParams}` : path,
    token,
  );

  if (!response.ok) {
    throw new PanelPaidMediaApiError(
      extractMessage(payload, "Não foi possível carregar o funil da campanha."),
      response.status,
    );
  }

  const record = normalizeDashboardFunnel(payload);

  if (!record) {
    throw new PanelPaidMediaApiError(
      "A API respondeu ao funil da campanha, mas o retorno não foi reconhecido.",
      response.status,
    );
  }

  return record;
}

export async function getPanelPaidMediaCampaignDashboardTable(
  token: string,
  id: string,
  query: PanelPaidMediaDashboardQuery,
) {
  const searchParams = createDashboardSearchParams(query);
  const path = buildPathWithId(PANEL_PAID_MEDIA_CAMPAIGN_TABLE_PATH, id);
  const { payload, response } = await requestJson(
    searchParams ? `${path}?${searchParams}` : path,
    token,
  );

  if (!response.ok) {
    throw new PanelPaidMediaApiError(
      extractMessage(payload, "Não foi possível carregar a tabela analítica da campanha."),
      response.status,
    );
  }

  const record = normalizeDashboardTable(payload);

  if (!record) {
    throw new PanelPaidMediaApiError(
      "A API respondeu à tabela analítica da campanha, mas o retorno não foi reconhecido.",
      response.status,
    );
  }

  return record;
}
