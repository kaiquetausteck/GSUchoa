import { getPanelApiBaseUrl } from "./auth-api";
import { resolveApiAssetUrl } from "./resolve-api-asset-url";

const PANEL_API_BASE_URL = getPanelApiBaseUrl();
const PANEL_LINKEDIN_STATUS_PATH =
  import.meta.env.VITE_PANEL_LINKEDIN_STATUS_PATH ?? "/integrations/linkedin/status";
const PANEL_LINKEDIN_CONNECT_PATH =
  import.meta.env.VITE_PANEL_LINKEDIN_CONNECT_PATH ?? "/integrations/linkedin/connect";
const PANEL_LINKEDIN_EXCHANGE_PATH =
  import.meta.env.VITE_PANEL_LINKEDIN_EXCHANGE_PATH ?? "/integrations/linkedin/exchange";
const PANEL_LINKEDIN_VALIDATE_PATH =
  import.meta.env.VITE_PANEL_LINKEDIN_VALIDATE_PATH ?? "/integrations/linkedin/validate";
const PANEL_LINKEDIN_CONNECTION_PATH =
  import.meta.env.VITE_PANEL_LINKEDIN_CONNECTION_PATH ?? "/integrations/linkedin/connection";
const PANEL_LINKEDIN_SOCIAL_MEDIA_ACCOUNTS_PATH =
  import.meta.env.VITE_PANEL_LINKEDIN_SOCIAL_MEDIA_ACCOUNTS_PATH ??
  "/integrations/linkedin/social-media/accounts";
const PANEL_LINKEDIN_SOCIAL_MEDIA_DASHBOARD_PATH =
  import.meta.env.VITE_PANEL_LINKEDIN_SOCIAL_MEDIA_DASHBOARD_PATH ??
  "/integrations/linkedin/social-media/dashboard";
const PANEL_LINKEDIN_SOCIAL_MEDIA_CONTENTS_PATH =
  import.meta.env.VITE_PANEL_LINKEDIN_SOCIAL_MEDIA_CONTENTS_PATH ??
  "/integrations/linkedin/social-media/contents";

export const PANEL_LINKEDIN_CONNECTION_STATUS_VALUES = [
  "NOT_CONNECTED",
  "CONNECTED",
  "EXPIRED",
  "INVALID",
  "RECONNECT_REQUIRED",
] as const;

export type PanelLinkedInConnectionStatus =
  (typeof PANEL_LINKEDIN_CONNECTION_STATUS_VALUES)[number];

export type PanelLinkedInConnectionStatusRecord = {
  canReconnect: boolean;
  connected: boolean;
  expiresAt: string | null;
  lastValidatedAt: string | null;
  refreshTokenExpiresAt: string | null;
  status: PanelLinkedInConnectionStatus;
};

export type PanelLinkedInConnectionDetailsRecord = PanelLinkedInConnectionStatusRecord & {
  linkedinMemberEmail: string | null;
  linkedinMemberId: string | null;
  linkedinMemberName: string | null;
  linkedinMemberPictureUrl: string | null;
};

export type PanelLinkedInConnectResponse = {
  authorizationUrl: string;
  expiresAt: string | null;
};

export type PanelLinkedInExchangeInput = {
  code: string;
  state: string;
};

export const PANEL_LINKEDIN_SOCIAL_MEDIA_CONTENT_TYPE_VALUES = [
  "post",
  "image",
  "video",
  "article",
  "document",
  "carousel",
  "poll",
  "event",
  "other",
] as const;

export type PanelLinkedInSocialMediaContentType =
  (typeof PANEL_LINKEDIN_SOCIAL_MEDIA_CONTENT_TYPE_VALUES)[number];

export const PANEL_LINKEDIN_SOCIAL_MEDIA_GRANULARITY_VALUES = [
  "auto",
  "day",
  "week",
] as const;

export type PanelLinkedInSocialMediaGranularity =
  (typeof PANEL_LINKEDIN_SOCIAL_MEDIA_GRANULARITY_VALUES)[number];

export const PANEL_LINKEDIN_SOCIAL_MEDIA_CONTENT_ORDER_BY_VALUES = [
  "publishedAt",
  "impressions",
  "clicks",
  "likes",
  "comments",
  "shares",
  "engagement",
  "engagementRate",
] as const;

export type PanelLinkedInSocialMediaContentOrderBy =
  (typeof PANEL_LINKEDIN_SOCIAL_MEDIA_CONTENT_ORDER_BY_VALUES)[number];

export const PANEL_LINKEDIN_SOCIAL_MEDIA_CONTENT_ORDER_DIRECTION_VALUES = [
  "asc",
  "desc",
] as const;

export type PanelLinkedInSocialMediaContentOrderDirection =
  (typeof PANEL_LINKEDIN_SOCIAL_MEDIA_CONTENT_ORDER_DIRECTION_VALUES)[number];

export const PANEL_LINKEDIN_SOCIAL_MEDIA_PERFORMANCE_BENCHMARK_VALUES = [
  "engagementRate",
  "impressions",
  "engagement",
  "clicks",
] as const;

export type PanelLinkedInSocialMediaPerformanceBenchmark =
  (typeof PANEL_LINKEDIN_SOCIAL_MEDIA_PERFORMANCE_BENCHMARK_VALUES)[number];

export const PANEL_LINKEDIN_SOCIAL_MEDIA_PERFORMANCE_CLASSIFICATION_VALUES = [
  "above_average",
  "below_average",
  "unknown",
] as const;

export type PanelLinkedInSocialMediaPerformanceClassification =
  (typeof PANEL_LINKEDIN_SOCIAL_MEDIA_PERFORMANCE_CLASSIFICATION_VALUES)[number];

export type PanelLinkedInSocialAccountCapabilitiesRecord = {
  hasContents: boolean;
  hasDashboard: boolean;
  hasOrganicPostAnalytics: boolean;
  hasReliableAudienceGrowth: boolean;
};

export type PanelLinkedInSocialAccountRecord = {
  avatarUrl: string | null;
  capabilities: PanelLinkedInSocialAccountCapabilitiesRecord;
  description: string | null;
  displayName: string;
  id: string;
  organizationId: string;
  organizationUrn: string;
  profileUrl: string | null;
  role: string | null;
  vanityName: string | null;
};

export type PanelLinkedInSocialMetricTotalsRecord = {
  clicks: number;
  comments: number;
  engagement: number;
  engagementRate: number | null;
  impressions: number;
  likes: number;
  shares: number;
};

export type PanelLinkedInSocialMetricAvailabilityRecord = {
  clicks: boolean;
  comments: boolean;
  engagement: boolean;
  engagementRate: boolean;
  impressions: boolean;
  likes: boolean;
  shares: boolean;
};

export type PanelLinkedInSocialDashboardContentTypeSummaryRecord = {
  averageEngagementRate: number | null;
  contentCount: number;
  contentType: PanelLinkedInSocialMediaContentType;
  metrics: PanelLinkedInSocialMetricTotalsRecord;
};

export type PanelLinkedInSocialClassificationSummaryRecord = {
  aboveAverage: number;
  belowAverage: number;
  unknown: number;
};

export type PanelLinkedInSocialDashboardOverviewRecord = {
  averagePerformanceValue: number | null;
  classification: PanelLinkedInSocialClassificationSummaryRecord;
  contentByType: PanelLinkedInSocialDashboardContentTypeSummaryRecord[];
  contentCount: number;
  metricAvailability: PanelLinkedInSocialMetricAvailabilityRecord;
  metrics: PanelLinkedInSocialMetricTotalsRecord;
  performanceBenchmark: PanelLinkedInSocialMediaPerformanceBenchmark | null;
};

export type PanelLinkedInSocialDashboardSeriesItemRecord = {
  bucketEnd: string;
  bucketStart: string;
  contentCount: number;
  label: string;
  metrics: PanelLinkedInSocialMetricTotalsRecord;
};

export type PanelLinkedInSocialPerformanceDetailsRecord = {
  average: number | null;
  benchmark: PanelLinkedInSocialMediaPerformanceBenchmark | null;
  classification: PanelLinkedInSocialMediaPerformanceClassification;
  value: number | null;
};

export type PanelLinkedInSocialContentItemRecord = {
  caption: string | null;
  contentType: PanelLinkedInSocialMediaContentType;
  id: string;
  metrics: PanelLinkedInSocialMetricTotalsRecord;
  performance: PanelLinkedInSocialPerformanceDetailsRecord;
  permalink: string | null;
  publishedAt: string | null;
  source: "linkedin";
  sourceId: string;
  sourceType: string | null;
  thumbnailUrl: string | null;
};

export type PanelLinkedInSocialDashboardComparisonMetricRecord = {
  current: number | null;
  delta: number | null;
  deltaPercentage: number | null;
  previous: number | null;
};

export type PanelLinkedInSocialDashboardComparisonRecord = {
  clicks: PanelLinkedInSocialDashboardComparisonMetricRecord;
  comments: PanelLinkedInSocialDashboardComparisonMetricRecord;
  contentCount: PanelLinkedInSocialDashboardComparisonMetricRecord;
  engagement: PanelLinkedInSocialDashboardComparisonMetricRecord;
  engagementRate: PanelLinkedInSocialDashboardComparisonMetricRecord;
  impressions: PanelLinkedInSocialDashboardComparisonMetricRecord;
  likes: PanelLinkedInSocialDashboardComparisonMetricRecord;
  previousEndDate: string;
  previousStartDate: string;
  shares: PanelLinkedInSocialDashboardComparisonMetricRecord;
};

export type PanelLinkedInSocialDashboardBestSlotRecord = {
  averagePerformanceValue: number | null;
  contentCount: number;
  key: string;
  label: string;
};

export type PanelLinkedInSocialDashboardWeeklyPublicationRecord = {
  contentCount: number;
  weekEnd: string;
  weekStart: string;
};

export type PanelLinkedInSocialDashboardRecord = {
  account: PanelLinkedInSocialAccountRecord;
  bestDayOfWeek: PanelLinkedInSocialDashboardBestSlotRecord | null;
  bestHourOfDay: PanelLinkedInSocialDashboardBestSlotRecord | null;
  comparison: PanelLinkedInSocialDashboardComparisonRecord;
  endDate: string;
  engagementRateByContentType: PanelLinkedInSocialDashboardContentTypeSummaryRecord[];
  granularity: PanelLinkedInSocialMediaGranularity;
  hasData: boolean;
  overview: PanelLinkedInSocialDashboardOverviewRecord;
  ranking: PanelLinkedInSocialContentItemRecord[];
  startDate: string;
  timeSeries: PanelLinkedInSocialDashboardSeriesItemRecord[];
  timezone: string;
  weeklyPublicationVolume: PanelLinkedInSocialDashboardWeeklyPublicationRecord[];
};

export type PanelLinkedInSocialContentListSummaryRecord = {
  averagePerformanceValue: number | null;
  classification: PanelLinkedInSocialClassificationSummaryRecord;
  performanceBenchmark: PanelLinkedInSocialMediaPerformanceBenchmark | null;
  totalContents: number;
};

export type PanelLinkedInSocialPaginationMetaRecord = {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};

export type PanelLinkedInSocialContentListRecord = {
  account: PanelLinkedInSocialAccountRecord;
  contentTypes: PanelLinkedInSocialMediaContentType[];
  data: PanelLinkedInSocialContentItemRecord[];
  endDate: string;
  meta: PanelLinkedInSocialPaginationMetaRecord;
  orderBy: PanelLinkedInSocialMediaContentOrderBy | null;
  orderDirection: PanelLinkedInSocialMediaContentOrderDirection | null;
  startDate: string;
  summary: PanelLinkedInSocialContentListSummaryRecord;
  timezone: string;
};

export type PanelLinkedInSocialMediaDashboardQuery = {
  accountId: string;
  endDate?: string;
  granularity?: PanelLinkedInSocialMediaGranularity;
  rankingLimit?: number;
  startDate?: string;
  timezone?: string;
};

export type PanelLinkedInSocialMediaContentsQuery = {
  accountId: string;
  contentTypes?: PanelLinkedInSocialMediaContentType[];
  endDate?: string;
  limit?: number;
  orderBy?: PanelLinkedInSocialMediaContentOrderBy;
  orderDirection?: PanelLinkedInSocialMediaContentOrderDirection;
  page?: number;
  startDate?: string;
  timezone?: string;
};

type JsonRecord = Record<string, unknown>;

class PanelLinkedInApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PanelLinkedInApiError";
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

function getFirstString(values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getFirstBoolean(values: unknown[]) {
  for (const value of values) {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "number") {
      return value !== 0;
    }

    if (typeof value === "string") {
      const normalizedValue = value.trim().toLowerCase();

      if (normalizedValue === "true") {
        return true;
      }

      if (normalizedValue === "false") {
        return false;
      }
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

  const nestedDataMessageList = isRecord(payload.data)
    ? extractStringList(payload.data.message)
    : [];
  if (nestedDataMessageList.length > 0) {
    return nestedDataMessageList.join(" ");
  }

  return getFirstString([payload.error, payload.detail, payload.path]) ?? fallbackMessage;
}

function normalizeDateTime(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
}

function normalizeDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const normalizedValue = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    return normalizedValue;
  }

  const parsedDate = new Date(normalizedValue);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString().slice(0, 10);
}

function normalizeRenderableUrl(value: unknown) {
  const normalizedValue = getFirstString([value]);

  if (!normalizedValue || normalizedValue.startsWith("urn:")) {
    return null;
  }

  return resolveApiAssetUrl(PANEL_API_BASE_URL, normalizedValue);
}

function resolvePayloadRoot(payload: unknown) {
  if (isRecord(payload) && isRecord(payload.data)) {
    return payload.data;
  }

  return payload;
}

async function requestJson(
  path: string,
  token: string,
  init: RequestInit = {},
  query?: URLSearchParams,
) {
  const hasJsonBody =
    init.body !== undefined &&
    typeof init.body === "string" &&
    !(init.headers instanceof Headers);

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new PanelLinkedInApiError(
      `Não foi possível conectar com a API em ${PANEL_API_BASE_URL}. Verifique se o backend está ativo.`,
    );
  }

  const payload = await parseJsonSafe(response);

  return {
    payload,
    response,
  };
}

function listPayloadArray(payload: unknown) {
  const root = resolvePayloadRoot(payload);

  if (Array.isArray(root)) {
    return root;
  }

  if (!isRecord(root)) {
    return [];
  }

  const candidateKeys = ["data", "items", "accounts"];
  const source = candidateKeys.find((key) => Array.isArray(root[key]))
    ? (root[candidateKeys.find((key) => Array.isArray(root[key]))!] as unknown[])
    : [];

  return source;
}

function appendQueryValue(params: URLSearchParams, key: string, value: unknown) {
  if (value === null || value === undefined) {
    return;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    params.append(key, String(value));
    return;
  }

  if (typeof value === "string" && value.trim()) {
    params.append(key, value.trim());
  }
}

function appendQueryValues(params: URLSearchParams, key: string, values: unknown[] | undefined) {
  if (!values?.length) {
    return;
  }

  values.forEach((value) => appendQueryValue(params, key, value));
}

function normalizeLinkedInConnectionStatus(
  value: unknown,
): PanelLinkedInConnectionStatus | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toUpperCase();

  return PANEL_LINKEDIN_CONNECTION_STATUS_VALUES.includes(
    normalizedValue as PanelLinkedInConnectionStatus,
  )
    ? (normalizedValue as PanelLinkedInConnectionStatus)
    : null;
}

function normalizeLinkedInConnectionStatusRecord(
  payload: unknown,
): PanelLinkedInConnectionStatusRecord | null {
  const root = resolvePayloadRoot(payload);

  if (!isRecord(root)) {
    return null;
  }

  const status = normalizeLinkedInConnectionStatus(root.status);

  if (!status) {
    return null;
  }

  return {
    canReconnect: getFirstBoolean([root.canReconnect]) ?? false,
    connected: getFirstBoolean([root.connected]) ?? status === "CONNECTED",
    expiresAt: normalizeDateTime(root.expiresAt),
    lastValidatedAt: normalizeDateTime(root.lastValidatedAt),
    refreshTokenExpiresAt: normalizeDateTime(root.refreshTokenExpiresAt),
    status,
  };
}

function normalizeLinkedInConnectionDetailsRecord(
  payload: unknown,
): PanelLinkedInConnectionDetailsRecord | null {
  const root = resolvePayloadRoot(payload);
  const statusRecord = normalizeLinkedInConnectionStatusRecord(root);

  if (!statusRecord || !isRecord(root)) {
    return null;
  }

  return {
    ...statusRecord,
    linkedinMemberEmail: getFirstString([root.linkedinMemberEmail]),
    linkedinMemberId: getFirstString([root.linkedinMemberId]),
    linkedinMemberName: getFirstString([root.linkedinMemberName]),
    linkedinMemberPictureUrl: normalizeRenderableUrl(root.linkedinMemberPictureUrl),
  };
}

function normalizeLinkedInConnectResponse(
  payload: unknown,
): PanelLinkedInConnectResponse | null {
  const root = resolvePayloadRoot(payload);

  if (!isRecord(root)) {
    return null;
  }

  const authorizationUrl = getFirstString([root.authorizationUrl]);

  if (!authorizationUrl) {
    return null;
  }

  return {
    authorizationUrl,
    expiresAt: normalizeDateTime(root.expiresAt),
  };
}

function normalizeLinkedInContentType(
  value: unknown,
): PanelLinkedInSocialMediaContentType {
  if (typeof value !== "string") {
    return "other";
  }

  const normalizedValue = value.trim().toLowerCase();

  return PANEL_LINKEDIN_SOCIAL_MEDIA_CONTENT_TYPE_VALUES.includes(
    normalizedValue as PanelLinkedInSocialMediaContentType,
  )
    ? (normalizedValue as PanelLinkedInSocialMediaContentType)
    : "other";
}

function normalizeLinkedInGranularity(
  value: unknown,
): PanelLinkedInSocialMediaGranularity | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();

  return PANEL_LINKEDIN_SOCIAL_MEDIA_GRANULARITY_VALUES.includes(
    normalizedValue as PanelLinkedInSocialMediaGranularity,
  )
    ? (normalizedValue as PanelLinkedInSocialMediaGranularity)
    : null;
}

function normalizeLinkedInContentOrderBy(
  value: unknown,
): PanelLinkedInSocialMediaContentOrderBy | null {
  if (typeof value !== "string") {
    return null;
  }

  return PANEL_LINKEDIN_SOCIAL_MEDIA_CONTENT_ORDER_BY_VALUES.includes(
    value.trim() as PanelLinkedInSocialMediaContentOrderBy,
  )
    ? (value.trim() as PanelLinkedInSocialMediaContentOrderBy)
    : null;
}

function normalizeLinkedInContentOrderDirection(
  value: unknown,
): PanelLinkedInSocialMediaContentOrderDirection | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();

  return PANEL_LINKEDIN_SOCIAL_MEDIA_CONTENT_ORDER_DIRECTION_VALUES.includes(
    normalizedValue as PanelLinkedInSocialMediaContentOrderDirection,
  )
    ? (normalizedValue as PanelLinkedInSocialMediaContentOrderDirection)
    : null;
}

function normalizeLinkedInPerformanceBenchmark(
  value: unknown,
): PanelLinkedInSocialMediaPerformanceBenchmark | null {
  if (typeof value !== "string") {
    return null;
  }

  return PANEL_LINKEDIN_SOCIAL_MEDIA_PERFORMANCE_BENCHMARK_VALUES.includes(
    value.trim() as PanelLinkedInSocialMediaPerformanceBenchmark,
  )
    ? (value.trim() as PanelLinkedInSocialMediaPerformanceBenchmark)
    : null;
}

function normalizeLinkedInPerformanceClassification(
  value: unknown,
): PanelLinkedInSocialMediaPerformanceClassification {
  if (typeof value !== "string") {
    return "unknown";
  }

  const normalizedValue = value.trim().toLowerCase();

  return PANEL_LINKEDIN_SOCIAL_MEDIA_PERFORMANCE_CLASSIFICATION_VALUES.includes(
    normalizedValue as PanelLinkedInSocialMediaPerformanceClassification,
  )
    ? (normalizedValue as PanelLinkedInSocialMediaPerformanceClassification)
    : "unknown";
}

function createEmptyMetricTotalsRecord(): PanelLinkedInSocialMetricTotalsRecord {
  return {
    clicks: 0,
    comments: 0,
    engagement: 0,
    engagementRate: null,
    impressions: 0,
    likes: 0,
    shares: 0,
  };
}

function createEmptyMetricAvailabilityRecord(): PanelLinkedInSocialMetricAvailabilityRecord {
  return {
    clicks: false,
    comments: false,
    engagement: false,
    engagementRate: false,
    impressions: false,
    likes: false,
    shares: false,
  };
}

function createEmptyClassificationSummaryRecord(): PanelLinkedInSocialClassificationSummaryRecord {
  return {
    aboveAverage: 0,
    belowAverage: 0,
    unknown: 0,
  };
}

function createEmptyComparisonMetricRecord(): PanelLinkedInSocialDashboardComparisonMetricRecord {
  return {
    current: null,
    delta: null,
    deltaPercentage: null,
    previous: null,
  };
}

function createEmptyComparisonRecord(): PanelLinkedInSocialDashboardComparisonRecord {
  return {
    clicks: createEmptyComparisonMetricRecord(),
    comments: createEmptyComparisonMetricRecord(),
    contentCount: createEmptyComparisonMetricRecord(),
    engagement: createEmptyComparisonMetricRecord(),
    engagementRate: createEmptyComparisonMetricRecord(),
    impressions: createEmptyComparisonMetricRecord(),
    likes: createEmptyComparisonMetricRecord(),
    previousEndDate: "",
    previousStartDate: "",
    shares: createEmptyComparisonMetricRecord(),
  };
}

function normalizeLinkedInAccountCapabilitiesRecord(
  payload: unknown,
): PanelLinkedInSocialAccountCapabilitiesRecord {
  if (!isRecord(payload)) {
    return {
      hasContents: false,
      hasDashboard: false,
      hasOrganicPostAnalytics: false,
      hasReliableAudienceGrowth: false,
    };
  }

  return {
    hasContents: getFirstBoolean([payload.hasContents]) ?? false,
    hasDashboard: getFirstBoolean([payload.hasDashboard]) ?? false,
    hasOrganicPostAnalytics: getFirstBoolean([payload.hasOrganicPostAnalytics]) ?? false,
    hasReliableAudienceGrowth: getFirstBoolean([payload.hasReliableAudienceGrowth]) ?? false,
  };
}

function normalizeLinkedInSocialAccountRecord(
  payload: unknown,
): PanelLinkedInSocialAccountRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id, payload.organizationId]);
  const organizationId = getFirstString([payload.organizationId, payload.id]);
  const organizationUrn = getFirstString([payload.organizationUrn]);
  const displayName = getFirstString([payload.displayName]);

  if (!id || !organizationId || !organizationUrn || !displayName) {
    return null;
  }

  return {
    avatarUrl: normalizeRenderableUrl(payload.avatarUrl),
    capabilities: normalizeLinkedInAccountCapabilitiesRecord(payload.capabilities),
    description: getFirstString([payload.description]),
    displayName,
    id,
    organizationId,
    organizationUrn,
    profileUrl: normalizeRenderableUrl(payload.profileUrl),
    role: getFirstString([payload.role]),
    vanityName: getFirstString([payload.vanityName]),
  };
}

function normalizeLinkedInMetricTotalsRecord(
  payload: unknown,
): PanelLinkedInSocialMetricTotalsRecord {
  if (!isRecord(payload)) {
    return createEmptyMetricTotalsRecord();
  }

  return {
    clicks: getFirstNumber([payload.clicks]) ?? 0,
    comments: getFirstNumber([payload.comments]) ?? 0,
    engagement: getFirstNumber([payload.engagement]) ?? 0,
    engagementRate: getFirstNumber([payload.engagementRate]),
    impressions: getFirstNumber([payload.impressions]) ?? 0,
    likes: getFirstNumber([payload.likes]) ?? 0,
    shares: getFirstNumber([payload.shares]) ?? 0,
  };
}

function normalizeLinkedInMetricAvailabilityRecord(
  payload: unknown,
): PanelLinkedInSocialMetricAvailabilityRecord {
  if (!isRecord(payload)) {
    return createEmptyMetricAvailabilityRecord();
  }

  return {
    clicks: getFirstBoolean([payload.clicks]) ?? false,
    comments: getFirstBoolean([payload.comments]) ?? false,
    engagement: getFirstBoolean([payload.engagement]) ?? false,
    engagementRate: getFirstBoolean([payload.engagementRate]) ?? false,
    impressions: getFirstBoolean([payload.impressions]) ?? false,
    likes: getFirstBoolean([payload.likes]) ?? false,
    shares: getFirstBoolean([payload.shares]) ?? false,
  };
}

function normalizeLinkedInClassificationSummaryRecord(
  payload: unknown,
): PanelLinkedInSocialClassificationSummaryRecord {
  if (!isRecord(payload)) {
    return createEmptyClassificationSummaryRecord();
  }

  return {
    aboveAverage: getFirstNumber([payload.aboveAverage]) ?? 0,
    belowAverage: getFirstNumber([payload.belowAverage]) ?? 0,
    unknown: getFirstNumber([payload.unknown]) ?? 0,
  };
}

function normalizeLinkedInDashboardContentTypeSummaryRecord(
  payload: unknown,
): PanelLinkedInSocialDashboardContentTypeSummaryRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  return {
    averageEngagementRate: getFirstNumber([payload.averageEngagementRate]),
    contentCount: getFirstNumber([payload.contentCount]) ?? 0,
    contentType: normalizeLinkedInContentType(payload.contentType),
    metrics: normalizeLinkedInMetricTotalsRecord(payload.metrics),
  };
}

function normalizeLinkedInDashboardOverviewRecord(
  payload: unknown,
): PanelLinkedInSocialDashboardOverviewRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  return {
    averagePerformanceValue: getFirstNumber([payload.averagePerformanceValue]),
    classification: normalizeLinkedInClassificationSummaryRecord(payload.classification),
    contentByType: Array.isArray(payload.contentByType)
      ? payload.contentByType
        .map((item) => normalizeLinkedInDashboardContentTypeSummaryRecord(item))
        .filter((item): item is PanelLinkedInSocialDashboardContentTypeSummaryRecord => item !== null)
      : [],
    contentCount: getFirstNumber([payload.contentCount]) ?? 0,
    metricAvailability: normalizeLinkedInMetricAvailabilityRecord(payload.metricAvailability),
    metrics: normalizeLinkedInMetricTotalsRecord(payload.metrics),
    performanceBenchmark: normalizeLinkedInPerformanceBenchmark(payload.performanceBenchmark),
  };
}

function normalizeLinkedInDashboardSeriesItemRecord(
  payload: unknown,
): PanelLinkedInSocialDashboardSeriesItemRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const bucketStart = normalizeDate(payload.bucketStart);
  const bucketEnd = normalizeDate(payload.bucketEnd);
  const label = getFirstString([payload.label]);

  if (!bucketStart || !bucketEnd || !label) {
    return null;
  }

  return {
    bucketEnd,
    bucketStart,
    contentCount: getFirstNumber([payload.contentCount]) ?? 0,
    label,
    metrics: normalizeLinkedInMetricTotalsRecord(payload.metrics),
  };
}

function normalizeLinkedInPerformanceDetailsRecord(
  payload: unknown,
): PanelLinkedInSocialPerformanceDetailsRecord {
  if (!isRecord(payload)) {
    return {
      average: null,
      benchmark: null,
      classification: "unknown",
      value: null,
    };
  }

  return {
    average: getFirstNumber([payload.average]),
    benchmark: normalizeLinkedInPerformanceBenchmark(payload.benchmark),
    classification: normalizeLinkedInPerformanceClassification(payload.classification),
    value: getFirstNumber([payload.value]),
  };
}

function normalizeLinkedInContentItemRecord(
  payload: unknown,
): PanelLinkedInSocialContentItemRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id, payload.sourceId]);
  const sourceId = getFirstString([payload.sourceId, payload.id]);

  if (!id || !sourceId) {
    return null;
  }

  return {
    caption: getFirstString([payload.caption]),
    contentType: normalizeLinkedInContentType(payload.contentType),
    id,
    metrics: normalizeLinkedInMetricTotalsRecord(payload.metrics),
    performance: normalizeLinkedInPerformanceDetailsRecord(payload.performance),
    permalink: normalizeRenderableUrl(payload.permalink),
    publishedAt: normalizeDateTime(payload.publishedAt),
    source: "linkedin",
    sourceId,
    sourceType: getFirstString([payload.sourceType]),
    thumbnailUrl: normalizeRenderableUrl(payload.thumbnailUrl),
  };
}

function normalizeLinkedInComparisonMetricRecord(
  payload: unknown,
): PanelLinkedInSocialDashboardComparisonMetricRecord {
  if (!isRecord(payload)) {
    return createEmptyComparisonMetricRecord();
  }

  return {
    current: getFirstNumber([payload.current]),
    delta: getFirstNumber([payload.delta]),
    deltaPercentage: getFirstNumber([payload.deltaPercentage]),
    previous: getFirstNumber([payload.previous]),
  };
}

function normalizeLinkedInComparisonRecord(
  payload: unknown,
): PanelLinkedInSocialDashboardComparisonRecord {
  if (!isRecord(payload)) {
    return createEmptyComparisonRecord();
  }

  return {
    clicks: normalizeLinkedInComparisonMetricRecord(payload.clicks),
    comments: normalizeLinkedInComparisonMetricRecord(payload.comments),
    contentCount: normalizeLinkedInComparisonMetricRecord(payload.contentCount),
    engagement: normalizeLinkedInComparisonMetricRecord(payload.engagement),
    engagementRate: normalizeLinkedInComparisonMetricRecord(payload.engagementRate),
    impressions: normalizeLinkedInComparisonMetricRecord(payload.impressions),
    likes: normalizeLinkedInComparisonMetricRecord(payload.likes),
    previousEndDate: normalizeDate(payload.previousEndDate) ?? "",
    previousStartDate: normalizeDate(payload.previousStartDate) ?? "",
    shares: normalizeLinkedInComparisonMetricRecord(payload.shares),
  };
}

function normalizeLinkedInBestSlotRecord(
  payload: unknown,
): PanelLinkedInSocialDashboardBestSlotRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const key = getFirstString([payload.key]);
  const label = getFirstString([payload.label]);

  if (!key || !label) {
    return null;
  }

  return {
    averagePerformanceValue: getFirstNumber([payload.averagePerformanceValue]),
    contentCount: getFirstNumber([payload.contentCount]) ?? 0,
    key,
    label,
  };
}

function normalizeLinkedInWeeklyPublicationRecord(
  payload: unknown,
): PanelLinkedInSocialDashboardWeeklyPublicationRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const weekStart = normalizeDate(payload.weekStart);
  const weekEnd = normalizeDate(payload.weekEnd);

  if (!weekStart || !weekEnd) {
    return null;
  }

  return {
    contentCount: getFirstNumber([payload.contentCount]) ?? 0,
    weekEnd,
    weekStart,
  };
}

function normalizeLinkedInDashboardRecord(
  payload: unknown,
): PanelLinkedInSocialDashboardRecord | null {
  const root = resolvePayloadRoot(payload);

  if (!isRecord(root)) {
    return null;
  }

  const account = normalizeLinkedInSocialAccountRecord(root.account);
  const overview = normalizeLinkedInDashboardOverviewRecord(root.overview);
  const startDate = normalizeDate(root.startDate);
  const endDate = normalizeDate(root.endDate);
  const timezone = getFirstString([root.timezone]) ?? "UTC";
  const granularity = normalizeLinkedInGranularity(root.granularity) ?? "auto";

  if (!account || !overview || !startDate || !endDate) {
    return null;
  }

  return {
    account,
    bestDayOfWeek: normalizeLinkedInBestSlotRecord(root.bestDayOfWeek),
    bestHourOfDay: normalizeLinkedInBestSlotRecord(root.bestHourOfDay),
    comparison: normalizeLinkedInComparisonRecord(root.comparison),
    endDate,
    engagementRateByContentType: Array.isArray(root.engagementRateByContentType)
      ? root.engagementRateByContentType
        .map((item) => normalizeLinkedInDashboardContentTypeSummaryRecord(item))
        .filter((item): item is PanelLinkedInSocialDashboardContentTypeSummaryRecord => item !== null)
      : [],
    granularity,
    hasData: getFirstBoolean([root.hasData]) ?? false,
    overview,
    ranking: Array.isArray(root.ranking)
      ? root.ranking
        .map((item) => normalizeLinkedInContentItemRecord(item))
        .filter((item): item is PanelLinkedInSocialContentItemRecord => item !== null)
      : [],
    startDate,
    timeSeries: Array.isArray(root.timeSeries)
      ? root.timeSeries
        .map((item) => normalizeLinkedInDashboardSeriesItemRecord(item))
        .filter((item): item is PanelLinkedInSocialDashboardSeriesItemRecord => item !== null)
      : [],
    timezone,
    weeklyPublicationVolume: Array.isArray(root.weeklyPublicationVolume)
      ? root.weeklyPublicationVolume
        .map((item) => normalizeLinkedInWeeklyPublicationRecord(item))
        .filter((item): item is PanelLinkedInSocialDashboardWeeklyPublicationRecord => item !== null)
      : [],
  };
}

function normalizeLinkedInContentListSummaryRecord(
  payload: unknown,
): PanelLinkedInSocialContentListSummaryRecord {
  if (!isRecord(payload)) {
    return {
      averagePerformanceValue: null,
      classification: createEmptyClassificationSummaryRecord(),
      performanceBenchmark: null,
      totalContents: 0,
    };
  }

  return {
    averagePerformanceValue: getFirstNumber([payload.averagePerformanceValue]),
    classification: normalizeLinkedInClassificationSummaryRecord(payload.classification),
    performanceBenchmark: normalizeLinkedInPerformanceBenchmark(payload.performanceBenchmark),
    totalContents: getFirstNumber([payload.totalContents]) ?? 0,
  };
}

function normalizePaginationMetaRecord(
  payload: unknown,
): PanelLinkedInSocialPaginationMetaRecord {
  if (!isRecord(payload)) {
    return {
      limit: 0,
      page: 1,
      total: 0,
      totalPages: 0,
    };
  }

  return {
    limit: getFirstNumber([payload.limit]) ?? 0,
    page: getFirstNumber([payload.page]) ?? 1,
    total: getFirstNumber([payload.total]) ?? 0,
    totalPages: getFirstNumber([payload.totalPages]) ?? 0,
  };
}

function normalizeLinkedInContentListRecord(
  payload: unknown,
): PanelLinkedInSocialContentListRecord | null {
  const root = resolvePayloadRoot(payload);

  if (!isRecord(root)) {
    return null;
  }

  const account = normalizeLinkedInSocialAccountRecord(root.account);
  const startDate = normalizeDate(root.startDate);
  const endDate = normalizeDate(root.endDate);
  const timezone = getFirstString([root.timezone]) ?? "UTC";

  if (!account || !startDate || !endDate) {
    return null;
  }

  return {
    account,
    contentTypes: Array.isArray(root.contentTypes)
      ? root.contentTypes.map((item) => normalizeLinkedInContentType(item))
      : [],
    data: Array.isArray(root.data)
      ? root.data
        .map((item) => normalizeLinkedInContentItemRecord(item))
        .filter((item): item is PanelLinkedInSocialContentItemRecord => item !== null)
      : [],
    endDate,
    meta: normalizePaginationMetaRecord(root.meta),
    orderBy: normalizeLinkedInContentOrderBy(root.orderBy),
    orderDirection: normalizeLinkedInContentOrderDirection(root.orderDirection),
    startDate,
    summary: normalizeLinkedInContentListSummaryRecord(root.summary),
    timezone,
  };
}

export async function getPanelLinkedInConnectionStatus(token: string) {
  const { payload, response } = await requestJson(PANEL_LINKEDIN_STATUS_PATH, token);

  if (!response.ok) {
    throw new PanelLinkedInApiError(
      extractMessage(payload, "Não foi possível carregar o status da integração LinkedIn."),
      response.status,
    );
  }

  const record = normalizeLinkedInConnectionStatusRecord(payload);

  if (!record) {
    throw new PanelLinkedInApiError(
      "A API respondeu ao status do LinkedIn, mas o formato retornado não foi reconhecido.",
      response.status,
    );
  }

  return record;
}

export async function getPanelLinkedInConnectLink(token: string) {
  const { payload, response } = await requestJson(PANEL_LINKEDIN_CONNECT_PATH, token);

  if (!response.ok) {
    throw new PanelLinkedInApiError(
      extractMessage(payload, "Não foi possível iniciar a conexão com o LinkedIn."),
      response.status,
    );
  }

  const record = normalizeLinkedInConnectResponse(payload);

  if (!record) {
    throw new PanelLinkedInApiError(
      "A API respondeu à conexão do LinkedIn, mas não retornou uma URL de autorização válida.",
      response.status,
    );
  }

  return record;
}

export async function exchangePanelLinkedInOAuthCode(
  token: string,
  input: PanelLinkedInExchangeInput,
) {
  const { payload, response } = await requestJson(PANEL_LINKEDIN_EXCHANGE_PATH, token, {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new PanelLinkedInApiError(
      extractMessage(payload, "Não foi possível concluir a conexão com o LinkedIn."),
      response.status,
    );
  }

  const record = normalizeLinkedInConnectionDetailsRecord(payload);

  if (!record) {
    throw new PanelLinkedInApiError(
      "A API concluiu a troca do code do LinkedIn, mas o retorno não foi reconhecido.",
      response.status,
    );
  }

  return record;
}

export async function validatePanelLinkedInConnection(token: string) {
  const { payload, response } = await requestJson(PANEL_LINKEDIN_VALIDATE_PATH, token, {
    method: "POST",
  });

  if (!response.ok) {
    throw new PanelLinkedInApiError(
      extractMessage(payload, "Não foi possível validar a conexão do LinkedIn agora."),
      response.status,
    );
  }

  const record = normalizeLinkedInConnectionDetailsRecord(payload);

  if (!record) {
    throw new PanelLinkedInApiError(
      "A API validou a conexão do LinkedIn, mas o retorno não foi reconhecido.",
      response.status,
    );
  }

  return record;
}

export async function deletePanelLinkedInConnection(token: string) {
  const { payload, response } = await requestJson(PANEL_LINKEDIN_CONNECTION_PATH, token, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new PanelLinkedInApiError(
      extractMessage(payload, "Não foi possível desconectar o LinkedIn agora."),
      response.status,
    );
  }
}

export async function listPanelLinkedInSocialAccounts(token: string) {
  const { payload, response } = await requestJson(
    PANEL_LINKEDIN_SOCIAL_MEDIA_ACCOUNTS_PATH,
    token,
  );

  if (!response.ok) {
    throw new PanelLinkedInApiError(
      extractMessage(payload, "Não foi possível carregar as organizations do LinkedIn."),
      response.status,
    );
  }

  return listPayloadArray(payload)
    .map((item) => normalizeLinkedInSocialAccountRecord(item))
    .filter((item): item is PanelLinkedInSocialAccountRecord => item !== null);
}

export async function getPanelLinkedInSocialDashboard(
  token: string,
  query: PanelLinkedInSocialMediaDashboardQuery,
) {
  const params = new URLSearchParams();

  appendQueryValue(params, "accountId", query.accountId);
  appendQueryValue(params, "startDate", query.startDate);
  appendQueryValue(params, "endDate", query.endDate);
  appendQueryValue(params, "timezone", query.timezone);
  appendQueryValue(params, "granularity", query.granularity);
  appendQueryValue(params, "rankingLimit", query.rankingLimit);

  const { payload, response } = await requestJson(
    PANEL_LINKEDIN_SOCIAL_MEDIA_DASHBOARD_PATH,
    token,
    {},
    params,
  );

  if (!response.ok) {
    throw new PanelLinkedInApiError(
      extractMessage(payload, "Não foi possível carregar o dashboard social do LinkedIn."),
      response.status,
    );
  }

  const record = normalizeLinkedInDashboardRecord(payload);

  if (!record) {
    throw new PanelLinkedInApiError(
      "A API retornou o dashboard social do LinkedIn em um formato inesperado.",
      response.status,
    );
  }

  return record;
}

export async function listPanelLinkedInSocialContents(
  token: string,
  query: PanelLinkedInSocialMediaContentsQuery,
) {
  const params = new URLSearchParams();

  appendQueryValue(params, "accountId", query.accountId);
  appendQueryValue(params, "startDate", query.startDate);
  appendQueryValue(params, "endDate", query.endDate);
  appendQueryValue(params, "timezone", query.timezone);
  appendQueryValues(params, "contentTypes", query.contentTypes);
  appendQueryValue(params, "orderBy", query.orderBy);
  appendQueryValue(params, "orderDirection", query.orderDirection);
  appendQueryValue(params, "page", query.page);
  appendQueryValue(params, "limit", query.limit);

  const { payload, response } = await requestJson(
    PANEL_LINKEDIN_SOCIAL_MEDIA_CONTENTS_PATH,
    token,
    {},
    params,
  );

  if (!response.ok) {
    throw new PanelLinkedInApiError(
      extractMessage(payload, "Não foi possível carregar os conteúdos do LinkedIn."),
      response.status,
    );
  }

  const record = normalizeLinkedInContentListRecord(payload);

  if (!record) {
    throw new PanelLinkedInApiError(
      "A API retornou a lista de conteúdos do LinkedIn em um formato inesperado.",
      response.status,
    );
  }

  return record;
}
