import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

export type PanelSocialMediaPostPickerOption = {
  id: string;
  meta?: string;
  title: string;
};

type PanelSocialMediaPostPickerProps = {
  emptyMessage?: string;
  label?: string;
  onChange: (ids: string[]) => void;
  options: PanelSocialMediaPostPickerOption[];
  placeholder?: string;
  selectedIds: string[];
};

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function PanelSocialMediaPostPicker({
  emptyMessage = "Nenhum post selecionado. O dashboard vai usar os conteúdos ranqueados.",
  label,
  onChange,
  options,
  placeholder = "Buscar posts para o dashboard",
  selectedIds,
}: PanelSocialMediaPostPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const optionMap = useMemo(
    () => new Map(options.map((item) => [item.id, item])),
    [options],
  );

  const selectedOptions = useMemo(
    () =>
      selectedIds
        .map((item) => optionMap.get(item))
        .filter((item): item is PanelSocialMediaPostPickerOption => Boolean(item)),
    [optionMap, selectedIds],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    return options.filter((item) => {
      if (!normalizedQuery) {
        return true;
      }

      return [item.title, item.meta, item.id]
        .filter(Boolean)
        .some((value) => normalizeText(value ?? "").includes(normalizedQuery));
    });
  }, [options, query]);

  const toggleValue = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
      return;
    }

    onChange([...selectedIds, id]);
  };

  const field = (
    <Popover.Root onOpenChange={setOpen} open={open}>
      <div className="space-y-2">
        <div className="panel-input rounded-[1.4rem] border px-3 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {selectedOptions.map((item) => (
              <span
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-primary/16 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary"
                key={item.id}
                title={item.title}
              >
                <span className="truncate">{item.title}</span>
                <button
                  aria-label={`Remover ${item.title}`}
                  className="inline-flex h-4 w-4 flex-none items-center justify-center rounded-full text-primary/80 transition-colors hover:bg-primary/10 hover:text-primary"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleValue(item.id);
                  }}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            <div className="flex min-w-[14rem] flex-1 items-center gap-2">
              <Search className="h-4 w-4 text-on-surface-variant" />
              <input
                className="min-w-0 flex-1 bg-transparent py-1 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (!open) {
                    setOpen(true);
                  }
                }}
                onFocus={() => setOpen(true)}
                placeholder={selectedOptions.length === 0 ? placeholder : "Adicionar mais posts"}
                value={query}
              />

              <Popover.Trigger asChild>
                <button
                  aria-label="Abrir seletor de posts"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-outline-variant/12 text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
                  type="button"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </Popover.Trigger>
            </div>
          </div>
        </div>

        {selectedOptions.length === 0 ? (
          <p className="text-xs leading-relaxed text-on-surface-variant">{emptyMessage}</p>
        ) : null}

        <Popover.Portal>
          <Popover.Content
            align="start"
            className="z-[180] w-[min(44rem,calc(100vw-2rem))]"
            sideOffset={10}
          >
            <Command className="panel-popover overflow-hidden rounded-[1.5rem] border">
              <Command.Input
                className="w-full border-b border-outline-variant/10 bg-transparent px-4 py-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
                onValueChange={setQuery}
                placeholder="Buscar por título, legenda, origem ou ID"
                value={query}
              />
              <Command.List className="max-h-80 overflow-y-auto p-2">
                {filteredOptions.map((item) => {
                  const active = selectedIds.includes(item.id);

                  return (
                    <Command.Item
                      className="flex cursor-pointer items-start gap-3 rounded-[1rem] px-3 py-3 text-sm text-on-surface outline-none transition-colors hover:bg-surface-container-high data-[selected=true]:bg-surface-container-high"
                      key={item.id}
                      onSelect={() => toggleValue(item.id)}
                      value={`${item.title} ${item.meta ?? ""} ${item.id}`}
                    >
                      <span
                        className={`mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full border ${
                          active
                            ? "border-primary/20 bg-primary text-white"
                            : "border-outline-variant/14 bg-surface text-transparent"
                        }`}
                      >
                        <Check className="h-3 w-3" />
                      </span>

                      <div className="min-w-0">
                        <p className="font-semibold text-on-surface">{item.title}</p>
                        {item.meta ? (
                          <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                            {item.meta}
                          </p>
                        ) : null}
                      </div>
                    </Command.Item>
                  );
                })}

                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-on-surface-variant">
                    Nenhum post encontrado para a busca atual.
                  </div>
                ) : null}
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover.Portal>
      </div>
    </Popover.Root>
  );

  if (!label) {
    return field;
  }

  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold text-on-surface">{label}</span>
      {field}
    </div>
  );
}
