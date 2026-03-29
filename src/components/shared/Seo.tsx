import { useEffect } from "react";

import {
  DEFAULT_INDEX_ROBOTS,
  DEFAULT_NOINDEX_ROBOTS,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_IMAGE_PATH,
  DEFAULT_SITE_KEYWORDS,
  SITE_NAME,
  buildAbsoluteUrl,
  buildCanonicalUrl,
  normalizeSeoText,
  resolveSeoTitle,
} from "../../config/site/seo";

type StructuredData = Record<string, unknown>;

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertLink(rel: string, href: string, attributes: Record<string, string> = {}) {
  const selectorAttributes = Object.entries(attributes)
    .map(([key, value]) => `[${key}="${value}"]`)
    .join("");

  let element = document.head.querySelector(`link[rel="${rel}"]${selectorAttributes}`);

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
}

function setStructuredData(structuredData?: StructuredData | StructuredData[] | null) {
  const scriptId = "app-seo-structured-data";
  const existingScript = document.getElementById(scriptId);

  if (!structuredData || (Array.isArray(structuredData) && structuredData.length === 0)) {
    existingScript?.remove();
    return;
  }

  const payload = Array.isArray(structuredData) ? structuredData : [structuredData];
  const nextContent = JSON.stringify(payload);

  if (existingScript instanceof HTMLScriptElement) {
    existingScript.textContent = nextContent;
    return;
  }

  const script = document.createElement("script");
  script.id = scriptId;
  script.type = "application/ld+json";
  script.textContent = nextContent;
  document.head.appendChild(script);
}

export function Seo({
  description = DEFAULT_SITE_DESCRIPTION,
  image = DEFAULT_SITE_IMAGE_PATH,
  keywords = DEFAULT_SITE_KEYWORDS,
  noindex = false,
  path,
  robots,
  structuredData,
  title,
  type = "website",
}: {
  description?: string;
  image?: string;
  keywords?: string;
  noindex?: boolean;
  path?: string;
  robots?: string;
  structuredData?: StructuredData | StructuredData[] | null;
  title?: string;
  type?: "article" | "profile" | "website";
}) {
  useEffect(() => {
    const canonicalUrl = buildCanonicalUrl(path);
    const resolvedTitle = resolveSeoTitle(title);
    const resolvedDescription = normalizeSeoText(description);
    const resolvedImage = buildAbsoluteUrl(image);
    const resolvedRobots = noindex ? DEFAULT_NOINDEX_ROBOTS : robots ?? DEFAULT_INDEX_ROBOTS;

    document.title = resolvedTitle;

    upsertMeta("name", "description", resolvedDescription);
    upsertMeta("name", "keywords", keywords);
    upsertMeta("name", "robots", resolvedRobots);

    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", "pt_BR");
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:title", resolvedTitle);
    upsertMeta("property", "og:description", resolvedDescription);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:image", resolvedImage);
    upsertMeta("property", "og:image:alt", `Identidade visual da ${SITE_NAME}`);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", resolvedTitle);
    upsertMeta("name", "twitter:description", resolvedDescription);
    upsertMeta("name", "twitter:image", resolvedImage);

    upsertLink("canonical", canonicalUrl);
    upsertLink("alternate", canonicalUrl, { hreflang: "pt-BR" });
    upsertLink("alternate", canonicalUrl, { hreflang: "x-default" });

    setStructuredData(structuredData);
  }, [description, image, keywords, noindex, path, robots, structuredData, title, type]);

  return null;
}
