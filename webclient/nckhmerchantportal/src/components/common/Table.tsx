import React from 'react';
import { FiInbox } from 'react-icons/fi';
import { Pagination, PaginationProps } from './Pagination';
import { Empty } from './Empty';
import { useLanguage } from '../../i18n';

export interface Column<T> {
  key: string;
  title: React.ReactNode;
  render?: (record: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey?: string | ((record: T, index: number) => string | number);
  loading?: boolean;
  emptyText?: React.ReactNode;
  emptyTitle?: React.ReactNode;
  emptyDescription?: React.ReactNode;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;
  emptyNode?: React.ReactNode;
  selectable?: boolean;
  selectedKeys?: (string | number)[];
  onSelectChange?: (keys: (string | number)[], selectedRows: T[]) => void;
  onRowClick?: (record: T, index: number) => void;
  className?: string;
  pagination?: PaginationProps;
}

export function Table<T extends Record<string, any>>({
  columns,
  data = [],
  rowKey = 'id',
  loading = false,
  emptyText,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
  emptyNode,
  onRowClick,
  className = '',
  pagination,
}: TableProps<T>) {
  const { t, translateString } = useLanguage();
  const resolvedEmpty = emptyText
    ? (typeof emptyText === 'string' ? translateString(emptyText) : emptyText)
    : t('tables.empty', 'No records found');
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

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden flex flex-col ${className}`}
    >
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm border-collapse">
          {/* Table Header */}
          <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={`px-4 py-3.5 uppercase tracking-wider text-[11px] font-semibold ${getAlignClass(
                    col.align
                  )} ${col.className || ''}`}
                >
                  {typeof col.title === 'string' ? translateString(col.title) : col.title}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {loading ? (
              // Loading Skeleton Rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={`skeleton-col-${cIdx}`} className="px-4 py-4">
                      <div
                        className="h-4 rounded bg-slate-200 dark:bg-slate-800"
                        style={{ width: `${Math.max(40, (cIdx + 1) * 20)}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-6 text-center"
                >
                  {emptyNode || (
                    <Empty
                      icon={emptyIcon}
                      title={emptyTitle || resolvedEmpty}
                      description={emptyDescription}
                      action={emptyAction}
                      className="border-0 bg-transparent min-h-[160px] py-6 shadow-none"
                    />
                  )}
                </td>
              </tr>
            ) : (
              // Data Rows
              data.map((record, index) => {
                const id = getRowId(record, index);

                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick && onRowClick(record, index)}
                    className={`transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } hover:bg-slate-50/80 dark:hover:bg-slate-800/50`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3.5 text-slate-700 dark:text-slate-200 ${getAlignClass(
                          col.align
                        )} ${col.className || ''}`}
                      >
                        {col.render
                          ? col.render(record, index)
                          : record[col.key] !== undefined && record[col.key] !== null
                          ? String(record[col.key])
                          : '—'}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Optional Integrated Bottom Pagination — hidden when there is no data */}
      {pagination && (data.length > 0 || loading) && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 bg-slate-50/40 dark:bg-slate-900/40">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
}

export default Table;
