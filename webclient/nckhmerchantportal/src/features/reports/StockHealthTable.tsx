import React, { useMemo, useState } from 'react';
import { ArrowUpDown, AlertTriangle, Check, X, Package, Layers, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { StockProductRow } from '@/types';
import { useLanguage } from '../../i18n';

interface StockHealthTableProps {
  language?: string;
  stockReport: any;
  paginatedList: StockProductRow[];
  activePage: number;
  pageSize: number;
  sortField: string;
  sortAsc: boolean;
  onSort: (field: any) => void;
}

export const StockHealthTable: React.FC<StockHealthTableProps> = ({
  stockReport,
  paginatedList,
  activePage,
  pageSize,
  sortField,
  sortAsc,
  onSort,
}) => {
  const { t } = useLanguage();
  const [filterStatus, setFilterStatus] = useState<'all' | 'out_of_stock' | 'low_stock' | 'normal_stock'>('all');

  // Filter list by selected status
  const displayedList = useMemo(() => {
    if (filterStatus === 'all') return paginatedList;
    return paginatedList.filter((item) => {
      const isOut = item.quantity <= 0 || item.status === 'out_of_stock';
      const isLow = !isOut && (item.quantity <= 5 || item.status === 'low_stock');
      if (filterStatus === 'out_of_stock') return isOut;
      if (filterStatus === 'low_stock') return isLow;
      if (filterStatus === 'normal_stock') return !isOut && !isLow;
      return true;
    });
  }, [paginatedList, filterStatus]);

  // Page Subtotals
  const pageTotals = useMemo(() => {
    let totalQty = 0;
    let totalValuation = 0;

    displayedList.forEach((item) => {
      const q = Number(item.quantity || 0);
      const p = Number(item.price || 0);
      totalQty += q;
      totalValuation += q * p;
    });

    return { totalQty, totalValuation };
  }, [displayedList]);

  const normalStockCount = stockReport?.counts?.normal || stockReport?.counts?.normal_stock || 0;
  const lowStockCount = stockReport?.counts?.low_stock || 0;
  const outOfStockCount = stockReport?.counts?.out_of_stock || 0;
  const totalStockCount = stockReport?.counts?.total || stockReport?.total_products || 0;

  return (
    <div className="space-y-3.5">
      {/* Quick Interactive Stock Status Summary Cards (Clean Shadcn UI style) */}
      {stockReport && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* 1. All Products */}
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={cn(
              "group relative rounded-2xl border text-left p-4 transition-all duration-200 cursor-pointer shadow-2xs",
              "bg-white dark:bg-slate-900",
              filterStatus === 'all'
                ? "border-orange-500/90 ring-2 ring-orange-500/20 dark:ring-orange-500/30 shadow-xs"
                : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight truncate">
                {t('reports.allProducts', 'All Products')}
              </span>
              <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60 transition-colors group-hover:border-slate-300">
                <Layers className="size-4 stroke-[2]" />
              </div>
            </div>
            <div className="mt-2.5 mb-2">
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-mono leading-none">
                {totalStockCount}
              </div>
            </div>
            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0.5 font-medium border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              >
                {t('reports.totalItems', 'Total items')}
              </Badge>
              {filterStatus === 'all' && (
                <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-orange-500 animate-pulse" />
                  {t('reports.filtering', 'Filtered')}
                </span>
              )}
            </div>
          </button>

          {/* 2. Out of Stock */}
          <button
            type="button"
            onClick={() => setFilterStatus(filterStatus === 'out_of_stock' ? 'all' : 'out_of_stock')}
            className={cn(
              "group relative rounded-2xl border text-left p-4 transition-all duration-200 cursor-pointer shadow-2xs",
              "bg-white dark:bg-slate-900",
              filterStatus === 'out_of_stock'
                ? "border-rose-500/90 ring-2 ring-rose-500/20 dark:ring-rose-500/30 shadow-xs"
                : "border-slate-200/80 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900/50"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight truncate">
                {t('reports.outOfStock', 'Out of Stock')}
              </span>
              <div className="size-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/60 dark:border-rose-900/40 transition-colors">
                <X className="size-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-2.5 mb-2">
              <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 font-mono leading-none">
                {outOfStockCount}
              </div>
            </div>
            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              <Badge variant="destructive" className="text-[10px] px-2 py-0.5 font-medium">
                {outOfStockCount > 0 ? t('reports.stockoutAlertShort', '0 in stock') : t('reports.none', 'None')}
              </Badge>
              {filterStatus === 'out_of_stock' && (
                <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                  {t('reports.filtering', 'Filtered')}
                </span>
              )}
            </div>
          </button>

          {/* 3. Low Stock */}
          <button
            type="button"
            onClick={() => setFilterStatus(filterStatus === 'low_stock' ? 'all' : 'low_stock')}
            className={cn(
              "group relative rounded-2xl border text-left p-4 transition-all duration-200 cursor-pointer shadow-2xs",
              "bg-white dark:bg-slate-900",
              filterStatus === 'low_stock'
                ? "border-amber-500/90 ring-2 ring-amber-500/20 dark:ring-amber-500/30 shadow-xs"
                : "border-slate-200/80 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-900/50"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight truncate">
                {t('reports.lowStock', 'Low Stock')}
              </span>
              <div className="size-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-900/40 transition-colors">
                <AlertTriangle className="size-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-2.5 mb-2">
              <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 font-mono leading-none">
                {lowStockCount}
              </div>
            </div>
            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              <Badge variant="warning" className="text-[10px] px-2 py-0.5 font-medium">
                {lowStockCount > 0 ? t('reports.lowStockAlertShort', '≤ 5 items') : t('reports.none', 'None')}
              </Badge>
              {filterStatus === 'low_stock' && (
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {t('reports.filtering', 'Filtered')}
                </span>
              )}
            </div>
          </button>

          {/* 4. Healthy Stock */}
          <button
            type="button"
            onClick={() => setFilterStatus(filterStatus === 'normal_stock' ? 'all' : 'normal_stock')}
            className={cn(
              "group relative rounded-2xl border text-left p-4 transition-all duration-200 cursor-pointer shadow-2xs",
              "bg-white dark:bg-slate-900",
              filterStatus === 'normal_stock'
                ? "border-emerald-500/90 ring-2 ring-emerald-500/20 dark:ring-emerald-500/30 shadow-xs"
                : "border-slate-200/80 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/50"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight truncate">
                {t('reports.healthyStock', 'Healthy Stock')}
              </span>
              <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-900/40 transition-colors">
                <Check className="size-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-2.5 mb-2">
              <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono leading-none">
                {normalStockCount}
              </div>
            </div>
            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              <Badge variant="success" className="text-[10px] px-2 py-0.5 font-medium">
                {t('reports.healthyStockTag', '> 5 in stock')}
              </Badge>
              {filterStatus === 'normal_stock' && (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('reports.filtering', 'Filtered')}
                </span>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Main Table Card */}
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
                    <span>{t('reports.colProductName', 'Product & SKU')}</span>
                    <ArrowUpDown className="size-3 text-[#71817e]" />
                  </div>
                </TableHead>
                <TableHead className="text-center w-36 text-xs font-semibold text-[#71817e]">
                  {t('reports.colStockStatus', 'Stock Status')}
                </TableHead>
                <TableHead className="text-right text-xs font-semibold text-[#71817e]">
                  {t('reports.colUnitPrice', 'Unit Price ($)')}
                </TableHead>
                <TableHead
                  onClick={() => onSort('quantity')}
                  className="text-center cursor-pointer hover:text-slate-900 dark:hover:text-white text-xs font-semibold text-slate-500"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>{t('reports.colStockQty', 'Stock Qty')}</span>
                    <ArrowUpDown className="size-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500">
                  {t('reports.colStockValuation', 'Stock Valuation')}
                </TableHead>
                <TableHead className="text-center w-28 text-xs font-semibold text-slate-500">
                  {t('reports.colAction', 'Action')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedList.map((item, idx) => {
                const rowNum = (activePage - 1) * pageSize + idx + 1;
                const qty = Number(item.quantity || 0);
                const price = Number(item.price || 0);
                const valuation = qty * price;
                const isOut = qty <= 0 || item.status === 'out_of_stock';
                const isLow = !isOut && (qty <= 5 || item.status === 'low_stock');

                return (
                  <TableRow
                    key={item.id || item.name || idx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-100 dark:border-slate-800/70"
                  >
                    <TableCell className="text-center font-medium text-slate-400 text-xs py-3">
                      {rowNum}
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
                          {item.sku ? (
                            <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                              SKU: {item.sku}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                              {t('reports.standardProduct', 'Standard Product')}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Status Pill */}
                    <TableCell className="text-center py-3">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50">
                          <X className="size-3" />
                          <span>{t('reports.outOfStock', 'Out of Stock')}</span>
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50">
                          <AlertTriangle className="size-3" />
                          <span>{t('reports.lowStock', 'Low Stock')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50">
                          <Check className="size-3" />
                          <span>{t('reports.inStock', 'In Stock')}</span>
                        </span>
                      )}
                    </TableCell>

                    {/* Unit Price */}
                    <TableCell className="text-right py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                      ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>

                    {/* Stock Qty */}
                    <TableCell className="text-center py-3">
                      <span
                        className={`font-mono font-bold text-xs ${
                          isOut
                            ? 'text-rose-600 dark:text-rose-400'
                            : isLow
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {qty.toLocaleString('en-US')}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1 font-normal">
                        {t('reports.unitsUnit', 'units')}
                      </span>
                    </TableCell>

                    {/* Valuation */}
                    <TableCell className="text-right py-3 font-bold font-mono text-xs sm:text-sm text-slate-900 dark:text-white">
                      ${valuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-center py-3">
                      <Link
                        to="/products/stock"
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <span>{t('reports.manage', 'Manage')}</span>
                        <ExternalLink className="size-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}

              {displayedList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    {t('reports.noStockItems', 'No inventory items in this filter')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            {/* Pinned Summary Total Row */}
            {displayedList.length > 0 && (
              <TableFooter className="bg-slate-50/70 dark:bg-slate-800/60 font-semibold border-t border-slate-200 dark:border-slate-800">
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={2} className="py-3 text-xs font-bold text-slate-900 dark:text-white">
                    {t('reports.pageTotalStock', { count: displayedList.length, defaultValue: `Total Inventory (${displayedList.length} items)` })}
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell className="text-center py-3 font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                    {pageTotals.totalQty.toLocaleString('en-US')}{' '}
                    <span className="text-[11px] text-slate-400 font-normal">
                      {t('reports.unitsUnit', 'units')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-3 font-mono font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                    ${pageTotals.totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </Card>
    </div>
  );
};
