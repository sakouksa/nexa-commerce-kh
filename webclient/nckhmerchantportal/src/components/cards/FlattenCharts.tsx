import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FlattenCard } from './FlattenCard';

// ─── 1. Concentric Radial Progress Card (Task Performance) ───────────────────
export interface RadialRingData {
  label: string;
  value: number; // 0 to 100
  color: string;
  trackColor?: string;
}

export interface FlattenRadialProgressCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  rings?: Array<RadialRingData>;
  action?: React.ReactNode;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const DEFAULT_RINGS: Array<RadialRingData> = [
  { label: 'Assigned', value: 85, color: '#06b6d4', trackColor: '#e2e8f0' }, // Cyan
  { label: 'Active', value: 65, color: '#059669', trackColor: '#e2e8f0' },   // Emerald
  { label: 'Complete', value: 45, color: '#0e5a77', trackColor: '#e2e8f0' }, // Dark Teal
];

export const FlattenRadialProgressCard: React.FC<FlattenRadialProgressCardProps> = ({
  title = 'Task Performance',
  subtitle,
  rings = DEFAULT_RINGS,
  action,
  size = 220,
  strokeWidth = 14,
  className = '',
}) => {
  const center = size / 2;
  const gap = 6;

  return (
    <FlattenCard title={title} subtitle={subtitle} action={action} className={className}>
      <div className="flex flex-col items-center justify-center py-2 relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          {rings.map((ring, idx) => {
            const radius = center - strokeWidth / 2 - idx * (strokeWidth + gap);
            if (radius <= 0) return null;
            const circumference = 2 * Math.PI * radius;
            const progressOffset = circumference - (ring.value / 100) * circumference;

            return (
              <g key={ring.label || idx}>
                {/* Background Track */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={ring.trackColor || '#f1f5f9'}
                  className="dark:stroke-slate-800"
                  strokeWidth={strokeWidth}
                />
                {/* Animated Value Arc */}
                <motion.circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={progressOffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${center} ${center})`}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: progressOffset }}
                  transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.15 }}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Labels / Legend */}
        <div className="flex flex-col items-center justify-center gap-1.5 mt-4">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {rings.map((ring) => (
              <div key={ring.label} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ring.color }} />
                <span className="font-medium">{ring.label}</span>
                <span className="font-bold text-slate-800 dark:text-white font-mono">{ring.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FlattenCard>
  );
};

// ─── 2. Income Analytics Donut / Pie Card ──────────────────────────────────────
export interface AnalyticsSegment {
  label: string;
  value: number;
  color: string;
}

export interface FlattenIncomeAnalyticsCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  segments?: Array<AnalyticsSegment>;
  action?: React.ReactNode;
  size?: number;
  className?: string;
}

const DEFAULT_ANALYTICS_SEGMENTS: Array<AnalyticsSegment> = [
  { label: 'USA', value: 35, color: '#3b82f6' },
  { label: 'Germany', value: 20, color: '#f43f5e' },
  { label: 'China', value: 18, color: '#f97316' },
  { label: 'India', value: 12, color: '#eab308' },
  { label: 'Brazil', value: 7, color: '#10b981' },
  { label: 'Russia', value: 5, color: '#06b6d4' },
  { label: 'South Africa', value: 3, color: '#8b5cf6' },
];

export const FlattenIncomeAnalyticsCard: React.FC<FlattenIncomeAnalyticsCardProps> = ({
  title = 'Income Analytics',
  subtitle,
  segments = DEFAULT_ANALYTICS_SEGMENTS,
  action,
  size = 180,
  className = '',
}) => {
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  const center = size / 2;
  const radius = size * 0.42;

  let cumulativeAngle = 0;

  return (
    <FlattenCard title={title} subtitle={subtitle} action={action} className={className}>
      <div className="flex flex-col items-center justify-center py-1">
        {/* SVG Pie Chart */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          {segments.map((seg, idx) => {
            const angle = (seg.value / total) * 360;
            const startAngle = cumulativeAngle;
            cumulativeAngle += angle;

            // Convert polar to cartesian
            const startRad = ((startAngle - 90) * Math.PI) / 180;
            const endRad = ((startAngle + angle - 90) * Math.PI) / 180;

            const x1 = center + radius * Math.cos(startRad);
            const y1 = center + radius * Math.sin(startRad);
            const x2 = center + radius * Math.cos(endRad);
            const y2 = center + radius * Math.sin(endRad);

            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            return (
              <motion.path
                key={seg.label || idx}
                d={pathData}
                fill={seg.color}
                className="hover:opacity-90 transition-all cursor-pointer"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              />
            );
          })}
        </svg>

        {/* Legend Pills at Bottom */}
        <div className="flex items-center justify-center gap-x-4 gap-y-2 mt-5 flex-wrap">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="font-medium text-slate-700 dark:text-slate-300">{seg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </FlattenCard>
  );
};

// ─── 3. Flatten Task Summary Line Chart Card ──────────────────────────────────
export interface FlattenTaskSummaryCardProps {
  title?: React.ReactNode;
  onViewAll?: () => void;
  viewAllText?: string;
  className?: string;
}

export const FlattenTaskSummaryCard: React.FC<FlattenTaskSummaryCardProps> = ({
  title = 'Task Summary',
  onViewAll,
  viewAllText = 'View All',
  className = '',
}) => {
  return (
    <FlattenCard
      title={title}
      action={
        onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            {viewAllText}
          </button>
        ) : undefined
      }
      className={className}
    >
      <div className="h-44 w-full relative flex items-end pt-4 pb-2">
        {/* Y Axis Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-mono">
          <div className="border-b border-slate-100 dark:border-slate-800 w-full flex justify-between">
            <span>20</span>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-800 w-full flex justify-between">
            <span>15</span>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-800 w-full flex justify-between">
            <span>10</span>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-800 w-full flex justify-between">
            <span>0</span>
          </div>
        </div>

        {/* Smooth SVG spline line chart */}
        <svg className="w-full h-full overflow-visible z-10" viewBox="0 0 400 120" preserveAspectRatio="none">
          {/* Primary Curve (Cyan/Teal) */}
          <path
            d="M 10 70 Q 70 20, 130 50 T 250 80 T 330 30 T 390 10"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Secondary Curve (Rose) */}
          <path
            d="M 10 95 Q 60 90, 120 70 T 240 60 T 320 75 T 390 90"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Data Points */}
          {[
            { cx: 10, cy: 70, color: '#0ea5e9' },
            { cx: 130, cy: 50, color: '#0ea5e9' },
            { cx: 250, cy: 80, color: '#0ea5e9' },
            { cx: 330, cy: 30, color: '#0ea5e9' },
            { cx: 390, cy: 10, color: '#0ea5e9' },
            { cx: 10, cy: 95, color: '#f43f5e' },
            { cx: 120, cy: 70, color: '#f43f5e' },
            { cx: 240, cy: 60, color: '#f43f5e' },
            { cx: 320, cy: 75, color: '#f43f5e' },
            { cx: 390, cy: 90, color: '#f43f5e' },
          ].map((pt, i) => (
            <circle
              key={i}
              cx={pt.cx}
              cy={pt.cy}
              r="4"
              fill="#ffffff"
              stroke={pt.color}
              strokeWidth="2.5"
              className="transition-transform hover:scale-150 cursor-pointer"
            />
          ))}
        </svg>
      </div>
    </FlattenCard>
  );
};

// ─── 4. Flatten Market Overview Candlestick / Price Chart ─────────────────────
export interface FlattenMarketOverviewCardProps {
  title?: React.ReactNode;
  timeframe?: string;
  timeframes?: string[] | readonly string[];
  onTimeframeChange?: (timeframe: string) => void;
  className?: string;
}

export const FlattenMarketOverviewCard: React.FC<FlattenMarketOverviewCardProps> = ({
  title = 'Market Overview',
  timeframe = 'Months',
  timeframes = ['Days', 'Weeks', 'Months', 'Years'],
  onTimeframeChange,
  className = '',
}) => {
  const [activeTf, setActiveTf] = React.useState(timeframe);
  const [openDropdown, setOpenDropdown] = React.useState(false);

  const handleSelect = (tf: string) => {
    setActiveTf(tf);
    setOpenDropdown(false);
    onTimeframeChange?.(tf);
  };

  return (
    <FlattenCard
      title={title}
      action={
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(!openDropdown)}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            {activeTf}
            <ChevronDown size={13} />
          </button>
          {openDropdown && (
            <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-30">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => handleSelect(tf)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                    activeTf === tf
                      ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>
      }
      className={className}
    >
      <div className="h-44 w-full relative flex items-end pt-4 pb-2">
        {/* Y Axis Prices */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-mono">
          <div className="border-b border-slate-100 dark:border-slate-800 w-full flex justify-between">
            <span>$120</span>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-800 w-full flex justify-between">
            <span>$115</span>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-800 w-full flex justify-between">
            <span>$110</span>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-800 w-full flex justify-between">
            <span>$105</span>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-800 w-full flex justify-between">
            <span>$100</span>
          </div>
        </div>

        {/* Candlestick Glyphs */}
        <svg className="w-full h-full overflow-visible z-10" viewBox="0 0 360 120" preserveAspectRatio="none">
          {/* Up Candles (Green) & Down Candles (Red) */}
          {[
            { x: 20, high: 90, low: 110, open: 100, close: 95, isUp: true },
            { x: 40, high: 80, low: 105, open: 95, close: 85, isUp: true },
            { x: 60, high: 70, low: 95, open: 85, close: 90, isUp: false },
            { x: 80, high: 75, low: 100, open: 90, close: 80, isUp: true },
            { x: 100, high: 60, low: 85, open: 80, close: 65, isUp: true },
            { x: 120, high: 50, low: 80, open: 65, close: 75, isUp: false },
            { x: 140, high: 60, low: 90, open: 75, close: 85, isUp: false },
            { x: 160, high: 45, low: 75, open: 85, close: 55, isUp: true },
            { x: 180, high: 35, low: 65, open: 55, close: 40, isUp: true },
            { x: 200, high: 40, low: 70, open: 40, close: 50, isUp: false },
            { x: 220, high: 30, low: 60, open: 50, close: 35, isUp: true },
            { x: 240, high: 20, low: 50, open: 35, close: 25, isUp: true },
            { x: 260, high: 25, low: 55, open: 25, close: 30, isUp: false },
            { x: 280, high: 15, low: 45, open: 30, close: 20, isUp: true },
            { x: 300, high: 10, low: 40, open: 20, close: 15, isUp: true },
            { x: 320, high: 15, low: 45, open: 15, close: 25, isUp: false },
            { x: 340, high: 5, low: 35, open: 25, close: 10, isUp: true },
          ].map((c, i) => {
            const color = c.isUp ? '#10b981' : '#f43f5e';
            const yTop = Math.min(c.open, c.close);
            const height = Math.max(Math.abs(c.close - c.open), 4);

            return (
              <g key={i}>
                {/* Wick */}
                <line x1={c.x} y1={c.high} x2={c.x} y2={c.low} stroke={color} strokeWidth="1.5" />
                {/* Body */}
                <rect
                  x={c.x - 3}
                  y={yTop}
                  width="6"
                  height={height}
                  fill={c.isUp ? '#ffffff' : color}
                  stroke={color}
                  strokeWidth="1.5"
                  rx="1"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </FlattenCard>
  );
};

// ─── 5. Flatten Crypto Statistics Dual Wave Chart ─────────────────────────────
export interface FlattenCryptoStatsCardProps {
  title?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const FlattenCryptoStatsCard: React.FC<FlattenCryptoStatsCardProps> = ({
  title = 'Crypto Statistics',
  action,
  className = '',
}) => {
  return (
    <FlattenCard title={title} action={action} className={className}>
      <div className="h-44 w-full relative flex items-end pt-4 pb-2">
        {/* Y Axis Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-mono">
          <div className="border-b border-slate-100 dark:border-slate-800 w-full flex justify-between">
            <span>100</span>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-800 w-full flex justify-between">
            <span>80</span>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-800 w-full flex justify-between">
            <span>60</span>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-800 w-full flex justify-between">
            <span>0</span>
          </div>
        </div>

        {/* Dual Wave Spline Curves */}
        <svg className="w-full h-full overflow-visible z-10" viewBox="0 0 400 120" preserveAspectRatio="none">
          {/* Wave 1 (Emerald) */}
          <path
            d="M 10 100 Q 60 70, 110 50 T 220 15 T 320 40 T 390 85"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Wave 2 (Rose/Pink) */}
          <path
            d="M 10 110 Q 70 85, 130 75 T 230 45 T 320 60 T 390 100"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </FlattenCard>
  );
};

export default FlattenRadialProgressCard;
