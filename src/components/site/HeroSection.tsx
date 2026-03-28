import { ArrowRight } from "lucide-react";
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
  { label: "Clientes", value: 50, prefix: "+" },
  { label: "Anos de Experiencia", value: 10, prefix: "+" },
];

export function HeroSection({
  onNavigate,
}: {
  onNavigate: (sectionId: SectionId) => void;
}) {
  const heroDescriptionText =
    "Design, conteudo e trafego que geram resultado, nao apenas estetica. Arquitetamos ecossistemas digitais para marcas que buscam autoridade e lucro.";

  const titleLineOne = useTypewriter("Transformamos", true, 18);
  const titleLineTwo = useTypewriter("estrategia em", titleLineOne.complete, 16);
  const titleLineThree = useTypewriter("crescimento real", titleLineTwo.complete, 14);
  const description = useTypewriter(heroDescriptionText, titleLineThree.complete, 7);
  const showHeroBottom = description.complete;

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-20" id="inicio">
      <div className="brand-watermark pointer-events-none absolute right-[-10%] top-[10%] w-1/2 select-none opacity-[0.03]">
        <LogoIconAnimated animated={false} className="logo-icon-theme h-auto w-full" decorative />
      </div>
      <div className="hero-gradient absolute inset-0" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-high px-3 py-1"
            initial={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Marketing de Elite
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
                Falar com especialista
              </SectionLink>
              <SectionLink
                className="hero-secondary-button rounded-xl border px-10 py-5 text-center text-lg font-bold active:scale-95"
                onNavigate={onNavigate}
                sectionId="cases"
              >
                Ver projetos
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
          <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-surface-container-high">
            <img
              alt="High Tech Environment"
              className="h-full w-full object-cover grayscale opacity-50 transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_vWB95GN5P3Seurf7HEsF2uWs_4uDUVg6xS6jPNaTbSbZCL9zuEG99OkhImzTd8Bq9OsGjHpL_jUZ_YIExmXLwy7Sjo-m9Fym91MUwelgLFfol3CG5Df-t0XyaFAm5H75aqX-3jVs9mIgg1SWnuMek8b_vXxjFUONEihzZyR4Bn87kXuaAnJwVJF4P7kTHaodEKXgV3-RAk7WJPjL6NMFXNFMHId29tzvD0s_xp0-PeXUxqa2XMZk6pJ3YXm_9iArloeJGcz-hx9U"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <HeroSignaturePanel />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
