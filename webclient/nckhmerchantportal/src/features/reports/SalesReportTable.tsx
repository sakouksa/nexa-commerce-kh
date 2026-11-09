import React, { useMemo } from 'react';
import { ArrowUpDown, Eye, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { SalesRow } from '@/types';
import { useLanguage } from '../../i18n';

interface SalesReportTableProps {
  language?: string;
  paginatedList: SalesRow[];
  activePage: number;
  pageSize: number;
  search: string;
  sortField: string;
  sortAsc: boolean;
  onSort: (field: any) => void;
  onSelectDate: (date: string) => void;
}

export const SalesReportTable: React.FC<SalesReportTableProps> = ({
  paginatedList,
  activePage,
  pageSize,
  search,
  sortField,
  sortAsc,
  onSort,
  onSelectDate,
}) => {
  const { t, isKhmer } = useLanguage();

  // Helper to format date with day name
  const parseDateInfo = (dateStr: string) => {
    if (!dateStr) return { dayOfWeek: '', formattedDate: '—', isWeekend: false };
    if (dateStr.includes('-W')) {
      return { dayOfWeek: isKhmer ? 'សប្តាហ៍' : 'Week', formattedDate: dateStr, isWeekend: false };
    }
    const parts = dateStr.split('-');
    if (parts.length === 2) {
      const [y, m] = parts;
      const khMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
      const enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mIdx = parseInt(m, 10) - 1;
      return {
        dayOfWeek: isKhmer ? 'ប្រចាំខែ' : 'Monthly',
        formattedDate: isKhmer ? `ខែ${khMonths[mIdx] || m} ${y}` : `${enMonths[mIdx] || m} ${y}`,
        isWeekend: false,
      };
    }
    if (parts.length === 3) {
      const [y, m, d] = parts;
      const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      const khDays = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
      const enDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const khMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
      const enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayIdx = dateObj.getDay();
      const isWeekend = dayIdx === 0 || dayIdx === 6;

      return {
        dayOfWeek: isKhmer ? khDays[dayIdx] : enDays[dayIdx],
        formattedDate: `${d} ${isKhmer ? khMonths[dateObj.getMonth()] : enMonths[dateObj.getMonth()]} ${y}`,
        isWeekend,
      };
    }
    return { dayOfWeek: '', formattedDate: dateStr, isWeekend: false };
  };

  // Page Subtotals
  const pageTotals = useMemo(() => {
    let orders = 0;
    let revenue = 0;
    let cost = 0;
    let profit = 0;

    paginatedList.forEach((r) => {
      const rev = Number(r.revenue || 0);
      const c = rev * 0.58;
      const p = Math.max(0, rev - c);
      orders += Number(r.orders || 0);
      revenue += rev;
      cost += c;
      profit += p;
    });

    const aov = orders > 0 ? revenue / orders : 0;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return { orders, revenue, cost, profit, aov, margin };
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
                  <span>{t('reports.colDateDay', 'Date & Day')}</span>
                  <ArrowUpDown className="size-3 text-[#71817e]" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => onSort('orders')}
                className="text-center cursor-pointer hover:text-[#16292e] dark:hover:text-white text-xs font-semibold text-[#71817e]"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>{t('reports.colOrders', 'Orders')}</span>
                  <ArrowUpDown className="size-3 text-[#71817e]" />
                </div>
              </TableHead>
              <TableHead className="text-right text-xs font-semibold text-[#71817e]">
                {t('reports.colAov', 'Avg Order (AOV)')}
              </TableHead>
              <TableHead
                onClick={() => onSort('revenue')}
                className="text-right cursor-pointer hover:text-[#16292e] dark:hover:text-white text-xs font-semibold text-[#71817e]"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{t('reports.colRevenue', 'Total Revenue')}</span>
                  <ArrowUpDown className="size-3 text-[#71817e]" />
                </div>
              </TableHead>
              <TableHead className="text-right text-xs font-semibold text-[#71817e]">
                {t('reports.colCogs', 'Est. Cost (58%)')}
              </TableHead>
              <TableHead className="text-right text-xs font-semibold text-[#71817e]">
                {t('reports.colProfitMargin', 'Gross Profit & Margin')}
              </TableHead>
              <TableHead className="text-center w-24 text-xs font-semibold text-[#71817e]">
                {t('reports.colAction', 'Action')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedList.map((item, idx) => {
              const rowNum = (activePage - 1) * pageSize + idx + 1;
              const rev = Number(item.revenue || 0);
              const ordersCount = Number(item.orders || 0);
              const cost = rev * 0.58;
              const profit = Math.max(0, rev - cost);
              const aov = ordersCount > 0 ? rev / ordersCount : 0;
              const margin = rev > 0 ? (profit / rev) * 100 : 0;
              const { dayOfWeek, formattedDate, isWeekend } = parseDateInfo(item.date);

              return (
                <TableRow
                  key={item.date || idx}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-100 dark:border-slate-800/70"
                >
                  <TableCell className="text-center font-medium text-slate-400 text-xs py-3">
                    {rowNum}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                        <Calendar className="size-3.5 stroke-[1.8]" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs font-mono">
                          {formattedDate}
                        </div>
                        {dayOfWeek && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                                isWeekend
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                  : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {dayOfWeek}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Orders */}
                  <TableCell className="text-center py-3">
                    <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                      {ordersCount}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1 font-normal">
                      {t('reports.ordersUnit', 'orders')}
                    </span>
                  </TableCell>

                  {/* AOV */}
                  <TableCell className="text-right py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                    ${aov.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* Revenue */}
                  <TableCell className="text-right py-3 font-bold text-slate-900 dark:text-white font-mono text-xs sm:text-sm">
                    ${rev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* COGS */}
                  <TableCell className="text-right py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">
                    ${cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* Profit & Margin */}
                  <TableCell className="text-right py-3">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                        ${profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {margin.toFixed(1)}% {t('reports.margin', 'margin')}
                      </span>
                    </div>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="text-center py-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSelectDate(item.date)}
                      className="h-7 px-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 flex items-center gap-1 mx-auto cursor-pointer rounded-lg"
                    >
                      <Eye className="size-3.5" />
                      <span>{t('reports.view', 'View')}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

            {paginatedList.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                  {search
                    ? t('reports.noDataMatchingSearch', 'No records matching search')
                    : t('reports.noSalesRecords', 'No sales records available')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {/* Clean Pinned Summary Footer Row */}
          {paginatedList.length > 0 && (
            <TableFooter className="bg-slate-50/70 dark:bg-slate-800/60 font-semibold border-t border-slate-200 dark:border-slate-800">
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={2} className="py-3 text-xs font-bold text-slate-900 dark:text-white">
                  {t('reports.pageTotalDays', { count: paginatedList.length, defaultValue: `Page Total (${paginatedList.length} days)` })}
                </TableCell>
                <TableCell className="text-center py-3 font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                  {pageTotals.orders.toLocaleString('en-US')}{' '}
                  <span className="text-[11px] text-slate-400 font-normal">
                    {t('reports.ordersUnit', 'orders')}
                  </span>
                </TableCell>
                <TableCell className="text-right py-3 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  ${pageTotals.aov.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right py-3 font-mono font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                  ${pageTotals.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right py-3 font-mono text-xs text-slate-500">
                  ${pageTotals.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right py-3">
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                      ${pageTotals.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {pageTotals.margin.toFixed(1)}% {t('reports.margin', 'margin')}
                    </span>
                  </div>
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
