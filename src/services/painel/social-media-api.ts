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

export const PANEL_SOCIAL_MEDIA_PLATFORM_VALUES = ["facebook", "instagram"] as const;
export type PanelSocialMediaPlatform = (typeof PANEL_SOCIAL_MEDIA_PLATFORM_VALUES)[number];

export const PANEL_SOCIAL_MEDIA_CONTENT_KIND_VALUES = [
  "facebook_post",
  "instagram_post",
  "reel",
] as const;
export type PanelSocialMediaContentKind =
  (typeof PANEL_SOCIAL_MEDIA_CONTENT_KIND_VALUES)[number];

export const PANEL_SOCIAL_MEDIA_MEDIA_KIND_VALUES = [
  "carousel",
  "photo",
  "post",
  "reel",
  "unknown",
  "video",
] as const;
export type PanelSocialMediaMediaKind =
  (typeof PANEL_SOCIAL_MEDIA_MEDIA_KIND_VALUES)[number];

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
  createdTime: string | null;
  fullPictureUrl: string | null;
  message: string | null;
  pageId: string;
  pageName: string;
  permalinkUrl: string | null;
  postId: string;
  statusType: string | null;
};

export type PanelMetaSocialInstagramMediaRecord = {
  caption: string | null;
  instagramAccountId: string;
  mediaId: string;
  mediaType: string | null;
  mediaUrl: string | null;
  permalink: string | null;
  thumbnailUrl: string | null;
  timestamp: string | null;
  username: string;
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

  const candidateKeys = ["items", "data"];
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

function normalizeInsightPeriod(value: unknown): PanelMetaSocialInsightPeriod | null {
  const normalizedValue = getFirstString([value]);

  if (!normalizedValue) {
    return null;
  }

  return PANEL_META_SOCIAL_INSIGHT_PERIOD_VALUES.includes(
    normalizedValue as PanelMetaSocialInsightPeriod,
  )
    ? (normalizedValue as PanelMetaSocialInsightPeriod)
    : null;
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
    createdTime: normalizeDateTime(payload.createdTime),
    fullPictureUrl: resolveApiAssetUrl(PANEL_API_BASE_URL, getFirstString([payload.fullPictureUrl])),
    message: getFirstString([payload.message]),
    pageId,
    pageName,
    permalinkUrl: resolveApiAssetUrl(PANEL_API_BASE_URL, getFirstString([payload.permalinkUrl])),
    postId,
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
    instagramAccountId,
    mediaId,
    mediaType: getFirstString([payload.mediaType]),
    mediaUrl: resolveApiAssetUrl(PANEL_API_BASE_URL, getFirstString([payload.mediaUrl])),
    permalink: resolveApiAssetUrl(PANEL_API_BASE_URL, getFirstString([payload.permalink])),
    thumbnailUrl: resolveApiAssetUrl(PANEL_API_BASE_URL, getFirstString([payload.thumbnailUrl])),
    timestamp: normalizeDateTime(payload.timestamp),
    username,
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
