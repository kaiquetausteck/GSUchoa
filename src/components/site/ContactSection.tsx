import {
  ArrowRight,
  Clock,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { motion } from "motion/react";

import { RevealSection } from "./RevealSection";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function ContactSection() {
  return (
    <RevealSection className="relative overflow-hidden bg-surface py-32" id="contato">
      <div className="hero-gradient absolute inset-0 opacity-30" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid items-center gap-24 lg:grid-cols-2">
          <motion.div
            className="space-y-12"
            initial={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.75, ease: EASE_OUT }}
            viewport={{ once: true, amount: 0.3 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <div>
              <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.4em] text-primary">
                Conecte-se Conosco
              </h2>
              <h3 className="mb-8 text-5xl font-black leading-none tracking-tighter md:text-6xl">
                Vamos arquitetar o seu <span className="text-gradient">proximo nivel</span>
              </h3>
              <p className="max-w-lg text-xl font-light leading-relaxed text-on-surface-variant">
                Nossa equipe de especialistas esta pronta para analisar seus gargalos e
                desenhar uma estrategia de crescimento previsivel.
              </p>
            </div>

            <div className="grid gap-10 sm:grid-cols-2">
              <div className="space-y-4">
                {[
                  { icon: <MapPin className="h-5 w-5" />, label: "Localizacao", value: "Sao Paulo - SP" },
                  { icon: <Phone className="h-5 w-5" />, label: "Telefone", value: "(11) 98955-1228" },
                ].map((item) => (
                  <div key={item.label} className="group flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-high text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        {item.label}
                      </div>
                      <div className="text-sm font-semibold">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {[
                  { icon: <Mail className="h-5 w-5" />, label: "Email", value: "contato@gsuchoa.com" },
                  { icon: <Clock className="h-5 w-5" />, label: "Horarios", value: "Segunda a Sexta 9h as 18h" },
                ].map((item) => (
                  <div key={item.label} className="group flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-high text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        {item.label}
                      </div>
                      <div className="text-sm font-semibold">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.75, ease: EASE_OUT }}
            viewport={{ once: true, amount: 0.3 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <div className="absolute -inset-4 rounded-full bg-primary/20 opacity-20 blur-[80px]" />
            <div className="glass-card relative z-10 rounded-[2.5rem] border border-outline-variant/20 p-10 md:p-14">
              <form className="space-y-8" onSubmit={(event) => event.preventDefault()}>
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary" htmlFor="name">
                    Nome Completo
                  </label>
                  <input
                    className="w-full rounded-2xl border border-outline-variant/35 bg-surface-container-high/70 px-6 py-5 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-transparent focus:ring-2 focus:ring-primary/40"
                    id="name"
                    placeholder="Como devemos te chamar?"
                    type="text"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary" htmlFor="email">
                      E-mail Corporativo
                    </label>
                    <input
                      className="w-full rounded-2xl border border-outline-variant/35 bg-surface-container-high/70 px-6 py-5 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-transparent focus:ring-2 focus:ring-primary/40"
                      id="email"
                      placeholder="email@empresa.com"
                      type="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary" htmlFor="phone">
                      WhatsApp
                    </label>
                    <input
                      className="w-full rounded-2xl border border-outline-variant/35 bg-surface-container-high/70 px-6 py-5 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-transparent focus:ring-2 focus:ring-primary/40"
                      id="phone"
                      placeholder="(00) 00000-0000"
                      type="tel"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary" htmlFor="message">
                    Mensagem
                  </label>
                  <textarea
                    className="w-full resize-none rounded-2xl border border-outline-variant/35 bg-surface-container-high/70 px-6 py-5 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-transparent focus:ring-2 focus:ring-primary/40"
                    id="message"
                    placeholder="Fale brevemente sobre o seu desafio atual..."
                    rows={4}
                  />
                </div>

                <button
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-6 font-bold text-white shadow-[0_15px_35px_rgba(34,98,240,0.25)] transition-all hover:brightness-110 active:scale-[0.98]"
                  type="submit"
                >
                  Solicitar Analise Estrategica
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </RevealSection>
  );
}
