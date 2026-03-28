import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useToast } from "../shared/ToastContext";
import {
  fetchPanelMe,
  getPanelApiBaseUrl,
  loginPanelUser,
  logoutPanelSession,
  type PanelUser,
} from "../../services/painel/auth-api";
import {
  clearPanelToken,
  getPanelToken,
  setPanelToken,
} from "../../services/painel/auth-storage";

type PanelAuthContextValue = {
  token: string | null;
  user: PanelUser | null;
  isAuthenticated: boolean;
  isBooting: boolean;
  isAuthenticating: boolean;
  apiBaseUrl: string;
  login: (email: string, password: string) => Promise<void>;
  logout: (options?: { silent?: boolean }) => Promise<void>;
  refreshUser: () => Promise<void>;
};

const PanelAuthContext = createContext<PanelAuthContextValue | null>(null);

export function PanelAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const toast = useToast();
  const [token, setToken] = useState<string | null>(() => getPanelToken());
  const [user, setUser] = useState<PanelUser | null>(null);
  const [isBooting, setIsBooting] = useState(Boolean(getPanelToken()));
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const clearSessionState = () => {
    clearPanelToken();
    setToken(null);
    setUser(null);
  };

  const hydrateSession = async (nextToken: string) => {
    const nextUser = await fetchPanelMe(nextToken);
    setPanelToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
  };

  useEffect(() => {
    const storedToken = getPanelToken();

    if (!storedToken) {
      setIsBooting(false);
      return;
    }

    setIsBooting(true);
    let isMounted = true;

    void (async () => {
      try {
        const nextUser = await fetchPanelMe(storedToken);

        if (!isMounted) {
          return;
        }

        setToken(storedToken);
        setUser(nextUser);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        clearSessionState();

        if (window.location.pathname.startsWith("/painel")) {
          toast.error({
            title: "Sessao invalida",
            description:
              error instanceof Error
                ? error.message
                : "Sua autenticacao nao pode ser restaurada.",
          });
        }
      } finally {
        if (isMounted) {
          setIsBooting(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const login = async (email: string, password: string) => {
    setIsAuthenticating(true);

    try {
      const session = await loginPanelUser(email, password);

      try {
        await hydrateSession(session.token);
      } catch (error) {
        if (!session.user) {
          throw error;
        }

        setPanelToken(session.token);
        setToken(session.token);
        setUser(session.user);
      }
    } catch (error) {
      clearSessionState();

      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async (options?: { silent?: boolean }) => {
    const activeToken = token ?? getPanelToken();

    if (activeToken) {
      try {
        await logoutPanelSession(activeToken);
      } catch {
        // local cleanup is the priority here
      }
    }

    clearSessionState();

    if (!options?.silent) {
      toast.info({
        title: "Sessao encerrada",
        description: "Seu acesso ao painel foi finalizado com seguranca.",
      });
    }
  };

  const refreshUser = async () => {
    const activeToken = token ?? getPanelToken();

    if (!activeToken) {
      clearSessionState();
      return;
    }

    setIsBooting(true);

    try {
      const nextUser = await fetchPanelMe(activeToken);
      setToken(activeToken);
      setUser(nextUser);
    } catch (error) {
      clearSessionState();
      throw error;
    } finally {
      setIsBooting(false);
    }
  };

  return (
    <PanelAuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        isBooting,
        isAuthenticating,
        apiBaseUrl: getPanelApiBaseUrl(),
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </PanelAuthContext.Provider>
  );
}

export function usePanelAuth() {
  const context = useContext(PanelAuthContext);

  if (!context) {
    throw new Error("usePanelAuth must be used within PanelAuthProvider.");
  }

  return context;
}
