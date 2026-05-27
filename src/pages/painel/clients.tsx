import { Building2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PanelClientsDrawer, type PanelClientAccessResourceDraft, type PanelClientDraft, type PanelClientsDrawerMode, type PanelClientsDrawerTab } from "../../components/painel/PanelClientsDrawer";
import { PanelClientsFiltersBar } from "../../components/painel/PanelClientsFiltersBar";
import { PanelClientsTable } from "../../components/painel/PanelClientsTable";
import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { PanelPagination } from "../../components/painel/PanelPagination";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import { useToast } from "../../context/shared/ToastContext";
import { useDebouncedValue } from "../../hooks/painel/useDebouncedValue";
import {
  createPanelClient,
  deletePanelClient,
  getPanelClientById,
  listPanelClients,
  setPanelClientFeatured,
  setPanelClientPublished,
  type PanelClientDetailRecord,
  type PanelClientSort,
  type PanelClientSummaryRecord,
  updatePanelClient,
} from "../../services/painel/clients-api";
import { listPanelGoogleAdsCustomers } from "../../services/painel/google-api";
import { listPanelLinkedInSocialAccounts } from "../../services/painel/linkedin-api";
import { listPanelMetaAdAccounts } from "../../services/painel/meta-api";
import { listPanelMetaSocialMediaAccounts } from "../../services/painel/social-media-api";
import { listPanelUsers, type PanelUserRecord } from "../../services/painel/users-api";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const local = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function createClientDraft(detail: PanelClientDetailRecord): PanelClientDraft {
  return {
    createdAt: detail.createdAt,
    deletedAt: detail.deletedAt,
    description: detail.description ?? "",
    featured: detail.featured,
    googleEnabled: detail.googleEnabled,
    id: detail.id,
    isPublished: detail.isPublished,
    linkedinEnabled: detail.linkedinEnabled,
    logoFile: null,
    logoUrl: detail.logoUrl,
    metaEnabled: detail.metaEnabled,
    name: detail.name,
    paidMediaEnabled: detail.paidMediaEnabled,
    permissions: detail.permissions.map((permission) => ({
      userId: permission.userId,
      resources: permission.resources.map((resource) => ({
        module: resource.module,
        platform: resource.platform,
        externalId: resource.externalId,
        name: resource.name,
        pictureUrl: resource.pictureUrl,
        metadata: resource.metadata && typeof resource.metadata === "object" && !Array.isArray(resource.metadata)
          ? resource.metadata as Record<string, unknown>
          : null,
      })),
    })),
    resources: detail.resources.map((resource) => ({
      module: resource.module,
      platform: resource.platform,
      externalId: resource.externalId,
      name: resource.name,
      pictureUrl: resource.pictureUrl,
      metadata: resource.metadata && typeof resource.metadata === "object" && !Array.isArray(resource.metadata)
        ? resource.metadata as Record<string, unknown>
        : null,
    })),
    publishedAt: formatDateTimeLocal(detail.publishedAt),
    slug: detail.slug,
    sortOrder: detail.sortOrder,
    socialMediaEnabled: detail.socialMediaEnabled,
    status: detail.status,
    updatedAt: detail.updatedAt,
    website: detail.website ?? "",
  };
}

function createEmptyClientDraft(): PanelClientDraft {
  return {
    createdAt: null,
    deletedAt: null,
    description: "",
    featured: false,
    googleEnabled: false,
    id: "",
    isPublished: false,
    linkedinEnabled: false,
    logoFile: null,
    logoUrl: null,
    metaEnabled: false,
    name: "",
    paidMediaEnabled: false,
    permissions: [],
    resources: [],
    publishedAt: "",
    slug: "",
    sortOrder: 0,
    socialMediaEnabled: false,
    status: "active",
    updatedAt: null,
    website: "",
  };
}

function getDrawerTabFromErrorMessage(message: string): PanelClientsDrawerTab {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("publica") ||
    normalizedMessage.includes("featured") ||
    normalizedMessage.includes("destaque") ||
    normalizedMessage.includes("ordem")
  ) {
    return "meta";
  }

  if (
    normalizedMessage.includes("usuario") ||
    normalizedMessage.includes("usuário") ||
    normalizedMessage.includes("permiss")
  ) {
    return "permissions";
  }

  if (
    normalizedMessage.includes("status") ||
    normalizedMessage.includes("social") ||
    normalizedMessage.includes("trafego") ||
    normalizedMessage.includes("tráfego") ||
    normalizedMessage.includes("meta") ||
    normalizedMessage.includes("google") ||
    normalizedMessage.includes("linkedin")
  ) {
    return "integrations";
  }

  if (
    normalizedMessage.includes("descricao") ||
    normalizedMessage.includes("description")
  ) {
    return "content";
  }

  return "main";
}

export default function ClientsPage() {
  const toast = useToast();
  const { token } = usePanelAuth();

  const [items, setItems] = useState<PanelClientSummaryRecord[]>([]);
  const [availableUsers, setAvailableUsers] = useState<PanelUserRecord[]>([]);
  const [accessResources, setAccessResources] = useState<PanelClientAccessResourceDraft[]>([]);
  const [drawerActiveTab, setDrawerActiveTab] = useState<PanelClientsDrawerTab>("main");
  const [drawerMode, setDrawerMode] = useState<PanelClientsDrawerMode | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<PanelClientDraft | null>(null);
  const [clientToDelete, setClientToDelete] = useState<PanelClientSummaryRecord | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [publishedFilter, setPublishedFilter] = useState<"all" | "published" | "draft">("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "regular">("all");
  const [sort, setSort] = useState<PanelClientSort>("sortOrder-asc");
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isAccessResourcesLoading, setIsAccessResourcesLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebouncedValue(searchInput, 350);

  const loadClients = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await listPanelClients(token, {
        page,
        perPage,
        search: debouncedSearch,
        featured: featuredFilter,
        published: publishedFilter,
        sort,
      });

      setItems(response.items);
      setTotalPages(response.totalPages);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os clientes.";

      setItems([]);
      setTotalPages(1);
      toast.error({
        title: "Falha ao carregar clientes",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, featuredFilter, page, perPage, publishedFilter, sort, toast, token]);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;
    setIsUsersLoading(true);

    void (async () => {
      try {
        const response = await listPanelUsers(token, {
          page: 1,
          perPage: 100,
          status: "active",
        });

        if (isMounted) {
          setAvailableUsers(response.items);
        }
      } catch (error) {
        if (isMounted) {
          setAvailableUsers([]);
          toast.error({
            title: "Funcionários indisponíveis",
            description:
              error instanceof Error
                ? error.message
                : "Não foi possível carregar usuários para permissões.",
          });
        }
      } finally {
        if (isMounted) {
          setIsUsersLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [toast, token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;
    setIsAccessResourcesLoading(true);

    void (async () => {
      const [metaAdsResult, googleResult, metaSocialResult, linkedinResult] = await Promise.allSettled([
        listPanelMetaAdAccounts(token),
        listPanelGoogleAdsCustomers(token),
        listPanelMetaSocialMediaAccounts(token),
        listPanelLinkedInSocialAccounts(token),
      ]);

      if (!isMounted) {
        return;
      }

      const resources: PanelClientAccessResourceDraft[] = [];

      if (metaAdsResult.status === "fulfilled") {
        resources.push(...metaAdsResult.value.map((account) => ({
          module: "paid_media" as const,
          platform: "META" as const,
          externalId: account.adAccountId,
          name: account.name,
          pictureUrl: null,
          metadata: {
            accountStatus: account.accountStatus,
            currency: account.currency,
            timezoneName: account.timezoneName,
          },
        })));
      }

      if (googleResult.status === "fulfilled") {
        resources.push(...googleResult.value.map((account) => ({
          module: "paid_media" as const,
          platform: "GOOGLE" as const,
          externalId: account.customerId,
          name: account.descriptiveName,
          pictureUrl: null,
          metadata: {
            currencyCode: account.currencyCode,
            manager: account.manager,
            status: account.status,
            timeZone: account.timeZone,
          },
        })));
      }

      if (metaSocialResult.status === "fulfilled") {
        resources.push(...metaSocialResult.value.map((account) => ({
          module: "social_media" as const,
          platform: "META" as const,
          externalId: account.id,
          name: account.displayName,
          pictureUrl: account.avatarUrl,
          metadata: {
            pageId: account.pageId,
            pageName: account.pageName,
            instagramAccountId: account.instagramAccountId,
            instagramUsername: account.instagramUsername,
            type: account.type,
          },
        })));
      }

      if (linkedinResult.status === "fulfilled") {
        resources.push(...linkedinResult.value.map((account) => ({
          module: "social_media" as const,
          platform: "LINKEDIN" as const,
          externalId: account.organizationId,
          name: account.displayName,
          pictureUrl: account.avatarUrl,
          metadata: {
            organizationUrn: account.organizationUrn,
            profileUrl: account.profileUrl,
            role: account.role,
            vanityName: account.vanityName,
          },
        })));
      }

      setAccessResources(resources);
      setIsAccessResourcesLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (!selectedClientId || !token || drawerMode !== "edit") {
      return;
    }

    let isMounted = true;
    setIsDrawerLoading(true);

    void (async () => {
      try {
        const detail = await getPanelClientById(token, selectedClientId);

        if (!isMounted) {
          return;
        }

        setSelectedClient(createClientDraft(detail));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        toast.error({
          title: "Não foi possível abrir o cliente",
          description:
            error instanceof Error
              ? error.message
              : "O painel não conseguiu carregar os detalhes deste cliente.",
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
  }, [drawerMode, selectedClientId, toast, token]);

  const handleCloseDrawer = useCallback(() => {
    setDrawerActiveTab("main");
    setDrawerMode(null);
    setSelectedClientId(null);
    setSelectedClient(null);
    setIsDrawerLoading(false);
  }, []);

  const handleOpenDrawer = useCallback((item: PanelClientSummaryRecord) => {
    setDrawerActiveTab("main");
    setDrawerMode("edit");
    setSelectedClientId(item.id);
    setIsDrawerLoading(false);
    setSelectedClient({
      ...createEmptyClientDraft(),
      description: item.description ?? "",
      featured: item.featured,
      googleEnabled: item.googleEnabled,
      id: item.id,
      isPublished: item.isPublished,
      linkedinEnabled: item.linkedinEnabled,
      logoUrl: item.logoUrl,
      metaEnabled: item.metaEnabled,
      name: item.name,
      paidMediaEnabled: item.paidMediaEnabled,
      publishedAt: formatDateTimeLocal(item.publishedAt),
      slug: item.slug,
      sortOrder: item.sortOrder,
      socialMediaEnabled: item.socialMediaEnabled,
      status: item.status,
      website: item.website ?? "",
    });
  }, []);

  const handleCreateClient = useCallback(() => {
    setDrawerActiveTab("main");
    setDrawerMode("create");
    setSelectedClientId(null);
    setIsDrawerLoading(false);
    setSelectedClient(createEmptyClientDraft());
  }, []);

  const handleDraftFieldChange = useCallback((field: keyof PanelClientDraft, value: string | boolean | number) => {
    setSelectedClient((current) => {
      if (!current) {
        return current;
      }

      if (field === "name" && typeof value === "string") {
        const nextName = value;
        const currentAutoSlug = slugify(current.name);
        const shouldSyncSlug = !current.slug.trim() || current.slug === currentAutoSlug;

        return {
          ...current,
          name: nextName,
          slug: shouldSyncSlug ? slugify(nextName) : current.slug,
        };
      }

      const nextValue = field === "slug" && typeof value === "string" ? slugify(value) : value;

      return {
        ...current,
        [field]: nextValue,
      };
    });
  }, []);

  const handlePermissionUserToggle = useCallback((userId: string, enabled: boolean) => {
    setSelectedClient((current) => {
      if (!current) {
        return current;
      }

      const existingPermission = current.permissions.find((permission) => permission.userId === userId);

      if (!enabled) {
        return {
          ...current,
          permissions: current.permissions.filter((permission) => permission.userId !== userId),
        };
      }

      if (existingPermission) {
        return current;
      }

      return {
        ...current,
        permissions: [
          ...current.permissions,
          {
            userId,
            resources: [],
          },
        ],
      };
    });
  }, []);

  const handleIntegrationResourceToggle = useCallback((resource: PanelClientAccessResourceDraft, enabled: boolean) => {
    setSelectedClient((current) => {
      if (!current) {
        return current;
      }

      const isSameResource = (item: PanelClientAccessResourceDraft) =>
        item.module === resource.module &&
        item.platform === resource.platform &&
        item.externalId === resource.externalId;
      const resources = current.resources.filter((item) => !isSameResource(item));

      return {
        ...current,
        resources: enabled ? [...resources, resource] : resources,
        permissions: current.permissions.map((permission) => ({
          ...permission,
          resources: permission.resources.filter((item) => !isSameResource(item)),
        })),
      };
    });
  }, []);

  const handlePermissionResourceToggle = useCallback((
    userId: string,
    resource: PanelClientAccessResourceDraft,
    enabled: boolean,
  ) => {
    setSelectedClient((current) => {
      if (!current) {
        return current;
      }

      const permissions = current.permissions.some((permission) => permission.userId === userId)
        ? current.permissions
        : [...current.permissions, { userId, resources: [] }];

      return {
        ...current,
        permissions: permissions.map((permission) => {
          if (permission.userId !== userId) {
            return permission;
          }

          const resources = permission.resources.filter((item) =>
            !(item.module === resource.module &&
              item.platform === resource.platform &&
              item.externalId === resource.externalId),
          );

          return {
            ...permission,
            resources: enabled ? [...resources, resource] : resources,
          };
        }),
      };
    });
  }, []);

  const handleSaveClient = useCallback(async () => {
    if (!token || !selectedClient || !drawerMode) {
      return;
    }

    if (!selectedClient.name.trim() || !selectedClient.slug.trim()) {
      setDrawerActiveTab("main");
      toast.error({
        title: "Campos obrigatórios",
        description: "Nome e slug precisam ser preenchidos.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const selectedResources = selectedClient.resources;
      const hasResource = (predicate: (resource: PanelClientAccessResourceDraft) => boolean) =>
        selectedResources.some(predicate);
      const isLinkedResource = (resource: PanelClientAccessResourceDraft) =>
        selectedResources.some((item) =>
          item.module === resource.module &&
          item.platform === resource.platform &&
          item.externalId === resource.externalId,
        );
      const input = {
        description: selectedClient.description || null,
        featured: selectedClient.featured,
        googleEnabled: hasResource((resource) => resource.platform === "GOOGLE"),
        isPublished: selectedClient.isPublished,
        linkedinEnabled: hasResource((resource) => resource.platform === "LINKEDIN"),
        logoFile: selectedClient.logoFile,
        metaEnabled: hasResource((resource) => resource.platform === "META"),
        name: selectedClient.name,
        paidMediaEnabled: hasResource((resource) => resource.module === "paid_media"),
        removeLogo: !selectedClient.logoFile && !selectedClient.logoUrl,
        permissions: selectedClient.permissions.map((permission) => ({
          userId: permission.userId,
          canEdit: true,
          canViewSocialMedia: permission.resources.some((resource) => resource.module === "social_media" && isLinkedResource(resource)),
          canViewPaidMedia: permission.resources.some((resource) => resource.module === "paid_media" && isLinkedResource(resource)),
          canViewMeta: permission.resources.some((resource) => resource.platform === "META" && isLinkedResource(resource)),
          canViewGoogle: permission.resources.some((resource) => resource.platform === "GOOGLE" && isLinkedResource(resource)),
          canViewLinkedin: permission.resources.some((resource) => resource.platform === "LINKEDIN" && isLinkedResource(resource)),
          resources: permission.resources.filter(isLinkedResource),
        })),
        publishedAt: selectedClient.publishedAt
          ? new Date(selectedClient.publishedAt).toISOString()
          : null,
        slug: selectedClient.slug,
        sortOrder: selectedClient.sortOrder,
        socialMediaEnabled: hasResource((resource) => resource.module === "social_media"),
        resources: selectedClient.resources,
        status: selectedClient.status,
        website: selectedClient.website || null,
      };

      if (drawerMode === "create") {
        const created = await createPanelClient(token, input);

        toast.success({
          title: "Cliente criado",
          description: "O novo cliente foi registrado com sucesso no painel.",
        });

        handleCloseDrawer();

        const shouldReloadList =
          page !== 1 ||
          Boolean(debouncedSearch) ||
          publishedFilter !== "all" ||
          featuredFilter !== "all" ||
          sort !== "sortOrder-asc";

        if (shouldReloadList) {
          if (page !== 1) {
            setPage(1);
          } else {
            void loadClients();
          }
        } else {
          setItems((currentItems) => [created, ...currentItems].slice(0, perPage));
        }

        return;
      }

      const updated = await updatePanelClient(token, selectedClient.id, input);

      setSelectedClient(createClientDraft(updated));
      setItems((currentItems) =>
        currentItems.map((item) => (item.id === updated.id ? updated : item)),
      );

      toast.success({
        title: "Cliente atualizado",
        description: "As alterações do cliente foram salvas com sucesso.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível concluir esta operação agora.";

      setDrawerActiveTab(getDrawerTabFromErrorMessage(message));
      toast.error({
        title: drawerMode === "create" ? "Falha ao criar cliente" : "Falha ao salvar cliente",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    debouncedSearch,
    drawerMode,
    featuredFilter,
    handleCloseDrawer,
    loadClients,
    page,
    perPage,
    publishedFilter,
    selectedClient,
    sort,
    toast,
    token,
  ]);

  const handleDeleteClient = useCallback(async () => {
    if (!token || !clientToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await deletePanelClient(token, clientToDelete.id);

      const deletedId = clientToDelete.id;
      const willEmptyPage = items.length === 1 && page > 1;

      setItems((currentItems) => currentItems.filter((item) => item.id !== deletedId));
      setClientToDelete(null);

      if (selectedClientId === deletedId) {
        handleCloseDrawer();
      }

      toast.success({
        title: "Cliente excluído",
        description: "O cliente foi removido com sucesso.",
      });

      if (willEmptyPage) {
        setPage((currentPage) => Math.max(1, currentPage - 1));
        return;
      }

      void loadClients();
    } catch (error) {
      toast.error({
        title: "Falha ao excluir cliente",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir este cliente agora.",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [clientToDelete, handleCloseDrawer, items.length, loadClients, page, selectedClientId, toast, token]);

  const handleTogglePublished = useCallback(async (item: PanelClientSummaryRecord) => {
    if (!token) {
      return;
    }

    try {
      const updated = await setPanelClientPublished(token, item.id, !item.isPublished);
      setItems((currentItems) => currentItems.map((currentItem) => (currentItem.id === updated.id ? updated : currentItem)));
      if (selectedClientId === updated.id && drawerMode === "edit") {
        setSelectedClient(createClientDraft(updated));
      }
      toast.success({
        title: updated.isPublished ? "Cliente publicado" : "Cliente movido para rascunho",
        description: `${updated.name} foi atualizado com sucesso.`,
      });
    } catch (error) {
      toast.error({
        title: "Falha ao atualizar publicação",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar este cliente.",
      });
    }
  }, [drawerMode, selectedClientId, toast, token]);

  const handleToggleFeatured = useCallback(async (item: PanelClientSummaryRecord) => {
    if (!token) {
      return;
    }

    try {
      const updated = await setPanelClientFeatured(token, item.id, !item.featured);
      setItems((currentItems) => currentItems.map((currentItem) => (currentItem.id === updated.id ? updated : currentItem)));
      if (selectedClientId === updated.id && drawerMode === "edit") {
        setSelectedClient(createClientDraft(updated));
      }
      toast.success({
        title: updated.featured ? "Cliente em destaque" : "Destaque removido",
        description: `${updated.name} foi atualizado com sucesso.`,
      });
    } catch (error) {
      toast.error({
        title: "Falha ao atualizar destaque",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar este cliente.",
      });
    }
  }, [drawerMode, selectedClientId, toast, token]);

  return (
    <>
      <div className="space-y-6">
        <PanelPageHeader
          actions={(
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              onClick={handleCreateClient}
              type="button"
            >
              <Building2 className="h-4 w-4" />
              Adicionar cliente
            </button>
          )}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Clientes" },
          ]}
          description="Gerencie clientes, serviços ativos, publicação no site e permissões por funcionário."
          title="Clientes"
        />

        <PanelClientsFiltersBar
          featuredValue={featuredFilter}
          hasActiveFilters={
            featuredFilter !== "all" ||
            publishedFilter !== "all" ||
            perPage !== 10 ||
            sort !== "sortOrder-asc"
          }
          isLoading={isLoading}
          onFeaturedChange={(value) => {
            setPage(1);
            setFeaturedFilter(value);
          }}
          onPerPageChange={(value) => {
            setPage(1);
            setPerPage(value);
          }}
          onPublishedChange={(value) => {
            setPage(1);
            setPublishedFilter(value);
          }}
          onRefresh={() => void loadClients()}
          onResetFilters={() => {
            setSearchInput("");
            setPage(1);
            setPerPage(10);
            setPublishedFilter("all");
            setFeaturedFilter("all");
            setSort("sortOrder-asc");
          }}
          onSearchChange={(value) => {
            setPage(1);
            setSearchInput(value);
          }}
          onSortChange={(value) => {
            setPage(1);
            setSort(value);
          }}
          perPage={perPage}
          publishedValue={publishedFilter}
          searchValue={searchInput}
          sortValue={sort}
        />

        <PanelClientsTable
          footer={(
            <PanelPagination
              currentPage={page}
              onPageChange={setPage}
              totalPages={totalPages}
            />
          )}
          isLoading={isLoading}
          items={items}
          onDelete={setClientToDelete}
          onEdit={handleOpenDrawer}
          onToggleFeatured={handleToggleFeatured}
          onTogglePublished={handleTogglePublished}
        />
      </div>

      <PanelClientsDrawer
        accessResources={accessResources}
        activeTab={drawerActiveTab}
        availableUsers={availableUsers}
        client={selectedClient}
        isLoading={isDrawerLoading}
        isSaving={isSaving}
        isUsersLoading={isUsersLoading || isAccessResourcesLoading}
        mode={drawerMode ?? "edit"}
        onActiveTabChange={setDrawerActiveTab}
        onChange={handleDraftFieldChange}
        onClose={handleCloseDrawer}
        onIntegrationResourceToggle={handleIntegrationResourceToggle}
        onLogoChange={(file) => {
          setSelectedClient((current) => {
            if (!current) {
              return current;
            }

            return {
              ...current,
              logoFile: file,
              logoUrl: file ? current.logoUrl : null,
            };
          });
        }}
        onPermissionResourceToggle={handlePermissionResourceToggle}
        onPermissionUserToggle={handlePermissionUserToggle}
        onSave={() => void handleSaveClient()}
        open={drawerMode !== null}
      />

      <ConfirmDialog
        confirmLabel={isDeleting ? "Excluindo..." : "Excluir cliente"}
        description={
          clientToDelete
            ? `Essa ação remove o cliente ${clientToDelete.name} da área administrativa.`
            : ""
        }
        isLoading={isDeleting}
        onClose={() => setClientToDelete(null)}
        onConfirm={() => void handleDeleteClient()}
        open={Boolean(clientToDelete)}
        title="Confirmar exclusão"
      />
    </>
  );
}
