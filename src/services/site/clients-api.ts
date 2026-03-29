import { resolveApiAssetUrl } from "../painel/resolve-api-asset-url";

const SITE_API_BASE_URL = (
  import.meta.env.VITE_SITE_API_URL ??
  import.meta.env.VITE_PANEL_API_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

export type PublicClient = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  website: string | null;
  featured: boolean;
  sortOrder: number;
};

export type PublicClientDetail = PublicClient & {
  description: string | null;
};

type JsonRecord = Record<string, unknown>;

class PublicClientsApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PublicClientsApiError";
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

      if (["true", "1", "yes", "sim", "featured"].includes(normalized)) {
        return true;
      }

      if (["false", "0", "no", "nao"].includes(normalized)) {
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

async function requestJson(path: string) {
  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      headers: {
        Accept: "application/json",
      },
    });
  } catch {
    throw new PublicClientsApiError(
      `Não foi possível conectar à API em ${SITE_API_BASE_URL}. Verifique se o backend está ativo.`,
    );
  }

  const payload = await parseJsonSafe(response);

  return {
    response,
    payload,
  };
}

function normalizePublicClientRecord(payload: unknown): PublicClientDetail | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id]);
  const name = getFirstString([payload.name]);
  const slug = getFirstString([payload.slug]);
  const logoUrl = resolveApiAssetUrl(SITE_API_BASE_URL, getFirstString([payload.logoUrl, payload.logo, payload.image]));
  const featured = getFirstBoolean([payload.featured]);
  const sortOrder = getFirstNumber([payload.sortOrder]);

  if (!id || !name || !slug || !logoUrl || featured === null || sortOrder === null) {
    return null;
  }

  return {
    id,
    name,
    slug,
    logoUrl,
    website: getFirstString([payload.website]),
    featured,
    sortOrder,
    description: getFirstString([payload.description]),
  };
}

function toPublicClient(item: PublicClientDetail): PublicClient {
  const { description: _description, ...summary } = item;
  return summary;
}

function normalizeListPayload(payload: unknown): PublicClient[] {
  const itemsRaw = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.data)
      ? payload.data
      : [];

  return itemsRaw
    .map((item) => normalizePublicClientRecord(item))
    .filter((item): item is PublicClientDetail => item !== null)
    .map((item) => toPublicClient(item));
}

export async function listPublicClients(filters?: { featured?: boolean }) {
  const searchParams = new URLSearchParams();

  if (typeof filters?.featured === "boolean") {
    searchParams.set("featured", String(filters.featured));
  }

  const path = searchParams.size ? `/clients?${searchParams.toString()}` : "/clients";
  const { response, payload } = await requestJson(path);

  if (!response.ok) {
    throw new PublicClientsApiError(
      extractMessage(payload, "Não foi possível carregar os clientes publicados."),
      response.status,
    );
  }

  return normalizeListPayload(payload);
}

export async function listFeaturedPublicClients() {
  const { response, payload } = await requestJson("/clients/featured");

  if (!response.ok) {
    throw new PublicClientsApiError(
      extractMessage(payload, "Não foi possível carregar os clientes em destaque."),
      response.status,
    );
  }

  return normalizeListPayload(payload);
}

export async function getPublicClientBySlug(slug: string) {
  const { response, payload } = await requestJson(`/clients/${encodeURIComponent(slug)}`);

  if (!response.ok) {
    throw new PublicClientsApiError(
      extractMessage(payload, "Não foi possível carregar este cliente."),
      response.status,
    );
  }

  const item = normalizePublicClientRecord(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!item) {
    throw new PublicClientsApiError(
      "A API respondeu ao cliente, mas o formato não foi reconhecido.",
    );
  }

  return item;
}
