import {
  CalendarClock,
  FileText,
  Globe2,
  ImagePlus,
  LayoutTemplate,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { PanelFormSection } from "../shared/PanelFormSection";
import { ImageCropDialog } from "../shared/ImageCropDialog";
import { PanelDrawer } from "../shared/PanelDrawer";
import { AppInput } from "../shared/ui/AppInput";
import { AppSelect } from "../shared/ui/AppSelect";
import { AppTabs } from "../shared/ui/AppTabs";
import { AppTextarea } from "../shared/ui/AppTextarea";

export type PanelClientsDrawerMode = "create" | "edit";
export type PanelClientsDrawerTab = "main" | "content" | "meta";

export type PanelClientDraft = {
  createdAt: string | null;
  deletedAt: string | null;
  description: string;
  featured: boolean;
  id: string;
  isPublished: boolean;
  logoFile: File | null;
  logoUrl: string | null;
  name: string;
  publishedAt: string;
  slug: string;
  sortOrder: number;
  updatedAt: string | null;
  website: string;
};

type EditableClientField =
  | "description"
  | "featured"
  | "isPublished"
  | "name"
  | "publishedAt"
  | "slug"
  | "sortOrder"
  | "website";

type PanelClientsDrawerProps = {
  activeTab: PanelClientsDrawerTab;
  client: PanelClientDraft | null;
  isLoading: boolean;
  isSaving: boolean;
  mode: PanelClientsDrawerMode;
  onActiveTabChange: (tab: PanelClientsDrawerTab) => void;
  onChange: (field: EditableClientField, value: string | boolean | number) => void;
  onClose: () => void;
  onLogoChange: (file: File | null) => void;
  onSave: () => void;
  open: boolean;
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

export function PanelClientsDrawer({
  activeTab,
  client,
  isLoading,
  isSaving,
  mode,
  onActiveTabChange,
  onChange,
  onClose,
  onLogoChange,
  onSave,
  open,
}: PanelClientsDrawerProps) {
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);

  const logoPreviewUrl = useMemo(() => {
    if (!client?.logoFile) {
      return client?.logoUrl ?? null;
    }

    return URL.createObjectURL(client.logoFile);
  }, [client?.logoFile, client?.logoUrl]);

  useEffect(() => {
    if (!client?.logoFile || !logoPreviewUrl) {
      return;
    }

    return () => {
      URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [client?.logoFile, logoPreviewUrl]);

  const title = mode === "create" ? "Adicionar cliente" : client?.name || "Editar cliente";
  const description =
    mode === "create"
      ? "Cadastre um novo cliente e deixe a prova social pronta para publicacao."
      : "Atualize logo, posicionamento e status editorial desse cliente.";

  return (
    <>
      <PanelDrawer
        defaultWidth={900}
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
              disabled={isLoading || isSaving || !client}
              onClick={onSave}
              type="button"
            >
              {isSaving
                ? mode === "create"
                  ? "Criando..."
                  : "Salvando..."
                : mode === "create"
                  ? "Criar cliente"
                  : "Salvar alteracoes"}
            </button>
          </div>
        )}
        onClose={onClose}
        open={open}
        resizable
        title={title}
      >
        {isLoading || !client ? (
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
                  icon: <LayoutTemplate className="h-4 w-4" />,
                },
                {
                  key: "meta",
                  label: "Metadados",
                  icon: <CalendarClock className="h-4 w-4" />,
                },
              ]}
              onChange={(tab) => onActiveTabChange(tab as PanelClientsDrawerTab)}
            />

            {activeTab === "main" ? (
              <section className="space-y-6">
                <PanelFormSection
                  description="Envie o logo em imagem e recorte antes de salvar."
                  icon={<ImagePlus className="h-4 w-4" />}
                  title="Logo"
                >
                  <div className="mt-5 flex flex-col items-start gap-5">
                    <div className="partner-logo-card flex h-32 w-full items-center justify-center overflow-hidden rounded-[1.75rem] border px-6 py-5 sm:w-[18rem]">
                      {logoPreviewUrl ? (
                        <img
                          alt={client.name || "Logo do cliente"}
                          className="partner-logo-image max-h-16 w-full object-contain"
                          src={logoPreviewUrl}
                        />
                      ) : (
                        <div className="text-sm font-semibold text-on-surface-variant">
                          Sem logo
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm leading-relaxed text-on-surface-variant">
                        O logo sera usado no carrossel, na listagem publica e na pagina do cliente.
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <button
                          className="panel-card-muted inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                          onClick={() => logoInputRef.current?.click()}
                          type="button"
                        >
                          <Upload className="h-4 w-4" />
                          {client.logoFile || client.logoUrl ? "Trocar logo" : "Enviar logo"}
                        </button>
                        {client.logoFile || client.logoUrl ? (
                          <button
                            className="rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/12"
                            onClick={() => onLogoChange(null)}
                            type="button"
                          >
                            Remover logo
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
                        ref={logoInputRef}
                        type="file"
                      />
                    </div>
                  </div>
                </PanelFormSection>

                <PanelFormSection
                  description="Esses dados estruturam o card e a rota publica do cliente."
                  icon={<FileText className="h-4 w-4" />}
                  title="Identificacao"
                >
                  <div className="mt-5 grid gap-4">
                    <AppInput
                      label="Nome"
                      onChange={(event) => onChange("name", event.target.value)}
                      placeholder="Sound Black"
                      value={client.name}
                    />
                    <AppInput
                      label="Slug"
                      onChange={(event) => onChange("slug", event.target.value)}
                      placeholder="sound-black"
                      value={client.slug}
                    />
                    <AppInput
                      label="Website"
                      leadingIcon={<Globe2 className="h-4 w-4" />}
                      onChange={(event) => onChange("website", event.target.value)}
                      placeholder="https://soundblack.com.br"
                      value={client.website}
                    />
                  </div>
                </PanelFormSection>
              </section>
            ) : null}

            {activeTab === "content" ? (
              <section className="space-y-6">
                <PanelFormSection
                  description="Texto usado na pagina publica do cliente e no contexto interno do painel."
                  icon={<LayoutTemplate className="h-4 w-4" />}
                  title="Descricao"
                >
                  <div className="mt-5">
                    <AppTextarea
                      label="Descricao"
                      onChange={(event) => onChange("description", event.target.value)}
                      placeholder="Marca parceira com foco em posicionamento e performance."
                      rows={7}
                      value={client.description}
                    />
                  </div>
                </PanelFormSection>
              </section>
            ) : null}

            {activeTab === "meta" ? (
              <section className="space-y-6">
                <PanelFormSection
                  description="Controles editoriais de exibicao, ordem e destaque."
                  icon={<CalendarClock className="h-4 w-4" />}
                  title="Publicacao"
                >
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <AppSelect
                      label="Status"
                      onChange={(event) => onChange("isPublished", event.target.value === "published")}
                      value={client.isPublished ? "published" : "draft"}
                    >
                      <option value="draft">Rascunho</option>
                      <option value="published">Publicado</option>
                    </AppSelect>
                    <AppSelect
                      label="Destaque"
                      onChange={(event) => onChange("featured", event.target.value === "featured")}
                      value={client.featured ? "featured" : "regular"}
                    >
                      <option value="regular">Sem destaque</option>
                      <option value="featured">Em destaque</option>
                    </AppSelect>
                    <AppInput
                      label="Ordem"
                      min={0}
                      onChange={(event) => onChange("sortOrder", Number(event.target.value))}
                      type="number"
                      value={String(client.sortOrder)}
                    />
                    <AppInput
                      label="Publicado em"
                      onChange={(event) => onChange("publishedAt", event.target.value)}
                      type="datetime-local"
                      value={client.publishedAt}
                    />
                  </div>
                </PanelFormSection>

                <PanelFormSection
                  description="Referencias retornadas pela API para auditoria interna."
                  icon={<FileText className="h-4 w-4" />}
                  title="Registro"
                >
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="panel-card-muted rounded-[1.5rem] border p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                        Criado em
                      </p>
                      <p className="mt-2 text-sm font-medium text-on-surface">{formatDate(client.createdAt)}</p>
                    </div>
                    <div className="panel-card-muted rounded-[1.5rem] border p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                        Atualizado em
                      </p>
                      <p className="mt-2 text-sm font-medium text-on-surface">{formatDate(client.updatedAt)}</p>
                    </div>
                    <div className="panel-card-muted rounded-[1.5rem] border p-4 md:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                        Removido em
                      </p>
                      <p className="mt-2 text-sm font-medium text-on-surface">{formatDate(client.deletedAt)}</p>
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
          onLogoChange(file);
          setPendingCropFile(null);
        }}
        open={Boolean(pendingCropFile)}
        sourceFile={pendingCropFile}
        title="Recortar logo"
      />
    </>
  );
}
