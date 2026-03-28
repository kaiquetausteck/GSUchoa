import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import type { PanelNavGroup as PanelNavGroupType } from "../../config/painel/navigation";
import { PanelNavLink } from "./PanelNavLink";

type PanelNavGroupProps = {
  collapsed: boolean;
  group: PanelNavGroupType;
};

export function PanelNavGroup({ collapsed, group }: PanelNavGroupProps) {
  const location = useLocation();
  const hasActiveItem = useMemo(
    () => group.items.some((item) => location.pathname.startsWith(item.to)),
    [group.items, location.pathname],
  );
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (hasActiveItem) {
      setOpen(true);
    }
  }, [hasActiveItem]);

  if (collapsed) {
    return (
      <div className="space-y-2">
        {group.items.map((item) => (
          <PanelNavLink
            collapsed
            icon={item.icon}
            key={item.key}
            label={item.label}
            to={item.to}
          />
        ))}
      </div>
    );
  }

  return (
    <Collapsible.Root onOpenChange={setOpen} open={open}>
      <div className="space-y-2">
        <Collapsible.Trigger asChild>
          <button
            className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.28em] transition-colors ${
              hasActiveItem
                ? "text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            type="button"
          >
            <span className="min-w-0 truncate">{group.label}</span>
            <ChevronDown
              className={`h-4 w-4 flex-none transition-transform duration-200 ${
                open ? "rotate-0" : "-rotate-90"
              }`}
            />
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-[accordion-up_0.2s_ease-out] data-[state=open]:animate-[accordion-down_0.2s_ease-out]">
          <div className="space-y-1 pl-2">
            {group.items.map((item) => (
              <PanelNavLink
                collapsed={false}
                icon={item.icon}
                key={item.key}
                label={item.label}
                nested
                to={item.to}
              />
            ))}
          </div>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  );
}
