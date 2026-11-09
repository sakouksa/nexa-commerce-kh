import React from 'react';
import { SlidersHorizontal, Check, RotateCcw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { sound } from '@/utils/sound';

export interface ColumnOption {
  key: string;
  label: string;
  disabled?: boolean;
}

export interface ColumnSettingsPopoverProps {
  columns: ColumnOption[];
  visibleColumns?: Record<string, boolean>;
  defaultVisibleColumns?: Record<string, boolean>;
  onChange?: (updated: Record<string, boolean>) => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  buttonClassName?: string;
  title?: string;
}

export const ColumnSettingsPopover: React.FC<ColumnSettingsPopoverProps> = ({
  columns = [],
  visibleColumns = {},
  defaultVisibleColumns,
  onChange,
  label = 'Manage Table',
  buttonClassName = '',
  title = 'Table Columns',
}) => {
  const toggleColumn = (key: string, disabled?: boolean) => {
    if (disabled || !onChange) return;
    sound.playClick();
    const updated = {
      ...visibleColumns,
      [key]: visibleColumns[key] === false ? true : false,
    };
    onChange(updated);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    if (onChange && defaultVisibleColumns) {
      onChange({ ...defaultVisibleColumns });
    } else if (onChange) {
      const allTrue = columns.reduce<Record<string, boolean>>((acc, col) => {
        acc[col.key] = true;
        return acc;
      }, {});
      onChange(allTrue);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`h-10 min-h-[40px] max-h-[40px] px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-card hover:bg-muted/80 text-foreground dark:text-slate-200 text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer shrink-0 outline-none ${buttonClassName}`}
        >
          <SlidersHorizontal size={14} className="text-muted-foreground" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-56 p-1.5 rounded-xl border border-border bg-card shadow-xl text-xs font-medium z-50"
      >
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0 text-xs font-bold text-foreground">
            {title}
          </DropdownMenuLabel>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-60 overflow-y-auto py-0.5 space-y-0.5">
          {columns.map((col) => {
            const isVisible = visibleColumns[col.key] !== false;
            return (
              <DropdownMenuItem
                key={col.key}
                onSelect={(e) => {
                  e.preventDefault();
                  toggleColumn(col.key, col.disabled);
                }}
                disabled={col.disabled}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-muted text-foreground"
              >
                <span className="truncate">{col.label}</span>
                <div
                  className={`size-4 rounded flex items-center justify-center border transition-all ${
                    isVisible
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-muted-foreground/40 bg-transparent'
                  }`}
                >
                  {isVisible && <Check size={12} className="stroke-[3]" />}
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColumnSettingsPopover;

