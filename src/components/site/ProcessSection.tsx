import { motion } from "motion/react";

import { AnimatedNumber } from "./AnimatedNumber";
import { RevealSection } from "./RevealSection";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const PROCESS_STEPS = [
  {
    step: 1,
    title: "Diagnóstico",
    desc: "Começamos entendendo o momento da marca, os desafios do negócio e o objetivo que precisa ser alcançado.",
  },
  {
    step: 2,
    title: "Estratégia",
    desc: "A partir dessa leitura, desenhamos a melhor estratégia para aproximar a marca do resultado que ela busca.",
  },
  {
    step: 3,
    title: "Execução",
    desc: "Transformamos a estratégia em ação com comunicação, conteúdo, design, mídia e presença digital alinhados ao plano.",
  },
  {
    step: 4,
    title: "Escala",
    desc: "Otimizamos, ajustamos e evoluímos a operação para fortalecer os resultados e sustentar o crescimento.",
    active: true,
  },
];

export function ProcessSection() {
  return (
    <RevealSection className="site-section bg-surface" id="processo">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <h2 className="mb-24 text-center text-xs font-bold uppercase tracking-[0.3em] text-primary">
          O caminho para o resultado
        </h2>

        <div className="relative grid gap-12 md:grid-cols-4">
          <div className="absolute left-0 top-12 hidden h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />

          {PROCESS_STEPS.map((step, index) => (
            <motion.div
              key={step.step}
              className="relative z-10 text-center"
              initial={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.65, delay: 0.1 * index, ease: EASE_OUT }}
              viewport={{ once: true, amount: 0.3 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div
                className={`relative mx-auto mb-8 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-primary/20 shadow-[0_0_30px_rgba(34,98,240,0.1)] ${
                  step.active ? "bg-primary" : "bg-surface-container-high"
                }`}
              >
                <span className={`relative z-10 text-2xl font-black ${step.active ? "text-white" : "text-primary"}`}>
                  <AnimatedNumber padStart={2} value={step.step} />
                </span>
              </div>
              <h5 className="mb-4 text-lg font-bold">{step.title}</h5>
              <p className="text-sm leading-relaxed text-on-surface-variant">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
