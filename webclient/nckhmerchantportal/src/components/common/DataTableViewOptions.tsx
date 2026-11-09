import React from 'react';
import { SlidersHorizontal, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { useLanguage } from '../../i18n';

export interface ColumnOption {
  id: string;
  label: string;
  visible: boolean;
}

export interface DataTableViewOptionsProps {
  columns: ColumnOption[];
  onToggleColumn: (id: string) => void;
  className?: string;
}

export function DataTableViewOptions({
  columns,
  onToggleColumn,
  className = '',
}: DataTableViewOptionsProps) {
  const { t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus:border-orange-500 ${className}`}
        >
          <SlidersHorizontal className="size-3.5 text-slate-500 dark:text-slate-400" />
          <span>{t('tables.columns', t('tables.view', 'Columns'))}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-1">
        <DropdownMenuLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2 py-1.5">
          {t('tables.toggleColumns', 'Toggle columns')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />
        <div className="max-h-64 overflow-y-auto space-y-0.5">
          {columns.map((col) => (
            <DropdownMenuItem
              key={col.id}
              onSelect={(e) => {
                e.preventDefault();
                onToggleColumn(col.id);
              }}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer select-none"
            >
              <span className="truncate">{col.label}</span>
              {col.visible && (
                <Check className="size-3.5 text-slate-700 dark:text-slate-200 shrink-0 ml-2" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DataTableViewOptions;
