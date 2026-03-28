import { ChevronLeft, ChevronRight } from "lucide-react";

type PanelPaginationProps = {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
};

function buildPageWindow(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((firstPage, secondPage) => firstPage - secondPage);
}

export function PanelPagination({
  currentPage,
  onPageChange,
  totalPages,
}: PanelPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pageWindow = buildPageWindow(currentPage, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-on-surface-variant">
        Pagina <span className="font-semibold text-on-surface">{currentPage}</span> de{" "}
        <span className="font-semibold text-on-surface">{totalPages}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          className="panel-card-muted inline-flex h-10 items-center justify-center rounded-xl border px-3 text-on-surface transition-colors hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pageWindow.map((page, index) => {
          const previousPage = pageWindow[index - 1];
          const shouldShowGap = typeof previousPage === "number" && page - previousPage > 1;

          return (
            <div className="flex items-center gap-2" key={page}>
              {shouldShowGap ? (
                <span className="px-1 text-sm text-on-surface-variant">...</span>
              ) : null}
              <button
                className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition-colors ${
                  currentPage === page
                    ? "border-primary bg-primary text-white"
                    : "panel-card-muted text-on-surface hover:border-primary/30 hover:text-primary"
                }`}
                onClick={() => onPageChange(page)}
                type="button"
              >
                {page}
              </button>
            </div>
          );
        })}

        <button
          className="panel-card-muted inline-flex h-10 items-center justify-center rounded-xl border px-3 text-on-surface transition-colors hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
