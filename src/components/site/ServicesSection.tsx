import {
  Diamond,
  MousePointer2,
  Network,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";

import { RevealSection } from "./RevealSection";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const SERVICES = [
  {
    icon: <MousePointer2 />,
    title: "Aquisição de clientes",
    desc: "Tráfego pago e funis de conversão otimizados para maximizar o ROI. Transformamos desconhecidos em clientes fiéis.",
    items: ["Mídia de performance", "Funis de vendas"],
  },
  {
    icon: <Diamond />,
    title: "Posicionamento de marca",
    desc: "Branding e identidade visual que comunicam autoridade desde o primeiro contato. Sua marca deixa de ser apenas mais uma no feed.",
    items: ["Estratégia de marca", "Identidade visual"],
  },
  {
    icon: <TrendingUp />,
    title: "Conteúdo de alta performance",
    desc: "Vídeos e conteúdo para redes sociais que capturam atenção e despertam desejo de compra.",
    items: ["Vídeos curtos", "Sistemas de conteúdo"],
  },
  {
    icon: <Network />,
    title: "Presença digital",
    desc: "Landing pages e sites de alta conversão. Uma experiência fluida que vende todos os dias.",
    items: ["LPs de alto ticket", "Ecossistemas institucionais"],
  },
];

export function ServicesSection() {
  return (
    <RevealSection className="site-section bg-surface-container-low" id="servicos">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mx-auto mb-24 max-w-3xl text-center">
          <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-primary">
            Nosso Ecossistema
          </h2>
          <p className="text-5xl font-black tracking-tighter">
            Serviços pensados para <span className="text-gradient">alta performance</span>
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.title}
              className="group rounded-[2rem] border border-outline-variant/10 bg-surface p-10 transition-all duration-500 hover:bg-surface-container-high"
              initial={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.65, delay: 0.08 * index, ease: EASE_OUT }}
              viewport={{ once: true, amount: 0.24 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                {service.icon}
              </div>
              <h4 className="mb-4 text-xl font-bold">{service.title}</h4>
              <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">{service.desc}</p>
              <ul className="space-y-3">
                {service.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-xs font-medium text-on-surface/70"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
