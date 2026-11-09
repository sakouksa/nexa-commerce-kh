import React, { useState } from 'react';
import { Pencil, Trash2, Plus, ChevronDown, Check } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../components/ui/sheet';
import { useRestaurantStore } from '../../stores/restaurantStore';
import { RestaurantTable, TableSection } from '../../types/restaurant';
import { useLanguage } from '../../i18n';
import toast from '../../utils/toast';

interface TableSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TableSettingsDrawer: React.FC<TableSettingsDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { tables, addTable, updateTable, deleteTable } = useRestaurantStore();
  const { t } = useLanguage();

  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [section, setSection] = useState<TableSection | ''>('Main Dining');
  const [seats, setSeats] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleStartEdit = (table: RestaurantTable) => {
    setEditingTable(table);
    setTableNumber(String(table.number));
    setSection(table.section);
    setSeats(String(table.seats));
    setErrorMessage('');
  };

  const handleCancelEdit = () => {
    setEditingTable(null);
    setTableNumber('');
    setSection('Main Dining');
    setSeats('');
    setErrorMessage('');
  };

  const handleDelete = (table: RestaurantTable) => {
    if (window.confirm(`Are you sure you want to remove Table ${table.number}?`)) {
      deleteTable(table.id);
      if (editingTable?.id === table.id) {
        handleCancelEdit();
      }
      toast.success(t('restaurant.tableDeleted', `Table ${table.number} removed`));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const num = parseInt(tableNumber.trim(), 10);
    const numSeats = parseInt(seats.trim(), 10);

    if (isNaN(num) || num <= 0) {
      setErrorMessage(t('restaurant.invalidTableNumber', 'Please enter a valid table number (e.g. 17).'));
      return;
    }

    if (!section) {
      setErrorMessage(t('restaurant.selectSectionRequired', 'Please select a section.'));
      return;
    }

    if (isNaN(numSeats) || numSeats <= 0) {
      setErrorMessage(t('restaurant.invalidSeats', 'Please enter a valid number of seats (at least 1).'));
      return;
    }

    // Check duplicate table number
    const duplicate = tables.find(
      (t) => t.number === num && (!editingTable || t.id !== editingTable.id)
    );
    if (duplicate) {
      setErrorMessage(t('restaurant.tableExists', `Table ${num} already exists in ${duplicate.section}.`));
      return;
    }

    if (editingTable) {
      updateTable(editingTable.id, {
        number: num,
        section,
        seats: numSeats,
      });
      toast.success(t('restaurant.tableUpdated', `Table ${num} updated successfully`));
      handleCancelEdit();
    } else {
      addTable({
        number: num,
        section,
        seats: numSeats,
        status: 'available',
      });
      toast.success(t('restaurant.tableAdded', `Table ${num} added successfully`));
      setTableNumber('');
      setSeats('');
      setErrorMessage('');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleCancelEdit();
        onClose();
      }
    }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md h-full flex flex-col p-6 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800"
      >
        {/* Header */}
        <SheetHeader className="text-left pb-4 border-b border-slate-100 dark:border-slate-800">
          <SheetTitle className="text-base font-semibold text-slate-900 dark:text-white">
            {t('restaurant.tableSettingsTitle', 'Table Settings')}
          </SheetTitle>
          <SheetDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {t(
              'restaurant.tableSettingsSubtitle',
              'Manage your restaurant tables — add, edit capacity, or remove tables.'
            )}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Tables List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 py-4 pr-1">
          {tables.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {t('restaurant.noTables', 'No tables found. Add your first table below.')}
            </div>
          ) : (
            tables.map((table) => {
              const isEditing = editingTable?.id === table.id;
              return (
                <div
                  key={table.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isEditing
                      ? 'border-orange-500/60 bg-orange-50/50 dark:bg-orange-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {t('restaurant.tableLabel', 'Table')} {table.number}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {table.section} · {table.seats} {t('restaurant.seats', 'seats')}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(table)}
                      title={t('common.edit', 'Edit table')}
                      className={`size-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                        isEditing
                          ? 'border-orange-500 bg-orange-600 text-white'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(table)}
                      title={t('common.delete', 'Delete table')}
                      className="size-7 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Add / Edit Form Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/60 shadow-2xs space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {editingTable
                ? `${t('restaurant.editTable', 'Edit Table')} ${editingTable.number}`
                : t('restaurant.addTable', 'Add Table')}
            </h3>
            {editingTable && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline cursor-pointer"
              >
                {t('common.cancel', 'Cancel')}
              </button>
            )}
          </div>

          {errorMessage && (
            <div className="text-xs text-rose-500 font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Table Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('restaurant.tableNumber', 'Table Number')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 17"
                value={tableNumber}
                onChange={(e) => {
                  setTableNumber(e.target.value);
                  setErrorMessage('');
                }}
                required
                className="w-full h-8 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {/* Section & Seats */}
            <div className="grid grid-cols-2 gap-3">
              {/* Section */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t('restaurant.section', 'Section')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={section}
                    onChange={(e) => {
                      setSection(e.target.value as TableSection);
                      setErrorMessage('');
                    }}
                    required
                    className="w-full h-8 pl-3 pr-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select</option>
                    <option value="Main Dining">Main Dining</option>
                    <option value="Private Room">Private Room</option>
                    <option value="Outdoor">Outdoor</option>
                  </select>
                  <ChevronDown className="size-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Seats */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t('restaurant.seats', 'Seats')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g. 4"
                  value={seats}
                  onChange={(e) => {
                    setSeats(e.target.value);
                    setErrorMessage('');
                  }}
                  required
                  className="w-full h-8 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-9 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-[0.99]"
            >
              {editingTable ? (
                <>
                  <Check className="size-3.5" />
                  <span>{t('restaurant.saveChanges', 'Save Changes')}</span>
                </>
              ) : (
                <>
                  <Plus className="size-3.5" />
                  <span>{t('restaurant.addTable', 'Add Table')}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TableSettingsDrawer;
