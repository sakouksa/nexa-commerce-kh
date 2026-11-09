import React, { useState } from 'react';
import { Calendar, Clock, Users, Phone, User, FileText } from 'lucide-react';
import { useRestaurantStore } from '../../stores/restaurantStore';
import { useLanguage } from '../../i18n';
import toast from '../../utils/toast';
import { Modal, ModalFooter } from '../../components/ui';

interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTableId?: string;
}

export const NewReservationModal: React.FC<NewReservationModalProps> = ({
  isOpen,
  onClose,
  defaultTableId,
}) => {
  const { tables, addReservation } = useRestaurantStore();
  const { t } = useLanguage();

  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('2026-10-02');
  const [time, setTime] = useState('19:30');
  const [partySize, setPartySize] = useState('4');
  const [tableId, setTableId] = useState(defaultTableId || 'Table 1');
  const [durationMinutes, setDurationMinutes] = useState('90');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!guestName.trim()) {
      toast.error(t('restaurant.guestNameRequired', 'Guest name is required'));
      return;
    }

    addReservation({
      guestName: guestName.trim(),
      phone: phone.trim() || '+855 12 345 678',
      date,
      time,
      dateTime: `${date}, ${time}`,
      partySize: Number(partySize) || 2,
      tableId,
      durationMinutes: Number(durationMinutes) || 90,
      status: 'upcoming',
      notes: notes.trim(),
    });

    toast.success(t('restaurant.reservationCreated', 'Reservation created successfully!'));
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      icon={<Calendar className="size-5" />}
      iconVariant="orange"
      title={t('restaurant.newReservation', 'New Reservation')}
      subtitle={t('restaurant.bookTableSubtitle', 'Book a table for upcoming restaurant guests')}
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          cancelLabel={t('common.cancel', 'Cancel')}
          submitLabel={t('restaurant.confirmReservation', 'Confirm Reservation')}
          confirmIcon={<Calendar className="size-3.5" />}
        />
      }
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Guest Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="size-3.5 text-slate-400" />
              <span>{t('restaurant.guestName', 'Guest Name')}</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Sophy Chen"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="size-3.5 text-slate-400" />
              <span>{t('restaurant.phone', 'Phone Number')}</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +855 12 889 900"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="size-3.5 text-slate-400" />
              <span>{t('restaurant.date', 'Date')}</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="size-3.5 text-slate-400" />
              <span>{t('restaurant.time', 'Time')}</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Party Size & Table Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Users className="size-3.5 text-slate-400" />
              <span>{t('restaurant.partySize', 'Number of Guests')}</span>
            </label>
            <select
              value={partySize}
              onChange={(e) => setPartySize(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-slate-900 dark:text-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16, 20].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('restaurant.assignedTable', 'Assigned Table')}
            </label>
            <select
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-slate-900 dark:text-white"
            >
              {tables.map((tbl) => (
                <option key={tbl.id} value={`Table ${tbl.number}`}>
                  Table {tbl.number} ({tbl.section} • {tbl.seats || 2} seats)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Clock className="size-3.5 text-slate-400" />
            <span>{t('restaurant.duration', 'Estimated Duration')}</span>
          </label>
          <select
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-slate-900 dark:text-white"
          >
            <option value="45">45 minutes</option>
            <option value="60">1 hour</option>
            <option value="90">1.5 hours (Standard)</option>
            <option value="120">2 hours</option>
            <option value="180">3 hours</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="size-3.5 text-slate-400" />
            <span>{t('restaurant.specialNotes', 'Special Notes (Optional)')}</span>
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Birthday celebration, window seat request, baby chair..."
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-slate-900 dark:text-white resize-none"
          />
        </div>
      </form>
    </Modal>
  );
};
export default NewReservationModal;
