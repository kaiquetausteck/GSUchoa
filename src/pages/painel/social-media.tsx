import { ArrowRight, Camera, Image, RefreshCcw, Search, Sparkles, UsersRound } from "lucide-react";
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
import { useToast } from "../../context/shared/ToastContext";
import {
  getPanelMetaConnectionStatus,
  type PanelMetaConnectionStatusRecord,
} from "../../services/painel/meta-api";
import {
  listPanelMetaSocialAccounts,
  syncPanelMetaSocialCatalog,
  type PanelSocialMediaAccountRecord,
  type PanelSocialMediaSyncResponse,
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
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPanelMetaStatusBadgeClassName(
        status,
      )}`}
    >
      {getPanelMetaStatusLabel(status)}
    </span>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Ainda não sincronizado nesta sessão";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Ainda não sincronizado nesta sessão";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

export default function SocialMediaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { token } = usePanelAuth();
  const [searchValue, setSearchValue] = useState("");
  const [metaStatus, setMetaStatus] = useState<PanelMetaConnectionStatusRecord | null>(null);
  const [accounts, setAccounts] = useState<PanelSocialMediaAccountRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<PanelSocialMediaSyncResponse | null>(null);

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

      const nextAccounts = await listPanelMetaSocialAccounts(token);
      setAccounts(nextAccounts);
    } catch (error) {
      setMetaStatus(null);
      setAccounts([]);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as contas sociais agora.",
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

    return accounts.filter((item) =>
      [
        item.pageName,
        item.pageId,
        item.pageCategory,
        item.instagramUsername,
        item.instagramName,
        item.instagramUserId,
        ...item.tasks,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearch)),
    );
  }, [accounts, searchValue]);

  const instagramConnectedCount = useMemo(
    () => accounts.filter((item) => Boolean(item.instagramUserId)).length,
    [accounts],
  );
  const totalFollowers = useMemo(
    () => accounts.reduce((total, item) => total + (item.followersCount ?? 0), 0),
    [accounts],
  );
  const totalMedia = useMemo(
    () => accounts.reduce((total, item) => total + (item.mediaCount ?? 0), 0),
    [accounts],
  );

  const handleSync = useCallback(async () => {
    if (!token || metaStatus?.status !== "CONNECTED") {
      return;
    }

    setIsSyncing(true);

    try {
      const response = await syncPanelMetaSocialCatalog(token, {
        instagramMediaLimit: 30,
        pagePostsLimit: 30,
      });

      setLastSyncResult(response);
      toast.success({
        title: "Catálogo social sincronizado",
        description: `${formatNumber(response.pagePostsSynced)} posts de página e ${formatNumber(response.instagramMediaSynced)} mídias do Instagram atualizados.`,
      });

      void loadContext();
    } catch (error) {
      toast.error({
        title: "Falha ao sincronizar",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível sincronizar o catálogo social agora.",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [loadContext, metaStatus?.status, toast, token]);

  return (
    <>
      <Seo
        description="Escolha a conta social Meta para abrir um dashboard mensal de posts, reels e desempenho por período."
        noindex
        path={location.pathname}
        structuredData={null}
        title="Social Media"
      />

      <div className="space-y-6">
        <PanelPageHeader
          actions={(
            <>
              {metaStatus ? <MetaStatusBadge status={metaStatus.status} /> : null}
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={metaStatus?.status !== "CONNECTED" || isSyncing}
                onClick={() => void handleSync()}
                type="button"
              >
                <Sparkles className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Sincronizando..." : "Sincronizar Meta Social"}
              </button>
            </>
          )}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Resultados" },
            { label: "Social Media" },
          ]}
          description="Selecione a conta social do cliente para abrir um dashboard dedicado com posts, reels, filtros por período e desempenho mensal."
          title="Social Media"
        />

        <section className="panel-card rounded-[2rem] border p-5 md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 flex-1">
              <AppInput
                className="py-0"
                leadingIcon={<Search className="h-4 w-4" />}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Buscar conta por página, perfil do Instagram, categoria ou permissão"
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
                  Não foi possível carregar as contas sociais
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
          <>
            <section className="panel-card relative overflow-hidden rounded-[2.2rem] border px-5 py-6 md:px-6 md:py-7">
              <div className="pointer-events-none absolute inset-y-0 right-0 w-[30rem] max-w-full bg-[radial-gradient(circle_at_top_right,rgba(34,98,240,0.16),transparent_58%)]" />

              <div className="relative z-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="panel-card-muted rounded-[1.5rem] border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                        Contas sociais
                      </p>
                      <p className="mt-3 text-2xl font-black tracking-tight text-on-surface">
                        {formatNumber(accounts.length)}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/16 bg-primary/10 text-primary">
                      <UsersRound className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="panel-card-muted rounded-[1.5rem] border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                        Instagram conectado
                      </p>
                      <p className="mt-3 text-2xl font-black tracking-tight text-on-surface">
                        {formatNumber(instagramConnectedCount)}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-fuchsia-500/16 bg-fuchsia-500/10 text-fuchsia-500">
                      <Camera className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="panel-card-muted rounded-[1.5rem] border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                        Seguidores
                      </p>
                      <p className="mt-3 text-2xl font-black tracking-tight text-on-surface">
                        {formatNumber(totalFollowers)}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/16 bg-emerald-500/10 text-emerald-500">
                      <UsersRound className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="panel-card-muted rounded-[1.5rem] border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                        Mídias conhecidas
                      </p>
                      <p className="mt-3 text-2xl font-black tracking-tight text-on-surface">
                        {formatNumber(totalMedia)}
                      </p>
                      <p className="mt-2 text-xs text-on-surface-variant">
                        Última sync: {formatDateTime(lastSyncResult?.syncedAt ?? null)}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-500/16 bg-amber-500/10 text-amber-500">
                      <Image className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <PanelSocialMediaAccountsTable
              isLoading={isLoading}
              items={filteredItems}
              onOpenDashboard={(item) =>
                navigate(`/painel/social-media/${encodeURIComponent(item.pageId)}/dashboard`)
              }
            />
          </>
        ) : null}
      </div>
    </>
  );
}
