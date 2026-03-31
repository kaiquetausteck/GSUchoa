import {
  ArrowUpRight,
  Database,
  Lock,
  Mail,
  Phone,
  Share2,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

import { SiteRouteShell } from "../../components/site/SiteRouteShell";
import { Seo } from "../../components/shared/Seo";
import {
  buildAbsoluteUrl,
  createBreadcrumbStructuredData,
} from "../../config/site/seo";

const LAST_UPDATED_LABEL = "31 de março de 2026";
const SEO_DESCRIPTION =
  "Política de Privacidade da GSUCHOA para o site, formulário de contato, painel administrativo e integrações habilitadas, incluindo orientações de exclusão de dados.";
const POLICY_URL = "/politica-de-privacidade.html";
const DATA_DELETION_URL = "/exclusao-de-dados.html";

const POLICY_SECTIONS = [
  {
    id: "abrangencia",
    eyebrow: "1. Abrangência",
    title: "Esta política cobre o site, o painel e as integrações habilitadas.",
    icon: ShieldCheck,
    paragraphs: [
      "Esta Política de Privacidade se aplica ao site público da GSUCHOA, ao formulário de contato, ao painel administrativo e às integrações de terceiros que forem habilitadas para a operação do sistema.",
      "Ela explica quais dados pessoais podem ser tratados, para quais finalidades, com quem esses dados podem ser compartilhados e como o titular pode exercer seus direitos. Esta página é pública, ativa e específica para os serviços operados pela GSUCHOA.",
    ],
    bullets: [
      "Ambiente coberto: https://gsuchoa.com e rotas públicas relacionadas.",
      "Sistema coberto: painel administrativo e recursos internos acessados por usuários autorizados.",
      "Integrações cobertas: principalmente conexões com Meta/Facebook/Instagram Ads quando autorizadas pelo usuário ou pela organização cliente.",
    ],
  },
  {
    id: "dados-coletados",
    eyebrow: "2. Dados Tratados",
    title: "Tratamos dados diferentes conforme a forma de uso do sistema.",
    icon: Database,
    paragraphs: [
      "Os dados tratados variam de acordo com a interação realizada. No site, o tratamento é mais concentrado no atendimento comercial. No painel, o tratamento inclui autenticação, operação administrativa e visualização de informações relacionadas às integrações contratadas.",
    ],
    bullets: [
      "Dados informados diretamente pelo titular: nome completo, e-mail, WhatsApp, mensagem e demais informações enviadas no formulário de contato ou por atendimento.",
      "Dados de autenticação e operação do painel: e-mail corporativo, perfil de usuário, token de sessão, registros de acesso e informações necessárias para manter a conta autenticada.",
      "Dados técnicos e de uso: data e hora de acesso, rotas utilizadas, navegador, dispositivo, endereço IP, preferências de interface e registros necessários à segurança e ao diagnóstico do sistema.",
      "Dados de integrações Meta, quando habilitadas: identificador do usuário conectado, nome do perfil, contas de anúncio vinculadas, IDs e nomes de campanhas, conjuntos e anúncios, moeda, fuso horário e métricas de desempenho disponibilizadas pela plataforma.",
      "Informações públicas autorizadas para publicação no site, como cases, clientes e depoimentos, quando houver base legal adequada para divulgação.",
    ],
  },
  {
    id: "finalidades",
    eyebrow: "3. Finalidades",
    title: "Usamos dados pessoais para operar, atender, proteger e evoluir o serviço.",
    icon: UserRound,
    paragraphs: [
      "O tratamento busca atender solicitações comerciais, permitir o acesso ao painel, organizar cadastros internos, exibir métricas das integrações contratadas e manter a segurança da operação.",
      "Também podemos tratar dados para cumprir obrigações legais, responder a solicitações de autoridades competentes, exercer direitos em processos administrativos ou judiciais e prevenir fraudes, abusos ou acessos indevidos.",
      "Dependendo do contexto, o tratamento poderá se apoiar em consentimento, execução de contrato ou de procedimentos preliminares, legítimo interesse, exercício regular de direitos e cumprimento de obrigação legal ou regulatória.",
    ],
    bullets: [
      "Responder contatos comerciais e pedidos de proposta.",
      "Autenticar usuários e controlar acesso à área restrita.",
      "Executar rotinas administrativas relacionadas a clientes, portfólio, depoimentos e campanhas.",
      "Exibir dashboards, relatórios e indicadores oriundos das integrações autorizadas.",
      "Garantir segurança, continuidade, auditoria, suporte e melhoria da experiência.",
    ],
  },
  {
    id: "compartilhamento",
    eyebrow: "4. Compartilhamento",
    title: "O compartilhamento ocorre apenas quando necessário à operação ou por obrigação legal.",
    icon: Share2,
    paragraphs: [
      "A GSUCHOA poderá compartilhar dados com operadores e prestadores de serviço estritamente necessários para hospedar o sistema, autenticar acessos, processar comunicações, armazenar informações e viabilizar integrações solicitadas pelo cliente.",
      "Quando o usuário ou a organização conecta uma conta Meta ao sistema, determinadas informações passam a transitar entre a GSUCHOA e a própria Meta para permitir identificação da conta, leitura de contas de anúncio e exibição de métricas autorizadas.",
      "Alguns desses provedores ou plataformas podem processar dados fora do Brasil. Nessas hipóteses, buscaremos adotar medidas razoáveis para manter o nível adequado de proteção compatível com a legislação aplicável.",
    ],
    bullets: [
      "Provedores de infraestrutura, hospedagem, banco de dados e suporte técnico.",
      "Plataformas de comunicação e atendimento, quando necessárias ao retorno de solicitações.",
      "Meta/Facebook/Instagram e serviços relacionados, quando a integração for voluntariamente habilitada.",
      "Autoridades públicas, órgãos reguladores ou terceiros em cumprimento de obrigação legal ou defesa de direitos.",
    ],
  },
  {
    id: "armazenamento-e-seguranca",
    eyebrow: "5. Armazenamento e Segurança",
    title: "Adotamos medidas técnicas e organizacionais compatíveis com o contexto da operação.",
    icon: Lock,
    paragraphs: [
      "O sistema utiliza mecanismos de autenticação, restrição de acesso por perfil e armazenamento local do navegador para preferências de interface e manutenção de sessão do painel. No front-end atual, não foram identificados scripts próprios ativos de pixel publicitário ou analytics de rastreamento.",
      "Nenhuma medida de segurança é absoluta, mas buscamos reduzir riscos com controle de acesso, minimização de dados, segregação entre área pública e área restrita e revisão contínua da superfície exposta.",
    ],
    bullets: [
      "Os dados podem ser armazenados pelo tempo necessário para cumprir as finalidades informadas, atender exigências legais, resolver disputas e prevenir fraudes.",
      "Informações de login são tratadas para autenticação, e a sessão do painel pode ser mantida localmente no navegador enquanto necessária ao acesso autorizado.",
      "Sempre que possível, limitamos o tratamento ao mínimo necessário para a finalidade pretendida.",
    ],
  },
  {
    id: "direitos",
    eyebrow: "6. Direitos do Titular",
    title: "O titular pode solicitar informações, correções e exclusão nos termos da legislação aplicável.",
    icon: Mail,
    paragraphs: [
      "Nos termos da LGPD e de normas aplicáveis, você pode solicitar confirmação de tratamento, acesso, correção, atualização, anonimização, bloqueio, eliminação, portabilidade, informação sobre compartilhamentos e revisão de decisões quando cabível.",
      "Para proteger sua privacidade, poderemos pedir informações adicionais para confirmar sua identidade antes de processar qualquer solicitação relacionada a dados pessoais.",
    ],
    bullets: [
      "Canal principal: contato@gsuchoa.com.",
      "Assunto recomendado: Privacidade de Dados.",
      "Sempre informe os dados que ajudem a localizar o cadastro ou a integração relacionada ao seu pedido.",
    ],
  },
  {
    id: "exclusao-de-dados",
    eyebrow: "7. Exclusão de Dados",
    title: "Solicitações de exclusão podem ser feitas por e-mail e também atendem ao fluxo esperado pelo Meta.",
    icon: Trash2,
    paragraphs: [
      "Se você deseja excluir dados pessoais tratados pela GSUCHOA, envie uma solicitação para contato@gsuchoa.com com o assunto Excluir meus dados. Informe, sempre que possível, seu nome, e-mail, telefone, empresa e o contexto da solicitação.",
      "Se a solicitação estiver relacionada à integração com Meta/Facebook/Instagram, informe também o nome do perfil conectado, o identificador da conta Meta ou a conta de anúncios vinculada. Quando aplicável, você também pode revogar a permissão diretamente nas configurações da sua conta Meta.",
      "Após a validação da identidade e da viabilidade jurídica do pedido, os dados serão excluídos, anonimizados ou bloqueados, salvo quando houver obrigação legal, regulatória ou necessidade legítima de retenção.",
    ],
    bullets: [
      "Canal de exclusão: contato@gsuchoa.com.",
      "URL pública desta instrução: https://gsuchoa.com/politica-de-privacidade#exclusao-de-dados.",
      "Pedidos podem envolver remoção de dados de contato, dados cadastrais do painel e dados associados a integrações autorizadas.",
    ],
  },
  {
    id: "atualizacoes",
    eyebrow: "8. Atualizações",
    title: "Esta política poderá ser ajustada para refletir mudanças legais, operacionais ou técnicas.",
    icon: ArrowUpRight,
    paragraphs: [
      "Sempre que esta política for atualizada, a nova versão será publicada nesta mesma URL com a data de revisão correspondente. Recomendamos consulta periódica, especialmente antes de habilitar novas integrações ou submeter o sistema à validação de terceiros.",
      "Em caso de dúvidas sobre privacidade, segurança ou exercício de direitos, entre em contato pelos canais informados abaixo.",
    ],
    bullets: [
      "E-mail: contato@gsuchoa.com.",
      "Telefone: (11) 98955-1228.",
      "Localidade informada no site: São Paulo - SP.",
    ],
  },
] as const;

const QUICK_FACTS = [
  {
    label: "Controlador",
    value: "GSUCHOA",
  },
  {
    label: "Escopo",
    value: "Site, formulário, painel e integrações habilitadas",
  },
  {
    label: "Canal de Privacidade",
    value: "contato@gsuchoa.com",
  },
  {
    label: "Última atualização",
    value: LAST_UPDATED_LABEL,
  },
] as const;

export default function PrivacyPolicyPage() {
  const structuredData = [
    createBreadcrumbStructuredData([
      { name: "Início", path: "/" },
      { name: "Política de Privacidade", path: POLICY_URL },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Política de Privacidade da GSUCHOA",
      description: SEO_DESCRIPTION,
      url: buildAbsoluteUrl(POLICY_URL),
      inLanguage: "pt-BR",
      about: [
        "Privacidade",
        "LGPD",
        "Painel administrativo",
        "Formulário de contato",
        "Integração Meta",
      ],
    },
  ];

  return (
    <SiteRouteShell activeNavKey={null}>
      <Seo
        description={SEO_DESCRIPTION}
        path={POLICY_URL}
        structuredData={structuredData}
        title="Política de Privacidade"
      />

      <section className="site-section relative overflow-hidden">
        <div className="hero-gradient absolute inset-0 opacity-25" />
        <div className="absolute left-[-10%] top-[-18%] h-72 w-72 rounded-full bg-primary/12 blur-[140px]" />
        <div className="absolute bottom-[-24%] right-[-8%] h-80 w-80 rounded-full bg-primary/10 blur-[150px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <div className="max-w-4xl">
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.36em] text-primary">
              Documento público de privacidade
            </p>
            <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl">
              Política de <span className="text-gradient">Privacidade</span>
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
              Esta página descreve como a GSUCHOA trata dados pessoais no site, no
              painel administrativo e nas integrações habilitadas, incluindo instruções
              públicas de exclusão de dados.
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
              URL canônica desta política
            </p>
            <a
              className="mt-2 inline-flex items-center gap-2 text-sm text-primary transition-opacity hover:opacity-80"
              href={buildAbsoluteUrl(POLICY_URL)}
            >
              {buildAbsoluteUrl(POLICY_URL)}
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
              Se uma plataforma solicitar instruções públicas de exclusão de dados,
              utilize também esta seção:
            </p>
            <a
              className="mt-2 inline-flex items-center gap-2 text-sm text-primary transition-opacity hover:opacity-80"
              href={buildAbsoluteUrl(DATA_DELETION_URL)}
            >
              {buildAbsoluteUrl(DATA_DELETION_URL)}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="site-section pt-0">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="mb-10 flex flex-wrap gap-3">
            {POLICY_SECTIONS.map((section) => (
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
            {POLICY_SECTIONS.map((section) => {
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
              Dúvidas, solicitações ou revisão de dados
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-on-surface-variant">
              Você pode falar com a GSUCHOA para solicitar informações adicionais sobre este
              documento, exercer direitos relacionados a dados pessoais ou pedir revisão de um
              caso específico de tratamento.
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
