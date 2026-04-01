import { getPanelApiBaseUrl } from "./auth-api";
import { resolveApiAssetUrl } from "./resolve-api-asset-url";

const PANEL_API_BASE_URL = getPanelApiBaseUrl();
const PANEL_SOCIAL_MEDIA_ACCOUNTS_PATH =
  import.meta.env.VITE_PANEL_SOCIAL_MEDIA_ACCOUNTS_PATH ?? "/social-media/meta/accounts";
const PANEL_SOCIAL_MEDIA_SYNC_PATH =
  import.meta.env.VITE_PANEL_SOCIAL_MEDIA_SYNC_PATH ?? "/social-media/meta/sync";
const PANEL_SOCIAL_MEDIA_PAGES_PATH =
  import.meta.env.VITE_PANEL_SOCIAL_MEDIA_PAGES_PATH ?? "/social-media/meta/filters/pages";
const PANEL_SOCIAL_MEDIA_INSTAGRAM_ACCOUNTS_PATH =
  import.meta.env.VITE_PANEL_SOCIAL_MEDIA_INSTAGRAM_ACCOUNTS_PATH ??
  "/social-media/meta/filters/instagram-accounts";
const PANEL_SOCIAL_MEDIA_CONTENT_PATH =
  import.meta.env.VITE_PANEL_SOCIAL_MEDIA_CONTENT_PATH ?? "/social-media/meta/content";
const PANEL_SOCIAL_MEDIA_DASHBOARD_SUMMARY_PATH =
  import.meta.env.VITE_PANEL_SOCIAL_MEDIA_DASHBOARD_SUMMARY_PATH ??
  "/social-media/meta/dashboard/summary";
const PANEL_SOCIAL_MEDIA_DASHBOARD_TIMELINE_PATH =
  import.meta.env.VITE_PANEL_SOCIAL_MEDIA_DASHBOARD_TIMELINE_PATH ??
  "/social-media/meta/dashboard/timeline";

export const PANEL_SOCIAL_MEDIA_PLATFORM_VALUES = ["facebook", "instagram"] as const;
export type PanelSocialMediaPlatform = (typeof PANEL_SOCIAL_MEDIA_PLATFORM_VALUES)[number];

export const PANEL_SOCIAL_MEDIA_CONTENT_KIND_VALUES = [
  "facebook_post",
  "instagram_post",
  "reel",
] as const;
export type PanelSocialMediaContentKind =
  (typeof PANEL_SOCIAL_MEDIA_CONTENT_KIND_VALUES)[number];

export type PanelSocialMediaAccountRecord = {
  followersCount: number | null;
  instagramName: string | null;
  instagramUserId: string | null;
  instagramUsername: string | null;
  mediaCount: number | null;
  pageCategory: string | null;
  pageId: string;
  pageName: string;
  pagePictureUrl: string | null;
  profilePictureUrl: string | null;
  tasks: string[];
};

export type PanelSocialMediaSyncInput = {
  instagramMediaLimit?: number;
  instagramUserIds?: string[];
  pageIds?: string[];
  pagePostsLimit?: number;
};

export type PanelSocialMediaSyncResponse = {
  instagramAccountsSynced: number;
  instagramMediaSynced: number;
  pagePostsSynced: number;
  pagesSynced: number;
  syncedAt: string | null;
};

export type PanelSocialMediaPageFilterRecord = {
  category: string | null;
  instagramAccountsCount: number;
  name: string;
  pageId: string;
};

export type PanelSocialMediaInstagramAccountFilterRecord = {
  followersCount: number | null;
  instagramUserId: string;
  mediaCount: number | null;
  name: string | null;
  pageId: string;
  pageName: string;
  username: string;
};

export type PanelSocialMediaContentMediaKind =
  | "carousel"
  | "photo"
  | "post"
  | "reel"
  | "unknown"
  | "video";

export type PanelSocialMediaContentItemRecord = {
  accountId: string;
  accountName: string;
  caption: string | null;
  commentsCount: number | null;
  contentId: string;
  contentKind: PanelSocialMediaContentKind;
  engagementsCount: number;
  mediaKind: PanelSocialMediaContentMediaKind;
  mediaPreviewUrl: string | null;
  mediaType: string | null;
  pageId: string;
  pageName: string;
  permalinkUrl: string | null;
  platform: PanelSocialMediaPlatform;
  publishedAt: string;
  reactionsCount: number | null;
  reach: number | null;
  savedCount: number | null;
  sharesCount: number | null;
  thumbnailUrl: string | null;
  title: string;
  viewsCount: number | null;
};

export type PanelSocialMediaContentListFilters = {
  contentIds?: string[];
  endDate?: string;
  instagramUserIds?: string[];
  page: number;
  pageIds?: string[];
  perPage: number;
  platform?: PanelSocialMediaPlatform;
  search?: string;
  startDate?: string;
};

export type PanelSocialMediaContentListResponse = {
  items: PanelSocialMediaContentItemRecord[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type PanelSocialMediaDashboardQuery = {
  contentIds?: string[];
  endDate?: string;
  instagramUserIds?: string[];
  pageIds?: string[];
  startDate?: string;
};

export type PanelSocialMediaDashboardSummaryRecord = {
  averageEngagementPerItem: number;
  commentsCount: number;
  contentIds: string[];
  endDate: string;
  engagementsCount: number;
  facebookPosts: number;
  hasData: boolean;
  instagramMedia: number;
  instagramPosts: number;
  instagramUserIds: string[];
  pageIds: string[];
  reach: number;
  reactionsCount: number;
  reels: number;
  savedCount: number;
  sharesCount: number;
  startDate: string;
  totalItems: number;
  viewsCount: number;
};

export type PanelSocialMediaDashboardTimelineItemRecord = {
  commentsCount: number;
  date: string;
  engagementsCount: number;
  facebookPosts: number;
  instagramMedia: number;
  instagramPosts: number;
  reach: number;
  reactionsCount: number;
  reels: number;
  savedCount: number;
  sharesCount: number;
  totalItems: number;
  viewsCount: number;
};

export type PanelSocialMediaDashboardTimelineRecord = Omit<
  PanelSocialMediaDashboardSummaryRecord,
  | "averageEngagementPerItem"
  | "commentsCount"
  | "engagementsCount"
  | "facebookPosts"
  | "instagramMedia"
  | "instagramPosts"
  | "reach"
  | "reactionsCount"
  | "reels"
  | "savedCount"
  | "sharesCount"
  | "totalItems"
  | "viewsCount"
> & {
  data: PanelSocialMediaDashboardTimelineItemRecord[];
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

function extractStringList(value: unknown): string[] {
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => extractStringList(item)).filter(Boolean);
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => getFirstString([item]))
      .filter((item): item is string => Boolean(item));
  }

  return extractStringList(value);
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
    throw new PanelSocialMediaApiError(
      `Não foi possível conectar com a API em ${PANEL_API_BASE_URL}. Verifique se o backend está ativo.`,
    );
  }

  const payload = await parseJsonSafe(response);

  return { payload, response };
}

function appendQueryValue(
  params: URLSearchParams,
  key: string,
  value: string | number | undefined | null,
) {
  if (typeof value === "number" && Number.isFinite(value)) {
    params.set(key, String(value));
    return;
  }

  if (typeof value === "string" && value.trim()) {
    params.set(key, value.trim());
  }
}

function appendQueryArray(params: URLSearchParams, key: string, values?: string[]) {
  const normalizedValues = values?.map((value) => value.trim()).filter(Boolean) ?? [];

  if (normalizedValues.length === 0) {
    return;
  }

  params.set(key, normalizedValues.join(","));
}

function buildContentQuery(query: PanelSocialMediaContentListFilters) {
  const params = new URLSearchParams();

  appendQueryValue(params, "page", query.page);
  appendQueryValue(params, "limit", query.perPage);
  appendQueryValue(params, "platform", query.platform);
  appendQueryValue(params, "search", query.search);
  appendQueryValue(params, "startDate", query.startDate);
  appendQueryValue(params, "endDate", query.endDate);
  appendQueryArray(params, "pageIds", query.pageIds);
  appendQueryArray(params, "instagramUserIds", query.instagramUserIds);
  appendQueryArray(params, "contentIds", query.contentIds);

  return params;
}

function buildDashboardQuery(query: PanelSocialMediaDashboardQuery) {
  const params = new URLSearchParams();

  appendQueryValue(params, "startDate", query.startDate);
  appendQueryValue(params, "endDate", query.endDate);
  appendQueryArray(params, "pageIds", query.pageIds);
  appendQueryArray(params, "instagramUserIds", query.instagramUserIds);
  appendQueryArray(params, "contentIds", query.contentIds);

  return params;
}

function buildInstagramAccountsQuery(query: { pageIds?: string[]; search?: string }) {
  const params = new URLSearchParams();

  appendQueryValue(params, "search", query.search);
  appendQueryArray(params, "pageIds", query.pageIds);

  return params;
}

function normalizePlatform(value: unknown): PanelSocialMediaPlatform | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();

  return PANEL_SOCIAL_MEDIA_PLATFORM_VALUES.includes(normalizedValue as PanelSocialMediaPlatform)
    ? (normalizedValue as PanelSocialMediaPlatform)
    : null;
}

function normalizeContentKind(value: unknown): PanelSocialMediaContentKind | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();

  return PANEL_SOCIAL_MEDIA_CONTENT_KIND_VALUES.includes(
    normalizedValue as PanelSocialMediaContentKind,
  )
    ? (normalizedValue as PanelSocialMediaContentKind)
    : null;
}

function normalizeResourceUrl(value: unknown) {
  const directValue = getFirstString([value]);

  if (directValue) {
    return resolveApiAssetUrl(PANEL_API_BASE_URL, directValue);
  }

  if (!isRecord(value)) {
    return null;
  }

  return resolveApiAssetUrl(
    PANEL_API_BASE_URL,
    getFirstString([value.url, value.href, value.path, value.location, value.secure_url]),
  );
}

function resolveContentMediaKind(payload: JsonRecord): PanelSocialMediaContentMediaKind {
  const contentKind = normalizeContentKind(payload.contentKind);
  const mediaType = getFirstString([payload.mediaType, payload.media_type])?.toLowerCase();

  if (contentKind === "reel") {
    return "reel";
  }

  if (
    mediaType?.includes("video") ||
    mediaType?.includes("reels") ||
    mediaType?.includes("story")
  ) {
    return "video";
  }

  if (
    mediaType?.includes("carousel") ||
    mediaType?.includes("album") ||
    mediaType?.includes("sidecar")
  ) {
    return "carousel";
  }

  if (
    mediaType?.includes("image") ||
    mediaType?.includes("photo")
  ) {
    return "photo";
  }

  if (contentKind === "facebook_post" || contentKind === "instagram_post") {
    return "post";
  }

  return "unknown";
}

function listPayloadArray(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (isRecord(payload) && Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

function normalizeAccountRecord(payload: unknown): PanelSocialMediaAccountRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const pageId = getFirstString([payload.pageId]);
  const pageName = getFirstString([payload.pageName, payload.name]);

  if (!pageId || !pageName) {
    return null;
  }

  return {
    followersCount: getFirstNumber([payload.followersCount]),
    instagramName: getFirstString([payload.instagramName, payload.name]),
    instagramUserId: getFirstString([payload.instagramUserId]),
    instagramUsername: getFirstString([payload.instagramUsername, payload.username]),
    mediaCount: getFirstNumber([payload.mediaCount]),
    pageCategory: getFirstString([payload.pageCategory, payload.category]),
    pageId,
    pageName,
    pagePictureUrl: normalizeResourceUrl(payload.pagePictureUrl),
    profilePictureUrl: normalizeResourceUrl(payload.profilePictureUrl),
    tasks: normalizeStringArray(payload.tasks),
  };
}

function normalizePageFilterRecord(payload: unknown): PanelSocialMediaPageFilterRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const pageId = getFirstString([payload.pageId, payload.id]);
  const name = getFirstString([payload.name, payload.pageName]);

  if (!pageId || !name) {
    return null;
  }

  return {
    category: getFirstString([payload.category, payload.pageCategory]),
    instagramAccountsCount: getFirstNumber([payload.instagramAccountsCount]) ?? 0,
    name,
    pageId,
  };
}

function normalizeInstagramAccountFilterRecord(
  payload: unknown,
): PanelSocialMediaInstagramAccountFilterRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const instagramUserId = getFirstString([payload.instagramUserId, payload.id]);
  const username = getFirstString([payload.username, payload.instagramUsername]);
  const pageId = getFirstString([payload.pageId]);
  const pageName = getFirstString([payload.pageName, payload.name]);

  if (!instagramUserId || !username || !pageId || !pageName) {
    return null;
  }

  return {
    followersCount: getFirstNumber([payload.followersCount]),
    instagramUserId,
    mediaCount: getFirstNumber([payload.mediaCount]),
    name: getFirstString([payload.name, payload.instagramName]),
    pageId,
    pageName,
    username,
  };
}

function normalizeContentItem(payload: unknown): PanelSocialMediaContentItemRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const platform = normalizePlatform(payload.platform);
  const contentKind = normalizeContentKind(payload.contentKind);
  const contentId = getFirstString([payload.contentId, payload.id]);
  const accountId = getFirstString([payload.accountId]);
  const accountName = getFirstString([payload.accountName, payload.username, payload.name]);
  const pageId = getFirstString([payload.pageId]);
  const pageName = getFirstString([payload.pageName]);
  const publishedAt = getFirstString([payload.publishedAt, payload.createdAt, payload.timestamp]);
  const title =
    getFirstString([payload.title, payload.caption, payload.name]) ?? "Conteúdo sem título";

  if (
    !platform ||
    !contentKind ||
    !contentId ||
    !accountId ||
    !accountName ||
    !pageId ||
    !pageName ||
    !publishedAt
  ) {
    return null;
  }

  return {
    accountId,
    accountName,
    caption: getFirstString([payload.caption, payload.message, payload.description]),
    commentsCount: getFirstNumber([payload.commentsCount]),
    contentId,
    contentKind,
    engagementsCount: getFirstNumber([payload.engagementsCount]) ?? 0,
    mediaKind: resolveContentMediaKind(payload),
    mediaPreviewUrl:
      normalizeResourceUrl(payload.thumbnailUrl) ??
      normalizeResourceUrl(payload.picture) ??
      normalizeResourceUrl(payload.coverUrl),
    mediaType: getFirstString([payload.mediaType, payload.media_type]),
    pageId,
    pageName,
    permalinkUrl: normalizeResourceUrl(payload.permalinkUrl ?? payload.permalink ?? payload.link),
    platform,
    publishedAt,
    reactionsCount: getFirstNumber([payload.reactionsCount]),
    reach: getFirstNumber([payload.reach]),
    savedCount: getFirstNumber([payload.savedCount]),
    sharesCount: getFirstNumber([payload.sharesCount]),
    thumbnailUrl:
      normalizeResourceUrl(payload.thumbnailUrl) ??
      normalizeResourceUrl(payload.picture) ??
      normalizeResourceUrl(payload.coverUrl),
    title,
    viewsCount: getFirstNumber([payload.viewsCount]),
  };
}

function normalizeDashboardSummary(payload: unknown): PanelSocialMediaDashboardSummaryRecord | null {
  const root = isRecord(payload) && isRecord(payload.data) ? payload.data : payload;

  if (!isRecord(root)) {
    return null;
  }

  const startDate = getFirstString([root.startDate]);
  const endDate = getFirstString([root.endDate]);

  if (!startDate || !endDate) {
    return null;
  }

  return {
    averageEngagementPerItem: getFirstNumber([root.averageEngagementPerItem]) ?? 0,
    commentsCount: getFirstNumber([root.commentsCount]) ?? 0,
    contentIds: normalizeStringArray(root.contentIds),
    endDate,
    engagementsCount: getFirstNumber([root.engagementsCount]) ?? 0,
    facebookPosts: getFirstNumber([root.facebookPosts]) ?? 0,
    hasData: getFirstBoolean([root.hasData]) ?? false,
    instagramMedia: getFirstNumber([root.instagramMedia]) ?? 0,
    instagramPosts: getFirstNumber([root.instagramPosts]) ?? 0,
    instagramUserIds: normalizeStringArray(root.instagramUserIds),
    pageIds: normalizeStringArray(root.pageIds),
    reach: getFirstNumber([root.reach]) ?? 0,
    reactionsCount: getFirstNumber([root.reactionsCount]) ?? 0,
    reels: getFirstNumber([root.reels]) ?? 0,
    savedCount: getFirstNumber([root.savedCount]) ?? 0,
    sharesCount: getFirstNumber([root.sharesCount]) ?? 0,
    startDate,
    totalItems: getFirstNumber([root.totalItems]) ?? 0,
    viewsCount: getFirstNumber([root.viewsCount]) ?? 0,
  };
}

function normalizeTimelineItem(payload: unknown): PanelSocialMediaDashboardTimelineItemRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const date = getFirstString([payload.date]);

  if (!date) {
    return null;
  }

  return {
    commentsCount: getFirstNumber([payload.commentsCount]) ?? 0,
    date,
    engagementsCount: getFirstNumber([payload.engagementsCount]) ?? 0,
    facebookPosts: getFirstNumber([payload.facebookPosts]) ?? 0,
    instagramMedia: getFirstNumber([payload.instagramMedia]) ?? 0,
    instagramPosts: getFirstNumber([payload.instagramPosts]) ?? 0,
    reach: getFirstNumber([payload.reach]) ?? 0,
    reactionsCount: getFirstNumber([payload.reactionsCount]) ?? 0,
    reels: getFirstNumber([payload.reels]) ?? 0,
    savedCount: getFirstNumber([payload.savedCount]) ?? 0,
    sharesCount: getFirstNumber([payload.sharesCount]) ?? 0,
    totalItems: getFirstNumber([payload.totalItems]) ?? 0,
    viewsCount: getFirstNumber([payload.viewsCount]) ?? 0,
  };
}

function normalizeDashboardTimeline(
  payload: unknown,
): PanelSocialMediaDashboardTimelineRecord | null {
  const root = isRecord(payload) && isRecord(payload.data) ? payload.data : payload;

  if (!isRecord(root)) {
    return null;
  }

  const startDate = getFirstString([root.startDate]);
  const endDate = getFirstString([root.endDate]);

  if (!startDate || !endDate) {
    return null;
  }

  return {
    contentIds: normalizeStringArray(root.contentIds),
    data: listPayloadArray(root.data)
      .map((item) => normalizeTimelineItem(item))
      .filter((item): item is PanelSocialMediaDashboardTimelineItemRecord => item !== null),
    endDate,
    hasData: getFirstBoolean([root.hasData]) ?? false,
    instagramUserIds: normalizeStringArray(root.instagramUserIds),
    pageIds: normalizeStringArray(root.pageIds),
    startDate,
  };
}

function normalizeContentListResponse(payload: unknown): PanelSocialMediaContentListResponse {
  const root = isRecord(payload) ? payload : null;
  const items = listPayloadArray(root?.data ?? payload)
    .map((item) => normalizeContentItem(item))
    .filter((item): item is PanelSocialMediaContentItemRecord => item !== null);
  const meta = isRecord(root?.meta) ? root.meta : null;

  const page = getFirstNumber([meta?.page]) ?? 1;
  const perPage =
    getFirstNumber([meta?.limit, meta?.perPage]) ?? Math.max(items.length, 10);
  const total = getFirstNumber([meta?.total]) ?? items.length;
  const totalPages =
    getFirstNumber([meta?.totalPages]) ??
    Math.max(1, Math.ceil(total / Math.max(perPage, 1)));

  return { items, page, perPage, total, totalPages };
}

function normalizeSyncResponse(payload: unknown): PanelSocialMediaSyncResponse {
  const root = isRecord(payload) && isRecord(payload.data) ? payload.data : payload;

  if (!isRecord(root)) {
    return {
      instagramAccountsSynced: 0,
      instagramMediaSynced: 0,
      pagePostsSynced: 0,
      pagesSynced: 0,
      syncedAt: null,
    };
  }

  return {
    instagramAccountsSynced: getFirstNumber([root.instagramAccountsSynced]) ?? 0,
    instagramMediaSynced: getFirstNumber([root.instagramMediaSynced]) ?? 0,
    pagePostsSynced: getFirstNumber([root.pagePostsSynced]) ?? 0,
    pagesSynced: getFirstNumber([root.pagesSynced]) ?? 0,
    syncedAt: getFirstString([root.syncedAt]),
  };
}

export async function listPanelMetaSocialAccounts(token: string) {
  const { response, payload } = await requestJson(PANEL_SOCIAL_MEDIA_ACCOUNTS_PATH, token);

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível carregar as contas sociais da Meta."),
      response.status,
    );
  }

  return listPayloadArray(payload)
    .map((item) => normalizeAccountRecord(item))
    .filter((item): item is PanelSocialMediaAccountRecord => item !== null);
}

export async function syncPanelMetaSocialCatalog(
  token: string,
  input: PanelSocialMediaSyncInput = {},
) {
  const { response, payload } = await requestJson(
    PANEL_SOCIAL_MEDIA_SYNC_PATH,
    token,
    {
      body: JSON.stringify({
        instagramMediaLimit: input.instagramMediaLimit,
        instagramUserIds: input.instagramUserIds,
        pageIds: input.pageIds,
        pagePostsLimit: input.pagePostsLimit,
      }),
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível sincronizar o catálogo social agora."),
      response.status,
    );
  }

  return normalizeSyncResponse(payload);
}

export async function listPanelMetaSocialPages(token: string, search?: string) {
  const params = new URLSearchParams();
  appendQueryValue(params, "search", search);

  const { response, payload } = await requestJson(
    PANEL_SOCIAL_MEDIA_PAGES_PATH,
    token,
    {},
    params,
  );

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível carregar as páginas Meta sincronizadas."),
      response.status,
    );
  }

  return listPayloadArray(payload)
    .map((item) => normalizePageFilterRecord(item))
    .filter((item): item is PanelSocialMediaPageFilterRecord => item !== null);
}

export async function listPanelMetaSocialInstagramAccounts(
  token: string,
  query: { pageIds?: string[]; search?: string } = {},
) {
  const params = buildInstagramAccountsQuery(query);
  const { response, payload } = await requestJson(
    PANEL_SOCIAL_MEDIA_INSTAGRAM_ACCOUNTS_PATH,
    token,
    {},
    params,
  );

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível carregar as contas do Instagram sincronizadas."),
      response.status,
    );
  }

  return listPayloadArray(payload)
    .map((item) => normalizeInstagramAccountFilterRecord(item))
    .filter((item): item is PanelSocialMediaInstagramAccountFilterRecord => item !== null);
}

export async function listPanelMetaSocialContent(
  token: string,
  query: PanelSocialMediaContentListFilters,
) {
  const params = buildContentQuery(query);
  const { response, payload } = await requestJson(
    PANEL_SOCIAL_MEDIA_CONTENT_PATH,
    token,
    {},
    params,
  );

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível carregar os conteúdos sociais sincronizados."),
      response.status,
    );
  }

  return normalizeContentListResponse(payload);
}

export async function getPanelMetaSocialDashboardSummary(
  token: string,
  query: PanelSocialMediaDashboardQuery = {},
) {
  const params = buildDashboardQuery(query);
  const { response, payload } = await requestJson(
    PANEL_SOCIAL_MEDIA_DASHBOARD_SUMMARY_PATH,
    token,
    {},
    params,
  );

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível carregar o resumo do social media agora."),
      response.status,
    );
  }

  const summary = normalizeDashboardSummary(payload);

  if (!summary) {
    throw new PanelSocialMediaApiError(
      `A API respondeu ao endpoint ${PANEL_SOCIAL_MEDIA_DASHBOARD_SUMMARY_PATH}, mas o formato do resumo não foi reconhecido.`,
      response.status,
    );
  }

  return summary;
}

export async function getPanelMetaSocialDashboardTimeline(
  token: string,
  query: PanelSocialMediaDashboardQuery = {},
) {
  const params = buildDashboardQuery(query);
  const { response, payload } = await requestJson(
    PANEL_SOCIAL_MEDIA_DASHBOARD_TIMELINE_PATH,
    token,
    {},
    params,
  );

  if (!response.ok) {
    throw new PanelSocialMediaApiError(
      extractMessage(payload, "Não foi possível carregar a timeline do social media agora."),
      response.status,
    );
  }

  const timeline = normalizeDashboardTimeline(payload);

  if (!timeline) {
    throw new PanelSocialMediaApiError(
      `A API respondeu ao endpoint ${PANEL_SOCIAL_MEDIA_DASHBOARD_TIMELINE_PATH}, mas o formato da timeline não foi reconhecido.`,
      response.status,
    );
  }

  return timeline;
}
