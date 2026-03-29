import { resolveApiAssetUrl } from "./resolve-api-asset-url";

const PANEL_API_BASE_URL = (import.meta.env.VITE_PANEL_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

const PANEL_PORTFOLIO_PATH = import.meta.env.VITE_PANEL_ADMIN_PORTFOLIO_PATH ?? "/admin/portfolio";
const PANEL_PORTFOLIO_DETAIL_PATH =
  import.meta.env.VITE_PANEL_ADMIN_PORTFOLIO_DETAIL_PATH ?? "/admin/portfolio/:id";
const PANEL_PORTFOLIO_UPDATE_PATH =
  import.meta.env.VITE_PANEL_ADMIN_PORTFOLIO_UPDATE_PATH ?? PANEL_PORTFOLIO_DETAIL_PATH;
const PANEL_PORTFOLIO_PUBLISH_PATH =
  import.meta.env.VITE_PANEL_ADMIN_PORTFOLIO_PUBLISH_PATH ?? "/admin/portfolio/:id/publish";
const PANEL_PORTFOLIO_FEATURE_PATH =
  import.meta.env.VITE_PANEL_ADMIN_PORTFOLIO_FEATURE_PATH ?? "/admin/portfolio/:id/feature";

export type PanelPortfolioSort =
  | "updatedAt-desc"
  | "updatedAt-asc"
  | "createdAt-desc"
  | "createdAt-asc"
  | "year-desc"
  | "year-asc"
  | "name-asc"
  | "name-desc";

export type PanelPortfolioMediaType = "image" | "video";

export type PanelPortfolioMediaRecord = {
  type: PanelPortfolioMediaType;
  src: string;
  alt: string;
  caption: string | null;
  poster: string | null;
  sortOrder: number;
};

export type PanelPortfolioStoryRecord = {
  title: string;
  text: string;
  sortOrder: number;
};

export type PanelPortfolioSummaryRecord = {
  id: string;
  slug: string;
  name: string;
  client: string;
  year: string;
  sector: string;
  featured: boolean;
  thumbnail: string;
  categories: string[];
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PanelPortfolioDetailRecord = PanelPortfolioSummaryRecord & {
  overview: string;
  problemLabel: string;
  solutionLabel: string;
  resultLabel: string;
  scope: string[];
  media: PanelPortfolioMediaRecord[];
  story: PanelPortfolioStoryRecord[];
  deletedAt: string | null;
  createdByUserId: string | null;
  updatedByUserId: string | null;
};

export type PanelPortfolioListFilters = {
  page: number;
  perPage: number;
  search?: string;
  featured?: "all" | "featured" | "regular";
  published?: "all" | "published" | "draft";
  sort?: PanelPortfolioSort;
};

export type PanelPortfolioListResponse = {
  items: PanelPortfolioSummaryRecord[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type PanelPortfolioMediaInput = {
  type: PanelPortfolioMediaType;
  alt: string;
  caption?: string;
  src?: string;
  poster?: string;
  sortOrder: number;
  file?: File | null;
  posterFile?: File | null;
};

export type PanelPortfolioStoryInput = {
  title: string;
  text: string;
  sortOrder: number;
};

export type PanelPortfolioUpsertInput = {
  name: string;
  slug: string;
  client: string;
  year: string;
  sector: string;
  featured: boolean;
  overview: string;
  problemLabel: string;
  solutionLabel: string;
  resultLabel: string;
  categories: string[];
  isPublished: boolean;
  publishedAt?: string | null;
  scope: string[];
  media: PanelPortfolioMediaInput[];
  story: PanelPortfolioStoryInput[];
  thumbnail?: string | null;
  thumbnailFile?: File | null;
};

type JsonRecord = Record<string, unknown>;

class PanelPortfolioApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PanelPortfolioApiError";
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
  return `${PANEL_API_BASE_URL}${normalizePath(path)}`;
}

function buildPathWithId(path: string, id: string) {
  return path.replace(":id", encodeURIComponent(id));
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
      const normalized = value.trim().toLowerCase();

      if (["true", "1", "yes", "sim", "published", "featured"].includes(normalized)) {
        return true;
      }

      if (["false", "0", "no", "nao", "draft"].includes(normalized)) {
        return false;
      }
    }

    if (typeof value === "number") {
      return value !== 0;
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

function extractStringList(value: unknown): string[] {
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .flatMap((item) => extractStringList(item))
    .filter(Boolean);
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

  const nestedDataMessageList = isRecord(payload.data)
    ? extractStringList(payload.data.message)
    : [];
  if (nestedDataMessageList.length > 0) {
    return nestedDataMessageList.join(" ");
  }

  return (
    getFirstString([
      payload.error,
      payload.detail,
      payload.path,
    ]) ?? fallbackMessage
  );
}

async function requestJson(path: string, token: string, init: RequestInit = {}) {
  let response: Response;
  const isFormDataPayload = typeof FormData !== "undefined" && init.body instanceof FormData;

  try {
    response = await fetch(buildUrl(path), {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(!isFormDataPayload && init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new PanelPortfolioApiError(
      `Não foi possível conectar com a API em ${PANEL_API_BASE_URL}. Verifique se o backend está ativo.`,
    );
  }

  const payload = await parseJsonSafe(response);

  return {
    response,
    payload,
  };
}

function normalizePortfolioMedia(payload: unknown): PanelPortfolioMediaRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const src = getFirstString([payload.src, payload.url, payload.href]);
  const type = getFirstString([payload.type]);
  const alt = getFirstString([payload.alt]);

  if (!src || !alt || (type !== "image" && type !== "video")) {
    return null;
  }

  return {
    type,
    src: resolveApiAssetUrl(PANEL_API_BASE_URL, src) ?? src,
    alt,
    caption: getFirstString([payload.caption]) ?? null,
    poster: resolveApiAssetUrl(PANEL_API_BASE_URL, getFirstString([payload.poster])),
    sortOrder: getFirstNumber([payload.sortOrder]) ?? 1,
  };
}

function normalizePortfolioStory(payload: unknown): PanelPortfolioStoryRecord | null {
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

function normalizePortfolioSummary(payload: unknown): PanelPortfolioSummaryRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id, payload._id, payload.uuid]);
  const name = getFirstString([payload.name]);
  const slug = getFirstString([payload.slug]);
  const client = getFirstString([payload.client]);
  const year = getFirstString([payload.year]);
  const sector = getFirstString([payload.sector]);
  const thumbnail = resolveApiAssetUrl(PANEL_API_BASE_URL, getFirstString([payload.thumbnail]));

  if (!id || !name || !slug || !client || !year || !sector || !thumbnail) {
    return null;
  }

  return {
    id,
    slug,
    name,
    client,
    year,
    sector,
    featured: getFirstBoolean([payload.featured]) ?? false,
    thumbnail,
    categories: extractStringArray(payload.categories),
    isPublished: getFirstBoolean([payload.isPublished]) ?? false,
    publishedAt: getFirstString([payload.publishedAt]) ?? null,
    createdAt: getFirstString([payload.createdAt]) ?? null,
    updatedAt: getFirstString([payload.updatedAt]) ?? null,
  };
}

function normalizePortfolioDetail(payload: unknown): PanelPortfolioDetailRecord | null {
  const summary = normalizePortfolioSummary(payload);

  if (!summary || !isRecord(payload)) {
    return null;
  }

  return {
    ...summary,
    overview: getFirstString([payload.overview]) ?? "",
    problemLabel: getFirstString([payload.problemLabel]) ?? "",
    solutionLabel: getFirstString([payload.solutionLabel]) ?? "",
    resultLabel: getFirstString([payload.resultLabel]) ?? "",
    scope: extractStringArray(payload.scope),
    media: Array.isArray(payload.media)
      ? payload.media
          .map((item) => normalizePortfolioMedia(item))
          .filter((item): item is PanelPortfolioMediaRecord => Boolean(item))
      : [],
    story: Array.isArray(payload.story)
      ? payload.story
          .map((item) => normalizePortfolioStory(item))
          .filter((item): item is PanelPortfolioStoryRecord => Boolean(item))
      : [],
    deletedAt: getFirstString([payload.deletedAt]) ?? null,
    createdByUserId: getFirstString([payload.createdByUserId]) ?? null,
    updatedByUserId: getFirstString([payload.updatedByUserId]) ?? null,
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

  const meta = isRecord(payload.meta)
    ? payload.meta
    : isRecord(payload.pagination)
      ? payload.pagination
      : isRecord(payload.data) && isRecord(payload.data.meta)
        ? payload.data.meta
        : null;

  const total =
    getFirstNumber([payload.total, payload.count, meta?.total, meta?.count]) ?? fallback.count;
  const page =
    getFirstNumber([payload.page, payload.currentPage, meta?.page, meta?.currentPage]) ?? fallback.page;
  const perPage =
    getFirstNumber([payload.perPage, payload.limit, payload.pageSize, meta?.limit, meta?.pageSize]) ??
    fallback.perPage;
  const totalPages =
    getFirstNumber([payload.totalPages, meta?.totalPages]) ?? Math.max(1, Math.ceil(total / perPage) || 1);

  return {
    page,
    perPage,
    total,
    totalPages,
  };
}

function buildPortfolioFormData(input: PanelPortfolioUpsertInput) {
  const formData = new FormData();
  const mediaFiles: File[] = [];
  const posterFiles: File[] = [];

  if (input.thumbnailFile) {
    formData.set("thumbnail", input.thumbnailFile);
  }

  const media = input.media.map((item, index) => {
    const normalizedItem: Record<string, unknown> = {
      type: item.type,
      alt: item.alt.trim(),
      sortOrder: item.sortOrder || index + 1,
    };

    if (item.caption?.trim()) {
      normalizedItem.caption = item.caption.trim();
    }

    if (item.file) {
      normalizedItem.fileIndex = mediaFiles.length;
      mediaFiles.push(item.file);
    } else if (item.src?.trim()) {
      normalizedItem.src = item.src.trim();
    }

    if (item.type === "video") {
      if (item.posterFile) {
        normalizedItem.posterFileIndex = posterFiles.length;
        posterFiles.push(item.posterFile);
      } else if (item.poster?.trim()) {
        normalizedItem.poster = item.poster.trim();
      }
    } else if (item.poster?.trim()) {
      normalizedItem.poster = item.poster.trim();
    }

    return normalizedItem;
  });

  const story = input.story.map((item, index) => ({
    title: item.title.trim(),
    text: item.text.trim(),
    sortOrder: item.sortOrder || index + 1,
  }));

  formData.set(
    "data",
    JSON.stringify({
      name: input.name.trim(),
      slug: input.slug.trim(),
      client: input.client.trim(),
      year: input.year.trim(),
      sector: input.sector.trim(),
      featured: input.featured,
      overview: input.overview.trim(),
      problemLabel: input.problemLabel.trim(),
      solutionLabel: input.solutionLabel.trim(),
      resultLabel: input.resultLabel.trim(),
      categories: input.categories,
      isPublished: input.isPublished,
      publishedAt: input.publishedAt || null,
      scope: input.scope,
      media,
      story,
    }),
  );

  for (const file of mediaFiles) {
    formData.append("mediaFiles", file);
  }

  for (const file of posterFiles) {
    formData.append("posterFiles", file);
  }

  return formData;
}

export async function listPanelPortfolio(token: string, filters: PanelPortfolioListFilters) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(filters.page));
  searchParams.set("limit", String(filters.perPage));

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim());
  }

  if (filters.featured === "featured") {
    searchParams.set("featured", "true");
  }

  if (filters.featured === "regular") {
    searchParams.set("featured", "false");
  }

  if (filters.published === "published") {
    searchParams.set("isPublished", "true");
  }

  if (filters.published === "draft") {
    searchParams.set("isPublished", "false");
  }

  if (filters.sort) {
    searchParams.set("sort", filters.sort);
  }

  const { response, payload } = await requestJson(`${PANEL_PORTFOLIO_PATH}?${searchParams.toString()}`, token);

  if (!response.ok) {
    throw new PanelPortfolioApiError(
      extractMessage(payload, "Não foi possível carregar a listagem de portfólios."),
      response.status,
    );
  }

  const sourceList =
    Array.isArray(payload)
      ? payload
      : isRecord(payload) && Array.isArray(payload.data)
        ? payload.data
        : [];

  const items = sourceList
    .map((item) => normalizePortfolioSummary(item))
    .filter((item): item is PanelPortfolioSummaryRecord => Boolean(item));

  return {
    items,
    ...extractPagination(payload, {
      page: filters.page,
      perPage: filters.perPage,
      count: items.length,
    }),
  } satisfies PanelPortfolioListResponse;
}

export async function getPanelPortfolioById(token: string, id: string) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_PORTFOLIO_DETAIL_PATH, id), token);

  if (!response.ok) {
    throw new PanelPortfolioApiError(
      extractMessage(payload, "Não foi possível carregar esse portfólio."),
      response.status,
    );
  }

  const detail = normalizePortfolioDetail(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!detail) {
    throw new PanelPortfolioApiError(
      "A API respondeu ao portfólio, mas o formato não foi reconhecido.",
      response.status,
    );
  }

  return detail;
}

export async function createPanelPortfolio(token: string, input: PanelPortfolioUpsertInput) {
  const { response, payload } = await requestJson(PANEL_PORTFOLIO_PATH, token, {
    method: "POST",
    body: buildPortfolioFormData(input),
  });

  if (!response.ok) {
    throw new PanelPortfolioApiError(
      extractMessage(payload, "Não foi possível criar esse portfólio."),
      response.status,
    );
  }

  const detail = normalizePortfolioDetail(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!detail) {
    throw new PanelPortfolioApiError("A API respondeu à criação, mas o portfólio retornado não foi reconhecido.");
  }

  return detail;
}

export async function updatePanelPortfolio(token: string, id: string, input: PanelPortfolioUpsertInput) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_PORTFOLIO_UPDATE_PATH, id), token, {
    method: "PATCH",
    body: buildPortfolioFormData(input),
  });

  if (!response.ok) {
    throw new PanelPortfolioApiError(
      extractMessage(payload, "Não foi possível salvar esse portfólio."),
      response.status,
    );
  }

  const detail = normalizePortfolioDetail(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!detail) {
    throw new PanelPortfolioApiError("A API respondeu à atualização, mas o portfólio retornado não foi reconhecido.");
  }

  return detail;
}

export async function deletePanelPortfolio(token: string, id: string) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_PORTFOLIO_DETAIL_PATH, id), token, {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 204) {
    throw new PanelPortfolioApiError(
      extractMessage(payload, "Não foi possível excluir esse portfólio."),
      response.status,
    );
  }
}

export async function setPanelPortfolioPublished(token: string, id: string, isPublished: boolean) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_PORTFOLIO_PUBLISH_PATH, id), token, {
    method: "PATCH",
    body: JSON.stringify({ isPublished }),
  });

  if (!response.ok) {
    throw new PanelPortfolioApiError(
      extractMessage(payload, "Não foi possível atualizar a publicação desse portfólio."),
      response.status,
    );
  }

  const detail = normalizePortfolioDetail(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!detail) {
    throw new PanelPortfolioApiError("A API respondeu à publicação, mas o portfólio retornado não foi reconhecido.");
  }

  return detail;
}

export async function setPanelPortfolioFeatured(token: string, id: string, featured: boolean) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_PORTFOLIO_FEATURE_PATH, id), token, {
    method: "PATCH",
    body: JSON.stringify({ featured }),
  });

  if (!response.ok) {
    throw new PanelPortfolioApiError(
      extractMessage(payload, "Não foi possível atualizar o destaque desse portfólio."),
      response.status,
    );
  }

  const detail = normalizePortfolioDetail(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!detail) {
    throw new PanelPortfolioApiError("A API respondeu ao destaque, mas o portfólio retornado não foi reconhecido.");
  }

  return detail;
}
