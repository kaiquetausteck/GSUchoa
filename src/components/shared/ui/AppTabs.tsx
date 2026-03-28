import type { ReactNode } from "react";

type AppTabsItem = {
  icon?: ReactNode;
  key: string;
  label: string;
};

type AppTabsProps = {
  activeKey: string;
  items: AppTabsItem[];
  onChange: (key: string) => void;
};

export function AppTabs({
  activeKey,
  items,
  onChange,
}: AppTabsProps) {
  return (
    <div className="panel-card-muted inline-flex flex-wrap items-center gap-1 rounded-2xl border p-1">
      {items.map((item) => {
        const isActive = item.key === activeKey;

        return (
          <button
            className={`inline-flex items-center gap-2 rounded-[1rem] px-4 py-2.5 text-sm font-semibold transition-all ${
              isActive
                ? "bg-primary text-white shadow-[0_10px_24px_rgba(34,98,240,0.22)]"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            key={item.key}
            onClick={() => onChange(item.key)}
            type="button"
          >
            {item.icon ? <span className="flex h-4 w-4 items-center justify-center">{item.icon}</span> : null}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
