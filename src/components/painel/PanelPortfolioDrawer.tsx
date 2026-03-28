import {
  CalendarClock,
  FileText,
  ImagePlus,
  Layers3,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { PanelFormSection } from "../shared/PanelFormSection";
import { ImageCropDialog } from "../shared/ImageCropDialog";
import { PanelDrawer } from "../shared/PanelDrawer";
import { AppInput } from "../shared/ui/AppInput";
import { AppSelect } from "../shared/ui/AppSelect";
import { AppTagsCombobox } from "../shared/ui/AppTagsCombobox";
import { AppTabs } from "../shared/ui/AppTabs";
import { AppTextarea } from "../shared/ui/AppTextarea";

export type PanelPortfolioDrawerMode = "create" | "edit";
export type PanelPortfolioDrawerTab = "main" | "content" | "media" | "meta";
export type PanelPortfolioMediaDraftType = "image" | "video";

export type PanelPortfolioMediaDraft = {
  id: string;
  alt: string;
  caption: string;
  file: File | null;
  poster: string;
  posterFile: File | null;
  sortOrder: number;
  src: string;
  type: PanelPortfolioMediaDraftType;
};

export type PanelPortfolioStoryDraft = {
  id: string;
  sortOrder: number;
  text: string;
  title: string;
};

export type PanelPortfolioDraft = {
  categoriesText: string;
  client: string;
  createdAt: string | null;
  deletedAt: string | null;
  featured: boolean;
  id: string;
  isPublished: boolean;
  media: PanelPortfolioMediaDraft[];
  name: string;
  overview: string;
  problemLabel: string;
  publishedAt: string;
  resultLabel: string;
  scopeText: string;
  sector: string;
  slug: string;
  solutionLabel: string;
  story: PanelPortfolioStoryDraft[];
  thumbnailFile: File | null;
  thumbnailUrl: string | null;
  updatedAt: string | null;
  year: string;
};

type EditablePortfolioField =
  | "categoriesText"
  | "client"
  | "featured"
  | "isPublished"
  | "name"
  | "overview"
  | "problemLabel"
  | "publishedAt"
  | "resultLabel"
  | "scopeText"
  | "sector"
  | "slug"
  | "solutionLabel"
  | "year";

type PanelPortfolioDrawerProps = {
  activeTab: PanelPortfolioDrawerTab;
  categorySuggestions: string[];
  isLoading: boolean;
  isSaving: boolean;
  mode: PanelPortfolioDrawerMode;
  onActiveTabChange: (tab: PanelPortfolioDrawerTab) => void;
  onAddMedia: (type: PanelPortfolioMediaDraftType) => void;
  onAddStory: () => void;
  onChange: (field: EditablePortfolioField, value: string | boolean) => void;
  onClose: () => void;
  onMediaChange: (
    mediaId: string,
    patch: Partial<Omit<PanelPortfolioMediaDraft, "id">>,
  ) => void;
  onRemoveMedia: (mediaId: string) => void;
  onRemoveStory: (storyId: string) => void;
  onSave: () => void;
  onStoryChange: (
    storyId: string,
    patch: Partial<Omit<PanelPortfolioStoryDraft, "id">>,
  ) => void;
  onThumbnailChange: (file: File | null) => void;
  open: boolean;
  portfolio: PanelPortfolioDraft | null;
  scopeSuggestions: string[];
};

function formatDate(value: string | null) {
  if (!value) {
    return "Sem registro";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Sem registro";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(parsedDate);
}

function parseTokenText(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function PanelPortfolioAssetPreview({
  alt,
  emptyLabel,
  file,
  label,
  url,
}: {
  alt: string;
  emptyLabel: string;
  file: File | null;
  label: string;
  url: string;
}) {
  const previewUrl = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }

    return url.trim() || null;
  }, [file, url]);

  useEffect(() => {
    if (!file || !previewUrl) {
      return;
    }

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [file, previewUrl]);

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-on-surface">{label}</span>
      <div className="panel-card-muted h-36 overflow-hidden rounded-[1.25rem] border">
        {previewUrl ? (
          <img
            alt={alt || label}
            className="h-full w-full object-cover"
            src={previewUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm font-medium text-on-surface-variant">
            {emptyLabel}
          </div>
        )}
      </div>
    </div>
  );
}

export function PanelPortfolioDrawer({
  activeTab,
  categorySuggestions,
  isLoading,
  isSaving,
  mode,
  onActiveTabChange,
  onAddMedia,
  onAddStory,
  onChange,
  onClose,
  onMediaChange,
  onRemoveMedia,
  onRemoveStory,
  onSave,
  onStoryChange,
  onThumbnailChange,
  open,
  portfolio,
  scopeSuggestions,
}: PanelPortfolioDrawerProps) {
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);

  const thumbnailPreviewUrl = useMemo(() => {
    if (!portfolio?.thumbnailFile) {
      return portfolio?.thumbnailUrl ?? null;
    }

    return URL.createObjectURL(portfolio.thumbnailFile);
  }, [portfolio?.thumbnailFile, portfolio?.thumbnailUrl]);

  useEffect(() => {
    if (!portfolio?.thumbnailFile || !thumbnailPreviewUrl) {
      return;
    }

    return () => {
      URL.revokeObjectURL(thumbnailPreviewUrl);
    };
  }, [thumbnailPreviewUrl, portfolio?.thumbnailFile]);

  const title = mode === "create" ? "Adicionar portfolio" : portfolio?.name || "Editar portfolio";
  const description =
    mode === "create"
      ? "Monte um novo case administrativo e deixe a estrutura pronta para publicacao."
      : "Atualize informacoes, narrativa, midia e metadados desse portfolio.";

  return (
    <>
      <PanelDrawer
        defaultWidth={1080}
        description={description}
        footer={(
          <div className="flex items-center justify-end gap-3">
            <button
              className="panel-card-muted rounded-2xl border px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading || isSaving || !portfolio}
              onClick={onSave}
              type="button"
            >
              {isSaving
                ? mode === "create"
                  ? "Criando..."
                  : "Salvando..."
                : mode === "create"
                  ? "Criar portfolio"
                  : "Salvar alteracoes"}
            </button>
          </div>
        )}
        onClose={onClose}
        open={open}
        resizable
        title={title}
      >
        {isLoading || !portfolio ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                className="panel-card-muted h-24 animate-pulse rounded-[1.5rem] border"
                key={index}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <AppTabs
              activeKey={activeTab}
              items={[
                {
                  key: "main",
                  label: "Dados principais",
                  icon: <FileText className="h-4 w-4" />,
                },
                {
                  key: "content",
                  label: "Conteudo",
                  icon: <Layers3 className="h-4 w-4" />,
                },
                {
                  key: "media",
                  label: "Midia",
                  icon: <ImagePlus className="h-4 w-4" />,
                },
                {
                  key: "meta",
                  label: "Metadados",
                  icon: <CalendarClock className="h-4 w-4" />,
                },
              ]}
              onChange={(tab) => onActiveTabChange(tab as PanelPortfolioDrawerTab)}
            />

            {activeTab === "main" ? (
              <section className="space-y-6">
                <PanelFormSection
                  description="A thumbnail aparece na listagem interna e nos cards do site."
                  icon={<ImagePlus className="h-4 w-4" />}
                  title="Thumbnail"
                >
                  <div className="mt-5 flex flex-col items-start gap-5">
                    <div className="panel-card-muted h-40 w-full overflow-hidden rounded-[1.75rem] border sm:w-[18rem]">
                      {thumbnailPreviewUrl ? (
                        <img
                          alt={portfolio.name || "Thumbnail do portfolio"}
                          className="h-full w-full object-cover"
                          src={thumbnailPreviewUrl}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-semibold text-on-surface-variant">
                          Sem thumbnail
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm leading-relaxed text-on-surface-variant">
                        Envie uma imagem principal e recorte aqui antes de salvar.
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <button
                          className="panel-card-muted inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                          onClick={() => thumbnailInputRef.current?.click()}
                          type="button"
                        >
                          <Upload className="h-4 w-4" />
                          {portfolio.thumbnailFile || portfolio.thumbnailUrl ? "Trocar thumbnail" : "Enviar thumbnail"}
                        </button>
                        {portfolio.thumbnailFile || portfolio.thumbnailUrl ? (
                          <button
                            className="rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/12"
                            onClick={() => onThumbnailChange(null)}
                            type="button"
                          >
                            Remover thumbnail
                          </button>
                        ) : null}
                      </div>

                      <input
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          if (file) {
                            setPendingCropFile(file);
                          }
                          event.currentTarget.value = "";
                        }}
                        ref={thumbnailInputRef}
                        type="file"
                      />
                    </div>
                  </div>
                </PanelFormSection>

                <PanelFormSection
                  description="Esses dados estruturam o card e a URL administrativa do portfolio. O slug acompanha o titulo automaticamente."
                  icon={<FileText className="h-4 w-4" />}
                  title="Identificacao"
                >
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <AppInput
                      label="Nome"
                      onChange={(event) => onChange("name", event.target.value)}
                      placeholder="Expansao Digital: Brand Alpha"
                      value={portfolio.name}
                    />
                    <AppInput
                      label="Slug"
                      onChange={(event) => onChange("slug", event.target.value)}
                      placeholder="nome-do-case"
                      value={portfolio.slug}
                    />
                    <AppInput
                      label="Cliente"
                      onChange={(event) => onChange("client", event.target.value)}
                      placeholder="Brand Alpha"
                      value={portfolio.client}
                    />
                    <AppInput
                      label="Ano"
                      onChange={(event) => onChange("year", event.target.value)}
                      placeholder="2026"
                      value={portfolio.year}
                    />
                    <div className="md:col-span-2">
                      <AppInput
                        label="Setor"
                        onChange={(event) => onChange("sector", event.target.value)}
                        placeholder="Fintech"
                        value={portfolio.sector}
                      />
                    </div>
                  </div>
                </PanelFormSection>
              </section>
            ) : null}

            {activeTab === "content" ? (
              <section className="space-y-6">
                <PanelFormSection
                  description="Esses campos alimentam a narrativa e os labels curtos do case."
                  icon={<Layers3 className="h-4 w-4" />}
                  title="Narrativa"
                >
                  <div className="mt-5 space-y-4">
                    <AppTextarea
                      label="Overview"
                      onChange={(event) => onChange("overview", event.target.value)}
                      placeholder="Resumo expandido do contexto e da estrategia aplicada no projeto."
                      rows={5}
                      value={portfolio.overview}
                    />
                    <div className="grid gap-4 md:grid-cols-3">
                      <AppInput
                        label="Problema"
                        onChange={(event) => onChange("problemLabel", event.target.value)}
                        placeholder="Conversao baixa"
                        value={portfolio.problemLabel}
                      />
                      <AppInput
                        label="Solucao"
                        onChange={(event) => onChange("solutionLabel", event.target.value)}
                        placeholder="Funil hibrido"
                        value={portfolio.solutionLabel}
                      />
                      <AppInput
                        label="Resultado"
                        onChange={(event) => onChange("resultLabel", event.target.value)}
                        placeholder="+240%"
                        value={portfolio.resultLabel}
                      />
                    </div>
                  </div>
                </PanelFormSection>

                <PanelFormSection
                  description="Use virgulas ou quebras de linha para separar categorias e escopo."
                  icon={<Sparkles className="h-4 w-4" />}
                  title="Classificacao"
                >
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <AppTagsCombobox
                      label="Categorias"
                      onChange={(values) => onChange("categoriesText", values.join(", "))}
                      placeholder="Adicionar categoria"
                      suggestions={categorySuggestions}
                      values={parseTokenText(portfolio.categoriesText)}
                    />
                    <AppTagsCombobox
                      label="Escopo"
                      onChange={(values) => onChange("scopeText", values.join(", "))}
                      placeholder="Adicionar escopo"
                      suggestions={scopeSuggestions}
                      values={parseTokenText(portfolio.scopeText)}
                    />
                  </div>
                </PanelFormSection>

                <PanelFormSection
                  description="Blocos que contam a historia do projeto dentro da pagina interna."
                  icon={<FileText className="h-4 w-4" />}
                  title="Story"
                >
                  <div className="mt-5 space-y-4">
                    {portfolio.story.map((storyItem, index) => (
                      <div
                        className="panel-card-muted rounded-[1.5rem] border p-4"
                        key={storyItem.id}
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-on-surface">
                            Bloco {index + 1}
                          </p>
                          <button
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/10"
                            onClick={() => onRemoveStory(storyItem.id)}
                            type="button"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remover
                          </button>
                        </div>
                        <div className="space-y-4">
                          <AppInput
                            label="Titulo"
                            onChange={(event) => onStoryChange(storyItem.id, { title: event.target.value })}
                            placeholder="Cenario"
                            value={storyItem.title}
                          />
                          <AppTextarea
                            label="Texto"
                            onChange={(event) => onStoryChange(storyItem.id, { text: event.target.value })}
                            placeholder="A marca atraia atencao, mas ainda perdia muita energia entre clique e fechamento."
                            rows={4}
                            value={storyItem.text}
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      className="panel-card-muted inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                      onClick={onAddStory}
                      type="button"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar bloco
                    </button>
                  </div>
                </PanelFormSection>
              </section>
            ) : null}

            {activeTab === "media" ? (
              <section className="space-y-6">
                <PanelFormSection
                  description="Gerencie imagens, videos e posters usados no portfolio."
                  icon={<ImagePlus className="h-4 w-4" />}
                  title="Galeria"
                >
                  <div className="mt-5 space-y-4">
                    {portfolio.media.map((mediaItem, index) => (
                      <div
                        className="panel-card-muted rounded-[1.5rem] border p-4"
                        key={mediaItem.id}
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-on-surface">
                            Midia {index + 1}
                          </p>
                          <button
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/10"
                            onClick={() => onRemoveMedia(mediaItem.id)}
                            type="button"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remover
                          </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {mediaItem.type === "image" ? (
                            <div className="md:col-span-2">
                              <PanelPortfolioAssetPreview
                                alt={mediaItem.alt}
                                emptyLabel="Nenhuma imagem vinculada."
                                file={mediaItem.file}
                                label="Previa da imagem"
                                url={mediaItem.src}
                              />
                            </div>
                          ) : null}

                          <AppSelect
                            label="Tipo"
                            onChange={(event) => onMediaChange(mediaItem.id, {
                              type: event.target.value as PanelPortfolioMediaDraftType,
                            })}
                            value={mediaItem.type}
                          >
                            <option value="image">Imagem</option>
                            <option value="video">Video</option>
                          </AppSelect>
                          <AppInput
                            label="Alt"
                            onChange={(event) => onMediaChange(mediaItem.id, { alt: event.target.value })}
                            placeholder="Tela da Brand Alpha"
                            value={mediaItem.alt}
                          />
                          <div className="md:col-span-2">
                            <AppTextarea
                              label="Legenda"
                              onChange={(event) => onMediaChange(mediaItem.id, { caption: event.target.value })}
                              placeholder="Hero principal do case com foco em autoridade e conversao."
                              rows={3}
                              value={mediaItem.caption}
                            />
                          </div>
                          {mediaItem.src.trim() ? (
                            <AppInput
                              label="URL atual"
                              readOnly
                              value={mediaItem.src}
                            />
                          ) : null}
                          <div className="space-y-2">
                            <span className="text-xs font-semibold text-on-surface">Arquivo da midia</span>
                            <label className="panel-card flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm text-on-surface transition-colors hover:border-primary/30">
                              <span className="truncate">
                                {mediaItem.file ? mediaItem.file.name : "Selecionar arquivo"}
                              </span>
                              <Upload className="h-4 w-4 text-primary" />
                              <input
                                accept={mediaItem.type === "image" ? "image/*" : "video/*"}
                                className="hidden"
                                onChange={(event) => {
                                  const file = event.target.files?.[0] ?? null;
                                  onMediaChange(mediaItem.id, { file });
                                  event.currentTarget.value = "";
                                }}
                                type="file"
                              />
                            </label>
                          </div>

                          {mediaItem.type === "video" ? (
                            <>
                              <div className="md:col-span-2">
                                <PanelPortfolioAssetPreview
                                  alt={mediaItem.alt}
                                  emptyLabel="Nenhum poster vinculado."
                                  file={mediaItem.posterFile}
                                  label="Previa do poster"
                                  url={mediaItem.poster}
                                />
                              </div>
                              {mediaItem.poster.trim() ? (
                                <AppInput
                                  label="Poster atual"
                                  readOnly
                                  value={mediaItem.poster}
                                />
                              ) : null}
                              <div className="space-y-2">
                                <span className="text-xs font-semibold text-on-surface">Arquivo do poster</span>
                                <label className="panel-card flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm text-on-surface transition-colors hover:border-primary/30">
                                  <span className="truncate">
                                    {mediaItem.posterFile ? mediaItem.posterFile.name : "Selecionar poster"}
                                  </span>
                                  <Upload className="h-4 w-4 text-primary" />
                                  <input
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(event) => {
                                      const file = event.target.files?.[0] ?? null;
                                      onMediaChange(mediaItem.id, { posterFile: file });
                                      event.currentTarget.value = "";
                                    }}
                                    type="file"
                                  />
                                </label>
                              </div>
                            </>
                          ) : null}
                        </div>
                      </div>
                    ))}

                    <div className="flex flex-wrap gap-3">
                      <button
                        className="panel-card-muted inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                        onClick={() => onAddMedia("image")}
                        type="button"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar imagem
                      </button>
                      <button
                        className="panel-card-muted inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                        onClick={() => onAddMedia("video")}
                        type="button"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar video
                      </button>
                    </div>
                  </div>
                </PanelFormSection>
              </section>
            ) : null}

            {activeTab === "meta" ? (
              <section className="space-y-6">
                <PanelFormSection
                  description="Controles editoriais e datas de publicacao do portfolio."
                  icon={<CalendarClock className="h-4 w-4" />}
                  title="Publicacao"
                >
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <AppSelect
                      label="Status"
                      onChange={(event) => onChange("isPublished", event.target.value === "published")}
                      value={portfolio.isPublished ? "published" : "draft"}
                    >
                      <option value="draft">Rascunho</option>
                      <option value="published">Publicado</option>
                    </AppSelect>
                    <AppSelect
                      label="Destaque"
                      onChange={(event) => onChange("featured", event.target.value === "featured")}
                      value={portfolio.featured ? "featured" : "regular"}
                    >
                      <option value="regular">Sem destaque</option>
                      <option value="featured">Em destaque</option>
                    </AppSelect>
                    <AppInput
                      label="Publicado em"
                      onChange={(event) => onChange("publishedAt", event.target.value)}
                      type="datetime-local"
                      value={portfolio.publishedAt}
                    />
                  </div>
                </PanelFormSection>

                <PanelFormSection
                  description="Referencias internas retornadas pela API para auditoria e rastreabilidade."
                  icon={<FileText className="h-4 w-4" />}
                  title="Registro"
                >
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="panel-card-muted rounded-[1.5rem] border p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                        Criado em
                      </p>
                      <p className="mt-2 text-sm font-medium text-on-surface">{formatDate(portfolio.createdAt)}</p>
                    </div>
                    <div className="panel-card-muted rounded-[1.5rem] border p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                        Atualizado em
                      </p>
                      <p className="mt-2 text-sm font-medium text-on-surface">{formatDate(portfolio.updatedAt)}</p>
                    </div>
                    <div className="panel-card-muted rounded-[1.5rem] border p-4 md:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                        Removido em
                      </p>
                      <p className="mt-2 text-sm font-medium text-on-surface">{formatDate(portfolio.deletedAt)}</p>
                    </div>
                  </div>
                </PanelFormSection>
              </section>
            ) : null}
          </div>
        )}
      </PanelDrawer>

      <ImageCropDialog
        onClose={() => setPendingCropFile(null)}
        onConfirm={(file) => {
          onThumbnailChange(file);
          setPendingCropFile(null);
        }}
        open={Boolean(pendingCropFile)}
        sourceFile={pendingCropFile}
        title="Recortar thumbnail"
      />
    </>
  );
}
