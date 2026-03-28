const SITE_API_BASE_URL = (
  import.meta.env.VITE_SITE_API_URL ??
  import.meta.env.VITE_PANEL_API_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

export type PublicTestimonial = {
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
};

type JsonRecord = Record<string, unknown>;

class PublicTestimonialsApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PublicTestimonialsApiError";
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
    throw new PublicTestimonialsApiError(
      `Nao foi possivel conectar com a API em ${SITE_API_BASE_URL}. Verifique se o backend esta ativo.`,
    );
  }

  const payload = await parseJsonSafe(response);

  return {
    response,
    payload,
  };
}

function normalizePublicTestimonial(payload: unknown): PublicTestimonial | null {
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

  if (
    !id ||
    !brand ||
    !authorName ||
    !authorRole ||
    !message ||
    rating === null ||
    featured === null ||
    sortOrder === null
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
  };
}

function normalizeListPayload(payload: unknown) {
  const itemsRaw = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.data)
      ? payload.data
      : [];

  return itemsRaw
    .map((item) => normalizePublicTestimonial(item))
    .filter((item): item is PublicTestimonial => item !== null);
}

export async function listPublicTestimonials(filters?: { featured?: boolean }) {
  const searchParams = new URLSearchParams();

  if (typeof filters?.featured === "boolean") {
    searchParams.set("featured", String(filters.featured));
  }

  const path = searchParams.size ? `/testimonials?${searchParams.toString()}` : "/testimonials";
  const { response, payload } = await requestJson(path);

  if (!response.ok) {
    throw new PublicTestimonialsApiError(
      extractMessage(payload, "Nao foi possivel carregar os depoimentos publicados."),
      response.status,
    );
  }

  return normalizeListPayload(payload);
}

export async function listFeaturedPublicTestimonials() {
  const { response, payload } = await requestJson("/testimonials/featured");

  if (!response.ok) {
    throw new PublicTestimonialsApiError(
      extractMessage(payload, "Nao foi possivel carregar os depoimentos em destaque."),
      response.status,
    );
  }

  return normalizeListPayload(payload);
}

export async function getPublicTestimonialById(id: string) {
  const { response, payload } = await requestJson(`/testimonials/${encodeURIComponent(id)}`);

  if (!response.ok) {
    throw new PublicTestimonialsApiError(
      extractMessage(payload, "Nao foi possivel carregar esse depoimento."),
      response.status,
    );
  }

  const item = normalizePublicTestimonial(
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload,
  );

  if (!item) {
    throw new PublicTestimonialsApiError(
      "A API respondeu ao depoimento, mas o formato nao foi reconhecido.",
    );
  }

  return item;
}
