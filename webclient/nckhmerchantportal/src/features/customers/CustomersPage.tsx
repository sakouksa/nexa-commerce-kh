import React, { useEffect, useState, useMemo } from 'react';
import toast from '../../utils/toast';
import { Search, ChevronDown, Users, UserPlus, UserCheck, Check, DollarSign } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../i18n';
import { DataTableViewOptions } from '../../components/common';
import { GlobalFormat } from '../../utils/GlobalFormat';
import { Customer, CustomerFormData } from './customer.types';
import { customerService } from '../../services/customerService';
import { CustomerTable } from './CustomerTable';
import { CustomerForm } from './CustomerForm';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import {
  CustomerHeaderActions,
  CustomerDeleteDialog,
  CustomerDetailModal,
} from './CustomerActions';

const initialForm: CustomerFormData = {
  name: '',
  phone: '',
  telegram: '',
  email: '',
  city: '',
  address: '',
  notes: '',
};

export default function CustomersPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Controls
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    phone: true,
    telegram: true,
    orders: true,
    spent: true,
    createdAt: true,
  });

  const toggleColumn = (id: string) => {
    setVisibleColumns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Sorting
  const [sortAsc, setSortAsc] = useState(true);
  const [sortField, setSortField] = useState<'index' | 'name' | 'orders' | 'spent' | 'date'>('index');

  // Actions Dropdown & Modals state
  const [openDropdownId, setOpenDropdownId] = useState<number | string | null>(null);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>(initialForm);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    if (!user?.shop_id) return;
    setLoading(true);
    customerService
      .list(user.shop_id, search)
      .then(setCustomers)
      .catch((err) => {
        toast.error(err?.response?.data?.detail || t('customers.loadFailed', 'Failed to load customers'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [user?.shop_id, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType, pageSize]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.action-dropdown-container')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const openAdd = () => {
    setEditing(null);
    setFormData(initialForm);
    setFormModalOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setFormData({
      name: c.name || '',
      phone: c.phone || '',
      telegram: c.telegram ? c.telegram.replace('@', '') : '',
      email: c.email || '',
      city: c.city || '',
      address: c.address || '',
      notes: c.notes || '',
    });
    setFormModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.shop_id) return;

    if (!formData.name.trim()) {
      toast.error(t('customers.nameRequired', 'Customer name is required'));
      return;
    }
    if (!formData.phone.trim()) {
      toast.error(t('customers.phoneRequired', 'Phone number is required'));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        telegram: formData.telegram.trim()
          ? formData.telegram.trim().startsWith('@')
            ? formData.telegram.trim()
            : `@${formData.telegram.trim()}`
          : '',
        email: formData.email.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        notes: formData.notes.trim(),
      };

      if (editing) {
        await customerService.update(editing.id, payload);
        toast.success(t('customers.updatedSuccess', 'Customer updated successfully'));
      } else {
        await customerService.create({ shop_id: user.shop_id, ...payload });
        toast.success(t('customers.createdSuccess', 'Customer created successfully'));
      }

      setFormModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail || err?.response?.data?.message || t('customers.saveFailed', 'Failed to save customer')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;
    setDeleting(true);
    try {
      await customerService.delete(customerToDelete.id);
      toast.success(t('customers.deletedSuccess', 'Customer deleted successfully'));
      setCustomerToDelete(null);
      if (selected?.id === customerToDelete.id) {
        setSelected(null);
      }
      load();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail || err?.response?.data?.message || t('customers.deleteFailed', 'Failed to delete customer')
      );
    } finally {
      setDeleting(false);
    }
  };

  // Sorting helper
  const handleSort = (field: 'index' | 'name' | 'orders' | 'spent' | 'date') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filtered and Sorted customers
  const filteredData = useMemo(() => {
    let list = customers.filter((c) => {
      const orderCount = c.total_orders ?? c.order_count ?? 0;
      if (filterType === 'has_orders') return orderCount > 0;
      if (filterType === 'no_orders') return orderCount === 0;
      return true;
    });

    list.sort((a, b) => {
      if (sortField === 'name') {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
      if (sortField === 'orders') {
        const orderA = a.total_orders ?? a.order_count ?? 0;
        const orderB = b.total_orders ?? b.order_count ?? 0;
        return sortAsc ? orderA - orderB : orderB - orderA;
      }
      if (sortField === 'spent') {
        const spentA = a.total_spent ?? 0;
        const spentB = b.total_spent ?? 0;
        return sortAsc ? spentA - spentB : spentB - spentA;
      }
      if (sortField === 'date') {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return sortAsc ? dateA - dateB : dateB - dateA;
      }
      return sortAsc ? a.id - b.id : b.id - a.id;
    });

    return list;
  }, [customers, filterType, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Metrics KPI summary
  const totalCustomers = customers.length;
  const activeBuyers = customers.filter((c) => (c.total_orders ?? c.order_count ?? 0) > 0).length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <Breadcrumbs />
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('customers.title', 'Customers')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('customers.subtitle', 'Manage your customer database, order history, and contact details')}
          </p>
        </div>

        <CustomerHeaderActions onAdd={openAdd} />
      </div>

      {/* KPI Stat Cards (SmartHR Design Pattern) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Total Customers */}
        <div className="p-4 rounded-xl border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] shadow-panel">
          <div className="flex items-center justify-between mb-2">
            <div className="size-8.5 rounded-lg bg-[#ea580c]/10 dark:bg-[#ea580c]/20 text-[#ea580c] flex items-center justify-center">
              <Users className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#fff7ed] dark:bg-[#1a3437] text-[#ea580c]">
              {t('customers.allClients', 'ALL CLIENTS')}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#16292e] dark:text-[#e7ede9]">
            {totalCustomers}
          </div>
          <p className="text-xs text-[#71817e] font-medium mt-0.5">
            {t('customers.totalCustomers', 'Total Customers')}
          </p>
        </div>

        {/* Card 2: Active Buyers */}
        <div className="p-4 rounded-xl border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] shadow-panel">
          <div className="flex items-center justify-between mb-2">
            <div className="size-8.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              {t('common.active', 'ACTIVE')}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#16292e] dark:text-[#e7ede9]">
            {activeBuyers}
          </div>
          <p className="text-xs text-[#71817e] font-medium mt-0.5">
            {t('customers.activeBuyers', 'Active Buyers')}
          </p>
        </div>

        {/* Card 3: Total Revenue */}
        <div className="p-4 rounded-xl border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] shadow-panel">
          <div className="flex items-center justify-between mb-2">
            <div className="size-8.5 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <DollarSign className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60">
              {t('customers.revenue', 'REVENUE')}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#16292e] dark:text-[#e7ede9]">
            {GlobalFormat.currency(totalRevenue)}
          </div>
          <p className="text-xs text-[#71817e] font-medium mt-0.5">
            {t('customers.totalRevenue', 'Total Revenue')}
          </p>
        </div>
      </div>

      {/* SmartHR Employee Table Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-panel font-sans">
        {/* Search Input */}
        <div className="relative w-full sm:w-64 md:w-72">
          <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search', 'Search name, phone, telegram...')}
            className="h-9 w-full pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
        </div>

        {/* Activity Filter Dropdown */}
        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 appearance-none cursor-pointer focus:outline-none focus:border-orange-500 transition-all"
          >
            <option value="all">{t('customers.allCustomers', 'All Customers')}</option>
            <option value="has_orders">{t('customers.hasOrders', 'Has Placed Orders')}</option>
            <option value="no_orders">{t('customers.noOrders', 'No Orders Yet')}</option>
          </select>
          <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Apply Button */}
        <button
          type="button"
          onClick={() => {
            load();
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
            setFilterType('all');
            setCurrentPage(1);
          }}
          className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {t('buttons.reset', t('common.reset', 'Reset'))}
        </button>

        {/* Column Visibility (Placed at the very far right) */}
        <div className="ml-auto">
          <DataTableViewOptions
            columns={[
              { id: 'phone', label: t('customers.phone', 'Phone'), visible: Boolean(visibleColumns.phone) },
              { id: 'telegram', label: t('customers.telegram', 'Telegram'), visible: Boolean(visibleColumns.telegram) },
              { id: 'orders', label: t('customers.orders', 'Orders'), visible: Boolean(visibleColumns.orders) },
              { id: 'spent', label: t('customers.spent', 'Spent'), visible: Boolean(visibleColumns.spent) },
              { id: 'createdAt', label: t('customers.joined', 'Joined'), visible: Boolean(visibleColumns.createdAt) },
            ]}
            onToggleColumn={toggleColumn}
          />
        </div>
      </div>

      {/* Customer Table Component */}
      <CustomerTable
        customers={paginatedData}
        totalEntries={filteredData.length}
        loading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        sortAsc={sortAsc}
        sortField={sortField}
        visibleColumns={visibleColumns}
        openDropdownId={openDropdownId}
        onSort={handleSort}
        onDropdownToggle={(id) => setOpenDropdownId(openDropdownId === id ? null : id)}
        onView={setSelected}
        onEdit={openEdit}
        onDelete={(c) => {
          setOpenDropdownId(null);
          setCustomerToDelete(c);
        }}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
      />

      {/* Customer Form Modal */}
      <CustomerForm
        isOpen={formModalOpen}
        isSaving={saving}
        editingCustomer={editing}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Customer Delete Dialog */}
      <CustomerDeleteDialog
        customer={customerToDelete}
        isDeleting={deleting}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDelete}
      />

      {/* Customer View Details Modal */}
      <CustomerDetailModal
        customer={selected}
        onClose={() => setSelected(null)}
        onEdit={openEdit}
      />
    </div>
  );
}
