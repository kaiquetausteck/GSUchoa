import { motion } from "motion/react";

import logoWordmark from "../../assets/shared/brand/logo-wordmark.png";
import { type SectionId } from "../../hooks/site/useSectionAnchors";
import { LogoIconAnimated } from "../shared/LogoIconAnimated";
import { SectionLink } from "./SectionLink";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function SiteFooter({
  onNavigate,
}: {
  onNavigate: (sectionId: SectionId) => void;
}) {
  return (
    <motion.footer
      className="w-full border-t border-outline-variant/10 bg-surface-container-low px-6 py-12 md:px-8"
      initial={{ opacity: 0, y: 32 }}
      transition={{ duration: 0.65, ease: EASE_OUT }}
      viewport={{ once: true, amount: 0.6 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
        <div className="text-center md:text-left">
          <SectionLink
            className="mb-4 flex items-center justify-center gap-4 md:justify-start"
            onNavigate={onNavigate}
            sectionId="inicio"
          >
            <LogoIconAnimated className="logo-icon-theme h-12 w-auto flex-none" title="GSUCHOA Icon" />
            <img
              alt="GSUCHOA Wordmark"
              className="wordmark-theme h-6 w-auto object-contain"
              src={logoWordmark}
            />
          </SectionLink>
          <p className="text-xs uppercase tracking-widest text-on-surface-variant opacity-60">
            © 2026 GSUCHOA. Estrategia Digital de Alta Performance.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {["Privacidade", "Termos de Uso", "LinkedIn", "Instagram"].map((link) => (
            <SectionLink
              key={link}
              className="text-xs uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
              onNavigate={onNavigate}
              sectionId="inicio"
            >
              {link}
            </SectionLink>
          ))}
        </div>
      </div>
    </motion.footer>
  );
}
