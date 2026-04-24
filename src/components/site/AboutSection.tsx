import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

import { type SectionId } from "../../hooks/site/useSectionAnchors";
import { RevealSection } from "./RevealSection";
import { SectionLink } from "./SectionLink";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function AboutSection({
  onNavigate,
}: {
  onNavigate: (sectionId: SectionId) => void;
}) {
  return (
    <RevealSection className="site-section bg-surface" id="sobre">
      <div className="mx-auto grid max-w-7xl items-center gap-20 px-6 md:px-8 lg:grid-cols-2">
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.75, ease: EASE_OUT }}
          viewport={{ once: true, amount: 0.3 }}
          whileInView={{ opacity: 1, x: 0 }}
        >
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-[100px]" />
          <img
            alt="Colaboração da equipe"
            className="relative z-10 rounded-3xl shadow-2xl"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK7OY3Rm8Wb1ZROf7IFfOruIsunITav5Eb_KAJFG3-B1IzynpNIFEYSWh3fq1R3Citv3CGxm6m1wdgcQyHy8GmkLv_UpvR_nfqQzs_dM-eBGSxA9OXNLnCrZzWiIyy6Gk2SudM3cqDZbsd0HpuCHBJpJRKVqlfAWKtWEitQjWo-RygIdYED-jOdONij6K4WagQk17lKFaWUf9qUIp-FB9D6jsG-fvUQtGDe5ECGO8BD5-PktDHeRZhFjAM5frqJmh4P4Tv7JWh2rHs"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.75, ease: EASE_OUT }}
          viewport={{ once: true, amount: 0.3 }}
          whileInView={{ opacity: 1, x: 0 }}
        >
          <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-primary">
            Nossa forma de trabalho
          </h2>
          <h3 className="mb-8 text-5xl font-black leading-tight tracking-tight">
            Tudo que criamos começa no objetivo do cliente.
          </h3>
          <div className="space-y-6 text-lg leading-relaxed text-on-surface-variant">
            <p>
              Na GSUCHOA, cada projeto começa com uma pergunta simples: onde essa marca quer
              chegar?
            </p>
            <p>
              Nosso trabalho é entender o objetivo do cliente e desenhar a melhor estratégia
              para alcançar esse resultado. Se a meta for vender mais, nossas ações precisam
              gerar vendas. Se for ganhar autoridade, tudo precisa fortalecer a percepção da
              marca. Se for elevar a qualidade do audiovisual, cada detalhe da produção precisa
              fazer a marca parecer maior, mais forte e mais profissional.
            </p>
            <p>
              Independentemente do serviço, a lógica é a mesma: usar comunicação,
              publicidade, estratégia e execução para aproximar o cliente do resultado que ele
              quer alcançar. A gente não trabalha pensando só na entrega. A gente trabalha
              pensando no sucesso do cliente.
            </p>
          </div>
          <div className="mt-10">
            <SectionLink
              className="group inline-flex items-center gap-2 font-bold text-primary transition-opacity hover:opacity-80"
              onNavigate={onNavigate}
              sectionId="processo"
            >
              Conheça nossa metodologia
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
            </SectionLink>
          </div>
        </motion.div>
      </div>
    </RevealSection>
  );
}
