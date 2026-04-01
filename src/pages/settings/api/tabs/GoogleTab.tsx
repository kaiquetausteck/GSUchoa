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
  getPanelGoogleStatusBadgeClassName,
  getPanelGoogleStatusDescription,
  getPanelGoogleStatusLabel,
  panelGoogleStatusNeedsReconnect,
} from "../../../../config/painel/google-status";
import { usePanelAuth } from "../../../../context/painel/PanelAuthContext";
import { useToast } from "../../../../context/shared/ToastContext";
import {
  deletePanelGoogleConnection,
  getPanelGoogleConnectLink,
  getPanelGoogleConnectionStatus,
  validatePanelGoogleConnection,
  type PanelGoogleConnectionDetailsRecord,
  type PanelGoogleConnectionStatusRecord,
} from "../../../../services/painel/google-api";

type GoogleTabProps = {
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

function toStatusRecord(details: PanelGoogleConnectionDetailsRecord): PanelGoogleConnectionStatusRecord {
  return {
    canReconnect: details.canReconnect,
    connected: details.connected,
    expiresAt: details.expiresAt,
    lastValidatedAt: details.lastValidatedAt,
    status: details.status,
  };
}

function GoogleStatusBadge({
  status,
}: {
  status: PanelGoogleConnectionStatusRecord["status"];
}) {
  const Icon =
    status === "CONNECTED"
      ? CheckCircle2
      : status === "EXPIRED"
        ? Clock3
        : CircleAlert;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${getPanelGoogleStatusBadgeClassName(
        status,
      )}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {getPanelGoogleStatusLabel(status)}
    </span>
  );
}

function GoogleFeedbackBanner({
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

function GoogleMetric({
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

export function GoogleTab({
  callbackConnected,
  callbackError,
}: GoogleTabProps) {
  const toast = useToast();
  const { token, user } = usePanelAuth();
  const [statusRecord, setStatusRecord] = useState<PanelGoogleConnectionStatusRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const canManageConnection = Boolean(statusRecord?.canReconnect) || user?.role === "admin";
  const hasConnection = Boolean(statusRecord && statusRecord.status !== "NOT_CONNECTED");
  const reconnectLabel = statusRecord?.status === "NOT_CONNECTED" ? "Conectar Google" : "Reconectar";

  const loadGoogleSnapshot = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const nextStatus = await getPanelGoogleConnectionStatus(token);
      setStatusRecord(nextStatus);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o status da integração Google agora.";

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

    void loadGoogleSnapshot();
  }, [loadGoogleSnapshot, token]);

  const feedbackBanner = useMemo(() => {
    if (callbackError) {
      return (
        <GoogleFeedbackBanner
          kind="error"
          message={callbackError}
          title="A conexão com o Google não foi concluída"
        />
      );
    }

    if (callbackConnected) {
      return (
        <GoogleFeedbackBanner
          kind="success"
          message="A autenticação da conta Google foi concluída com sucesso."
          title="Conta Google conectada"
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
      const response = await getPanelGoogleConnectLink(token);
      window.location.assign(response.authorizationUrl);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar a conexão com o Google.";

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
      const nextDetails = await validatePanelGoogleConnection(token);
      setStatusRecord(toStatusRecord(nextDetails));
      toast.success({
        title: "Conexão verificada",
        description: "O backend validou a integração do Google e atualizou o status.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível validar a integração com o Google agora.";

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
      await deletePanelGoogleConnection(token);
      setDisconnectDialogOpen(false);
      toast.success({
        title: "Google desconectado",
        description: "A conexão central do Google foi removida com sucesso.",
      });
      await loadGoogleSnapshot();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível desconectar a integração Google agora.";

      toast.error({
        title: "Falha ao desconectar o Google",
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
              Carregando integração Google
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
              {loadError || "O backend não retornou um status válido para a integração Google."}
            </p>
            <button
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-95"
              onClick={() => void loadGoogleSnapshot()}
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
                  Google OAuth
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-on-surface">
                  Centro da integração Google
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant md:text-base">
                  Acompanhe o estado da conexão, valide a saúde da integração e reconecte quando necessário.
                </p>
              </div>

              <GoogleStatusBadge status={statusRecord.status} />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <GoogleMetric label="Status atual" value={getPanelGoogleStatusLabel(statusRecord.status)} />
              <GoogleMetric label="Última validação" value={formatDateTime(statusRecord.lastValidatedAt)} />
              <GoogleMetric label="Expiração do token" value={formatDateTime(statusRecord.expiresAt)} />
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
                : "A integração ainda não está ativa. Inicie a conexão para liberar o uso operacional do Google no painel."}
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
                {getPanelGoogleStatusDescription(statusRecord.status)}
              </p>
            </div>

            {panelGoogleStatusNeedsReconnect(statusRecord.status) ? (
              <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
                O backend identificou que uma nova autorização pode ser necessária para manter a operação do Google estável.
              </p>
            ) : null}
          </aside>
        </div>
      </section>

      <ConfirmDialog
        cancelLabel="Manter conectado"
        confirmLabel="Desconectar Google"
        description="Essa ação remove a conexão central do Google da agência. Você poderá reconectar depois se necessário."
        isLoading={isDisconnecting}
        onClose={() => {
          if (!isDisconnecting) {
            setDisconnectDialogOpen(false);
          }
        }}
        onConfirm={() => void handleDisconnect()}
        open={disconnectDialogOpen}
        title="Deseja desconectar o Google?"
      />
    </section>
  );
}
