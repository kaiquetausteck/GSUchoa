const PANEL_API_BASE_URL = (import.meta.env.VITE_PANEL_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

const PANEL_TESTIMONIALS_PATH =
  import.meta.env.VITE_PANEL_ADMIN_TESTIMONIALS_PATH ?? "/admin/testimonials";
const PANEL_TESTIMONIAL_DETAIL_PATH =
  import.meta.env.VITE_PANEL_ADMIN_TESTIMONIAL_DETAIL_PATH ?? "/admin/testimonials/:id";
const PANEL_TESTIMONIAL_PUBLISH_PATH =
  import.meta.env.VITE_PANEL_ADMIN_TESTIMONIAL_PUBLISH_PATH ?? "/admin/testimonials/:id/publish";
const PANEL_TESTIMONIAL_FEATURE_PATH =
  import.meta.env.VITE_PANEL_ADMIN_TESTIMONIAL_FEATURE_PATH ?? "/admin/testimonials/:id/feature";

export type PanelTestimonialSort =
  | "sortOrder-asc"
  | "sortOrder-desc"
  | "createdAt-desc"
  | "createdAt-asc"
  | "publishedAt-desc"
  | "publishedAt-asc";

export type PanelTestimonialSummaryRecord = {
  id: string;
  brand: string;
  authorName: string;
  authorRole: string;
  message: string;
  rating: number;
  featured: boolean;
  highlightValue: string | null;
  highlightLabel: string | null;
  sortOrder: number;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PanelTestimonialDetailRecord = PanelTestimonialSummaryRecord & {
  deletedAt: string | null;
  createdByUserId: string | null;
  updatedByUserId: string | null;
};

export type PanelTestimonialListFilters = {
  page: number;
  perPage: number;
  search?: string;
  featured?: "all" | "featured" | "regular";
  published?: "all" | "published" | "draft";
  sort?: PanelTestimonialSort;
};

export type PanelTestimonialListResponse = {
  items: PanelTestimonialSummaryRecord[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type PanelTestimonialUpsertInput = {
  brand: string;
  authorName: string;
  authorRole: string;
  message: string;
  rating: number;
  featured: boolean;
  highlightValue?: string | null;
  highlightLabel?: string | null;
  sortOrder: number;
  isPublished: boolean;
  publishedAt?: string | null;
};

type JsonRecord = Record<string, unknown>;

class PanelTestimonialsApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PanelTestimonialsApiError";
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

    if (typeof value === "number") {
      return value !== 0;
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
    return payload;
  }

  if (!isRecord(payload)) {
    return fallbackMessage;
  }

  const directMessageList = extractStringList(payload.message);
  if (directMessageList.length > 0) {
    return directMessageList.join(" ");
  }

  return getFirstString([payload.error, payload.detail, payload.path]) ?? fallbackMessage;
}

async function requestJson(path: string, token: string, init?: RequestInit) {
  const isJsonPayload =
    init?.body !== undefined &&
    typeof init.body === "string" &&
    !(init.headers instanceof Headers);

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(isJsonPayload ? { "Content-Type": "application/json" } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new PanelTestimonialsApiError(
      `Nao foi possivel conectar com a API em ${PANEL_API_BASE_URL}. Verifique se o backend esta ativo.`,
    );
  }

  const payload = await parseJsonSafe(response);

  return {
    response,
    payload,
  };
}

function normalizePanelTestimonialRecord(payload: unknown): PanelTestimonialDetailRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id]);
  const brand = getFirstString([payload.brand]);
  const authorName = getFirstString([payload.authorName]);
  const authorRole = getFirstString([payload.authorRole]);
  const message = getFirstString([payload.message]);
  const rating = getFirstNumber([payload.rating]);
  const featured = getFirstBoolean([payload.featured]);
  const sortOrder = getFirstNumber([payload.sortOrder]);
  const isPublished = getFirstBoolean([payload.isPublished]);

  if (
    !id ||
    !brand ||
    !authorName ||
    !authorRole ||
    !message ||
    rating === null ||
    featured === null ||
    sortOrder === null ||
    isPublished === null
  ) {
    return null;
  }

  return {
    id,
    brand,
    authorName,
    authorRole,
    message,
    rating,
    featured,
    highlightLabel: getFirstString([payload.highlightLabel]),
    highlightValue: getFirstString([payload.highlightValue]),
    sortOrder,
    isPublished,
    publishedAt: getFirstString([payload.publishedAt]),
    createdAt: getFirstString([payload.createdAt]),
    updatedAt: getFirstString([payload.updatedAt]),
    deletedAt: getFirstString([payload.deletedAt]),
    createdByUserId: getFirstString([payload.createdByUserId]),
    updatedByUserId: getFirstString([payload.updatedByUserId]),
  };
}

function toSummaryRecord(item: PanelTestimonialDetailRecord): PanelTestimonialSummaryRecord {
  const {
    deletedAt: _deletedAt,
    createdByUserId: _createdByUserId,
    updatedByUserId: _updatedByUserId,
    ...summary
  } = item;

  return summary;
}

function normalizeListPayload(payload: unknown): PanelTestimonialListResponse {
  const root = isRecord(payload) ? payload : null;
  const itemsRaw = Array.isArray(root?.data) ? root.data : Array.isArray(payload) ? payload : [];
  const meta = isRecord(root?.meta) ? root.meta : null;

  const items = itemsRaw
    .map((item) => normalizePanelTestimonialRecord(item))
    .filter((item): item is PanelTestimonialDetailRecord => item !== null)
    .map((item) => toSummaryRecord(item));

  const page = getFirstNumber([meta?.page]) ?? 1;
  const perPage = getFirstNumber([meta?.limit, meta?.perPage]) ?? (items.length || 10);
  const total = getFirstNumber([meta?.total]) ?? items.length;
  const totalPages = getFirstNumber([meta?.totalPages]) ?? Math.max(1, Math.ceil(total / Math.max(perPage, 1)));

  return {
    items,
    page,
    perPage,
    total,
    totalPages,
  };
}

function buildTestimonialPayload(input: PanelTestimonialUpsertInput) {
  return JSON.stringify({
    authorName: input.authorName.trim(),
    authorRole: input.authorRole.trim(),
    brand: input.brand.trim(),
    featured: input.featured,
    highlightLabel: input.highlightLabel?.trim() || null,
    highlightValue: input.highlightValue?.trim() || null,
    isPublished: input.isPublished,
    message: input.message.trim(),
    publishedAt: input.publishedAt || null,
    rating: input.rating,
    sortOrder: input.sortOrder,
  });
}

export async function listPanelTestimonials(token: string, filters: PanelTestimonialListFilters) {
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

  const { response, payload } = await requestJson(
    `${PANEL_TESTIMONIALS_PATH}?${searchParams.toString()}`,
    token,
  );

  if (!response.ok) {
    throw new PanelTestimonialsApiError(
      extractMessage(payload, "Nao foi possivel carregar a listagem de depoimentos."),
      response.status,
    );
  }

  return normalizeListPayload(payload);
}

export async function getPanelTestimonialById(token: string, id: string) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_TESTIMONIAL_DETAIL_PATH, id), token);

  if (!response.ok) {
    throw new PanelTestimonialsApiError(
      extractMessage(payload, "Nao foi possivel carregar esse depoimento."),
      response.status,
    );
  }

  const item = normalizePanelTestimonialRecord(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!item) {
    throw new PanelTestimonialsApiError(
      "A API respondeu ao depoimento, mas o formato nao foi reconhecido.",
    );
  }

  return item;
}

export async function createPanelTestimonial(token: string, input: PanelTestimonialUpsertInput) {
  const { response, payload } = await requestJson(PANEL_TESTIMONIALS_PATH, token, {
    method: "POST",
    body: buildTestimonialPayload(input),
  });

  if (!response.ok) {
    throw new PanelTestimonialsApiError(
      extractMessage(payload, "Nao foi possivel criar esse depoimento."),
      response.status,
    );
  }

  const item = normalizePanelTestimonialRecord(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!item) {
    throw new PanelTestimonialsApiError(
      "A API respondeu ao create, mas o depoimento retornado nao foi reconhecido.",
    );
  }

  return item;
}

export async function updatePanelTestimonial(token: string, id: string, input: PanelTestimonialUpsertInput) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_TESTIMONIAL_DETAIL_PATH, id), token, {
    method: "PATCH",
    body: buildTestimonialPayload(input),
  });

  if (!response.ok) {
    throw new PanelTestimonialsApiError(
      extractMessage(payload, "Nao foi possivel salvar esse depoimento."),
      response.status,
    );
  }

  const item = normalizePanelTestimonialRecord(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!item) {
    throw new PanelTestimonialsApiError(
      "A API respondeu ao update, mas o depoimento retornado nao foi reconhecido.",
    );
  }

  return item;
}

export async function deletePanelTestimonial(token: string, id: string) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_TESTIMONIAL_DETAIL_PATH, id), token, {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 204) {
    throw new PanelTestimonialsApiError(
      extractMessage(payload, "Nao foi possivel excluir esse depoimento."),
      response.status,
    );
  }
}

export async function setPanelTestimonialPublished(token: string, id: string, isPublished: boolean) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_TESTIMONIAL_PUBLISH_PATH, id), token, {
    method: "PATCH",
    body: JSON.stringify({
      isPublished,
      publishedAt: isPublished ? new Date().toISOString() : null,
    }),
  });

  if (!response.ok) {
    throw new PanelTestimonialsApiError(
      extractMessage(payload, "Nao foi possivel atualizar a publicacao desse depoimento."),
      response.status,
    );
  }

  const item = normalizePanelTestimonialRecord(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!item) {
    throw new PanelTestimonialsApiError(
      "A API respondeu ao publish, mas o depoimento retornado nao foi reconhecido.",
    );
  }

  return item;
}

export async function setPanelTestimonialFeatured(token: string, id: string, featured: boolean) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_TESTIMONIAL_FEATURE_PATH, id), token, {
    method: "PATCH",
    body: JSON.stringify({ featured }),
  });

  if (!response.ok) {
    throw new PanelTestimonialsApiError(
      extractMessage(payload, "Nao foi possivel atualizar o destaque desse depoimento."),
      response.status,
    );
  }

  const item = normalizePanelTestimonialRecord(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!item) {
    throw new PanelTestimonialsApiError(
      "A API respondeu ao destaque, mas o depoimento retornado nao foi reconhecido.",
    );
  }

  return item;
}
