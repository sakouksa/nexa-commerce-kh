import {
  Modal,
  LoadingSpinner,
  LoadingSpinnerProps,
  Table,
  DataTable,
  Column,
  Pagination,
} from './common';
import {
  StatCard,
  GlobalCard,
  FlattenCard,
  RibbonStatsCard,
  FlattenStatCard,
  MiniStatsCard,
} from './cards';
import { EmptyState } from './shared';

export {
  StatCard,
  Modal,
  Table,
  DataTable,
  Pagination,
  GlobalCard,
  FlattenCard,
  RibbonStatsCard,
  FlattenStatCard,
  MiniStatsCard,
};
export { Button } from './ui/button';
export type { Column } from './common';
export * from './cards';
export * from './ui/empty';

export function Loading(props?: LoadingSpinnerProps) {
  return <LoadingSpinner text="" className="py-20" {...props} />;
}

export const inputCls = "w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";
export const btnPrimary = "bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer";
export const btnDanger = "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer";
export const btnGhost = "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer";
