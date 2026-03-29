import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { PanelPagination } from "../../components/painel/PanelPagination";
import { PanelUsersFiltersBar } from "../../components/painel/PanelUsersFiltersBar";
import {
  PanelUsersDrawer,
  type PanelUserDraft,
  type PanelUsersDrawerMode,
  type PanelUsersDrawerTab,
} from "../../components/painel/PanelUsersDrawer";
import {
  createEmptyPanelUserDraft,
  createPanelUserDraft,
  getPanelUserDrawerTabFromErrorMessage,
} from "../../components/painel/panelUserDraft";
import { PanelUsersTable } from "../../components/painel/PanelUsersTable";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import { useToast } from "../../context/shared/ToastContext";
import { useDebouncedValue } from "../../hooks/painel/useDebouncedValue";
import {
  createPanelUser,
  deletePanelUser,
  getPanelUserById,
  listPanelUsers,
  type PanelUserRecord,
  updatePanelUser,
} from "../../services/painel/users-api";

export default function UsersPage() {
  const toast = useToast();
  const { token } = usePanelAuth();
  const [items, setItems] = useState<PanelUserRecord[]>([]);
  const [drawerActiveTab, setDrawerActiveTab] = useState<PanelUsersDrawerTab>("main");
  const [drawerMode, setDrawerMode] = useState<PanelUsersDrawerMode | null>(null);
  const [selectedUser, setSelectedUser] = useState<PanelUserDraft | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<PanelUserRecord | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebouncedValue(searchInput, 350);

  const loadUsers = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await listPanelUsers(token, {
        page,
        perPage,
        search: debouncedSearch,
        status: statusFilter,
      });

      setItems(response.items);
      setTotalPages(response.totalPages);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os usuários.";

      setItems([]);
      setTotalPages(1);

      toast.error({
        title: "Falha ao carregar usuários",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, perPage, statusFilter, toast, token]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!selectedUserId || !token || drawerMode !== "edit") {
      return;
    }

    let isMounted = true;
    setIsDrawerLoading(true);

    void (async () => {
      try {
        const user = await getPanelUserById(token, selectedUserId);

        if (!isMounted) {
          return;
        }

        setSelectedUser(createPanelUserDraft(user));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        toast.error({
          title: "Não foi possível abrir o usuário",
          description:
            error instanceof Error
              ? error.message
              : "O painel não conseguiu carregar os detalhes desse usuário.",
        });
      } finally {
        if (isMounted) {
          setIsDrawerLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [drawerMode, selectedUserId, toast, token]);

  const handleCloseDrawer = useCallback(() => {
    setDrawerActiveTab("main");
    setDrawerMode(null);
    setSelectedUser(null);
    setSelectedUserId(null);
    setIsDrawerLoading(false);
  }, []);

  const handleOpenDrawer = useCallback((user: PanelUserRecord) => {
    setDrawerActiveTab("main");
    setDrawerMode("edit");
    setSelectedUser(createPanelUserDraft(user));
    setSelectedUserId(user.id);
  }, []);

  const handleCreateUser = useCallback(() => {
    setDrawerActiveTab("main");
    setDrawerMode("create");
    setSelectedUserId(null);
    setIsDrawerLoading(false);
    setSelectedUser(createEmptyPanelUserDraft());
  }, []);

  const handleSaveUser = useCallback(async () => {
    if (!token || !selectedUser || !drawerMode) {
      return;
    }

    if (!selectedUser.name.trim() || !selectedUser.email.trim()) {
      setDrawerActiveTab("main");
      toast.error({
        title: "Campos obrigatórios",
        description: "Nome e e-mail precisam ser preenchidos.",
      });
      return;
    }

    if (drawerMode === "create" || selectedUser.password || selectedUser.passwordConfirmation) {
      if (drawerMode === "create" && !selectedUser.password.trim()) {
        setDrawerActiveTab("password");
        toast.error({
          title: "Senha obrigatória",
          description: "Para criar um novo usuário, defina uma senha inicial.",
        });
        return;
      }

      if (selectedUser.password.length < 6) {
        setDrawerActiveTab("password");
        toast.error({
          title: "Senha inválida",
          description: "A senha precisa ter pelo menos 6 caracteres.",
        });
        return;
      }

      if (selectedUser.password !== selectedUser.passwordConfirmation) {
        setDrawerActiveTab("password");
        toast.error({
          title: "Confirmação incorreta",
          description: "A confirmação da senha precisa corresponder à senha informada.",
        });
        return;
      }
    }

    setIsSaving(true);

    try {
      if (drawerMode === "create") {
        const createdUser = await createPanelUser(token, {
          email: selectedUser.email,
          name: selectedUser.name,
          password: selectedUser.password,
          avatarFile: selectedUser.avatarFile,
        });

        toast.success({
          title: "Usuário criado",
          description: "O novo acesso administrativo foi criado com sucesso.",
        });

        handleCloseDrawer();
        const shouldReloadList =
          page !== 1 || Boolean(debouncedSearch) || statusFilter !== "all";

        if (shouldReloadList) {
          if (page !== 1) {
            setPage(1);
          } else {
            void loadUsers();
          }
        } else {
          setItems((currentItems) => [createdUser, ...currentItems].slice(0, perPage));
        }
        return;
      }

      const updatedUser = await updatePanelUser(token, {
        id: selectedUser.id,
        name: selectedUser.name,
        email: selectedUser.email,
        password: selectedUser.password || undefined,
        avatarFile: selectedUser.avatarFile,
      });

      setSelectedUser(createPanelUserDraft(updatedUser));
      setItems((currentItems) =>
        currentItems.map((item) => (item.id === updatedUser.id ? updatedUser : item)),
      );

      toast.success({
        title: "Usuário atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível concluir esta operação agora.";

      setDrawerActiveTab(getPanelUserDrawerTabFromErrorMessage(message));
      toast.error({
        title: drawerMode === "create" ? "Falha ao criar usuário" : "Falha ao salvar usuário",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }, [debouncedSearch, drawerMode, handleCloseDrawer, loadUsers, page, perPage, selectedUser, statusFilter, toast, token]);

  const handleDeleteUser = useCallback(async () => {
    if (!token || !userToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await deletePanelUser(token, userToDelete.id);

      const deletedUserId = userToDelete.id;
      const willEmptyPage = items.length === 1 && page > 1;

      setItems((currentItems) => currentItems.filter((item) => item.id !== deletedUserId));
      setUserToDelete(null);

      if (selectedUserId === deletedUserId) {
        handleCloseDrawer();
      }

      toast.success({
        title: "Usuário excluído",
        description: "A exclusão foi concluída com sucesso.",
      });

      if (willEmptyPage) {
        setPage((currentPage) => Math.max(1, currentPage - 1));
        return;
      }

      void loadUsers();
    } catch (error) {
      toast.error({
        title: "Falha ao excluir usuário",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir esse usuário agora.",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [handleCloseDrawer, items.length, loadUsers, page, selectedUserId, toast, token, userToDelete]);

  return (
    <>
      <div className="space-y-6">
        <PanelPageHeader
          actions={(
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              onClick={handleCreateUser}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Adicionar usuário
            </button>
          )}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Usuários" },
          ]}
          description="Gerencie acessos administrativos, credenciais e dados de perfil em um fluxo único."
          title="Usuários"
        />

        <PanelUsersFiltersBar
          hasActiveFilters={statusFilter !== "all" || perPage !== 10}
          isLoading={isLoading}
          onPerPageChange={(value) => {
            setPage(1);
            setPerPage(value);
          }}
          onRefresh={() => void loadUsers()}
          onResetFilters={() => {
            setSearchInput("");
            setStatusFilter("all");
            setPerPage(10);
            setPage(1);
          }}
          onSearchChange={(value) => {
            setPage(1);
            setSearchInput(value);
          }}
          onStatusChange={(value) => {
            setPage(1);
            setStatusFilter(value);
          }}
          perPage={perPage}
          searchValue={searchInput}
          statusValue={statusFilter}
        />

        <PanelUsersTable
          footer={(
            <PanelPagination
              currentPage={page}
              onPageChange={setPage}
              totalPages={totalPages}
            />
          )}
          isLoading={isLoading}
          items={items}
          onDelete={setUserToDelete}
          onEdit={handleOpenDrawer}
        />
      </div>

      <PanelUsersDrawer
        activeTab={drawerActiveTab}
        isLoading={isDrawerLoading}
        isSaving={isSaving}
        mode={drawerMode ?? "edit"}
        onActiveTabChange={setDrawerActiveTab}
        onAvatarChange={(file) => {
          setSelectedUser((currentUser) => {
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
          setSelectedUser((currentUser) => {
            if (!currentUser) {
              return currentUser;
            }

            return {
              ...currentUser,
              [field]: value,
            };
          });
        }}
        onClose={handleCloseDrawer}
        onSave={() => void handleSaveUser()}
        open={drawerMode !== null}
        user={selectedUser}
      />

      <ConfirmDialog
        confirmLabel={isDeleting ? "Excluindo..." : "Excluir usuário"}
        description={
          userToDelete
            ? `Essa ação remove o acesso administrativo de ${userToDelete.name}.`
            : ""
        }
        isLoading={isDeleting}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => void handleDeleteUser()}
        open={Boolean(userToDelete)}
        title="Confirmar exclusão"
      />
    </>
  );
}
