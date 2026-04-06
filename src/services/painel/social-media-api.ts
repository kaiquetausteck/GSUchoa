import { getPanelApiBaseUrl } from "./auth-api";
import { resolveApiAssetUrl } from "./resolve-api-asset-url";

const PANEL_API_BASE_URL = getPanelApiBaseUrl();
const PANEL_META_PAGES_PATH = import.meta.env.VITE_PANEL_META_PAGES_PATH ?? "/integrations/meta/pages";
const PANEL_META_INSTAGRAM_ACCOUNTS_PATH =
  import.meta.env.VITE_PANEL_META_INSTAGRAM_ACCOUNTS_PATH ?? "/integrations/meta/instagram-accounts";
const PANEL_META_INSTAGRAM_BUSINESS_ACCOUNT_PATH =
  import.meta.env.VITE_PANEL_META_INSTAGRAM_BUSINESS_ACCOUNT_PATH ??
  "/integrations/meta/instagram-business-account";
const PANEL_META_PAGE_POSTS_PATH =
  import.meta.env.VITE_PANEL_META_PAGE_POSTS_PATH ?? "/integrations/meta/page-posts";
const PANEL_META_PAGE_POSTS_PUBLISH_PATH =
  import.meta.env.VITE_PANEL_META_PAGE_POSTS_PUBLISH_PATH ?? PANEL_META_PAGE_POSTS_PATH;
const PANEL_META_PAGE_INSIGHTS_PATH =
  import.meta.env.VITE_PANEL_META_PAGE_INSIGHTS_PATH ?? "/integrations/meta/page-insights";
const PANEL_META_INSTAGRAM_MEDIA_PATH =
  import.meta.env.VITE_PANEL_META_INSTAGRAM_MEDIA_PATH ?? "/integrations/meta/instagram-media";
const PANEL_META_INSTAGRAM_MEDIA_PUBLISH_PATH =
  import.meta.env.VITE_PANEL_META_INSTAGRAM_MEDIA_PUBLISH_PATH ??
  "/integrations/meta/instagram-media/publish";
const PANEL_META_INSTAGRAM_COMMENTS_PATH =
  import.meta.env.VITE_PANEL_META_INSTAGRAM_COMMENTS_PATH ?? "/integrations/meta/instagram-comments";
const PANEL_META_INSTAGRAM_COMMENT_REPLY_PATH =
  import.meta.env.VITE_PANEL_META_INSTAGRAM_COMMENT_REPLY_PATH ??
  "/integrations/meta/instagram-comments/reply";
const PANEL_META_INSTAGRAM_COMMENT_HIDE_PATH =
  import.meta.env.VITE_PANEL_META_INSTAGRAM_COMMENT_HIDE_PATH ??
  "/integrations/meta/instagram-comments/hide";
const PANEL_META_INSTAGRAM_INSIGHTS_PATH =
  import.meta.env.VITE_PANEL_META_INSTAGRAM_INSIGHTS_PATH ?? "/integrations/meta/instagram-insights";
const PANEL_META_SOCIAL_DASHBOARD_PATH =
  import.meta.env.VITE_PANEL_META_SOCIAL_DASHBOARD_PATH ?? "/integrations/meta/social-dashboard";
const PANEL_META_SOCIAL_DEBUG_PATH =
  import.meta.env.VITE_PANEL_META_SOCIAL_DEBUG_PATH ?? "/integrations/meta/social-debug";
const PANEL_META_SOCIAL_MEDIA_ACCOUNTS_PATH =
  import.meta.env.VITE_PANEL_META_SOCIAL_MEDIA_ACCOUNTS_PATH ??
  "/integrations/meta/social-media/accounts";
const PANEL_META_SOCIAL_MEDIA_DASHBOARD_PATH =
  import.meta.env.VITE_PANEL_META_SOCIAL_MEDIA_DASHBOARD_PATH ??
  "/integrations/meta/social-media/dashboard";
const PANEL_META_SOCIAL_MEDIA_CONTENTS_PATH =
  import.meta.env.VITE_PANEL_META_SOCIAL_MEDIA_CONTENTS_PATH ??
  "/integrations/meta/social-media/contents";

export const PANEL_SOCIAL_MEDIA_PLATFORM_VALUES = ["facebook", "instagram"] as const;
export type PanelSocialMediaPlatform = (typeof PANEL_SOCIAL_MEDIA_PLATFORM_VALUES)[number];

export const PANEL_SOCIAL_MEDIA_CONTENT_KIND_VALUES = [
  "facebook_post",
  "instagram_post",
  "post",
  "reel",
  "video",
  "image",
  "carousel",
  "story",
  "other",
] as const;
export type PanelSocialMediaContentKind =
  (typeof PANEL_SOCIAL_MEDIA_CONTENT_KIND_VALUES)[number];

export const PANEL_SOCIAL_MEDIA_MEDIA_KIND_VALUES = [
  "carousel",
  "image",
  "photo",
  "post",
  "reel",
  "story",
  "unknown",
  "video",
] as const;
export type PanelSocialMediaMediaKind =
  (typeof PANEL_SOCIAL_MEDIA_MEDIA_KIND_VALUES)[number];

export const PANEL_META_SOCIAL_MEDIA_ACCOUNT_TYPE_VALUES = [
  "facebook",
  "instagram",
  "both",
] as const;
export type PanelMetaSocialMediaAccountType =
  (typeof PANEL_META_SOCIAL_MEDIA_ACCOUNT_TYPE_VALUES)[number];

export const PANEL_META_SOCIAL_MEDIA_CONTENT_TYPE_VALUES = [
  "post",
  "reel",
  "video",
  "image",
  "carousel",
  "story",
  "other",
] as const;
export type PanelMetaSocialMediaContentType =
  (typeof PANEL_META_SOCIAL_MEDIA_CONTENT_TYPE_VALUES)[number];

export const PANEL_META_SOCIAL_MEDIA_GRANULARITY_VALUES = ["auto", "day", "week"] as const;
export type PanelMetaSocialMediaGranularity =
  (typeof PANEL_META_SOCIAL_MEDIA_GRANULARITY_VALUES)[number];

export const PANEL_META_SOCIAL_MEDIA_CONTENT_ORDER_BY_VALUES = [
  "publishedAt",
  "views",
  "likes",
  "comments",
  "shares",
  "saves",
  "reach",
  "impressions",
  "engagement",
  "engagementRate",
] as const;
export type PanelMetaSocialMediaContentOrderBy =
  (typeof PANEL_META_SOCIAL_MEDIA_CONTENT_ORDER_BY_VALUES)[number];

export const PANEL_META_SOCIAL_MEDIA_CONTENT_ORDER_DIRECTION_VALUES = [
  "asc",
  "desc",
] as const;
export type PanelMetaSocialMediaContentOrderDirection =
  (typeof PANEL_META_SOCIAL_MEDIA_CONTENT_ORDER_DIRECTION_VALUES)[number];

export const PANEL_META_SOCIAL_MEDIA_PERFORMANCE_BENCHMARK_VALUES = [
  "engagementRate",
  "views",
  "reach",
  "engagement",
] as const;
export type PanelMetaSocialMediaPerformanceBenchmark =
  (typeof PANEL_META_SOCIAL_MEDIA_PERFORMANCE_BENCHMARK_VALUES)[number];

export const PANEL_META_SOCIAL_MEDIA_PERFORMANCE_CLASSIFICATION_VALUES = [
  "above_average",
  "below_average",
  "unknown",
] as const;
export type PanelMetaSocialMediaPerformanceClassification =
  (typeof PANEL_META_SOCIAL_MEDIA_PERFORMANCE_CLASSIFICATION_VALUES)[number];

export type PanelMetaSocialPageRecord = {
  category: string | null;
  hasInstagramBusinessAccount: boolean;
  instagramBusinessAccountId: string | null;
  name: string;
  pageId: string;
  pictureUrl: string | null;
};

export type PanelMetaSocialInstagramAccountRecord = {
  instagramAccountId: string;
  name: string | null;
  pageId: string;
  pageName: string;
  profilePictureUrl: string | null;
  username: string;
};

export type PanelMetaInstagramBusinessAccountRecord = {
  category: string | null;
  hasPageAccessToken: boolean;
  instagramBusinessAccountIdFromAccountsList: string | null;
  pageId: string;
  pageName: string;
  resolvedInstagramBusinessAccountId: string | null;
  tasks: string[];
};

export type PanelMetaSocialPagePostRecord = {
  commentsCount: number | null;
  createdTime: string | null;
  engagedUsers: number | null;
  fullPictureUrl: string | null;
  impressions: number | null;
  message: string | null;
  pageId: string;
  pageName: string;
  permalinkUrl: string | null;
  postId: string;
  reach: number | null;
  reactionsCount: number | null;
  sharesCount: number | null;
  statusType: string | null;
};

export type PanelMetaSocialInstagramMediaRecord = {
  caption: string | null;
  commentsCount: number | null;
  instagramAccountId: string;
  impressions: number | null;
  likeCount: number | null;
  mediaId: string;
  mediaType: string | null;
  mediaUrl: string | null;
  permalink: string | null;
  reach: number | null;
  saved: number | null;
  shares: number | null;
  thumbnailUrl: string | null;
  timestamp: string | null;
  totalInteractions: number | null;
  username: string;
  views: number | null;
};

export type PanelMetaPublishedInstagramMediaRecord = PanelMetaSocialInstagramMediaRecord & {
  creationId: string;
};

export const PANEL_META_SOCIAL_INSIGHT_PERIOD_VALUES = [
  "day",
  "week",
  "days_28",
  "lifetime",
] as const;
export type PanelMetaSocialInsightPeriod =
  (typeof PANEL_META_SOCIAL_INSIGHT_PERIOD_VALUES)[number];

export type PanelMetaSocialInsightValueRecord = {
  displayValue: string | null;
  endTime: string | null;
  numericValue: number | null;
  rawValue: unknown;
};

export type PanelMetaSocialInsightMetricRecord = {
  description: string | null;
  metric: string;
  period: PanelMetaSocialInsightPeriod | null;
  title: string | null;
  values: PanelMetaSocialInsightValueRecord[];
};

export type PanelMetaPageInsightsRecord = {
  endDate: string | null;
  metrics: PanelMetaSocialInsightMetricRecord[];
  pageId: string;
  pageName: string;
  period: PanelMetaSocialInsightPeriod;
  requestedMetrics: string[];
  startDate: string | null;
};

export type PanelMetaInstagramInsightsRecord = {
  endDate: string | null;
  instagramAccountId: string;
  metrics: PanelMetaSocialInsightMetricRecord[];
  pageId: string;
  pageName: string;
  period: PanelMetaSocialInsightPeriod;
  requestedMetrics: string[];
  startDate: string | null;
  username: string;
};

export type PanelMetaInstagramCommentReplyRecord = {
  commentId: string;
  hidden: boolean | null;
  likeCount: number | null;
  mediaId: string | null;
  parentCommentId: string | null;
  text: string | null;
  timestamp: string | null;
  username: string | null;
};

export type PanelMetaInstagramCommentRecord = PanelMetaInstagramCommentReplyRecord & {
  replies: PanelMetaInstagramCommentReplyRecord[];
};

export type PanelMetaInstagramCommentVisibilityRecord = {
  commentId: string;
  hidden: boolean;
};

export type PanelMetaSocialDashboardMetricSummaryRecord = {
  latest: number | null;
  metric: string;
  title: string | null;
  total: number | null;
};

export type PanelMetaSocialDashboardPageContentSummaryRecord = {
  commentsCount: number;
  engagedUsers: number;
  impressions: number;
  postsCount: number;
  reach: number;
  reactionsCount: number;
  sharesCount: number;
};

export type PanelMetaSocialDashboardInstagramContentSummaryRecord = {
  commentsCount: number;
  impressions: number;
  likeCount: number;
  mediaCount: number;
  reach: number;
  saved: number;
  shares: number;
  totalInteractions: number;
  views: number;
};

export type PanelMetaSocialDashboardPageSectionRecord = {
  contentSummary: PanelMetaSocialDashboardPageContentSummaryRecord;
  metrics: PanelMetaSocialInsightMetricRecord[];
  pageId: string;
  pageName: string;
  requestedMetrics: string[];
  summaryMetrics: PanelMetaSocialDashboardMetricSummaryRecord[];
  topPosts: PanelMetaSocialPagePostRecord[];
};

export type PanelMetaSocialDashboardInstagramSectionRecord = {
  contentSummary: PanelMetaSocialDashboardInstagramContentSummaryRecord;
  instagramAccountId: string;
  metrics: PanelMetaSocialInsightMetricRecord[];
  pageId: string;
  pageName: string;
  requestedMetrics: string[];
  summaryMetrics: PanelMetaSocialDashboardMetricSummaryRecord[];
  topMedia: PanelMetaSocialInstagramMediaRecord[];
  username: string;
};

export type PanelMetaSocialDashboardRecord = {
  contentLimit: number;
  endDate: string | null;
  hasData: boolean;
  instagram: PanelMetaSocialDashboardInstagramSectionRecord | null;
  page: PanelMetaSocialDashboardPageSectionRecord | null;
  period: PanelMetaSocialInsightPeriod;
  startDate: string | null;
  topLimit: number;
};

export type PanelMetaSocialDiagnosticLinkCheckRecord = {
  accountId: string | null;
  errorCode: number | null;
  errorMessage: string | null;
  errorSubcode: number | null;
  errorType: string | null;
  field:
    | "connected_instagram_account"
    | "connected_page_backed_instagram_account"
    | "instagram_business_account";
  requestSucceeded: boolean;
  tokenSource: "page_access_token" | "user_access_token";
};

export type PanelMetaSocialDiagnosticPageRecord = {
  category: string | null;
  hasPageAccessToken: boolean;
  instagramBusinessAccountIdFromAccountsList: string | null;
  linkChecks: PanelMetaSocialDiagnosticLinkCheckRecord[];
  name: string;
  pageId: string;
  resolvedBy: string | null;
  resolvedInstagramAccountId: string | null;
  tasks: string[];
};

export type PanelMetaSocialDiagnosticRecord = {
  connectionId: string;
  currentUserId: string | null;
  currentUserName: string | null;
  debugTokenIsValid: boolean;
  debugTokenScopes: string[];
  debugTokenUserId: string | null;
  expiresAt: string | null;
  missingDebugTokenScopes: string[];
  missingStoredScopes: string[];
  pages: PanelMetaSocialDiagnosticPageRecord[];
  requiredScopes: string[];
  storedScopes: string[];
};

export type PanelMetaSocialPagePostsQuery = {
  limit?: number;
  pageId: string;
};

export type PanelMetaCreatePagePostInput = {
  link?: string;
  message?: string;
  pageId: string;
};

export type PanelMetaPageInsightsQuery = {
  endDate?: string;
  metrics?: string[];
  pageId: string;
  period?: PanelMetaSocialInsightPeriod;
  startDate?: string;
};

export type PanelMetaSocialInstagramMediaQuery = {
  instagramAccountId: string;
  limit?: number;
};

export type PanelMetaPublishInstagramMediaInput = {
  caption?: string;
  imageUrl: string;
  instagramAccountId: string;
};

export type PanelMetaInstagramInsightsQuery = {
  endDate?: string;
  instagramAccountId: string;
  metrics?: string[];
  period?: PanelMetaSocialInsightPeriod;
  startDate?: string;
};

export type PanelMetaInstagramCommentsQuery = {
  instagramAccountId: string;
  limit?: number;
  mediaId: string;
};

export type PanelMetaSocialDashboardQuery = {
  contentLimit?: number;
  endDate?: string;
  instagramAccountId?: string;
  metrics?: string[];
  pageId?: string;
  period?: PanelMetaSocialInsightPeriod;
  startDate?: string;
  topLimit?: number;
};

export type PanelMetaReplyInstagramCommentInput = {
  commentId: string;
  instagramAccountId: string;
  message: string;
};

export type PanelMetaUpdateInstagramCommentVisibilityInput = {
  commentId: string;
  hidden: boolean;
  instagramAccountId: string;
};

export type PanelMetaDeleteInstagramCommentQuery = {
  commentId: string;
  instagramAccountId: string;
};

export const PANEL_SOCIAL_MEDIA_INSTAGRAM_SOURCE_ORIGIN_VALUES = [
  "accounts-list",
  "instagram-business-account",
  "page-field",
] as const;
export type PanelSocialMediaInstagramSourceOrigin =
  (typeof PANEL_SOCIAL_MEDIA_INSTAGRAM_SOURCE_ORIGIN_VALUES)[number];

export type PanelMetaSocialInstagramSourceRecord = {
  instagramAccountId: string;
  name: string | null;
  origin: PanelSocialMediaInstagramSourceOrigin;
  pageId: string;
  pageName: string;
  profilePictureUrl: string | null;
  username: string | null;
};

export type PanelMetaSocialMediaAccountRelationRecord = {
  instagramAccountId: string | null;
  linked: boolean;
  pageId: string | null;
};

export type PanelMetaSocialMediaAccountCapabilitiesRecord = {
  hasDashboard: boolean;
  hasInsights: boolean;
  hasMedia: boolean;
  hasReliableAudienceGrowth: boolean;
};

export type PanelMetaSocialMediaAccountPlatformRecord = {
  displayName: string;
  externalId: string;
  hasInsights: boolean;
  hasMedia: boolean;
  imageUrl: string | null;
  platform: PanelSocialMediaPlatform;
  username: string | null;
};

export type PanelMetaSocialMediaAccountRecord = {
  avatarUrl: string | null;
  capabilities: PanelMetaSocialMediaAccountCapabilitiesRecord;
  displayName: string;
  id: string;
  instagramAccountId: string | null;
  instagramUsername: string | null;
  pageId: string | null;
  pageName: string | null;
  platforms: PanelMetaSocialMediaAccountPlatformRecord[];
  relation: PanelMetaSocialMediaAccountRelationRecord;
  type: PanelMetaSocialMediaAccountType;
};

export type PanelMetaSocialMediaMetricTotalsRecord = {
  comments: number;
  engagement: number;
  engagementRate: number | null;
  impressions: number | null;
  likes: number | null;
  reach: number | null;
  saves: number | null;
  shares: number | null;
  views: number | null;
};

export type PanelMetaSocialMediaMetricAvailabilityRecord = {
  comments: boolean;
  engagement: boolean;
  engagementRate: boolean;
  impressions: boolean;
  likes: boolean;
  reach: boolean;
  saves: boolean;
  shares: boolean;
  views: boolean;
};

export type PanelMetaSocialMediaDashboardContentTypeSummaryRecord = {
  averageEngagementRate: number | null;
  contentCount: number;
  contentType: PanelMetaSocialMediaContentType;
  metrics: PanelMetaSocialMediaMetricTotalsRecord;
};

export type PanelMetaSocialMediaClassificationSummaryRecord = {
  aboveAverage: number;
  belowAverage: number;
  unknown: number;
};

export type PanelMetaSocialMediaDashboardOverviewRecord = {
  averagePerformanceValue: number | null;
  classification: PanelMetaSocialMediaClassificationSummaryRecord;
  contentByType: PanelMetaSocialMediaDashboardContentTypeSummaryRecord[];
  contentCount: number;
  medianViews: number | null;
  metricAvailability: PanelMetaSocialMediaMetricAvailabilityRecord;
  metrics: PanelMetaSocialMediaMetricTotalsRecord;
  performanceBenchmark: PanelMetaSocialMediaPerformanceBenchmark | null;
};

export type PanelMetaSocialMediaDashboardSeriesItemRecord = {
  bucketEnd: string;
  bucketStart: string;
  contentCount: number;
  label: string;
  metrics: PanelMetaSocialMediaMetricTotalsRecord;
};

export type PanelMetaSocialMediaDashboardComparisonMetricRecord = {
  current: number | null;
  delta: number | null;
  deltaPercentage: number | null;
  previous: number | null;
};

export type PanelMetaSocialMediaDashboardComparisonRecord = {
  comments: PanelMetaSocialMediaDashboardComparisonMetricRecord;
  contentCount: PanelMetaSocialMediaDashboardComparisonMetricRecord;
  engagement: PanelMetaSocialMediaDashboardComparisonMetricRecord;
  engagementRate: PanelMetaSocialMediaDashboardComparisonMetricRecord;
  impressions: PanelMetaSocialMediaDashboardComparisonMetricRecord;
  likes: PanelMetaSocialMediaDashboardComparisonMetricRecord;
  previousEndDate: string;
  previousStartDate: string;
  reach: PanelMetaSocialMediaDashboardComparisonMetricRecord;
  saves: PanelMetaSocialMediaDashboardComparisonMetricRecord;
  shares: PanelMetaSocialMediaDashboardComparisonMetricRecord;
  views: PanelMetaSocialMediaDashboardComparisonMetricRecord;
};

export type PanelMetaSocialMediaDashboardBestSlotRecord = {
  averagePerformanceValue: number | null;
  contentCount: number;
  key: string;
  label: string;
};

export type PanelMetaSocialMediaDashboardWeeklyPublicationRecord = {
  contentCount: number;
  weekEnd: string;
  weekStart: string;
};

export type PanelMetaSocialMediaDashboardAudienceGrowthRecord = {
  delta: number;
  endValue: number;
  growthRate: number | null;
  source: string;
  startValue: number;
};

export type PanelMetaSocialMediaPerformanceDetailsRecord = {
  average: number | null;
  benchmark: PanelMetaSocialMediaPerformanceBenchmark | null;
  classification: PanelMetaSocialMediaPerformanceClassification;
  value: number | null;
};

export type PanelMetaSocialMediaContentItemRecord = {
  caption: string | null;
  contentType: PanelMetaSocialMediaContentType;
  id: string;
  metrics: PanelMetaSocialMediaMetricTotalsRecord;
  performance: PanelMetaSocialMediaPerformanceDetailsRecord;
  permalink: string | null;
  publishedAt: string | null;
  source: PanelSocialMediaPlatform;
  sourceId: string;
  sourceType: string | null;
  thumbnailUrl: string | null;
};

export type PanelMetaSocialMediaContentListSummaryRecord = {
  averagePerformanceValue: number | null;
  classification: PanelMetaSocialMediaClassificationSummaryRecord;
  performanceBenchmark: PanelMetaSocialMediaPerformanceBenchmark | null;
  totalContents: number;
};

export type PanelMetaSocialMediaPaginationMetaRecord = {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};

export type PanelMetaSocialMediaDashboardRecord = {
  account: PanelMetaSocialMediaAccountRecord;
  audienceGrowth: PanelMetaSocialMediaDashboardAudienceGrowthRecord | null;
  bestDayOfWeek: PanelMetaSocialMediaDashboardBestSlotRecord | null;
  bestHourOfDay: PanelMetaSocialMediaDashboardBestSlotRecord | null;
  comparison: PanelMetaSocialMediaDashboardComparisonRecord;
  endDate: string;
  engagementRateByContentType: PanelMetaSocialMediaDashboardContentTypeSummaryRecord[];
  granularity: PanelMetaSocialMediaGranularity;
  hasData: boolean;
  overview: PanelMetaSocialMediaDashboardOverviewRecord;
  ranking: PanelMetaSocialMediaContentItemRecord[];
  startDate: string;
  timeSeries: PanelMetaSocialMediaDashboardSeriesItemRecord[];
  timezone: string;
  weeklyPublicationVolume: PanelMetaSocialMediaDashboardWeeklyPublicationRecord[];
};

export type PanelMetaSocialMediaContentListRecord = {
  account: PanelMetaSocialMediaAccountRecord;
  contentTypes: PanelMetaSocialMediaContentType[];
  data: PanelMetaSocialMediaContentItemRecord[];
  endDate: string;
  meta: PanelMetaSocialMediaPaginationMetaRecord;
  orderBy: PanelMetaSocialMediaContentOrderBy | null;
  orderDirection: PanelMetaSocialMediaContentOrderDirection | null;
  startDate: string;
  summary: PanelMetaSocialMediaContentListSummaryRecord;
  timezone: string;
};

export type PanelMetaSocialMediaDashboardQuery = {
  accountId: string;
  endDate?: string;
  granularity?: PanelMetaSocialMediaGranularity;
  rankingLimit?: number;
  startDate?: string;
  timezone?: string;
};

export type PanelMetaSocialMediaContentsQuery = {
  accountId: string;
  contentTypes?: PanelMetaSocialMediaContentType[];
  endDate?: string;
  limit?: number;
  orderBy?: PanelMetaSocialMediaContentOrderBy;
  orderDirection?: PanelMetaSocialMediaContentOrderDirection;
  page?: number;
  startDate?: string;
  timezone?: string;
};

type JsonRecord = Record<string, unknown>;

class PanelSocialMediaApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PanelSocialMediaApiError";
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

function resolvePayloadRoot(payload: unknown) {
  if (isRecord(payload) && isRecord(payload.data)) {
    return payload.data;
  }

  return payload;
}

function listPayloadArray(payload: unknown) {
  const root = resolvePayloadRoot(payload);

  if (Array.isArray(root)) {
    return root;
  }

  if (!isRecord(root)) {
    return [];
  }

  const candidateKeys = ["items", "data", "accounts", "results"];
  const matchedKey = candidateKeys.find((key) => Array.isArray(root[key]));

  return matchedKey ? (root[matchedKey] as unknown[]) : [];
}

function normalizeDateTime(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
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

async function requestJson(
  path: string,
  token: string,
  query?: URLSearchParams,
  init?: RequestInit,
) {
  let response: Response;

  try {
    const headers = new Headers(init?.headers);
    headers.set("Accept", "application/json");
    headers.set("Authorization", `Bearer ${token}`);

    if (init?.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    response = await fetch(buildUrl(path, query), {
      ...init,
      headers,
    });
  } catch {
    throw new PanelSocialMediaApiError(
      `Não foi possível conectar com a API em ${PANEL_API_BASE_URL}. Verifique se o backend está ativo.`,
    );
  }

  const payload = await parseJsonSafe(response);

  return {
    payload,
    response,
  };
}

function appendQueryValue(
  params: URLSearchParams,
  key: string,
  value: number | string | undefined | null,
) {
  if (typeof value === "number" && Number.isFinite(value)) {
    params.set(key, String(value));
    return;
  }

  if (typeof value === "string" && value.trim()) {
    params.set(key, value.trim());
  }
}

function appendQueryList(params: URLSearchParams, key: string, values: string[] | undefined) {
  if (!Array.isArray(values)) {
    return;
  }

  const normalizedValues = values
    .map((value) => value.trim())
    .filter(Boolean);

  if (normalizedValues.length === 0) {
    return;
  }

  params.set(key, normalizedValues.join(","));
}

function appendQueryValues(params: URLSearchParams, key: string, values: string[] | undefined) {
  if (!Array.isArray(values)) {
    return;
  }

  values
    .map((value) => value.trim())
    .filter(Boolean)
    .forEach((value) => {
      params.append(key, value);
    });
}

function normalizeEnumValue<T extends string>(value: unknown, values: readonly T[]) {
  const normalizedValue = getFirstString([value]);

  if (!normalizedValue || !values.includes(normalizedValue as T)) {
    return null;
  }

  return normalizedValue as T;
}

function normalizeInsightPeriod(value: unknown): PanelMetaSocialInsightPeriod | null {
  return normalizeEnumValue(value, PANEL_META_SOCIAL_INSIGHT_PERIOD_VALUES);
}

function extractInsightNumericValue(value: unknown): number | null {
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  const directNumber = getFirstNumber([value]);

  if (directNumber !== null) {
    return directNumber;
  }

  if (Array.isArray(value)) {
    const nestedNumbers = value
      .map((item) => extractInsightNumericValue(item))
      .filter((item): item is number => item !== null);

    return nestedNumbers.length > 0
      ? nestedNumbers.reduce((sum, item) => sum + item, 0)
      : null;
  }

  if (!isRecord(value)) {
    return null;
  }

  return getFirstNumber([
    value.value,
    value.count,
    value.total,
    value.amount,
  ]);
}

function stringifyInsightValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function normalizeMetaPageRecord(payload: unknown): PanelMetaSocialPageRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const pageId = getFirstString([payload.pageId]);
  const name = getFirstString([payload.name]);

  if (!pageId || !name) {
    return null;
  }

  return {
    category: getFirstString([payload.category]),
    hasInstagramBusinessAccount: getFirstBoolean([payload.hasInstagramBusinessAccount]) ?? false,
    instagramBusinessAccountId: getFirstString([payload.instagramBusinessAccountId]),
    name,
    pageId,
    pictureUrl: resolveApiAssetUrl(PANEL_API_BASE_URL, getFirstString([payload.pictureUrl])),
  };
}

function normalizeMetaInstagramAccountRecord(
  payload: unknown,
): PanelMetaSocialInstagramAccountRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const instagramAccountId = getFirstString([payload.instagramAccountId]);
  const username = getFirstString([payload.username]);
  const pageId = getFirstString([payload.pageId]);
  const pageName = getFirstString([payload.pageName]);

  if (!instagramAccountId || !username || !pageId || !pageName) {
    return null;
  }

  return {
    instagramAccountId,
    name: getFirstString([payload.name]),
    pageId,
    pageName,
    profilePictureUrl: resolveApiAssetUrl(
      PANEL_API_BASE_URL,
      getFirstString([payload.profilePictureUrl]),
    ),
    username,
  };
}

function normalizeMetaInstagramBusinessAccountRecord(
  payload: unknown,
): PanelMetaInstagramBusinessAccountRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const pageId = getFirstString([payload.pageId]);
  const pageName = getFirstString([payload.pageName]);

  if (!pageId || !pageName) {
    return null;
  }

  return {
    category: getFirstString([payload.category]),
    hasPageAccessToken: getFirstBoolean([payload.hasPageAccessToken]) ?? false,
    instagramBusinessAccountIdFromAccountsList: getFirstString([
      payload.instagramBusinessAccountIdFromAccountsList,
    ]),
    pageId,
    pageName,
    resolvedInstagramBusinessAccountId: getFirstString([payload.resolvedInstagramBusinessAccountId]),
    tasks: extractStringList(payload.tasks),
  };
}

function normalizeMetaPagePostRecord(payload: unknown): PanelMetaSocialPagePostRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const postId = getFirstString([payload.postId]);
  const pageId = getFirstString([payload.pageId]);
  const pageName = getFirstString([payload.pageName]);

  if (!postId || !pageId || !pageName) {
    return null;
  }

  return {
    commentsCount: getFirstNumber([payload.commentsCount]),
    createdTime: normalizeDateTime(payload.createdTime),
    engagedUsers: getFirstNumber([payload.engagedUsers]),
    fullPictureUrl: resolveApiAssetUrl(PANEL_API_BASE_URL, getFirstString([payload.fullPictureUrl])),
    impressions: getFirstNumber([payload.impressions]),
    message: getFirstString([payload.message]),
    pageId,
    pageName,
    permalinkUrl: resolveApiAssetUrl(PANEL_API_BASE_URL, getFirstString([payload.permalinkUrl])),
    postId,
    reach: getFirstNumber([payload.reach]),
    reactionsCount: getFirstNumber([payload.reactionsCount]),
    sharesCount: getFirstNumber([payload.sharesCount]),
    statusType: getFirstString([payload.statusType]),
  };
}

function normalizeMetaInstagramMediaRecord(
  payload: unknown,
): PanelMetaSocialInstagramMediaRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const mediaId = getFirstString([payload.mediaId]);
  const instagramAccountId = getFirstString([payload.instagramAccountId]);
  const username = getFirstString([payload.username]);

  if (!mediaId || !instagramAccountId || !username) {
    return null;
  }

  return {
    caption: getFirstString([payload.caption]),
    commentsCount: getFirstNumber([payload.commentsCount]),
    impressions: getFirstNumber([payload.impressions]),
    instagramAccountId,
    likeCount: getFirstNumber([payload.likeCount]),
    mediaId,
    mediaType: getFirstString([payload.mediaType]),
    mediaUrl: resolveApiAssetUrl(PANEL_API_BASE_URL, getFirstString([payload.mediaUrl])),
    permalink: resolveApiAssetUrl(PANEL_API_BASE_URL, getFirstString([payload.permalink])),
    reach: getFirstNumber([payload.reach]),
    saved: getFirstNumber([payload.saved]),
    shares: getFirstNumber([payload.shares]),
    thumbnailUrl: resolveApiAssetUrl(PANEL_API_BASE_URL, getFirstString([payload.thumbnailUrl])),
    timestamp: normalizeDateTime(payload.timestamp),
    totalInteractions: getFirstNumber([payload.totalInteractions]),
    username,
    views: getFirstNumber([payload.views]),
  };
}

function normalizeMetaPublishedInstagramMediaRecord(
  payload: unknown,
): PanelMetaPublishedInstagramMediaRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const creationId = getFirstString([payload.creationId]);
  const mediaRecord = normalizeMetaInstagramMediaRecord(payload);

  if (!creationId || !mediaRecord) {
    return null;
  }

  return {
    ...mediaRecord,
    creationId,
  };
}

function normalizeMetaInstagramCommentReplyRecord(
  payload: unknown,
): PanelMetaInstagramCommentReplyRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const commentId = getFirstString([payload.commentId]);

  if (!commentId) {
    return null;
  }

  return {
    commentId,
    hidden: getFirstBoolean([payload.hidden]),
    likeCount: getFirstNumber([payload.likeCount]),
    mediaId: getFirstString([payload.mediaId]),
    parentCommentId: getFirstString([payload.parentCommentId]),
    text: getFirstString([payload.text]),
    timestamp: normalizeDateTime(payload.timestamp),
    username: getFirstString([payload.username]),
  };
}

function normalizeMetaInstagramCommentRecord(
  payload: unknown,
): PanelMetaInstagramCommentRecord | null {
  const baseRecord = normalizeMetaInstagramCommentReplyRecord(payload);

  if (!baseRecord || !isRecord(payload)) {
    return null;
  }

  return {
    ...baseRecord,
    replies: Array.isArray(payload.replies)
      ? payload.replies
          .map((item) => normalizeMetaInstagramCommentReplyRecord(item))
          .filter((item): item is PanelMetaInstagramCommentReplyRecord => item !== null)
      : [],
  };
}

function normalizeMetaInstagramCommentVisibilityRecord(
  payload: unknown,
): PanelMetaInstagramCommentVisibilityRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const commentId = getFirstString([payload.commentId]);
  const hidden = getFirstBoolean([payload.hidden]);

  if (!commentId || hidden === null) {
    return null;
  }

  return {
    commentId,
    hidden,
  };
}

function normalizeInsightValueRecord(payload: unknown): PanelMetaSocialInsightValueRecord | null {
  if (!isRecord(payload) || !("value" in payload)) {
    return null;
  }

  const rawValue = payload.value ?? null;

  return {
    displayValue: stringifyInsightValue(rawValue),
    endTime: normalizeDateTime(payload.endTime),
    numericValue: extractInsightNumericValue(rawValue),
    rawValue,
  };
}

function normalizeInsightMetricRecord(payload: unknown): PanelMetaSocialInsightMetricRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const metric = getFirstString([payload.metric]);

  if (!metric) {
    return null;
  }

  const values = Array.isArray(payload.values)
    ? payload.values
        .map((item) => normalizeInsightValueRecord(item))
        .filter((item): item is PanelMetaSocialInsightValueRecord => item !== null)
    : [];

  return {
    description: getFirstString([payload.description]),
    metric,
    period: normalizeInsightPeriod(payload.period),
    title: getFirstString([payload.title]),
    values,
  };
}

function normalizePageInsightsRecord(payload: unknown): PanelMetaPageInsightsRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const pageId = getFirstString([payload.pageId]);
  const pageName = getFirstString([payload.pageName]);
  const period = normalizeInsightPeriod(payload.period);

  if (!pageId || !pageName || !period) {
    return null;
  }

  return {
    endDate: getFirstString([payload.endDate]),
    metrics: Array.isArray(payload.metrics)
      ? payload.metrics
          .map((item) => normalizeInsightMetricRecord(item))
          .filter((item): item is PanelMetaSocialInsightMetricRecord => item !== null)
      : [],
    pageId,
    pageName,
    period,
    requestedMetrics: extractStringList(payload.requestedMetrics),
    startDate: getFirstString([payload.startDate]),
  };
}

function normalizeInstagramInsightsRecord(
  payload: unknown,
): PanelMetaInstagramInsightsRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const instagramAccountId = getFirstString([payload.instagramAccountId]);
  const username = getFirstString([payload.username]);
  const pageId = getFirstString([payload.pageId]);
  const pageName = getFirstString([payload.pageName]);
  const period = normalizeInsightPeriod(payload.period);

  if (!instagramAccountId || !username || !pageId || !pageName || !period) {
    return null;
  }

  return {
    endDate: getFirstString([payload.endDate]),
    instagramAccountId,
    metrics: Array.isArray(payload.metrics)
      ? payload.metrics
          .map((item) => normalizeInsightMetricRecord(item))
          .filter((item): item is PanelMetaSocialInsightMetricRecord => item !== null)
      : [],
    pageId,
    pageName,
    period,
    requestedMetrics: extractStringList(payload.requestedMetrics),
    startDate: getFirstString([payload.startDate]),
    username,
  };
}

function normalizeDashboardMetricSummaryRecord(
  payload: unknown,
): PanelMetaSocialDashboardMetricSummaryRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const metric = getFirstString([payload.metric]);

  if (!metric) {
    return null;
  }

  return {
    latest: getFirstNumber([payload.latest]),
    metric,
    title: getFirstString([payload.title]),
    total: getFirstNumber([payload.total]),
  };
}

function normalizeDashboardPageContentSummaryRecord(
  payload: unknown,
): PanelMetaSocialDashboardPageContentSummaryRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  return {
    commentsCount: getFirstNumber([payload.commentsCount]) ?? 0,
    engagedUsers: getFirstNumber([payload.engagedUsers]) ?? 0,
    impressions: getFirstNumber([payload.impressions]) ?? 0,
    postsCount: getFirstNumber([payload.postsCount]) ?? 0,
    reach: getFirstNumber([payload.reach]) ?? 0,
    reactionsCount: getFirstNumber([payload.reactionsCount]) ?? 0,
    sharesCount: getFirstNumber([payload.sharesCount]) ?? 0,
  };
}

function normalizeDashboardInstagramContentSummaryRecord(
  payload: unknown,
): PanelMetaSocialDashboardInstagramContentSummaryRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  return {
    commentsCount: getFirstNumber([payload.commentsCount]) ?? 0,
    impressions: getFirstNumber([payload.impressions]) ?? 0,
    likeCount: getFirstNumber([payload.likeCount]) ?? 0,
    mediaCount: getFirstNumber([payload.mediaCount]) ?? 0,
    reach: getFirstNumber([payload.reach]) ?? 0,
    saved: getFirstNumber([payload.saved]) ?? 0,
    shares: getFirstNumber([payload.shares]) ?? 0,
    totalInteractions: getFirstNumber([payload.totalInteractions]) ?? 0,
    views: getFirstNumber([payload.views]) ?? 0,
  };
}

function normalizeDashboardPageSectionRecord(
  payload: unknown,
): PanelMetaSocialDashboardPageSectionRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const pageId = getFirstString([payload.pageId]);
  const pageName = getFirstString([payload.pageName]);
  const contentSummary = normalizeDashboardPageContentSummaryRecord(payload.contentSummary);

  if (!pageId || !pageName || !contentSummary) {
    return null;
  }

  return {
    contentSummary,
    metrics: Array.isArray(payload.metrics)
      ? payload.metrics
          .map((item) => normalizeInsightMetricRecord(item))
          .filter((item): item is PanelMetaSocialInsightMetricRecord => item !== null)
      : [],
    pageId,
    pageName,
    requestedMetrics: extractStringList(payload.requestedMetrics),
    summaryMetrics: Array.isArray(payload.summaryMetrics)
      ? payload.summaryMetrics
          .map((item) => normalizeDashboardMetricSummaryRecord(item))
          .filter((item): item is PanelMetaSocialDashboardMetricSummaryRecord => item !== null)
      : [],
    topPosts: Array.isArray(payload.topPosts)
      ? payload.topPosts
          .map((item) => normalizeMetaPagePostRecord(item))
          .filter((item): item is PanelMetaSocialPagePostRecord => item !== null)
      : [],
  };
}

function normalizeDashboardInstagramSectionRecord(
  payload: unknown,
): PanelMetaSocialDashboardInstagramSectionRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const instagramAccountId = getFirstString([payload.instagramAccountId]);
  const username = getFirstString([payload.username]);
  const pageId = getFirstString([payload.pageId]);
  const pageName = getFirstString([payload.pageName]);
  const contentSummary = normalizeDashboardInstagramContentSummaryRecord(payload.contentSummary);

  if (!instagramAccountId || !username || !pageId || !pageName || !contentSummary) {
    return null;
  }

  return {
    contentSummary,
    instagramAccountId,
    metrics: Array.isArray(payload.metrics)
      ? payload.metrics
          .map((item) => normalizeInsightMetricRecord(item))
          .filter((item): item is PanelMetaSocialInsightMetricRecord => item !== null)
      : [],
    pageId,
    pageName,
    requestedMetrics: extractStringList(payload.requestedMetrics),
    summaryMetrics: Array.isArray(payload.summaryMetrics)
      ? payload.summaryMetrics
          .map((item) => normalizeDashboardMetricSummaryRecord(item))
          .filter((item): item is PanelMetaSocialDashboardMetricSummaryRecord => item !== null)
      : [],
    topMedia: Array.isArray(payload.topMedia)
      ? payload.topMedia
          .map((item) => normalizeMetaInstagramMediaRecord(item))
          .filter((item): item is PanelMetaSocialInstagramMediaRecord => item !== null)
      : [],
    username,
  };
}

function normalizeSocialDashboardRecord(payload: unknown): PanelMetaSocialDashboardRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const period = normalizeInsightPeriod(payload.period);
  const contentLimit = getFirstNumber([payload.contentLimit]);
  const topLimit = getFirstNumber([payload.topLimit]);
  const hasData = getFirstBoolean([payload.hasData]);

  if (!period || contentLimit === null || topLimit === null || hasData === null) {
    return null;
  }

  return {
    contentLimit,
    endDate: getFirstString([payload.endDate]),
    hasData,
    instagram: payload.instagram === null ? null : normalizeDashboardInstagramSectionRecord(payload.instagram),
    page: payload.page === null ? null : normalizeDashboardPageSectionRecord(payload.page),
    period,
    startDate: getFirstString([payload.startDate]),
    topLimit,
  };
}

function normalizeSocialDiagnosticLinkCheckRecord(
  payload: unknown,
): PanelMetaSocialDiagnosticLinkCheckRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const field = getFirstString([payload.field]);
  const tokenSource = getFirstString([payload.tokenSource]);
  const requestSucceeded = getFirstBoolean([payload.requestSucceeded]);

  if (
    !field ||
    !tokenSource ||
    requestSucceeded === null ||
    ![
      "connected_instagram_account",
      "connected_page_backed_instagram_account",
      "instagram_business_account",
    ].includes(field) ||
    !["page_access_token", "user_access_token"].includes(tokenSource)
  ) {
    return null;
  }

  return {
    accountId: getFirstString([payload.accountId]),
    errorCode: getFirstNumber([payload.errorCode]),
    errorMessage: getFirstString([payload.errorMessage]),
    errorSubcode: getFirstNumber([payload.errorSubcode]),
    errorType: getFirstString([payload.errorType]),
    field: field as PanelMetaSocialDiagnosticLinkCheckRecord["field"],
    requestSucceeded,
    tokenSource: tokenSource as PanelMetaSocialDiagnosticLinkCheckRecord["tokenSource"],
  };
}

function normalizeSocialDiagnosticPageRecord(
  payload: unknown,
): PanelMetaSocialDiagnosticPageRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const pageId = getFirstString([payload.pageId]);
  const name = getFirstString([payload.name]);

  if (!pageId || !name) {
    return null;
  }

  return {
    category: getFirstString([payload.category]),
    hasPageAccessToken: getFirstBoolean([payload.hasPageAccessToken]) ?? false,
    instagramBusinessAccountIdFromAccountsList: getFirstString([
      payload.instagramBusinessAccountIdFromAccountsList,
    ]),
    linkChecks: Array.isArray(payload.linkChecks)
      ? payload.linkChecks
          .map((item) => normalizeSocialDiagnosticLinkCheckRecord(item))
          .filter((item): item is PanelMetaSocialDiagnosticLinkCheckRecord => item !== null)
      : [],
    name,
    pageId,
    resolvedBy: getFirstString([payload.resolvedBy]),
    resolvedInstagramAccountId: getFirstString([payload.resolvedInstagramAccountId]),
    tasks: extractStringList(payload.tasks),
  };
}

function normalizeSocialDiagnosticRecord(
  payload: unknown,
): PanelMetaSocialDiagnosticRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const connectionId = getFirstString([payload.connectionId]);
  const debugTokenIsValid = getFirstBoolean([payload.debugTokenIsValid]);

  if (!connectionId || debugTokenIsValid === null) {
    return null;
  }

  return {
    connectionId,
    currentUserId: getFirstString([payload.currentUserId]),
    currentUserName: getFirstString([payload.currentUserName]),
    debugTokenIsValid,
    debugTokenScopes: extractStringList(payload.debugTokenScopes),
    debugTokenUserId: getFirstString([payload.debugTokenUserId]),
    expiresAt: normalizeDateTime(payload.expiresAt),
    missingDebugTokenScopes: extractStringList(payload.missingDebugTokenScopes),
    missingStoredScopes: extractStringList(payload.missingStoredScopes),
    pages: Array.isArray(payload.pages)
      ? payload.pages
          .map((item) => normalizeSocialDiagnosticPageRecord(item))
          .filter((item): item is PanelMetaSocialDiagnosticPageRecord => item !== null)
      : [],
    requiredScopes: extractStringList(payload.requiredScopes),
    storedScopes: extractStringList(payload.storedScopes),
  };
}

function normalizeMetaSocialMediaAccountType(
  value: unknown,
): PanelMetaSocialMediaAccountType | null {
  return normalizeEnumValue(value, PANEL_META_SOCIAL_MEDIA_ACCOUNT_TYPE_VALUES);
}

function normalizeMetaSocialMediaContentType(
  value: unknown,
): PanelMetaSocialMediaContentType | null {
  return normalizeEnumValue(value, PANEL_META_SOCIAL_MEDIA_CONTENT_TYPE_VALUES);
}

function normalizeMetaSocialMediaGranularity(
  value: unknown,
): PanelMetaSocialMediaGranularity | null {
  return normalizeEnumValue(value, PANEL_META_SOCIAL_MEDIA_GRANULARITY_VALUES);
}

function normalizeMetaSocialMediaContentOrderBy(
  value: unknown,
): PanelMetaSocialMediaContentOrderBy | null {
  return normalizeEnumValue(value, PANEL_META_SOCIAL_MEDIA_CONTENT_ORDER_BY_VALUES);
}

function normalizeMetaSocialMediaContentOrderDirection(
  value: unknown,
): PanelMetaSocialMediaContentOrderDirection | null {
  return normalizeEnumValue(value, PANEL_META_SOCIAL_MEDIA_CONTENT_ORDER_DIRECTION_VALUES);
}

function normalizeMetaSocialMediaPerformanceBenchmark(
  value: unknown,
): PanelMetaSocialMediaPerformanceBenchmark | null {
  return normalizeEnumValue(value, PANEL_META_SOCIAL_MEDIA_PERFORMANCE_BENCHMARK_VALUES);
}

function normalizeMetaSocialMediaPerformanceClassification(
  value: unknown,
): PanelMetaSocialMediaPerformanceClassification {
  return (
    normalizeEnumValue(value, PANEL_META_SOCIAL_MEDIA_PERFORMANCE_CLASSIFICATION_VALUES) ??
    "unknown"
  );
}

function createEmptyMetaSocialMediaMetricTotalsRecord(): PanelMetaSocialMediaMetricTotalsRecord {
  return {
    comments: 0,
    engagement: 0,
    engagementRate: null,
    impressions: null,
    likes: null,
    reach: null,
    saves: null,
    shares: null,
    views: null,
  };
}

function createEmptyMetaSocialMediaMetricAvailabilityRecord(): PanelMetaSocialMediaMetricAvailabilityRecord {
  return {
    comments: false,
    engagement: false,
    engagementRate: false,
    impressions: false,
    likes: false,
    reach: false,
    saves: false,
    shares: false,
    views: false,
  };
}

function createEmptyMetaSocialMediaClassificationSummaryRecord(): PanelMetaSocialMediaClassificationSummaryRecord {
  return {
    aboveAverage: 0,
    belowAverage: 0,
    unknown: 0,
  };
}

function createEmptyMetaSocialMediaDashboardComparisonMetricRecord(): PanelMetaSocialMediaDashboardComparisonMetricRecord {
  return {
    current: null,
    delta: null,
    deltaPercentage: null,
    previous: null,
  };
}

function createEmptyMetaSocialMediaDashboardComparisonRecord(): PanelMetaSocialMediaDashboardComparisonRecord {
  return {
    comments: createEmptyMetaSocialMediaDashboardComparisonMetricRecord(),
    contentCount: createEmptyMetaSocialMediaDashboardComparisonMetricRecord(),
    engagement: createEmptyMetaSocialMediaDashboardComparisonMetricRecord(),
    engagementRate: createEmptyMetaSocialMediaDashboardComparisonMetricRecord(),
    impressions: createEmptyMetaSocialMediaDashboardComparisonMetricRecord(),
    likes: createEmptyMetaSocialMediaDashboardComparisonMetricRecord(),
    previousEndDate: "",
    previousStartDate: "",
    reach: createEmptyMetaSocialMediaDashboardComparisonMetricRecord(),
    saves: createEmptyMetaSocialMediaDashboardComparisonMetricRecord(),
    shares: createEmptyMetaSocialMediaDashboardComparisonMetricRecord(),
    views: createEmptyMetaSocialMediaDashboardComparisonMetricRecord(),
  };
}

function normalizeMetaSocialMediaAccountRelationRecord(
  payload: unknown,
): PanelMetaSocialMediaAccountRelationRecord {
  if (!isRecord(payload)) {
    return {
      instagramAccountId: null,
      linked: false,
      pageId: null,
    };
  }

  return {
    instagramAccountId: getFirstString([payload.instagramAccountId]),
    linked: getFirstBoolean([payload.linked]) ?? false,
    pageId: getFirstString([payload.pageId]),
  };
}

function normalizeMetaSocialMediaAccountCapabilitiesRecord(
  payload: unknown,
): PanelMetaSocialMediaAccountCapabilitiesRecord {
  if (!isRecord(payload)) {
    return {
      hasDashboard: false,
      hasInsights: false,
      hasMedia: false,
      hasReliableAudienceGrowth: false,
    };
  }

  return {
    hasDashboard: getFirstBoolean([payload.hasDashboard]) ?? false,
    hasInsights: getFirstBoolean([payload.hasInsights]) ?? false,
    hasMedia: getFirstBoolean([payload.hasMedia]) ?? false,
    hasReliableAudienceGrowth: getFirstBoolean([payload.hasReliableAudienceGrowth]) ?? false,
  };
}

function normalizeMetaSocialMediaAccountPlatformRecord(
  payload: unknown,
): PanelMetaSocialMediaAccountPlatformRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const platform = normalizeEnumValue(payload.platform, PANEL_SOCIAL_MEDIA_PLATFORM_VALUES);
  const externalId = getFirstString([payload.externalId]);
  const displayName = getFirstString([
    payload.displayName,
    payload.name,
    payload.pageName,
    payload.username,
    externalId,
  ]);

  if (!platform || !externalId || !displayName) {
    return null;
  }

  return {
    displayName,
    externalId,
    hasInsights: getFirstBoolean([payload.hasInsights]) ?? false,
    hasMedia: getFirstBoolean([payload.hasMedia]) ?? false,
    imageUrl: resolveApiAssetUrl(PANEL_API_BASE_URL, getFirstString([payload.imageUrl])),
    platform,
    username: getFirstString([payload.username]),
  };
}

function inferMetaSocialMediaAccountType(input: {
  instagramAccountId: string | null;
  pageId: string | null;
  platforms: PanelMetaSocialMediaAccountPlatformRecord[];
}) {
  const { instagramAccountId, pageId, platforms } = input;
  const hasFacebookPlatform = platforms.some((item) => item.platform === "facebook");
  const hasInstagramPlatform = platforms.some((item) => item.platform === "instagram");

  if ((pageId && instagramAccountId) || (hasFacebookPlatform && hasInstagramPlatform)) {
    return "both" satisfies PanelMetaSocialMediaAccountType;
  }

  if (instagramAccountId || hasInstagramPlatform) {
    return "instagram" satisfies PanelMetaSocialMediaAccountType;
  }

  if (pageId || hasFacebookPlatform) {
    return "facebook" satisfies PanelMetaSocialMediaAccountType;
  }

  return null;
}

function normalizeMetaSocialMediaAccountRecord(
  payload: unknown,
): PanelMetaSocialMediaAccountRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const relation = normalizeMetaSocialMediaAccountRelationRecord(payload.relation);
  const platforms = Array.isArray(payload.platforms)
    ? payload.platforms
        .map((item) => normalizeMetaSocialMediaAccountPlatformRecord(item))
        .filter((item): item is PanelMetaSocialMediaAccountPlatformRecord => item !== null)
    : [];
  const pageId = getFirstString([payload.pageId, relation.pageId]);
  const instagramAccountId = getFirstString([
    payload.instagramAccountId,
    relation.instagramAccountId,
  ]);
  const id = getFirstString([payload.id, payload.accountId, pageId, instagramAccountId]);
  const type =
    normalizeMetaSocialMediaAccountType(payload.type) ??
    inferMetaSocialMediaAccountType({
      instagramAccountId,
      pageId,
      platforms,
    });
  const displayName = getFirstString([
    payload.displayName,
    payload.pageName,
    payload.name,
    payload.instagramUsername,
    payload.username,
    platforms[0]?.displayName,
    id,
  ]);

  if (!id || !type || !displayName) {
    return null;
  }

  return {
    avatarUrl: resolveApiAssetUrl(PANEL_API_BASE_URL, getFirstString([payload.avatarUrl])),
    capabilities: normalizeMetaSocialMediaAccountCapabilitiesRecord(payload.capabilities),
    displayName,
    id,
    instagramAccountId,
    instagramUsername: getFirstString([payload.instagramUsername]),
    pageId,
    pageName: getFirstString([payload.pageName]),
    platforms,
    relation,
    type,
  };
}

function normalizeMetaSocialMediaMetricTotalsRecord(
  payload: unknown,
): PanelMetaSocialMediaMetricTotalsRecord {
  if (!isRecord(payload)) {
    return createEmptyMetaSocialMediaMetricTotalsRecord();
  }

  return {
    comments: getFirstNumber([payload.comments]) ?? 0,
    engagement: getFirstNumber([payload.engagement]) ?? 0,
    engagementRate: getFirstNumber([payload.engagementRate]),
    impressions: getFirstNumber([payload.impressions]),
    likes: getFirstNumber([payload.likes]),
    reach: getFirstNumber([payload.reach]),
    saves: getFirstNumber([payload.saves]),
    shares: getFirstNumber([payload.shares]),
    views: getFirstNumber([payload.views]),
  };
}

function normalizeMetaSocialMediaMetricAvailabilityRecord(
  payload: unknown,
): PanelMetaSocialMediaMetricAvailabilityRecord {
  if (!isRecord(payload)) {
    return createEmptyMetaSocialMediaMetricAvailabilityRecord();
  }

  return {
    comments: getFirstBoolean([payload.comments]) ?? false,
    engagement: getFirstBoolean([payload.engagement]) ?? false,
    engagementRate: getFirstBoolean([payload.engagementRate]) ?? false,
    impressions: getFirstBoolean([payload.impressions]) ?? false,
    likes: getFirstBoolean([payload.likes]) ?? false,
    reach: getFirstBoolean([payload.reach]) ?? false,
    saves: getFirstBoolean([payload.saves]) ?? false,
    shares: getFirstBoolean([payload.shares]) ?? false,
    views: getFirstBoolean([payload.views]) ?? false,
  };
}

function normalizeMetaSocialMediaClassificationSummaryRecord(
  payload: unknown,
): PanelMetaSocialMediaClassificationSummaryRecord {
  if (!isRecord(payload)) {
    return createEmptyMetaSocialMediaClassificationSummaryRecord();
  }

  return {
    aboveAverage: getFirstNumber([payload.aboveAverage]) ?? 0,
    belowAverage: getFirstNumber([payload.belowAverage]) ?? 0,
    unknown: getFirstNumber([payload.unknown]) ?? 0,
  };
}

function normalizeMetaSocialMediaDashboardContentTypeSummaryRecord(
  payload: unknown,
): PanelMetaSocialMediaDashboardContentTypeSummaryRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const contentType = normalizeMetaSocialMediaContentType(payload.contentType);

  if (!contentType) {
    return null;
  }

  return {
    averageEngagementRate: getFirstNumber([payload.averageEngagementRate]),
    contentCount: getFirstNumber([payload.contentCount]) ?? 0,
    contentType,
    metrics: normalizeMetaSocialMediaMetricTotalsRecord(payload.metrics),
  };
}

function normalizeMetaSocialMediaDashboardOverviewRecord(
  payload: unknown,
): PanelMetaSocialMediaDashboardOverviewRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  return {
    averagePerformanceValue: getFirstNumber([payload.averagePerformanceValue]),
    classification: normalizeMetaSocialMediaClassificationSummaryRecord(payload.classification),
    contentByType: Array.isArray(payload.contentByType)
      ? payload.contentByType
          .map((item) => normalizeMetaSocialMediaDashboardContentTypeSummaryRecord(item))
          .filter(
            (item): item is PanelMetaSocialMediaDashboardContentTypeSummaryRecord => item !== null,
          )
      : [],
    contentCount: getFirstNumber([payload.contentCount]) ?? 0,
    medianViews: getFirstNumber([payload.medianViews]),
    metricAvailability: normalizeMetaSocialMediaMetricAvailabilityRecord(
      payload.metricAvailability,
    ),
    metrics: normalizeMetaSocialMediaMetricTotalsRecord(payload.metrics),
    performanceBenchmark: normalizeMetaSocialMediaPerformanceBenchmark(
      payload.performanceBenchmark,
    ),
  };
}

function normalizeMetaSocialMediaDashboardSeriesItemRecord(
  payload: unknown,
): PanelMetaSocialMediaDashboardSeriesItemRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const bucketStart = getFirstString([payload.bucketStart]);
  const bucketEnd = getFirstString([payload.bucketEnd]);
  const label = getFirstString([payload.label]);

  if (!bucketStart || !bucketEnd || !label) {
    return null;
  }

  return {
    bucketEnd,
    bucketStart,
    contentCount: getFirstNumber([payload.contentCount]) ?? 0,
    label,
    metrics: normalizeMetaSocialMediaMetricTotalsRecord(payload.metrics),
  };
}

function normalizeMetaSocialMediaDashboardComparisonMetricRecord(
  payload: unknown,
): PanelMetaSocialMediaDashboardComparisonMetricRecord {
  if (!isRecord(payload)) {
    return createEmptyMetaSocialMediaDashboardComparisonMetricRecord();
  }

  return {
    current: getFirstNumber([payload.current]),
    delta: getFirstNumber([payload.delta]),
    deltaPercentage: getFirstNumber([payload.deltaPercentage]),
    previous: getFirstNumber([payload.previous]),
  };
}

function normalizeMetaSocialMediaDashboardComparisonRecord(
  payload: unknown,
): PanelMetaSocialMediaDashboardComparisonRecord {
  if (!isRecord(payload)) {
    return createEmptyMetaSocialMediaDashboardComparisonRecord();
  }

  const previousStartDate = getFirstString([payload.previousStartDate]);
  const previousEndDate = getFirstString([payload.previousEndDate]);

  return {
    comments: normalizeMetaSocialMediaDashboardComparisonMetricRecord(payload.comments),
    contentCount: normalizeMetaSocialMediaDashboardComparisonMetricRecord(payload.contentCount),
    engagement: normalizeMetaSocialMediaDashboardComparisonMetricRecord(payload.engagement),
    engagementRate: normalizeMetaSocialMediaDashboardComparisonMetricRecord(
      payload.engagementRate,
    ),
    impressions: normalizeMetaSocialMediaDashboardComparisonMetricRecord(payload.impressions),
    likes: normalizeMetaSocialMediaDashboardComparisonMetricRecord(payload.likes),
    previousEndDate: previousEndDate ?? "",
    previousStartDate: previousStartDate ?? "",
    reach: normalizeMetaSocialMediaDashboardComparisonMetricRecord(payload.reach),
    saves: normalizeMetaSocialMediaDashboardComparisonMetricRecord(payload.saves),
    shares: normalizeMetaSocialMediaDashboardComparisonMetricRecord(payload.shares),
    views: normalizeMetaSocialMediaDashboardComparisonMetricRecord(payload.views),
  };
}

function normalizeMetaSocialMediaDashboardBestSlotRecord(
  payload: unknown,
): PanelMetaSocialMediaDashboardBestSlotRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const label = getFirstString([payload.label]);
  const key = getFirstString([payload.key]);

  if (!label || !key) {
    return null;
  }

  return {
    averagePerformanceValue: getFirstNumber([payload.averagePerformanceValue]),
    contentCount: getFirstNumber([payload.contentCount]) ?? 0,
    key,
    label,
  };
}

function normalizeMetaSocialMediaDashboardWeeklyPublicationRecord(
  payload: unknown,
): PanelMetaSocialMediaDashboardWeeklyPublicationRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const weekStart = getFirstString([payload.weekStart]);
  const weekEnd = getFirstString([payload.weekEnd]);

  if (!weekStart || !weekEnd) {
    return null;
  }

  return {
    contentCount: getFirstNumber([payload.contentCount]) ?? 0,
    weekEnd,
    weekStart,
  };
}

function normalizeMetaSocialMediaDashboardAudienceGrowthRecord(
  payload: unknown,
): PanelMetaSocialMediaDashboardAudienceGrowthRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const source = getFirstString([payload.source]);
  const startValue = getFirstNumber([payload.startValue]);
  const endValue = getFirstNumber([payload.endValue]);
  const delta = getFirstNumber([payload.delta]);

  if (!source || startValue === null || endValue === null || delta === null) {
    return null;
  }

  return {
    delta,
    endValue,
    growthRate: getFirstNumber([payload.growthRate]),
    source,
    startValue,
  };
}

function normalizeMetaSocialMediaPerformanceDetailsRecord(
  payload: unknown,
): PanelMetaSocialMediaPerformanceDetailsRecord {
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
    benchmark: normalizeMetaSocialMediaPerformanceBenchmark(payload.benchmark),
    classification: normalizeMetaSocialMediaPerformanceClassification(payload.classification),
    value: getFirstNumber([payload.value]),
  };
}

function normalizeMetaSocialMediaContentItemRecord(
  payload: unknown,
): PanelMetaSocialMediaContentItemRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id]);
  const source = normalizeEnumValue(payload.source, PANEL_SOCIAL_MEDIA_PLATFORM_VALUES);
  const sourceId = getFirstString([payload.sourceId]);
  const contentType = normalizeMetaSocialMediaContentType(payload.contentType);

  if (!id || !source || !sourceId || !contentType) {
    return null;
  }

  return {
    caption: getFirstString([payload.caption]),
    contentType,
    id,
    metrics: normalizeMetaSocialMediaMetricTotalsRecord(payload.metrics),
    performance: normalizeMetaSocialMediaPerformanceDetailsRecord(payload.performance),
    permalink: resolveApiAssetUrl(PANEL_API_BASE_URL, getFirstString([payload.permalink])),
    publishedAt: normalizeDateTime(payload.publishedAt),
    source,
    sourceId,
    sourceType: getFirstString([payload.sourceType]),
    thumbnailUrl: resolveApiAssetUrl(PANEL_API_BASE_URL, getFirstString([payload.thumbnailUrl])),
  };
}

function normalizeMetaSocialMediaContentListSummaryRecord(
  payload: unknown,
): PanelMetaSocialMediaContentListSummaryRecord {
  if (!isRecord(payload)) {
    return {
      averagePerformanceValue: null,
      classification: createEmptyMetaSocialMediaClassificationSummaryRecord(),
      performanceBenchmark: null,
      totalContents: 0,
    };
  }

  return {
    averagePerformanceValue: getFirstNumber([payload.averagePerformanceValue]),
    classification: normalizeMetaSocialMediaClassificationSummaryRecord(payload.classification),
    performanceBenchmark: normalizeMetaSocialMediaPerformanceBenchmark(
      payload.performanceBenchmark,
    ),
    totalContents: getFirstNumber([payload.totalContents]) ?? 0,
  };
}

function normalizeMetaSocialMediaPaginationMetaRecord(
  payload: unknown,
): PanelMetaSocialMediaPaginationMetaRecord {
  if (!isRecord(payload)) {
    return {
      limit: 20,
      page: 1,
      total: 0,
      totalPages: 0,
    };
  }

  return {
    limit: getFirstNumber([payload.limit]) ?? 20,
    page: getFirstNumber([payload.page]) ?? 1,
    total: getFirstNumber([payload.total]) ?? 0,
    totalPages: getFirstNumber([payload.totalPages]) ?? 0,
  };
}

function normalizeMetaSocialMediaDashboardRecord(
  payload: unknown,
): PanelMetaSocialMediaDashboardRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const account = normalizeMetaSocialMediaAccountRecord(payload.account);
  const startDate = getFirstString([payload.startDate]);
  const endDate = getFirstString([payload.endDate]);
  const timezone = getFirstString([payload.timezone]);
  const granularity = normalizeMetaSocialMediaGranularity(payload.granularity);
  const overview = normalizeMetaSocialMediaDashboardOverviewRecord(payload.overview);
  const comparison = normalizeMetaSocialMediaDashboardComparisonRecord(payload.comparison);
  const hasData = getFirstBoolean([payload.hasData]);

  if (
    !account ||
    !startDate ||
    !endDate ||
    !timezone ||
    !granularity ||
    !overview ||
    !comparison ||
    hasData === null
  ) {
    return null;
  }

  return {
    account,
    audienceGrowth:
      payload.audienceGrowth === null
        ? null
        : normalizeMetaSocialMediaDashboardAudienceGrowthRecord(payload.audienceGrowth),
    bestDayOfWeek:
      payload.bestDayOfWeek === null
        ? null
        : normalizeMetaSocialMediaDashboardBestSlotRecord(payload.bestDayOfWeek),
    bestHourOfDay:
      payload.bestHourOfDay === null
        ? null
        : normalizeMetaSocialMediaDashboardBestSlotRecord(payload.bestHourOfDay),
    comparison,
    endDate,
    engagementRateByContentType: Array.isArray(payload.engagementRateByContentType)
      ? payload.engagementRateByContentType
          .map((item) => normalizeMetaSocialMediaDashboardContentTypeSummaryRecord(item))
          .filter(
            (item): item is PanelMetaSocialMediaDashboardContentTypeSummaryRecord => item !== null,
          )
      : [],
    granularity,
    hasData,
    overview,
    ranking: Array.isArray(payload.ranking)
      ? payload.ranking
          .map((item) => normalizeMetaSocialMediaContentItemRecord(item))
          .filter((item): item is PanelMetaSocialMediaContentItemRecord => item !== null)
      : [],
    startDate,
    timeSeries: Array.isArray(payload.timeSeries)
      ? payload.timeSeries
          .map((item) => normalizeMetaSocialMediaDashboardSeriesItemRecord(item))
          .filter((item): item is PanelMetaSocialMediaDashboardSeriesItemRecord => item !== null)
      : [],
    timezone,
    weeklyPublicationVolume: Array.isArray(payload.weeklyPublicationVolume)
      ? payload.weeklyPublicationVolume
          .map((item) => normalizeMetaSocialMediaDashboardWeeklyPublicationRecord(item))
          .filter(
            (item): item is PanelMetaSocialMediaDashboardWeeklyPublicationRecord => item !== null,
          )
      : [],
  };
}

function normalizeMetaSocialMediaContentListRecord(
  payload: unknown,
): PanelMetaSocialMediaContentListRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const account = normalizeMetaSocialMediaAccountRecord(payload.account);
  const startDate = getFirstString([payload.startDate]);
  const endDate = getFirstString([payload.endDate]);
  const timezone = getFirstString([payload.timezone]);

  if (!account || !startDate || !endDate || !timezone) {
    return null;
  }

  return {
    account,
    contentTypes: Array.isArray(payload.contentTypes)
      ? payload.contentTypes
          .map((item) => normalizeMetaSocialMediaContentType(item))
          .filter((item): item is PanelMetaSocialMediaContentType => item !== null)
      : [],
    data: Array.isArray(payload.data)
      ? payload.data
          .map((item) => normalizeMetaSocialMediaContentItemRecord(item))
          .filter((item): item is PanelMetaSocialMediaContentItemRecord => item !== null)
      : [],
    endDate,
    meta: normalizeMetaSocialMediaPaginationMetaRecord(payload.meta),
    orderBy: normalizeMetaSocialMediaContentOrderBy(payload.orderBy),
    orderDirection: normalizeMetaSocialMediaContentOrderDirection(payload.orderDirection),
    startDate,
    summary: normalizeMetaSocialMediaContentListSummaryRecord(payload.summary),
    timezone,
  };
}

export async function listPanelMetaSocialPages(token: string) {
  const { payload, response } = await requestJson(PANEL_META_PAGES_PATH, token);

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível carregar as páginas da Meta."),
      response.status,
    );
  }

  return listPayloadArray(payload)
    .map((item) => normalizeMetaPageRecord(item))
    .filter((item): item is PanelMetaSocialPageRecord => item !== null);
}

export async function listPanelMetaSocialInstagramAccounts(token: string) {
  const { payload, response } = await requestJson(PANEL_META_INSTAGRAM_ACCOUNTS_PATH, token);

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível carregar as contas do Instagram vinculadas."),
      response.status,
    );
  }

  return listPayloadArray(payload)
    .map((item) => normalizeMetaInstagramAccountRecord(item))
    .filter((item): item is PanelMetaSocialInstagramAccountRecord => item !== null);
}

export async function listPanelMetaInstagramBusinessAccounts(token: string) {
  const { payload, response } = await requestJson(
    PANEL_META_INSTAGRAM_BUSINESS_ACCOUNT_PATH,
    token,
  );

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(
        payload,
        "Não foi possível carregar os vínculos instagram_business_account das páginas Meta.",
      ),
      response.status,
    );
  }

  return listPayloadArray(payload)
    .map((item) => normalizeMetaInstagramBusinessAccountRecord(item))
    .filter((item): item is PanelMetaInstagramBusinessAccountRecord => item !== null);
}

export async function listPanelMetaSocialPagePosts(
  token: string,
  query: PanelMetaSocialPagePostsQuery,
) {
  const params = new URLSearchParams();

  appendQueryValue(params, "pageId", query.pageId);
  appendQueryValue(params, "limit", query.limit);

  const { payload, response } = await requestJson(PANEL_META_PAGE_POSTS_PATH, token, params);

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível carregar os posts da página selecionada."),
      response.status,
    );
  }

  return listPayloadArray(payload)
    .map((item) => normalizeMetaPagePostRecord(item))
    .filter((item): item is PanelMetaSocialPagePostRecord => item !== null);
}

export async function publishPanelMetaPagePost(
  token: string,
  input: PanelMetaCreatePagePostInput,
) {
  const body = {
    link: input.link?.trim() || undefined,
    message: input.message?.trim() || undefined,
    pageId: input.pageId.trim(),
  };

  const { payload, response } = await requestJson(
    PANEL_META_PAGE_POSTS_PUBLISH_PATH,
    token,
    undefined,
    {
      body: JSON.stringify(body),
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível publicar o post do Facebook."),
      response.status,
    );
  }

  const record = normalizeMetaPagePostRecord(resolvePayloadRoot(payload));

  if (!record) {
    throw new PanelSocialMediaApiError(
      "A API confirmou a publicação do Facebook, mas o retorno veio em formato inesperado.",
      response.status,
    );
  }

  return record;
}

export async function listPanelMetaPageInsights(
  token: string,
  query: PanelMetaPageInsightsQuery,
) {
  const params = new URLSearchParams();

  appendQueryList(params, "metrics", query.metrics);
  appendQueryValue(params, "period", query.period);
  appendQueryValue(params, "startDate", query.startDate);
  appendQueryValue(params, "endDate", query.endDate);
  appendQueryValue(params, "pageId", query.pageId);

  const { payload, response } = await requestJson(PANEL_META_PAGE_INSIGHTS_PATH, token, params);

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível carregar os insights da página selecionada."),
      response.status,
    );
  }

  const record = normalizePageInsightsRecord(resolvePayloadRoot(payload));

  if (!record) {
    throw new PanelSocialMediaApiError(
      "A API retornou insights da página Meta em um formato inesperado.",
      response.status,
    );
  }

  return record;
}

export async function listPanelMetaSocialInstagramMedia(
  token: string,
  query: PanelMetaSocialInstagramMediaQuery,
) {
  const params = new URLSearchParams();

  appendQueryValue(params, "instagramAccountId", query.instagramAccountId);
  appendQueryValue(params, "limit", query.limit);

  const { payload, response } = await requestJson(
    PANEL_META_INSTAGRAM_MEDIA_PATH,
    token,
    params,
  );

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível carregar as mídias do Instagram selecionado."),
      response.status,
    );
  }

  return listPayloadArray(payload)
    .map((item) => normalizeMetaInstagramMediaRecord(item))
    .filter((item): item is PanelMetaSocialInstagramMediaRecord => item !== null);
}

export async function publishPanelMetaInstagramMedia(
  token: string,
  input: PanelMetaPublishInstagramMediaInput,
) {
  const body = {
    caption: input.caption?.trim() || undefined,
    imageUrl: input.imageUrl.trim(),
    instagramAccountId: input.instagramAccountId.trim(),
  };

  const { payload, response } = await requestJson(
    PANEL_META_INSTAGRAM_MEDIA_PUBLISH_PATH,
    token,
    undefined,
    {
      body: JSON.stringify(body),
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível publicar a mídia do Instagram."),
      response.status,
    );
  }

  const record = normalizeMetaPublishedInstagramMediaRecord(resolvePayloadRoot(payload));

  if (!record) {
    throw new PanelSocialMediaApiError(
      "A API confirmou a publicação no Instagram, mas o retorno veio em formato inesperado.",
      response.status,
    );
  }

  return record;
}

export async function listPanelMetaInstagramComments(
  token: string,
  query: PanelMetaInstagramCommentsQuery,
) {
  const params = new URLSearchParams();

  appendQueryValue(params, "instagramAccountId", query.instagramAccountId);
  appendQueryValue(params, "mediaId", query.mediaId);
  appendQueryValue(params, "limit", query.limit);

  const { payload, response } = await requestJson(
    PANEL_META_INSTAGRAM_COMMENTS_PATH,
    token,
    params,
  );

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível carregar os comentários do Instagram."),
      response.status,
    );
  }

  return listPayloadArray(payload)
    .map((item) => normalizeMetaInstagramCommentRecord(item))
    .filter((item): item is PanelMetaInstagramCommentRecord => item !== null);
}

export async function replyPanelMetaInstagramComment(
  token: string,
  input: PanelMetaReplyInstagramCommentInput,
) {
  const body = {
    commentId: input.commentId.trim(),
    instagramAccountId: input.instagramAccountId.trim(),
    message: input.message.trim(),
  };

  const { payload, response } = await requestJson(
    PANEL_META_INSTAGRAM_COMMENT_REPLY_PATH,
    token,
    undefined,
    {
      body: JSON.stringify(body),
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível responder o comentário do Instagram."),
      response.status,
    );
  }

  const record = normalizeMetaInstagramCommentRecord(resolvePayloadRoot(payload));

  if (!record) {
    throw new PanelSocialMediaApiError(
      "A API respondeu à réplica do comentário em um formato inesperado.",
      response.status,
    );
  }

  return record;
}

export async function updatePanelMetaInstagramCommentVisibility(
  token: string,
  input: PanelMetaUpdateInstagramCommentVisibilityInput,
) {
  const body = {
    commentId: input.commentId.trim(),
    hidden: input.hidden,
    instagramAccountId: input.instagramAccountId.trim(),
  };

  const { payload, response } = await requestJson(
    PANEL_META_INSTAGRAM_COMMENT_HIDE_PATH,
    token,
    undefined,
    {
      body: JSON.stringify(body),
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível alterar a visibilidade do comentário."),
      response.status,
    );
  }

  const record = normalizeMetaInstagramCommentVisibilityRecord(resolvePayloadRoot(payload));

  if (!record) {
    throw new PanelSocialMediaApiError(
      "A API respondeu à alteração de visibilidade em um formato inesperado.",
      response.status,
    );
  }

  return record;
}

export async function deletePanelMetaInstagramComment(
  token: string,
  query: PanelMetaDeleteInstagramCommentQuery,
) {
  const params = new URLSearchParams();

  appendQueryValue(params, "instagramAccountId", query.instagramAccountId);
  appendQueryValue(params, "commentId", query.commentId);

  const { payload, response } = await requestJson(
    PANEL_META_INSTAGRAM_COMMENTS_PATH,
    token,
    params,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível excluir o comentário do Instagram."),
      response.status,
    );
  }
}

export async function listPanelMetaInstagramInsights(
  token: string,
  query: PanelMetaInstagramInsightsQuery,
) {
  const params = new URLSearchParams();

  appendQueryList(params, "metrics", query.metrics);
  appendQueryValue(params, "period", query.period);
  appendQueryValue(params, "startDate", query.startDate);
  appendQueryValue(params, "endDate", query.endDate);
  appendQueryValue(params, "instagramAccountId", query.instagramAccountId);

  const { payload, response } = await requestJson(
    PANEL_META_INSTAGRAM_INSIGHTS_PATH,
    token,
    params,
  );

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível carregar os insights do Instagram selecionado."),
      response.status,
    );
  }

  const record = normalizeInstagramInsightsRecord(resolvePayloadRoot(payload));

  if (!record) {
    throw new PanelSocialMediaApiError(
      "A API retornou insights do Instagram em um formato inesperado.",
      response.status,
    );
  }

  return record;
}

export async function getPanelMetaSocialDashboard(
  token: string,
  query: PanelMetaSocialDashboardQuery,
) {
  const params = new URLSearchParams();

  appendQueryList(params, "metrics", query.metrics);
  appendQueryValue(params, "period", query.period);
  appendQueryValue(params, "startDate", query.startDate);
  appendQueryValue(params, "endDate", query.endDate);
  appendQueryValue(params, "pageId", query.pageId);
  appendQueryValue(params, "instagramAccountId", query.instagramAccountId);
  appendQueryValue(params, "contentLimit", query.contentLimit);
  appendQueryValue(params, "topLimit", query.topLimit);

  const { payload, response } = await requestJson(PANEL_META_SOCIAL_DASHBOARD_PATH, token, params);

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível carregar o dashboard social da Meta."),
      response.status,
    );
  }

  const record = normalizeSocialDashboardRecord(resolvePayloadRoot(payload));

  if (!record) {
    throw new PanelSocialMediaApiError(
      "A API retornou o dashboard social em um formato inesperado.",
      response.status,
    );
  }

  return record;
}

export async function getPanelMetaSocialDiagnostic(token: string) {
  const { payload, response } = await requestJson(PANEL_META_SOCIAL_DEBUG_PATH, token);

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível carregar o diagnóstico social da Meta."),
      response.status,
    );
  }

  const record = normalizeSocialDiagnosticRecord(resolvePayloadRoot(payload));

  if (!record) {
    throw new PanelSocialMediaApiError(
      "A API retornou o diagnóstico social em um formato inesperado.",
      response.status,
    );
  }

  return record;
}

export async function listPanelMetaSocialMediaAccounts(token: string) {
  const { payload, response } = await requestJson(PANEL_META_SOCIAL_MEDIA_ACCOUNTS_PATH, token);

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível carregar as contas sociais da Meta."),
      response.status,
    );
  }

  return listPayloadArray(payload)
    .map((item) => normalizeMetaSocialMediaAccountRecord(item))
    .filter((item): item is PanelMetaSocialMediaAccountRecord => item !== null);
}

export async function getPanelMetaSocialMediaDashboard(
  token: string,
  query: PanelMetaSocialMediaDashboardQuery,
) {
  const params = new URLSearchParams();

  appendQueryValue(params, "accountId", query.accountId);
  appendQueryValue(params, "startDate", query.startDate);
  appendQueryValue(params, "endDate", query.endDate);
  appendQueryValue(params, "timezone", query.timezone);
  appendQueryValue(params, "granularity", query.granularity);
  appendQueryValue(params, "rankingLimit", query.rankingLimit);

  const { payload, response } = await requestJson(
    PANEL_META_SOCIAL_MEDIA_DASHBOARD_PATH,
    token,
    params,
  );

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível carregar o dashboard social consolidado."),
      response.status,
    );
  }

  const record = normalizeMetaSocialMediaDashboardRecord(resolvePayloadRoot(payload));

  if (!record) {
    throw new PanelSocialMediaApiError(
      "A API retornou o dashboard social da Meta em um formato inesperado.",
      response.status,
    );
  }

  return record;
}

export async function listPanelMetaSocialMediaContents(
  token: string,
  query: PanelMetaSocialMediaContentsQuery,
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
    PANEL_META_SOCIAL_MEDIA_CONTENTS_PATH,
    token,
    params,
  );

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível carregar os conteúdos sociais da conta."),
      response.status,
    );
  }

  const record = normalizeMetaSocialMediaContentListRecord(resolvePayloadRoot(payload));

  if (!record) {
    throw new PanelSocialMediaApiError(
      "A API retornou a lista de conteúdos sociais em um formato inesperado.",
      response.status,
    );
  }

  return record;
}

export function resolvePanelMetaSocialInstagramSources(input: {
  instagramAccounts: PanelMetaSocialInstagramAccountRecord[];
  instagramBusinessAccounts?: PanelMetaInstagramBusinessAccountRecord[];
  page: PanelMetaSocialPageRecord;
}) {
  const { instagramAccounts, instagramBusinessAccounts = [], page } = input;
  const accountMap = new Map<string, PanelMetaSocialInstagramSourceRecord>();

  const upsertSource = (
    candidate: Omit<PanelMetaSocialInstagramSourceRecord, "pageId" | "pageName"> & {
      pageId?: string;
      pageName?: string;
    },
  ) => {
    const instagramAccountId = candidate.instagramAccountId.trim();

    if (!instagramAccountId) {
      return;
    }

    const currentSource = accountMap.get(instagramAccountId);

    accountMap.set(instagramAccountId, {
      instagramAccountId,
      name: candidate.name ?? currentSource?.name ?? null,
      origin: candidate.origin,
      pageId: candidate.pageId?.trim() || currentSource?.pageId || page.pageId,
      pageName: candidate.pageName?.trim() || currentSource?.pageName || page.name,
      profilePictureUrl: candidate.profilePictureUrl ?? currentSource?.profilePictureUrl ?? null,
      username: candidate.username ?? currentSource?.username ?? null,
    });
  };

  if (page.instagramBusinessAccountId) {
    upsertSource({
      instagramAccountId: page.instagramBusinessAccountId,
      name: null,
      origin: "page-field",
      profilePictureUrl: null,
      username: null,
    });
  }

  instagramBusinessAccounts
    .filter((item) => item.pageId === page.pageId)
    .forEach((item) => {
      if (item.instagramBusinessAccountIdFromAccountsList) {
        upsertSource({
          instagramAccountId: item.instagramBusinessAccountIdFromAccountsList,
          name: null,
          origin: "instagram-business-account",
          pageId: item.pageId,
          pageName: item.pageName,
          profilePictureUrl: null,
          username: null,
        });
      }

      if (item.resolvedInstagramBusinessAccountId) {
        upsertSource({
          instagramAccountId: item.resolvedInstagramBusinessAccountId,
          name: null,
          origin: "instagram-business-account",
          pageId: item.pageId,
          pageName: item.pageName,
          profilePictureUrl: null,
          username: null,
        });
      }
    });

  instagramAccounts
    .filter((item) => item.pageId === page.pageId)
    .forEach((item) => {
      upsertSource({
        instagramAccountId: item.instagramAccountId,
        name: item.name,
        origin: "accounts-list",
        pageId: item.pageId,
        pageName: item.pageName,
        profilePictureUrl: item.profilePictureUrl,
        username: item.username,
      });
    });

  return [...accountMap.values()];
}
