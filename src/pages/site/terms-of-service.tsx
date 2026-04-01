import {
  ArrowUpRight,
  Ban,
  FileText,
  KeyRound,
  Link2,
  Lock,
  Mail,
  Phone,
  RefreshCcw,
  Scale,
  ServerCog,
  ShieldCheck,
} from "lucide-react";

import { SiteRouteShell } from "../../components/site/SiteRouteShell";
import { Seo } from "../../components/shared/Seo";
import {
  buildAbsoluteUrl,
  createBreadcrumbStructuredData,
} from "../../config/site/seo";

const LAST_UPDATED_LABEL = "1 de abril de 2026";
const SEO_DESCRIPTION =
  "Termos de Serviço do aplicativo da GSUCHOA, incluindo regras de acesso ao painel, uso permitido, integrações, responsabilidades e condições operacionais.";
const TERMS_URL = "/termos-de-servico.html";
const PRIVACY_URL = "/politica-de-privacidade.html";

const TERMS_SECTIONS = [
  {
    id: "aceitacao-e-escopo",
    eyebrow: "1. Aceitação e Escopo",
    title: "Estes termos regulam o uso do aplicativo, do painel e dos recursos operados pela GSUCHOA.",
    icon: ShieldCheck,
    paragraphs: [
      "Os presentes Termos de Serviço disciplinam o acesso e o uso do aplicativo da GSUCHOA, incluindo o painel administrativo, os módulos operacionais, os dashboards e as integrações habilitadas para execução de serviços contratados.",
      "Ao acessar, autenticar-se ou utilizar qualquer recurso do sistema, o usuário declara que leu, compreendeu e concorda com estes termos, bem como com a Política de Privacidade aplicável.",
    ],
    bullets: [
      "Escopo principal: painel administrativo e módulos internos disponibilizados pela GSUCHOA.",
      "Abrange: autenticação, gestão operacional, dashboards, integrações e recursos administrativos liberados por perfil.",
      "Uso condicionado ao vínculo legítimo do usuário com a GSUCHOA, com cliente atendido ou com operação expressamente autorizada.",
    ],
  },
  {
    id: "contas-e-acessos",
    eyebrow: "2. Contas e Acessos",
    title: "O acesso ao aplicativo é restrito e depende de credenciais válidas e autorização adequada.",
    icon: KeyRound,
    paragraphs: [
      "Cada usuário é responsável por manter a confidencialidade de suas credenciais e por todo uso realizado a partir de sua conta. O compartilhamento indevido de login, senha, tokens ou sessões autenticadas é vedado.",
      "A GSUCHOA poderá criar, ajustar, restringir ou remover permissões de acesso conforme a função do usuário, a necessidade operacional, obrigações contratuais ou critérios de segurança.",
    ],
    bullets: [
      "O usuário deve fornecer informações corretas, atualizadas e compatíveis com a sua função.",
      "Credenciais são pessoais e não devem ser compartilhadas com terceiros não autorizados.",
      "Qualquer suspeita de uso indevido, exposição de credenciais ou acesso não autorizado deve ser comunicada imediatamente.",
    ],
  },
  {
    id: "uso-permitido",
    eyebrow: "3. Uso Permitido",
    title: "O aplicativo deve ser utilizado apenas para finalidades legítimas, profissionais e autorizadas.",
    icon: FileText,
    paragraphs: [
      "O sistema foi estruturado para apoiar a operação digital da GSUCHOA e de seus clientes, incluindo gestão de conteúdo, rotinas administrativas e leitura de dados oriundos de integrações autorizadas.",
      "É proibido utilizar o aplicativo para fins ilícitos, para tentativa de acesso indevido, para coleta não autorizada de dados, para engenharia reversa indevida ou para qualquer ação que comprometa a estabilidade, a segurança ou a reputação da operação.",
    ],
    bullets: [
      "Uso permitido: rotinas administrativas, consulta de dashboards, gestão operacional e tarefas compatíveis com o perfil liberado.",
      "Uso vedado: exploração maliciosa, automação abusiva, extração não autorizada de dados e interferência no funcionamento do sistema.",
      "O usuário deve respeitar a legislação aplicável, contratos em vigor e políticas das plataformas integradas.",
    ],
  },
  {
    id: "integracoes",
    eyebrow: "4. Integrações",
    title: "Integrações com terceiros dependem de autorização válida e seguem também as regras das plataformas externas.",
    icon: Link2,
    paragraphs: [
      "O aplicativo pode se conectar a serviços de terceiros, como Meta e Google, para autenticação, leitura de contas, sincronização de dados e exibição de indicadores operacionais. Essas integrações dependem de autorização válida e podem ser limitadas, suspensas ou alteradas pelo provedor externo.",
      "O usuário reconhece que determinados dados, métricas, identificadores e estados operacionais podem variar de acordo com a disponibilidade, com a política ou com o contrato da plataforma integrada, sem que isso represente falha imputável exclusivamente à GSUCHOA.",
    ],
    bullets: [
      "A integração só deve ser habilitada por pessoa autorizada a representar a conta, empresa ou ativo conectado.",
      "Permissões podem expirar, ser invalidadas ou exigir reconexão periódica.",
      "O uso das integrações também está sujeito aos termos e políticas da plataforma de terceiros correspondente.",
    ],
  },
  {
    id: "disponibilidade-e-suporte",
    eyebrow: "5. Disponibilidade e Suporte",
    title: "A GSUCHOA busca manter o aplicativo disponível, mas pode realizar ajustes, manutenção e evoluções a qualquer momento.",
    icon: ServerCog,
    paragraphs: [
      "O serviço poderá passar por atualizações, manutenções preventivas ou corretivas, ajustes de performance, revisão de segurança, mudança de layout ou evolução de funcionalidades sem aviso prévio quando isso for necessário para preservar a integridade da operação.",
      "Embora a GSUCHOA adote esforços razoáveis para manter o ambiente funcional, a disponibilidade contínua pode ser afetada por fatores internos, terceiros, falhas de infraestrutura, mudanças de APIs externas, incidentes de segurança ou eventos fora do controle razoável da operação.",
    ],
    bullets: [
      "Funcionalidades podem ser adicionadas, removidas, substituídas ou reestruturadas.",
      "Módulos podem ser temporariamente limitados durante manutenção, investigação ou correção de incidentes.",
      "Chamados operacionais e dúvidas podem ser direcionados pelos canais oficiais informados nesta página.",
    ],
  },
  {
    id: "privacidade-e-dados",
    eyebrow: "6. Privacidade e Dados",
    title: "O tratamento de dados relacionado ao aplicativo segue a política pública de privacidade da GSUCHOA.",
    icon: Lock,
    paragraphs: [
      "O uso do aplicativo pode envolver tratamento de dados cadastrais, registros técnicos, dados de autenticação, informações operacionais e dados oriundos de integrações habilitadas. As regras e finalidades desse tratamento estão descritas na Política de Privacidade pública da GSUCHOA.",
      "Ao utilizar o sistema, o usuário declara ciência de que determinados dados de acesso e operação poderão ser registrados para segurança, auditoria, suporte, prevenção a fraude e continuidade do serviço.",
    ],
    bullets: [
      "Política de Privacidade pública: https://gsuchoa.com/politica-de-privacidade.html.",
      "Solicitações relacionadas a dados pessoais podem ser encaminhadas para contato@gsuchoa.com.",
      "A habilitação de integrações deve observar a legitimidade do acesso e a adequação da base autorizadora aplicável.",
    ],
  },
  {
    id: "suspensao-e-encerramento",
    eyebrow: "7. Suspensão e Encerramento",
    title: "A GSUCHOA poderá suspender ou encerrar acessos para proteger a operação, cumprir obrigações ou reagir a violações.",
    icon: Ban,
    paragraphs: [
      "A GSUCHOA poderá suspender, restringir ou encerrar acessos total ou parcialmente em caso de violação destes termos, uso indevido, risco à segurança, tentativa de fraude, determinação legal, encerramento de vínculo com cliente ou necessidade operacional relevante.",
      "Sempre que viável e compatível com o contexto do incidente, medidas de contenção poderão ser aplicadas de forma proporcional ao risco identificado. A suspensão de acesso não elimina eventuais responsabilidades decorrentes de condutas praticadas anteriormente.",
    ],
    bullets: [
      "Medidas possíveis: bloqueio de sessão, revogação de permissões, desconexão de integrações e encerramento do acesso.",
      "A proteção da infraestrutura, dos dados e dos clientes pode justificar ação imediata.",
      "O encerramento do acesso não transfere propriedade sobre dados, código ou ambiente do aplicativo.",
    ],
  },
  {
    id: "responsabilidades-e-limitacoes",
    eyebrow: "8. Responsabilidades e Limitações",
    title: "Cada parte responde dentro do alcance razoável de sua atuação e das limitações técnicas do serviço.",
    icon: Scale,
    paragraphs: [
      "O usuário é responsável pela veracidade das informações que inserir, pela legitimidade das integrações que habilitar e pelo uso adequado dos recursos disponíveis em sua conta. Também deve agir com diligência para evitar exposição de credenciais, acessos indevidos e uso incompatível com estes termos.",
      "A GSUCHOA não garante que o aplicativo será totalmente livre de falhas, indisponibilidades ou mudanças impostas por terceiros. Indicadores, métricas e sincronizações dependem também das respostas das plataformas integradas e podem sofrer atraso, limitação ou variação.",
    ],
    bullets: [
      "O aplicativo é oferecido no contexto operacional da GSUCHOA, com evolução contínua e dependência parcial de serviços terceiros.",
      "Decisões de negócio tomadas a partir de dashboards e integrações devem considerar validação humana e contexto operacional.",
      "Nada nestes termos afasta responsabilidades que não possam ser legalmente excluídas ou limitadas.",
    ],
  },
  {
    id: "alteracoes",
    eyebrow: "9. Alterações",
    title: "Os termos poderão ser atualizados para refletir mudanças legais, técnicas, contratuais ou operacionais.",
    icon: RefreshCcw,
    paragraphs: [
      "A GSUCHOA poderá revisar estes Termos de Serviço sempre que houver necessidade de adequação normativa, mudança de escopo do aplicativo, evolução dos módulos, atualização de integrações ou revisão de processos internos.",
      "A versão vigente permanecerá publicada nesta mesma URL pública, com a respectiva data de atualização. O uso continuado do aplicativo após a publicação de nova versão poderá caracterizar aceite das condições revisadas, quando permitido pela legislação aplicável.",
    ],
    bullets: [
      "URL pública canônica: https://gsuchoa.com/termos-de-servico.html.",
      "Data de revisão sempre exibida neste documento.",
      "Recomenda-se consulta periódica, especialmente antes de novas integrações ou liberações operacionais.",
    ],
  },
] as const;

const QUICK_FACTS = [
  {
    label: "Documento",
    value: "Termos de Serviço do aplicativo",
  },
  {
    label: "Escopo",
    value: "Painel, módulos, dashboards e integrações habilitadas",
  },
  {
    label: "Canal de contato",
    value: "contato@gsuchoa.com",
  },
  {
    label: "Última atualização",
    value: LAST_UPDATED_LABEL,
  },
] as const;

export default function TermsOfServicePage() {
  const structuredData = [
    createBreadcrumbStructuredData([
      { name: "Início", path: "/" },
      { name: "Termos de Serviço", path: TERMS_URL },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Termos de Serviço do aplicativo da GSUCHOA",
      description: SEO_DESCRIPTION,
      url: buildAbsoluteUrl(TERMS_URL),
      inLanguage: "pt-BR",
      about: [
        "Termos de Serviço",
        "Termos de Uso",
        "Painel administrativo",
        "Aplicativo",
        "Integrações Meta e Google",
      ],
    },
  ];

  return (
    <SiteRouteShell activeNavKey={null}>
      <Seo
        description={SEO_DESCRIPTION}
        path={TERMS_URL}
        structuredData={structuredData}
        title="Termos de Serviço"
      />

      <section className="site-section relative overflow-hidden">
        <div className="hero-gradient absolute inset-0 opacity-25" />
        <div className="absolute left-[-10%] top-[-18%] h-72 w-72 rounded-full bg-primary/12 blur-[140px]" />
        <div className="absolute bottom-[-24%] right-[-8%] h-80 w-80 rounded-full bg-primary/10 blur-[150px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <div className="max-w-4xl">
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.36em] text-primary">
              Documento público de serviço
            </p>
            <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl">
              Termos de <span className="text-gradient">Serviço</span>
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
              Esta página descreve as condições de acesso e uso do aplicativo da GSUCHOA,
              incluindo o painel administrativo, módulos internos, dashboards e integrações
              habilitadas para a operação.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {QUICK_FACTS.map((item) => (
              <div
                className="rounded-[2rem] border border-outline-variant/15 bg-surface-container-low px-6 py-5"
                key={item.label}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
                  {item.label}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[2rem] border border-primary/18 bg-primary/6 p-6">
            <p className="text-sm font-semibold text-on-surface">
              URL canônica destes termos
            </p>
            <a
              className="mt-2 inline-flex items-center gap-2 text-sm text-primary transition-opacity hover:opacity-80"
              href={buildAbsoluteUrl(TERMS_URL)}
            >
              {buildAbsoluteUrl(TERMS_URL)}
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
              Para regras sobre tratamento de dados pessoais e exclusão de dados, consulte
              também a política pública de privacidade:
            </p>
            <a
              className="mt-2 inline-flex items-center gap-2 text-sm text-primary transition-opacity hover:opacity-80"
              href={buildAbsoluteUrl(PRIVACY_URL)}
            >
              {buildAbsoluteUrl(PRIVACY_URL)}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="site-section pt-0">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="mb-10 flex flex-wrap gap-3">
            {TERMS_SECTIONS.map((section) => (
              <a
                className="rounded-full border border-outline-variant/15 bg-surface-container-low px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
                href={`#${section.id}`}
                key={section.id}
              >
                {section.eyebrow}
              </a>
            ))}
          </div>

          <div className="grid gap-6">
            {TERMS_SECTIONS.map((section) => {
              const Icon = section.icon;

              return (
                <section
                  className="scroll-mt-28 rounded-[2.5rem] border border-outline-variant/12 bg-surface-container-low p-8 md:p-10"
                  id={section.id}
                  key={section.id}
                >
                  <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
                    <div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className="mt-6 text-xs font-bold uppercase tracking-[0.32em] text-primary">
                        {section.eyebrow}
                      </p>
                      <h2 className="mt-4 text-2xl font-black tracking-tight text-on-surface md:text-3xl">
                        {section.title}
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {section.paragraphs.map((paragraph) => (
                        <p className="text-base leading-8 text-on-surface-variant" key={paragraph}>
                          {paragraph}
                        </p>
                      ))}

                      <ul className="space-y-3 pt-2">
                        {section.bullets.map((bullet) => (
                          <li
                            className="rounded-[1.5rem] border border-outline-variant/10 bg-surface px-5 py-4 text-sm leading-7 text-on-surface-variant"
                            key={bullet}
                          >
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          <section className="mt-6 rounded-[2.5rem] border border-outline-variant/12 bg-surface-container p-8 md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-primary">
              Contato
            </p>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-on-surface md:text-3xl">
              Dúvidas contratuais, operacionais ou sobre acesso
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-on-surface-variant">
              Você pode falar com a GSUCHOA para esclarecer pontos destes termos, reportar
              incidente de acesso, solicitar suporte relacionado ao uso autorizado do aplicativo
              ou pedir orientação sobre integrações e permissões.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <a
                className="rounded-[1.75rem] border border-outline-variant/12 bg-surface-container-high px-6 py-5 transition-colors hover:border-primary/28"
                href="mailto:contato@gsuchoa.com"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                      E-mail
                    </p>
                    <p className="mt-2 text-sm text-on-surface-variant">contato@gsuchoa.com</p>
                  </div>
                </div>
              </a>

              <a
                className="rounded-[1.75rem] border border-outline-variant/12 bg-surface-container-high px-6 py-5 transition-colors hover:border-primary/28"
                href="tel:+5511989551228"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                      Telefone
                    </p>
                    <p className="mt-2 text-sm text-on-surface-variant">(11) 98955-1228</p>
                  </div>
                </div>
              </a>
            </div>
          </section>
        </div>
      </section>
    </SiteRouteShell>
  );
}
