export const SITE_NAME = "GSUCHOA";
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "https://gsuchoa.com").replace(/\/$/, "");
export const DEFAULT_SITE_TITLE = `${SITE_NAME} | Estratégia Digital de Alta Performance`;
export const DEFAULT_SITE_DESCRIPTION =
  "Agência de estratégia digital de alta performance focada em crescimento real através de design, conteúdo e tráfego.";
export const DEFAULT_SITE_IMAGE_PATH = "/brand/og-default.png";
export const DEFAULT_SITE_KEYWORDS =
  "estratégia digital, agência digital, marketing digital, tráfego pago, conteúdo, design, branding, performance, growth marketing";
export const DEFAULT_INDEX_ROBOTS =
  "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";
export const DEFAULT_NOINDEX_ROBOTS = "noindex,nofollow,noarchive";

export type SeoBreadcrumbItem = {
  name: string;
  path: string;
};

export function normalizeSeoText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function truncateSeoText(value: string, maxLength = 160) {
  const normalized = normalizeSeoText(value);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function resolveSeoTitle(title?: string) {
  if (!title) {
    return DEFAULT_SITE_TITLE;
  }

  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

export function buildAbsoluteUrl(pathOrUrl = "/") {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function buildCanonicalUrl(path?: string) {
  if (!path) {
    if (typeof window !== "undefined") {
      return buildAbsoluteUrl(window.location.pathname || "/");
    }

    return buildAbsoluteUrl("/");
  }

  return buildAbsoluteUrl(path);
}

export function createBreadcrumbStructuredData(items: SeoBreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildAbsoluteUrl(item.path),
    })),
  };
}
