import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  LayoutDashboard,
  MessageSquareQuote,
  RefreshCw,
  ShieldCheck,
  Users,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { PanelAnalyticsCard } from "../../components/painel/PanelAnalyticsCard";
import { PanelDashboardSkeleton } from "../../components/painel/PanelDashboardSkeleton";
import { PanelLineChart } from "../../components/painel/PanelLineChart";
import { PanelMetricCard } from "../../components/painel/PanelMetricCard";
import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { PanelProgressList } from "../../components/painel/PanelProgressList";
import { PanelRangeToggle } from "../../components/painel/PanelRangeToggle";
import { PanelRecentListCard } from "../../components/painel/PanelRecentListCard";
import { PanelRecentModulesCard } from "../../components/painel/PanelRecentModulesCard";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import { useToast } from "../../context/shared/ToastContext";
import {
  fetchPanelDashboard,
  type PanelDashboardRange,
  type PanelDashboardResponse,
} from "../../services/painel/dashboard-api";

const STATUS_COLORS: Record<string, string> = {
  draft: "linear-gradient(90deg, #f59e0b, #fbbf24)",
  featured: "linear-gradient(90deg, #2262f0, #60a5fa)",
  published: "linear-gradient(90deg, #10b981, #34d399)",
};

const SERIES_COLORS = {
  clients: "#10b981",
  portfolio: "#f59e0b",
  testimonials: "#f97316",
  users: "#2262f0",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(date);
}

function formatStatusLabel(value: string) {
  if (value === "published") {
    return "Publicados";
  }

  if (value === "featured") {
    return "Destaques";
  }

  if (value === "draft") {
    return "Rascunhos";
  }

  return value;
}

function getInitials(name: string) {
  const segments = name.trim().split(/\s+/).filter(Boolean);

  return segments
    .slice(0, 2)
    .map((segment) => segment.charAt(0).toUpperCase())
    .join("");
}

function getDashboardTotal(response: PanelDashboardResponse | null) {
  if (!response) {
    return 0;
  }

  return (
    response.summary.users.total +
    response.summary.clients.total +
    response.summary.portfolio.total +
    response.summary.testimonials.total
  );
}

export default function DashboardPage() {
  const toast = useToast();
  const { token } = usePanelAuth();
  const [range, setRange] = useState<PanelDashboardRange>("30d");
  const [dashboard, setDashboard] = useState<PanelDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;
    const hasLoadedOnce = hasLoadedOnceRef.current;

    setError(null);

    if (hasLoadedOnce) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    void (async () => {
      try {
        const nextDashboard = await fetchPanelDashboard(token, range);

        if (!isMounted) {
          return;
        }

        hasLoadedOnceRef.current = true;
        setDashboard(nextDashboard);
      } catch (reason) {
        if (!isMounted) {
          return;
        }

        const nextError =
          reason instanceof Error
            ? reason.message
            : "Nao foi possivel carregar o dashboard agora.";

        setError(nextError);

        if (hasLoadedOnce) {
          toast.error({
            title: "Falha ao atualizar o dashboard",
            description: nextError,
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [range, refreshNonce, token, toast]);

  const hasAnyActivity = getDashboardTotal(dashboard) > 0;

  const metricCards = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return [
      {
        description: "Base administrativa com acesso habilitado ao workspace interno.",
        icon: <Users className="h-5 w-5" />,
        label: "Usuarios",
        meta: [
          { label: "Ativos", value: formatNumber(dashboard.summary.users.active) },
          { label: "Inativos", value: formatNumber(dashboard.summary.users.inactive) },
        ],
        toneClassName: "border-primary/20 bg-primary/10 text-primary",
        value: formatNumber(dashboard.summary.users.total),
      },
      {
        description: "Clientes cadastrados para exibicao institucional e prova social.",
        icon: <UsersRound className="h-5 w-5" />,
        label: "Clientes",
        meta: [
          { label: "Publicados", value: formatNumber(dashboard.summary.clients.published) },
          { label: "Destaques", value: formatNumber(dashboard.summary.clients.featured) },
        ],
        toneClassName: "border-emerald-500/18 bg-emerald-500/10 text-emerald-500",
        value: formatNumber(dashboard.summary.clients.total),
      },
      {
        description: "Cases e entregas prontas para compor a narrativa comercial da marca.",
        icon: <BriefcaseBusiness className="h-5 w-5" />,
        label: "Portfolio",
        meta: [
          { label: "Publicados", value: formatNumber(dashboard.summary.portfolio.published) },
          { label: "Destaques", value: formatNumber(dashboard.summary.portfolio.featured) },
        ],
        toneClassName: "border-amber-500/18 bg-amber-500/10 text-amber-500",
        value: formatNumber(dashboard.summary.portfolio.total),
      },
      {
        description: "Depoimentos publicados para reforcar autoridade, validacao e conversao.",
        icon: <MessageSquareQuote className="h-5 w-5" />,
        label: "Depoimentos",
        meta: [
          { label: "Publicados", value: formatNumber(dashboard.summary.testimonials.published) },
          { label: "Destaques", value: formatNumber(dashboard.summary.testimonials.featured) },
        ],
        toneClassName: "border-orange-500/18 bg-orange-500/10 text-orange-500",
        value: formatNumber(dashboard.summary.testimonials.total),
      },
    ];
  }, [dashboard]);

  const timelineLabels = dashboard?.timeline.map((item) => item.date) ?? [];
  const timelineSeries = dashboard
    ? [
        {
          color: SERIES_COLORS.users,
          label: "Usuarios",
          values: dashboard.timeline.map((item) => item.users),
        },
        {
          color: SERIES_COLORS.clients,
          label: "Clientes",
          values: dashboard.timeline.map((item) => item.clients),
        },
        {
          color: SERIES_COLORS.portfolio,
          label: "Portfolio",
          values: dashboard.timeline.map((item) => item.portfolio),
        },
        {
          color: SERIES_COLORS.testimonials,
          label: "Depoimentos",
          values: dashboard.timeline.map((item) => item.testimonials),
        },
      ]
    : [];

  const publicationRates = dashboard
    ? [
        {
          color: "linear-gradient(90deg, #10b981, #34d399)",
          helper: "Clientes publicados no site institucional.",
          label: "Clientes",
          value: dashboard.highlights.publicationRateClients,
        },
        {
          color: "linear-gradient(90deg, #f59e0b, #fbbf24)",
          helper: "Cases ja visiveis na vitrine da marca.",
          label: "Portfolio",
          value: dashboard.highlights.publicationRatePortfolio,
        },
        {
          color: "linear-gradient(90deg, #f97316, #fb923c)",
          helper: "Depoimentos liberados para prova social.",
          label: "Depoimentos",
          value: dashboard.highlights.publicationRateTestimonials,
        },
      ]
    : [];

  const distributionSections = dashboard
    ? [
        {
          items: dashboard.distributions.clientsStatus.map((item) => ({
            color: STATUS_COLORS[item.label] ?? STATUS_COLORS.published,
            helper: `${formatNumber(item.count)} registros`,
            label: formatStatusLabel(item.label),
            value: item.count,
          })),
          title: "Clientes",
          total: dashboard.summary.clients.total,
        },
        {
          items: dashboard.distributions.portfolioStatus.map((item) => ({
            color: STATUS_COLORS[item.label] ?? STATUS_COLORS.published,
            helper: `${formatNumber(item.count)} registros`,
            label: formatStatusLabel(item.label),
            value: item.count,
          })),
          title: "Portfolio",
          total: dashboard.summary.portfolio.total,
        },
        {
          items: dashboard.distributions.testimonialsStatus.map((item) => ({
            color: STATUS_COLORS[item.label] ?? STATUS_COLORS.published,
            helper: `${formatNumber(item.count)} registros`,
            label: formatStatusLabel(item.label),
            value: item.count,
          })),
          title: "Depoimentos",
          total: dashboard.summary.testimonials.total,
        },
      ]
    : [];

  const recentUsers = dashboard
    ? dashboard.recent.users.map((item) => ({
        badge: (
          <span className="text-sm font-bold text-primary">
            {getInitials(item.name)}
          </span>
        ),
        id: item.id,
        meta: formatDate(item.createdAt),
        subtitle: item.email,
        title: item.name,
      }))
    : [];

  const recentModules = dashboard
    ? [
        {
          icon: <UsersRound className="h-4 w-4" />,
          items: dashboard.recent.clients.slice(0, 3).map((item) => ({
            id: item.id,
            meta: formatDate(item.createdAt),
            status: item.isPublished ? "Publicado" : "Rascunho",
            subtitle: item.subtitle ?? "Cliente institucional",
            title: item.title,
          })),
          title: "Clientes",
          to: "/painel/clientes",
        },
        {
          icon: <BriefcaseBusiness className="h-4 w-4" />,
          items: dashboard.recent.portfolio.slice(0, 3).map((item) => ({
            id: item.id,
            meta: formatDate(item.createdAt),
            status: item.isPublished ? "Publicado" : "Rascunho",
            subtitle: item.subtitle ?? "Case publicado",
            title: item.title,
          })),
          title: "Portfolio",
          to: "/painel/portfolio",
        },
        {
          icon: <MessageSquareQuote className="h-4 w-4" />,
          items: dashboard.recent.testimonials.slice(0, 3).map((item) => ({
            id: item.id,
            meta: formatDate(item.createdAt),
            status: item.isPublished ? "Publicado" : "Rascunho",
            subtitle: item.subtitle ?? "Depoimento institucional",
            title: item.title,
          })),
          title: "Depoimentos",
          to: "/painel/depoimentos",
        },
      ]
    : [];

  const pageActions = (
    <>
      <PanelRangeToggle
        disabled={isLoading || isRefreshing}
        onChange={setRange}
        value={range}
      />

      <button
        className="panel-card-muted inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isRefreshing}
        onClick={() => setRefreshNonce((current) => current + 1)}
        type="button"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        Atualizar
      </button>
    </>
  );

  if (isLoading && !dashboard) {
    return (
      <div className="space-y-8">
        <PanelPageHeader
          actions={pageActions}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Dashboard" },
          ]}
          description="Visao consolidada do workspace, do conteudo institucional e do ritmo recente da operacao."
          title="Dashboard"
        />
        <PanelDashboardSkeleton />
      </div>
    );
  }

  if (!dashboard && error) {
    return (
      <div className="space-y-8">
        <PanelPageHeader
          actions={pageActions}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Dashboard" },
          ]}
          description="Visao consolidada do workspace, do conteudo institucional e do ritmo recente da operacao."
          title="Dashboard"
        />

        <PanelAnalyticsCard
          actions={(
            <button
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              onClick={() => setRefreshNonce((current) => current + 1)}
              type="button"
            >
              Tentar novamente
              <ArrowUpRight className="h-4 w-4" />
            </button>
          )}
          description="A API respondeu com erro ou o payload do dashboard nao foi reconhecido."
          eyebrow="Falha de carregamento"
          title="Nao foi possivel montar a visao analitica"
        >
          <div className="rounded-[1.5rem] border border-dashed border-outline-variant/20 px-6 py-10">
            <p className="text-base font-semibold text-on-surface">{error}</p>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              Verifique se o backend continua acessivel e se o token atual ainda esta valido.
            </p>
          </div>
        </PanelAnalyticsCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PanelPageHeader
        actions={pageActions}
        breadcrumbs={[
          { label: "Painel", to: "/painel/dashboard" },
          { label: "Dashboard" },
        ]}
        description="Visao consolidada do workspace, do conteudo institucional e do ritmo recente da operacao."
        title="Dashboard"
      />

      {error ? (
        <div className="panel-card-muted flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-on-surface">
              O dashboard exibido abaixo e o ultimo snapshot valido.
            </p>
            <p className="mt-1 text-sm text-on-surface-variant">{error}</p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/8 px-4 py-2.5 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
            onClick={() => setRefreshNonce((current) => current + 1)}
            type="button"
          >
            Tentar de novo
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {!hasAnyActivity && dashboard ? (
        <PanelAnalyticsCard
          actions={(
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                to="/painel/usuarios"
              >
                Abrir usuarios
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                className="panel-card-muted inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                to="/painel/clientes"
              >
                Abrir clientes
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          )}
          description="Assim que usuarios, clientes, portfolio e depoimentos forem sendo cadastrados, esta tela passa a refletir distribuicoes, timelines e atividade recente."
          eyebrow="Painel pronto"
          title="Ainda nao ha dados suficientes para analise"
        >
          <div className="rounded-[1.5rem] border border-dashed border-outline-variant/20 px-6 py-10">
            <p className="text-base font-semibold text-on-surface">
              A estrutura analitica ja esta pronta para receber os primeiros registros.
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
              Comece publicando clientes, portfolio ou depoimentos. O dashboard utiliza o endpoint real do backend e atualiza a leitura do workspace automaticamente.
            </p>
          </div>
        </PanelAnalyticsCard>
      ) : (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((item) => (
              <PanelMetricCard
                description={item.description}
                icon={item.icon}
                key={item.label}
                label={item.label}
                meta={item.meta}
                toneClassName={item.toneClassName}
                value={item.value}
              />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
            <PanelAnalyticsCard
              description="Evolucao temporal dos registros criados em cada modulo, conforme o periodo selecionado."
              eyebrow="Timeline"
              title="Ritmo de crescimento do workspace"
            >
              <PanelLineChart
                labels={timelineLabels}
                range={range}
                series={timelineSeries}
              />
            </PanelAnalyticsCard>

            <PanelAnalyticsCard
              description="Resumo executivo da presenca institucional e do quanto do acervo ja esta apto para publicacao."
              eyebrow="Snapshot"
              title="Conteudo publicado e readiness"
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="panel-card-muted rounded-[1.5rem] border px-4 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                    Publicado
                  </p>
                  <p className="mt-3 text-3xl font-black tracking-tight text-on-surface">
                    {formatNumber(dashboard.highlights.totalPublishedContent)}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                    Itens visiveis no site neste momento.
                  </p>
                </div>

                <div className="panel-card-muted rounded-[1.5rem] border px-4 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                    Rascunhos
                  </p>
                  <p className="mt-3 text-3xl font-black tracking-tight text-on-surface">
                    {formatNumber(dashboard.highlights.totalDraftContent)}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                    Registros ainda fora da vitrine publica.
                  </p>
                </div>

                <div className="panel-card-muted rounded-[1.5rem] border px-4 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                    Destaques
                  </p>
                  <p className="mt-3 text-3xl font-black tracking-tight text-on-surface">
                    {formatNumber(dashboard.highlights.featuredItemsOnSite)}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                    Conteudos priorizados na experiencia do site.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-outline-variant/10 bg-surface-container-low/70 p-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-outline-variant/10 bg-primary/10 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      Taxa de publicacao por modulo
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Leitura rapida da saude editorial do site.
                    </p>
                  </div>
                </div>

                <PanelProgressList
                  items={publicationRates}
                  maxValue={100}
                  suffix="%"
                />
              </div>
            </PanelAnalyticsCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr_1fr]">
            <PanelAnalyticsCard
              description="Distribuicao entre publicados, rascunhos e destaques em cada modulo institucional."
              eyebrow="Distribuicao"
              title="Status do acervo por modulo"
            >
              <div className="space-y-4">
                {distributionSections.map((section) => (
                  <section
                    className="panel-card-muted rounded-[1.5rem] border p-4"
                    key={section.title}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{section.title}</p>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          {formatNumber(section.total)} registros nesse modulo.
                        </p>
                      </div>
                      <span className="rounded-full border border-outline-variant/12 bg-surface-container-low px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                        Base atual
                      </span>
                    </div>

                    <PanelProgressList
                      items={section.items}
                      maxValue={Math.max(section.total, 1)}
                    />
                  </section>
                ))}
              </div>
            </PanelAnalyticsCard>

            <PanelRecentListCard
              description="Ultimos administradores e operadores adicionados ao painel."
              emptyDescription="Assim que novas contas forem criadas, elas passarao a aparecer aqui."
              eyebrow="Acesso"
              items={recentUsers}
              title="Usuarios recentes"
            />

            <PanelRecentModulesCard
              description="Ultimos itens adicionados nos modulos que alimentam o site institucional."
              sections={recentModules}
              title="Conteudo recem-criado"
            />
          </section>
        </>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <PanelAnalyticsCard
          description="Atalhos para os modulos com maior impacto na presenca publica e na operacao comercial."
          eyebrow="Navegacao rapida"
          title="Blocos mais acionados do workspace"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                description: "Gerencie permissao, perfis internos e seguranca operacional do painel.",
                icon: <Users className="h-4 w-4" />,
                title: "Usuarios",
                to: "/painel/usuarios",
              },
              {
                description: "Organize cases, destaque entregas e refine a vitrine comercial da agencia.",
                icon: <BriefcaseBusiness className="h-4 w-4" />,
                title: "Portfolio",
                to: "/painel/portfolio",
              },
              {
                description: "Mantenha prova social sempre atualizada com relatos, destaques e curadoria editorial.",
                icon: <MessageSquareQuote className="h-4 w-4" />,
                title: "Depoimentos",
                to: "/painel/depoimentos",
              },
              {
                description: "Atualize logos, presenca institucional e relacionamento de cada conta atendida.",
                icon: <UsersRound className="h-4 w-4" />,
                title: "Clientes",
                to: "/painel/clientes",
              },
            ].map((item) => (
              <Link
                className="panel-card-muted group rounded-[1.5rem] border px-5 py-5 transition-colors hover:border-primary/25"
                key={item.title}
                to={item.to}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-outline-variant/10 bg-surface-container-low text-primary">
                    {item.icon}
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-on-surface-variant transition-colors group-hover:text-primary" />
                </div>
                <p className="mt-5 text-base font-semibold text-on-surface">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </PanelAnalyticsCard>

        <PanelAnalyticsCard
          description="Resumo operacional do que o backend entregou para a leitura executiva desta pagina."
          eyebrow="Leitura executiva"
          title="Sinais principais do periodo"
        >
          <div className="space-y-4">
            {[
              {
                icon: <LayoutDashboard className="h-4 w-4" />,
                text: `${formatNumber(dashboard.highlights.totalPublishedContent)} itens publicados estao ativos no site.`,
              },
              {
                icon: <BarChart3 className="h-4 w-4" />,
                text: `A maior base do momento esta em Clientes, com ${formatNumber(dashboard.summary.clients.total)} registros.`,
              },
              {
                icon: <Activity className="h-4 w-4" />,
                text: `A timeline de ${range} mostra atividade concentrada nas criacoes mais recentes do workspace.`,
              },
              {
                icon: <ShieldCheck className="h-4 w-4" />,
                text: `A taxa media de publicacao dos modulos institucionais esta em ${formatNumber(Math.round((dashboard.highlights.publicationRateClients + dashboard.highlights.publicationRatePortfolio + dashboard.highlights.publicationRateTestimonials) / 3))}%.`,
              },
            ].map((item) => (
              <div
                className="panel-card-muted flex gap-4 rounded-[1.5rem] border px-4 py-4"
                key={item.text}
              >
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl border border-outline-variant/10 bg-surface-container-low text-primary">
                  {item.icon}
                </div>
                <p className="pt-1 text-sm leading-relaxed text-on-surface">
                  {item.text}
                </p>
              </div>
            ))}

            <div className="rounded-[1.5rem] border border-dashed border-outline-variant/20 px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                Ultima leitura do backend
              </p>
              <p className="mt-2 text-sm font-semibold text-on-surface">
                Dados recentes coletados do endpoint real do dashboard.
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Os registros mais novos aparecem entre {formatDateTime(dashboard.recent.users[0]?.createdAt ?? new Date().toISOString())} e {formatDateTime(dashboard.recent.clients[0]?.createdAt ?? new Date().toISOString())}.
              </p>
            </div>
          </div>
        </PanelAnalyticsCard>
      </section>
    </div>
  );
}
