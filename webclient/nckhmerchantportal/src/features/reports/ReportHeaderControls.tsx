import React, { useState } from 'react';
import {
  Download,
  Printer,
  ChevronDown,
  Send,
  Home,
  RefreshCw,
  Bookmark,
  Check,
  Calendar,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { PeriodType } from '@/types';
import { useLanguage } from '../../i18n';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

interface ReportHeaderControlsProps {
  language?: string;
  days: number;
  setDays: (d: number) => void;
  period: PeriodType;
  setPeriod: (p: PeriodType) => void;
  refreshing: boolean;
  onRefresh: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
  onOpenTelegramModal?: () => void;
  recordCount?: number;
}

export const ReportHeaderControls: React.FC<ReportHeaderControlsProps> = ({
  days,
  setDays,
  period,
  setPeriod,
  refreshing,
  onRefresh,
  onExportCsv,
  onPrint,
  onOpenTelegramModal,
  recordCount = 248,
}) => {
  const { t } = useLanguage();

  // Filter dropdown states
  const [comparison, setComparison] = useState('vs Last Month');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedChannel, setSelectedChannel] = useState('All Channels');
  const [selectedPayment, setSelectedPayment] = useState('All Payment Types');
  const [savedView, setSavedView] = useState(false);

  // Current Month Label (e.g., September 2026)
  const currentMonthLabel = React.useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, []);

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Top Breadcrumb & Actions Bar (Reference SmartHR FSM) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Breadcrumb */}
        <Breadcrumbs />

        {/* Right Top Actions */}
        <div className="flex items-center gap-2">
          {/* Date Selector Pill Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-8 px-3 rounded-lg border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] text-[#16292e] dark:text-[#e7ede9] text-xs font-medium flex items-center gap-1.5 shadow-2xs hover:bg-[#f7f8f2] dark:hover:bg-[#17282b] transition-colors cursor-pointer"
              >
                <Calendar className="size-3.5 text-[#ea580c]" />
                <span>{currentMonthLabel}</span>
                <ChevronDown className="size-3 text-[#71817e]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 text-xs font-sans p-1 border-[#dfe7df] dark:border-[#2a4245]">
              {([1, 7, 30, 90] as const).map((d) => (
                <DropdownMenuItem
                  key={d}
                  onClick={() => setDays(d)}
                  className="cursor-pointer hover:bg-[#fff7ed] dark:hover:bg-[#1d3134]"
                >
                  {d === 1 ? 'Today (24h)' : `Past ${d} Days`}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-8 px-3 rounded-lg border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] text-[#16292e] dark:text-[#e7ede9] text-xs font-medium flex items-center gap-1.5 shadow-2xs hover:bg-[#f7f8f2] dark:hover:bg-[#17282b] transition-colors cursor-pointer"
              >
                <Download className="size-3.5 text-[#71817e]" />
                <span>Export</span>
                <ChevronDown className="size-3 text-[#71817e]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs font-sans p-1 border-[#dfe7df] dark:border-[#2a4245]">
              <DropdownMenuItem
                onClick={onExportCsv}
                className="cursor-pointer py-2 hover:bg-[#fff7ed] dark:hover:bg-[#1d3134]"
              >
                <Download className="size-3.5 text-[#ea580c] mr-2" />
                <span>Export as CSV</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#dfe7df] dark:bg-[#2a4245]" />
              <DropdownMenuItem
                onClick={onPrint}
                className="cursor-pointer py-2 hover:bg-[#fff7ed] dark:hover:bg-[#1d3134]"
              >
                <Printer className="size-3.5 text-[#ea580c] mr-2" />
                <span>Print Document</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Print Button */}
          <button
            type="button"
            onClick={onPrint}
            className="h-8 px-3 rounded-lg border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] text-[#16292e] dark:text-[#e7ede9] text-xs font-medium flex items-center gap-1.5 shadow-2xs hover:bg-[#f7f8f2] dark:hover:bg-[#17282b] transition-colors cursor-pointer"
            title="Print"
          >
            <Printer className="size-3.5 text-[#71817e]" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            className={`size-8 rounded-lg border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] text-[#71817e] hover:text-[#16292e] dark:hover:text-white flex items-center justify-center shadow-2xs hover:bg-[#f7f8f2] dark:hover:bg-[#17282b] transition-all cursor-pointer ${
              refreshing ? 'animate-spin text-[#ea580c]' : ''
            }`}
            title="Refresh Data"
          >
            <RefreshCw className="size-3.5" />
          </button>

          {/* Telegram Bot Button */}
          {onOpenTelegramModal && (
            <button
              type="button"
              onClick={onOpenTelegramModal}
              className="h-8 px-3 rounded-lg bg-[#ea580c]/10 hover:bg-[#ea580c]/20 border border-[#ea580c]/30 text-[#ea580c] dark:text-[#f97316] text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="Telegram Notification"
            >
              <Send className="size-3.5" />
              <span className="hidden md:inline">Telegram Report</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Page Title & Description */}
      <div>
        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#16292e] dark:text-[#e7ede9] leading-tight font-heading">
          {t('reports.title', 'Business Reports')}
        </h1>
        <p className="text-xs sm:text-[13px] text-[#71817e] dark:text-[#9fb0ac] mt-1 max-w-2xl">
          {t(
            'reports.subtitle',
            'Analyze workforce performance, attendance, leave, sales trends, and organizational health.'
          )}
        </p>
      </div>

      {/* 3. Filter Bar (Pill selects, Apply, Reset, Save View, Live Status) */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
        {/* Comparison Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="h-8 px-3 rounded-lg border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] text-[#16292e] dark:text-[#e7ede9] text-xs font-medium flex items-center gap-1.5 shadow-2xs hover:bg-[#f7f8f2] transition-colors"
            >
              <span>{comparison}</span>
              <ChevronDown className="size-3 text-[#71817e]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 text-xs border-[#dfe7df] dark:border-[#2a4245]">
            {['vs Last Month', 'vs Last Week', 'vs Last Year', 'vs Previous Period'].map((item) => (
              <DropdownMenuItem key={item} onClick={() => setComparison(item)} className="cursor-pointer">
                {item}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Category Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="h-8 px-3 rounded-lg border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] text-[#16292e] dark:text-[#e7ede9] text-xs font-medium flex items-center gap-1.5 shadow-2xs hover:bg-[#f7f8f2] transition-colors"
            >
              <span>{selectedCategory}</span>
              <ChevronDown className="size-3 text-[#71817e]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-44 text-xs border-[#dfe7df] dark:border-[#2a4245]">
            {['All Categories', 'Food & Beverages', 'Bakery & Dessert', 'Groceries', 'Retail & Goods'].map((c) => (
              <DropdownMenuItem key={c} onClick={() => setSelectedCategory(c)} className="cursor-pointer">
                {c}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Channel Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="h-8 px-3 rounded-lg border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] text-[#16292e] dark:text-[#e7ede9] text-xs font-medium flex items-center gap-1.5 shadow-2xs hover:bg-[#f7f8f2] transition-colors"
            >
              <span>{selectedChannel}</span>
              <ChevronDown className="size-3 text-[#71817e]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 text-xs border-[#dfe7df] dark:border-[#2a4245]">
            {['All Channels', 'POS In-Store', 'Online Storefront', 'Telegram Order', 'Delivery Partner'].map((ch) => (
              <DropdownMenuItem key={ch} onClick={() => setSelectedChannel(ch)} className="cursor-pointer">
                {ch}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Payment Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="h-8 px-3 rounded-lg border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] text-[#16292e] dark:text-[#e7ede9] text-xs font-medium flex items-center gap-1.5 shadow-2xs hover:bg-[#f7f8f2] transition-colors"
            >
              <span>{selectedPayment}</span>
              <ChevronDown className="size-3 text-[#71817e]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-44 text-xs border-[#dfe7df] dark:border-[#2a4245]">
            {['All Payment Types', 'KHQR / Bakong', 'Cash on Hand', 'Credit Card / ABA'].map((p) => (
              <DropdownMenuItem key={p} onClick={() => setSelectedPayment(p)} className="cursor-pointer">
                {p}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Apply Button (SmartHR solid spruce teal) */}
        <button
          type="button"
          onClick={onRefresh}
          className="h-8 px-3.5 rounded-lg bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
        >
          <Check className="size-3.5 stroke-[2.5]" />
          <span>{t('buttons.apply', t('common.apply', 'Apply'))}</span>
        </button>

        {/* Reset Button */}
        <button
          type="button"
          onClick={() => {
            setComparison('vs Last Month');
            setSelectedCategory('All Categories');
            setSelectedChannel('All Channels');
            setSelectedPayment('All Payment Types');
            onRefresh();
          }}
          className="h-8 px-2.5 rounded-lg text-xs font-medium text-[#71817e] hover:text-[#16292e] dark:hover:text-white transition-colors cursor-pointer"
        >
          {t('buttons.reset', t('common.reset', 'Reset'))}
        </button>

        {/* Save View Button */}
        <button
          type="button"
          onClick={() => setSavedView(!savedView)}
          className={`h-8 px-3 rounded-lg border border-[#dfe7df] dark:border-[#2a4245] text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer ${
            savedView
              ? 'bg-[#ea580c]/15 text-[#ea580c] border-[#ea580c]/40 font-semibold'
              : 'bg-white dark:bg-[#142629] text-[#16292e] dark:text-[#e7ede9] hover:bg-[#f7f8f2]'
          }`}
        >
          <Bookmark className="size-3 text-[#ea580c]" />
          <span>Save View</span>
        </button>

        {/* Live Records Status Pill */}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-[#71817e] dark:text-[#9fb0ac] bg-white dark:bg-[#142629] border border-[#dfe7df] dark:border-[#2a4245] px-2.5 py-1 rounded-full shadow-2xs font-mono">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live</span>
          <span className="text-[#a3aeab]">•</span>
          <span>{recordCount} Records</span>
        </div>
      </div>
    </div>
  );
};
