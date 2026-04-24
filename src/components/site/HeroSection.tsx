import { motion } from "motion/react";

import { type SectionId } from "../../hooks/site/useSectionAnchors";
import { useTypewriter } from "../../hooks/site/useTypewriter";
import { LogoIconAnimated } from "../shared/LogoIconAnimated";
import { AnimatedNumber } from "./AnimatedNumber";
import { HeroSignaturePanel } from "./HeroSignaturePanel";
import { SectionLink } from "./SectionLink";
import { TypewriterLine, TypewriterParagraph } from "./TypewriterText";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const HERO_STATS = [
  { label: "Projetos", value: 250, prefix: "+" },
  { label: "Marcas atendidas", value: 50, prefix: "+" },
  { label: "Anos de experiência", value: 10, prefix: "+" },
];

export function HeroSection({
  onNavigate,
}: {
  onNavigate: (sectionId: SectionId) => void;
}) {
  const heroDescriptionText =
    "A GSUCHOA é uma empresa de comunicação e publicidade estratégica. Unimos branding, conteúdo, design e performance para fortalecer a percepção da marca, gerar demanda qualificada e sustentar crescimento com consistência.";

  const titleLineOne = useTypewriter("Unimos estratégia", true, 18);
  const titleLineTwo = useTypewriter("e comunicação em", titleLineOne.complete, 16);
  const titleLineThree = useTypewriter("crescimento real", titleLineTwo.complete, 14);
  const description = useTypewriter(heroDescriptionText, titleLineThree.complete, 7);
  const showHeroBottom = description.complete;

  return (
    <section className="hero-section-shell relative flex min-h-screen items-center overflow-hidden pb-16 pt-24 md:pb-20 md:pt-28" id="inicio">
      <div className="brand-watermark pointer-events-none absolute right-[-10%] top-[10%] w-1/2 select-none opacity-[0.03]">
        <LogoIconAnimated animated={false} className="logo-icon-theme h-auto w-full" decorative />
      </div>
      <div className="hero-gradient absolute inset-0" />

      <div className="hero-section-grid relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-high px-3 py-1"
            initial={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Comunicação e publicidade estratégica
            </span>
          </motion.div>

          <h1 className="mb-8 text-5xl font-black leading-[0.9] tracking-tighter text-on-surface md:text-7xl lg:text-8xl">
            <TypewriterLine showCursor={!titleLineOne.complete} value={titleLineOne.value} />
            <TypewriterLine
              showCursor={titleLineOne.complete && !titleLineTwo.complete}
              value={titleLineTwo.value}
            />
            <TypewriterLine
              className="text-gradient"
              showCursor={titleLineTwo.complete && !titleLineThree.complete}
              value={titleLineThree.value}
            />
          </h1>

          <TypewriterParagraph
            className="mb-12 max-w-2xl text-xl font-light leading-relaxed text-on-surface-variant md:text-2xl"
            showCursor={titleLineThree.complete && !description.complete}
            value={description.value}
          />

          <motion.div
            animate={showHeroBottom ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
            aria-hidden={!showHeroBottom}
            className={showHeroBottom ? "" : "pointer-events-none"}
            initial={false}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            <div className="mb-16 flex flex-col gap-4 sm:flex-row">
              <SectionLink
                className="rounded-xl bg-primary px-10 py-5 text-center text-lg font-bold text-white transition-all hover:brightness-110 active:scale-95"
                onNavigate={onNavigate}
                sectionId="contato"
              >
                Fale com nossa equipe
              </SectionLink>
              <SectionLink
                className="hero-secondary-button rounded-xl border px-10 py-5 text-center text-lg font-bold active:scale-95"
                onNavigate={onNavigate}
                sectionId="cases"
              >
                Conheça nossos cases
              </SectionLink>
            </div>

            <div className="grid grid-cols-3 gap-6 border-t border-outline-variant/10 pt-8 md:gap-8">
              {HERO_STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-black text-primary">
                    <AnimatedNumber enabled={showHeroBottom} prefix={stat.prefix} value={stat.value} />
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-widest text-on-surface-variant md:text-xs">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="relative hidden lg:col-span-4 lg:block"
          initial={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT }}
        >
          <div className="hero-visual-stage group relative mx-auto flex aspect-[4/5] w-full max-w-[25rem] items-center justify-center px-4 py-6">
            <div className="hero-visual-halo hero-visual-halo-primary pointer-events-none absolute left-[2%] top-[7%] h-44 w-44 rounded-full blur-3xl" />
            <div className="hero-visual-halo hero-visual-halo-secondary pointer-events-none absolute bottom-[9%] right-[4%] h-40 w-40 rounded-full blur-3xl" />
            <div className="hero-visual-spotlight pointer-events-none absolute inset-x-12 bottom-8 h-24 rounded-full blur-3xl" />
            <div className="hero-visual-beam pointer-events-none absolute left-1/2 top-[12%] h-[68%] w-px -translate-x-1/2" />
            <HeroSignaturePanel />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
