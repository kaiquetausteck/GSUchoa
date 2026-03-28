import { motion } from "motion/react";

import { LogoIconAnimated } from "../shared/LogoIconAnimated";

const LOOP_EASE = [0.37, 0, 0.63, 1] as const;

const HIGHLIGHTS = ["Design", "Growth", "Systems"];

export function HeroSignaturePanel() {
  return (
    <div className="absolute bottom-6 left-6 right-6 p-2 pb-5">
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between gap-4 px-2">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-primary/90">
              GSUCHOA Core
            </span>
            <p className="hero-signature-copy-strong mt-2 text-sm font-semibold">
              Design, estrategia e tecnologia atuando em sincronia.
            </p>
          </div>
        </div>

        <div className="hero-signature-shell relative mb-5 flex min-h-[12rem] items-center justify-center overflow-hidden rounded-[1.75rem] border px-6 py-10 backdrop-blur-md">
          <div className="hero-signature-shell-overlay absolute inset-0" />
          <div className="hero-signature-line absolute inset-x-10 top-0 h-px" />
          <motion.div
            animate={{ opacity: [0.25, 0.5, 0.25], scale: [0.92, 1.04, 0.92] }}
            className="absolute h-32 w-32 rounded-full border border-primary/30"
            transition={{ duration: 4.6, ease: LOOP_EASE, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.div
            animate={{ opacity: [0.2, 0.42, 0.2], scale: [1.02, 1.18, 1.02] }}
            className="hero-signature-ring absolute h-48 w-48 rounded-full border"
            transition={{ duration: 5.4, ease: LOOP_EASE, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
          />
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, 1.5, 0] }}
            className="relative z-10 flex items-center justify-center"
            transition={{ duration: 4.2, ease: LOOP_EASE, repeat: Number.POSITIVE_INFINITY }}
          >
            <div className="absolute h-32 w-32 rounded-full bg-primary/30 blur-3xl" />
            <div className="hero-signature-orb absolute inset-[-26%] rounded-full border blur-md" />
            <LogoIconAnimated
              className="logo-icon-theme relative w-24 drop-shadow-[0_0_24px_rgba(34,98,240,0.28)]"
              delay={0.2}
              decorative
              title="GSUCHOA Core Symbol"
            />
          </motion.div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-2">
          <div className="flex flex-wrap gap-2">
            {HIGHLIGHTS.map((item) => (
              <span
                key={item}
                className="hero-signature-chip rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] backdrop-blur-md"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="hero-signature-copy-muted flex-1 text-right text-xs leading-relaxed">
            Uma identidade viva para traduzir presenca premium e movimento continuo.
          </p>
        </div>
      </div>
    </div>
  );
}
