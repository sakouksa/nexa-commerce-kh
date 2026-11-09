import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../../components/ui/sheet';
import { ModalCloseButton } from '../../components/ui/modal-close-button';
import { useRestaurantStore } from '../../stores/restaurantStore';
import { Reservation, ReservationStatus } from '../../types/restaurant';
import { useLanguage } from '../../i18n';
import toast from '../../utils/toast';

interface EditReservationDrawerProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  defaultTableNumber?: number;
}

const DURATION_OPTIONS = [
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 },
  { label: '120 min', value: 120 },
  { label: '150 min', value: 150 },
  { label: '180 min', value: 180 },
];

const RESERVATION_STATUS_LIST: ReservationStatus[] = [
  'upcoming',
  'seated',
  'completed',
  'cancelled',
];

const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  upcoming: 'Upcoming',
  seated: 'Seated',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const RESERVATION_STATUS_STYLES: Record<ReservationStatus, string> = {
  upcoming: 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
  seated: 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  completed: 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  cancelled: 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
};

export const EditReservationDrawer: React.FC<EditReservationDrawerProps> = ({
  reservation,
  isOpen,
  onClose,
  defaultTableNumber,
}) => {
  const { tables, selectedDate, addReservation, updateReservation, updateTableStatus } = useRestaurantStore();
  const { t } = useLanguage();

  const isEditing = Boolean(reservation);

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [reservationDate, setReservationDate] = useState('2026-10-03');
  const [reservationTime, setReservationTime] = useState('19:30');
  const [partySize, setPartySize] = useState('2');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [duration, setDuration] = useState('90');
  const [status, setStatus] = useState<ReservationStatus>('upcoming');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (reservation) {
      setGuestName(reservation.guestName || '');
      setGuestPhone(reservation.phone || '');
      setReservationDate(reservation.date || selectedDate || '2026-10-03');
      setReservationTime(reservation.time || '19:30');
      setPartySize(String(reservation.partySize || 2));
      const matchNum = reservation.tableId ? reservation.tableId.replace(/[^0-9]/g, '') : '';
      setTableNumber(matchNum || '');
      setDuration(String(reservation.durationMinutes || 90));
      setStatus(reservation.status || 'upcoming');
      setNotes(reservation.notes || '');
      setErrors({});
    } else {
      setGuestName('');
      setGuestPhone('');
      setReservationDate(selectedDate || '2026-10-03');
      setReservationTime('19:30');
      setPartySize('2');
      setTableNumber(defaultTableNumber ? String(defaultTableNumber) : '');
      setDuration('90');
      setStatus('upcoming');
      setNotes('');
      setErrors({});
    }
  }, [reservation, isOpen, selectedDate, defaultTableNumber]);

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!guestName.trim()) newErrors.guestName = 'Guest name is required';
    if (!guestPhone.trim()) newErrors.guestPhone = 'Phone number is required';
    if (!reservationDate) newErrors.reservationDate = 'Date is required';
    if (!reservationTime) newErrors.reservationTime = 'Time is required';

    const pSize = parseInt(partySize, 10);
    if (!partySize || isNaN(pSize) || pSize < 1) {
      newErrors.partySize = 'Enter a valid party size';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const assignedTableNum = tableNumber ? parseInt(tableNumber, 10) : undefined;
    const tableIdDisplay = assignedTableNum ? `Table ${assignedTableNum}` : '';

    if (isEditing && reservation) {
      updateReservation(reservation.id, {
        guestName: guestName.trim(),
        phone: guestPhone.trim(),
        date: reservationDate,
        time: reservationTime,
        dateTime: `${reservationDate}, ${reservationTime}`,
        partySize: pSize,
        tableId: tableIdDisplay,
        durationMinutes: parseInt(duration, 10),
        status,
        notes: notes.trim() || undefined,
      });

      if (status === 'seated' && assignedTableNum) {
        const targetTable = tables.find((t) => t.number === assignedTableNum);
        if (targetTable) {
          updateTableStatus(targetTable.id, 'occupied', {
            reservedFor: guestName,
            reservationTime,
          });
        }
      }

      toast.success(t('restaurant.reservationUpdated', 'Reservation updated successfully'));
    } else {
      addReservation({
        guestName: guestName.trim(),
        phone: guestPhone.trim(),
        date: reservationDate,
        time: reservationTime,
        dateTime: `${reservationDate}, ${reservationTime}`,
        partySize: pSize,
        tableId: tableIdDisplay,
        durationMinutes: parseInt(duration, 10),
        status: 'upcoming',
        notes: notes.trim() || undefined,
      });

      toast.success(t('restaurant.reservationCreated', 'Reservation created successfully'));
    }

    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg h-full flex flex-col p-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800"
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <SheetTitle className="text-base font-semibold text-slate-900 dark:text-white">
            {isEditing ? 'Edit Reservation' : 'New Reservation'}
          </SheetTitle>
          <ModalCloseButton onClick={onClose} />
        </SheetHeader>

        {/* Form Body */}
        <div className="flex-1 space-y-0 overflow-y-auto">
          {/* Row 1: Guest Name & Phone */}
          <div className="grid grid-cols-2 gap-4 px-6 py-5">
            <div className="space-y-1.5">
              <label htmlFor="res-name" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Guest Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="res-name"
                placeholder="e.g. Johnson Family"
                value={guestName}
                onChange={(e) => {
                  setGuestName(e.target.value);
                  if (errors.guestName) setErrors((prev) => ({ ...prev, guestName: '' }));
                }}
                className="w-full h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              {errors.guestName && (
                <p className="text-rose-500 text-xs">{errors.guestName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="res-phone" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Phone <span className="text-rose-500">*</span>
              </label>
              <input
                id="res-phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={guestPhone}
                onChange={(e) => {
                  setGuestPhone(e.target.value.replace(/[^\d+\-() ]/g, ''));
                  if (errors.guestPhone) setErrors((prev) => ({ ...prev, guestPhone: '' }));
                }}
                className="w-full h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              {errors.guestPhone && (
                <p className="text-rose-500 text-xs">{errors.guestPhone}</p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* Row 2: Date & Time */}
          <div className="grid grid-cols-2 gap-4 px-6 py-5">
            <div className="space-y-1.5">
              <label htmlFor="res-date" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="res-date"
                type="date"
                value={reservationDate}
                onChange={(e) => {
                  setReservationDate(e.target.value);
                  if (errors.reservationDate) setErrors((prev) => ({ ...prev, reservationDate: '' }));
                }}
                className="w-full h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              {errors.reservationDate && (
                <p className="text-rose-500 text-xs">{errors.reservationDate}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="res-time" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Time <span className="text-rose-500">*</span>
              </label>
              <input
                id="res-time"
                type="time"
                value={reservationTime}
                onChange={(e) => {
                  setReservationTime(e.target.value);
                  if (errors.reservationTime) setErrors((prev) => ({ ...prev, reservationTime: '' }));
                }}
                className="w-full h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              {errors.reservationTime && (
                <p className="text-rose-500 text-xs">{errors.reservationTime}</p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* Row 3: Party Size & Table Selection */}
          <div className="grid grid-cols-2 gap-4 px-6 py-5">
            <div className="space-y-1.5">
              <label htmlFor="res-party" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Party Size <span className="text-rose-500">*</span>
              </label>
              <input
                id="res-party"
                type="number"
                min={1}
                max={50}
                placeholder="2"
                value={partySize}
                onChange={(e) => {
                  setPartySize(e.target.value);
                  if (errors.partySize) setErrors((prev) => ({ ...prev, partySize: '' }));
                }}
                className="w-full h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              {errors.partySize && (
                <p className="text-rose-500 text-xs">{errors.partySize}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="res-table" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Table
              </label>
              <select
                id="res-table"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
              >
                <option value="">No table assigned</option>
                {tables.map((t) => (
                  <option key={t.id} value={String(t.number)}>
                    Table {t.number} — {t.section} ({t.seats} seats)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* Row 4: Duration Options */}
          <div className="space-y-1.5 px-6 py-5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Duration</label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setDuration(String(opt.value))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    duration === String(opt.value)
                      ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 5: Status Grid (when editing) */}
          {isEditing && (
            <>
              <div className="border-t border-slate-100 dark:border-slate-800" />
              <div className="space-y-1.5 px-6 py-5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {RESERVATION_STATUS_LIST.map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setStatus(st)}
                      className={`h-auto rounded-lg border-2 py-2 px-3 text-xs font-medium capitalize transition-all cursor-pointer ${
                        status === st
                          ? `${RESERVATION_STATUS_STYLES[st]} border-current shadow-2xs`
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      {RESERVATION_STATUS_LABELS[st]}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* Row 6: Notes */}
          <div className="space-y-1.5 px-6 py-5">
            <label htmlFor="res-notes" className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Notes
            </label>
            <textarea
              id="res-notes"
              rows={3}
              placeholder="Special requests, dietary requirements…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="h-8 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium transition-colors cursor-pointer shadow-2xs"
          >
            {isEditing ? 'Save Changes' : 'Create Reservation'}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditReservationDrawer;
