import React from 'react';
import {
  AlertTriangle,
  RotateCcw,
  PackageX,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../../i18n';

interface ReportActionCenterProps {
  language?: string;
  outOfStockCount: number;
  lowStockCount: number;
  cancelledOrdersCount: number;
  cancelledTotal: number;
  onNavigateTab: (tab: 'stock' | 'sales' | 'products') => void;
}

export const ReportActionCenter: React.FC<ReportActionCenterProps> = ({
  outOfStockCount,
  lowStockCount,
  cancelledOrdersCount,
  cancelledTotal,
  onNavigateTab,
}) => {
  const { t } = useLanguage();
  const hasAlerts = outOfStockCount > 0 || cancelledOrdersCount > 0 || lowStockCount > 0;

  if (!hasAlerts) {
    return (
      <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300">
        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="font-medium">
          {t('reports.allHealthy', 'All operational metrics healthy: No cancelled orders or critical out-of-stock items detected.')}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 dark:from-amber-950/30 dark:via-slate-900 dark:to-amber-950/20 p-3 sm:p-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left header */}
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-800/50">
            <ShieldAlert className="size-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{t('reports.actionCenterTitle', 'Operational Action Center')}</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                {outOfStockCount > 0 ? t('reports.actionRequired', 'Action Required') : t('reports.notice', 'Notice')}
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('reports.actionCenterSubtitle', 'Monitor revenue leakages from stockouts and suspicious voided orders.')}
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Out of Stock Alert */}
          {outOfStockCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/90 border border-rose-200/80 dark:border-rose-900/60 text-xs shadow-2xs">
              <PackageX className="size-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-rose-700 dark:text-rose-400">
                  {t('reports.outOfStockAlert', { count: outOfStockCount, defaultValue: `${outOfStockCount} Out of Stock` })}
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  ({t('reports.lostSalesRisk', 'Lost Sales Risk')})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('stock')}
                className="h-6 px-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-0 ml-1 cursor-pointer"
              >
                <span>{t('reports.check', 'Check')}</span>
                <ArrowRight className="size-3 ml-0.5" />
              </Button>
            </div>
          )}

          {/* Cancelled / Voided Orders Alert */}
          {cancelledOrdersCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/90 border border-amber-200/80 dark:border-amber-900/60 text-xs shadow-2xs">
              <RotateCcw className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {t('reports.cancelledAlert', { count: cancelledOrdersCount, defaultValue: `${cancelledOrdersCount} Cancelled` })}
                </span>
                <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">
                  (${cancelledTotal.toFixed(2)})
                </span>
              </div>
            </div>
          )}

          {/* Low Stock Warning */}
          {lowStockCount > 0 && outOfStockCount === 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/90 border border-amber-200/80 dark:border-amber-900/60 text-xs shadow-2xs">
              <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                {t('reports.lowStockAlert', { count: lowStockCount, defaultValue: `${lowStockCount} Low Stock` })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('stock')}
                className="h-6 px-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 p-0 ml-1 cursor-pointer"
              >
                <span>{t('reports.view', 'View')}</span>
                <ArrowRight className="size-3 ml-0.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
