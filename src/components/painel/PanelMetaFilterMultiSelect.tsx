import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { Check, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

export type PanelMetaFilterOption = {
  hint?: string;
  label: string;
  value: string;
};

type PanelMetaFilterMultiSelectProps = {
  disabled?: boolean;
  emptyText?: string;
  label: string;
  loading?: boolean;
  onChange: (values: string[]) => void;
  options: PanelMetaFilterOption[];
  placeholder: string;
  searchPlaceholder?: string;
  values: string[];
};

function buildSelectionLabel(
  options: PanelMetaFilterOption[],
  placeholder: string,
  values: string[],
) {
  if (values.length === 0) {
    return placeholder;
  }

  if (values.length === 1) {
    return options.find((option) => option.value === values[0])?.label ?? "1 selecionado";
  }

  return `${values.length} selecionados`;
}

export function PanelMetaFilterMultiSelect({
  disabled = false,
  emptyText = "Nenhum item encontrado.",
  label,
  loading = false,
  onChange,
  options,
  placeholder,
  searchPlaceholder = "Buscar...",
  values,
}: PanelMetaFilterMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedSet = useMemo(() => new Set(values), [values]);
  const triggerLabel = useMemo(
    () => buildSelectionLabel(options, placeholder, values),
    [options, placeholder, values],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) =>
      [option.label, option.hint]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery)),
    );
  }, [options, query]);

  const toggleValue = (value: string) => {
    if (selectedSet.has(value)) {
      onChange(values.filter((item) => item !== value));
      return;
    }

    onChange([...values, value]);
  };

  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold text-on-surface">{label}</span>

      <Popover.Root onOpenChange={setOpen} open={open}>
        <Popover.Trigger asChild>
          <button
            className="panel-input flex h-12 w-full items-center justify-between gap-3 rounded-2xl border px-4 text-left text-sm text-on-surface transition-colors hover:border-primary/25 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            type="button"
          >
            <span className={`min-w-0 truncate ${values.length === 0 ? "text-on-surface-variant" : ""}`}>
              {triggerLabel}
            </span>
            <ChevronDown className="h-4 w-4 flex-none text-on-surface-variant" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            className="z-[180] w-[min(26rem,calc(100vw-2rem))]"
            sideOffset={10}
          >
            <Command className="panel-popover overflow-hidden rounded-[1.5rem] border">
              <div className="flex items-center gap-2 border-b border-outline-variant/10 px-3 py-2">
                <Command.Input
                  className="w-full bg-transparent px-1 py-2 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
                  onValueChange={setQuery}
                  placeholder={searchPlaceholder}
                  value={query}
                />

                {values.length > 0 ? (
                  <button
                    className="rounded-xl px-2 py-1 text-xs font-semibold text-primary transition-opacity hover:opacity-80"
                    onClick={() => onChange([])}
                    type="button"
                  >
                    Limpar
                  </button>
                ) : null}
              </div>

              <Command.List className="max-h-80 overflow-y-auto p-2">
                {loading ? (
                  <div className="px-3 py-6 text-sm text-on-surface-variant">
                    Carregando opções...
                  </div>
                ) : null}

                {!loading && filteredOptions.length === 0 ? (
                  <div className="px-3 py-6 text-sm text-on-surface-variant">{emptyText}</div>
                ) : null}

                {!loading
                  ? filteredOptions.map((option) => {
                      const selected = selectedSet.has(option.value);

                      return (
                        <Command.Item
                          className="flex cursor-pointer items-start gap-3 rounded-[1rem] px-3 py-3 text-sm text-on-surface outline-none transition-colors hover:bg-surface-container-high data-[selected=true]:bg-surface-container-high"
                          key={option.value}
                          onSelect={() => toggleValue(option.value)}
                          value={`${option.label} ${option.hint ?? ""}`}
                        >
                          <span
                            className={`mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-md border ${
                              selected
                                ? "border-primary/30 bg-primary/12 text-primary"
                                : "border-outline-variant/16 text-transparent"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>

                          <span className="min-w-0">
                            <span className="block font-medium text-on-surface">{option.label}</span>
                            {option.hint ? (
                              <span className="mt-1 block text-xs leading-relaxed text-on-surface-variant">
                                {option.hint}
                              </span>
                            ) : null}
                          </span>
                        </Command.Item>
                      );
                    })
                  : null}
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </label>
  );
}
