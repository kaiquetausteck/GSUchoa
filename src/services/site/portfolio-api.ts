import { resolveApiAssetUrl } from "../painel/resolve-api-asset-url";

const SITE_API_BASE_URL = (
  import.meta.env.VITE_SITE_API_URL ??
  import.meta.env.VITE_PANEL_API_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

export type PublicPortfolioSort =
  | "publishedAt-desc"
  | "publishedAt-asc"
  | "year-desc"
  | "year-asc"
  | "name-asc"
  | "name-desc";

export type PublicPortfolioLabels = {
  problem: string;
  solution: string;
  result: string;
};

export type PublicPortfolioMedia = {
  type: "image" | "video";
  src: string;
  alt: string;
  caption: string | null;
  poster: string | null;
  sortOrder: number;
};

export type PublicPortfolioStoryBlock = {
  title: string;
  text: string;
  sortOrder: number;
};

export type PublicPortfolioListItem = {
  slug: string;
  name: string;
  client: string;
  year: string;
  sector: string;
  featured: boolean;
  thumbnail: string;
  categories: string[];
  labels: PublicPortfolioLabels;
  overview: string;
};

export type PublicPortfolioDetail = PublicPortfolioListItem & {
  scope: string[];
  media: PublicPortfolioMedia[];
  story: PublicPortfolioStoryBlock[];
};

export type PublicPortfolioListFilters = {
  page?: number;
  perPage?: number;
  search?: string;
  category?: string;
  featured?: boolean;
  sort?: PublicPortfolioSort;
};

export type PublicPortfolioListResponse = {
  items: PublicPortfolioListItem[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

type JsonRecord = Record<string, unknown>;

class PublicPortfolioApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PublicPortfolioApiError";
    this.status = status;
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function buildUrl(path: string) {
  return `${SITE_API_BASE_URL}${normalizePath(path)}`;
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
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
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
      const normalized = value.trim().toLowerCase();

      if (["true", "1", "yes", "sim", "published", "featured"].includes(normalized)) {
        return true;
      }

      if (["false", "0", "no", "nao", "draft"].includes(normalized)) {
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

function extractStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
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
    return payload;
  }

  if (!isRecord(payload)) {
    return fallbackMessage;
  }

  const directMessageList = extractStringList(payload.message);
  if (directMessageList.length > 0) {
    return directMessageList.join(" ");
  }

  return (
    getFirstString([
      payload.error,
      payload.detail,
      payload.path,
    ]) ?? fallbackMessage
  );
}

async function requestJson(path: string) {
  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      headers: {
        Accept: "application/json",
      },
    });
  } catch {
    throw new PublicPortfolioApiError(
      `Nao foi possivel conectar com a API em ${SITE_API_BASE_URL}. Verifique se o backend esta ativo.`,
    );
  }

  const payload = await parseJsonSafe(response);

  return {
    response,
    payload,
  };
}

function normalizePortfolioLabels(value: unknown): PublicPortfolioLabels | null {
  if (!isRecord(value)) {
    return null;
  }

  const problem = getFirstString([value.problem]);
  const solution = getFirstString([value.solution]);
  const result = getFirstString([value.result]);

  if (!problem || !solution || !result) {
    return null;
  }

  return {
    problem,
    solution,
    result,
  };
}

function normalizePublicPortfolioMedia(payload: unknown): PublicPortfolioMedia | null {
  if (!isRecord(payload)) {
    return null;
  }

  const type = getFirstString([payload.type]);
  const src = resolveApiAssetUrl(SITE_API_BASE_URL, getFirstString([payload.src, payload.url, payload.href]));
  const alt = getFirstString([payload.alt]);

  if (!src || !alt || (type !== "image" && type !== "video")) {
    return null;
  }

  return {
    type,
    src,
    alt,
    caption: getFirstString([payload.caption]) ?? null,
    poster: resolveApiAssetUrl(SITE_API_BASE_URL, getFirstString([payload.poster])),
    sortOrder: getFirstNumber([payload.sortOrder]) ?? 1,
  };
}

function normalizePublicPortfolioStory(payload: unknown): PublicPortfolioStoryBlock | null {
  if (!isRecord(payload)) {
    return null;
  }

  const title = getFirstString([payload.title]);
  const text = getFirstString([payload.text]);

  if (!title || !text) {
    return null;
  }

  return {
    title,
    text,
    sortOrder: getFirstNumber([payload.sortOrder]) ?? 1,
  };
}

function normalizePublicPortfolioListItem(payload: unknown): PublicPortfolioListItem | null {
  if (!isRecord(payload)) {
    return null;
  }

  const slug = getFirstString([payload.slug]);
  const name = getFirstString([payload.name]);
  const client = getFirstString([payload.client]);
  const year = getFirstString([payload.year]);
  const sector = getFirstString([payload.sector]);
  const thumbnail = resolveApiAssetUrl(SITE_API_BASE_URL, getFirstString([payload.thumbnail]));
  const overview = getFirstString([payload.overview]) ?? "";
  const labels = normalizePortfolioLabels(payload.labels);

  if (!slug || !name || !client || !year || !sector || !thumbnail || !labels) {
    return null;
  }

  return {
    slug,
    name,
    client,
    year,
    sector,
    featured: getFirstBoolean([payload.featured]) ?? false,
    thumbnail,
    categories: extractStringArray(payload.categories),
    labels,
    overview,
  };
}

function normalizePublicPortfolioDetail(payload: unknown): PublicPortfolioDetail | null {
  const base = normalizePublicPortfolioListItem(payload);

  if (!base || !isRecord(payload)) {
    return null;
  }

  return {
    ...base,
    scope: extractStringArray(payload.scope),
    media: Array.isArray(payload.media)
      ? payload.media
          .map((item) => normalizePublicPortfolioMedia(item))
          .filter((item): item is PublicPortfolioMedia => Boolean(item))
      : [],
    story: Array.isArray(payload.story)
      ? payload.story
          .map((item) => normalizePublicPortfolioStory(item))
          .filter((item): item is PublicPortfolioStoryBlock => Boolean(item))
      : [],
  };
}

function extractPagination(payload: unknown, fallback: { page: number; perPage: number; count: number }) {
  if (!isRecord(payload)) {
    return {
      page: fallback.page,
      perPage: fallback.perPage,
      total: fallback.count,
      totalPages: Math.max(1, Math.ceil(fallback.count / fallback.perPage) || 1),
    };
  }

  const meta = isRecord(payload.meta) ? payload.meta : null;

  const total = getFirstNumber([payload.total, payload.count, meta?.total, meta?.count]) ?? fallback.count;
  const page = getFirstNumber([payload.page, payload.currentPage, meta?.page, meta?.currentPage]) ?? fallback.page;
  const perPage = getFirstNumber([payload.perPage, payload.limit, payload.pageSize, meta?.limit, meta?.pageSize]) ?? fallback.perPage;
  const totalPages = getFirstNumber([payload.totalPages, meta?.totalPages]) ?? Math.max(1, Math.ceil(total / perPage) || 1);

  return {
    page,
    perPage,
    total,
    totalPages,
  };
}

export async function listPublicPortfolio(filters: PublicPortfolioListFilters = {}) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(filters.page ?? 1));
  searchParams.set("limit", String(filters.perPage ?? 10));

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim());
  }

  if (filters.category?.trim()) {
    searchParams.set("category", filters.category.trim());
  }

  if (typeof filters.featured === "boolean") {
    searchParams.set("featured", String(filters.featured));
  }

  if (filters.sort) {
    searchParams.set("sort", filters.sort);
  }

  const { response, payload } = await requestJson(`/portfolio?${searchParams.toString()}`);

  if (!response.ok) {
    throw new PublicPortfolioApiError(
      extractMessage(payload, "Nao foi possivel carregar os cases publicados."),
      response.status,
    );
  }

  const sourceList =
    isRecord(payload) && Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];

  const items = sourceList
    .map((item) => normalizePublicPortfolioListItem(item))
    .filter((item): item is PublicPortfolioListItem => Boolean(item));

  return {
    items,
    ...extractPagination(payload, {
      page: filters.page ?? 1,
      perPage: filters.perPage ?? 10,
      count: items.length,
    }),
  } satisfies PublicPortfolioListResponse;
}

export async function listFeaturedPublicPortfolio() {
  const { response, payload } = await requestJson("/portfolio/featured");

  if (!response.ok) {
    throw new PublicPortfolioApiError(
      extractMessage(payload, "Nao foi possivel carregar os cases em destaque."),
      response.status,
    );
  }

  const sourceList =
    Array.isArray(payload)
      ? payload
      : isRecord(payload) && Array.isArray(payload.data)
        ? payload.data
        : [];

  return sourceList
    .map((item) => normalizePublicPortfolioListItem(item))
    .filter((item): item is PublicPortfolioListItem => Boolean(item));
}

export async function listPublicPortfolioCategories() {
  const { response, payload } = await requestJson("/portfolio/categories");

  if (!response.ok) {
    throw new PublicPortfolioApiError(
      extractMessage(payload, "Nao foi possivel carregar as categorias do portfolio."),
      response.status,
    );
  }

  return extractStringArray(payload);
}

export async function listPublicPortfolioScopes() {
  const { response, payload } = await requestJson("/portfolio/scopes");

  if (!response.ok) {
    throw new PublicPortfolioApiError(
      extractMessage(payload, "Nao foi possivel carregar os escopos do portfolio."),
      response.status,
    );
  }

  return extractStringArray(payload);
}

export async function getPublicPortfolioBySlug(slug: string) {
  const { response, payload } = await requestJson(`/portfolio/${encodeURIComponent(slug)}`);

  if (!response.ok) {
    throw new PublicPortfolioApiError(
      extractMessage(payload, "Nao foi possivel carregar esse estudo de caso."),
      response.status,
    );
  }

  const detail = normalizePublicPortfolioDetail(payload);

  if (!detail) {
    throw new PublicPortfolioApiError(
      "A API respondeu ao portfolio publico, mas o formato nao foi reconhecido.",
      response.status,
    );
  }

  return detail;
}
