import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { DietaryFilter } from './types';
import { SquareDot } from './posIcons';
import { useLanguage } from '../../i18n';

interface POSDietaryFilterProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedDietary: DietaryFilter;
  onDietaryChange: (val: DietaryFilter) => void;
}

export const POSDietaryFilter: React.FC<POSDietaryFilterProps> = ({
  search,
  onSearchChange,
  selectedDietary,
  onDietaryChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 shrink-0">
      {/* Search Input Box */}
      <div className="relative w-44 sm:w-56 h-8 bg-slate-100/70 dark:bg-slate-800/70 rounded-2xl flex items-center px-2.5 gap-2 border border-transparent focus-within:border-slate-300 dark:focus-within:border-slate-600 transition-all">
        <FiSearch className="size-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('pos.searchPlaceholder', 'Search items, barcode…')}
          className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <FiX className="size-3" />
          </button>
        )}
      </div>

      {/* Veg Button */}
      <button
        type="button"
        onClick={() => onDietaryChange(selectedDietary === 'Veg' ? 'All' : 'Veg')}
        className={`h-7 px-3 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
          selectedDietary === 'Veg'
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50'
        }`}
      >
        <SquareDot color="#16a34a" />
        <span>{t('pos.veg', 'Veg')}</span>
      </button>

      {/* Non-Veg Button */}
      <button
        type="button"
        onClick={() => onDietaryChange(selectedDietary === 'Non-Veg' ? 'All' : 'Non-Veg')}
        className={`h-7 px-3 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
          selectedDietary === 'Non-Veg'
            ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50'
        }`}
      >
        <SquareDot color="#dc2626" />
        <span>{t('pos.nonVeg', 'Non-Veg')}</span>
      </button>

      {/* Egg Button */}
      <button
        type="button"
        onClick={() => onDietaryChange(selectedDietary === 'Egg' ? 'All' : 'Egg')}
        className={`h-7 px-3 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
          selectedDietary === 'Egg'
            ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50'
        }`}
      >
        <SquareDot color="#d97706" />
        <span>{t('pos.egg', 'Egg')}</span>
      </button>
    </div>
  );
};
