import { motion } from "motion/react";

import { LogoIconAnimated } from "../shared/LogoIconAnimated";

const LOOP_EASE = [0.37, 0, 0.63, 1] as const;

const HIGHLIGHTS = ["Design", "Crescimento", "Sistemas"];

export function HeroSignaturePanel() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      className="hero-signature-floating relative w-full max-w-[24rem]"
      transition={{ duration: 9, ease: LOOP_EASE, repeat: Number.POSITIVE_INFINITY }}
    >
      <motion.div
        animate={{ x: [-10, 8, -10], y: [-8, 12, -8], scale: [1, 1.06, 1] }}
        className="hero-signature-aurora-primary pointer-events-none absolute -left-8 top-4 h-36 w-36 rounded-full blur-3xl"
        transition={{ duration: 12, ease: LOOP_EASE, repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        animate={{ x: [10, -14, 10], y: [0, 10, 0], scale: [1.04, 0.98, 1.04] }}
        className="hero-signature-aurora-secondary pointer-events-none absolute -right-6 bottom-12 h-40 w-40 rounded-full blur-3xl"
        transition={{ duration: 13.5, ease: LOOP_EASE, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
      />
      <div className="hero-signature-grid pointer-events-none absolute inset-0" />
      <div className="hero-signature-noise pointer-events-none absolute inset-0" />
      <div className="hero-signature-shell-overlay pointer-events-none absolute inset-0" />

      <div className="relative z-10 flex min-h-[29rem] flex-col px-6 py-6 xl:px-7 xl:py-7">
        <div className="max-w-[15rem]">
          <span className="hero-signature-eyebrow block text-[10px] font-black uppercase tracking-[0.34em]">
            NÚCLEO GSUCHOA
          </span>
          <p className="hero-signature-copy-strong mt-3 text-sm font-semibold leading-relaxed">
            Design, estratégia e tecnologia em sinergia.
          </p>
        </div>

        <div className="relative flex flex-1 items-center justify-center py-8">
          <div className="hero-signature-energy-line pointer-events-none absolute inset-x-5 top-1/2 h-px -translate-y-1/2" />
          <motion.div
            animate={{ opacity: [0.42, 0.88, 0.42], scale: [0.9, 1.08, 0.9] }}
            className="hero-signature-core-glow pointer-events-none absolute h-36 w-36 rounded-full blur-3xl"
            transition={{ duration: 4.8, ease: LOOP_EASE, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.div
            animate={{ opacity: [0.2, 0.42, 0.2], scale: [0.94, 1.08, 0.94] }}
            className="hero-signature-ring pointer-events-none absolute h-44 w-44 rounded-full border"
            transition={{ duration: 5.2, ease: LOOP_EASE, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.div
            animate={{ opacity: [0.14, 0.3, 0.14], scale: [1.02, 1.16, 1.02] }}
            className="hero-signature-ring-secondary pointer-events-none absolute h-60 w-60 rounded-full border"
            transition={{ duration: 6.4, ease: LOOP_EASE, repeat: Number.POSITIVE_INFINITY, delay: 0.25 }}
          />
          <motion.div
            animate={{ rotate: [0, 180] }}
            className="hero-signature-orbit-frame pointer-events-none absolute h-52 w-52 rounded-full border"
            transition={{ duration: 20, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, 1.5, 0], scale: [1, 1.02, 1] }}
            className="relative z-10 flex items-center justify-center"
            transition={{ duration: 4.2, ease: LOOP_EASE, repeat: Number.POSITIVE_INFINITY }}
          >
            <div className="hero-signature-core relative flex h-48 w-48 items-center justify-center rounded-full p-8">
              <div className="hero-signature-core-inner pointer-events-none absolute inset-[12%] rounded-full" />
              <div className="hero-signature-core-halo pointer-events-none absolute inset-[-22%] rounded-full" />
              <div className="hero-signature-orb pointer-events-none absolute inset-0 rounded-full" />
              <LogoIconAnimated
                className="hero-signature-logo logo-icon-theme relative z-10 w-24"
                delay={0.2}
                decorative
                title="GSUCHOA Core Symbol"
              />
            </div>
          </motion.div>
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          {HIGHLIGHTS.map((item) => (
            <span
              key={item}
              className="hero-signature-chip rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] backdrop-blur-xl"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
