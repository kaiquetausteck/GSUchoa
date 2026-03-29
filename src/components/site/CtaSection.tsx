import {
  Calendar,
  MessageSquare,
} from "lucide-react";

import { type SectionId } from "../../hooks/site/useSectionAnchors";
import { LogoIconAnimated } from "../shared/LogoIconAnimated";
import { RevealSection } from "./RevealSection";
import { SectionLink } from "./SectionLink";

export function CtaSection({
  onNavigate,
}: {
  onNavigate: (sectionId: SectionId) => void;
}) {
  return (
    <RevealSection className="site-section bg-surface">
      <div className="mx-auto max-w-7xl px-6 text-center md:px-8">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[3rem] border border-outline-variant/20 bg-gradient-to-br from-surface-container-low to-surface p-16">
          <div className="absolute inset-0 bg-primary/5 opacity-50 blur-[80px]" />
          <div className="absolute -bottom-10 -right-10 w-48 rotate-12 opacity-[0.05]">
            <LogoIconAnimated animated={false} className="logo-icon-theme h-auto w-full" decorative />
          </div>
          <div className="relative z-10">
            <h2 className="mb-8 text-5xl font-black tracking-tighter md:text-6xl">
              Pronto para escalar <br />
              sua marca?
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-xl text-on-surface-variant">
              Agende uma consultoria estratégica gratuita e descubra como podemos levar
              seu faturamento ao próximo nível.
            </p>
            <div className="flex flex-col justify-center gap-6 sm:flex-row">
              <SectionLink
                className="flex items-center justify-center gap-3 rounded-2xl bg-primary px-10 py-5 text-lg font-bold text-white transition-all hover:shadow-[0_0_30px_rgba(34,98,240,0.3)] active:scale-95"
                onNavigate={onNavigate}
                sectionId="contato"
              >
                <Calendar className="h-5 w-5" />
                Agendar reunião
              </SectionLink>
              <SectionLink
                className="flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-10 py-5 text-lg font-bold text-white transition-all hover:opacity-90 active:scale-95"
                onNavigate={onNavigate}
                sectionId="contato"
              >
                <MessageSquare className="h-5 w-5" />
                WhatsApp direto
              </SectionLink>
            </div>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}
