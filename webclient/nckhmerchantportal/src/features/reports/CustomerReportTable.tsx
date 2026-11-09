import React, { useMemo } from 'react';
import { ArrowUpDown, Sparkles, Phone, Crown, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { GlobalFormat } from '../../utils/GlobalFormat';
import { CustomerRow } from '@/types';
import { useLanguage } from '../../i18n';

interface CustomerReportTableProps {
  language?: string;
  paginatedList: CustomerRow[];
  activePage: number;
  pageSize: number;
  sortField: string;
  sortAsc: boolean;
  onSort: (field: any) => void;
}

export const CustomerReportTable: React.FC<CustomerReportTableProps> = ({
  paginatedList,
  activePage,
  pageSize,
  sortField,
  sortAsc,
  onSort,
}) => {
  const { t } = useLanguage();

  // Page Subtotals
  const pageTotals = useMemo(() => {
    let orders = 0;
    let spent = 0;

    paginatedList.forEach((c) => {
      orders += Number(c.order_count || 0);
      spent += Number(c.total_spent || 0);
    });

    const avgSpend = orders > 0 ? spent / orders : 0;

    return { orders, spent, avgSpend };
  }, [paginatedList]);

  return (
    <Card className="border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] rounded-xl overflow-hidden shadow-panel">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f7f8f2] dark:bg-[#17282b] border-b border-[#dfe7df] dark:border-[#2a4245] hover:bg-transparent">
              <TableHead className="w-12 text-center text-xs font-semibold text-[#71817e]">#</TableHead>
              <TableHead
                onClick={() => onSort('primary')}
                className="cursor-pointer hover:text-[#16292e] dark:hover:text-white text-xs font-semibold text-[#71817e]"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t('reports.colCustomer', 'Customer')}</span>
                  <ArrowUpDown className="size-3 text-[#71817e]" />
                </div>
              </TableHead>
              <TableHead className="text-xs font-semibold text-[#71817e]">{t('reports.colPhone', 'Phone')}</TableHead>
              <TableHead className="text-center w-36 text-xs font-semibold text-[#71817e]">
                {t('reports.colMembershipTier', 'Membership Tier')}
              </TableHead>
              <TableHead
                onClick={() => onSort('orders')}
                className="text-center cursor-pointer hover:text-[#16292e] dark:hover:text-white text-xs font-semibold text-[#71817e]"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>{t('reports.colTotalOrders', 'Total Orders')}</span>
                  <ArrowUpDown className="size-3 text-slate-400" />
                </div>
              </TableHead>
              <TableHead className="text-right text-xs font-semibold text-slate-500">
                {t('reports.colAvgSpend', 'Avg Spend / Visit')}
              </TableHead>
              <TableHead
                onClick={() => onSort('revenue')}
                className="text-right cursor-pointer hover:text-slate-900 dark:hover:text-white text-xs font-semibold text-slate-500"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{t('reports.colTotalSpent', 'Total Spent (LTV)')}</span>
                  <ArrowUpDown className="size-3 text-slate-400" />
                </div>
              </TableHead>
              <TableHead className="text-center w-24 text-xs font-semibold text-slate-500">
                {t('reports.colContact', 'Contact')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedList.map((c, idx) => {
              const rowNum = (activePage - 1) * pageSize + idx + 1;
              const spent = Number(c.total_spent || 0);
              const orderCount = Number(c.order_count || 0);
              const avgSpend = orderCount > 0 ? spent / orderCount : 0;

              const isDiamond = spent >= 500;
              const isGold = !isDiamond && spent >= 200;
              const isSilver = !isDiamond && !isGold && spent >= 50;

              return (
                <TableRow
                  key={c.id || c.phone || idx}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-100 dark:border-slate-800/70"
                >
                  <TableCell className="text-center font-medium text-slate-400 text-xs py-3">
                    {rowNum}
                  </TableCell>

                  {/* Customer Info */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                        {(c.name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-xs">
                          {c.name || t('reports.anonymousCustomer', 'Anonymous Customer')}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Phone */}
                  <TableCell className="font-mono text-xs text-slate-500 py-3">
                    {c.phone ? GlobalFormat.phone(c.phone) : '—'}
                  </TableCell>

                  {/* VIP Tier Badge */}
                  <TableCell className="text-center py-3">
                    {isDiamond ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40">
                        <Sparkles className="size-3 text-purple-500" />
                        <span>Diamond</span>
                      </span>
                    ) : isGold ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
                        <Crown className="size-3 text-amber-500" />
                        <span>Gold</span>
                      </span>
                    ) : isSilver ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/60 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40">
                        <Award className="size-3 text-sky-500" />
                        <span>Silver</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <span>Regular</span>
                      </span>
                    )}
                  </TableCell>

                  {/* Total Orders */}
                  <TableCell className="text-center py-3">
                    <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                      {orderCount}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1 font-normal">
                      {t('reports.ordersUnit', 'orders')}
                    </span>
                  </TableCell>

                  {/* Avg Spend */}
                  <TableCell className="text-right py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                    ${avgSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* Total Spent / LTV */}
                  <TableCell className="text-right py-3 font-bold font-mono text-xs sm:text-sm text-slate-900 dark:text-white">
                    ${spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* Action */}
                  <TableCell className="text-center py-3">
                    {c.phone ? (
                      <a
                        href={`tel:${c.phone}`}
                        className="inline-flex items-center justify-center size-7 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors mx-auto cursor-pointer"
                        title={t('reports.callCustomer', 'Call customer')}
                      >
                        <Phone className="size-3.5" />
                      </a>
                    ) : (
                      <span className="text-slate-400 text-xs font-mono">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {paginatedList.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                  {t('reports.noCustomerRecords', 'No customer records available')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {/* Clean Pinned Summary Footer Row */}
          {paginatedList.length > 0 && (
            <TableFooter className="bg-slate-50/70 dark:bg-slate-800/60 font-semibold border-t border-slate-200 dark:border-slate-800">
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="py-3 text-xs font-bold text-slate-900 dark:text-white">
                  {t('reports.pageTotalCustomers', { count: paginatedList.length, defaultValue: `Page Total (${paginatedList.length} customers)` })}
                </TableCell>
                <TableCell className="text-center py-3 font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                  {pageTotals.orders.toLocaleString('en-US')}{' '}
                  <span className="text-[11px] text-slate-400 font-normal">
                    {t('reports.ordersUnit', 'orders')}
                  </span>
                </TableCell>
                <TableCell className="text-right py-3 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  ${pageTotals.avgSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right py-3 font-mono font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                  ${pageTotals.spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </Card>
  );
};
