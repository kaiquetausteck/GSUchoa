import {
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  LoaderCircle,
  RefreshCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { ConfirmDialog } from "../../../../components/shared/ConfirmDialog";
import {
  getPanelLinkedInStatusBadgeClassName,
  getPanelLinkedInStatusDescription,
  getPanelLinkedInStatusLabel,
  panelLinkedInStatusNeedsReconnect,
} from "../../../../config/painel/linkedin-status";
import { usePanelAuth } from "../../../../context/painel/PanelAuthContext";
import { useToast } from "../../../../context/shared/ToastContext";
import {
  deletePanelLinkedInConnection,
  getPanelLinkedInConnectLink,
  getPanelLinkedInConnectionStatus,
  validatePanelLinkedInConnection,
  type PanelLinkedInConnectionDetailsRecord,
  type PanelLinkedInConnectionStatusRecord,
} from "../../../../services/painel/linkedin-api";

type LinkedInTabProps = {
  callbackConnected: boolean;
  callbackError: string | null;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Não disponível";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Não disponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

function toStatusRecord(
  details: PanelLinkedInConnectionDetailsRecord,
): PanelLinkedInConnectionStatusRecord {
  return {
    canReconnect: details.canReconnect,
    connected: details.connected,
    expiresAt: details.expiresAt,
    lastValidatedAt: details.lastValidatedAt,
    refreshTokenExpiresAt: details.refreshTokenExpiresAt,
    status: details.status,
  };
}

function LinkedInStatusBadge({
  status,
}: {
  status: PanelLinkedInConnectionStatusRecord["status"];
}) {
  const Icon =
    status === "CONNECTED"
      ? CheckCircle2
      : status === "EXPIRED"
        ? Clock3
        : CircleAlert;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${getPanelLinkedInStatusBadgeClassName(
        status,
      )}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {getPanelLinkedInStatusLabel(status)}
    </span>
  );
}

function LinkedInFeedbackBanner({
  kind,
  message,
  title,
}: {
  kind: "error" | "success";
  message: string;
  title: string;
}) {
  return (
    <div
      className={`rounded-[1.5rem] border px-5 py-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)] ${
        kind === "success"
          ? "border-emerald-500/18 bg-emerald-500/8"
          : "border-red-500/16 bg-red-500/8"
      }`}
    >
      <div className="flex items-start gap-3">
        {kind === "success" ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-500" />
        ) : (
          <CircleAlert className="mt-0.5 h-5 w-5 flex-none text-red-500" />
        )}
        <div>
          <p className="text-sm font-semibold text-on-surface">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{message}</p>
        </div>
      </div>
    </div>
  );
}

function LinkedInMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="panel-integration-metric rounded-[1.4rem] border px-5 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-3 text-base font-bold text-on-surface md:text-lg">{value}</p>
    </div>
  );
}

function ActionButton({
  children,
  className,
  disabled,
  onClick,
}: {
  children: ReactNode;
  className: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition-all ${className}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function LinkedInTab({
  callbackConnected,
  callbackError,
}: LinkedInTabProps) {
  const toast = useToast();
  const { token, user } = usePanelAuth();
  const [statusRecord, setStatusRecord] =
    useState<PanelLinkedInConnectionStatusRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const canManageConnection = Boolean(statusRecord?.canReconnect) || user?.role === "admin";
  const hasConnection = Boolean(statusRecord && statusRecord.status !== "NOT_CONNECTED");
  const reconnectLabel =
    statusRecord?.status === "NOT_CONNECTED" ? "Conectar LinkedIn" : "Reconectar";

  const loadLinkedInSnapshot = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const nextStatus = await getPanelLinkedInConnectionStatus(token);
      setStatusRecord(nextStatus);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o status da integração LinkedIn agora.";

      setStatusRecord(null);
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    void loadLinkedInSnapshot();
  }, [loadLinkedInSnapshot, token]);

  const feedbackBanner = useMemo(() => {
    if (callbackError) {
      return (
        <LinkedInFeedbackBanner
          kind="error"
          message={callbackError}
          title="A conexão com o LinkedIn não foi concluída"
        />
      );
    }

    if (callbackConnected) {
      return (
        <LinkedInFeedbackBanner
          kind="success"
          message="A autenticação da conta LinkedIn foi concluída com sucesso."
          title="Conta LinkedIn conectada"
        />
      );
    }

    return null;
  }, [callbackConnected, callbackError]);

  const handleConnect = async () => {
    if (!token || isConnecting) {
      return;
    }

    setIsConnecting(true);

    try {
      const response = await getPanelLinkedInConnectLink(token);
      window.location.assign(response.authorizationUrl);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar a conexão com o LinkedIn.";

      toast.error({
        title: "Falha ao abrir a autorização",
        description: message,
      });
      setIsConnecting(false);
    }
  };

  const handleValidateConnection = async () => {
    if (!token || !hasConnection || isValidating) {
      return;
    }

    setIsValidating(true);

    try {
      const nextDetails = await validatePanelLinkedInConnection(token);
      setStatusRecord(toStatusRecord(nextDetails));
      toast.success({
        title: "Conexão verificada",
        description: "O backend validou a integração do LinkedIn e atualizou o status.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível validar a integração com o LinkedIn agora.";

      toast.error({
        title: "Falha ao validar a conexão",
        description: message,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleDisconnect = async () => {
    if (!token || isDisconnecting) {
      return;
    }

    setIsDisconnecting(true);

    try {
      await deletePanelLinkedInConnection(token);
      setDisconnectDialogOpen(false);
      toast.success({
        title: "LinkedIn desconectado",
        description: "A conexão central do LinkedIn foi removida com sucesso.",
      });
      await loadLinkedInSnapshot();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível desconectar a integração LinkedIn agora.";

      toast.error({
        title: "Falha ao desconectar o LinkedIn",
        description: message,
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="w-full">
        <section className="panel-premium-card overflow-hidden rounded-[2.2rem] border p-8">
          <div className="flex min-h-[18rem] flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.7rem] border border-primary/14 bg-primary/10 text-primary">
              <LoaderCircle className="h-7 w-7 animate-spin" />
            </div>
            <h2 className="mt-6 text-2xl font-black tracking-tight text-on-surface">
              Carregando integração LinkedIn
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-on-surface-variant">
              Estamos consultando o backend para descobrir o estado atual da conexão.
            </p>
          </div>
        </section>
      </section>
    );
  }

  if (loadError || !statusRecord) {
    return (
      <section className="w-full space-y-5">
        {feedbackBanner}

        <section className="panel-premium-card overflow-hidden rounded-[2.2rem] border p-8">
          <div className="flex min-h-[18rem] flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.7rem] border border-red-500/18 bg-red-500/10 text-red-500">
              <CircleAlert className="h-7 w-7" />
            </div>
            <h2 className="mt-6 text-2xl font-black tracking-tight text-on-surface">
              Não foi possível carregar a integração
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-on-surface-variant">
              {loadError || "O backend não retornou um status válido para a integração LinkedIn."}
            </p>
            <button
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-95"
              onClick={() => void loadLinkedInSnapshot()}
              type="button"
            >
              <RefreshCcw className="h-4 w-4" />
              Tentar novamente
            </button>
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="w-full space-y-5">
      {feedbackBanner}

      <section className="panel-integration-shell relative overflow-hidden rounded-[2.4rem] border">
        <div className="panel-integration-shell-glow pointer-events-none absolute inset-0" />

        <div className="relative grid gap-8 px-6 py-7 md:px-8 md:py-8 2xl:px-10 2xl:py-10 xl:grid-cols-[minmax(0,1.7fr)_minmax(22rem,28rem)] xl:items-start 2xl:grid-cols-[minmax(0,1.95fr)_minmax(24rem,30rem)]">
          <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
                  LinkedIn OAuth
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-on-surface">
                  Centro da integração LinkedIn
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant md:text-base">
                  Acompanhe o estado da conexão, valide a saúde da integração e reconecte quando necessário.
                </p>
              </div>

              <LinkedInStatusBadge status={statusRecord.status} />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <LinkedInMetric label="Status atual" value={getPanelLinkedInStatusLabel(statusRecord.status)} />
              <LinkedInMetric label="Última validação" value={formatDateTime(statusRecord.lastValidatedAt)} />
              <LinkedInMetric label="Expiração do token" value={formatDateTime(statusRecord.expiresAt)} />
              <LinkedInMetric label="Expiração do refresh" value={formatDateTime(statusRecord.refreshTokenExpiresAt)} />
            </div>

            {!canManageConnection ? (
              <div className="panel-integration-note mt-6 rounded-[1.5rem] border px-5 py-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-primary" />
                  <p className="text-sm leading-relaxed text-on-surface-variant">
                    Seu perfil pode acompanhar o status, mas apenas administradores podem validar, reconectar ou desconectar a integração.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="panel-integration-side rounded-[2rem] border p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
              Ações
            </p>
            <h3 className="mt-3 text-xl font-bold tracking-tight text-on-surface">
              Controle da conexão
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {hasConnection
                ? "Use as ações abaixo para verificar a saúde da conexão ou renovar a autorização."
                : "A integração ainda não está ativa. Inicie a conexão para liberar o uso operacional do LinkedIn no painel."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {canManageConnection && hasConnection ? (
                <ActionButton
                  className="panel-integration-button-ghost border text-on-surface hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isValidating}
                  onClick={() => void handleValidateConnection()}
                >
                  {isValidating ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-4 w-4" />
                  )}
                  {isValidating ? "Verificando..." : "Verificar conexão"}
                </ActionButton>
              ) : null}

              {canManageConnection ? (
                <ActionButton
                  className="bg-primary text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isConnecting}
                  onClick={() => void handleConnect()}
                >
                  {isConnecting ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                  {isConnecting ? "Redirecionando..." : reconnectLabel}
                </ActionButton>
              ) : null}

              {canManageConnection && hasConnection ? (
                <ActionButton
                  className="panel-integration-button-danger border text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isDisconnecting}
                  onClick={() => setDisconnectDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Desconectar
                </ActionButton>
              ) : null}
            </div>

            <div className="panel-integration-note mt-6 rounded-[1.5rem] border px-4 py-4">
              <p className="text-sm font-semibold text-on-surface">
                {hasConnection ? "Integração ativa" : "Integração não conectada"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                {getPanelLinkedInStatusDescription(statusRecord.status)}
              </p>
            </div>

            {panelLinkedInStatusNeedsReconnect(statusRecord.status) ? (
              <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
                O backend identificou que uma nova autorização pode ser necessária para manter a operação do LinkedIn estável.
              </p>
            ) : null}
          </aside>
        </div>
      </section>

      <ConfirmDialog
        cancelLabel="Manter conectado"
        confirmLabel="Desconectar LinkedIn"
        description="Essa ação remove a conexão central do LinkedIn da agência. Você poderá reconectar depois se necessário."
        isLoading={isDisconnecting}
        onClose={() => {
          if (!isDisconnecting) {
            setDisconnectDialogOpen(false);
          }
        }}
        onConfirm={() => void handleDisconnect()}
        open={disconnectDialogOpen}
        title="Deseja desconectar o LinkedIn?"
      />
    </section>
  );
}
