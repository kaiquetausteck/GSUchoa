import {
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { LogoIconAnimated } from "../../components/shared/LogoIconAnimated";
import { Seo } from "../../components/shared/Seo";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import { exchangePanelMetaOAuthCode } from "../../services/painel/meta-api";

type MetaCallbackViewState = {
  description: string;
  title: string;
  tone: "error" | "loading" | "success";
};

function buildApiSettingsRedirectPath(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);

  const queryString = searchParams.toString();

  return queryString
    ? `/painel/contas-integracao/meta?${queryString}`
    : "/painel/contas-integracao/meta";
}

function getMetaOAuthErrorMessage(searchParams: URLSearchParams) {
  return (
    searchParams.get("error_description")?.trim() ||
    searchParams.get("error_reason")?.trim() ||
    searchParams.get("error")?.trim() ||
    "A Meta não autorizou a conexão solicitada."
  );
}

export default function MetaCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = usePanelAuth();
  const hasStartedRef = useRef(false);
  const redirectTimeoutRef = useRef<number | null>(null);
  const [viewState, setViewState] = useState<MetaCallbackViewState>({
    tone: "loading",
    title: "Conectando sua conta Meta...",
    description: "Estamos validando o retorno da Meta e concluindo a autorização com segurança.",
  });

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    if (!token) {
      navigate("/painel/login", {
        replace: true,
        state: {
          from: `${location.pathname}${location.search}${location.hash}`,
        },
      });
      return;
    }

    hasStartedRef.current = true;

    const code = searchParams.get("code")?.trim() || "";
    const state = searchParams.get("state")?.trim() || "";
    const hasMetaError = Boolean(searchParams.get("error"));

    const redirectToSettings = (params: Record<string, string>, delay = 1400) => {
      redirectTimeoutRef.current = window.setTimeout(() => {
        navigate(buildApiSettingsRedirectPath(params), { replace: true });
      }, delay);
    };

    if (hasMetaError) {
      const message = getMetaOAuthErrorMessage(searchParams);
      setViewState({
        tone: "error",
        title: "A conexão com a Meta não foi autorizada",
        description: message,
      });
      redirectToSettings({ error: message });
      return;
    }

    if (!code || !state) {
      const message = "O retorno da Meta não trouxe os parâmetros necessários para concluir a conexão.";
      setViewState({
        tone: "error",
        title: "Callback inválido",
        description: message,
      });
      redirectToSettings({ error: message });
      return;
    }

    let isCancelled = false;

    void (async () => {
      try {
        await exchangePanelMetaOAuthCode(token, { code, state });

        if (isCancelled) {
          return;
        }

        setViewState({
          tone: "success",
          title: "Conta Meta conectada",
          description: "A integração foi concluída com sucesso. Você será redirecionado para as configurações de API.",
        });
        redirectToSettings({ connected: "true" }, 900);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível concluir a conexão com a Meta agora.";

        setViewState({
          tone: "error",
          title: "Não foi possível concluir a conexão",
          description: message,
        });
        redirectToSettings({ error: message });
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [location.hash, location.pathname, location.search, navigate, searchParams, token]);

  const Icon = viewState.tone === "success"
    ? CheckCircle2
    : viewState.tone === "error"
      ? CircleAlert
      : LoaderCircle;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-6 py-12 text-on-surface md:px-8">
      <Seo
        description="Callback OAuth da integração com a Meta."
        noindex
        path={`${location.pathname}${location.search}`}
        structuredData={null}
        title="Conexão Meta"
      />

      <div className="hero-gradient pointer-events-none absolute inset-0 opacity-70" />
      <div className="absolute left-[-8%] top-[-12%] h-80 w-80 rounded-full bg-primary/12 blur-[140px]" />
      <div className="absolute bottom-[-18%] right-[-8%] h-96 w-96 rounded-full bg-primary/10 blur-[160px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl items-center justify-center">
        <section className="glass-card w-full rounded-[2.5rem] border border-outline-variant/15 p-8 text-center shadow-[0_28px_80px_rgba(0,0,0,0.18)] md:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-outline-variant/15 bg-surface-container-high">
            <LogoIconAnimated className="logo-icon-theme h-9 w-auto" title="GSUCHOA Icon" />
          </div>

          <div
            className={`mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-2xl ${
              viewState.tone === "success"
                ? "bg-emerald-500/12 text-emerald-500"
                : viewState.tone === "error"
                  ? "bg-red-500/12 text-red-500"
                  : "bg-primary/12 text-primary"
            }`}
          >
            <Icon className={`h-6 w-6 ${viewState.tone === "loading" ? "animate-spin" : ""}`} />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-primary">
            Integração Meta
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-on-surface md:text-4xl">
            {viewState.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-on-surface-variant md:text-base">
            {viewState.description}
          </p>
        </section>
      </div>
    </div>
  );
}
