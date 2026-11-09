import React, { ReactNode } from 'react';
import { Empty, EmptyProps } from './common/Empty';
import { LoadingSpinner, type LoadingSpinnerProps } from './common/LoadingSpinner';
import { ModalCloseButton } from './ui/modal-close-button';

export * from './ui/modal-close-button';
export * from './common/Empty';
export * from './common/Table';
export * from './common/Pagination';
export * from './common/Button';
export * from './common/Input';
export * from './common/Badge';
export * from './common/Card';
export * from './common/DropdownMenu';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
}

export function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 flex items-center gap-4 transition-all">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}

export * from './ui/modal';

export function Loading(props?: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <LoadingSpinner size="lg" {...props} />
    </div>
  );
}

// Export Empty directly
export { Empty };

export const inputCls =
  'w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[var(--primary-hex,#ec4899)]/20 focus:border-[var(--primary-hex,#ec4899)] transition-all outline-none';
export const btnPrimary =
  'bg-[var(--btn-primary-hex,var(--primary-hex,#ec4899))] hover:brightness-90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5 active:translate-y-px';
export const btnDanger =
  'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5 active:translate-y-px';
export const btnGhost =
  'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-2xs cursor-pointer inline-flex items-center justify-center gap-1.5 active:translate-y-px';
export const btnSuccess =
  'bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5 active:translate-y-px';
