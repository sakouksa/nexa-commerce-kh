import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Inbox } from 'lucide-react';
import { Pagination, PaginationProps } from './Pagination';
import { useLanguage } from '../../i18n';
import {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../ui/table';
import { Button } from '../ui/button';
import { Empty } from '../ui/empty';

export interface Column<T> {
  key: string;
  title: React.ReactNode;
  render?: (record: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  sortKey?: string;
}

export interface TableEmptyState {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  onReset?: () => void;
  resetLabel?: React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey?: string | ((record: T, index: number) => string | number);
  loading?: boolean;
  skeletonRows?: number;
  emptyText?: string;
  emptyState?: TableEmptyState;
  selectable?: boolean;
  selectedKeys?: (string | number)[];
  onSelectChange?: (keys: (string | number)[], selectedRows: T[]) => void;
  onRowClick?: (record: T, index: number) => void;
  className?: string;
  containerClassName?: string;
  pagination?: PaginationProps;
  // Sorting props
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string, order: 'asc' | 'desc') => void;
}

export function Table<T extends Record<string, any>>({
  columns,
  data = [],
  rowKey = 'id',
  loading = false,
  skeletonRows = 4,
  emptyText,
  emptyState,
  onRowClick,
  className = '',
  containerClassName = '',
  pagination,
  sortBy,
  sortOrder = 'asc',
  onSort,
}: TableProps<T>) {
  const { t, translateString } = useLanguage();
  const resolvedEmpty = emptyText ? translateString(emptyText) : t('tables.empty', 'គ្មានទិន្នន័យ');

  const getRowId = (record: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record, index);
    }
    return record[rowKey] ?? index;
  };

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  const getCellPadding = (index: number, total: number) => {
    if (index === 0) return 'pl-5 pr-4';
    if (index === total - 1) return 'pl-4 pr-5';
    return 'px-4';
  };

  const handleHeaderSort = (col: Column<T>) => {
    if (!col.sortable || !onSort) return;
    const colSortKey = col.sortKey || col.key;
    if (sortBy === colSortKey) {
      onSort(colSortKey, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      const defaultDescKeys = ['created_at', 'orders', 'products', 'total', 'date', 'updated_at'];
      const nextOrder = defaultDescKeys.includes(colSortKey) ? 'desc' : 'asc';
      onSort(colSortKey, nextOrder);
    }
  };

  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden ${containerClassName}`}
    >
      <div className="relative w-full overflow-x-auto">
        <table className={`w-full caption-bottom text-sm border-collapse ${className}`}>
          {/* Table Header */}
          <TableHeader>
            <TableRow className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/90">
              {columns.map((col, cIdx) => {
                const isSortable = !!col.sortable && !!onSort;
                const colSortKey = col.sortKey || col.key;
                const isActive = sortBy === colSortKey;

                const headerContent = (
                  <div
                    className={`inline-flex items-center gap-1.5 ${
                      col.align === 'right'
                        ? 'justify-end w-full'
                        : col.align === 'center'
                        ? 'justify-center w-full'
                        : 'justify-start'
                    }`}
                  >
                    <span>
                      {typeof col.title === 'string' ? translateString(col.title) : col.title}
                    </span>
                    {isSortable && (
                      <span className="shrink-0 text-slate-400">
                        {isActive ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="size-3 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <ArrowDown className="size-3 text-indigo-600 dark:text-indigo-400" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        )}
                      </span>
                    )}
                  </div>
                );

                return (
                  <TableHead
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={`py-3 font-semibold text-xs text-slate-600 dark:text-slate-300 ${getCellPadding(
                      cIdx,
                      columns.length
                    )} ${getAlignClass(col.align)} ${col.headerClassName || ''}`}
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => handleHeaderSort(col)}
                        className={`group inline-flex items-center hover:text-indigo-600 transition-colors cursor-pointer select-none ${
                          col.align === 'right' ? 'w-full justify-end' : ''
                        }`}
                      >
                        {headerContent}
                      </button>
                    ) : (
                      headerContent
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody>
            {loading ? (
              // Loading Skeleton Rows
              Array.from({ length: skeletonRows }).map((_, rIdx) => (
                <TableRow
                  key={`skeleton-${rIdx}`}
                  className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-transparent"
                >
                  {columns.map((col, cIdx) => (
                    <TableCell
                      key={`skeleton-col-${cIdx}`}
                      className={`py-4 ${getCellPadding(cIdx, columns.length)} ${getAlignClass(col.align)}`}
                    >
                      <div
                        className={`h-5 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse ${
                          col.align === 'right' ? 'ml-auto' : col.align === 'center' ? 'mx-auto' : ''
                        }`}
                        style={{
                          width:
                            col.width && typeof col.width === 'number'
                              ? Math.min(Number(col.width) - 30, 160)
                              : cIdx === 0
                              ? '70%'
                              : '50%',
                          maxWidth: '100%',
                          minWidth: '40px',
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              // Global Shadcn-style Empty State
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="py-12 px-4 text-center"
                >
                  <Empty
                    bordered={false}
                    icon={emptyState?.icon || <Inbox className="size-6" />}
                    title={emptyState?.title || resolvedEmpty}
                    description={emptyState?.description}
                    action={
                      emptyState?.onReset ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={emptyState.onReset}
                          className="text-xs rounded-xl cursor-pointer"
                        >
                          {emptyState.resetLabel || t('common.reset', 'កំណត់ឡើងវិញ')}
                        </Button>
                      ) : undefined
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              // Data Rows
              data.map((record, index) => {
                const id = getRowId(record, index);

                return (
                  <TableRow
                    key={id}
                    onClick={() => onRowClick && onRowClick(record, index)}
                    className={`border-b border-slate-100 dark:border-slate-800/60 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } hover:bg-slate-50/70 dark:hover:bg-slate-800/40`}
                  >
                    {columns.map((col, cIdx) => (
                      <TableCell
                        key={col.key}
                        className={`py-3.5 text-slate-700 dark:text-slate-200 ${getCellPadding(
                          cIdx,
                          columns.length
                        )} ${getAlignClass(col.align)} ${col.className || ''}`}
                      >
                        {col.render
                          ? col.render(record, index)
                          : record[col.key] !== undefined && record[col.key] !== null
                          ? String(record[col.key])
                          : '—'}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </table>
      </div>

      {/* Integrated Global Pagination */}
      {pagination && (
        <Pagination {...pagination} />
      )}
    </div>
  );
}

export const DataTable = Table;
export default Table;
