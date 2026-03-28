import {
  FolderKanban,
  Image,
  LayoutDashboard,
  Link2,
  MessageSquareQuote,
  Target,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type PanelNavItem = {
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
    label: "Usuarios",
    segment: "usuarios",
    to: "/painel/usuarios",
    icon: Users,
    implemented: true,
    title: "Usuarios",
    description: "Gestao de perfis, acesso, papeis e administradores do sistema.",
  },
];

export const PANEL_NAV_GROUPS: PanelNavGroup[] = [
  {
    key: "site-management",
    label: "Gerenciamento",
    items: [
      {
        key: "portfolio",
        label: "Portfolio",
        segment: "portfolio",
        to: "/painel/portfolio",
        icon: FolderKanban,
        implemented: true,
        title: "Portfolio",
        description: "Organizacao dos cases, projetos entregues e destaques da marca.",
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
        description: "Acompanhamento de contas, contratos, status e relacionamento.",
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
        description: "Calendario, publicacoes, criativos e organizacao do conteudo social.",
      },
      {
        key: "trafego-pago",
        label: "Trafego Pago",
        segment: "trafego-pago",
        to: "/painel/trafego-pago",
        icon: Target,
        title: "Trafego Pago",
        description: "Visao de campanhas, canais, investimento e performance paga.",
      },
      {
        key: "contas-integracao",
        label: "Contas Integracao",
        segment: "contas-integracao",
        to: "/painel/contas-integracao",
        icon: Link2,
        title: "Contas Integracao",
        description: "Conexoes, credenciais e integracoes usadas pelos modulos de resultado.",
      },
    ],
  },
];

export const PANEL_NAV_ITEMS: PanelNavItem[] = [
  ...PANEL_NAV_PRIMARY_ITEMS,
  ...PANEL_NAV_GROUPS.flatMap((group) => group.items),
];

export function getPanelNavItemByPath(pathname: string) {
  return PANEL_NAV_ITEMS.find((item) => pathname.startsWith(item.to));
}
