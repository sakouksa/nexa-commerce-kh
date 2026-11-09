import React from 'react';
import { Plus, Trash2, Sliders } from 'lucide-react';
import { useLanguage } from '../../i18n';

const TYPES = ['text', 'number', 'date', 'boolean', 'select', 'color', 'image'];

export interface AttributeItem {
  name: string;
  label: string;
  type: string;
  value: string;
  options: string;
  required: boolean;
}

interface AttributeBuilderProps {
  attributes: AttributeItem[];
  onChange: (attributes: AttributeItem[]) => void;
}

export default function AttributeBuilder({ attributes = [], onChange }: AttributeBuilderProps) {
  const { t } = useLanguage();

  const addAttribute = () => {
    onChange([
      ...attributes,
      { name: '', label: '', type: 'text', value: '', options: '', required: false },
    ]);
  };

  const update = (idx: number, field: keyof AttributeItem, val: any) => {
    onChange(attributes.map((a, i) => (i === idx ? { ...a, [field]: val } : a)));
  };

  const remove = (idx: number) => {
    onChange(attributes.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {t('products.customAttributes', 'Custom Attributes')} ({attributes.length})
        </span>
        <button
          type="button"
          onClick={addAttribute}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-800/80 hover:bg-orange-100 dark:hover:bg-orange-900/60 transition-colors cursor-pointer"
        >
          <Plus className="size-3.5" />
          <span>{t('products.addAttribute', 'Add Attribute')}</span>
        </button>
      </div>

      {attributes.length === 0 && (
        <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-center">
          <Sliders className="size-7 text-slate-300 dark:text-slate-600 mx-auto mb-1.5 stroke-1" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t('products.noAttributesYet', 'No custom attributes yet')}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {t('products.noAttributesDesc', 'Click "Add Attribute" to add Material, Brand, Origin, or Care notes.')}
          </p>
        </div>
      )}

      {attributes.map((attr, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-2xs"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="size-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-[10px] font-mono">
                #{idx + 1}
              </span>
              <span>{attr.label || attr.name || t('products.attributeIndex', `Attribute #${idx + 1}`, { index: idx + 1 })}</span>
            </span>

            <button
              type="button"
              onClick={() => remove(idx)}
              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title={t('products.removeAttribute', 'Remove attribute')}
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                {t('products.attributeKey', 'Attribute Key')}
              </label>
              <input
                value={attr.name}
                onChange={(e) => update(idx, 'name', e.target.value)}
                placeholder={t('products.attributeKeyPlaceholder', 'e.g. material')}
                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                {t('products.displayLabel', 'Display Label')}
              </label>
              <input
                value={attr.label}
                onChange={(e) => update(idx, 'label', e.target.value)}
                placeholder={t('products.displayLabelPlaceholder', 'e.g. Material')}
                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                {t('products.attributeType', 'Type')}
              </label>
              <select
                value={attr.type}
                onChange={(e) => update(idx, 'type', e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-orange-500 cursor-pointer"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                {t('products.optionsComma', 'Options (comma-separated)')}
              </label>
              <input
                value={attr.options}
                onChange={(e) => update(idx, 'options', e.target.value)}
                placeholder="e.g. Red, Blue, Green"
                disabled={!['select', 'color'].includes(attr.type)}
                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-orange-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-1">
            <div className="flex-1">
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                {attr.type === 'color'
                  ? t('products.defaultColor', 'Default Color')
                  : attr.type === 'boolean'
                  ? t('products.defaultBoolean', 'Default (true/false)')
                  : t('products.defaultValue', 'Value')}
              </label>
              {attr.type === 'color' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={attr.value || '#000000'}
                    onChange={(e) => update(idx, 'value', e.target.value)}
                    className="w-10 h-8 rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={attr.value || '#000000'}
                    onChange={(e) => update(idx, 'value', e.target.value)}
                    className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
              ) : (
                <input
                  value={attr.value}
                  onChange={(e) => update(idx, 'value', e.target.value)}
                  placeholder={
                    attr.type === 'boolean'
                      ? 'true'
                      : t('products.attributeValuePlaceholder', 'e.g. 100% Cotton')
                  }
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-orange-500"
                />
              )}
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer pb-2 select-none">
              <input
                type="checkbox"
                checked={attr.required}
                onChange={(e) => update(idx, 'required', e.target.checked)}
                className="size-4 rounded border-slate-300 dark:border-slate-700 text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <span>{t('products.required', 'Required')}</span>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
