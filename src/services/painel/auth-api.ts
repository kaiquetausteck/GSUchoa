import { resolveApiAssetUrl } from "./resolve-api-asset-url";

const PANEL_API_BASE_URL = (import.meta.env.VITE_PANEL_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

const PANEL_LOGIN_PATHS = Array.from(
  new Set(
    [
      import.meta.env.VITE_PANEL_LOGIN_PATH,
      "/auth/login",
      "/login",
    ].filter(Boolean),
  ),
);

const PANEL_LOGOUT_PATHS = Array.from(
  new Set(
    [
      import.meta.env.VITE_PANEL_LOGOUT_PATH,
      "/auth/logout",
      "/logout",
    ].filter(Boolean),
  ),
);

const PANEL_ME_PATH = import.meta.env.VITE_PANEL_ME_PATH ?? "/auth/me";

export type PanelUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
};

type JsonRecord = Record<string, unknown>;

class PanelApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PanelApiError";
    this.status = status;
  }
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function buildUrl(path: string) {
  return `${PANEL_API_BASE_URL}${normalizePath(path)}`;
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

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
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

function extractToken(payload: unknown) {
  if (!isRecord(payload)) {
    return null;
  }

  return getFirstString([
    payload.token,
    payload.accessToken,
    payload.access_token,
    isRecord(payload.data) ? payload.data.token : null,
    isRecord(payload.data) ? payload.data.accessToken : null,
    isRecord(payload.data) ? payload.data.access_token : null,
  ]);
}

function normalizeUser(payload: unknown): PanelUser | null {
  const source = isRecord(payload)
    ? isRecord(payload.user)
      ? payload.user
      : isRecord(payload.data) && isRecord(payload.data.user)
        ? payload.data.user
        : isRecord(payload.data)
          ? payload.data
          : payload
    : null;

  if (!source || !isRecord(source)) {
    return null;
  }

  const email = getFirstString([source.email, source.login]);
  const name = getFirstString([source.name, source.fullName, source.full_name, source.username]);

  if (!email && !name) {
    return null;
  }

  return {
    id: getFirstString([source.id, source._id, source.uuid, source.userId]) ?? email ?? name ?? "panel-user",
    name: name ?? email ?? "Usuario",
    email: email ?? "",
    role: getFirstString([source.role, source.profile, source.type, source.permission]) ?? "Administrador",
    avatarUrl: resolveApiAssetUrl(
      PANEL_API_BASE_URL,
      getFirstString([source.avatarUrl, source.avatar_url, source.image, source.photo, source.picture]),
    ),
  };
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
    throw new PanelApiError(
      `Nao foi possivel conectar com a API em ${PANEL_API_BASE_URL}. Verifique se o backend esta ativo.`,
    );
  }

  const payload = await parseJsonSafe(response);

  return {
    response,
    payload,
  };
}

export async function loginPanelUser(email: string, password: string) {
  for (const path of PANEL_LOGIN_PATHS) {
    const { response, payload } = await requestJson(path, {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (response.status === 404) {
      continue;
    }

    if (!response.ok) {
      throw new PanelApiError(
        extractMessage(payload, "Nao foi possivel iniciar a sessao no painel."),
        response.status,
      );
    }

    const token = extractToken(payload);

    if (!token) {
      throw new PanelApiError("A API respondeu ao login, mas nao retornou um token valido.", response.status);
    }

    return {
      token,
      user: normalizeUser(payload),
    };
  }

  throw new PanelApiError(
    "Nenhum endpoint de login respondeu. Ajuste VITE_PANEL_LOGIN_PATH se a sua API usar outra rota.",
    404,
  );
}

export async function fetchPanelMe(token: string) {
  const { response, payload } = await requestJson(PANEL_ME_PATH, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new PanelApiError(
      extractMessage(payload, "Nao foi possivel carregar os dados do usuario."),
      response.status,
    );
  }

  const user = normalizeUser(payload);

  if (!user) {
    throw new PanelApiError(
      `A API respondeu ao endpoint ${PANEL_ME_PATH}, mas o formato do usuario nao foi reconhecido.`,
      response.status,
    );
  }

  return user;
}

export async function logoutPanelSession(token: string) {
  for (const path of PANEL_LOGOUT_PATHS) {
    const { response } = await requestJson(path, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      continue;
    }

    return;
  }
}

export function getPanelApiBaseUrl() {
  return PANEL_API_BASE_URL;
}
