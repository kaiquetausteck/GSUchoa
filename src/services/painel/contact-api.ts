const PANEL_API_BASE_URL = (import.meta.env.VITE_PANEL_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

const PANEL_CONTACTS_PATH = import.meta.env.VITE_PANEL_ADMIN_CONTACTS_PATH ?? "/admin/contact";
const PANEL_CONTACT_DETAIL_PATH = import.meta.env.VITE_PANEL_ADMIN_CONTACT_DETAIL_PATH ?? "/admin/contact/:id";
const PANEL_CONTACT_UPDATE_PATH = import.meta.env.VITE_PANEL_ADMIN_CONTACT_UPDATE_PATH ?? PANEL_CONTACT_DETAIL_PATH;
const PANEL_CONTACT_STATUS_PATH = import.meta.env.VITE_PANEL_ADMIN_CONTACT_STATUS_PATH ?? "/admin/contact/:id/status";
const PANEL_CONTACT_FUNNEL_SUMMARY_PATH =
  import.meta.env.VITE_PANEL_ADMIN_CONTACT_FUNNEL_SUMMARY_PATH ?? "/admin/contact/funnel/summary";

export const PANEL_CONTACT_STATUS_VALUES = [
  "new",
  "qualified",
  "contacted",
  "meeting_scheduled",
  "proposal_sent",
  "won",
  "lost",
  "archived",
] as const;

export type PanelContactStatus = (typeof PANEL_CONTACT_STATUS_VALUES)[number];

export type PanelContactSort =
  | "createdAt-desc"
  | "createdAt-asc"
  | "fullName-asc"
  | "fullName-desc"
  | "status-asc"
  | "status-desc";

export type PanelContactSummaryRecord = {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  status: PanelContactStatus;
  source: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type PanelContactDetailRecord = PanelContactSummaryRecord & {
  message: string;
  notes: string | null;
  statusUpdatedAt: string | null;
};

export type PanelContactFunnelRecord = PanelContactSummaryRecord & {
  message: string | null;
  notes: string | null;
  statusUpdatedAt: string | null;
};

export type PanelContactListFilters = {
  page: number;
  limit: number;
  search?: string;
  status?: PanelContactStatus | "all";
  createdFrom?: string;
  createdTo?: string;
  sort?: PanelContactSort;
};

export type PanelContactListResponse = {
  items: PanelContactSummaryRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PanelContactFunnelSummaryItem = {
  status: PanelContactStatus;
  count: number;
};

export type PanelContactUpdateInput = {
  status?: PanelContactStatus;
  notes?: string | null;
  source?: string | null;
};

type JsonRecord = Record<string, unknown>;

class PanelContactApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PanelContactApiError";
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
    throw new PanelContactApiError(
      `Não foi possível conectar com a API em ${PANEL_API_BASE_URL}. Verifique se o backend está ativo.`,
    );
  }

  const payload = await parseJsonSafe(response);

  return {
    response,
    payload,
  };
}

function normalizeContactStatus(value: unknown): PanelContactStatus | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return PANEL_CONTACT_STATUS_VALUES.includes(normalizedValue as PanelContactStatus)
    ? (normalizedValue as PanelContactStatus)
    : null;
}

function normalizeNotes(value: unknown) {
  if (typeof value === "string") {
    return value.trim() || null;
  }

  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const flattened = value.flatMap((item) => extractStringList(item));
    return flattened.length ? flattened.join(" ") : JSON.stringify(value);
  }

  if (isRecord(value)) {
    const preferredValue = getFirstString([value.note, value.notes, value.message, value.text, value.value]);
    return preferredValue ?? JSON.stringify(value);
  }

  return null;
}

function normalizePanelContactSummary(payload: unknown): PanelContactSummaryRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id]);
  const fullName = getFirstString([payload.fullName, payload.name]);
  const email = getFirstString([payload.email]);
  const whatsapp = getFirstString([payload.whatsapp, payload.phone]);
  const status = normalizeContactStatus(payload.status);
  const createdAt = getFirstString([payload.createdAt]);

  if (!id || !fullName || !email || !whatsapp || !status || !createdAt) {
    return null;
  }

  return {
    id,
    fullName,
    email,
    whatsapp,
    status,
    source: getFirstString([payload.source]),
    createdAt,
    updatedAt: getFirstString([payload.updatedAt]),
  };
}

function normalizePanelContactDetail(payload: unknown): PanelContactDetailRecord | null {
  const summary = normalizePanelContactSummary(payload);

  if (!summary || !isRecord(payload)) {
    return null;
  }

  const message = getFirstString([payload.message]);

  if (!message) {
    return null;
  }

  return {
    ...summary,
    message,
    notes: normalizeNotes(payload.notes),
    statusUpdatedAt: getFirstString([payload.statusUpdatedAt]),
    updatedAt: getFirstString([payload.updatedAt, summary.updatedAt]),
  };
}

function normalizeListPayload(payload: unknown): PanelContactListResponse {
  const itemsRaw = isRecord(payload) && Array.isArray(payload.data) ? payload.data : [];
  const meta = isRecord(payload) && isRecord(payload.meta) ? payload.meta : {};

  return {
    items: itemsRaw
      .map((item) => normalizePanelContactSummary(item))
      .filter((item): item is PanelContactSummaryRecord => item !== null),
    page: getFirstNumber([meta.page]) ?? 1,
    limit: getFirstNumber([meta.limit]) ?? (itemsRaw.length > 0 ? itemsRaw.length : 10),
    total: getFirstNumber([meta.total]) ?? itemsRaw.length,
    totalPages: getFirstNumber([meta.totalPages]) ?? 1,
  };
}

function buildListPath(filters: PanelContactListFilters) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(filters.page));
  searchParams.set("limit", String(filters.limit));

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim());
  }

  if (filters.status && filters.status !== "all") {
    searchParams.set("status", filters.status);
  }

  if (filters.createdFrom) {
    searchParams.set("createdFrom", filters.createdFrom);
  }

  if (filters.createdTo) {
    searchParams.set("createdTo", filters.createdTo);
  }

  if (filters.sort) {
    searchParams.set("sort", filters.sort);
  }

  return `${PANEL_CONTACTS_PATH}?${searchParams.toString()}`;
}

export async function listPanelContacts(token: string, filters: PanelContactListFilters) {
  const { response, payload } = await requestJson(buildListPath(filters), token);

  if (!response.ok) {
    throw new PanelContactApiError(
      extractMessage(payload, "Não foi possível carregar os contatos."),
      response.status,
    );
  }

  return normalizeListPayload(payload);
}

export async function listAllPanelContactsForFunnel(
  token: string,
  filters?: {
    createdFrom?: string;
    createdTo?: string;
  },
) {
  const allItems: PanelContactSummaryRecord[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await listPanelContacts(token, {
      page,
      limit: 100,
      sort: "createdAt-desc",
      createdFrom: filters?.createdFrom,
      createdTo: filters?.createdTo,
    });

    allItems.push(...response.items);
    totalPages = response.totalPages;
    page += 1;
  } while (page <= totalPages);

  return allItems;
}

export async function listPanelContactFunnelSummary(
  token: string,
  filters?: {
    createdFrom?: string;
    createdTo?: string;
  },
) {
  const searchParams = new URLSearchParams();

  if (filters?.createdFrom) {
    searchParams.set("createdFrom", filters.createdFrom);
  }

  if (filters?.createdTo) {
    searchParams.set("createdTo", filters.createdTo);
  }

  const path = searchParams.size
    ? `${PANEL_CONTACT_FUNNEL_SUMMARY_PATH}?${searchParams.toString()}`
    : PANEL_CONTACT_FUNNEL_SUMMARY_PATH;
  const { response, payload } = await requestJson(path, token);

  if (!response.ok) {
    throw new PanelContactApiError(
      extractMessage(payload, "Não foi possível carregar o resumo do funil."),
      response.status,
    );
  }

  const itemsRaw = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.data)
      ? payload.data
      : [];

  return itemsRaw
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const status = normalizeContactStatus(item.status);
      const count = getFirstNumber([item.count]);

      if (!status || count === null) {
        return null;
      }

      return {
        status,
        count,
      } satisfies PanelContactFunnelSummaryItem;
    })
    .filter((item): item is PanelContactFunnelSummaryItem => item !== null);
}

export async function getPanelContactById(token: string, id: string) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_CONTACT_DETAIL_PATH, id), token);

  if (!response.ok) {
    throw new PanelContactApiError(
      extractMessage(payload, "Não foi possível carregar este contato."),
      response.status,
    );
  }

  const item = normalizePanelContactDetail(isRecord(payload) && isRecord(payload.data) ? payload.data : payload);

  if (!item) {
    throw new PanelContactApiError("A API retornou um contato em formato inesperado.", response.status);
  }

  return item;
}

export async function updatePanelContact(token: string, input: { id: string } & PanelContactUpdateInput) {
  const { id, notes, source, status } = input;
  const payloadBody: Record<string, unknown> = {};

  if (status) {
    payloadBody.status = status;
  }

  if (notes !== undefined) {
    payloadBody.notes = notes;
  }

  if (source !== undefined) {
    payloadBody.source = source;
  }

  const { response, payload } = await requestJson(buildPathWithId(PANEL_CONTACT_UPDATE_PATH, id), token, {
    method: "PATCH",
    body: JSON.stringify(payloadBody),
  });

  if (!response.ok) {
    throw new PanelContactApiError(
      extractMessage(payload, "Não foi possível salvar as alterações deste contato."),
      response.status,
    );
  }

  const item = normalizePanelContactDetail(isRecord(payload) && isRecord(payload.data) ? payload.data : payload);

  if (!item) {
    throw new PanelContactApiError("A API retornou um contato em formato inesperado.", response.status);
  }

  return item;
}

export async function updatePanelContactStatus(token: string, id: string, status: PanelContactStatus) {
  const { response, payload } = await requestJson(buildPathWithId(PANEL_CONTACT_STATUS_PATH, id), token, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new PanelContactApiError(
      extractMessage(payload, "Não foi possível atualizar o status deste contato."),
      response.status,
    );
  }

  const item = normalizePanelContactDetail(isRecord(payload) && isRecord(payload.data) ? payload.data : payload);

  if (!item) {
    throw new PanelContactApiError("A API retornou um contato em formato inesperado.", response.status);
  }

  return item;
}

export async function archivePanelContact(token: string, id: string) {
  return updatePanelContactStatus(token, id, "archived");
}
