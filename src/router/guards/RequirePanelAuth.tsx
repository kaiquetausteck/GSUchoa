import { Navigate, Outlet, useLocation } from "react-router-dom";

import { usePanelAuth } from "../../context/painel/PanelAuthContext";

export function RequirePanelAuth() {
  const location = useLocation();
  const { isAuthenticated, isBooting } = usePanelAuth();

  if (isBooting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-on-surface">
        <div className="glass-card w-full max-w-md rounded-[2rem] border border-outline-variant/15 p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-primary">
            Painel administrativo
          </p>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-on-surface">
            Verificando sua sessão
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
            Estamos validando seu acesso antes de liberar a área restrita.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
        to="/painel/login"
      />
    );
  }

  return <Outlet />;
}
