import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

type AppTagsComboboxProps = {
  label?: string;
  onChange: (values: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  values: string[];
};

function normalizeToken(value: string) {
  return value.trim();
}

export function AppTagsCombobox({
  label,
  onChange,
  placeholder = "Adicionar item...",
  suggestions = [],
  values,
}: AppTagsComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const normalizedValues = useMemo(
    () => values.map((value) => normalizeToken(value)).filter(Boolean),
    [values],
  );

  const filteredSuggestions = useMemo(() => {
    const queryValue = query.trim().toLowerCase();

    return suggestions
      .map((item) => normalizeToken(item))
      .filter(Boolean)
      .filter((item) => !normalizedValues.some((value) => value.toLowerCase() === item.toLowerCase()))
      .filter((item) => (queryValue ? item.toLowerCase().includes(queryValue) : true));
  }, [normalizedValues, query, suggestions]);

  const commitValue = (value: string) => {
    const normalized = normalizeToken(value);

    if (!normalized) {
      return;
    }

    if (normalizedValues.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
      setQuery("");
      return;
    }

    onChange([...normalizedValues, normalized]);
    setQuery("");
  };

  const removeValue = (valueToRemove: string) => {
    onChange(
      normalizedValues.filter((item) => item.toLowerCase() !== valueToRemove.toLowerCase()),
    );
  };

  const field = (
    <Popover.Root onOpenChange={setOpen} open={open}>
      <div className="space-y-2">
        <div className="panel-input rounded-2xl border px-3 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {normalizedValues.map((value) => (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-primary/16 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary"
                key={value}
              >
                {value}
                <button
                  aria-label={`Remover ${value}`}
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full text-primary/80 transition-colors hover:bg-primary/10 hover:text-primary"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    removeValue(value);
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

            <div className="flex min-w-[12rem] flex-1 items-center gap-2">
              <input
                className="min-w-0 flex-1 bg-transparent py-1 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (!open) {
                    setOpen(true);
                  }
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    commitValue(query);
                  }

                  if (event.key === "Backspace" && !query && normalizedValues.length > 0) {
                    removeValue(normalizedValues[normalizedValues.length - 1]);
                  }
                }}
                placeholder={normalizedValues.length === 0 ? placeholder : "Adicionar mais"}
                value={query}
              />

              <Popover.Trigger asChild>
                <button
                  aria-label="Abrir sugestoes"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-outline-variant/12 text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
                  type="button"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </Popover.Trigger>
            </div>
          </div>
        </div>

        <Popover.Portal>
          <Popover.Content
            align="start"
            className="z-[120] w-[var(--radix-popover-trigger-width)] min-w-[18rem]"
            sideOffset={10}
          >
            <Command className="panel-popover overflow-hidden rounded-[1.5rem] border">
              <Command.Input
                className="w-full border-b border-outline-variant/10 bg-transparent px-4 py-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
                onValueChange={setQuery}
                placeholder="Buscar ou criar..."
                value={query}
              />
              <Command.List className="max-h-64 overflow-y-auto p-2">
                {query.trim() ? (
                  <Command.Item
                    className="flex cursor-pointer items-center gap-3 rounded-[1rem] px-3 py-3 text-sm text-on-surface outline-none transition-colors hover:bg-surface-container-high data-[selected=true]:bg-surface-container-high"
                    onSelect={() => {
                      commitValue(query);
                      setOpen(false);
                    }}
                    value={`__create__${query}`}
                  >
                    <Plus className="h-4 w-4 text-primary" />
                    Criar "{query.trim()}"
                  </Command.Item>
                ) : null}

                {filteredSuggestions.map((suggestion) => (
                  <Command.Item
                    className="flex cursor-pointer items-center gap-3 rounded-[1rem] px-3 py-3 text-sm text-on-surface outline-none transition-colors hover:bg-surface-container-high data-[selected=true]:bg-surface-container-high"
                    key={suggestion}
                    onSelect={() => {
                      commitValue(suggestion);
                      setOpen(false);
                    }}
                    value={suggestion}
                  >
                    <Check className="h-4 w-4 text-primary" />
                    {suggestion}
                  </Command.Item>
                ))}

                {!query.trim() && filteredSuggestions.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-on-surface-variant">
                    Todos os itens sugeridos ja foram adicionados.
                  </div>
                ) : null}

                {query.trim() && filteredSuggestions.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-on-surface-variant">
                    Pressione enter para adicionar um novo item.
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
