import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Funnel,
  FolderKanban,
  Globe,
  Image,
  Inbox,
  LayoutDashboard,
  Link2,
  MessageSquareQuote,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type PanelNavItem = {
  activeMatch?: "exact" | "prefix";
  key: string;
  label: string;
  segment: string;
  to: string;
  icon: LucideIcon;
  implemented?: boolean;
  title: string;
  description: string;
};

export type PanelNavGroup = {
  key: string;
  label: string;
  items: PanelNavItem[];
};

export const PANEL_NAV_PRIMARY_ITEMS: PanelNavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    segment: "dashboard",
    to: "/painel/dashboard",
    icon: LayoutDashboard,
    implemented: true,
    title: "Dashboard",
    description: "Resumo geral do painel, indicadores e atalhos operacionais.",
  },
  {
    key: "usuarios",
    label: "Usuários",
    segment: "usuarios",
    to: "/painel/usuarios",
    icon: Users,
    implemented: true,
    title: "Usuários",
    description: "Gestão de perfis, acessos, papéis e administradores do sistema.",
  },
];

export const PANEL_NAV_GROUPS: PanelNavGroup[] = [
  {
    key: "contacts",
    label: "Contatos",
    items: [
      {
        key: "contatos",
        label: "Todos os contatos",
        segment: "contatos",
        to: "/painel/contatos",
        icon: Inbox,
        implemented: true,
        title: "Todos os contatos",
        description: "Listagem completa de leads, incluindo arquivados, filtros, histórico e operação diária.",
      },
      {
        key: "contatos-funil",
        label: "Funil",
        segment: "contatos/funil",
        to: "/painel/contatos/funil",
        icon: Funnel,
        implemented: true,
        title: "Funil de contatos",
        description: "Visão Kanban dos leads ativos por etapa, com movimentação rápida entre status.",
      },
    ],
  },
  {
    key: "site-management",
    label: "Gerenciamento",
    items: [
      {
        key: "portfolio",
        label: "Portfólio",
        segment: "portfolio",
        to: "/painel/portfolio",
        icon: FolderKanban,
        implemented: true,
        title: "Portfólio",
        description: "Organização dos cases, projetos entregues e destaques da marca.",
      },
      {
        key: "depoimentos",
        label: "Depoimentos",
        segment: "depoimentos",
        to: "/painel/depoimentos",
        icon: MessageSquareQuote,
        implemented: true,
        title: "Depoimentos",
        description: "Curadoria dos relatos publicados, destaques e prova social da marca.",
      },
      {
        key: "clientes",
        label: "Clientes",
        segment: "clientes",
        to: "/painel/clientes",
        icon: UsersRound,
        implemented: true,
        title: "Clientes",
        description: "Gestão das marcas atendidas, com controle de status, destaques e relacionamento.",
      },
    ],
  },
  {
    key: "results",
    label: "Resultados",
    items: [
      {
        key: "social-media",
        label: "Social Media",
        segment: "social-media",
        to: "/painel/social-media",
        icon: Image,
        title: "Social Media",
        description: "Calendário, publicações, criativos e organização do conteúdo social.",
      },
    ],
  },
  {
    key: "paid-media",
    label: "Tráfego pago",
    items: [
      {
        activeMatch: "prefix",
        key: "trafego-pago-meta",
        label: "Meta",
        segment: "trafego-pago/meta",
        to: "/painel/trafego-pago/meta",
        icon: BadgeDollarSign,
        implemented: true,
        title: "Meta Ads",
        description: "Listagem de contas Meta com acesso ao dashboard operacional em uma rota dedicada por conta.",
      },
      {
        key: "trafego-pago-google",
        label: "Google",
        segment: "trafego-pago/google",
        to: "/painel/trafego-pago/google",
        icon: Globe,
        title: "Google Ads",
        description: "Área operacional preparada para campanhas internas de Google Ads.",
      },
    ],
  },
  {
    key: "accounts-integrations",
    label: "Contas e integrações",
    items: [
      {
        key: "contas-integracao-meta",
        label: "Meta",
        segment: "contas-integracao/meta",
        to: "/painel/contas-integracao/meta",
        icon: Link2,
        implemented: true,
        title: "Integração Meta",
        description: "Status da conexão central da Meta, validação, reconexão e gestão técnica da integração.",
      },
      {
        key: "contas-integracao-google",
        label: "Google",
        segment: "contas-integracao/google",
        to: "/painel/contas-integracao/google",
        icon: Globe,
        title: "Integração Google",
        description: "Espaço reservado para a futura conexão técnica com contas Google.",
      },
      {
        key: "contas-integracao-linkedin",
        label: "LinkedIn",
        segment: "contas-integracao/linkedin",
        to: "/painel/contas-integracao/linkedin",
        icon: BriefcaseBusiness,
        title: "Integração LinkedIn",
        description: "Espaço reservado para a futura conexão técnica com contas LinkedIn.",
      },
    ],
  },
];

export const PANEL_NAV_ITEMS: PanelNavItem[] = [
  ...PANEL_NAV_PRIMARY_ITEMS,
  ...PANEL_NAV_GROUPS.flatMap((group) => group.items),
];

export function getPanelNavItemByPath(pathname: string) {
  return [...PANEL_NAV_ITEMS]
    .sort((firstItem, secondItem) => secondItem.to.length - firstItem.to.length)
    .find((item) => pathname.startsWith(item.to));
}
