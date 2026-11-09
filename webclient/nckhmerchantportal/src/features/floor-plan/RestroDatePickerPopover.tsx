import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../../components/ui/popover';

interface RestroDatePickerPopoverProps {
  selectedDate: string; // 'YYYY-MM-DD'
  onChange: (date: string) => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const RestroDatePickerPopover: React.FC<RestroDatePickerPopoverProps> = ({
  selectedDate,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Parse current selected date
  const parsed = React.useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      return {
        year: parseInt(parts[0], 10),
        month: parseInt(parts[1], 10) - 1, // 0-indexed
        day: parseInt(parts[2], 10),
      };
    }
    return { year: 2026, month: 9, day: 3 };
  }, [selectedDate]);

  // Current viewing month and year in the popover
  const [viewYear, setViewYear] = useState(parsed.year);
  const [viewMonth, setViewMonth] = useState(parsed.month);

  // Sync view when selectedDate changes
  React.useEffect(() => {
    setViewYear(parsed.year);
    setViewMonth(parsed.month);
  }, [parsed.year, parsed.month]);

  // Format label for button: "03 Oct 2026"
  const formattedButtonLabel = React.useMemo(() => {
    const d = new Date(parsed.year, parsed.month, parsed.day);
    const dayStr = String(parsed.day).padStart(2, '0');
    const monthShort = MONTH_NAMES[parsed.month]?.slice(0, 3) || 'Oct';
    return `${dayStr} ${monthShort} ${parsed.year}`;
  }, [parsed]);

  // Navigation
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Generate calendar days
  const calendarCells = React.useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: {
      key: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isSelected: boolean;
      dateString: string;
    }[] = [];

    // Prev month padding
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(
        dayNum
      ).padStart(2, '0')}`;
      cells.push({
        key: `prev-${dayNum}`,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isSelected: false,
        dateString: dateStr,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(
        day
      ).padStart(2, '0')}`;
      const isSelected =
        viewYear === parsed.year &&
        viewMonth === parsed.month &&
        day === parsed.day;

      cells.push({
        key: `curr-${day}`,
        dayNumber: day,
        isCurrentMonth: true,
        isSelected,
        dateString: dateStr,
      });
    }

    // Next month padding to complete 35 or 42 cells
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(
        day
      ).padStart(2, '0')}`;
      cells.push({
        key: `next-${day}`,
        dayNumber: day,
        isCurrentMonth: false,
        isSelected: false,
        dateString: dateStr,
      });
    }

    return cells;
  }, [viewYear, viewMonth, parsed]);

  const handleSelectDay = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-8 px-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <CalendarIcon className="size-3.5 text-slate-500" />
          <span>{formattedButtonLabel}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[280px] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Month Header with < Month Year > */}
        <div className="flex items-center justify-between px-1 pb-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="size-7 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </button>

          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="size-7 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Weekday headers: Su Mo Tu We Th Fr Sa */}
        <div className="grid grid-cols-7 mb-1 text-center">
          {WEEKDAY_NAMES.map((wkd) => (
            <div
              key={wkd}
              className="text-[11px] font-medium text-slate-400 dark:text-slate-500 py-1"
            >
              {wkd}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center">
          {calendarCells.map((cell) => {
            if (!cell.isCurrentMonth) {
              return (
                <div
                  key={cell.key}
                  className="size-7 flex items-center justify-center mx-auto text-xs text-slate-300 dark:text-slate-600 select-none"
                >
                  {cell.dayNumber}
                </div>
              );
            }

            if (cell.isSelected) {
              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => handleSelectDay(cell.dateString)}
                  className="size-7 rounded-full bg-orange-600 text-white font-semibold text-xs flex items-center justify-center mx-auto shadow-2xs cursor-pointer active:scale-95 transition-transform"
                >
                  {cell.dayNumber}
                </button>
              );
            }

            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => handleSelectDay(cell.dateString)}
                className="size-7 rounded-full text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center mx-auto transition-colors cursor-pointer"
              >
                {cell.dayNumber}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RestroDatePickerPopover;
