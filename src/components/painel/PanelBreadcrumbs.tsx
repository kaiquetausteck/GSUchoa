import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export type PanelBreadcrumbItem = {
  label: string;
  to?: string;
};

type PanelBreadcrumbsProps = {
  items: PanelBreadcrumbItem[];
};

export function PanelBreadcrumbs({
  items,
}: PanelBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li className="flex items-center gap-2" key={`${item.label}-${index}`}>
              {item.to && !isLast ? (
                <Link
                  className="transition-colors hover:text-on-surface"
                  to={item.to}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "font-medium text-on-surface" : ""}>
                  {item.label}
                </span>
              )}

              {isLast ? null : <ChevronRight className="h-4 w-4 text-on-surface-variant/60" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
