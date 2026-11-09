import React from 'react';
import { Calendar, Users } from 'lucide-react';
import { Reservation } from '../../types/restaurant';
import { useRestaurantStore } from '../../stores/restaurantStore';
import { useLanguage } from '../../i18n';
import toast from '../../utils/toast';

interface UpcomingReservationsSectionProps {
  onEditReservation: (res: Reservation) => void;
}

function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':').map(Number);
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    const hours = parts[0];
    const minutes = parts[1];
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  }
  return timeStr;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  } catch {}
  return dateStr;
}

export const UpcomingReservationsSection: React.FC<UpcomingReservationsSectionProps> = ({
  onEditReservation,
}) => {
  const { reservations, tables, selectedDate, updateReservation, updateTableStatus } = useRestaurantStore();
  const { t } = useLanguage();

  // Filter reservations by selected date and status (upcoming or seated), matching RestroPOS
  const filtered = reservations
    .filter(
      (res) =>
        (res.date === selectedDate || res.dateTime?.includes(selectedDate)) &&
        (res.status === 'upcoming' || res.status === 'seated')
    )
    .sort((a, b) => {
      const timeA = `${a.date}T${a.time}`;
      const timeB = `${b.date}T${b.time}`;
      return timeA.localeCompare(timeB);
    })
    .slice(0, 8);

  // If no reservations on this date, show fallback or null
  if (filtered.length === 0) {
    return null;
  }

  const handleSeatGuest = (res: Reservation) => {
    updateReservation(res.id, { status: 'seated' });

    // Link and update the corresponding table status to occupied
    if (res.tableId) {
      const matchNum = res.tableId.match(/\d+/);
      if (matchNum) {
        const num = parseInt(matchNum[0], 10);
        const table = tables.find((t) => t.number === num);
        if (table) {
          updateTableStatus(table.id, 'occupied', {
            reservedFor: res.guestName,
            reservationTime: res.time,
          });
        }
      }
    }

    toast.success(
      t('restaurant.guestSeated', {
        name: res.guestName,
        table: res.tableId,
        defaultValue: `Seated ${res.guestName} at ${res.tableId}`,
      })
    );
  };

  return (
    <div className="space-y-3 pt-2">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">
        Upcoming Reservations
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((res) => {
          const isUpcoming = res.status === 'upcoming';
          const tableDisplay = res.tableId ? ` · ${res.tableId}` : '';

          return (
            <div
              key={res.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              {/* Header: Name, Phone & Status Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-sm text-slate-900 dark:text-white">
                    {res.guestName}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 truncate text-xs mt-0.5">
                    {res.phone}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    res.status === 'seated'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                  }`}
                >
                  {res.status}
                </span>
              </div>

              {/* Date, Time, Party & Table Info */}
              <div className="text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5 shrink-0" />
                  <span>
                    {formatDate(res.date)} · {formatTime(res.time)}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-3.5 shrink-0" />
                  <span>
                    {res.partySize} guests{tableDisplay}
                  </span>
                </span>
              </div>

              {/* Notes */}
              {res.notes && (
                <p className="text-slate-500 dark:text-slate-400 line-clamp-1 text-xs">
                  {res.notes}
                </p>
              )}

              {/* Actions */}
              <div className="mt-auto flex gap-2 pt-1">
                {isUpcoming && (
                  <button
                    type="button"
                    onClick={() => handleSeatGuest(res)}
                    className="h-7 flex-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    Seat Guest
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onEditReservation(res)}
                  className="h-7 flex-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingReservationsSection;
