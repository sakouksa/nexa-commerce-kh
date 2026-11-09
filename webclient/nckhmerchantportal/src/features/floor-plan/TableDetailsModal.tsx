import React, { useState, useEffect } from 'react';
import { Phone, Clock, Users, Utensils } from 'lucide-react';
import { RestaurantTable, TableStatus, Reservation } from '../../types/restaurant';
import { useRestaurantStore } from '../../stores/restaurantStore';
import { useLanguage } from '../../i18n';
import toast from '../../utils/toast';
import { Modal, ModalFooter } from '../../components/ui';

interface TableDetailsModalProps {
  table: RestaurantTable | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReservationModal?: (tableId: string) => void;
  onEditReservation?: (reservation: Reservation) => void;
}

const TABLE_STATUS_LIST: TableStatus[] = ['available', 'occupied', 'reserved', 'cleaning'];

const TABLE_STATUS_LABELS: Record<TableStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
  cleaning: 'Cleaning',
};

const TABLE_STATUS_STYLES: Record<TableStatus, string> = {
  available: 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  occupied: 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
  reserved: 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  cleaning: 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
};

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

export const TableDetailsModal: React.FC<TableDetailsModalProps> = ({
  table,
  isOpen,
  onClose,
  onEditReservation,
}) => {
  const { reservations, updateTableStatus, updateReservation } = useRestaurantStore();
  const { t } = useLanguage();

  const [status, setStatus] = useState<TableStatus>('available');
  const [reservedFor, setReservedFor] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (table) {
      setStatus(table.status);
      setReservedFor(table.reservedFor || '');
      setReservationTime(table.reservationTime || '');
      setOrderId(table.currentOrderId || '');
    }
  }, [table]);

  if (!isOpen || !table) return null;

  // Find active or upcoming reservation for this table
  const activeReservation = reservations.find(
    (r) =>
      (r.tableId === table.id || r.tableId === `Table ${table.number}`) &&
      (r.status === 'upcoming' || r.status === 'seated')
  );

  const formattedCode = `T-${String(table.number).padStart(2, '0')}`;

  const handleSeatGuest = () => {
    if (activeReservation) {
      updateReservation(activeReservation.id, { status: 'seated' });
      updateTableStatus(table.id, 'occupied', {
        reservedFor: activeReservation.guestName,
        reservationTime: activeReservation.time,
      });
      toast.success(t('restaurant.guestsSeated', `Seated ${activeReservation.guestName} at Table ${table.number}`));
      onClose();
    }
  };

  const handleSaveStatus = () => {
    const extra: Partial<RestaurantTable> = {};
    if (status === 'reserved') {
      extra.reservedFor = reservedFor.trim() || undefined;
      extra.reservationTime = reservationTime.trim() || undefined;
    } else if (status === 'occupied') {
      extra.currentOrderId = orderId.trim() || undefined;
    }

    updateTableStatus(table.id, status, extra);
    toast.success(t('restaurant.statusSaved', `Table ${table.number} status updated to ${status}`));
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen && !!table}
      onClose={onClose}
      size="md"
      icon={<Utensils className="size-5" />}
      iconVariant="orange"
      title={`Table ${table.number} — ${formattedCode}`}
      subtitle={`${table.section} • ${table.seats || 2} seats`}
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSaveStatus}
          cancelLabel={t('common.cancel', 'Cancel')}
          submitLabel={t('restaurant.saveStatus', 'Save Status')}
          submitVariant="primary"
        />
      }
    >
      <div className="p-6 space-y-4">
        {/* Active Reservation Block */}
        {activeReservation && (
          <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-white">
                  {activeReservation.guestName}
                </p>
                <div className="text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  <span className="flex items-center gap-1">
                    <Phone className="size-3" />
                    {activeReservation.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatTime(activeReservation.time)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3" />
                    {activeReservation.partySize} guests
                  </span>
                </div>
              </div>

              <span
                className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  activeReservation.status === 'seated'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                }`}
              >
                {activeReservation.status}
              </span>
            </div>

            {/* Quick Actions for Active Reservation */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              {activeReservation.status === 'upcoming' && (
                <button
                  type="button"
                  onClick={handleSeatGuest}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                >
                  Seat Guests
                </button>
              )}
              {onEditReservation && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditReservation(activeReservation);
                  }}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Edit Booking
                </button>
              )}
            </div>
          </div>
        )}

        {/* Change Status Section */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t('restaurant.changeStatus', 'Change Status')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TABLE_STATUS_LIST.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`h-9 px-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-center cursor-pointer ${
                  status === s
                    ? `${TABLE_STATUS_STYLES[s]} font-semibold ring-2 ring-offset-1 ring-orange-500/20`
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {TABLE_STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Reserved Input Fields */}
          {status === 'reserved' && (
            <div className="space-y-2 pt-1">
              <div>
                <label htmlFor="reserved-for" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Guest Name
                </label>
                <input
                  id="reserved-for"
                  type="text"
                  placeholder="e.g. Sarah Connor"
                  value={reservedFor}
                  onChange={(e) => setReservedFor(e.target.value)}
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <div>
                <label htmlFor="reservation-time" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Reservation Time
                </label>
                <input
                  id="reservation-time"
                  type="text"
                  placeholder="e.g. 19:30"
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>
          )}

          {/* Occupied Input Fields */}
          {status === 'occupied' && (
            <div className="space-y-1.5 pt-1">
              <label htmlFor="order-id" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Order ID (optional)
              </label>
              <input
                id="order-id"
                type="text"
                placeholder="e.g. #ORD-042"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-mono"
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TableDetailsModal;
