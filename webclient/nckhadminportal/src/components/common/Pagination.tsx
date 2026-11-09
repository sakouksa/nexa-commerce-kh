import React from 'react';
import { useLanguage } from '../../i18n';
import { sound } from '../../utils/sound';

export interface PaginationProps {
  currentPage?: number;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  total?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  showRecordCount?: boolean;
  itemLabel?: string;
}

/**
 * Pagination Component
 * Cloned directly from Merchant Portal SmartHR design.
 * Features:
 * - Left record summary (Khmer & English localized)
 * - Right controls: Rows selector dropdown, Prev (‹), Page numbers with dynamic theme primary color, Next (›)
 * - Tactile sound feedback on user interactions
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  page,
  totalPages,
  totalItems,
  total,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className = '',
  showRecordCount = true,
  itemLabel,
}) => {
  const { t, isKhmer } = useLanguage();
  const activePage = page !== undefined ? page : (currentPage ?? 1);
  const count = total !== undefined ? total : (totalItems ?? 0);
  const safeTotalPages =
    totalPages !== undefined
      ? Math.max(1, totalPages)
      : Math.max(1, Math.ceil(count / pageSize) || 1);
  const startRecord = count === 0 ? 0 : Math.min((activePage - 1) * pageSize + 1, count);
  const endRecord = Math.min(activePage * pageSize, count);

  const defaultUnit = isKhmer ? 'កំណត់ត្រា' : 'records';
  const resolvedUnit = itemLabel || defaultUnit;

  // Generate page numbers (e.g. 1, 2, ..., 5)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (safeTotalPages <= maxVisible + 2) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, activePage - 1);
      let end = Math.min(safeTotalPages - 1, activePage + 1);

      if (activePage <= 3) {
        start = 2;
        end = 4;
      } else if (activePage >= safeTotalPages - 2) {
        start = safeTotalPages - 3;
        end = safeTotalPages - 1;
      }

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < safeTotalPages - 1) {
        pages.push('...');
      }

      pages.push(safeTotalPages);
    }

    return pages;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > safeTotalPages || newPage === activePage) return;
    sound.playClick();
    onPageChange(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    sound.playClick();
    onPageSizeChange?.(newSize);
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 p-4 border-t border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-sans select-none rounded-b-xl ${className}`}
    >
      {/* 1. Left Summary (e.g. Showing 1–10 of 30 records / បង្ហាញ 1–10 នៃ 30 កំណត់ត្រា) */}
      <div className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
        {showRecordCount && (
          <p id="pagination-summary">
            {count === 0
              ? isKhmer
                ? `បង្ហាញ 0 នៃ 0 ${resolvedUnit}`
                : `Showing 0–0 of 0 ${resolvedUnit}`
              : isKhmer
              ? `បង្ហាញ ${startRecord}–${endRecord} នៃ ${count} ${resolvedUnit}`
              : `Showing ${startRecord}–${endRecord} of ${count} ${resolvedUnit}`}
          </p>
        )}
      </div>

      {/* 2. Right Controls: Rows Selector & Page Numbers */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Rows Selector (Reference: Rows [ 10 ∨ ] / ជួរ [ 10 ∨ ]) */}
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <span>{t('pagination.rows', isKhmer ? 'ជួរ' : 'Rows')}</span>
            <div className="relative">
              <select
                id="page-size-select"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-2.5 pr-7 text-sm font-bold text-slate-800 dark:text-slate-100 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <svg
                className="size-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </label>
        )}

        {/* Previous Button (‹) */}
        <button
          type="button"
          id="emp-page-prev"
          disabled={activePage <= 1}
          onClick={() => handlePageChange(activePage - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[13px] font-bold text-slate-800 dark:text-slate-100 shadow-xs transition-all hover:bg-slate-100 dark:hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
          title={isKhmer ? 'ទំព័រមុន' : 'Previous page'}
        >
          ‹
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageItem, index) => {
            if (pageItem === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-1.5 py-1 text-xs text-slate-400 select-none"
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(pageItem);
            const isActive = activePage === pageNum;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => handlePageChange(pageNum)}
                style={
                  isActive
                    ? {
                        backgroundColor:
                          'var(--btn-primary-hex, var(--primary-hex, #ec4899))',
                        borderColor:
                          'var(--btn-primary-hex, var(--primary-hex, #ec4899))',
                      }
                    : undefined
                }
                className={`emp-page-num flex h-8 w-8 items-center justify-center rounded-lg border text-[12px] font-bold shadow-xs transition-all cursor-pointer ${
                  isActive
                    ? 'text-white shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button (›) */}
        <button
          type="button"
          id="emp-page-next"
          disabled={activePage >= safeTotalPages}
          onClick={() => handlePageChange(activePage + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[13px] font-bold text-slate-800 dark:text-slate-100 shadow-xs transition-all hover:bg-slate-100 dark:hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
          title={isKhmer ? 'ទំព័របន្ទាប់' : 'Next page'}
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
