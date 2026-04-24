import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  ExternalLink,
  Image as ImageIcon,
  RefreshCcw,
  Search,
  ShieldCheck,
  TrendingUp,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { Seo } from "../../components/shared/Seo";
import { AppInput } from "../../components/shared/ui/AppInput";
import {
  getPanelLinkedInStatusBadgeClassName,
  getPanelLinkedInStatusDescription,
  getPanelLinkedInStatusLabel,
  panelLinkedInStatusNeedsReconnect,
} from "../../config/painel/linkedin-status";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import {
  getPanelLinkedInConnectionStatus,
  listPanelLinkedInSocialAccounts,
  type PanelLinkedInConnectionStatusRecord,
  type PanelLinkedInSocialAccountRecord,
} from "../../services/painel/linkedin-api";

function StateCard({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="panel-card rounded-[2rem] border p-8">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-black tracking-tight text-on-surface">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{description}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </section>
  );
}

function LinkedInStatusBadge({
  status,
}: {
  status: PanelLinkedInConnectionStatusRecord["status"];
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getPanelLinkedInStatusBadgeClassName(
        status,
      )}`}
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      {getPanelLinkedInStatusLabel(status)}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  toneClassName,
  value,
}: {
  icon: LucideIcon;
  label: string;
  toneClassName: string;
  value: string;
}) {
  return (
    <div className="panel-card-muted rounded-[1.5rem] border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
            {label}
          </p>
          <p className="mt-3 text-2xl font-black tracking-tight text-on-surface">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${toneClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function CapabilityBadge({
  label,
  toneClassName,
}: {
  label: string;
  toneClassName: string;
}) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClassName}`}>
      {label}
    </span>
  );
}

function OrganizationTable({
  isLoading,
  items,
  onOpenDashboard,
}: {
  isLoading: boolean;
  items: PanelLinkedInSocialAccountRecord[];
  onOpenDashboard: (item: PanelLinkedInSocialAccountRecord) => void;
}) {
  if (isLoading) {
    return (
      <div className="panel-card overflow-hidden rounded-[1.75rem] border">
        <div className="space-y-3 p-4 md:p-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              className="panel-card-muted h-28 animate-pulse rounded-2xl border"
              key={index}
            />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="panel-card rounded-[1.75rem] border border-dashed px-6 py-12 text-center">
        <p className="text-sm font-semibold text-on-surface">Nenhuma organization do LinkedIn encontrada</p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          Assim que a integração retornar organizations prontas para leitura social, elas aparecerão aqui para abrir o dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="panel-card overflow-hidden rounded-[1.75rem] border">
      <div className="overflow-x-auto overflow-y-visible">
        <table className="min-w-full text-left text-sm">
          <thead className="panel-card-muted border-b border-outline-variant/12">
            <tr className="text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
              <th className="px-6 py-4 font-semibold">Organization</th>
              <th className="px-6 py-4 font-semibold">Capacidades</th>
              <th className="px-6 py-4 font-semibold">Perfil</th>
              <th className="px-6 py-4 text-right font-semibold">Abrir</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                className="border-b border-outline-variant/10 transition-colors hover:bg-surface-container-low/55 last:border-b-0"
                key={item.id}
              >
                <td className="min-w-[24rem] px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-2xl border border-primary/16 bg-primary/8 text-primary">
                      {item.avatarUrl ? (
                        <img
                          alt={item.displayName}
                          className="h-full w-full object-cover"
                          src={item.avatarUrl}
                        />
                      ) : (
                        <BriefcaseBusiness className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-on-surface">
                        {item.displayName}
                      </p>
                      <p className="mt-1 truncate text-xs text-on-surface-variant">{item.organizationUrn}</p>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-on-surface-variant">
                        {item.description || item.vanityName || item.organizationId}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="min-w-[20rem] px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    <CapabilityBadge
                      label={item.capabilities.hasDashboard ? "Dashboard pronto" : "Sem dashboard"}
                      toneClassName={item.capabilities.hasDashboard
                        ? "border-emerald-500/18 bg-emerald-500/10 text-emerald-500"
                        : "border-outline-variant/14 bg-surface text-on-surface-variant"}
                    />
                    <CapabilityBadge
                      label={item.capabilities.hasContents ? "Conteúdos" : "Sem conteúdos"}
                      toneClassName={item.capabilities.hasContents
                        ? "border-sky-500/18 bg-sky-500/10 text-sky-500"
                        : "border-outline-variant/14 bg-surface text-on-surface-variant"}
                    />
                    <CapabilityBadge
                      label={item.capabilities.hasOrganicPostAnalytics ? "Analytics orgânico" : "Sem analytics"}
                      toneClassName={item.capabilities.hasOrganicPostAnalytics
                        ? "border-violet-500/18 bg-violet-500/10 text-violet-500"
                        : "border-outline-variant/14 bg-surface text-on-surface-variant"}
                    />
                    <CapabilityBadge
                      label={item.capabilities.hasReliableAudienceGrowth ? "Audiência confiável" : "Audiência parcial"}
                      toneClassName={item.capabilities.hasReliableAudienceGrowth
                        ? "border-amber-500/18 bg-amber-500/10 text-amber-600"
                        : "border-outline-variant/14 bg-surface text-on-surface-variant"}
                    />
                  </div>
                </td>

                <td className="min-w-[15rem] px-6 py-5">
                  <p className="text-sm font-semibold text-on-surface">{item.role || "Acesso autorizado"}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="text-xs text-on-surface-variant">
                      {item.vanityName ? `@${item.vanityName}` : item.organizationId}
                    </span>
                    {item.profileUrl ? (
                      <a
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-opacity hover:opacity-80"
                        href={item.profileUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Ver perfil
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                </td>

                <td className="px-6 py-5 text-right">
                  <button
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/16 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!item.capabilities.hasDashboard}
                    onClick={() => onOpenDashboard(item)}
                    type="button"
                  >
                    Ver dashboard
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function normalizeSearchableText(item: PanelLinkedInSocialAccountRecord) {
  return [
    item.displayName,
    item.description,
    item.id,
    item.organizationId,
    item.organizationUrn,
    item.role,
    item.vanityName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function SocialMediaLinkedInPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = usePanelAuth();
  const [searchValue, setSearchValue] = useState("");
  const [linkedinStatus, setLinkedInStatus] =
    useState<PanelLinkedInConnectionStatusRecord | null>(null);
  const [accounts, setAccounts] = useState<PanelLinkedInSocialAccountRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadContext = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const nextStatus = await getPanelLinkedInConnectionStatus(token);
      setLinkedInStatus(nextStatus);

      if (nextStatus.status !== "CONNECTED") {
        setAccounts([]);
        return;
      }

      const nextAccounts = await listPanelLinkedInSocialAccounts(token);
      setAccounts(nextAccounts);
    } catch (error) {
      setLinkedInStatus(null);
      setAccounts([]);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as organizations do LinkedIn agora.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return accounts;
    }

    return accounts.filter((item) => normalizeSearchableText(item).includes(normalizedSearch));
  }, [accounts, searchValue]);

  const dashboardsReadyCount = useMemo(
    () => accounts.filter((item) => item.capabilities.hasDashboard).length,
    [accounts],
  );
  const contentsReadyCount = useMemo(
    () => accounts.filter((item) => item.capabilities.hasContents).length,
    [accounts],
  );
  const analyticsReadyCount = useMemo(
    () => accounts.filter((item) => item.capabilities.hasOrganicPostAnalytics).length,
    [accounts],
  );

  return (
    <>
      <Seo
        description="Selecione uma organization do LinkedIn para abrir o dashboard com visão consolidada, ranking e biblioteca de conteúdos orgânicos."
        noindex
        path={location.pathname}
        structuredData={null}
        title="Social Media • LinkedIn"
      />

      <div className="space-y-6">
        <PanelPageHeader
          actions={linkedinStatus ? <LinkedInStatusBadge status={linkedinStatus.status} /> : undefined}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Social media" },
            { label: "LinkedIn" },
          ]}
          description="Escolha a organization retornada pela integração LinkedIn. A partir dela, o painel abre uma leitura pronta com visão geral, comparativos, padrões de publicação e conteúdos normalizados."
          title="Social Media • LinkedIn"
        />

        <section className="panel-card relative overflow-hidden rounded-[2.2rem] border px-5 py-6 md:px-6 md:py-7">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[30rem] max-w-full bg-[radial-gradient(circle_at_top_right,rgba(10,102,194,0.18),transparent_58%)]" />

          <div className="relative z-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={UsersRound}
              label="Organizations disponíveis"
              toneClassName="border-primary/16 bg-primary/10 text-primary"
              value={String(accounts.length)}
            />
            <StatCard
              icon={BarChart3}
              label="Dashboards prontos"
              toneClassName="border-emerald-500/16 bg-emerald-500/10 text-emerald-500"
              value={String(dashboardsReadyCount)}
            />
            <StatCard
              icon={ImageIcon}
              label="Conteúdos ativos"
              toneClassName="border-sky-500/16 bg-sky-500/10 text-sky-500"
              value={String(contentsReadyCount)}
            />
            <StatCard
              icon={TrendingUp}
              label="Analytics orgânico"
              toneClassName="border-violet-500/16 bg-violet-500/10 text-violet-500"
              value={String(analyticsReadyCount)}
            />
          </div>
        </section>

        <section className="panel-card rounded-[2rem] border p-5 md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 flex-1">
              <AppInput
                className="py-0"
                leadingIcon={<Search className="h-4 w-4" />}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Buscar por organization, URN, vanity name ou papel"
                value={searchValue}
                wrapperClassName="h-12 rounded-[1.2rem]"
              />
            </div>

            <button
              className="panel-card-muted inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
              onClick={() => void loadContext()}
              type="button"
            >
              <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </button>
          </div>
        </section>

        {loadError ? (
          <section className="panel-card rounded-[1.8rem] border border-red-500/14 bg-red-500/6 px-5 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Não foi possível carregar as organizations do LinkedIn
                </p>
                <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{loadError}</p>
              </div>
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/18 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                onClick={() => void loadContext()}
                type="button"
              >
                <RefreshCcw className="h-4 w-4" />
                Tentar novamente
              </button>
            </div>
          </section>
        ) : null}

        {linkedinStatus?.status === "NOT_CONNECTED" ? (
          <StateCard
            action={(
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                onClick={() => navigate("/painel/contas-integracao/linkedin")}
                type="button"
              >
                Ir para Contas e integrações
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            description="A integração LinkedIn ainda não está conectada. Assim que a conexão estiver ativa, as organizations disponíveis aparecerão aqui automaticamente."
            title="Conecte o LinkedIn para listar as organizations"
          />
        ) : null}

        {linkedinStatus && panelLinkedInStatusNeedsReconnect(linkedinStatus.status) ? (
          <StateCard
            action={(
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                onClick={() => navigate("/painel/contas-integracao/linkedin")}
                type="button"
              >
                Revisar integração
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            description={getPanelLinkedInStatusDescription(linkedinStatus.status)}
            title={`Operação LinkedIn em atenção: ${getPanelLinkedInStatusLabel(linkedinStatus.status)}`}
          />
        ) : null}

        {linkedinStatus?.status === "CONNECTED" ? (
          <OrganizationTable
            isLoading={isLoading}
            items={filteredItems}
            onOpenDashboard={(item) =>
              navigate(`/painel/social-media/linkedin/${encodeURIComponent(item.id)}/dashboard`)
            }
          />
        ) : null}
      </div>
    </>
  );
}
