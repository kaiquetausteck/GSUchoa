import {
  ArrowUpRight,
  BriefcaseBusiness,
  LayoutDashboard,
  Link2,
  MessageSquareQuote,
  PlusCircle,
  Search,
  Target,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";

import {
  PANEL_NAV_GROUPS,
  PANEL_NAV_ITEMS,
  PANEL_NAV_PRIMARY_ITEMS,
} from "../../config/painel/navigation";

type CommandEntry = {
  description: string;
  group: string;
  icon: LucideIcon;
  id: string;
  implemented?: boolean;
  keywords: string;
  label: string;
  meta?: string;
  to: string;
};

const NAVIGATION_ENTRIES: CommandEntry[] = [
  ...PANEL_NAV_PRIMARY_ITEMS.map((item) => ({
    description: item.description,
    group: "Geral",
    icon: item.icon,
    id: item.key,
    implemented: item.implemented,
    keywords: `${item.label} ${item.title} ${item.segment}`,
    label: item.label,
    meta: "Módulo principal",
    to: item.to,
  })),
  ...PANEL_NAV_GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      description: item.description,
      group: group.label,
      icon: item.icon,
      id: item.key,
      implemented: item.implemented,
      keywords: `${item.label} ${item.title} ${item.segment} ${group.label}`,
      label: item.label,
      meta: item.implemented ? group.label : `${group.label} • em breve`,
      to: item.to,
    })),
  ),
];

const QUICK_ACTIONS: CommandEntry[] = [
  {
    description: "Abra a gestão de acessos e siga para a criação de um novo administrador.",
    group: "Ações rápidas",
    icon: PlusCircle,
    id: "new-user",
    keywords: "novo usuario criar usuario acesso admin",
    label: "Novo usuário",
    meta: "Ir para usuários",
    to: "/painel/usuarios",
  },
  {
    description: "Volte para a visão geral do painel e acompanhe indicadores e atividade recente.",
    group: "Ações rápidas",
    icon: LayoutDashboard,
    id: "workspace",
    keywords: "workspace geral painel dashboard",
    label: "Abrir visão geral",
    meta: "Dashboard",
    to: "/painel/dashboard",
  },
  {
    description: "Gerencie a vitrine institucional, os cases publicados e os itens em destaque.",
    group: "Ações rápidas",
    icon: BriefcaseBusiness,
    id: "portfolio-next",
    keywords: "portfolio cases projetos",
    label: "Ir para portfólio",
    meta: "Gerenciamento",
    to: "/painel/portfolio",
  },
  {
    description: "Acesse rapidamente a listagem completa de usuários administrativos.",
    group: "Ações rápidas",
    icon: Users,
    id: "user-list",
    keywords: "usuarios administradores equipe",
    label: "Abrir usuários",
    meta: "Acesso",
    to: "/painel/usuarios",
  },
  {
    description: "Visualize clientes, logotipos institucionais e destaque as marcas mais relevantes.",
    group: "Ações rápidas",
    icon: UsersRound,
    id: "clients-list",
    keywords: "clientes marcas logos destaque",
    label: "Abrir clientes",
    meta: "Gerenciamento",
    to: "/painel/clientes",
  },
  {
    description: "Abra a curadoria de depoimentos publicados e de prova social da marca.",
    group: "Ações rápidas",
    icon: MessageSquareQuote,
    id: "testimonials-list",
    keywords: "depoimentos prova social testimonials",
    label: "Abrir depoimentos",
    meta: "Gerenciamento",
    to: "/painel/depoimentos",
  },
  {
    description: "Acesse a operação de Meta Ads para listar contas, abrir dashboards por conta e analisar os resultados.",
    group: "Ações rápidas",
    icon: Target,
    id: "paid-traffic-list",
    keywords: "trafego pago meta ads contas dashboard midia",
    label: "Abrir Meta Ads",
    meta: "Tráfego pago",
    to: "/painel/trafego-pago/meta",
  },
  {
    description: "Abra a área técnica de contas e integrações para validar ou reconectar a Meta.",
    group: "Ações rápidas",
    icon: Link2,
    id: "integrations-list",
    keywords: "contas integracao meta conexoes credenciais oauth",
    label: "Abrir integrações",
    meta: "Contas e integrações",
    to: "/painel/contas-integracao/meta",
  },
];

export function PanelCommandMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const commandEntries = useMemo(
    () => [...NAVIGATION_ENTRIES, ...QUICK_ACTIONS],
    [],
  );

  const searchContextPreview = useMemo(() => {
    return PANEL_NAV_ITEMS.filter((item) => item.implemented !== false)
      .slice(0, 5)
      .map((item) => item.label)
      .join(", ");
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [open]);

  const groupedEntries = useMemo(() => {
    return commandEntries.reduce<Record<string, CommandEntry[]>>((groups, item) => {
      if (!groups[item.group]) {
        groups[item.group] = [];
      }

      groups[item.group].push(item);
      return groups;
    }, {});
  }, [commandEntries]);

  const groups = Object.entries(groupedEntries);

  return (
    <>
      <button
        aria-label="Buscar no painel"
        className="panel-card-muted group flex h-12 w-full items-center gap-3 rounded-[1.35rem] border px-4 text-left transition-colors hover:border-primary/30 hover:text-on-surface"
        onClick={() => setOpen(true)}
        type="button"
      >
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-2xl border border-outline-variant/10 bg-surface-container-low text-on-surface-variant transition-colors group-hover:border-primary/20 group-hover:text-primary">
          <Search className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-on-surface">
            Buscar no painel
          </p>
          <p className="truncate text-xs text-on-surface-variant">
            {searchContextPreview || "Páginas, módulos e atalhos do painel"}
          </p>
        </div>

        <span className="hidden rounded-full border border-outline-variant/14 bg-surface-container-low px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant xl:inline-flex">
          {PANEL_NAV_ITEMS.length} itens
        </span>

        <kbd className="hidden rounded-lg border border-outline-variant/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant md:inline-flex">
          Ctrl K
        </kbd>
      </button>

      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <>
                  <motion.button
                    animate={{ opacity: 1 }}
                    aria-label="Fechar busca global"
                    className="fixed inset-0 z-[300] bg-black/45"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    onClick={() => setOpen(false)}
                    type="button"
                  />

                  <motion.div
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="fixed left-1/2 top-[10vh] z-[310] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2"
                    exit={{ opacity: 0, scale: 0.98, y: 12 }}
                    initial={{ opacity: 0, scale: 0.98, y: 12 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Command className="panel-popover overflow-hidden rounded-[2rem] border">
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-outline-variant/10 px-5 py-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                            Busca global
                          </p>
                          <p className="mt-2 text-base font-semibold text-on-surface">
                            Acesse páginas, módulos e atalhos do painel
                          </p>
                          <p className="mt-1 text-sm text-on-surface-variant">
                            {searchContextPreview || "Dashboard, Usuários, Portfólio, Clientes e mais"}
                          </p>
                        </div>

                        <div className="panel-card-muted flex items-center gap-2 rounded-2xl border px-3 py-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                            Atalhos
                          </span>
                          <span className="text-sm font-semibold text-on-surface">
                            {commandEntries.length}
                          </span>
                        </div>
                      </div>

                      <div className="border-b border-outline-variant/10 px-5 py-4">
                        <div className="panel-card-muted flex items-center gap-3 rounded-2xl border px-4">
                          <Search className="h-4 w-4 text-on-surface-variant" />
                          <Command.Input
                            autoFocus
                            className="w-full bg-transparent py-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/65"
                            placeholder="Procure por páginas, módulos, pessoas ou ações rápidas..."
                          />
                        </div>
                      </div>

                      <Command.List className="max-h-[28rem] overflow-y-auto p-3">
                        <Command.Empty className="px-4 py-10 text-center text-sm text-on-surface-variant">
                          Nenhum resultado encontrado para essa busca.
                        </Command.Empty>

                        {groups.map(([group, entries]) => (
                          <Command.Group
                            className="mb-2 overflow-hidden p-1 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.28em] [&_[cmdk-group-heading]]:text-on-surface-variant"
                            heading={group}
                            key={group}
                          >
                            {entries.map((item) => {
                              const Icon = item.icon;

                              return (
                                <Command.Item
                                  className="group flex cursor-pointer items-center gap-3 rounded-[1.15rem] px-3 py-3 text-sm outline-none transition-colors data-[selected=true]:bg-surface-container-low"
                                  key={item.id}
                                  onSelect={() => {
                                    navigate(item.to);
                                    setOpen(false);
                                  }}
                                  value={`${item.label} ${item.description} ${item.keywords} ${item.meta ?? ""}`}
                                >
                                  <div className="panel-card-muted flex h-10 w-10 flex-none items-center justify-center rounded-2xl border text-primary">
                                    <Icon className="h-4 w-4" />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="truncate font-semibold text-on-surface">
                                        {item.label}
                                      </p>
                                      {item.implemented === false ? (
                                        <span className="rounded-full border border-outline-variant/18 bg-surface px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                                          Em breve
                                        </span>
                                      ) : null}
                                    </div>
                                    <p className="mt-1 truncate text-xs text-on-surface-variant">
                                      {item.description}
                                    </p>
                                  </div>

                                  <div className="flex flex-none items-center gap-3">
                                    {item.meta ? (
                                      <span className="hidden rounded-full border border-outline-variant/14 bg-surface-container-low px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant lg:inline-flex">
                                        {item.meta}
                                      </span>
                                    ) : null}
                                    <ArrowUpRight className="h-4 w-4 flex-none text-on-surface-variant transition-colors group-data-[selected=true]:text-primary" />
                                  </div>
                                </Command.Item>
                              );
                            })}
                          </Command.Group>
                        ))}
                      </Command.List>

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/10 px-5 py-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                          <span className="rounded-lg border border-outline-variant/18 px-2 py-1 font-semibold">
                            Enter
                          </span>
                          abrir item
                          <span className="rounded-lg border border-outline-variant/18 px-2 py-1 font-semibold">
                            Esc
                          </span>
                          fechar a busca
                        </div>

                        <p className="text-xs text-on-surface-variant">
                          Busca alinhada com o menu atual do painel.
                        </p>
                      </div>
                    </Command>
                  </motion.div>
                </>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
