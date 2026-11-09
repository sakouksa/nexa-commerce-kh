import React from 'react';
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  Plus,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Download,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Customer } from './customer.types';
import { useLanguage } from '../../i18n';
import { GlobalFormat } from '../../utils/GlobalFormat';

interface CustomerRowActionsProps {
  customer: Customer;
  isOpen: boolean;
  onToggle: () => void;
  onView: (c: Customer) => void;
  onEdit: (c: Customer) => void;
  onDelete: (c: Customer) => void;
}

export const CustomerRowActions: React.FC<CustomerRowActionsProps> = ({
  customer,
  isOpen,
  onToggle,
  onView,
  onEdit,
  onDelete,
}) => {
  const { t } = useLanguage();

  return (
    <div className="relative flex items-center justify-end gap-1 action-dropdown-container">
      {/* Quick View Icon Button */}
      <button
        type="button"
        onClick={() => onView(customer)}
        title={t('common.view', 'View Details')}
        className="size-7.5 rounded-lg flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <Eye className="size-3.5" />
      </button>

      {/* Quick Edit Icon Button */}
      <button
        type="button"
        onClick={() => onEdit(customer)}
        title={t('common.edit', 'Edit')}
        className="size-7.5 rounded-lg flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <Edit2 className="size-3.5" />
      </button>

      {/* More / Delete Menu */}
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          title={t('common.more', 'More Options')}
          className="size-7.5 rounded-lg flex items-center justify-center text-[#71817e] hover:text-[#16292e] dark:hover:text-[#e7ede9] hover:bg-[#eef2ee] dark:hover:bg-[#1f373b] transition-colors cursor-pointer"
        >
          <MoreHorizontal className="size-3.5" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-8 z-30 w-36 py-1 bg-white dark:bg-[#16292e] rounded-xl shadow-lg border border-[#dfe7df] dark:border-[#2a4245] animate-in fade-in zoom-in-95 duration-100">
            <button
              type="button"
              onClick={() => {
                onToggle();
                onView(customer);
              }}
              className="w-full px-3 py-1.5 text-xs text-left text-[#16292e] dark:text-[#e7ede9] hover:bg-[#f7f8f2] dark:hover:bg-[#1d3539] flex items-center gap-2 cursor-pointer"
            >
              <Eye className="size-3.5 text-[#71817e]" />
              <span>{t('common.view', 'View Details')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onToggle();
                onEdit(customer);
              }}
              className="w-full px-3 py-1.5 text-xs text-left text-[#16292e] dark:text-[#e7ede9] hover:bg-[#f7f8f2] dark:hover:bg-[#1d3539] flex items-center gap-2 cursor-pointer"
            >
              <Edit2 className="size-3.5 text-[#71817e]" />
              <span>{t('common.edit', 'Edit')}</span>
            </button>
            <div className="my-1 border-t border-[#dfe7df] dark:border-[#2a4245]" />
            <button
              type="button"
              onClick={() => {
                onToggle();
                onDelete(customer);
              }}
              className="w-full px-3 py-1.5 text-xs text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>{t('common.delete', 'Delete')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface CustomerHeaderActionsProps {
  onAdd: () => void;
  onExport?: () => void;
}

export const CustomerHeaderActions: React.FC<CustomerHeaderActionsProps> = ({ onAdd, onExport }) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      {onExport && (
        <button
          type="button"
          onClick={onExport}
          className="h-9 px-3 rounded-lg border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] text-xs font-semibold text-[#16292e] dark:text-[#e7ede9] hover:bg-[#f7f8f2] dark:hover:bg-[#1b3438] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="size-3.5 text-[#71817e]" />
          <span>{t('common.export', 'Export')}</span>
        </button>
      )}

      <button
        type="button"
        onClick={onAdd}
        style={{
          backgroundColor: 'var(--btn-primary-hex, var(--primary-hex, #ec4899))',
        }}
        className="h-9 px-3.5 rounded-lg hover:brightness-90 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:shadow active:scale-[0.98]"
      >
        <Plus className="size-3.5 stroke-[2.5]" />
        <span>{t('customers.newCustomer', 'Add Customer')}</span>
      </button>
    </div>
  );
};

interface CustomerDeleteDialogProps {
  customer: Customer | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const CustomerDeleteDialog: React.FC<CustomerDeleteDialogProps> = ({
  customer,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  const { t } = useLanguage();

  return (
    <Dialog open={Boolean(customer)} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="p-5 pb-3">
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
            {t('customers.confirmDeleteTitle', 'Delete Customer?')}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {t(
              'customers.confirmDeleteDesc',
              `Are you sure you want to delete ${customer?.name || 'this customer'}? This action cannot be undone.`
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs"
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs gap-1.5"
          >
            {isDeleting && <Loader2 className="size-3 animate-spin" />}
            <span>{t('common.delete', 'Delete')}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface CustomerDetailModalProps {
  customer: Customer | null;
  onClose: () => void;
  onEdit: (c: Customer) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
  onEdit,
}) => {
  const { t } = useLanguage();
  if (!customer) return null;

  return (
    <Dialog open={Boolean(customer)} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800/60">
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{customer.name || t('customers.unnamed', 'Unnamed Customer')}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {t('customers.customerDetails', 'Customer Profile & Metrics')}
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                {t('customers.totalOrders', 'Total Orders')}
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {customer.total_orders ?? customer.order_count ?? 0}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                {t('customers.totalSpent', 'Total Spent')}
              </span>
              <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                {GlobalFormat.currency(customer.total_spent ?? 0)}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 text-slate-600 dark:text-slate-300">
            {customer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="size-3.5 text-slate-400" />
                <span className="font-mono">{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-2">
                <Mail className="size-3.5 text-slate-400" />
                <span>{customer.email}</span>
              </div>
            )}
            {(customer.address || customer.city) && (
              <div className="flex items-start gap-2">
                <MapPin className="size-3.5 text-slate-400 mt-0.5" />
                <span>{[customer.address, customer.city].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {customer.notes && (
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-500 text-[11px]">
                {customer.notes}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            {t('common.close', 'Close')}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onClose();
              onEdit(customer);
            }}
            style={{
              backgroundColor: 'var(--btn-primary-hex, var(--primary-hex, #ec4899))',
            }}
            className="hover:brightness-90 text-white text-xs gap-1.5"
          >
            <Edit2 className="size-3" />
            <span>{t('common.edit', 'Edit')}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerRowActions;
