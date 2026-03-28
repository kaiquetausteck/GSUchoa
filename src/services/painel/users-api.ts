import { resolveApiAssetUrl } from "./resolve-api-asset-url";

const PANEL_API_BASE_URL = (import.meta.env.VITE_PANEL_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

const PANEL_USERS_PATH = import.meta.env.VITE_PANEL_USERS_PATH ?? "/users";
const PANEL_USER_DETAIL_PATH = import.meta.env.VITE_PANEL_USER_DETAIL_PATH ?? "/users/:id";
const PANEL_USER_UPDATE_PATH = import.meta.env.VITE_PANEL_USER_UPDATE_PATH ?? PANEL_USER_DETAIL_PATH;
const PANEL_USER_CREATE_PATH = import.meta.env.VITE_PANEL_USER_CREATE_PATH ?? PANEL_USERS_PATH;
const PANEL_USER_DELETE_PATH = import.meta.env.VITE_PANEL_USER_DELETE_PATH ?? PANEL_USER_DETAIL_PATH;

export type PanelUserStatus = "active" | "inactive";

export type PanelUserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  status: PanelUserStatus;
  avatarUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PanelUsersFilters = {
  page: number;
  perPage: number;
  search?: string;
  status?: "all" | PanelUserStatus;
};

export type PanelUsersListResponse = {
  items: PanelUserRecord[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type UpdatePanelUserInput = {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarFile?: File | null;
};

export type CreatePanelUserInput = {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  avatarFile?: File | null;
};

type JsonRecord = Record<string, unknown>;

class PanelUsersApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PanelUsersApiError";
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

function extractAvatarUrl(value: unknown): string | null {
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
    throw new PanelUsersApiError(
      `Nao foi possivel conectar com a API em ${PANEL_API_BASE_URL}. Verifique se o backend esta ativo.`,
    );
  }

  const payload = await parseJsonSafe(response);

  return {
    response,
    payload,
  };
}

function normalizeStatus(value: unknown): PanelUserStatus {
  if (typeof value === "boolean") {
    return value ? "active" : "inactive";
  }

  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (["active", "ativo", "enabled", "true", "1"].includes(normalized)) {
    return "active";
  }

  return "inactive";
}

function normalizePanelUserRecord(payload: unknown): PanelUserRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const email = getFirstString([payload.email, payload.login]);
  const name = getFirstString([payload.name, payload.fullName, payload.full_name, payload.username]);

  if (!email && !name) {
    return null;
  }

  const status = normalizeStatus(payload.isActive ?? payload.active ?? payload.status ?? payload.enabled);

  return {
    id: getFirstString([payload.id, payload._id, payload.uuid, payload.userId]) ?? email ?? name ?? "user",
    name: name ?? email ?? "Usuario",
    email: email ?? "",
    role: getFirstString([payload.role, payload.profile, payload.type, payload.permission]) ?? "admin",
    isActive: status === "active",
    status,
    avatarUrl:
      extractAvatarUrl(payload.avatarUrl) ??
      resolveApiAssetUrl(
        PANEL_API_BASE_URL,
        getFirstString([payload.avatar_url, payload.image, payload.photo, payload.picture]),
      ) ??
      null,
    createdAt: getFirstString([payload.createdAt, payload.created_at, payload.insertedAt]) ?? null,
    updatedAt: getFirstString([payload.updatedAt, payload.updated_at, payload.lastAccessAt, payload.last_access_at]) ?? null,
  };
}

function extractUserCollection(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  const candidates = [
    payload.items,
    payload.users,
    payload.results,
    payload.data,
    isRecord(payload.data) ? payload.data.items : null,
    isRecord(payload.data) ? payload.data.users : null,
    isRecord(payload.data) ? payload.data.results : null,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
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
        : isRecord(payload.data) && isRecord(payload.data.pagination)
          ? payload.data.pagination
          : null;

  const total =
    getFirstNumber([
      payload.total,
      payload.totalCount,
      payload.count,
      meta?.total,
      meta?.totalCount,
      meta?.count,
    ]) ?? fallback.count;
  const page =
    getFirstNumber([
      payload.page,
      payload.currentPage,
      meta?.page,
      meta?.currentPage,
    ]) ?? fallback.page;
  const perPage =
    getFirstNumber([
      payload.perPage,
      payload.pageSize,
      payload.limit,
      meta?.perPage,
      meta?.pageSize,
      meta?.limit,
    ]) ?? fallback.perPage;
  const totalPages =
    getFirstNumber([
      payload.totalPages,
      meta?.totalPages,
    ]) ?? Math.max(1, Math.ceil(total / perPage) || 1);

  return {
    page,
    perPage,
    total,
    totalPages,
  };
}

export async function listPanelUsers(token: string, filters: PanelUsersFilters) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(filters.page));
  searchParams.set("limit", String(filters.perPage));
  searchParams.set("role", "admin");

  if (filters.search) {
    searchParams.set("search", filters.search);
  }

  if (filters.status === "active") {
    searchParams.set("isActive", "true");
  }

  if (filters.status === "inactive") {
    searchParams.set("isActive", "false");
  }

  const { response, payload } = await requestJson(`${PANEL_USERS_PATH}?${searchParams.toString()}`, token);

  if (!response.ok) {
    throw new PanelUsersApiError(
      extractMessage(payload, "Nao foi possivel carregar a listagem de usuarios."),
      response.status,
    );
  }

  const items = extractUserCollection(payload)
    .map((item) => normalizePanelUserRecord(item))
    .filter((item): item is PanelUserRecord => Boolean(item));
  const pagination = extractPagination(payload, {
    page: filters.page,
    perPage: filters.perPage,
    count: items.length,
  });

  return {
    items,
    ...pagination,
  } satisfies PanelUsersListResponse;
}

export async function getPanelUserById(token: string, id: string) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_USER_DETAIL_PATH, id), token);

  if (!response.ok) {
    throw new PanelUsersApiError(
      extractMessage(payload, "Nao foi possivel carregar esse usuario."),
      response.status,
    );
  }

  const user = normalizePanelUserRecord(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!user) {
    throw new PanelUsersApiError("A API respondeu, mas o formato do usuario nao foi reconhecido.", response.status);
  }

  return user;
}

export async function updatePanelUser(token: string, input: UpdatePanelUserInput) {
  const formData = new FormData();
  formData.set("name", input.name.trim());
  formData.set("email", input.email.trim());
  formData.set("role", "admin");

  if (input.password?.trim()) {
    formData.set("password", input.password.trim());
  }

  if (input.avatarFile) {
    formData.set("avatar", input.avatarFile);
  }

  const { response, payload } = await requestJson(buildPathWithId(PANEL_USER_UPDATE_PATH, input.id), token, {
    method: "PATCH",
    body: formData,
  });

  if (!response.ok) {
    throw new PanelUsersApiError(
      extractMessage(payload, "Nao foi possivel salvar esse usuario."),
      response.status,
    );
  }

  const updatedUser = normalizePanelUserRecord(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!updatedUser) {
    throw new PanelUsersApiError("A API respondeu ao update, mas o usuario retornado nao foi reconhecido.");
  }

  return updatedUser;
}

export async function createPanelUser(token: string, input: CreatePanelUserInput) {
  const formData = new FormData();
  formData.set("name", input.name.trim());
  formData.set("email", input.email.trim());
  formData.set("password", input.password.trim());
  formData.set("role", "admin");
  formData.set("isActive", "true");

  if (input.avatarFile) {
    formData.set("avatar", input.avatarFile);
  }

  if (input.avatarUrl?.trim()) {
    formData.set("avatarUrl", input.avatarUrl.trim());
  }

  const { response, payload } = await requestJson(PANEL_USER_CREATE_PATH, token, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new PanelUsersApiError(
      extractMessage(payload, "Nao foi possivel criar esse usuario."),
      response.status,
    );
  }

  const createdUser = normalizePanelUserRecord(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!createdUser) {
    throw new PanelUsersApiError("A API respondeu ao create, mas o usuario retornado nao foi reconhecido.");
  }

  return createdUser;
}

export async function deletePanelUser(token: string, id: string) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_USER_DELETE_PATH, id), token, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new PanelUsersApiError(
      extractMessage(payload, "Nao foi possivel excluir esse usuario."),
      response.status,
    );
  }
}
