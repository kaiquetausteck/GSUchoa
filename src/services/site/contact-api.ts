const SITE_API_BASE_URL = (
  import.meta.env.VITE_SITE_API_URL ??
  import.meta.env.VITE_PANEL_API_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

const SITE_CONTACT_PATH = import.meta.env.VITE_SITE_CONTACT_PATH ?? "/contact";

export type PublicContactRequestInput = {
  fullName: string;
  email: string;
  whatsapp: string;
  message: string;
  source?: string;
};

export type PublicContactRequestResponse = {
  success: boolean;
  message: string;
};

type JsonRecord = Record<string, unknown>;

class PublicContactApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PublicContactApiError";
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

async function requestJson(path: string, init: RequestInit = {}) {
  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new PublicContactApiError(
      `Não foi possível conectar à API em ${SITE_API_BASE_URL}. Verifique se o backend está ativo.`,
    );
  }

  const payload = await parseJsonSafe(response);

  return {
    response,
    payload,
  };
}

function normalizeSubmissionResponse(payload: unknown): PublicContactRequestResponse {
  const message =
    getFirstString([
      isRecord(payload) ? payload.message : null,
      isRecord(payload) && isRecord(payload.data) ? payload.data.message : null,
    ]) ?? "Solicitação enviada com sucesso.";

  const successValue = isRecord(payload)
    ? payload.success
    : null;

  return {
    success: typeof successValue === "boolean" ? successValue : true,
    message,
  };
}

export async function submitPublicContactRequest(input: PublicContactRequestInput) {
  const { response, payload } = await requestJson(SITE_CONTACT_PATH, {
    method: "POST",
    body: JSON.stringify({
      fullName: input.fullName,
      email: input.email,
      whatsapp: input.whatsapp,
      message: input.message,
      source: input.source ?? "site_contact_form",
    }),
  });

  if (!response.ok) {
    throw new PublicContactApiError(
      extractMessage(payload, "Não foi possível enviar sua solicitação agora."),
      response.status,
    );
  }

  return normalizeSubmissionResponse(payload);
}
