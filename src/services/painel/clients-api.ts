import { resolveApiAssetUrl } from "./resolve-api-asset-url";

const PANEL_API_BASE_URL = (import.meta.env.VITE_PANEL_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

const PANEL_CLIENTS_PATH = import.meta.env.VITE_PANEL_ADMIN_CLIENTS_PATH ?? "/admin/clients";
const PANEL_CLIENT_DETAIL_PATH =
  import.meta.env.VITE_PANEL_ADMIN_CLIENT_DETAIL_PATH ?? "/admin/clients/:id";
const PANEL_CLIENT_UPDATE_PATH =
  import.meta.env.VITE_PANEL_ADMIN_CLIENT_UPDATE_PATH ?? PANEL_CLIENT_DETAIL_PATH;
const PANEL_CLIENT_PUBLISH_PATH =
  import.meta.env.VITE_PANEL_ADMIN_CLIENT_PUBLISH_PATH ?? "/admin/clients/:id/publish";
const PANEL_CLIENT_FEATURE_PATH =
  import.meta.env.VITE_PANEL_ADMIN_CLIENT_FEATURE_PATH ?? "/admin/clients/:id/feature";

export type PanelClientSort =
  | "sortOrder-asc"
  | "sortOrder-desc"
  | "createdAt-desc"
  | "createdAt-asc"
  | "publishedAt-desc"
  | "publishedAt-asc";

export type PanelClientSummaryRecord = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  website: string | null;
  description: string | null;
  featured: boolean;
  sortOrder: number;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PanelClientDetailRecord = PanelClientSummaryRecord & {
  deletedAt: string | null;
  createdByUserId: string | null;
  updatedByUserId: string | null;
};

export type PanelClientListFilters = {
  page: number;
  perPage: number;
  search?: string;
  featured?: "all" | "featured" | "regular";
  published?: "all" | "published" | "draft";
  sort?: PanelClientSort;
};

export type PanelClientListResponse = {
  items: PanelClientSummaryRecord[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type PanelClientUpsertInput = {
  name: string;
  slug: string;
  website?: string | null;
  description?: string | null;
  featured: boolean;
  sortOrder: number;
  isPublished: boolean;
  publishedAt?: string | null;
  logoFile?: File | null;
};

type JsonRecord = Record<string, unknown>;

class PanelClientsApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PanelClientsApiError";
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
    throw new PanelClientsApiError(
      `Nao foi possivel conectar com a API em ${PANEL_API_BASE_URL}. Verifique se o backend esta ativo.`,
    );
  }

  const payload = await parseJsonSafe(response);

  return {
    response,
    payload,
  };
}

function normalizeLogoUrl(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return resolveApiAssetUrl(PANEL_API_BASE_URL, value);
  }

  if (!isRecord(value)) {
    return null;
  }

  return resolveApiAssetUrl(PANEL_API_BASE_URL, getFirstString([
    value.url,
    value.href,
    value.path,
    value.location,
    value.secure_url,
  ]));
}

function normalizePanelClientRecord(payload: unknown): PanelClientDetailRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id]);
  const name = getFirstString([payload.name]);
  const slug = getFirstString([payload.slug]);
  const logoUrl = normalizeLogoUrl(payload.logoUrl ?? payload.logo ?? payload.image);
  const featured = getFirstBoolean([payload.featured]);
  const sortOrder = getFirstNumber([payload.sortOrder]);
  const isPublished = getFirstBoolean([payload.isPublished]);

  if (!id || !name || !slug || !logoUrl || featured === null || sortOrder === null || isPublished === null) {
    return null;
  }

  return {
    id,
    name,
    slug,
    logoUrl,
    website: getFirstString([payload.website]),
    description: getFirstString([payload.description]),
    featured,
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

function toSummaryRecord(item: PanelClientDetailRecord): PanelClientSummaryRecord {
  const {
    deletedAt: _deletedAt,
    createdByUserId: _createdByUserId,
    updatedByUserId: _updatedByUserId,
    ...summary
  } = item;

  return summary;
}

function normalizeListPayload(payload: unknown): PanelClientListResponse {
  const root = isRecord(payload) ? payload : null;
  const itemsRaw = Array.isArray(root?.data) ? root.data : Array.isArray(payload) ? payload : [];
  const meta = isRecord(root?.meta) ? root.meta : null;

  const items = itemsRaw
    .map((item) => normalizePanelClientRecord(item))
    .filter((item): item is PanelClientDetailRecord => item !== null)
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

function buildClientFormData(input: PanelClientUpsertInput) {
  const formData = new FormData();
  formData.set("name", input.name.trim());
  formData.set("slug", input.slug.trim());
  formData.set("featured", String(input.featured));
  formData.set("sortOrder", String(input.sortOrder));
  formData.set("isPublished", String(input.isPublished));

  if (input.website?.trim()) {
    formData.set("website", input.website.trim());
  }

  if (input.description?.trim()) {
    formData.set("description", input.description.trim());
  }

  if (input.publishedAt) {
    formData.set("publishedAt", input.publishedAt);
  }

  if (input.logoFile) {
    formData.set("logo", input.logoFile);
  }

  return formData;
}

export async function listPanelClients(token: string, filters: PanelClientListFilters) {
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
    `${PANEL_CLIENTS_PATH}?${searchParams.toString()}`,
    token,
  );

  if (!response.ok) {
    throw new PanelClientsApiError(
      extractMessage(payload, "Nao foi possivel carregar a listagem de clientes."),
      response.status,
    );
  }

  return normalizeListPayload(payload);
}

export async function getPanelClientById(token: string, id: string) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_CLIENT_DETAIL_PATH, id), token);

  if (!response.ok) {
    throw new PanelClientsApiError(
      extractMessage(payload, "Nao foi possivel carregar esse cliente."),
      response.status,
    );
  }

  const item = normalizePanelClientRecord(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!item) {
    throw new PanelClientsApiError(
      "A API respondeu ao cliente, mas o formato nao foi reconhecido.",
    );
  }

  return item;
}

export async function createPanelClient(token: string, input: PanelClientUpsertInput) {
  const { response, payload } = await requestJson(PANEL_CLIENTS_PATH, token, {
    method: "POST",
    body: buildClientFormData(input),
  });

  if (!response.ok) {
    throw new PanelClientsApiError(
      extractMessage(payload, "Nao foi possivel criar esse cliente."),
      response.status,
    );
  }

  const item = normalizePanelClientRecord(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!item) {
    throw new PanelClientsApiError(
      "A API respondeu ao create, mas o cliente retornado nao foi reconhecido.",
    );
  }

  return item;
}

export async function updatePanelClient(token: string, id: string, input: PanelClientUpsertInput) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_CLIENT_UPDATE_PATH, id), token, {
    method: "PATCH",
    body: buildClientFormData(input),
  });

  if (!response.ok) {
    throw new PanelClientsApiError(
      extractMessage(payload, "Nao foi possivel salvar esse cliente."),
      response.status,
    );
  }

  const item = normalizePanelClientRecord(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!item) {
    throw new PanelClientsApiError(
      "A API respondeu ao update, mas o cliente retornado nao foi reconhecido.",
    );
  }

  return item;
}

export async function deletePanelClient(token: string, id: string) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_CLIENT_DETAIL_PATH, id), token, {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 204) {
    throw new PanelClientsApiError(
      extractMessage(payload, "Nao foi possivel excluir esse cliente."),
      response.status,
    );
  }
}

export async function setPanelClientPublished(token: string, id: string, isPublished: boolean) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_CLIENT_PUBLISH_PATH, id), token, {
    method: "PATCH",
    body: JSON.stringify({
      isPublished,
      publishedAt: isPublished ? new Date().toISOString() : null,
    }),
  });

  if (!response.ok) {
    throw new PanelClientsApiError(
      extractMessage(payload, "Nao foi possivel atualizar a publicacao desse cliente."),
      response.status,
    );
  }

  const item = normalizePanelClientRecord(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!item) {
    throw new PanelClientsApiError(
      "A API respondeu ao publish, mas o cliente retornado nao foi reconhecido.",
    );
  }

  return item;
}

export async function setPanelClientFeatured(token: string, id: string, featured: boolean) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_CLIENT_FEATURE_PATH, id), token, {
    method: "PATCH",
    body: JSON.stringify({ featured }),
  });

  if (!response.ok) {
    throw new PanelClientsApiError(
      extractMessage(payload, "Nao foi possivel atualizar o destaque desse cliente."),
      response.status,
    );
  }

  const item = normalizePanelClientRecord(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!item) {
    throw new PanelClientsApiError(
      "A API respondeu ao destaque, mas o cliente retornado nao foi reconhecido.",
    );
  }

  return item;
}
