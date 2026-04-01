import { Menu, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

import logoWordmark from "../../assets/shared/brand/logo-wordmark.png";
import { LogoIconAnimated } from "../shared/LogoIconAnimated";
import { ThemeSwitch } from "./ThemeSwitch";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const ROUTE_NAV_ITEMS = [
  { key: "resultados", label: "Resultados", to: "/#resultados" },
  { key: "sobre", label: "Sobre", to: "/#sobre" },
  { key: "servicos", label: "Serviços", to: "/#servicos" },
  { key: "processo", label: "Processo", to: "/#processo" },
  { key: "cases", label: "Cases", to: "/cases" },
  { key: "depoimentos", label: "Depoimentos", to: "/depoimentos" },
  { key: "contato", label: "Contato", to: "/#contato" },
] as const;

export function SiteRouteShell({
  children,
  activeNavKey = null,
}: {
  children: ReactNode;
  activeNavKey?: (typeof ROUTE_NAV_ITEMS)[number]["key"] | null;
}) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <div className="site-shell min-h-screen bg-background text-on-surface">
      <nav className="nav-elevated fixed top-0 z-50 h-20 w-full bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-6 md:px-8">
          <Link className="flex items-center gap-3" to="/">
            <LogoIconAnimated className="logo-icon-theme h-10 w-auto flex-none" title="GSUCHOA Icon" />
            <img
              alt="GSUCHOA Wordmark"
              className="wordmark-theme h-6 w-auto object-contain md:h-7"
              src={logoWordmark}
            />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {ROUTE_NAV_ITEMS.map((item) => (
              <Link
                className={`text-sm font-medium transition-colors duration-300 ${
                  activeNavKey === item.key
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
                key={item.key}
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeSwitch />
            <Link
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold tracking-tight text-white transition-all duration-300 hover:opacity-90 active:scale-95"
              to="/#contato"
            >
              Falar com um especialista
            </Link>
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
            {ROUTE_NAV_ITEMS.map((item) => (
              <Link
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                  activeNavKey === item.key
                    ? "bg-surface-container-high text-primary"
                    : "text-on-surface hover:bg-surface-container-high hover:text-primary"
                }`}
                key={item.key}
                onClick={() => setMobileOpen(false)}
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
            <Link
              className="mt-3 inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white"
              onClick={() => setMobileOpen(false)}
              to="/#contato"
            >
              Falar com um especialista
            </Link>
          </div>
        </div>
      </motion.div>

      <main className="site-shell pt-20">{children}</main>

      <footer className="border-t border-outline-variant/10 bg-surface-container-low px-6 py-12 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-center md:text-left">
            <Link
              className="mb-4 flex items-center justify-center gap-4 md:justify-start"
              to="/"
            >
              <LogoIconAnimated className="logo-icon-theme h-12 w-auto flex-none" title="GSUCHOA Icon" />
              <img
                alt="GSUCHOA Wordmark"
                className="wordmark-theme h-6 w-auto object-contain"
                src={logoWordmark}
              />
            </Link>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant opacity-60">
              © 2026 GSUCHOA. Estratégia digital de alta performance.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            <Link className="text-xs uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary" to="/">
              Início
            </Link>
            <Link className="text-xs uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary" to="/cases">
              Cases
            </Link>
            <Link className="text-xs uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary" to="/clientes">
              Clientes
            </Link>
            <Link className="text-xs uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary" to="/depoimentos">
              Depoimentos
            </Link>
            <a
              className="text-xs uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
              href="/politica-de-privacidade.html"
            >
              Privacidade
            </a>
            <a
              className="text-xs uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
              href="/termos-de-servico.html"
            >
              Termos
            </a>
            <Link className="text-xs uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary" to="/#contato">
              Contato
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
