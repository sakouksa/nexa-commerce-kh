import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Search,
  ChevronDown,
  Eye,
  Edit2,
  Trash2,
  Clock,
  Users,
  Utensils,
  Check,
} from 'lucide-react';
import { useRestaurantStore } from '../../stores/restaurantStore';
import { Reservation, ReservationStatus } from '../../types/restaurant';
import { NewReservationModal } from './NewReservationModal';
import { EditReservationDrawer } from './EditReservationDrawer';
import { useLanguage } from '../../i18n';
import toast from '../../utils/toast';
import { DataTableViewOptions, Pagination, Breadcrumbs } from '../../components/common';

export const ReservationsPage: React.FC = () => {
  const { reservations, deleteReservation, updateReservation, selectedDate } = useRestaurantStore();
  const { t } = useLanguage();

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'selected'>('selected');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingRes, setEditingRes] = useState<Reservation | null>(null);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    dateTime: true,
    partySize: true,
    table: true,
    duration: true,
    status: true,
  });

  const toggleColumn = (id: string) => {
    setVisibleColumns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        r.guestName.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.tableId.toLowerCase().includes(q);

      const matchDate = dateFilter === 'all' || r.date === selectedDate;
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;

      return matchSearch && matchDate && matchStatus;
    });
  }, [reservations, search, dateFilter, selectedDate, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(t('restaurant.confirmDeleteRes', `Cancel and delete reservation for ${name}?`))) {
      deleteReservation(id);
      toast.success(t('restaurant.resDeleted', 'Reservation deleted'));
    }
  };

  const statusBadge = {
    seated: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    upcoming: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
    completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    cancelled: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <Breadcrumbs />
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('restaurant.reservations', 'Reservations')}
          </h1>
          <span className="size-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center">
            {reservations.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsNewModalOpen(true)}
          style={{
            backgroundColor: 'var(--btn-primary-hex, var(--primary-hex, #ec4899))',
          }}
          className="h-9 px-3.5 rounded-lg hover:brightness-90 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:shadow active:scale-[0.98]"
        >
          <Plus className="size-3.5 stroke-[2.5]" />
          <span>{t('restaurant.newReservation', 'New Reservation')}</span>
        </button>
      </div>

      {/* KPI Stat Cards (SmartHR Design Pattern) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Total Bookings */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-panel">
          <div className="flex items-center justify-between mb-2">
            <div className="size-8.5 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center">
              <Calendar className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/30 text-orange-600">
              {t('restaurant.allBookings', 'ALL BOOKINGS')}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">
            {reservations.length}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t('restaurant.totalBookings', 'Total Bookings')}
          </p>
        </div>

        {/* Card 2: Seated & Upcoming */}
        <div className="p-4 rounded-xl border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] shadow-panel">
          <div className="flex items-center justify-between mb-2">
            <div className="size-8.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Utensils className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              {t('common.active', 'ACTIVE')}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#16292e] dark:text-[#e7ede9]">
            {reservations.filter((r) => r.status === 'seated' || r.status === 'upcoming').length}
          </div>
          <p className="text-xs text-[#71817e] font-medium mt-0.5">
            {t('restaurant.seatedUpcoming', 'Seated & Upcoming')}
          </p>
        </div>

        {/* Card 3: Total Guests */}
        <div className="p-4 rounded-xl border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] shadow-panel">
          <div className="flex items-center justify-between mb-2">
            <div className="size-8.5 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Users className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60">
              {t('restaurant.guests', 'GUESTS')}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#16292e] dark:text-[#e7ede9]">
            {reservations.reduce((sum, r) => sum + (r.partySize || 0), 0)}
          </div>
          <p className="text-xs text-[#71817e] font-medium mt-0.5">
            {t('restaurant.totalGuests', 'Total Guests')}
          </p>
        </div>
      </div>

      {/* SmartHR Employee Table Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5 p-3 sm:p-3.5 rounded-xl border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] shadow-panel font-sans">
        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setDateFilter('all');
              setCurrentPage(1);
            }}
            className={`h-9 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              dateFilter === 'all'
                ? 'border-[#ea580c] bg-[#ea580c] text-white shadow-xs'
                : 'border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] text-[#71817e] dark:text-[#a0b0ad] hover:bg-[#f7f8f2]'
            }`}
          >
            All Dates
          </button>
          <button
            type="button"
            onClick={() => {
              setDateFilter('selected');
              setCurrentPage(1);
            }}
            className={`h-9 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              dateFilter === 'selected'
                ? 'border-[#ea580c] bg-[#ea580c] text-white shadow-xs'
                : 'border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] text-[#71817e] dark:text-[#a0b0ad] hover:bg-[#f7f8f2]'
            }`}
          >
            <Calendar className="size-3" />
            <span>02 Oct 2026</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64 md:w-72">
          <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t('restaurant.searchGuest', 'Search guest name...')}
            className="h-9 w-full pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 appearance-none cursor-pointer focus:outline-none focus:border-orange-500 transition-all"
          >
            <option value="all">All statuses</option>
            <option value="seated">Seated</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Apply Button */}
        <button
          type="button"
          onClick={() => {
            setCurrentPage(1);
          }}
          style={{
            backgroundColor: 'var(--btn-primary-hex, var(--primary-hex, #ec4899))',
          }}
          className="h-9 px-3.5 rounded-lg hover:brightness-90 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Check className="size-3.5 stroke-[2.5]" />
          <span>{t('buttons.apply', t('common.apply', 'Apply'))}</span>
        </button>

        {/* Reset Button */}
        <button
          type="button"
          onClick={() => {
            setSearch('');
            setStatusFilter('all');
            setDateFilter('all');
            setCurrentPage(1);
          }}
          className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {t('buttons.reset', t('common.reset', 'Reset'))}
        </button>

        {/* View / Column Visibility Toggle (Placed at the very far right) */}
        <div className="ml-auto">
          <DataTableViewOptions
            columns={[
              { id: 'dateTime', label: t('restaurant.dateTime', 'Date & Time'), visible: visibleColumns.dateTime },
              { id: 'partySize', label: t('restaurant.partySize', 'Party Size'), visible: visibleColumns.partySize },
              { id: 'table', label: t('restaurant.table', 'Table'), visible: visibleColumns.table },
              { id: 'duration', label: t('restaurant.duration', 'Duration'), visible: visibleColumns.duration },
              { id: 'status', label: t('restaurant.status', 'Status'), visible: visibleColumns.status },
            ]}
            onToggleColumn={toggleColumn}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] shadow-panel overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[11px] bg-slate-50/50 dark:bg-slate-800/50">
                <th className="py-3.5 px-4">{t('restaurant.guest', 'Guest')}</th>
                {visibleColumns.dateTime && <th className="py-3.5 px-4">{t('restaurant.dateTime', 'Date & Time')}</th>}
                {visibleColumns.partySize && <th className="py-3.5 px-4">{t('restaurant.partySize', 'Party Size')}</th>}
                {visibleColumns.table && <th className="py-3.5 px-4">{t('restaurant.table', 'Table')}</th>}
                {visibleColumns.duration && <th className="py-3.5 px-4">{t('restaurant.duration', 'Duration')}</th>}
                {visibleColumns.status && <th className="py-3.5 px-4">{t('restaurant.status', 'Status')}</th>}
                <th className="py-3.5 px-4 text-right">{t('restaurant.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginated.map((res) => (
                <tr
                  key={res.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {/* Guest */}
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {res.guestName}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {res.phone}
                    </p>
                  </td>

                  {/* Date & Time */}
                  {visibleColumns.dateTime && (
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {res.date}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {res.time}
                      </p>
                    </td>
                  )}

                  {/* Party Size */}
                  {visibleColumns.partySize && (
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {res.partySize} guests
                    </td>
                  )}

                  {/* Table */}
                  {visibleColumns.table && (
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {res.tableId}
                    </td>
                  )}

                  {/* Duration */}
                  {visibleColumns.duration && (
                    <td className="py-3.5 px-4 text-slate-500">
                      {res.durationMinutes} min
                    </td>
                  )}

                  {/* Status */}
                  {visibleColumns.status && (
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          statusBadge[res.status]
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>
                  )}

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          toast.info(`${res.guestName} (${res.partySize} guests) at ${res.tableId}`);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        title={t('restaurant.view', 'View')}
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingRes(res)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        title={t('common.edit', 'Edit')}
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(res.id, res.guestName)}
                        className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title={t('restaurant.delete', 'Delete')}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={2 + Object.values(visibleColumns).filter(Boolean).length}
                    className="py-12 text-center text-slate-400 text-sm"
                  >
                    {t('restaurant.noReservationsFound', 'No reservations match your filter')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Standardized SmartHR Pagination Footer */}
        {filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            itemLabel={t('restaurant.reservations', 'reservations')}
          />
        )}
      </div>

      {/* New Reservation Modal */}
      <NewReservationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      {/* Edit Reservation Drawer */}
      <EditReservationDrawer
        reservation={editingRes}
        isOpen={Boolean(editingRes)}
        onClose={() => setEditingRes(null)}
      />
    </div>
  );
};

export default ReservationsPage;
