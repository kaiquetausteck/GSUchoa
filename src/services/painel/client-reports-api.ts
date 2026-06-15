import { getPanelApiBaseUrl } from "./auth-api";

const PANEL_API_BASE_URL = getPanelApiBaseUrl();
const CLIENT_REPORTS_PATH = import.meta.env.VITE_PANEL_CLIENT_REPORTS_PATH ?? "/client-reports";
const CLIENT_REPORT_CLIENTS_PATH =
  import.meta.env.VITE_PANEL_CLIENT_REPORT_CLIENTS_PATH ?? "/client-reports/clients";
const CLIENT_REPORT_DETAIL_PATH =
  import.meta.env.VITE_PANEL_CLIENT_REPORT_DETAIL_PATH ?? "/client-reports/:id";
const CLIENT_REPORT_DUPLICATE_PATH =
  import.meta.env.VITE_PANEL_CLIENT_REPORT_DUPLICATE_PATH ?? "/client-reports/:id/duplicate";
const CLIENT_REPORT_IMAGE_UPLOAD_PATH =
  import.meta.env.VITE_PANEL_CLIENT_REPORT_IMAGE_UPLOAD_PATH ?? "/client-reports/:id/images";
const CLIENT_REPORT_REFRESH_DATA_PATH =
  import.meta.env.VITE_PANEL_CLIENT_REPORT_REFRESH_DATA_PATH ?? "/client-reports/:id/refresh-data";
const PUBLIC_CLIENT_REPORTS_BY_CLIENT_PATH =
  import.meta.env.VITE_PUBLIC_CLIENT_REPORTS_BY_CLIENT_PATH ?? "/public/client-reports/clients/:clientSlug";
const PUBLIC_CLIENT_REPORT_DETAIL_PATH =
  import.meta.env.VITE_PUBLIC_CLIENT_REPORT_DETAIL_PATH ?? "/public/client-reports/clients/:clientSlug/reports/:reportId";

export type PanelClientReportStatus = "draft" | "generated" | "archived";
export type PanelClientReportSnapshotStatus = "pending" | "ready" | "partial" | "failed";

export type PanelClientReportRecord = {
  id: string;
  clientId: string;
  title: string;
  status: PanelClientReportStatus;
  periodStart: string | null;
  periodEnd: string | null;
  layout: unknown;
  dataSnapshot: unknown | null;
  dataSnapshotStatus: PanelClientReportSnapshotStatus;
  dataSnapshotFetchedAt: string | null;
  dataSnapshotError: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  client: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  createdByUser: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  updatedByUser: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null;
};

export type PanelClientReportClientRecord = PanelClientReportRecord["client"];

export type PanelClientReportInput = {
  clientId?: string;
  title?: string;
  status?: PanelClientReportStatus;
  periodStart?: string | null;
  periodEnd?: string | null;
  layout?: Record<string, unknown>;
};

type JsonRecord = Record<string, unknown>;

class PanelClientReportsApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PanelClientReportsApiError";
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

function buildPathWithParams(path: string, params: Record<string, string>) {
  return Object.entries(params).reduce(
    (currentPath, [key, value]) => currentPath.replace(`:${key}`, encodeURIComponent(value)),
    path,
  );
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
  const isFormDataPayload = typeof FormData !== "undefined" && init.body instanceof FormData;

  try {
    response = await fetch(buildUrl(path), {
      ...init,
      headers: {
        Accept: "application/json",
        ...(!isFormDataPayload && init.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new PanelClientReportsApiError(`Não foi possível conectar com a API em ${PANEL_API_BASE_URL}.`);
  }

  return {
    response,
    payload: await parseJsonSafe(response),
  };
}

async function requestPublicJson(path: string, init: RequestInit = {}) {
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
    throw new PanelClientReportsApiError(`Não foi possível conectar com a API em ${PANEL_API_BASE_URL}.`);
  }

  return {
    response,
    payload: await parseJsonSafe(response),
  };
}

function normalizeUser(payload: unknown) {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id]);
  const name = getFirstString([payload.name]);
  const email = getFirstString([payload.email]);

  if (!id || !name || !email) {
    return null;
  }

  return {
    id,
    name,
    email,
    avatarUrl: getFirstString([payload.avatarUrl]),
  };
}

function normalizeClientReport(payload: unknown): PanelClientReportRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id]);
  const clientId = getFirstString([payload.clientId]);
  const title = getFirstString([payload.title]);
  const status = getFirstString([payload.status]) as PanelClientReportStatus | null;
  const client = isRecord(payload.client) ? payload.client : null;
  const clientName = getFirstString([client?.name]);
  const clientSlug = getFirstString([client?.slug]);
  const createdByUser = normalizeUser(payload.createdByUser);

  if (!id || !clientId || !title || !status || !client || !clientName || !clientSlug || !createdByUser) {
    return null;
  }

  return {
    id,
    clientId,
    title,
    status,
    periodStart: getFirstString([payload.periodStart]),
    periodEnd: getFirstString([payload.periodEnd]),
    layout: payload.layout ?? null,
    dataSnapshot: payload.dataSnapshot ?? null,
    dataSnapshotStatus: (getFirstString([payload.dataSnapshotStatus]) as PanelClientReportSnapshotStatus | null) ?? "pending",
    dataSnapshotFetchedAt: getFirstString([payload.dataSnapshotFetchedAt]),
    dataSnapshotError: getFirstString([payload.dataSnapshotError]),
    createdAt: getFirstString([payload.createdAt]),
    updatedAt: getFirstString([payload.updatedAt]),
    client: {
      id: getFirstString([client.id]) ?? clientId,
      name: clientName,
      slug: clientSlug,
      logoUrl: getFirstString([client.logoUrl]),
    },
    createdByUser,
    updatedByUser: normalizeUser(payload.updatedByUser),
  };
}

function normalizeClientReportClient(payload: unknown): PanelClientReportClientRecord | null {
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
    logoUrl: getFirstString([payload.logoUrl]),
  };
}

export async function listPanelClientReports(token: string) {
  const { response, payload } = await requestJson(CLIENT_REPORTS_PATH, token);

  if (!response.ok) {
    throw new PanelClientReportsApiError(extractMessage(payload, "Não foi possível carregar relatórios."), response.status);
  }

  const items = Array.isArray(payload) ? payload : isRecord(payload) && Array.isArray(payload.data) ? payload.data : [];
  return items.map((item) => normalizeClientReport(item)).filter((item): item is PanelClientReportRecord => item !== null);
}

export async function listPublicClientReportsByClient(clientSlug: string, fallbackToken?: string | null) {
  const { response, payload } = await requestPublicJson(
    buildPathWithParams(PUBLIC_CLIENT_REPORTS_BY_CLIENT_PATH, { clientSlug }),
  );

  if (response.status === 404 && fallbackToken) {
    const reports = await listPanelClientReports(fallbackToken);
    return reports.filter((report) => report.client.slug === clientSlug);
  }

  if (!response.ok) {
    throw new PanelClientReportsApiError(extractMessage(payload, "Não foi possível carregar relatórios públicos."), response.status);
  }

  const items = Array.isArray(payload) ? payload : isRecord(payload) && Array.isArray(payload.data) ? payload.data : [];
  return items.map((item) => normalizeClientReport(item)).filter((item): item is PanelClientReportRecord => item !== null);
}

export async function getPublicClientReportById(clientSlug: string, reportId: string, fallbackToken?: string | null) {
  const { response, payload } = await requestPublicJson(
    buildPathWithParams(PUBLIC_CLIENT_REPORT_DETAIL_PATH, { clientSlug, reportId }),
  );

  if (response.status === 404 && fallbackToken) {
    const report = await getPanelClientReportById(fallbackToken, reportId);

    if (report.client.slug !== clientSlug) {
      throw new PanelClientReportsApiError("Este relatório não pertence ao cliente informado.", 404);
    }

    return report;
  }

  if (!response.ok) {
    throw new PanelClientReportsApiError(extractMessage(payload, "Não foi possível carregar relatório público."), response.status);
  }

  const report = normalizeClientReport(payload);
  if (!report) {
    throw new PanelClientReportsApiError("A API respondeu, mas o relatório público não foi reconhecido.");
  }
  return report;
}

export async function listPanelClientReportClients(token: string) {
  const { response, payload } = await requestJson(CLIENT_REPORT_CLIENTS_PATH, token);

  if (!response.ok) {
    throw new PanelClientReportsApiError(extractMessage(payload, "Não foi possível carregar clientes para relatório."), response.status);
  }

  const items = Array.isArray(payload) ? payload : isRecord(payload) && Array.isArray(payload.data) ? payload.data : [];
  return items
    .map((item) => normalizeClientReportClient(item))
    .filter((item): item is PanelClientReportClientRecord => item !== null);
}

export async function getPanelClientReportById(token: string, id: string) {
  const { response, payload } = await requestJson(buildPathWithId(CLIENT_REPORT_DETAIL_PATH, id), token);

  if (!response.ok) {
    throw new PanelClientReportsApiError(extractMessage(payload, "Não foi possível carregar relatório."), response.status);
  }

  const report = normalizeClientReport(payload);
  if (!report) {
    throw new PanelClientReportsApiError("A API respondeu, mas o relatório não foi reconhecido.");
  }
  return report;
}

export async function createPanelClientReport(token: string, input: PanelClientReportInput) {
  const { response, payload } = await requestJson(CLIENT_REPORTS_PATH, token, {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new PanelClientReportsApiError(extractMessage(payload, "Não foi possível criar relatório."), response.status);
  }

  const report = normalizeClientReport(payload);
  if (!report) {
    throw new PanelClientReportsApiError("A API respondeu, mas o relatório não foi reconhecido.");
  }
  return report;
}

export async function updatePanelClientReport(token: string, id: string, input: PanelClientReportInput) {
  const { response, payload } = await requestJson(buildPathWithId(CLIENT_REPORT_DETAIL_PATH, id), token, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new PanelClientReportsApiError(extractMessage(payload, "Não foi possível salvar relatório."), response.status);
  }

  const report = normalizeClientReport(payload);
  if (!report) {
    throw new PanelClientReportsApiError("A API respondeu, mas o relatório não foi reconhecido.");
  }
  return report;
}

export async function duplicatePanelClientReport(token: string, id: string) {
  const { response, payload } = await requestJson(buildPathWithId(CLIENT_REPORT_DUPLICATE_PATH, id), token, {
    method: "POST",
  });

  if (!response.ok) {
    throw new PanelClientReportsApiError(extractMessage(payload, "Não foi possível clonar relatório."), response.status);
  }

  const report = normalizeClientReport(payload);
  if (!report) {
    throw new PanelClientReportsApiError("A API respondeu, mas o relatório clonado não foi reconhecido.");
  }
  return report;
}

export async function uploadPanelClientReportImage(token: string, id: string, file: Blob, fileName: string) {
  const formData = new FormData();
  formData.append("image", file, fileName);

  const { response, payload } = await requestJson(buildPathWithId(CLIENT_REPORT_IMAGE_UPLOAD_PATH, id), token, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new PanelClientReportsApiError(extractMessage(payload, "Não foi possível enviar imagem."), response.status);
  }

  const src = isRecord(payload) ? getFirstString([payload.src]) : null;

  if (!src) {
    throw new PanelClientReportsApiError("A API respondeu, mas a imagem enviada não foi reconhecida.");
  }

  return { src };
}

export async function refreshPanelClientReportDataSnapshot(token: string, id: string) {
  const { response, payload } = await requestJson(buildPathWithId(CLIENT_REPORT_REFRESH_DATA_PATH, id), token, {
    method: "POST",
  });

  if (!response.ok) {
    throw new PanelClientReportsApiError(extractMessage(payload, "Não foi possível atualizar os dados do relatório."), response.status);
  }

  const report = normalizeClientReport(payload);
  if (!report) {
    throw new PanelClientReportsApiError("A API respondeu, mas o relatório atualizado não foi reconhecido.");
  }
  return report;
}

export async function deletePanelClientReport(token: string, id: string) {
  const { response, payload } = await requestJson(buildPathWithId(CLIENT_REPORT_DETAIL_PATH, id), token, {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 204) {
    throw new PanelClientReportsApiError(extractMessage(payload, "Não foi possível excluir relatório."), response.status);
  }
}
