import { motion } from "motion/react";
import { Link } from "react-router-dom";

import { AnimatedNumber } from "./AnimatedNumber";
import { PartnersCarousel } from "./PartnersCarousel";
import { RevealSection } from "./RevealSection";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const SOCIAL_METRICS = [
  { label: "Retorno médio", value: 300, prefix: "+", suffix: "%", sub: "ROI estratégico" },
  { label: "Fator de escala", value: 5, prefix: "+", suffix: "x", sub: "Leads qualificados" },
];

export function ResultsSection() {
  return (
    <RevealSection className="site-section relative overflow-hidden bg-surface-container-low" id="resultados">
      <div className="absolute -mr-64 -mt-32 right-0 top-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="mb-24 grid items-center gap-16 lg:grid-cols-2">
          <div className="max-w-2xl">
            <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.4em] text-primary">
              Resultados que Escalam
            </h2>
            <p className="mb-8 text-4xl font-black leading-[1.1] tracking-tight md:text-5xl">
              Estratégias validadas por números que{" "}
              <span className="text-gradient">colocam marcas à frente do mercado.</span>
            </p>
            <p className="text-lg font-light leading-relaxed text-on-surface-variant">
              Não entregamos métricas de vaidade. Construímos máquinas de vendas
              sustentáveis com foco total em rentabilidade.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {SOCIAL_METRICS.map((metric, index) => (
              <motion.div
                key={metric.label}
                className="glass-card group relative overflow-hidden rounded-[2.5rem] border border-outline-variant/15 p-10 transition-all duration-500 hover:border-primary/30"
                initial={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.65, delay: 0.12 * index, ease: EASE_OUT }}
                viewport={{ once: true, amount: 0.3 }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                    {metric.label}
                  </div>
                  <div className="metric-glow text-6xl font-black transition-transform duration-500 group-hover:scale-105">
                    <AnimatedNumber
                      className="text-on-surface"
                      prefix={metric.prefix}
                      suffix={metric.suffix}
                      value={metric.value}
                    />
                  </div>
                  <div className="mt-4 border-t border-outline-variant/10 pt-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      {metric.sub}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="border-t border-outline-variant/10 pt-16">
          <div className="mb-12 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-on-surface-variant/40">
              Empresas que confiam na GSUCHOA
            </p>
            <Link
              className="inline-flex items-center gap-2 text-sm font-bold text-primary"
              to="/clientes"
            >
              Ver todos os clientes
            </Link>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
            viewport={{ once: true, amount: 0.3 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <PartnersCarousel />
          </motion.div>
        </div>
      </div>
    </RevealSection>
  );
}
