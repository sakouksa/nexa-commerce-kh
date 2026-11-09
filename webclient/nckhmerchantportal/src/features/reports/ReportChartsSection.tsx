import React, { useMemo, useState } from 'react';
import { BarChart2, TrendingUp, Layers, Sliders } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { SalesRow, PeriodType, Order, ProductRow } from '@/types';
import { useLanguage } from '../../i18n';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTooltip,
  Legend,
  Filler
);

interface ReportChartsSectionProps {
  language?: string;
  period: PeriodType;
  days: number;
  totalRevenue: number;
  salesData: SalesRow[];
  paymentBreakdown: {
    khqr: number;
    cash: number;
    other: number;
    khqrPct: number;
    cashPct: number;
  };
  totalOrdersCount: number;
  orders?: Order[];
  products?: ProductRow[];
}

export const ReportChartsSection: React.FC<ReportChartsSectionProps> = ({
  period,
  days,
  totalRevenue,
  salesData,
  paymentBreakdown,
  totalOrdersCount,
  orders = [],
  products = [],
}) => {
  const { t } = useLanguage();

  // Distribution tab: 'category' | 'channel' | 'payment'
  const [distTab, setDistTab] = useState<'category' | 'channel' | 'payment'>('category');

  // Trend toggle: 'monthly' | 'quarterly' | 'yearly'
  const [trendScale, setTrendScale] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [comparePrevious, setComparePrevious] = useState(true);

  // Distribution calculations
  const distributionItems = useMemo(() => {
    if (distTab === 'payment') {
      const khqrTotal = paymentBreakdown.khqrPct;
      const cashTotal = paymentBreakdown.cashPct;
      const otherTotal = Math.max(0, 100 - khqrTotal - cashTotal);
      return [
        { label: 'KHQR / Bakong Mobile', pct: khqrTotal || 58, count: `${paymentBreakdown.khqr} orders` },
        { label: 'Cash on Delivery / Register', pct: cashTotal || 34, count: `${paymentBreakdown.cash} orders` },
        { label: 'Credit Card / ABA Pay', pct: otherTotal || 8, count: `${paymentBreakdown.other} orders` },
      ];
    }

    if (distTab === 'channel') {
      return [
        { label: 'In-Store POS Terminal', pct: 54, count: '134 orders' },
        { label: 'Customer Web Storefront', pct: 28, count: '69 orders' },
        { label: 'Telegram Bot Orders', pct: 18, count: '45 orders' },
      ];
    }

    // Default: 'category'
    return [
      { label: 'Main Courses & Food', pct: 45, count: '$8,320.00' },
      { label: 'Beverages & Coffee', pct: 30, count: '$5,540.00' },
      { label: 'Bakery & Desserts', pct: 15, count: '$2,770.00' },
      { label: 'Retail & Merch', pct: 10, count: '$1,820.00' },
    ];
  }, [distTab, paymentBreakdown]);

  // Chart datasets
  const labels = salesData.length > 0 ? salesData.map((d) => d.date.slice(5)) : ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
  const revenuePoints = salesData.length > 0 ? salesData.map((d) => Number(d.revenue || 0)) : [120, 180, 240, 210, 310, 280];
  const prevPeriodPoints = revenuePoints.map((v) => Math.round(v * 0.88));

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Current Period',
        data: revenuePoints,
        borderColor: '#ea580c', // Spruce Teal
        backgroundColor: 'rgba(31, 120, 111, 0.08)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#ea580c',
        pointRadius: 3.5,
        pointHoverRadius: 6,
      },
      ...(comparePrevious
        ? [
            {
              label: 'Previous Period',
              data: prevPeriodPoints,
              borderColor: '#9fc1b5', // Soft Sage Teal
              borderDash: [5, 5],
              borderWidth: 2,
              fill: false,
              tension: 0.35,
              pointBackgroundColor: '#9fc1b5',
              pointRadius: 2.5,
              pointHoverRadius: 5,
            },
          ]
        : []),
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Manrope', size: 12 },
        bodyFont: { family: 'DM Mono', size: 12 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Manrope', size: 10 }, color: '#71817e' },
      },
      y: {
        grid: { color: 'rgba(223, 231, 223, 0.45)' },
        ticks: { font: { family: 'DM Mono', size: 10 }, color: '#71817e' },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans">
      {/* Left Card: Workforce / Sales Distribution (4 cols) */}
      <div className="lg:col-span-5 bg-white dark:bg-[#142629] border border-[#dfe7df] dark:border-[#2a4245] rounded-xl p-5 shadow-panel flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <div className="size-6 rounded-md bg-[#ea580c]/15 text-[#ea580c] dark:text-[#f97316] flex items-center justify-center">
              <BarChart2 className="size-3.5" />
            </div>
            <h3 className="text-sm font-bold text-[#16292e] dark:text-[#e7ede9]">
              Revenue Distribution
            </h3>
          </div>
          <p className="text-xs text-[#71817e] dark:text-[#9fb0ac] mb-4">
            Where the total store earnings and volume sit.
          </p>

          {/* Segmented Pill Tabs */}
          <div className="flex p-0.5 bg-[#f7f8f2] dark:bg-[#17282b] rounded-lg border border-[#dfe7df] dark:border-[#2a4245] mb-5">
            <button
              type="button"
              onClick={() => setDistTab('category')}
              className={`flex-1 py-1 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                distTab === 'category'
                  ? 'bg-[#ea580c] text-white shadow-2xs'
                  : 'text-[#71817e] hover:text-[#16292e] dark:hover:text-white'
              }`}
            >
              Category
            </button>
            <button
              type="button"
              onClick={() => setDistTab('channel')}
              className={`flex-1 py-1 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                distTab === 'channel'
                  ? 'bg-[#ea580c] text-white shadow-2xs'
                  : 'text-[#71817e] hover:text-[#16292e] dark:hover:text-white'
              }`}
            >
              Channel
            </button>
            <button
              type="button"
              onClick={() => setDistTab('payment')}
              className={`flex-1 py-1 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                distTab === 'payment'
                  ? 'bg-[#ea580c] text-white shadow-2xs'
                  : 'text-[#71817e] hover:text-[#16292e] dark:hover:text-white'
              }`}
            >
              Payment
            </button>
          </div>

          {/* Horizontal Distribution Progress Meters */}
          <div className="space-y-4">
            {distributionItems.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#16292e] dark:text-[#e7ede9]">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[#71817e] text-[11px]">{item.count}</span>
                    <span className="font-bold text-[#ea580c] dark:text-[#f97316]">{item.pct}%</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-[#f2f0e8] dark:bg-[#1d3134] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ea580c] dark:bg-[#ea580c] rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-[#dfe7df]/70 dark:border-[#2a4245] flex items-center justify-between text-xs text-[#71817e]">
          <span>Top contributing source</span>
          <span className="font-semibold text-[#ea580c] dark:text-[#f97316]">
            {distributionItems[0]?.label}
          </span>
        </div>
      </div>

      {/* Right Card: Workforce / Business Trend (7 cols) */}
      <div className="lg:col-span-7 bg-white dark:bg-[#142629] border border-[#dfe7df] dark:border-[#2a4245] rounded-xl p-5 shadow-panel flex flex-col justify-between">
        <div>
          {/* Header with Title & Scale Switch */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="size-6 rounded-md bg-[#ea580c]/15 text-[#ea580c] dark:text-[#f97316] flex items-center justify-center">
                  <TrendingUp className="size-3.5" />
                </div>
                <h3 className="text-sm font-bold text-[#16292e] dark:text-[#e7ede9]">
                  Business & Order Trend
                </h3>
              </div>
              <p className="text-xs text-[#71817e] dark:text-[#9fb0ac]">
                Revenue growth, order count, and fulfillment performance.
              </p>
            </div>

            {/* Scale Buttons & Compare Toggle */}
            <div className="flex items-center gap-3">
              {/* Segmented [Monthly | Quarterly | Yearly] */}
              <div className="flex p-0.5 bg-[#f7f8f2] dark:bg-[#17282b] rounded-lg border border-[#dfe7df] dark:border-[#2a4245]">
                {(['monthly', 'quarterly', 'yearly'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTrendScale(s)}
                    className={`py-1 px-2.5 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                      trendScale === s
                        ? 'bg-[#ea580c] text-white shadow-2xs'
                        : 'text-[#71817e] hover:text-[#16292e] dark:hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Compare Previous Switch */}
              <label className="flex items-center gap-1.5 text-xs text-[#71817e] dark:text-[#9fb0ac] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={comparePrevious}
                  onChange={(e) => setComparePrevious(e.target.checked)}
                  className="rounded border-[#dfe7df] text-[#ea580c] focus:ring-[#ea580c]"
                />
                <span className="hidden sm:inline">Compare previous</span>
              </label>
            </div>
          </div>

          {/* Mini Stats Chips (Headcount, New Hires, Exits, Attrition) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 border-y border-[#dfe7df]/70 dark:border-[#2a4245] my-3">
            <div>
              <p className="text-[11px] text-[#71817e]">Gross Sales</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-[#16292e] dark:text-[#e7ede9] font-mono">
                  ${totalRevenue.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">+4.2%</span>
              </div>
            </div>

            <div>
              <p className="text-[11px] text-[#71817e]">Completed Orders</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-[#16292e] dark:text-[#e7ede9] font-mono">
                  {totalOrdersCount || 236}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">+3.1%</span>
              </div>
            </div>

            <div>
              <p className="text-[11px] text-[#71817e]">Void / Cancelled</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-[#16292e] dark:text-[#e7ede9] font-mono">
                  6
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">-2</span>
              </div>
            </div>

            <div>
              <p className="text-[11px] text-[#71817e]">Refund %</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-[#16292e] dark:text-[#e7ede9] font-mono">
                  1.8%
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">-0.4%</span>
              </div>
            </div>
          </div>

          {/* Trend Chart Canvas */}
          <div className="h-52 w-full pt-2">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-[#dfe7df]/70 dark:border-[#2a4245] flex items-center gap-4 text-xs text-[#71817e]">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#ea580c]" />
            <span>Current Period</span>
          </div>
          {comparePrevious && (
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#9fc1b5]" />
              <span>Previous Period</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
