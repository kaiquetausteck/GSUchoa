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
  | "name-asc"
  | "name-desc"
  | "sortOrder-asc"
  | "sortOrder-desc"
  | "createdAt-desc"
  | "createdAt-asc"
  | "publishedAt-desc"
  | "publishedAt-asc";

export type PanelClientStatus = "active" | "onboarding" | "paused" | "inactive" | "archived";
export type PanelClientAccessModule = "paid_media" | "social_media";
export type PanelClientAccessPlatform = "META" | "GOOGLE" | "LINKEDIN";

export type PanelClientAccessResourceRecord = {
  id: string;
  clientId: string;
  module: PanelClientAccessModule;
  platform: PanelClientAccessPlatform;
  externalId: string;
  name: string;
  pictureUrl: string | null;
  metadata: unknown;
};

export type PanelClientPermissionRecord = {
  id: string;
  clientId: string;
  userId: string;
  canEdit: boolean;
  canViewSocialMedia: boolean;
  canViewPaidMedia: boolean;
  canViewMeta: boolean;
  canViewGoogle: boolean;
  canViewLinkedin: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string | null;
    isActive: boolean;
  };
  resources: PanelClientAccessResourceRecord[];
};

export type PanelClientSummaryRecord = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
  description: string | null;
  status: PanelClientStatus;
  socialMediaEnabled: boolean;
  paidMediaEnabled: boolean;
  metaEnabled: boolean;
  googleEnabled: boolean;
  linkedinEnabled: boolean;
  permissionsCount: number;
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
  permissions: PanelClientPermissionRecord[];
  resources: PanelClientAccessResourceRecord[];
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
  status: PanelClientStatus;
  socialMediaEnabled: boolean;
  paidMediaEnabled: boolean;
  metaEnabled: boolean;
  googleEnabled: boolean;
  linkedinEnabled: boolean;
  permissions?: Array<{
    userId: string;
    canEdit: boolean;
    canViewSocialMedia: boolean;
    canViewPaidMedia: boolean;
    canViewMeta: boolean;
    canViewGoogle: boolean;
    canViewLinkedin: boolean;
    resources?: Array<{
      module: PanelClientAccessModule;
      platform: PanelClientAccessPlatform;
      externalId: string;
      name: string;
      pictureUrl?: string | null;
      metadata?: Record<string, unknown> | null;
    }>;
  }>;
  resources?: Array<{
    module: PanelClientAccessModule;
    platform: PanelClientAccessPlatform;
    externalId: string;
    name: string;
    pictureUrl?: string | null;
    metadata?: Record<string, unknown> | null;
  }>;
  featured: boolean;
  sortOrder: number;
  isPublished: boolean;
  publishedAt?: string | null;
  logoFile?: File | null;
  removeLogo?: boolean;
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

function normalizeClientStatus(value: unknown): PanelClientStatus {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (["onboarding", "paused", "inactive", "archived"].includes(normalized)) {
    return normalized as PanelClientStatus;
  }

  return "active";
}

function normalizePanelClientPermission(payload: unknown): PanelClientPermissionRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const user = isRecord(payload.user) ? payload.user : null;
  const userId = getFirstString([payload.userId, user?.id]);
  const userName = getFirstString([user?.name, user?.email]);

  if (!userId || !userName) {
    return null;
  }

  const resourcesRaw = Array.isArray(payload.resources) ? payload.resources : [];

  return {
    id: getFirstString([payload.id]) ?? `${getFirstString([payload.clientId]) ?? "client"}-${userId}`,
    clientId: getFirstString([payload.clientId]) ?? "",
    userId,
    canEdit: getFirstBoolean([payload.canEdit]) ?? false,
    canViewSocialMedia: getFirstBoolean([payload.canViewSocialMedia]) ?? true,
    canViewPaidMedia: getFirstBoolean([payload.canViewPaidMedia]) ?? true,
    canViewMeta: getFirstBoolean([payload.canViewMeta]) ?? true,
    canViewGoogle: getFirstBoolean([payload.canViewGoogle]) ?? false,
    canViewLinkedin: getFirstBoolean([payload.canViewLinkedin]) ?? false,
    createdAt: getFirstString([payload.createdAt]),
    updatedAt: getFirstString([payload.updatedAt]),
    user: {
      id: userId,
      name: userName,
      email: getFirstString([user?.email]) ?? "",
      role: getFirstString([user?.role]) ?? "editor",
      avatarUrl: normalizeLogoUrl(user?.avatarUrl) ?? null,
      isActive: getFirstBoolean([user?.isActive]) ?? true,
    },
    resources: resourcesRaw
      .map((resource) => normalizePanelClientAccessResource(resource))
      .filter((resource): resource is PanelClientAccessResourceRecord => resource !== null),
  };
}

function normalizeClientAccessModule(value: unknown): PanelClientAccessModule | null {
  return value === "paid_media" || value === "social_media" ? value : null;
}

function normalizeClientAccessPlatform(value: unknown): PanelClientAccessPlatform | null {
  return value === "META" || value === "GOOGLE" || value === "LINKEDIN" ? value : null;
}

function normalizePanelClientAccessResource(payload: unknown): PanelClientAccessResourceRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id]);
  const clientId = getFirstString([payload.clientId]);
  const module = normalizeClientAccessModule(payload.module);
  const platform = normalizeClientAccessPlatform(payload.platform);
  const externalId = getFirstString([payload.externalId]);
  const name = getFirstString([payload.name]);

  if (!id || !clientId || !module || !platform || !externalId || !name) {
    return null;
  }

  return {
    id,
    clientId,
    module,
    platform,
    externalId,
    name,
    pictureUrl: normalizeLogoUrl(payload.pictureUrl) ?? null,
    metadata: payload.metadata ?? null,
  };
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
      `Não foi possível conectar com a API em ${PANEL_API_BASE_URL}. Verifique se o backend está ativo.`,
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
  const permissionsRaw = Array.isArray(payload.permissions) ? payload.permissions : [];
  const resourcesRaw = Array.isArray(payload.resources) ? payload.resources : [];

  if (!id || !name || !slug || featured === null || sortOrder === null || isPublished === null) {
    return null;
  }

  return {
    id,
    name,
    slug,
    logoUrl,
    website: getFirstString([payload.website]),
    description: getFirstString([payload.description]),
    status: normalizeClientStatus(payload.status),
    socialMediaEnabled: getFirstBoolean([payload.socialMediaEnabled]) ?? false,
    paidMediaEnabled: getFirstBoolean([payload.paidMediaEnabled]) ?? false,
    metaEnabled: getFirstBoolean([payload.metaEnabled]) ?? false,
    googleEnabled: getFirstBoolean([payload.googleEnabled]) ?? false,
    linkedinEnabled: getFirstBoolean([payload.linkedinEnabled]) ?? false,
    permissionsCount: getFirstNumber([payload.permissionsCount, isRecord(payload._count) ? payload._count.permissions : null]) ?? permissionsRaw.length,
    featured,
    sortOrder,
    isPublished,
    publishedAt: getFirstString([payload.publishedAt]),
    createdAt: getFirstString([payload.createdAt]),
    updatedAt: getFirstString([payload.updatedAt]),
    deletedAt: getFirstString([payload.deletedAt]),
    createdByUserId: getFirstString([payload.createdByUserId]),
    updatedByUserId: getFirstString([payload.updatedByUserId]),
    permissions: permissionsRaw
      .map((permission) => normalizePanelClientPermission(permission))
      .filter((permission): permission is PanelClientPermissionRecord => permission !== null),
    resources: resourcesRaw
      .map((resource) => normalizePanelClientAccessResource(resource))
      .filter((resource): resource is PanelClientAccessResourceRecord => resource !== null),
  };
}

function toSummaryRecord(item: PanelClientDetailRecord): PanelClientSummaryRecord {
  const {
    deletedAt: _deletedAt,
    createdByUserId: _createdByUserId,
    updatedByUserId: _updatedByUserId,
    permissions: _permissions,
    resources: _resources,
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
  formData.set("status", input.status);
  formData.set("socialMediaEnabled", String(input.socialMediaEnabled));
  formData.set("paidMediaEnabled", String(input.paidMediaEnabled));
  formData.set("metaEnabled", String(input.metaEnabled));
  formData.set("googleEnabled", String(input.googleEnabled));
  formData.set("linkedinEnabled", String(input.linkedinEnabled));
  formData.set("featured", String(input.featured));
  formData.set("sortOrder", String(input.sortOrder));
  formData.set("isPublished", String(input.isPublished));

  if (input.website !== undefined) {
    formData.set("website", input.website?.trim() ?? "");
  }

  if (input.description !== undefined) {
    formData.set("description", input.description?.trim() ?? "");
  }

  if (input.publishedAt) {
    formData.set("publishedAt", input.publishedAt);
  }

  if (input.logoFile) {
    formData.set("logo", input.logoFile);
  }

  if (input.removeLogo) {
    formData.set("removeLogo", "true");
  }

  if (input.permissions) {
    formData.set("permissions", JSON.stringify(input.permissions));
  }

  if (input.resources) {
    formData.set("resources", JSON.stringify(input.resources));
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
      extractMessage(payload, "Não foi possível carregar a listagem de clientes."),
      response.status,
    );
  }

  return normalizeListPayload(payload);
}

export async function getPanelClientById(token: string, id: string) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_CLIENT_DETAIL_PATH, id), token);

  if (!response.ok) {
    throw new PanelClientsApiError(
      extractMessage(payload, "Não foi possível carregar esse cliente."),
      response.status,
    );
  }

  const item = normalizePanelClientRecord(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!item) {
    throw new PanelClientsApiError(
      "A API respondeu ao cliente, mas o formato não foi reconhecido.",
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
      extractMessage(payload, "Não foi possível criar esse cliente."),
      response.status,
    );
  }

  const item = normalizePanelClientRecord(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!item) {
    throw new PanelClientsApiError(
      "A API respondeu à criação, mas o cliente retornado não foi reconhecido.",
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
      extractMessage(payload, "Não foi possível salvar esse cliente."),
      response.status,
    );
  }

  const item = normalizePanelClientRecord(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!item) {
    throw new PanelClientsApiError(
      "A API respondeu à atualização, mas o cliente retornado não foi reconhecido.",
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
      extractMessage(payload, "Não foi possível excluir esse cliente."),
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
      extractMessage(payload, "Não foi possível atualizar a publicação desse cliente."),
      response.status,
    );
  }

  const item = normalizePanelClientRecord(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!item) {
    throw new PanelClientsApiError(
      "A API respondeu à publicação, mas o cliente retornado não foi reconhecido.",
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
      extractMessage(payload, "Não foi possível atualizar o destaque desse cliente."),
      response.status,
    );
  }

  const item = normalizePanelClientRecord(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!item) {
    throw new PanelClientsApiError(
      "A API respondeu ao destaque, mas o cliente retornado não foi reconhecido.",
    );
  }

  return item;
}
