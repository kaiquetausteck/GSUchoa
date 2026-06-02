import { ArrowRight, ArrowUpRight, BriefcaseBusiness, RefreshCcw, Search, ShieldCheck } from "lucide-react";
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
  listPanelLinkedInAdAccounts,
  type PanelLinkedInAdAccountRecord,
  type PanelLinkedInConnectionStatusRecord,
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

function AccountsTable({
  isLoading,
  items,
  onOpenDashboard,
}: {
  isLoading: boolean;
  items: PanelLinkedInAdAccountRecord[];
  onOpenDashboard: (item: PanelLinkedInAdAccountRecord) => void;
}) {
  if (isLoading) {
    return (
      <div className="panel-card overflow-hidden rounded-[1.75rem] border">
        <div className="space-y-3 p-4 md:p-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="panel-card-muted h-24 animate-pulse rounded-2xl border" key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="panel-card rounded-[1.75rem] border border-dashed px-6 py-12 text-center">
        <p className="text-sm font-semibold text-on-surface">Nenhuma conta LinkedIn Ads encontrada</p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          Assim que a autorização retornar contas de anúncio acessíveis, elas aparecerão aqui para abrir o dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="panel-card overflow-hidden rounded-[1.75rem] border">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="panel-card-muted border-b border-outline-variant/12">
            <tr className="text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
              <th className="px-6 py-4 font-semibold">Conta</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Perfil</th>
              <th className="px-6 py-4 text-right font-semibold">Abrir</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr className="border-b border-outline-variant/10 last:border-b-0" key={item.accountId}>
                <td className="min-w-[24rem] px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/16 bg-primary/8 text-primary">
                      <BriefcaseBusiness className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-on-surface">{item.name}</p>
                      <p className="mt-1 truncate text-xs text-on-surface-variant">{item.accountUrn}</p>
                    </div>
                  </div>
                </td>
                <td className="min-w-[14rem] px-6 py-5">
                  <p className="text-sm font-semibold text-on-surface">{item.status || "Não informado"}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{item.currency || "Moeda não informada"}</p>
                </td>
                <td className="min-w-[14rem] px-6 py-5">
                  <p className="text-sm font-semibold text-on-surface">{item.role || "Acesso autorizado"}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{item.type || "Tipo não informado"}</p>
                </td>
                <td className="px-6 py-5 text-right">
                  <button
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-outline-variant/16 px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
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

export default function PaidMediaLinkedInPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = usePanelAuth();
  const [searchValue, setSearchValue] = useState("");
  const [linkedinStatus, setLinkedinStatus] = useState<PanelLinkedInConnectionStatusRecord | null>(null);
  const [items, setItems] = useState<PanelLinkedInAdAccountRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const nextStatus = await getPanelLinkedInConnectionStatus(token);
      setLinkedinStatus(nextStatus);

      if (nextStatus.status !== "CONNECTED") {
        setItems([]);
        return;
      }

      setItems(await listPanelLinkedInAdAccounts(token));
    } catch (error) {
      setLinkedinStatus(null);
      setItems([]);
      setLoadError(error instanceof Error ? error.message : "Não foi possível carregar as contas LinkedIn Ads agora.");
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
      [item.name, item.accountId, item.currency, item.status, item.role, item.type]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearch)),
    );
  }, [items, searchValue]);

  return (
    <>
      <Seo
        description="Listagem operacional das contas LinkedIn Ads disponíveis para abrir dashboards por conta."
        noindex
        path={location.pathname}
        structuredData={null}
        title="Tráfego pago • LinkedIn"
      />

      <div className="space-y-6">
        <PanelPageHeader
          actions={linkedinStatus ? <LinkedInStatusBadge status={linkedinStatus.status} /> : undefined}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Tráfego pago" },
            { label: "LinkedIn" },
          ]}
          description="Escolha a conta LinkedIn Ads que deseja analisar. O dashboard usa a autorização central do LinkedIn para puxar métricas pagas."
          title="LinkedIn Ads"
        />

        <section className="panel-card rounded-[2rem] border p-5 md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 flex-1">
              <AppInput
                className="py-0"
                leadingIcon={<Search className="h-4 w-4" />}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Buscar conta por nome, identificador, moeda, status ou papel"
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
            <p className="text-sm font-semibold text-on-surface">Não foi possível carregar as contas LinkedIn Ads</p>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{loadError}</p>
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
            description="A integração LinkedIn ainda não está conectada. Assim que a conexão estiver ativa, as contas disponíveis aparecerão aqui automaticamente."
            title="Conecte o LinkedIn para listar as contas"
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
          <AccountsTable
            isLoading={isLoading}
            items={filteredItems}
            onOpenDashboard={(item) =>
              navigate(`/painel/trafego-pago/linkedin/${encodeURIComponent(item.accountId)}/dashboard`)
            }
          />
        ) : null}
      </div>
    </>
  );
}
