import React, { useState, useEffect } from 'react';
import { Search, X, Check, ChevronDown, Trash2 } from 'lucide-react';
import { useLanguage } from '../../i18n';
import { ColumnSettingsPopover, type ColumnOption } from './ColumnSettingsPopover';
import { sound } from '@/utils/sound';

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSelectConfig {
  id: string;
  value: string;
  onChange: (val: string) => void;
  options: FilterSelectOption[];
  minWidth?: string;
  placeholder?: string;
}

export interface UnifiedFilterToolbarProps {
  search?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filters?: FilterSelectConfig[];
  onApply?: () => void;
  onReset?: () => void;
  selectedCount?: number;
  onBulkDelete?: () => void;
  bulkDeleteLabel?: string;
  columns?: ColumnOption[];
  visibleColumns?: Record<string, boolean>;
  defaultVisibleColumns?: Record<string, boolean>;
  onColumnChange?: (updated: Record<string, boolean>) => void;
  columnSettingsTitle?: string;
  extraActions?: React.ReactNode;
  className?: string;
}

export const UnifiedFilterToolbar: React.FC<UnifiedFilterToolbarProps> = ({
  search = '',
  onSearchChange,
  searchPlaceholder,
  filters = [],
  onApply,
  onReset,
  selectedCount = 0,
  onBulkDelete,
  bulkDeleteLabel,
  columns = [],
  visibleColumns = {},
  defaultVisibleColumns,
  onColumnChange,
  columnSettingsTitle,
  extraActions,
  className = '',
}) => {
  const { t, isKhmer } = useLanguage();

  // Local draft states for search & filters
  const [searchDraft, setSearchDraft] = useState(search);
  const [filterDrafts, setFilterDrafts] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    filters.forEach((f) => {
      init[f.id] = f.value;
    });
    return init;
  });

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    setFilterDrafts((prev) => {
      const next = { ...prev };
      filters.forEach((f) => {
        next[f.id] = f.value;
      });
      return next;
    });
  }, [filters]);

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    sound.playClick();
    if (onSearchChange) onSearchChange(searchDraft.trim());
    filters.forEach((f) => {
      f.onChange(filterDrafts[f.id] ?? f.value);
    });
    if (onApply) onApply();
  };

  const handleReset = () => {
    sound.playClick();
    setSearchDraft('');
    const emptyDrafts: Record<string, string> = {};
    filters.forEach((f) => {
      emptyDrafts[f.id] = '';
      f.onChange('');
    });
    setFilterDrafts(emptyDrafts);
    if (onSearchChange) onSearchChange('');
    if (onReset) onReset();
  };

  const controlHeightCls = 'h-10 min-h-[40px] max-h-[40px]';
  const selectCls = `w-full ${controlHeightCls} pl-3 pr-7 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer outline-none shadow-2xs`;

  return (
    <div
      className={`w-full rounded-xl border border-slate-200/90 dark:border-slate-800 bg-card p-2.5 sm:p-3 shadow-2xs transition-all print:hidden ${className}`}
    >
      <form onSubmit={handleApply} className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* 1. Search input */}
        {onSearchChange && (
          <div
            className={`relative w-full sm:w-72 md:w-80 lg:w-96 max-w-sm shrink-0 ${controlHeightCls}`}
          >
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
            />
            <input
              type="text"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder={
                searchPlaceholder ||
                (isKhmer ? 'វាយពាក្យស្វែងរក...' : 'Type to search...')
              }
              className={`w-full ${controlHeightCls} pl-9 pr-8 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-card dark:bg-slate-900 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 placeholder:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs`}
            />
            {searchDraft && (
              <button
                type="button"
                onClick={() => setSearchDraft('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
                title={isKhmer ? 'សម្អាតការស្វែងរក' : 'Clear search'}
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}

        {/* 2. Filter Dropdowns */}
        {filters.map((f) => (
          <div
            key={f.id}
            className={`relative flex-1 ${f.minWidth || 'min-w-[130px] sm:min-w-[145px] xl:w-[155px]'} xl:flex-none ${controlHeightCls}`}
          >
            <select
              value={filterDrafts[f.id] ?? f.value}
              onChange={(e) =>
                setFilterDrafts((prev) => ({ ...prev, [f.id]: e.target.value }))
              }
              className={selectCls}
            >
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        ))}

        {/* 3. Apply Button */}
        <button
          type="submit"
          style={{
            backgroundColor:
              'var(--btn-primary-hex, var(--primary-hex, var(--sidebar-active-bg, #ec4899)))',
          }}
          className={`${controlHeightCls} px-3.5 sm:px-4 rounded-lg active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:brightness-95 cursor-pointer shrink-0`}
          title={isKhmer ? 'អនុវត្តតម្រង' : 'Apply Filters'}
        >
          <Check size={15} className="stroke-[2.5]" />
          <span>{isKhmer ? 'អនុវត្ត' : 'Apply'}</span>
        </button>

        {/* 4. Reset Button */}
        <button
          type="button"
          onClick={handleReset}
          className={`${controlHeightCls} px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-muted/80 text-foreground dark:text-slate-200 text-sm font-semibold flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer shrink-0`}
          title={isKhmer ? 'កំណត់តម្រងឡើងវិញ' : 'Reset all filters'}
        >
          <span>{isKhmer ? 'កំណត់ឡើងវិញ' : 'Reset'}</span>
        </button>

        {/* 5. Bulk Delete Action (Appears when items selected) */}
        {selectedCount > 0 && onBulkDelete && (
          <button
            type="button"
            onClick={onBulkDelete}
            className={`${controlHeightCls} px-3 text-xs sm:text-[13px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-500/20 hover:bg-rose-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs`}
          >
            <Trash2 size={14} />
            <span>
              {bulkDeleteLabel ||
                (isKhmer
                  ? `លុបដែលបានជ្រើស (${selectedCount})`
                  : `Delete Selected (${selectedCount})`)}
            </span>
          </button>
        )}

        {/* 6. Extra Actions if provided */}
        {extraActions && (
          <div className="flex items-center gap-1.5 shrink-0">{extraActions}</div>
        )}

        {/* 7. Column Settings Popover (Manage Table) */}
        {columns.length > 0 && onColumnChange && (
          <div className="ml-auto shrink-0">
            <ColumnSettingsPopover
              columns={columns}
              visibleColumns={visibleColumns}
              defaultVisibleColumns={defaultVisibleColumns}
              onChange={onColumnChange}
              size="md"
              label={isKhmer ? 'គ្រប់គ្រងតារាង' : 'Manage Table'}
              title={columnSettingsTitle || (isKhmer ? 'ជួរឈរតារាង' : 'Table Columns')}
            />
          </div>
        )}
      </form>
    </div>
  );
};

export default UnifiedFilterToolbar;

