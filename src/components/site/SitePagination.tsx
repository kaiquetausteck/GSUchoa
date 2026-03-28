type SitePaginationProps = {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
};

function buildPages(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
}

export function SitePagination({
  currentPage,
  onPageChange,
  totalPages,
}: SitePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPages(currentPage, totalPages);

  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
      <button
        className="rounded-full border border-outline-variant/15 bg-surface-container-low px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant transition-colors hover:border-primary/24 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        type="button"
      >
        Anterior
      </button>

      {pages.map((page) => (
        <button
          className={`rounded-full border px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
            currentPage === page
              ? "border-primary bg-primary text-white"
              : "border-outline-variant/15 bg-surface-container-low text-on-surface-variant hover:border-primary/24 hover:text-primary"
          }`}
          key={page}
          onClick={() => onPageChange(page)}
          type="button"
        >
          {page}
        </button>
      ))}

      <button
        className="rounded-full border border-outline-variant/15 bg-surface-container-low px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant transition-colors hover:border-primary/24 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        Proxima
      </button>
    </div>
  );
}
