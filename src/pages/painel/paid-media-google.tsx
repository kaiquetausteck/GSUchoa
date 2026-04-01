import { ArrowRight, RefreshCcw, Search, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { PanelPaidMediaGoogleCustomersTable } from "../../components/painel/PanelPaidMediaGoogleCustomersTable";
import { Seo } from "../../components/shared/Seo";
import { AppInput } from "../../components/shared/ui/AppInput";
import {
  getPanelGoogleStatusBadgeClassName,
  getPanelGoogleStatusDescription,
  getPanelGoogleStatusLabel,
  panelGoogleStatusNeedsReconnect,
} from "../../config/painel/google-status";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import {
  getPanelGoogleConnectionStatus,
  listPanelGoogleAdsCustomers,
  type PanelGoogleAdsCustomerRecord,
  type PanelGoogleConnectionStatusRecord,
} from "../../services/painel/google-api";

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

function GoogleStatusBadge({
  status,
}: {
  status: PanelGoogleConnectionStatusRecord["status"];
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getPanelGoogleStatusBadgeClassName(
        status,
      )}`}
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      {getPanelGoogleStatusLabel(status)}
    </span>
  );
}

export default function PaidMediaGooglePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = usePanelAuth();
  const [searchValue, setSearchValue] = useState("");
  const [googleStatus, setGoogleStatus] = useState<PanelGoogleConnectionStatusRecord | null>(null);
  const [items, setItems] = useState<PanelGoogleAdsCustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const nextStatus = await getPanelGoogleConnectionStatus(token);
      setGoogleStatus(nextStatus);

      if (nextStatus.status !== "CONNECTED") {
        setItems([]);
        return;
      }

      const nextCustomers = await listPanelGoogleAdsCustomers(token);
      setItems(nextCustomers);
    } catch (error) {
      setGoogleStatus(null);
      setItems([]);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as contas Google Ads agora.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return items;
    }

    return items.filter((item) =>
      [
        item.descriptiveName,
        item.customerId,
        item.currencyCode,
        item.timeZone,
        item.status,
        item.loginCustomerId,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearch)),
    );
  }, [items, searchValue]);

  return (
    <>
      <Seo
        description="Listagem operacional das contas Google Ads disponíveis para abrir dashboards por conta."
        noindex
        path={location.pathname}
        structuredData={null}
        title="Tráfego pago • Google"
      />

      <div className="space-y-6">
        <PanelPageHeader
          actions={googleStatus ? <GoogleStatusBadge status={googleStatus.status} /> : undefined}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Tráfego pago" },
            { label: "Google" },
          ]}
          description="Escolha a conta do Google Ads que deseja analisar. O dashboard abre em uma rota dedicada por customerId, com filtros e widgets próprios."
          title="Google Ads"
        />

        <section className="panel-card rounded-[2rem] border p-5 md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 flex-1">
              <AppInput
                className="py-0"
                leadingIcon={<Search className="h-4 w-4" />}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Buscar conta por nome, customerId, moeda, fuso ou status"
                value={searchValue}
                wrapperClassName="h-12 rounded-[1.2rem]"
              />
            </div>

            <button
              className="panel-card-muted inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
              onClick={() => void loadCustomers()}
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
                  Não foi possível carregar as contas Google Ads
                </p>
                <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{loadError}</p>
              </div>
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/18 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                onClick={() => void loadCustomers()}
                type="button"
              >
                <RefreshCcw className="h-4 w-4" />
                Tentar novamente
              </button>
            </div>
          </section>
        ) : null}

        {googleStatus?.status === "NOT_CONNECTED" ? (
          <StateCard
            action={(
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                onClick={() => navigate("/painel/contas-integracao/google")}
                type="button"
              >
                Ir para Contas e integrações
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            description="A integração Google ainda não está conectada. Assim que a conexão estiver ativa, as contas disponíveis aparecerão aqui automaticamente."
            title="Conecte o Google para listar as contas"
          />
        ) : null}

        {googleStatus && panelGoogleStatusNeedsReconnect(googleStatus.status) ? (
          <StateCard
            action={(
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                onClick={() => navigate("/painel/contas-integracao/google")}
                type="button"
              >
                Revisar integração
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            description={getPanelGoogleStatusDescription(googleStatus.status)}
            title={`Operação Google em atenção: ${getPanelGoogleStatusLabel(googleStatus.status)}`}
          />
        ) : null}

        {googleStatus?.status === "CONNECTED" ? (
          <PanelPaidMediaGoogleCustomersTable
            isLoading={isLoading}
            items={filteredItems}
            onOpenDashboard={(item) =>
              navigate(`/painel/trafego-pago/google/${encodeURIComponent(item.customerId)}/dashboard`)
            }
          />
        ) : null}
      </div>
    </>
  );
}
