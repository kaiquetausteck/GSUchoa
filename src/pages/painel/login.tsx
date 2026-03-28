import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { LogoIconAnimated } from "../../components/shared/LogoIconAnimated";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import { useToast } from "../../context/shared/ToastContext";
import {
  clearPanelLoginDraft,
  getPanelLoginDraft,
  setPanelLoginDraft,
} from "../../services/painel/auth-storage";

type LoginLocationState = {
  from?: string;
};

const PANEL_DEV_DEFAULT_CREDENTIALS = {
  email: "admin@gsuchoa.local",
  password: "mudar123",
};

function shouldPrefillPanelCredentials() {
  if (!import.meta.env.DEV || typeof window === "undefined") {
    return false;
  }

  return ["localhost", "127.0.0.1", "0.0.0.0"].includes(window.location.hostname);
}

function getInitialPanelCredentials() {
  const draft = getPanelLoginDraft();

  if (!shouldPrefillPanelCredentials()) {
    return draft;
  }

  return {
    email: draft.email || PANEL_DEV_DEFAULT_CREDENTIALS.email,
    password: draft.password || PANEL_DEV_DEFAULT_CREDENTIALS.password,
  };
}

export default function LoginPage() {
  const toast = useToast();
  const { isAuthenticated, isAuthenticating, isBooting, login } = usePanelAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as LoginLocationState | null)?.from || "/painel";
  const initialDraft = getInitialPanelCredentials();

  const [email, setEmail] = useState(initialDraft.email);
  const [password, setPassword] = useState(initialDraft.password);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    if (!isBooting && isAuthenticated) {
      navigate("/painel", { replace: true });
    }
  }, [isAuthenticated, isBooting, navigate]);

  useEffect(() => {
    setPanelLoginDraft({
      email,
      password,
    });
  }, [email, password]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      const message = "Preencha e-mail e senha para acessar o painel.";
      toast.error({
        title: "Campos obrigatorios",
        description: message,
      });
      return;
    }

    try {
      await login(normalizedEmail, normalizedPassword);
      clearPanelLoginDraft();
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      const message =
        loginError instanceof Error
          ? loginError.message
          : "Nao foi possivel autenticar no painel.";

      toast.error({
        title: "Falha no login",
        description: message,
      });
    }
  };

  const isReadyToLogin = Boolean(email.trim() && password.trim());

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-on-surface">
      <div className="hero-gradient pointer-events-none absolute inset-0 opacity-70" />
      <div className="absolute left-[-12%] top-[-12%] h-80 w-80 rounded-full bg-primary/12 blur-[140px]" />
      <div className="absolute bottom-[-14%] right-[-8%] h-96 w-96 rounded-full bg-primary/10 blur-[150px]" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-6 py-12 md:px-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-outline-variant/15 bg-surface-container-high">
                <LogoIconAnimated className="logo-icon-theme h-9 w-auto" title="GSUCHOA Icon" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">GSUCHOA Painel</p>
                <p className="text-[10px] uppercase tracking-[0.28em] text-on-surface-variant">
                  Painel administrativo
                </p>
              </div>
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
              Area restrita
            </p>
            <h1 className="mt-5 text-5xl font-black leading-[1.02] tracking-tight text-on-surface">
              Acesse o workspace administrativo da GSUCHOA.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-on-surface-variant">
              Um ambiente privado para operacao, clientes, portfolio e crescimento da marca.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-outline-variant/15 bg-surface-container px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">Acesso seguro</p>
                <p className="text-xs leading-relaxed text-on-surface-variant">
                  Disponivel apenas para usuarios autorizados.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card mx-auto w-full max-w-xl rounded-[2.75rem] border border-outline-variant/15 p-8 shadow-[0_28px_80px_rgba(0,0,0,0.28)] md:p-10">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-outline-variant/15 bg-surface-container-high">
              <LogoIconAnimated className="logo-icon-theme h-8 w-auto" title="GSUCHOA Icon" />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">GSUCHOA Painel</p>
              <p className="text-[10px] uppercase tracking-[0.28em] text-on-surface-variant">
                Area restrita
              </p>
            </div>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
            Painel administrativo
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-on-surface md:text-4xl">
            Entrar
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
            Entre com suas credenciais corporativas para continuar.
          </p>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                className="ml-1 text-[10px] font-bold uppercase tracking-[0.24em] text-primary"
                htmlFor="panel-email"
              >
                E-mail
              </label>
              <div className="flex items-center rounded-2xl border border-outline-variant/20 bg-surface-container-high px-4">
                <Mail className="h-4 w-4 text-on-surface-variant" />
                <input
                  className="w-full bg-transparent px-4 py-4 text-on-surface outline-none placeholder:text-on-surface-variant/60"
                  id="panel-email"
                  onChange={(event) => {
                    setEmail(event.target.value);
                  }}
                  placeholder="voce@empresa.com"
                  type="email"
                  value={email}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="ml-1 text-[10px] font-bold uppercase tracking-[0.24em] text-primary"
                htmlFor="panel-password"
              >
                Senha
              </label>
              <div className="flex items-center rounded-2xl border border-outline-variant/20 bg-surface-container-high px-4">
                <Lock className="h-4 w-4 text-on-surface-variant" />
                <input
                  className="w-full bg-transparent px-4 py-4 text-on-surface outline-none placeholder:text-on-surface-variant/60"
                  id="panel-password"
                  onChange={(event) => {
                    setPassword(event.target.value);
                  }}
                  placeholder="Sua senha de acesso"
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-on-surface-variant transition-colors hover:text-primary"
                  onClick={() => setIsPasswordVisible((current) => !current)}
                  type="button"
                >
                  {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isReadyToLogin || isAuthenticating}
              type="submit"
            >
              {isAuthenticating ? "Entrando..." : "Acessar painel"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
