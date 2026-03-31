import { ArrowRight, RefreshCcw, Search, Wallet } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { PanelPaidMediaMetaAccountsTable } from "../../components/painel/PanelPaidMediaMetaAccountsTable";
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
  listPanelMetaAdAccounts,
  type PanelMetaAdAccountRecord,
  type PanelMetaConnectionStatusRecord,
} from "../../services/painel/meta-api";

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

export default function PaidMediaMetaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = usePanelAuth();
  const [searchValue, setSearchValue] = useState("");
  const [metaStatus, setMetaStatus] = useState<PanelMetaConnectionStatusRecord | null>(null);
  const [items, setItems] = useState<PanelMetaAdAccountRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const nextStatus = await getPanelMetaConnectionStatus(token);
      setMetaStatus(nextStatus);

      if (nextStatus.status !== "CONNECTED") {
        setItems([]);
        return;
      }

      const nextAccounts = await listPanelMetaAdAccounts(token);
      setItems(nextAccounts);
    } catch (error) {
      setMetaStatus(null);
      setItems([]);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as contas Meta agora.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return items;
    }

    return items.filter((item) =>
      [item.name, item.adAccountId, item.currency, item.timezoneName]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearch)),
    );
  }, [items, searchValue]);

  return (
    <>
      <Seo
        description="Listagem operacional das contas Meta disponíveis para abrir dashboards por conta."
        noindex
        path={location.pathname}
        structuredData={null}
        title="Tráfego pago • Meta"
      />

      <div className="space-y-6">
        <PanelPageHeader
          actions={metaStatus ? <MetaStatusBadge status={metaStatus.status} /> : undefined}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Tráfego pago" },
            { label: "Meta" },
          ]}
          description="Escolha a conta de anúncio Meta que deseja analisar. O dashboard abre em uma rota dedicada por conta, com filtros e widgets próprios."
          title="Meta"
        />

        <section className="panel-card rounded-[2rem] border p-5 md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 flex-1">
              <AppInput
                className="py-0"
                leadingIcon={<Search className="h-4 w-4" />}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Buscar conta por nome, identificador, moeda ou fuso"
                value={searchValue}
                wrapperClassName="h-12 rounded-[1.2rem]"
              />
            </div>

            <button
              className="panel-card-muted inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
              onClick={() => void loadAccounts()}
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
                  Não foi possível carregar as contas Meta
                </p>
                <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{loadError}</p>
              </div>
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/18 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                onClick={() => void loadAccounts()}
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
            description="A integração Meta ainda não está conectada. Assim que a conexão estiver ativa, as contas disponíveis aparecerão aqui automaticamente."
            title="Conecte a Meta para listar as contas"
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
          <PanelPaidMediaMetaAccountsTable
            isLoading={isLoading}
            items={filteredItems}
            onOpenDashboard={(item) =>
              navigate(`/painel/trafego-pago/meta/${encodeURIComponent(item.adAccountId)}/dashboard`)
            }
          />
        ) : null}
      </div>
    </>
  );
}
