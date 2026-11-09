import React from 'react';
import { Users } from 'lucide-react';
import { RestaurantTable } from '../../types/restaurant';

interface FloorPlanTableCardProps {
  table: RestaurantTable;
  onClick: () => void;
}

export const FloorPlanTableCard: React.FC<FloorPlanTableCardProps> = ({ table, onClick }) => {
  const sideCount = table.seats > 2 ? 1 : 0;
  const tbCount = Math.max(1, Math.floor((table.seats - 2 * sideCount) / 2));

  // RestroPOS exact soft capsule colors for chairs
  const chairColor = {
    available: 'bg-emerald-500/20 dark:bg-emerald-500/25',
    occupied: 'bg-rose-500/20 dark:bg-rose-500/25',
    reserved: 'bg-amber-500/20 dark:bg-amber-500/25',
    cleaning: 'bg-sky-500/20 dark:bg-sky-500/25',
  }[table.status];

  // RestroPOS exact badge styles
  const badgeStyle = {
    available: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-transparent',
    occupied: 'bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-transparent',
    reserved: 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-transparent',
    cleaning: 'bg-sky-500/15 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400 border border-transparent',
  }[table.status];

  const hasExtraInfo =
    (table.status === 'reserved' && (table.reservedFor || table.reservationTime)) ||
    (table.status === 'occupied' && table.currentOrderId);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`Table ${table.number}`}
      className="bg-white dark:bg-slate-900 flex cursor-pointer flex-col rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 transition-shadow hover:shadow-sm select-none"
    >
      {/* Table Diagram Visual */}
      <div className="flex flex-col items-center gap-2 py-2">
        {/* Top Chairs */}
        <div className="flex gap-1.5">
          {Array.from({ length: tbCount }).map((_, r) => (
            <span key={r} className={`h-2 w-7 rounded-full transition-colors ${chairColor}`} />
          ))}
        </div>

        {/* Middle Table Row */}
        <div className="flex w-full items-center justify-center gap-1.5">
          {sideCount > 0 && (
            <span className={`h-8 w-2.5 shrink-0 rounded-full transition-colors ${chairColor}`} />
          )}

          {/* Neutral center table box matching RestroPOS */}
          <div
            className={`border-slate-200 dark:border-slate-800 flex h-14 rounded-lg border-2 bg-transparent transition-all ${
              table.seats === 6 ? 'w-24' : table.seats <= 5 ? 'w-14' : 'flex-1'
            }`}
          />

          {sideCount > 0 && (
            <span className={`h-8 w-2.5 shrink-0 rounded-full transition-colors ${chairColor}`} />
          )}
        </div>

        {/* Bottom Chairs */}
        <div className="flex gap-1.5">
          {Array.from({ length: tbCount }).map((_, r) => (
            <span key={r} className={`h-2 w-7 rounded-full transition-colors ${chairColor}`} />
          ))}
        </div>
      </div>

      {/* Table Details */}
      <div className="mt-1 text-center">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          Table {table.number}
        </p>
        <div className="text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-center gap-1 text-xs">
          <Users className="size-3" />
          <span>{table.seats} seats</span>
          <span>·</span>
          <span>{table.section}</span>
        </div>

        <div className="mt-2">
          <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${badgeStyle}`}>
            {table.status}
          </span>
        </div>
      </div>

      {/* Bottom context (Reserved or Occupied) */}
      {hasExtraInfo && (
        <>
          <div className="mt-3 border-t border-slate-100 dark:border-slate-800" />
          <div className="mt-2 text-center">
            {table.status === 'reserved' && (
              <>
                <p className="truncate text-xs font-medium text-slate-900 dark:text-slate-100">
                  {table.reservedFor}
                </p>
                {table.reservationTime && (
                  <p className="text-amber-600 dark:text-amber-500 text-xs font-medium mt-0.5">
                    {table.reservationTime}
                  </p>
                )}
              </>
            )}

            {table.status === 'occupied' && (
              <p className="text-slate-500 dark:text-slate-400 truncate text-xs font-mono">
                {table.currentOrderId}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FloorPlanTableCard;
