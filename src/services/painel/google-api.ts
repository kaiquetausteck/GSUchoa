import { getPanelApiBaseUrl } from "./auth-api";

const PANEL_API_BASE_URL = getPanelApiBaseUrl();
const PANEL_GOOGLE_STATUS_PATH = import.meta.env.VITE_PANEL_GOOGLE_STATUS_PATH ?? "/integrations/google/status";
const PANEL_GOOGLE_CONNECT_PATH = import.meta.env.VITE_PANEL_GOOGLE_CONNECT_PATH ?? "/integrations/google/connect";
const PANEL_GOOGLE_EXCHANGE_PATH = import.meta.env.VITE_PANEL_GOOGLE_EXCHANGE_PATH ?? "/integrations/google/exchange";
const PANEL_GOOGLE_VALIDATE_PATH = import.meta.env.VITE_PANEL_GOOGLE_VALIDATE_PATH ?? "/integrations/google/validate";
const PANEL_GOOGLE_CUSTOMERS_PATH =
  import.meta.env.VITE_PANEL_GOOGLE_CUSTOMERS_PATH ?? "/integrations/google/customers";
const PANEL_GOOGLE_CONNECTION_PATH =
  import.meta.env.VITE_PANEL_GOOGLE_CONNECTION_PATH ?? "/integrations/google/connection";

export const PANEL_GOOGLE_CONNECTION_STATUS_VALUES = [
  "NOT_CONNECTED",
  "CONNECTED",
  "EXPIRED",
  "INVALID",
  "RECONNECT_REQUIRED",
] as const;

export type PanelGoogleConnectionStatus = (typeof PANEL_GOOGLE_CONNECTION_STATUS_VALUES)[number];

export type PanelGoogleConnectionStatusRecord = {
  connected: boolean;
  status: PanelGoogleConnectionStatus;
  expiresAt: string | null;
  lastValidatedAt: string | null;
  canReconnect: boolean;
};

export type PanelGoogleAdsCustomerRecord = {
  currencyCode: string | null;
  customerId: string;
  descriptiveName: string;
  hidden: boolean;
  loginCustomerId: string | null;
  manager: boolean;
  parentCustomerId: string | null;
  status: string | null;
  testAccount: boolean;
  timeZone: string | null;
};

export type PanelGoogleConnectionDetailsRecord = PanelGoogleConnectionStatusRecord & {
  googleUserEmail: string | null;
  googleUserId: string | null;
  googleUserName: string | null;
};

export type PanelGoogleConnectResponse = {
  authorizationUrl: string;
  expiresAt: string | null;
};

export type PanelGoogleExchangeInput = {
  code: string;
  state: string;
};

type JsonRecord = Record<string, unknown>;

class PanelGoogleApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PanelGoogleApiError";
    this.status = status;
  }
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function buildUrl(path: string) {
  return `${PANEL_API_BASE_URL}${normalizePath(path)}`;
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
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
      if (value === "true") {
        return true;
      }

      if (value === "false") {
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
    return payload.trim();
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

  return getFirstString([payload.error, payload.detail, payload.path]) ?? fallbackMessage;
}

function normalizeDateTime(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
}

function resolvePayloadRoot(payload: unknown) {
  if (isRecord(payload) && isRecord(payload.data)) {
    return payload.data;
  }

  return payload;
}

async function requestJson(path: string, token: string, init: RequestInit = {}) {
  const hasJsonBody =
    init.body !== undefined &&
    typeof init.body === "string" &&
    !(init.headers instanceof Headers);

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new PanelGoogleApiError(
      `Não foi possível conectar com a API em ${PANEL_API_BASE_URL}. Verifique se o backend está ativo.`,
    );
  }

  const payload = await parseJsonSafe(response);

  return {
    response,
    payload,
  };
}

function normalizeGoogleConnectionStatus(value: unknown): PanelGoogleConnectionStatus | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toUpperCase();

  return PANEL_GOOGLE_CONNECTION_STATUS_VALUES.includes(normalizedValue as PanelGoogleConnectionStatus)
    ? (normalizedValue as PanelGoogleConnectionStatus)
    : null;
}

function normalizeGoogleConnectionStatusRecord(payload: unknown): PanelGoogleConnectionStatusRecord | null {
  const root = resolvePayloadRoot(payload);

  if (!isRecord(root)) {
    return null;
  }

  const status = normalizeGoogleConnectionStatus(root.status);

  if (!status) {
    return null;
  }

  return {
    connected: getFirstBoolean([root.connected]) ?? status === "CONNECTED",
    status,
    expiresAt: normalizeDateTime(root.expiresAt),
    lastValidatedAt: normalizeDateTime(root.lastValidatedAt),
    canReconnect: getFirstBoolean([root.canReconnect]) ?? false,
  };
}

function normalizeGoogleConnectionDetailsRecord(payload: unknown): PanelGoogleConnectionDetailsRecord | null {
  const root = resolvePayloadRoot(payload);
  const statusRecord = normalizeGoogleConnectionStatusRecord(root);

  if (!statusRecord || !isRecord(root)) {
    return null;
  }

  return {
    ...statusRecord,
    googleUserEmail: getFirstString([root.googleUserEmail]),
    googleUserId: getFirstString([root.googleUserId]),
    googleUserName: getFirstString([root.googleUserName]),
  };
}

function normalizeGoogleAdsCustomerRecord(payload: unknown): PanelGoogleAdsCustomerRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const customerId = getFirstString([payload.customerId]);
  const descriptiveName = getFirstString([payload.descriptiveName]);

  if (!customerId || !descriptiveName) {
    return null;
  }

  return {
    currencyCode: getFirstString([payload.currencyCode]),
    customerId,
    descriptiveName,
    hidden: getFirstBoolean([payload.hidden]) ?? false,
    loginCustomerId: getFirstString([payload.loginCustomerId]),
    manager: getFirstBoolean([payload.manager]) ?? false,
    parentCustomerId: getFirstString([payload.parentCustomerId]),
    status: getFirstString([payload.status]),
    testAccount: getFirstBoolean([payload.testAccount]) ?? false,
    timeZone: getFirstString([payload.timeZone]),
  };
}

function normalizeGoogleAdsCustomers(payload: unknown): PanelGoogleAdsCustomerRecord[] {
  const root = resolvePayloadRoot(payload);

  if (Array.isArray(root)) {
    return root
      .map((item) => normalizeGoogleAdsCustomerRecord(item))
      .filter((item): item is PanelGoogleAdsCustomerRecord => item !== null);
  }

  if (!isRecord(root)) {
    return [];
  }

  const candidateKeys = ["customers", "items"];
  const source = candidateKeys.find((key) => Array.isArray(root[key]))
    ? (root[candidateKeys.find((key) => Array.isArray(root[key]))!] as unknown[])
    : [];

  return source
    .map((item) => normalizeGoogleAdsCustomerRecord(item))
    .filter((item): item is PanelGoogleAdsCustomerRecord => item !== null);
}

function normalizeGoogleConnectResponse(payload: unknown): PanelGoogleConnectResponse | null {
  const root = resolvePayloadRoot(payload);

  if (!isRecord(root)) {
    return null;
  }

  const authorizationUrl = getFirstString([root.authorizationUrl]);

  if (!authorizationUrl) {
    return null;
  }

  return {
    authorizationUrl,
    expiresAt: normalizeDateTime(root.expiresAt),
  };
}

export async function getPanelGoogleConnectionStatus(token: string) {
  const { response, payload } = await requestJson(PANEL_GOOGLE_STATUS_PATH, token);

  if (!response.ok) {
    throw new PanelGoogleApiError(
      extractMessage(payload, "Não foi possível carregar o status da integração Google."),
      response.status,
    );
  }

  const statusRecord = normalizeGoogleConnectionStatusRecord(payload);

  if (!statusRecord) {
    throw new PanelGoogleApiError(
      "A API respondeu ao status do Google, mas o formato retornado não foi reconhecido.",
      response.status,
    );
  }

  return statusRecord;
}

export async function getPanelGoogleConnectLink(token: string) {
  const { response, payload } = await requestJson(PANEL_GOOGLE_CONNECT_PATH, token);

  if (!response.ok) {
    throw new PanelGoogleApiError(
      extractMessage(payload, "Não foi possível iniciar a conexão com o Google."),
      response.status,
    );
  }

  const connectResponse = normalizeGoogleConnectResponse(payload);

  if (!connectResponse) {
    throw new PanelGoogleApiError(
      "A API respondeu à conexão do Google, mas não retornou uma URL de autorização válida.",
      response.status,
    );
  }

  return connectResponse;
}

export async function exchangePanelGoogleOAuthCode(token: string, input: PanelGoogleExchangeInput) {
  const { response, payload } = await requestJson(PANEL_GOOGLE_EXCHANGE_PATH, token, {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new PanelGoogleApiError(
      extractMessage(payload, "Não foi possível concluir a conexão com o Google."),
      response.status,
    );
  }

  const detailsRecord = normalizeGoogleConnectionDetailsRecord(payload);

  if (!detailsRecord) {
    throw new PanelGoogleApiError(
      "A API concluiu a troca do code do Google, mas o retorno não foi reconhecido.",
      response.status,
    );
  }

  return detailsRecord;
}

export async function validatePanelGoogleConnection(token: string) {
  const { response, payload } = await requestJson(PANEL_GOOGLE_VALIDATE_PATH, token, {
    method: "POST",
  });

  if (!response.ok) {
    throw new PanelGoogleApiError(
      extractMessage(payload, "Não foi possível validar a conexão do Google agora."),
      response.status,
    );
  }

  const detailsRecord = normalizeGoogleConnectionDetailsRecord(payload);

  if (!detailsRecord) {
    throw new PanelGoogleApiError(
      "A API respondeu à validação do Google, mas o formato retornado não foi reconhecido.",
      response.status,
    );
  }

  return detailsRecord;
}

export async function deletePanelGoogleConnection(token: string) {
  const { response, payload } = await requestJson(PANEL_GOOGLE_CONNECTION_PATH, token, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new PanelGoogleApiError(
      extractMessage(payload, "Não foi possível desconectar o Google agora."),
      response.status,
    );
  }
}

export async function listPanelGoogleAdsCustomers(token: string) {
  const { response, payload } = await requestJson(PANEL_GOOGLE_CUSTOMERS_PATH, token);

  if (!response.ok) {
    throw new PanelGoogleApiError(
      extractMessage(payload, "Não foi possível carregar as contas do Google Ads."),
      response.status,
    );
  }

  return normalizeGoogleAdsCustomers(payload);
}
