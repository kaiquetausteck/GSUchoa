import { getPanelApiBaseUrl } from "./auth-api";

const PANEL_API_BASE_URL = getPanelApiBaseUrl();
const PANEL_ROLES_PATH = import.meta.env.VITE_PANEL_ROLES_PATH ?? "/panel-roles";
const PANEL_ROLE_DETAIL_PATH = import.meta.env.VITE_PANEL_ROLE_DETAIL_PATH ?? "/panel-roles/:id";

export type PanelRoleRecord = {
  id: string;
  name: string;
  slug: string;
  isSystem: boolean;
  pageKeys: string[];
  createdAt: string | null;
  updatedAt: string | null;
};

type JsonRecord = Record<string, unknown>;

class PanelRolesApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PanelRolesApiError";
    this.status = status;
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function buildUrl(path: string) {
  return `${PANEL_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
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
    return { message: rawText };
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

  const messages = extractStringList(payload.message);
  return messages.length ? messages.join(" ") : getFirstString([payload.error, payload.detail]) ?? fallbackMessage;
}

async function requestJson(path: string, token: string, init: RequestInit = {}) {
  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new PanelRolesApiError(`Não foi possível conectar com a API em ${PANEL_API_BASE_URL}.`);
  }

  return {
    response,
    payload: await parseJsonSafe(response),
  };
}

function normalizePanelRole(payload: unknown): PanelRoleRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id]);
  const name = getFirstString([payload.name]);
  const slug = getFirstString([payload.slug]);

  if (!id || !name || !slug) {
    return null;
  }

  return {
    id,
    name,
    slug,
    isSystem: Boolean(payload.isSystem),
    pageKeys: Array.isArray(payload.pageKeys) ? payload.pageKeys.filter((item): item is string => typeof item === "string") : [],
    createdAt: getFirstString([payload.createdAt]),
    updatedAt: getFirstString([payload.updatedAt]),
  };
}

export async function listPanelRoles(token: string) {
  const { response, payload } = await requestJson(PANEL_ROLES_PATH, token);

  if (!response.ok) {
    throw new PanelRolesApiError(extractMessage(payload, "Não foi possível carregar os cargos."), response.status);
  }

  const items = Array.isArray(payload) ? payload : isRecord(payload) && Array.isArray(payload.data) ? payload.data : [];
  return items.map((item) => normalizePanelRole(item)).filter((item): item is PanelRoleRecord => item !== null);
}

export type PanelRoleInput = {
  name: string;
  pageKeys: string[];
};

export async function createPanelRole(token: string, input: PanelRoleInput) {
  const { response, payload } = await requestJson(PANEL_ROLES_PATH, token, {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new PanelRolesApiError(extractMessage(payload, "Não foi possível criar o cargo."), response.status);
  }

  const role = normalizePanelRole(isRecord(payload) && isRecord(payload.data) ? payload.data : payload);
  if (!role) {
    throw new PanelRolesApiError("A API respondeu, mas o cargo não foi reconhecido.");
  }
  return role;
}

export async function updatePanelRole(token: string, id: string, input: PanelRoleInput) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_ROLE_DETAIL_PATH, id), token, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new PanelRolesApiError(extractMessage(payload, "Não foi possível salvar o cargo."), response.status);
  }

  const role = normalizePanelRole(isRecord(payload) && isRecord(payload.data) ? payload.data : payload);
  if (!role) {
    throw new PanelRolesApiError("A API respondeu, mas o cargo não foi reconhecido.");
  }
  return role;
}

export async function deletePanelRole(token: string, id: string) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_ROLE_DETAIL_PATH, id), token, {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 204) {
    throw new PanelRolesApiError(extractMessage(payload, "Não foi possível excluir o cargo."), response.status);
  }
}
