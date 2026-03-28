import { FolderPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PanelPageHeader } from "../../components/painel/PanelPageHeader";
import { PanelPagination } from "../../components/painel/PanelPagination";
import { PanelPortfolioDrawer, type PanelPortfolioDraft, type PanelPortfolioDrawerMode, type PanelPortfolioDrawerTab, type PanelPortfolioMediaDraft, type PanelPortfolioMediaDraftType, type PanelPortfolioStoryDraft } from "../../components/painel/PanelPortfolioDrawer";
import { PanelPortfolioFiltersBar } from "../../components/painel/PanelPortfolioFiltersBar";
import { PanelPortfolioTable } from "../../components/painel/PanelPortfolioTable";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { usePanelAuth } from "../../context/painel/PanelAuthContext";
import { useToast } from "../../context/shared/ToastContext";
import { useDebouncedValue } from "../../hooks/painel/useDebouncedValue";
import {
  createPanelPortfolio,
  deletePanelPortfolio,
  getPanelPortfolioById,
  listPanelPortfolio,
  setPanelPortfolioFeatured,
  setPanelPortfolioPublished,
  type PanelPortfolioDetailRecord,
  type PanelPortfolioSort,
  type PanelPortfolioSummaryRecord,
  updatePanelPortfolio,
} from "../../services/painel/portfolio-api";
import {
  listPublicPortfolioCategories,
  listPublicPortfolioScopes,
} from "../../services/site/portfolio-api";

function createDraftId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

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

function parseTextList(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createEmptyMedia(type: PanelPortfolioMediaDraftType = "image"): PanelPortfolioMediaDraft {
  return {
    id: createDraftId("media"),
    alt: "",
    caption: "",
    file: null,
    poster: "",
    posterFile: null,
    sortOrder: 1,
    src: "",
    type,
  };
}

function createEmptyStory(): PanelPortfolioStoryDraft {
  return {
    id: createDraftId("story"),
    sortOrder: 1,
    text: "",
    title: "",
  };
}

function createPortfolioDraft(detail: PanelPortfolioDetailRecord): PanelPortfolioDraft {
  return {
    categoriesText: detail.categories.join(", "),
    client: detail.client,
    createdAt: detail.createdAt,
    deletedAt: detail.deletedAt,
    featured: detail.featured,
    id: detail.id,
    isPublished: detail.isPublished,
    media: detail.media.map((item, index) => ({
      id: createDraftId(`media-${index}`),
      alt: item.alt,
      caption: item.caption ?? "",
      file: null,
      poster: item.poster ?? "",
      posterFile: null,
      sortOrder: item.sortOrder || index + 1,
      src: item.src,
      type: item.type,
    })),
    name: detail.name,
    overview: detail.overview,
    problemLabel: detail.problemLabel,
    publishedAt: formatDateTimeLocal(detail.publishedAt),
    resultLabel: detail.resultLabel,
    scopeText: detail.scope.join(", "),
    sector: detail.sector,
    slug: detail.slug,
    solutionLabel: detail.solutionLabel,
    story: detail.story.map((item, index) => ({
      id: createDraftId(`story-${index}`),
      sortOrder: item.sortOrder || index + 1,
      text: item.text,
      title: item.title,
    })),
    thumbnailFile: null,
    thumbnailUrl: detail.thumbnail,
    updatedAt: detail.updatedAt,
    year: detail.year,
  };
}

function createEmptyPortfolioDraft(): PanelPortfolioDraft {
  return {
    categoriesText: "",
    client: "",
    createdAt: null,
    deletedAt: null,
    featured: false,
    id: "",
    isPublished: false,
    media: [],
    name: "",
    overview: "",
    problemLabel: "",
    publishedAt: "",
    resultLabel: "",
    scopeText: "",
    sector: "",
    slug: "",
    solutionLabel: "",
    story: [createEmptyStory()],
    thumbnailFile: null,
    thumbnailUrl: null,
    updatedAt: null,
    year: String(new Date().getFullYear()),
  };
}

function getDrawerTabFromErrorMessage(message: string): PanelPortfolioDrawerTab {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("midia") ||
    normalizedMessage.includes("media") ||
    normalizedMessage.includes("video") ||
    normalizedMessage.includes("poster") ||
    normalizedMessage.includes("thumbnail")
  ) {
    return "media";
  }

  if (
    normalizedMessage.includes("publica") ||
    normalizedMessage.includes("featured") ||
    normalizedMessage.includes("rascunho") ||
    normalizedMessage.includes("destaque")
  ) {
    return "meta";
  }

  if (
    normalizedMessage.includes("overview") ||
    normalizedMessage.includes("story") ||
    normalizedMessage.includes("problema") ||
    normalizedMessage.includes("solucao") ||
    normalizedMessage.includes("resultado") ||
    normalizedMessage.includes("categoria") ||
    normalizedMessage.includes("escopo")
  ) {
    return "content";
  }

  return "main";
}

export default function PortfolioPage() {
  const toast = useToast();
  const { token } = usePanelAuth();

  const [items, setItems] = useState<PanelPortfolioSummaryRecord[]>([]);
  const [drawerActiveTab, setDrawerActiveTab] = useState<PanelPortfolioDrawerTab>("main");
  const [drawerMode, setDrawerMode] = useState<PanelPortfolioDrawerMode | null>(null);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PanelPortfolioDraft | null>(null);
  const [portfolioToDelete, setPortfolioToDelete] = useState<PanelPortfolioSummaryRecord | null>(null);
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [publishedFilter, setPublishedFilter] = useState<"all" | "published" | "draft">("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "regular">("all");
  const [scopeSuggestions, setScopeSuggestions] = useState<string[]>([]);
  const [sort, setSort] = useState<PanelPortfolioSort>("updatedAt-desc");
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebouncedValue(searchInput, 350);

  const loadPortfolio = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await listPanelPortfolio(token, {
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
          : "Nao foi possivel carregar os portfolios.";

      setItems([]);
      setTotalPages(1);
      toast.error({
        title: "Falha ao carregar portfolios",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, featuredFilter, page, perPage, publishedFilter, sort, toast, token]);

  useEffect(() => {
    void loadPortfolio();
  }, [loadPortfolio]);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const [nextCategories, nextScopes] = await Promise.all([
          listPublicPortfolioCategories(),
          listPublicPortfolioScopes(),
        ]);

        if (!isMounted) {
          return;
        }

        setCategorySuggestions(nextCategories);
        setScopeSuggestions(nextScopes);
      } catch {
        if (!isMounted) {
          return;
        }

        setCategorySuggestions([]);
        setScopeSuggestions([]);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedPortfolioId || !token || drawerMode !== "edit") {
      return;
    }

    let isMounted = true;
    setIsDrawerLoading(true);

    void (async () => {
      try {
        const detail = await getPanelPortfolioById(token, selectedPortfolioId);

        if (!isMounted) {
          return;
        }

        setSelectedPortfolio(createPortfolioDraft(detail));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        toast.error({
          title: "Nao foi possivel abrir o portfolio",
          description:
            error instanceof Error
              ? error.message
              : "O painel nao conseguiu carregar os detalhes desse portfolio.",
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
  }, [drawerMode, selectedPortfolioId, toast, token]);

  const handleCloseDrawer = useCallback(() => {
    setDrawerActiveTab("main");
    setDrawerMode(null);
    setSelectedPortfolioId(null);
    setSelectedPortfolio(null);
    setIsDrawerLoading(false);
  }, []);

  const handleOpenDrawer = useCallback((item: PanelPortfolioSummaryRecord) => {
    setDrawerActiveTab("main");
    setDrawerMode("edit");
    setSelectedPortfolioId(item.id);
    setIsDrawerLoading(false);
    setSelectedPortfolio({
      ...createEmptyPortfolioDraft(),
      client: item.client,
      featured: item.featured,
      id: item.id,
      isPublished: item.isPublished,
      name: item.name,
      publishedAt: formatDateTimeLocal(item.publishedAt),
      sector: item.sector,
      slug: item.slug,
      thumbnailUrl: item.thumbnail,
      year: item.year,
    });
  }, []);

  const handleCreatePortfolio = useCallback(() => {
    setDrawerActiveTab("main");
    setDrawerMode("create");
    setSelectedPortfolioId(null);
    setIsDrawerLoading(false);
    setSelectedPortfolio(createEmptyPortfolioDraft());
  }, []);

  const handleDraftFieldChange = useCallback((field: keyof PanelPortfolioDraft, value: string | boolean) => {
    setSelectedPortfolio((current) => {
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

  const handleMediaChange = useCallback((mediaId: string, patch: Partial<Omit<PanelPortfolioMediaDraft, "id">>) => {
    setSelectedPortfolio((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        media: current.media.map((item) =>
          item.id === mediaId
            ? {
                ...item,
                ...patch,
              }
            : item,
        ),
      };
    });
  }, []);

  const handleStoryChange = useCallback((storyId: string, patch: Partial<Omit<PanelPortfolioStoryDraft, "id">>) => {
    setSelectedPortfolio((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        story: current.story.map((item) =>
          item.id === storyId
            ? {
                ...item,
                ...patch,
              }
            : item,
        ),
      };
    });
  }, []);

  const handleSavePortfolio = useCallback(async () => {
    if (!token || !selectedPortfolio || !drawerMode) {
      return;
    }

    const categories = parseTextList(selectedPortfolio.categoriesText);
    const scope = parseTextList(selectedPortfolio.scopeText);
    const media = selectedPortfolio.media
      .map((item, index) => ({
        ...item,
        alt: item.alt.trim(),
        caption: item.caption.trim(),
        poster: item.poster.trim(),
        src: item.src.trim(),
        sortOrder: index + 1,
      }))
      .filter((item) => item.alt || item.src || item.file);
    const story = selectedPortfolio.story
      .map((item, index) => ({
        ...item,
        text: item.text.trim(),
        title: item.title.trim(),
        sortOrder: index + 1,
      }))
      .filter((item) => item.title || item.text);

    if (
      !selectedPortfolio.name.trim() ||
      !selectedPortfolio.slug.trim() ||
      !selectedPortfolio.client.trim() ||
      !selectedPortfolio.year.trim() ||
      !selectedPortfolio.sector.trim()
    ) {
      setDrawerActiveTab("main");
      toast.error({
        title: "Campos obrigatorios",
        description: "Nome, slug, cliente, ano e setor precisam ser preenchidos.",
      });
      return;
    }

    if (!selectedPortfolio.overview.trim()) {
      setDrawerActiveTab("content");
      toast.error({
        title: "Narrativa incompleta",
        description: "Overview e obrigatorio para estruturar o case.",
      });
      return;
    }

    if (!selectedPortfolio.thumbnailFile && !selectedPortfolio.thumbnailUrl?.trim()) {
      setDrawerActiveTab("main");
      toast.error({
        title: "Thumbnail obrigatoria",
        description: "Envie uma thumbnail para o portfolio antes de salvar.",
      });
      return;
    }

    if (media.length === 0) {
      setDrawerActiveTab("media");
      toast.error({
        title: "Galeria vazia",
        description: "Adicione pelo menos uma imagem ou video ao portfolio.",
      });
      return;
    }

    if (media.some((item) => !item.alt || (!item.file && !item.src))) {
      setDrawerActiveTab("media");
      toast.error({
        title: "Midia incompleta",
        description: "Toda midia precisa ter alt e um arquivo ou URL existente.",
      });
      return;
    }

    if (story.some((item) => !item.title || !item.text)) {
      setDrawerActiveTab("content");
      toast.error({
        title: "Story incompleta",
        description: "Preencha titulo e texto em todos os blocos de historia adicionados.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const input = {
        categories,
        client: selectedPortfolio.client,
        featured: selectedPortfolio.featured,
        isPublished: selectedPortfolio.isPublished,
        media: media.map((item) => ({
          alt: item.alt,
          caption: item.caption,
          file: item.file,
          poster: item.poster,
          posterFile: item.posterFile,
          sortOrder: item.sortOrder,
          src: item.src,
          type: item.type,
        })),
        name: selectedPortfolio.name,
        overview: selectedPortfolio.overview,
        problemLabel: selectedPortfolio.problemLabel,
        publishedAt: selectedPortfolio.publishedAt
          ? new Date(selectedPortfolio.publishedAt).toISOString()
          : null,
        resultLabel: selectedPortfolio.resultLabel,
        scope,
        sector: selectedPortfolio.sector,
        slug: selectedPortfolio.slug,
        solutionLabel: selectedPortfolio.solutionLabel,
        story: story.map((item) => ({
          sortOrder: item.sortOrder,
          text: item.text,
          title: item.title,
        })),
        thumbnail: selectedPortfolio.thumbnailUrl,
        thumbnailFile: selectedPortfolio.thumbnailFile,
        year: selectedPortfolio.year,
      };

      if (drawerMode === "create") {
        const created = await createPanelPortfolio(token, input);

        toast.success({
          title: "Portfolio criado",
          description: "O novo case foi registrado com sucesso no painel.",
        });

        handleCloseDrawer();

        const shouldReloadList =
          page !== 1 ||
          Boolean(debouncedSearch) ||
          publishedFilter !== "all" ||
          featuredFilter !== "all" ||
          sort !== "updatedAt-desc";

        if (shouldReloadList) {
          if (page !== 1) {
            setPage(1);
          } else {
            void loadPortfolio();
          }
        } else {
          setItems((currentItems) => [created, ...currentItems].slice(0, perPage));
        }

        return;
      }

      const updated = await updatePanelPortfolio(token, selectedPortfolio.id, input);

      setSelectedPortfolio(createPortfolioDraft(updated));
      setItems((currentItems) =>
        currentItems.map((item) => (item.id === updated.id ? updated : item)),
      );

      toast.success({
        title: "Portfolio atualizado",
        description: "As alteracoes do case foram salvas com sucesso.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Nao foi possivel concluir essa operacao agora.";

      setDrawerActiveTab(getDrawerTabFromErrorMessage(message));
      toast.error({
        title: drawerMode === "create" ? "Falha ao criar portfolio" : "Falha ao salvar portfolio",
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
    loadPortfolio,
    page,
    perPage,
    publishedFilter,
    selectedPortfolio,
    sort,
    toast,
    token,
  ]);

  const handleDeletePortfolio = useCallback(async () => {
    if (!token || !portfolioToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await deletePanelPortfolio(token, portfolioToDelete.id);

      const deletedId = portfolioToDelete.id;
      const willEmptyPage = items.length === 1 && page > 1;

      setItems((currentItems) => currentItems.filter((item) => item.id !== deletedId));
      setPortfolioToDelete(null);

      if (selectedPortfolioId === deletedId) {
        handleCloseDrawer();
      }

      toast.success({
        title: "Portfolio excluido",
        description: "O case foi removido com sucesso.",
      });

      if (willEmptyPage) {
        setPage((currentPage) => Math.max(1, currentPage - 1));
        return;
      }

      void loadPortfolio();
    } catch (error) {
      toast.error({
        title: "Falha ao excluir portfolio",
        description:
          error instanceof Error
            ? error.message
            : "Nao foi possivel excluir esse portfolio agora.",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [handleCloseDrawer, items.length, loadPortfolio, page, portfolioToDelete, selectedPortfolioId, toast, token]);

  const handleTogglePublished = useCallback(async (item: PanelPortfolioSummaryRecord) => {
    if (!token) {
      return;
    }

    try {
      const updated = await setPanelPortfolioPublished(token, item.id, !item.isPublished);
      setItems((currentItems) => currentItems.map((currentItem) => (currentItem.id === updated.id ? updated : currentItem)));
      if (selectedPortfolioId === updated.id && drawerMode === "edit") {
        setSelectedPortfolio(createPortfolioDraft(updated));
      }
      toast.success({
        title: updated.isPublished ? "Portfolio publicado" : "Portfolio movido para rascunho",
        description: `${updated.name} foi atualizado com sucesso.`,
      });
    } catch (error) {
      toast.error({
        title: "Falha ao atualizar publicacao",
        description:
          error instanceof Error
            ? error.message
            : "Nao foi possivel atualizar esse portfolio.",
      });
    }
  }, [drawerMode, selectedPortfolioId, toast, token]);

  const handleToggleFeatured = useCallback(async (item: PanelPortfolioSummaryRecord) => {
    if (!token) {
      return;
    }

    try {
      const updated = await setPanelPortfolioFeatured(token, item.id, !item.featured);
      setItems((currentItems) => currentItems.map((currentItem) => (currentItem.id === updated.id ? updated : currentItem)));
      if (selectedPortfolioId === updated.id && drawerMode === "edit") {
        setSelectedPortfolio(createPortfolioDraft(updated));
      }
      toast.success({
        title: updated.featured ? "Portfolio em destaque" : "Destaque removido",
        description: `${updated.name} foi atualizado com sucesso.`,
      });
    } catch (error) {
      toast.error({
        title: "Falha ao atualizar destaque",
        description:
          error instanceof Error
            ? error.message
            : "Nao foi possivel atualizar esse portfolio.",
      });
    }
  }, [drawerMode, selectedPortfolioId, toast, token]);

  return (
    <>
      <div className="space-y-6">
        <PanelPageHeader
          actions={(
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              onClick={handleCreatePortfolio}
              type="button"
            >
              <FolderPlus className="h-4 w-4" />
              Adicionar portfolio
            </button>
          )}
          breadcrumbs={[
            { label: "Painel", to: "/painel/dashboard" },
            { label: "Portfolio" },
          ]}
          description="Organize os cases do site com controle editorial, midia e status de publicacao."
          title="Portfolio"
        />

        <PanelPortfolioFiltersBar
          featuredValue={featuredFilter}
          hasActiveFilters={
            featuredFilter !== "all" ||
            publishedFilter !== "all" ||
            perPage !== 10 ||
            sort !== "updatedAt-desc"
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
          onRefresh={() => void loadPortfolio()}
          onResetFilters={() => {
            setSearchInput("");
            setPage(1);
            setPerPage(10);
            setPublishedFilter("all");
            setFeaturedFilter("all");
            setSort("updatedAt-desc");
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

        <PanelPortfolioTable
          footer={(
            <PanelPagination
              currentPage={page}
              onPageChange={setPage}
              totalPages={totalPages}
            />
          )}
          isLoading={isLoading}
          items={items}
          onDelete={setPortfolioToDelete}
          onEdit={handleOpenDrawer}
          onToggleFeatured={handleToggleFeatured}
          onTogglePublished={handleTogglePublished}
        />
      </div>

      <PanelPortfolioDrawer
        activeTab={drawerActiveTab}
        categorySuggestions={categorySuggestions}
        isLoading={isDrawerLoading}
        isSaving={isSaving}
        mode={drawerMode ?? "edit"}
        onActiveTabChange={setDrawerActiveTab}
        onAddMedia={(type) => {
          setSelectedPortfolio((current) => {
            if (!current) {
              return current;
            }

            return {
              ...current,
              media: [
                ...current.media,
                {
                  ...createEmptyMedia(type),
                  sortOrder: current.media.length + 1,
                },
              ],
            };
          });
        }}
        onAddStory={() => {
          setSelectedPortfolio((current) => {
            if (!current) {
              return current;
            }

            return {
              ...current,
              story: [
                ...current.story,
                {
                  ...createEmptyStory(),
                  sortOrder: current.story.length + 1,
                },
              ],
            };
          });
        }}
        onChange={handleDraftFieldChange}
        onClose={handleCloseDrawer}
        onMediaChange={handleMediaChange}
        onRemoveMedia={(mediaId) => {
          setSelectedPortfolio((current) => {
            if (!current) {
              return current;
            }

            return {
              ...current,
              media: current.media.filter((item) => item.id !== mediaId),
            };
          });
        }}
        onRemoveStory={(storyId) => {
          setSelectedPortfolio((current) => {
            if (!current) {
              return current;
            }

            return {
              ...current,
              story: current.story.filter((item) => item.id !== storyId),
            };
          });
        }}
        onSave={() => void handleSavePortfolio()}
        onStoryChange={handleStoryChange}
        onThumbnailChange={(file) => {
          setSelectedPortfolio((current) => {
            if (!current) {
              return current;
            }

            return {
              ...current,
              thumbnailFile: file,
              thumbnailUrl: file ? current.thumbnailUrl : null,
            };
          });
        }}
        open={drawerMode !== null}
        portfolio={selectedPortfolio}
        scopeSuggestions={scopeSuggestions}
      />

      <ConfirmDialog
        confirmLabel={isDeleting ? "Excluindo..." : "Excluir portfolio"}
        description={
          portfolioToDelete
            ? `Essa acao remove o case ${portfolioToDelete.name} da area administrativa.`
            : ""
        }
        isLoading={isDeleting}
        onClose={() => setPortfolioToDelete(null)}
        onConfirm={() => void handleDeletePortfolio()}
        open={Boolean(portfolioToDelete)}
        title="Confirmar exclusao"
      />
    </>
  );
}
