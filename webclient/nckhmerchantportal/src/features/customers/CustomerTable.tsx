import React from 'react';
import {
  ArrowUpDown,
  User,
  Users,
  MessageSquare,
} from 'lucide-react';
import { Customer } from './customer.types';
import { CustomerRowActions } from './CustomerActions';
import { useLanguage } from '../../i18n';
import { GlobalFormat } from '../../utils/GlobalFormat';
import { Pagination } from '../../components/common/Pagination';

interface CustomerTableProps {
  customers: Customer[];
  totalEntries: number;
  loading: boolean;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  sortAsc: boolean;
  sortField: 'index' | 'name' | 'orders' | 'spent' | 'date';
  visibleColumns: Record<string, boolean>;
  openDropdownId: number | string | null;
  onSort: (field: 'index' | 'name' | 'orders' | 'spent' | 'date') => void;
  onDropdownToggle: (id: number | string) => void;
  onView: (c: Customer) => void;
  onEdit: (c: Customer) => void;
  onDelete: (c: Customer) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  totalEntries,
  loading,
  currentPage,
  pageSize,
  totalPages,
  sortAsc,
  sortField,
  visibleColumns,
  openDropdownId,
  onSort,
  onDropdownToggle,
  onView,
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-xl border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] shadow-panel overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#dfe7df] dark:border-[#2a4245] bg-[#f7f8f2]/90 dark:bg-[#17282b]/90 text-[#71817e] dark:text-[#a0b0ad] font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-12">#</th>
              <th className="py-3 px-4 min-w-[200px]">
                <button
                  type="button"
                  onClick={() => onSort('name')}
                  className="flex items-center gap-1 hover:text-[#16292e] dark:hover:text-[#e7ede9] transition-colors cursor-pointer"
                >
                  <span>{t('customers.customer', 'Customer')}</span>
                  <ArrowUpDown className="size-3 text-[#71817e]" />
                </button>
              </th>
              {visibleColumns.phone && (
                <th className="py-3 px-4 min-w-[130px]">{t('customers.phone', 'Phone')}</th>
              )}
              {visibleColumns.telegram && (
                <th className="py-3 px-4 min-w-[130px]">{t('customers.telegram', 'Telegram')}</th>
              )}
              {visibleColumns.orders && (
                <th className="py-3 px-4 w-24">
                  <button
                    type="button"
                    onClick={() => onSort('orders')}
                    className="flex items-center gap-1 hover:text-[#16292e] dark:hover:text-[#e7ede9] transition-colors cursor-pointer"
                  >
                    <span>{t('customers.orders', 'Orders')}</span>
                    <ArrowUpDown className="size-3 text-[#71817e]" />
                  </button>
                </th>
              )}
              {visibleColumns.spent && (
                <th className="py-3 px-4 w-28">
                  <button
                    type="button"
                    onClick={() => onSort('spent')}
                    className="flex items-center gap-1 hover:text-[#16292e] dark:hover:text-[#e7ede9] transition-colors cursor-pointer"
                  >
                    <span>{t('customers.spent', 'Spent')}</span>
                    <ArrowUpDown className="size-3 text-[#71817e]" />
                  </button>
                </th>
              )}
              {visibleColumns.createdAt && (
                <th className="py-3 px-4 w-28">
                  <button
                    type="button"
                    onClick={() => onSort('date')}
                    className="flex items-center gap-1 hover:text-[#16292e] dark:hover:text-[#e7ede9] transition-colors cursor-pointer"
                  >
                    <span>{t('customers.joined', 'Joined')}</span>
                    <ArrowUpDown className="size-3 text-[#71817e]" />
                  </button>
                </th>
              )}
              <th className="py-3 px-4 w-24 text-right">{t('common.actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dfe7df]/60 dark:divide-[#2a4245]/60">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#71817e]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-6 border-2 border-[#ea580c] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">{t('common.loading', 'Loading customers...')}</span>
                  </div>
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#71817e]">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="size-8 text-[#818f8b] stroke-[1.5]" />
                    <span className="text-xs">{t('customers.noCustomersFound', 'No customers found')}</span>
                  </div>
                </td>
              </tr>
            ) : (
              customers.map((c, idx) => {
                const rowNum = (currentPage - 1) * pageSize + idx + 1;
                const orderCount = c.total_orders ?? c.order_count ?? 0;
                const totalSpent = c.total_spent ?? 0;

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-[#f7f8f2]/60 dark:hover:bg-[#17282b]/60 transition-colors"
                  >
                    <td className="py-3 px-4 text-[#71817e] font-mono text-[11px]">{rowNum}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-[#ea580c]/10 dark:bg-[#ea580c]/20 text-[#ea580c] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {c.name ? c.name.charAt(0) : <User className="size-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[#16292e] dark:text-[#e7ede9] truncate">
                            {c.name || t('customers.unnamed', 'Unnamed')}
                          </div>
                          {c.email && (
                            <div className="text-[10px] text-[#71817e] truncate">{c.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    {visibleColumns.phone && (
                      <td className="py-3 px-4 font-mono text-[#16292e] dark:text-[#e7ede9]">
                        {c.phone || '—'}
                      </td>
                    )}
                    {visibleColumns.telegram && (
                      <td className="py-3 px-4">
                        {c.telegram ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#ea580c] font-medium">
                            <MessageSquare className="size-3" />
                            <span>{c.telegram.startsWith('@') ? c.telegram : `@${c.telegram}`}</span>
                          </span>
                        ) : (
                          <span className="text-[#818f8b]">—</span>
                        )}
                      </td>
                    )}
                    {visibleColumns.orders && (
                      <td className="py-3 px-4 font-mono text-[#16292e] dark:text-[#e7ede9]">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fff7ed] dark:bg-[#1a3437] text-[#ea580c]">
                          {orderCount} {t('customers.orders', 'orders')}
                        </span>
                      </td>
                    )}
                    {visibleColumns.spent && (
                      <td className="py-3 px-4 font-mono font-bold text-[#16292e] dark:text-[#e7ede9]">
                        {GlobalFormat.currency(totalSpent)}
                      </td>
                    )}
                    {visibleColumns.createdAt && (
                      <td className="py-3 px-4 text-[#71817e] text-[11px]">
                        {c.created_at ? GlobalFormat.date(c.created_at) : '—'}
                      </td>
                    )}
                    <td className="py-3 px-4 text-right">
                      <CustomerRowActions
                        customer={c}
                        isOpen={openDropdownId === c.id}
                        onToggle={() => onDropdownToggle(c.id)}
                        onView={onView}
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
          itemLabel={t('customers.customers', 'customers')}
        />
      )}
    </div>
  );
};

export default CustomerTable;
