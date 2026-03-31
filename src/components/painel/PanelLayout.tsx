import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import { useToast } from "../../context/shared/ToastContext";
import { Seo } from "../shared/Seo";
import {
  getPanelUserById,
  updatePanelUser,
} from "../../services/painel/users-api";
import { PanelHeader } from "./PanelHeader";
import { PanelSidebar } from "./PanelSidebar";
import {
  PanelUsersDrawer,
  type PanelUserDraft,
  type PanelUsersDrawerTab,
} from "./PanelUsersDrawer";
import {
  createPanelUserDraft,
  getPanelUserDrawerTabFromErrorMessage,
} from "./panelUserDraft";

const PANEL_PAGE_TITLES: Record<string, string> = {
  "/painel/dashboard": "Dashboard do Painel",
  "/painel/usuarios": "Usuários do Painel",
  "/painel/contatos": "Todos os Contatos do Painel",
  "/painel/contatos/funil": "Funil de Contatos do Painel",
  "/painel/clientes": "Clientes do Painel",
  "/painel/portfolio": "Portfólio do Painel",
  "/painel/depoimentos": "Depoimentos do Painel",
  "/painel/trafego-pago/meta": "Tráfego Pago • Meta",
  "/painel/contas-integracao/meta": "Contas e Integrações • Meta",
};

function getPanelPageTitle(pathname: string) {
  if (
    pathname.startsWith("/painel/trafego-pago/meta/") &&
    pathname.endsWith("/dashboard")
  ) {
    return "Dashboard da Conta • Meta";
  }

  if (pathname.startsWith("/painel/trafego-pago/meta")) {
    return "Tráfego Pago • Meta";
  }

  if (pathname.startsWith("/painel/contas-integracao/")) {
    return "Contas e Integrações";
  }

  return PANEL_PAGE_TITLES[pathname] ?? "Painel Administrativo";
}

export function PanelLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const {
    logout,
    refreshUser,
    token,
    user,
  } = usePanelAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [profileDrawerTab, setProfileDrawerTab] = useState<PanelUsersDrawerTab>("main");
  const [profileDraft, setProfileDraft] = useState<PanelUserDraft | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const panelTitle = getPanelPageTitle(location.pathname);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/painel/login", { replace: true });
  };

  useEffect(() => {
    if (!profileDrawerOpen || !token || !user?.id) {
      return;
    }

    let isMounted = true;
    setIsProfileLoading(true);

    void (async () => {
      try {
        const nextUser = await getPanelUserById(token, user.id);

        if (!isMounted) {
          return;
        }

        setProfileDraft(createPanelUserDraft(nextUser));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        toast.error({
          title: "Não foi possível abrir seus dados",
          description:
            error instanceof Error
              ? error.message
              : "O painel não conseguiu carregar os detalhes do seu perfil.",
        });
        setProfileDrawerOpen(false);
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [profileDrawerOpen, toast, token, user?.id]);

  const handleOpenProfileDrawer = () => {
    if (!user) {
      return;
    }

    setMobileSidebarOpen(false);
    setProfileDrawerTab("main");
    setProfileDraft({
      avatarFile: null,
      avatarUrl: user.avatarUrl,
      createdAt: null,
      email: user.email,
      id: user.id,
      isActive: true,
      name: user.name,
      password: "",
      passwordConfirmation: "",
      updatedAt: null,
    });
    setProfileDrawerOpen(true);
  };

  const handleCloseProfileDrawer = () => {
    setProfileDrawerOpen(false);
    setProfileDrawerTab("main");
    setProfileDraft(null);
    setIsProfileLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!token || !profileDraft) {
      return;
    }

    if (!profileDraft.name.trim() || !profileDraft.email.trim()) {
      setProfileDrawerTab("main");
      toast.error({
        title: "Campos obrigatórios",
        description: "Nome e e-mail precisam ser preenchidos.",
      });
      return;
    }

    if (profileDraft.password || profileDraft.passwordConfirmation) {
      if (profileDraft.password.length < 6) {
        setProfileDrawerTab("password");
        toast.error({
          title: "Senha inválida",
          description: "A senha precisa ter pelo menos 6 caracteres.",
        });
        return;
      }

      if (profileDraft.password !== profileDraft.passwordConfirmation) {
        setProfileDrawerTab("password");
        toast.error({
          title: "Confirmação incorreta",
          description: "A confirmação da senha precisa corresponder à senha informada.",
        });
        return;
      }
    }

    setIsProfileSaving(true);

    try {
      const updatedUser = await updatePanelUser(token, {
        id: profileDraft.id,
        name: profileDraft.name,
        email: profileDraft.email,
        password: profileDraft.password || undefined,
        avatarFile: profileDraft.avatarFile,
      });

      setProfileDraft(createPanelUserDraft(updatedUser));
      await refreshUser();

      toast.success({
        title: "Perfil atualizado",
        description: "Seus dados foram atualizados com sucesso.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar seus dados agora.";

      setProfileDrawerTab(getPanelUserDrawerTabFromErrorMessage(message));
      toast.error({
        title: "Falha ao salvar seus dados",
        description: message,
      });
    } finally {
      setIsProfileSaving(false);
    }
  };

  return (
    <>
      <Seo
        description="Área administrativa da GSUCHOA."
        noindex
        path={location.pathname}
        structuredData={null}
        title={panelTitle}
      />
      <div className="panel-layout-shell h-screen overflow-hidden text-on-surface">
        <div className="hero-gradient panel-layout-glow pointer-events-none fixed inset-0" />
        <div className="relative flex h-full overflow-hidden">
          <PanelSidebar
            collapsed={sidebarCollapsed}
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            onGoToSite={() => navigate("/")}
            onOpenApiSettings={() => navigate("/painel/contas-integracao/meta")}
            onLogout={handleLogout}
            onOpenProfile={handleOpenProfileDrawer}
            user={user}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <PanelHeader
              collapsed={sidebarCollapsed}
              onOpenSidebar={() => setMobileSidebarOpen(true)}
              onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
            />

            <main className="min-h-0 flex-1 overflow-y-auto">
              <div className="w-full px-5 py-6 md:px-8 md:py-7 xl:px-10">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>

      <PanelUsersDrawer
        activeTab={profileDrawerTab}
        isLoading={isProfileLoading}
        isSaving={isProfileSaving}
        mode="edit"
        onActiveTabChange={setProfileDrawerTab}
        onAvatarChange={(file) => {
          setProfileDraft((currentUser) => {
            if (!currentUser) {
              return currentUser;
            }

            return {
              ...currentUser,
              avatarFile: file,
            };
          });
        }}
        onChange={(field, value) => {
          setProfileDraft((currentUser) => {
            if (!currentUser) {
              return currentUser;
            }

            return {
              ...currentUser,
              [field]: value,
            };
          });
        }}
        onClose={handleCloseProfileDrawer}
        onSave={() => void handleSaveProfile()}
        open={profileDrawerOpen}
        user={profileDraft}
      />
    </>
  );
}
