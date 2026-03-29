import { Menu, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

import logoWordmark from "../../assets/shared/brand/logo-wordmark.png";
import {
  SITE_SECTION_ROUTES,
  type SectionId,
} from "../../hooks/site/useSectionAnchors";
import { LogoIconAnimated } from "../shared/LogoIconAnimated";
import { SectionLink } from "./SectionLink";
import { ThemeSwitch } from "./ThemeSwitch";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const NAV_SECTION_ROUTES = SITE_SECTION_ROUTES.filter((route) => route.id !== "inicio");

export function SiteNavbar({
  activeSectionId,
  onNavigate,
}: {
  activeSectionId: SectionId;
  onNavigate: (sectionId: SectionId) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const closeMenu = () => setMobileOpen(false);
    window.addEventListener("popstate", closeMenu);

    return () => window.removeEventListener("popstate", closeMenu);
  }, []);

  return (
    <>
      <nav className="nav-elevated fixed top-0 z-50 h-20 w-full bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-6 md:px-8">
          <SectionLink className="flex items-center gap-3" onNavigate={onNavigate} sectionId="inicio">
            <LogoIconAnimated className="logo-icon-theme h-10 w-auto flex-none" title="GSUCHOA Icon" />
            <img
              alt="GSUCHOA Wordmark"
              className="wordmark-theme h-6 w-auto object-contain md:h-7"
              src={logoWordmark}
            />
          </SectionLink>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_SECTION_ROUTES.map((item) => (
              <SectionLink
                key={item.id}
                className={`text-sm font-medium transition-colors duration-300 ${
                  activeSectionId === item.id
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
                onNavigate={onNavigate}
                sectionId={item.id}
              >
                {item.label}
              </SectionLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeSwitch />
            <SectionLink
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold tracking-tight text-white transition-all duration-300 hover:opacity-90 active:scale-95"
              onNavigate={onNavigate}
              sectionId="contato"
            >
              Falar com um especialista
            </SectionLink>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeSwitch compact />
            <button
              aria-expanded={mobileOpen}
              aria-label="Abrir menu"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-container-high text-on-surface transition-colors hover:border-primary/40 hover:text-primary"
              onClick={() => setMobileOpen((current) => !current)}
              type="button"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      <motion.div
        animate={mobileOpen ? "open" : "closed"}
        className={`fixed inset-x-4 top-24 z-40 overflow-hidden md:hidden ${mobileOpen ? "" : "pointer-events-none"}`}
        initial={false}
        variants={{
          open: {
            opacity: 1,
            y: 0,
            height: "auto",
            transition: { duration: 0.3, ease: EASE_OUT },
          },
          closed: {
            opacity: 0,
            y: -16,
            height: 0,
            transition: { duration: 0.22, ease: EASE_OUT },
          },
        }}
      >
        <div className="drawer-elevated rounded-[1.75rem] border border-outline-variant/20 bg-surface-container p-4">
          <div className="flex flex-col gap-2">
            <div className="mb-1 flex items-center justify-between rounded-2xl border border-outline-variant/15 bg-surface-container-high px-4 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
                Tema
              </span>
              <ThemeSwitch compact />
            </div>
            {NAV_SECTION_ROUTES.map((item) => (
              <SectionLink
                key={item.id}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                  activeSectionId === item.id
                    ? "bg-surface-container-high text-primary"
                    : "text-on-surface hover:bg-surface-container-high hover:text-primary"
                }`}
                onClick={() => setMobileOpen(false)}
                onNavigate={onNavigate}
                sectionId={item.id}
              >
                {item.label}
              </SectionLink>
            ))}
            <SectionLink
              className="mt-3 inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white"
              onClick={() => setMobileOpen(false)}
              onNavigate={onNavigate}
              sectionId="contato"
            >
              Falar com um especialista
            </SectionLink>
          </div>
        </div>
      </motion.div>
    </>
  );
}
