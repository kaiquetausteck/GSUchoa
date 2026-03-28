import { useEffect, useRef, useState } from "react";

export const SITE_SECTION_ROUTES = [
  { label: "Inicio", id: "inicio", href: "/", legacyPath: null },
  { label: "Resultados", id: "resultados", href: "/#resultados", legacyPath: "/resultados" },
  { label: "Sobre", id: "sobre", href: "/#sobre", legacyPath: "/sobre" },
  { label: "Serviços", id: "servicos", href: "/#servicos", legacyPath: "/servicos" },
  { label: "Processo", id: "processo", href: "/#processo", legacyPath: "/processo" },
  { label: "Cases", id: "cases", href: "/#cases", legacyPath: null },
  { label: "Depoimentos", id: "depoimentos", href: "/#depoimentos", legacyPath: null },
  { label: "Contato", id: "contato", href: "/#contato", legacyPath: "/contato" },
] as const;

export type SectionId = (typeof SITE_SECTION_ROUTES)[number]["id"];

const SECTION_OFFSET = 96;

export function getSiteSectionRouteById(sectionId: SectionId) {
  return SITE_SECTION_ROUTES.find((route) => route.id === sectionId) ?? SITE_SECTION_ROUTES[0];
}

function getSectionIdFromHash(hash: string): SectionId {
  const normalizedHash = hash.replace(/^#/, "").trim();

  if (!normalizedHash) {
    return "inicio";
  }

  return getSiteSectionRouteById(normalizedHash as SectionId).id;
}

function getScrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") {
    return "auto";
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

export function scrollToSiteSection(
  sectionId: SectionId,
  behavior: ScrollBehavior = getScrollBehavior(),
) {
  if (typeof window === "undefined") {
    return;
  }

  if (sectionId === "inicio") {
    window.scrollTo({ top: 0, behavior });
    return;
  }

  const section = document.getElementById(sectionId);
  if (!section) {
    return;
  }

  const top = section.getBoundingClientRect().top + window.scrollY - SECTION_OFFSET;
  window.scrollTo({ top, behavior });
}

function syncSectionUrl(sectionId: SectionId, mode: "push" | "replace" = "replace") {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname !== "/") {
    return;
  }

  const nextUrl = sectionId === "inicio" ? "/" : `/#${sectionId}`;
  const currentUrl = `${window.location.pathname}${window.location.hash}`;

  if (currentUrl === nextUrl) {
    return;
  }

  window.history[mode === "push" ? "pushState" : "replaceState"](null, "", nextUrl);
}

export function useSectionAnchors() {
  const pendingSectionIdRef = useRef<SectionId | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<SectionId>(() =>
    typeof window === "undefined" ? "inicio" : getSectionIdFromHash(window.location.hash),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.location.pathname !== "/") {
      return;
    }

    const syncFromUrl = () => {
      const sectionId = getSectionIdFromHash(window.location.hash);

      pendingSectionIdRef.current = sectionId === "inicio" ? null : sectionId;
      setActiveSectionId(sectionId);

      const initialScrollId = window.setTimeout(() => {
        scrollToSiteSection(sectionId, "auto");
      }, 0);

      return () => {
        window.clearTimeout(initialScrollId);
      };
    };

    const cleanupInitialScroll = syncFromUrl();
    window.addEventListener("hashchange", syncFromUrl);
    window.addEventListener("popstate", syncFromUrl);

    return () => {
      cleanupInitialScroll?.();
      window.removeEventListener("hashchange", syncFromUrl);
      window.removeEventListener("popstate", syncFromUrl);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.location.pathname !== "/") {
      return;
    }

    const sections = SITE_SECTION_ROUTES.map((route) => document.getElementById(route.id)).filter(
      (section): section is HTMLElement => section instanceof HTMLElement,
    );

    const getScrollSectionId = (): SectionId => {
      if (window.scrollY <= 24) {
        return "inicio";
      }

      const referenceY = window.scrollY + SECTION_OFFSET + Math.min(window.innerHeight * 0.24, 180);
      let currentSectionId: SectionId = "inicio";

      sections.forEach((section) => {
        if (section.offsetTop <= referenceY) {
          currentSectionId = section.id as SectionId;
        }
      });

      return currentSectionId;
    };

    const syncActiveSection = () => {
      const pendingSectionId = pendingSectionIdRef.current;

      if (pendingSectionId) {
        const pendingSection = document.getElementById(pendingSectionId);

        if (pendingSection) {
          const topDistance = Math.abs(pendingSection.getBoundingClientRect().top - SECTION_OFFSET);
          const hasReachedPending = topDistance <= 28 || getScrollSectionId() === pendingSectionId;

          if (!hasReachedPending) {
            return;
          }
        }

        pendingSectionIdRef.current = null;
      }

      const nextSectionId = getScrollSectionId();

      setActiveSectionId((currentSectionId) => {
        if (currentSectionId === nextSectionId) {
          return currentSectionId;
        }

        return nextSectionId;
      });
      syncSectionUrl(nextSectionId, "replace");
    };

    syncActiveSection();
    window.addEventListener("scroll", syncActiveSection, { passive: true });
    window.addEventListener("resize", syncActiveSection);

    return () => {
      window.removeEventListener("scroll", syncActiveSection);
      window.removeEventListener("resize", syncActiveSection);
    };
  }, []);

  const navigateToSection = (sectionId: SectionId) => {
    pendingSectionIdRef.current = sectionId === "inicio" ? null : sectionId;
    setActiveSectionId(sectionId);
    syncSectionUrl(sectionId, "push");
    scrollToSiteSection(sectionId);
  };

  return {
    activeSectionId,
    navigateToSection,
  };
}
