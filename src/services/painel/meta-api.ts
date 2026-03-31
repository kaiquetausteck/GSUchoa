import { getPanelApiBaseUrl } from "./auth-api";

const PANEL_API_BASE_URL = getPanelApiBaseUrl();
const PANEL_META_STATUS_PATH = import.meta.env.VITE_PANEL_META_STATUS_PATH ?? "/integrations/meta/status";
const PANEL_META_CONNECT_PATH = import.meta.env.VITE_PANEL_META_CONNECT_PATH ?? "/integrations/meta/connect";
const PANEL_META_EXCHANGE_PATH = import.meta.env.VITE_PANEL_META_EXCHANGE_PATH ?? "/integrations/meta/exchange";
const PANEL_META_VALIDATE_PATH = import.meta.env.VITE_PANEL_META_VALIDATE_PATH ?? "/integrations/meta/validate";
const PANEL_META_AD_ACCOUNTS_PATH =
  import.meta.env.VITE_PANEL_META_AD_ACCOUNTS_PATH ?? "/integrations/meta/ad-accounts";
const PANEL_META_CONNECTION_PATH =
  import.meta.env.VITE_PANEL_META_CONNECTION_PATH ?? "/integrations/meta/connection";

export const PANEL_META_CONNECTION_STATUS_VALUES = [
  "NOT_CONNECTED",
  "CONNECTED",
  "EXPIRED",
  "INVALID",
  "RECONNECT_REQUIRED",
] as const;

export type PanelMetaConnectionStatus = (typeof PANEL_META_CONNECTION_STATUS_VALUES)[number];

export type PanelMetaConnectionStatusRecord = {
  connected: boolean;
  status: PanelMetaConnectionStatus;
  expiresAt: string | null;
  lastValidatedAt: string | null;
  canReconnect: boolean;
};

export type PanelMetaAdAccountRecord = {
  id: string;
  adAccountId: string;
  name: string;
  accountStatus: number | null;
  currency: string | null;
  timezoneName: string | null;
};

export type PanelMetaConnectionDetailsRecord = PanelMetaConnectionStatusRecord & {
  metaUserId: string | null;
  metaUserName: string | null;
  adAccounts: PanelMetaAdAccountRecord[];
};

export type PanelMetaConnectResponse = {
  authorizationUrl: string;
  expiresAt: string | null;
};

export type PanelMetaExchangeInput = {
  code: string;
  state: string;
};

type JsonRecord = Record<string, unknown>;

class PanelMetaApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PanelMetaApiError";
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
    throw new PanelMetaApiError(
      `Não foi possível conectar com a API em ${PANEL_API_BASE_URL}. Verifique se o backend está ativo.`,
    );
  }

  const payload = await parseJsonSafe(response);

  return {
    response,
    payload,
  };
}

function normalizeMetaConnectionStatus(value: unknown): PanelMetaConnectionStatus | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toUpperCase();

  return PANEL_META_CONNECTION_STATUS_VALUES.includes(normalizedValue as PanelMetaConnectionStatus)
    ? (normalizedValue as PanelMetaConnectionStatus)
    : null;
}

function normalizeMetaAdAccount(payload: unknown): PanelMetaAdAccountRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id]);
  const adAccountId = getFirstString([payload.adAccountId]);
  const name = getFirstString([payload.name]);

  if (!id || !adAccountId || !name) {
    return null;
  }

  return {
    id,
    adAccountId,
    name,
    accountStatus: getFirstNumber([payload.accountStatus]),
    currency: getFirstString([payload.currency]),
    timezoneName: getFirstString([payload.timezoneName]),
  };
}

function normalizeMetaAdAccounts(payload: unknown): PanelMetaAdAccountRecord[] {
  const root = resolvePayloadRoot(payload);

  if (Array.isArray(root)) {
    return root
      .map((item) => normalizeMetaAdAccount(item))
      .filter((item): item is PanelMetaAdAccountRecord => item !== null);
  }

  if (!isRecord(root) || !Array.isArray(root.adAccounts)) {
    return [];
  }

  return root.adAccounts
    .map((item) => normalizeMetaAdAccount(item))
    .filter((item): item is PanelMetaAdAccountRecord => item !== null);
}

function normalizeMetaConnectionStatusRecord(payload: unknown): PanelMetaConnectionStatusRecord | null {
  const root = resolvePayloadRoot(payload);

  if (!isRecord(root)) {
    return null;
  }

  const status = normalizeMetaConnectionStatus(root.status);

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

function normalizeMetaConnectionDetailsRecord(payload: unknown): PanelMetaConnectionDetailsRecord | null {
  const root = resolvePayloadRoot(payload);
  const statusRecord = normalizeMetaConnectionStatusRecord(root);

  if (!statusRecord || !isRecord(root)) {
    return null;
  }

  return {
    ...statusRecord,
    metaUserId: getFirstString([root.metaUserId]),
    metaUserName: getFirstString([root.metaUserName]),
    adAccounts: normalizeMetaAdAccounts(root.adAccounts),
  };
}

function normalizeMetaConnectResponse(payload: unknown): PanelMetaConnectResponse | null {
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

export async function getPanelMetaConnectionStatus(token: string) {
  const { response, payload } = await requestJson(PANEL_META_STATUS_PATH, token);

  if (!response.ok) {
    throw new PanelMetaApiError(
      extractMessage(payload, "Não foi possível carregar o status da integração Meta."),
      response.status,
    );
  }

  const statusRecord = normalizeMetaConnectionStatusRecord(payload);

  if (!statusRecord) {
    throw new PanelMetaApiError(
      "A API respondeu ao status da Meta, mas o formato retornado não foi reconhecido.",
      response.status,
    );
  }

  return statusRecord;
}

export async function getPanelMetaConnectLink(token: string) {
  const { response, payload } = await requestJson(PANEL_META_CONNECT_PATH, token);

  if (!response.ok) {
    throw new PanelMetaApiError(
      extractMessage(payload, "Não foi possível iniciar a conexão com a Meta."),
      response.status,
    );
  }

  const connectResponse = normalizeMetaConnectResponse(payload);

  if (!connectResponse) {
    throw new PanelMetaApiError(
      "A API respondeu à conexão da Meta, mas não retornou uma URL de autorização válida.",
      response.status,
    );
  }

  return connectResponse;
}

export async function exchangePanelMetaOAuthCode(token: string, input: PanelMetaExchangeInput) {
  const { response, payload } = await requestJson(PANEL_META_EXCHANGE_PATH, token, {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new PanelMetaApiError(
      extractMessage(payload, "Não foi possível concluir a conexão com a Meta."),
      response.status,
    );
  }

  const detailsRecord = normalizeMetaConnectionDetailsRecord(payload);

  if (!detailsRecord) {
    throw new PanelMetaApiError(
      "A API concluiu a troca do code da Meta, mas o retorno não foi reconhecido.",
      response.status,
    );
  }

  return detailsRecord;
}

export async function validatePanelMetaConnection(token: string) {
  const { response, payload } = await requestJson(PANEL_META_VALIDATE_PATH, token, {
    method: "POST",
  });

  if (!response.ok) {
    throw new PanelMetaApiError(
      extractMessage(payload, "Não foi possível validar a conexão da Meta agora."),
      response.status,
    );
  }

  const detailsRecord = normalizeMetaConnectionDetailsRecord(payload);

  if (!detailsRecord) {
    throw new PanelMetaApiError(
      "A API respondeu à validação da Meta, mas o formato retornado não foi reconhecido.",
      response.status,
    );
  }

  return detailsRecord;
}

export async function listPanelMetaAdAccounts(token: string) {
  const { response, payload } = await requestJson(PANEL_META_AD_ACCOUNTS_PATH, token);

  if (!response.ok) {
    throw new PanelMetaApiError(
      extractMessage(payload, "Não foi possível carregar as contas de anúncio da Meta."),
      response.status,
    );
  }

  return normalizeMetaAdAccounts(payload);
}

export async function deletePanelMetaConnection(token: string) {
  const { response, payload } = await requestJson(PANEL_META_CONNECTION_PATH, token, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new PanelMetaApiError(
      extractMessage(payload, "Não foi possível desconectar a Meta agora."),
      response.status,
    );
  }
}
