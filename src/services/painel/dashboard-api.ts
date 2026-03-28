const PANEL_API_BASE_URL = (import.meta.env.VITE_PANEL_API_URL ?? "http://localhost:3000").replace(/\/$/, "");
const PANEL_DASHBOARD_PATH = import.meta.env.VITE_PANEL_DASHBOARD_PATH ?? "/admin/dashboard";

export type PanelDashboardRange = "7d" | "30d" | "12m";

export type PanelDashboardUsersSummary = {
  total: number;
  active: number;
  inactive: number;
};

export type PanelDashboardContentSummary = {
  total: number;
  published: number;
  featured: number;
  draft: number;
};

export type PanelDashboardSummary = {
  users: PanelDashboardUsersSummary;
  clients: PanelDashboardContentSummary;
  portfolio: PanelDashboardContentSummary;
  testimonials: PanelDashboardContentSummary;
};

export type PanelDashboardDistributionItem = {
  label: string;
  count: number;
};

export type PanelDashboardDistributions = {
  clientsStatus: PanelDashboardDistributionItem[];
  portfolioStatus: PanelDashboardDistributionItem[];
  testimonialsStatus: PanelDashboardDistributionItem[];
};

export type PanelDashboardTimelineItem = {
  date: string;
  users: number;
  clients: number;
  portfolio: number;
  testimonials: number;
};

export type PanelDashboardRecentUserItem = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
};

export type PanelDashboardRecentContentItem = {
  id: string;
  title: string;
  slug: string | null;
  subtitle: string | null;
  isPublished: boolean | null;
  createdAt: string;
};

export type PanelDashboardRecent = {
  users: PanelDashboardRecentUserItem[];
  clients: PanelDashboardRecentContentItem[];
  portfolio: PanelDashboardRecentContentItem[];
  testimonials: PanelDashboardRecentContentItem[];
};

export type PanelDashboardHighlights = {
  totalPublishedContent: number;
  totalDraftContent: number;
  featuredItemsOnSite: number;
  publicationRateClients: number;
  publicationRatePortfolio: number;
  publicationRateTestimonials: number;
};

export type PanelDashboardResponse = {
  summary: PanelDashboardSummary;
  distributions: PanelDashboardDistributions;
  timeline: PanelDashboardTimelineItem[];
  recent: PanelDashboardRecent;
  highlights: PanelDashboardHighlights;
};

type JsonRecord = Record<string, unknown>;

class PanelDashboardApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PanelDashboardApiError";
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

      if (["true", "1", "yes", "sim", "published", "active"].includes(normalized)) {
        return true;
      }

      if (["false", "0", "no", "nao", "draft", "inactive"].includes(normalized)) {
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

async function requestJson(path: string, token: string) {
  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new PanelDashboardApiError(
      `Nao foi possivel conectar com a API em ${PANEL_API_BASE_URL}. Verifique se o backend esta ativo.`,
    );
  }

  const payload = await parseJsonSafe(response);

  return {
    response,
    payload,
  };
}

function normalizeContentSummary(payload: unknown): PanelDashboardContentSummary | null {
  if (!isRecord(payload)) {
    return null;
  }

  return {
    total: getFirstNumber([payload.total]) ?? 0,
    published: getFirstNumber([payload.published]) ?? 0,
    featured: getFirstNumber([payload.featured]) ?? 0,
    draft: getFirstNumber([payload.draft]) ?? 0,
  };
}

function normalizeUsersSummary(payload: unknown): PanelDashboardUsersSummary | null {
  if (!isRecord(payload)) {
    return null;
  }

  return {
    total: getFirstNumber([payload.total]) ?? 0,
    active: getFirstNumber([payload.active]) ?? 0,
    inactive: getFirstNumber([payload.inactive]) ?? 0,
  };
}

function normalizeDistributionItem(payload: unknown): PanelDashboardDistributionItem | null {
  if (!isRecord(payload)) {
    return null;
  }

  const label = getFirstString([payload.label]);

  if (!label) {
    return null;
  }

  return {
    label,
    count: getFirstNumber([payload.count]) ?? 0,
  };
}

function normalizeTimelineItem(payload: unknown): PanelDashboardTimelineItem | null {
  if (!isRecord(payload)) {
    return null;
  }

  const date = getFirstString([payload.date]);

  if (!date) {
    return null;
  }

  return {
    date,
    users: getFirstNumber([payload.users]) ?? 0,
    clients: getFirstNumber([payload.clients]) ?? 0,
    portfolio: getFirstNumber([payload.portfolio]) ?? 0,
    testimonials: getFirstNumber([payload.testimonials]) ?? 0,
  };
}

function normalizeRecentUser(payload: unknown): PanelDashboardRecentUserItem | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id]);
  const name = getFirstString([payload.name]);
  const email = getFirstString([payload.email]);
  const createdAt = getFirstString([payload.createdAt]);

  if (!id || !name || !email || !createdAt) {
    return null;
  }

  return {
    id,
    name,
    email,
    isActive: getFirstBoolean([payload.isActive]) ?? false,
    createdAt,
  };
}

function normalizeRecentContent(payload: unknown): PanelDashboardRecentContentItem | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = getFirstString([payload.id]);
  const title = getFirstString([payload.title]);
  const createdAt = getFirstString([payload.createdAt]);

  if (!id || !title || !createdAt) {
    return null;
  }

  return {
    id,
    title,
    slug: getFirstString([payload.slug]),
    subtitle: getFirstString([payload.subtitle]),
    isPublished: getFirstBoolean([payload.isPublished]),
    createdAt,
  };
}

function normalizeDashboard(payload: unknown): PanelDashboardResponse | null {
  const source = isRecord(payload)
    ? isRecord(payload.data)
      ? payload.data
      : payload
    : null;

  if (!source || !isRecord(source)) {
    return null;
  }

  const summarySource = isRecord(source.summary) ? source.summary : null;
  const distributionsSource = isRecord(source.distributions) ? source.distributions : null;
  const recentSource = isRecord(source.recent) ? source.recent : null;
  const highlightsSource = isRecord(source.highlights) ? source.highlights : null;
  const timelineSource = Array.isArray(source.timeline) ? source.timeline : [];

  if (!summarySource || !distributionsSource || !recentSource || !highlightsSource) {
    return null;
  }

  const usersSummary = normalizeUsersSummary(summarySource.users);
  const clientsSummary = normalizeContentSummary(summarySource.clients);
  const portfolioSummary = normalizeContentSummary(summarySource.portfolio);
  const testimonialsSummary = normalizeContentSummary(summarySource.testimonials);

  if (!usersSummary || !clientsSummary || !portfolioSummary || !testimonialsSummary) {
    return null;
  }

  return {
    summary: {
      users: usersSummary,
      clients: clientsSummary,
      portfolio: portfolioSummary,
      testimonials: testimonialsSummary,
    },
    distributions: {
      clientsStatus: Array.isArray(distributionsSource.clientsStatus)
        ? distributionsSource.clientsStatus.map(normalizeDistributionItem).filter(Boolean)
        : [],
      portfolioStatus: Array.isArray(distributionsSource.portfolioStatus)
        ? distributionsSource.portfolioStatus.map(normalizeDistributionItem).filter(Boolean)
        : [],
      testimonialsStatus: Array.isArray(distributionsSource.testimonialsStatus)
        ? distributionsSource.testimonialsStatus.map(normalizeDistributionItem).filter(Boolean)
        : [],
    },
    timeline: timelineSource.map(normalizeTimelineItem).filter(Boolean),
    recent: {
      users: Array.isArray(recentSource.users)
        ? recentSource.users.map(normalizeRecentUser).filter(Boolean)
        : [],
      clients: Array.isArray(recentSource.clients)
        ? recentSource.clients.map(normalizeRecentContent).filter(Boolean)
        : [],
      portfolio: Array.isArray(recentSource.portfolio)
        ? recentSource.portfolio.map(normalizeRecentContent).filter(Boolean)
        : [],
      testimonials: Array.isArray(recentSource.testimonials)
        ? recentSource.testimonials.map(normalizeRecentContent).filter(Boolean)
        : [],
    },
    highlights: {
      totalPublishedContent: getFirstNumber([highlightsSource.totalPublishedContent]) ?? 0,
      totalDraftContent: getFirstNumber([highlightsSource.totalDraftContent]) ?? 0,
      featuredItemsOnSite: getFirstNumber([highlightsSource.featuredItemsOnSite]) ?? 0,
      publicationRateClients: getFirstNumber([highlightsSource.publicationRateClients]) ?? 0,
      publicationRatePortfolio: getFirstNumber([highlightsSource.publicationRatePortfolio]) ?? 0,
      publicationRateTestimonials: getFirstNumber([highlightsSource.publicationRateTestimonials]) ?? 0,
    },
  };
}

export async function fetchPanelDashboard(token: string, range: PanelDashboardRange) {
  const searchParams = new URLSearchParams({ range });
  const { response, payload } = await requestJson(
    `${PANEL_DASHBOARD_PATH}?${searchParams.toString()}`,
    token,
  );

  if (!response.ok) {
    throw new PanelDashboardApiError(
      extractMessage(payload, "Nao foi possivel carregar o dashboard agora."),
      response.status,
    );
  }

  const dashboard = normalizeDashboard(payload);

  if (!dashboard) {
    throw new PanelDashboardApiError(
      `A API respondeu ao endpoint ${PANEL_DASHBOARD_PATH}, mas o formato do dashboard nao foi reconhecido.`,
      response.status,
    );
  }

  return dashboard;
}
