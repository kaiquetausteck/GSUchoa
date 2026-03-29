import {
  CalendarClock,
  FileText,
  MessageSquareQuote,
  SlidersHorizontal,
  Sparkles,
  Star,
} from "lucide-react";

import { PanelFormSection } from "../shared/PanelFormSection";
import { PanelDrawer } from "../shared/PanelDrawer";
import { AppInput } from "../shared/ui/AppInput";
import { AppSelect } from "../shared/ui/AppSelect";
import { AppTabs } from "../shared/ui/AppTabs";
import { AppTextarea } from "../shared/ui/AppTextarea";

export type PanelTestimonialsDrawerMode = "create" | "edit";
export type PanelTestimonialsDrawerTab = "main" | "content" | "meta";

export type PanelTestimonialDraft = {
  authorName: string;
  authorRole: string;
  brand: string;
  createdAt: string | null;
  deletedAt: string | null;
  featured: boolean;
  highlightLabel: string;
  highlightValue: string;
  id: string;
  isPublished: boolean;
  message: string;
  publishedAt: string;
  rating: number;
  sortOrder: number;
  updatedAt: string | null;
};

type EditableTestimonialField =
  | "authorName"
  | "authorRole"
  | "brand"
  | "featured"
  | "highlightLabel"
  | "highlightValue"
  | "isPublished"
  | "message"
  | "publishedAt"
  | "rating"
  | "sortOrder";

type PanelTestimonialsDrawerProps = {
  activeTab: PanelTestimonialsDrawerTab;
  isLoading: boolean;
  isSaving: boolean;
  mode: PanelTestimonialsDrawerMode;
  onActiveTabChange: (tab: PanelTestimonialsDrawerTab) => void;
  onChange: (field: EditableTestimonialField, value: string | boolean | number) => void;
  onClose: () => void;
  onSave: () => void;
  open: boolean;
  testimonial: PanelTestimonialDraft | null;
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

function RatingPreview({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 text-primary">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          className={`h-4 w-4 ${index < rating ? "fill-current" : "opacity-25"}`}
          key={index}
        />
      ))}
    </div>
  );
}

export function PanelTestimonialsDrawer({
  activeTab,
  isLoading,
  isSaving,
  mode,
  onActiveTabChange,
  onChange,
  onClose,
  onSave,
  open,
  testimonial,
}: PanelTestimonialsDrawerProps) {
  const title = mode === "create" ? "Adicionar depoimento" : testimonial?.brand || "Editar depoimento";
  const description =
    mode === "create"
      ? "Cadastre um novo depoimento para fortalecer a prova social do site."
      : "Atualize mensagem, destaque e status editorial desse depoimento.";

  return (
    <PanelDrawer
      defaultWidth={860}
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
            disabled={isLoading || isSaving || !testimonial}
            onClick={onSave}
            type="button"
          >
            {isSaving
              ? mode === "create"
                ? "Criando..."
                : "Salvando..."
              : mode === "create"
                ? "Criar depoimento"
                : "Salvar alterações"}
          </button>
        </div>
      )}
      onClose={onClose}
      open={open}
      resizable
      title={title}
    >
      {isLoading || !testimonial ? (
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
                label: "Conteúdo",
                icon: <MessageSquareQuote className="h-4 w-4" />,
              },
              {
                key: "meta",
                label: "Metadados",
                icon: <CalendarClock className="h-4 w-4" />,
              },
            ]}
            onChange={(tab) => onActiveTabChange(tab as PanelTestimonialsDrawerTab)}
          />

          {activeTab === "main" ? (
            <section className="space-y-6">
              <PanelFormSection
                description="Dados de apresentação usados no card e na página interna do depoimento."
                icon={<FileText className="h-4 w-4" />}
                title="Identificação"
              >
                <div className="mt-5 grid gap-4">
                  <AppInput
                    label="Marca"
                    onChange={(event) => onChange("brand", event.target.value)}
                    placeholder="CannabIA"
                    value={testimonial.brand}
                  />
                  <AppInput
                    label="Autor"
                    onChange={(event) => onChange("authorName", event.target.value)}
                    placeholder="Marina Costa"
                    value={testimonial.authorName}
                  />
                  <AppInput
                    label="Cargo"
                    onChange={(event) => onChange("authorRole", event.target.value)}
                    placeholder="Diretora de Marca"
                    value={testimonial.authorRole}
                  />
                </div>
              </PanelFormSection>

              <PanelFormSection
                description="Controle a nota exibida e a ordem editorial desse depoimento."
                icon={<SlidersHorizontal className="h-4 w-4" />}
                title="Classificação"
              >
                <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                  <AppSelect
                    label="Nota"
                    onChange={(event) => onChange("rating", Number(event.target.value))}
                    value={String(testimonial.rating)}
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={String(value)}>
                        {value} estrela{value === 1 ? "" : "s"}
                      </option>
                    ))}
                  </AppSelect>
                  <AppInput
                    label="Ordem"
                    min={0}
                    onChange={(event) => onChange("sortOrder", Number(event.target.value))}
                    type="number"
                    value={String(testimonial.sortOrder)}
                  />
                  <div className="panel-card-muted flex h-12 items-center rounded-2xl border px-4">
                    <RatingPreview rating={testimonial.rating} />
                  </div>
                </div>
              </PanelFormSection>
            </section>
          ) : null}

          {activeTab === "content" ? (
            <section className="space-y-6">
              <PanelFormSection
                description="Mensagem principal exibida no site e na listagem administrativa."
                icon={<MessageSquareQuote className="h-4 w-4" />}
                title="Mensagem"
              >
                <div className="mt-5 space-y-4">
                  <AppTextarea
                    label="Depoimento"
                    onChange={(event) => onChange("message", event.target.value)}
                    placeholder="A GSUCHOA trouxe clareza estratégica para a nossa comunicação..."
                    rows={7}
                    value={testimonial.message}
                  />
                </div>
              </PanelFormSection>

              <PanelFormSection
                description="Use este bloco para destacar um número e um contexto curto no card principal."
                icon={<Sparkles className="h-4 w-4" />}
                title="Destaque"
              >
                <div className="mt-5 grid gap-4">
                  <AppInput
                    label="Valor de destaque"
                    onChange={(event) => onChange("highlightValue", event.target.value)}
                    placeholder="+214%"
                    value={testimonial.highlightValue}
                  />
                  <AppInput
                    label="Label de destaque"
                    onChange={(event) => onChange("highlightLabel", event.target.value)}
                    placeholder="Crescimento em oportunidades qualificadas"
                    value={testimonial.highlightLabel}
                  />
                </div>
              </PanelFormSection>
            </section>
          ) : null}

          {activeTab === "meta" ? (
            <section className="space-y-6">
              <PanelFormSection
                description="Controles editoriais de publicação e destaque."
                icon={<CalendarClock className="h-4 w-4" />}
                title="Publicação"
              >
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <AppSelect
                    label="Status"
                    onChange={(event) => onChange("isPublished", event.target.value === "published")}
                    value={testimonial.isPublished ? "published" : "draft"}
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                  </AppSelect>
                  <AppSelect
                    label="Destaque"
                    onChange={(event) => onChange("featured", event.target.value === "featured")}
                    value={testimonial.featured ? "featured" : "regular"}
                  >
                    <option value="regular">Sem destaque</option>
                    <option value="featured">Em destaque</option>
                  </AppSelect>
                  <AppInput
                    label="Publicado em"
                    onChange={(event) => onChange("publishedAt", event.target.value)}
                    type="datetime-local"
                    value={testimonial.publishedAt}
                  />
                </div>
              </PanelFormSection>

              <PanelFormSection
                description="Referências retornadas pela API para auditoria interna."
                icon={<FileText className="h-4 w-4" />}
                title="Registro"
              >
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="panel-card-muted rounded-[1.5rem] border p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                      Criado em
                    </p>
                    <p className="mt-2 text-sm font-medium text-on-surface">{formatDate(testimonial.createdAt)}</p>
                  </div>
                  <div className="panel-card-muted rounded-[1.5rem] border p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                      Atualizado em
                    </p>
                    <p className="mt-2 text-sm font-medium text-on-surface">{formatDate(testimonial.updatedAt)}</p>
                  </div>
                  <div className="panel-card-muted rounded-[1.5rem] border p-4 md:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                      Removido em
                    </p>
                    <p className="mt-2 text-sm font-medium text-on-surface">{formatDate(testimonial.deletedAt)}</p>
                  </div>
                </div>
              </PanelFormSection>
            </section>
          ) : null}
        </div>
      )}
    </PanelDrawer>
  );
}
