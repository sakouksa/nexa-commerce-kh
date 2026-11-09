import React, { useMemo } from 'react';
import { ArrowUpDown, Package, Check, AlertTriangle, X } from 'lucide-react';
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
import { ProductRow, StockProductRow } from '@/types';
import { useLanguage } from '../../i18n';

interface ProductReportTableProps {
  language?: string;
  paginatedList: ProductRow[];
  stockItems?: StockProductRow[];
  activePage: number;
  pageSize: number;
  totalRevenue: number;
  sortField: string;
  sortAsc: boolean;
  onSort: (field: any) => void;
}

export const ProductReportTable: React.FC<ProductReportTableProps> = ({
  paginatedList,
  stockItems = [],
  activePage,
  pageSize,
  totalRevenue,
  sortField,
  sortAsc,
  onSort,
}) => {
  const { t } = useLanguage();

  // Stock lookup map for quick O(1) matching by product name or SKU
  const stockMap = useMemo(() => {
    const map = new Map<string, StockProductRow>();
    stockItems.forEach((s) => {
      if (s.name) map.set(s.name.trim().toLowerCase(), s);
      if (s.sku) map.set(s.sku.trim().toLowerCase(), s);
    });
    return map;
  }, [stockItems]);

  // Page Subtotals
  const pageTotals = useMemo(() => {
    let units = 0;
    let revenue = 0;

    paginatedList.forEach((p) => {
      units += Number(p.units || 0);
      revenue += Number(p.revenue || 0);
    });

    const avgPrice = units > 0 ? revenue / units : 0;
    const pct = totalRevenue > 0 ? Math.min(100, Math.round((revenue / totalRevenue) * 100)) : 0;

    return { units, revenue, avgPrice, pct };
  }, [paginatedList, totalRevenue]);

  return (
    <Card className="border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] rounded-xl overflow-hidden shadow-panel">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f7f8f2] dark:bg-[#17282b] border-b border-[#dfe7df] dark:border-[#2a4245] hover:bg-transparent">
              <TableHead className="w-16 text-center text-xs font-semibold text-[#71817e]">
                {t('reports.colRank', 'Rank')}
              </TableHead>
              <TableHead
                onClick={() => onSort('primary')}
                className="cursor-pointer hover:text-[#16292e] dark:hover:text-white text-xs font-semibold text-[#71817e]"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t('reports.colProductName', 'Product Name')}</span>
                  <ArrowUpDown className="size-3 text-[#71817e]" />
                </div>
              </TableHead>
              <TableHead className="text-right text-xs font-semibold text-[#71817e]">
                {t('reports.colAvgUnitPrice', 'Avg Unit Price')}
              </TableHead>
              <TableHead
                onClick={() => onSort('orders')}
                className="text-center cursor-pointer hover:text-[#16292e] dark:hover:text-white text-xs font-semibold text-[#71817e]"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>{t('reports.colUnitsSold', 'Units Sold')}</span>
                  <ArrowUpDown className="size-3 text-slate-400" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => onSort('revenue')}
                className="text-right cursor-pointer hover:text-slate-900 dark:hover:text-white text-xs font-semibold text-slate-500"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{t('reports.colRevenue', 'Total Revenue')}</span>
                  <ArrowUpDown className="size-3 text-slate-400" />
                </div>
              </TableHead>
              <TableHead className="text-right w-44 text-xs font-semibold text-slate-500">
                {t('reports.colContribution', 'Contribution (%)')}
              </TableHead>
              <TableHead className="text-center w-36 text-xs font-semibold text-slate-500">
                {t('reports.colStockAlert', 'Stock Alert')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedList.map((item, idx) => {
              const rank = (activePage - 1) * pageSize + idx + 1;
              const rev = Number(item.revenue || 0);
              const units = Number(item.units || 0);
              const avgUnitPrice = units > 0 ? rev / units : 0;
              const pct = totalRevenue > 0 ? Math.min(100, Math.round((rev / totalRevenue) * 100)) : 0;

              // Check stock level
              const stockMatch = item.name ? stockMap.get(item.name.trim().toLowerCase()) : null;
              const hasStockInfo = stockMatch !== null && stockMatch !== undefined;
              const stockQty = hasStockInfo ? Number(stockMatch.quantity) : null;

              return (
                <TableRow
                  key={item.name || idx}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-100 dark:border-slate-800/70"
                >
                  {/* Rank Badge */}
                  <TableCell className="text-center py-3">
                    {rank === 1 ? (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50 font-bold text-xs">
                        #1
                      </span>
                    ) : rank === 2 ? (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-bold text-xs">
                        #2
                      </span>
                    ) : rank === 3 ? (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50 font-bold text-xs">
                        #3
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500">
                        #{rank}
                      </span>
                    )}
                  </TableCell>

                  {/* Product Name */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                        <Package className="size-3.5 stroke-[1.8]" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate max-w-xs">
                          {item.name || 'Product'}
                        </div>
                        {item.sku && (
                          <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                            SKU: {item.sku}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Avg Unit Price */}
                  <TableCell className="text-right py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                    ${avgUnitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* Units Sold */}
                  <TableCell className="text-center py-3">
                    <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                      {units.toLocaleString('en-US')}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1 font-normal">
                      {t('reports.unitsUnit', 'units')}
                    </span>
                  </TableCell>

                  {/* Total Revenue */}
                  <TableCell className="text-right py-3 font-bold text-slate-900 dark:text-white font-mono text-xs sm:text-sm">
                    ${rev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* Contribution Bar */}
                  <TableCell className="text-right py-3">
                    <div className="flex items-center justify-end gap-2.5">
                      <div className="w-16 sm:w-20 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 w-8 text-right">
                        {pct}%
                      </span>
                    </div>
                  </TableCell>

                  {/* Stock Alert Pill */}
                  <TableCell className="text-center py-3">
                    {hasStockInfo && stockQty !== null ? (
                      stockQty <= 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50">
                          <X className="size-3" />
                          <span>{t('reports.outOfStock', 'Out of Stock')}</span>
                        </span>
                      ) : stockQty <= 5 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50">
                          <AlertTriangle className="size-3" />
                          <span>{t('reports.lowStockWithQty', { qty: stockQty, defaultValue: `Low (${stockQty})` })}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50">
                          <Check className="size-3" />
                          <span>{t('reports.inStockWithQty', { qty: stockQty, defaultValue: `In Stock (${stockQty})` })}</span>
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-slate-400 font-mono">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {paginatedList.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  {t('reports.noProductSales', 'No product sales recorded')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {/* Clean Pinned Summary Footer Row */}
          {paginatedList.length > 0 && (
            <TableFooter className="bg-slate-50/70 dark:bg-slate-800/60 font-semibold border-t border-slate-200 dark:border-slate-800">
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={2} className="py-3 text-xs font-bold text-slate-900 dark:text-white">
                  {t('reports.pageTotalItems', { count: paginatedList.length, defaultValue: `Page Total (${paginatedList.length} items)` })}
                </TableCell>
                <TableCell className="text-right py-3 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  ${pageTotals.avgPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-center py-3 font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                  {pageTotals.units.toLocaleString('en-US')}{' '}
                  <span className="text-[11px] text-slate-400 font-normal">
                    {t('reports.unitsUnit', 'units')}
                  </span>
                </TableCell>
                <TableCell className="text-right py-3 font-mono font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                  ${pageTotals.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right py-3 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                  {pageTotals.pct}% {t('reports.share', 'share')}
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
