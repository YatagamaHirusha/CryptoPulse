import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={`${baseUrl}?page=${currentPage - 1}`}
          className="px-4 py-2 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors font-medium"
        >
          ← Previous
        </Link>
      ) : (
        <button
          disabled
          className="px-4 py-2 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed font-medium"
        >
          ← Previous
        </button>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          // Show first page, last page, current page, and pages around current
          const showPage =
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1);

          // Show ellipsis
          const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
          const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

          if (!showPage && !showEllipsisBefore && !showEllipsisAfter) {
            return null;
          }

          if (showEllipsisBefore || showEllipsisAfter) {
            return (
              <span
                key={`ellipsis-${page}`}
                className="px-2 text-slate-500 dark:text-zinc-400"
              >
                ...
              </span>
            );
          }

          return (
            <Link
              key={page}
              href={`${baseUrl}?page=${page}`}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                page === currentPage
                  ? 'bg-brand-red text-white'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={`${baseUrl}?page=${currentPage + 1}`}
          className="px-4 py-2 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors font-medium"
        >
          Next →
        </Link>
      ) : (
        <button
          disabled
          className="px-4 py-2 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed font-medium"
        >
          Next →
        </button>
      )}
    </div>
  );
}
