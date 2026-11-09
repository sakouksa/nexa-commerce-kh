import React from 'react';
import { ArrowUpDown, Tag } from 'lucide-react';
import { Category } from './category.types';
import { CategoryRowActions } from './CategoryActions';
import { useLanguage } from '../../i18n';
import { Pagination } from '../../components/common/Pagination';
import {
  getCategoryEmoji,
  getCategoryDescription,
  localizeCategoryName,
  cleanCategoryName,
} from './categoryUtils';

// Re-export helpers for backward compatibility
export { getCategoryEmoji, getCategoryDescription, localizeCategoryName, cleanCategoryName };

interface CategoryTableProps {
  categories: Category[];
  totalEntries: number;
  loading: boolean;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  sortAsc: boolean;
  visibleColumns: Record<string, boolean>;
  openDropdownId: number | null;
  onSortToggle: () => void;
  onDropdownToggle: (id: number) => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: number, name: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  totalEntries,
  loading,
  currentPage,
  pageSize,
  totalPages,
  sortAsc,
  visibleColumns,
  openDropdownId,
  onSortToggle,
  onDropdownToggle,
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange,
}) => {
  const { t, language } = useLanguage();
  const isKhmer = language === 'kh';

  return (
    <div className="rounded-xl border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] shadow-panel overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#dfe7df] dark:border-[#2a4245] bg-[#f7f8f2]/90 dark:bg-[#17282b]/90 text-[#71817e] dark:text-[#a0b0ad] font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-12">#</th>
              <th className="py-3 px-4 min-w-[200px]">
                {t('categories.category', t('restaurant.category', 'Category'))}
              </th>
              {visibleColumns.description && (
                <th className="py-3 px-4 min-w-[220px]">
                  {t('categories.description', t('restaurant.description', 'Description'))}
                </th>
              )}
              <th className="py-3 px-4 w-28">
                <button
                  type="button"
                  onClick={onSortToggle}
                  className="flex items-center gap-1 hover:text-[#16292e] dark:hover:text-[#e7ede9] transition-colors cursor-pointer"
                >
                  <span>{t('categories.sortOrder', t('restaurant.sortOrder', 'Sort Order'))}</span>
                  <ArrowUpDown className="size-3 text-[#71817e]" />
                </button>
              </th>
              {visibleColumns.status && (
                <th className="py-3 px-4 w-28">
                  {t('categories.status', t('restaurant.status', 'Status'))}
                </th>
              )}
              <th className="py-3 px-4 w-24 text-right">{t('common.actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dfe7df]/60 dark:divide-[#2a4245]/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#71817e]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-6 border-2 border-[#ea580c] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">
                      {t('categories.loadingCategories', t('common.loading', 'Loading categories...'))}
                    </span>
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#71817e]">
                  <div className="flex flex-col items-center gap-2">
                    <Tag className="size-8 text-[#818f8b] stroke-[1.5]" />
                    <span className="text-xs">
                      {t('categories.noCategoriesFound', t('restaurant.noCategoriesFound', 'No categories found'))}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              categories.map((cat, idx) => {
                const rowNum = (currentPage - 1) * pageSize + idx + 1;
                const emoji = getCategoryEmoji(cat.name);
                const desc = getCategoryDescription(cat.name, cat.description, t);
                const isActive = (cat.status || 'active') === 'active';
                const cleanDisplayName = localizeCategoryName(cat.name, isKhmer, false);

                return (
                  <tr
                    key={cat.id}
                    className="hover:bg-[#f7f8f2]/60 dark:hover:bg-[#17282b]/60 transition-colors"
                  >
                    <td className="py-3 px-4 text-[#71817e] font-mono text-[11px]">{rowNum}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-lg bg-[#ea580c]/10 dark:bg-[#ea580c]/20 border border-[#ea580c]/20 flex items-center justify-center text-base shrink-0">
                          {emoji || '🍽️'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[#16292e] dark:text-[#e7ede9] truncate">
                            {cleanDisplayName}
                          </div>
                          {cat.slug && (
                            <div className="text-[10px] text-[#71817e] font-mono truncate">{cat.slug}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    {visibleColumns.description && (
                      <td className="py-3 px-4 text-[#71817e] dark:text-[#a0b0ad] max-w-[300px] truncate">
                        {desc}
                      </td>
                    )}
                    <td className="py-3 px-4 font-mono font-medium text-[#16292e] dark:text-[#e7ede9]">
                      {cat.sort_order ?? 1}
                    </td>
                    {visibleColumns.status && (
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
                              : 'bg-[#f7f8f2] dark:bg-[#17282b] text-[#71817e] border border-[#dfe7df] dark:border-[#2a4245]'
                          }`}
                        >
                          {isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                        </span>
                      </td>
                    )}
                    <td className="py-3 px-4 text-right">
                      <CategoryRowActions
                        category={cat}
                        isOpen={openDropdownId === cat.id}
                        onToggle={() => onDropdownToggle(cat.id)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Standardized SmartHR Pagination Footer */}
      {!loading && totalEntries > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalEntries}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          itemLabel={t('categories.categories', 'categories')}
        />
      )}
    </div>
  );
};

export default CategoryTable;
