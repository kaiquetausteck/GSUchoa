import {
  ArrowRight,
  Camera,
  Globe2,
  RefreshCcw,
  Search,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { PanelSocialMediaAccountsTable } from "../../components/painel/PanelSocialMediaAccountsTable";
import { Seo } from "../../components/shared/Seo";
import { AppInput } from "../../components/shared/ui/AppInput";
import {
  getPanelMetaStatusBadgeClassName,
  getPanelMetaStatusDescription,
  getPanelMetaStatusLabel,
  panelMetaStatusNeedsReconnect,
} from "../../config/painel/meta-status";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import {
  getPanelMetaConnectionStatus,
  type PanelMetaConnectionStatusRecord,
} from "../../services/painel/meta-api";
import {
  listPanelMetaSocialMediaAccounts,
  type PanelMetaSocialMediaAccountRecord,
} from "../../services/painel/social-media-api";

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

function MetaStatusBadge({
  status,
}: {
  status: PanelMetaConnectionStatusRecord["status"];
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getPanelMetaStatusBadgeClassName(
        status,
      )}`}
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      {getPanelMetaStatusLabel(status)}
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

function normalizeSearchableText(item: PanelMetaSocialMediaAccountRecord) {
  return [
    item.displayName,
    item.id,
    item.pageName,
    item.pageId,
    item.instagramUsername,
    item.instagramAccountId,
    ...item.platforms.flatMap((platform) => [
      platform.displayName,
      platform.externalId,
      platform.username,
    ]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function SocialMediaMetaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = usePanelAuth();
  const [searchValue, setSearchValue] = useState("");
  const [metaStatus, setMetaStatus] = useState<PanelMetaConnectionStatusRecord | null>(null);
  const [accounts, setAccounts] = useState<PanelMetaSocialMediaAccountRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadContext = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const nextStatus = await getPanelMetaConnectionStatus(token);
      setMetaStatus(nextStatus);

      if (nextStatus.status !== "CONNECTED") {
        setAccounts([]);
        return;
      }

      const nextAccounts = await listPanelMetaSocialMediaAccounts(token);
      setAccounts(nextAccounts);
    } catch (error) {
      setMetaStatus(null);
      setAccounts([]);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as contas sociais da Meta agora.",
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

  const combinedCount = useMemo(
    () => accounts.filter((item) => item.type === "both").length,
    [accounts],
  );
  const facebookOnlyCount = useMemo(
    () => accounts.filter((item) => item.type === "facebook").length,
    [accounts],
  );
  const instagramOnlyCount = useMemo(
    () => accounts.filter((item) => item.type === "instagram").length,
    [accounts],
  );

  return (
    <>
      <Seo
        description="Selecione uma conta social Meta consolidada para abrir o dashboard com ranking, comparativos, timeline e conteúdos normalizados."
        noindex
        path={location.pathname}
        structuredData={null}
        title="Social Media • Meta"
      />

      <div className="space-y-6">
        <PanelPageHeader
          actions={metaStatus ? <MetaStatusBadge status={metaStatus.status} /> : undefined}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Social media" },
            { label: "Meta" },
          ]}
          description="Escolha a conta social consolidada retornada pela integração Meta. A partir dela, o painel abre uma leitura pronta com visão geral, comparativos, melhores conteúdos e biblioteca normalizada."
          title="Social Media • Meta"
        />

        <section className="panel-card relative overflow-hidden rounded-[2.2rem] border px-5 py-6 md:px-6 md:py-7">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[30rem] max-w-full bg-[radial-gradient(circle_at_top_right,rgba(34,98,240,0.16),transparent_58%)]" />

          <div className="relative z-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={UsersRound}
              label="Contas disponíveis"
              toneClassName="border-primary/16 bg-primary/10 text-primary"
              value={String(accounts.length)}
            />
            <StatCard
              icon={Globe2}
              label="Facebook + Instagram"
              toneClassName="border-emerald-500/16 bg-emerald-500/10 text-emerald-500"
              value={String(combinedCount)}
            />
            <StatCard
              icon={Globe2}
              label="Somente Facebook"
              toneClassName="border-sky-500/16 bg-sky-500/10 text-sky-500"
              value={String(facebookOnlyCount)}
            />
            <StatCard
              icon={Camera}
              label="Somente Instagram"
              toneClassName="border-fuchsia-500/16 bg-fuchsia-500/10 text-fuchsia-500"
              value={String(instagramOnlyCount)}
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
                placeholder="Buscar por conta, IDs internos, página ou @username"
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
                  Não foi possível carregar as contas sociais da Meta
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

        {metaStatus?.status === "NOT_CONNECTED" ? (
          <StateCard
            action={(
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                onClick={() => navigate("/painel/contas-integracao/meta")}
                type="button"
              >
                Ir para Contas e integrações
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            description="A integração Meta ainda não está conectada. Assim que a conexão estiver ativa, as contas sociais disponíveis aparecerão aqui automaticamente."
            title="Conecte a Meta para listar as contas sociais"
          />
        ) : null}

        {metaStatus && panelMetaStatusNeedsReconnect(metaStatus.status) ? (
          <StateCard
            action={(
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                onClick={() => navigate("/painel/contas-integracao/meta")}
                type="button"
              >
                Revisar integração
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            description={getPanelMetaStatusDescription(metaStatus.status)}
            title={`Operação Meta em atenção: ${getPanelMetaStatusLabel(metaStatus.status)}`}
          />
        ) : null}

        {metaStatus?.status === "CONNECTED" ? (
          <PanelSocialMediaAccountsTable
            isLoading={isLoading}
            items={filteredItems}
            onOpenDashboard={(item) =>
              navigate(
                `/painel/social-media/meta/${encodeURIComponent(item.id)}/dashboard`,
              )
            }
          />
        ) : null}
      </div>
    </>
  );
}
