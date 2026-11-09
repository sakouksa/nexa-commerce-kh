import React, { useState } from 'react';
import { Plus, Trash2, Zap, Tag, Sparkles, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../i18n';
import toast from '../../utils/toast';

export interface VariationItem {
  attrs?: Record<string, string>;
  price?: number | string;
  quantity?: number | string;
  sku?: string;
}

interface VariationBuilderProps {
  variations: VariationItem[];
  onChange: (variations: VariationItem[]) => void;
}

const PRESETS = [
  // ម៉ូដ និងសម្លៀកបំពាក់ (Fashion & Apparel)
  {
    category: 'fashion',
    labelKey: 'products.presets.clothingSize',
    defaultLabel: 'Clothing Size (S, M, L, XL)',
    nameKh: 'ទំហំ',
    nameEn: 'Size',
    optionsKh: 'S, M, L, XL',
    optionsEn: 'S, M, L, XL',
  },
  {
    category: 'fashion',
    labelKey: 'products.presets.color',
    defaultLabel: 'Product Color (Black, White, Red, Blue)',
    nameKh: 'ពណ៌',
    nameEn: 'Color',
    optionsKh: 'ខ្មៅ, ស, ក្រហម, ខៀវ',
    optionsEn: 'Black, White, Red, Blue',
  },

  // ម្ហូប និងអាហារ (Food & Restaurant)
  {
    category: 'food',
    labelKey: 'products.presets.dishSize',
    defaultLabel: 'Portion (Regular, Special)',
    nameKh: 'ទំហំចាន',
    nameEn: 'Portion',
    optionsKh: 'ធម្មតា, ពិសេស',
    optionsEn: 'Regular, Special',
  },
  {
    category: 'food',
    labelKey: 'products.presets.meatChoice',
    defaultLabel: 'Meat Choice (Beef, Pork, Chicken...)',
    nameKh: 'ប្រភេទសាច់',
    nameEn: 'Meat Choice',
    optionsKh: 'សាច់គោ, សាច់ជ្រូក, សាច់មាន់, គ្រឿងសមុទ្រ',
    optionsEn: 'Beef, Pork, Chicken, Seafood',
  },
  {
    category: 'food',
    labelKey: 'products.presets.spicyLevel',
    defaultLabel: 'Spicy Level (No Spicy, Mild, Hot)',
    nameKh: 'កម្រិតហឹរ',
    nameEn: 'Spicy Level',
    optionsKh: 'មិនហឹរ, ហឹរតិច, ហឹរខ្លាំង',
    optionsEn: 'No Spicy, Mild, Hot',
  },
  {
    category: 'food',
    labelKey: 'products.presets.addons',
    defaultLabel: 'Add-ons (Fried Egg, Extra Rice...)',
    nameKh: 'ថែមលើម្ហូប',
    nameEn: 'Add-ons',
    optionsKh: 'ពងទាចៀន, បាយថែម, ស៊ុបថែម',
    optionsEn: 'Fried Egg, Extra Rice, Soup',
  },

  // ភេសជ្ជៈ និងកាហ្វេ (Drinks & Coffee)
  {
    category: 'drink',
    labelKey: 'products.presets.cupSize',
    defaultLabel: 'Cup Size (Regular, Large)',
    nameKh: 'ទំហំកែវ',
    nameEn: 'Cup Size',
    optionsKh: 'កែវតូច, កែវធំ',
    optionsEn: 'Regular, Large',
  },
  {
    category: 'drink',
    labelKey: 'products.presets.sweetness',
    defaultLabel: 'Sweetness (Sugar 100%, 50%, 0%)',
    nameKh: 'កម្រិតស្ករ',
    nameEn: 'Sweetness',
    optionsKh: 'ស្ករ 100%, ស្ករ 50%, ស្ករ 0%',
    optionsEn: '100% Sugar, 50% Sugar, 0% Sugar',
  },
  {
    category: 'drink',
    labelKey: 'products.presets.temp',
    defaultLabel: 'Temp (Hot, Iced, Frappe)',
    nameKh: 'ប្រភេទ',
    nameEn: 'Temp',
    optionsKh: 'ក្តៅ, ទឹកកក, ក្រឡុក',
    optionsEn: 'Hot, Iced, Frappe',
  },

  // ទំនិញទូទៅ និងម៉ាត (General Store / Retail)
  {
    category: 'general',
    labelKey: 'products.presets.packSize',
    defaultLabel: 'Pack Size (Small, Medium, Large)',
    nameKh: 'ទំហំកញ្ចប់',
    nameEn: 'Pack Size',
    optionsKh: 'តូច, មធ្យម, ធំ',
    optionsEn: 'Small, Medium, Large',
  },
  {
    category: 'general',
    labelKey: 'products.presets.weight',
    defaultLabel: 'Weight (250g, 500g, 1kg)',
    nameKh: 'ទម្ងន់',
    nameEn: 'Weight',
    optionsKh: '250g, 500g, 1kg',
    optionsEn: '250g, 500g, 1kg',
  },
];

export default function VariationBuilder({ variations = [], onChange }: VariationBuilderProps) {
  const { t, language } = useLanguage();
  const [attrName, setAttrName] = useState('');
  const [attrOptions, setAttrOptions] = useState('');

  const addVariation = () => {
    onChange([...variations, { attrs: {}, price: 0, quantity: 0, sku: '' }]);
    toast.success(t('products.toast.addedVariantRow', 'Added 1 variant row'));
  };

  const update = (idx: number, field: keyof VariationItem, val: any) => {
    onChange(variations.map((v, i) => (i === idx ? { ...v, [field]: val } : v)));
  };

  const updateAttr = (idx: number, key: string, val: string) => {
    onChange(
      variations.map((v, i) => {
        if (i !== idx) return v;
        const attrs = { ...(v.attrs || {}) };
        if (val) attrs[key] = val;
        else delete attrs[key];
        return { ...v, attrs };
      })
    );
  };

  const remove = (idx: number) => {
    onChange(variations.filter((_, i) => i !== idx));
  };

  const clearAll = () => {
    if (variations.length === 0) return;
    if (window.confirm(t('products.toast.confirmClearVariants', 'Clear all variants?'))) {
      onChange([]);
    }
  };

  const allAttrNames = Array.from<string>(
    new Set(variations.flatMap((v) => Object.keys(v.attrs || {})))
  );

  const applyPreset = (preset: typeof PRESETS[0]) => {
    const isKh = language === 'kh';
    const targetName = isKh ? preset.nameKh : preset.nameEn;
    const targetOptions = isKh ? preset.optionsKh : preset.optionsEn;
    setAttrName(targetName);
    setAttrOptions(targetOptions);
    toast.success(
      t('products.toast.loadedPreset', `Loaded preset "${targetName}". Click "Generate Variants" to apply.`, { name: targetName })
    );
  };

  const generateVariations = () => {
    const name = attrName.trim();
    const options = attrOptions
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    if (!name) {
      toast.error(
        t('products.toast.enterAttrNameFirst', 'Please enter an attribute name (e.g. Size or Color) first!')
      );
      return;
    }

    if (options.length === 0) {
      toast.error(
        t('products.toast.enterOptionsFirst', 'Please enter options separated by commas (e.g. S, M, L)!')
      );
      return;
    }

    // Check if there are already existing variations with other attributes -> combine them
    const existingAttrNames = Array.from(
      new Set(variations.flatMap((v) => Object.keys(v.attrs || {})))
    );

    if (variations.length > 0 && existingAttrNames.length > 0 && !existingAttrNames.includes(name)) {
      // Multiply combinations (e.g. Size x Color)
      const combined: VariationItem[] = [];
      for (const existing of variations) {
        for (const opt of options) {
          combined.push({
            ...existing,
            attrs: { ...existing.attrs, [name]: opt },
            sku: existing.sku ? `${existing.sku}-${opt}` : '',
          });
        }
      }
      onChange(combined);
      toast.success(
        t('products.toast.combinedVariantsSuccess', `Generated ${combined.length} combined multi-attribute variants!`, { count: combined.length })
      );
    } else {
      // Normal generate
      const newItems: VariationItem[] = options.map((opt) => ({
        attrs: { [name]: opt },
        price: 0,
        quantity: 0,
        sku: '',
      }));
      onChange(variations.length === 0 ? newItems : [...variations, ...newItems]);
      toast.success(
        t('products.toast.generatedVariantsSuccess', `Generated ${newItems.length} variants successfully!`, { count: newItems.length })
      );
    }

    setAttrName('');
    setAttrOptions('');
  };

  const addNewVariationAttr = (idx: number) => {
    const name = prompt(
      t('products.toast.attrPrompt', 'Variation attribute name (e.g. Size or Color):')
    );
    if (!name) return;
    updateAttr(idx, name.trim(), '');
  };

  const parsedCount = attrOptions.split(',').map((o) => o.trim()).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span>{t('products.configuredVariants', 'Configured Variants')}</span>
          <span className="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold px-2 py-0.5 rounded-full text-[11px] border border-orange-200/60 dark:border-orange-800/60">
            {variations.length}
          </span>
        </span>

        <div className="flex items-center gap-2">
          {variations.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors cursor-pointer px-2 py-1"
            >
              {t('products.clearAll', 'Clear all')}
            </button>
          )}

          <button
            type="button"
            onClick={addVariation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-800/80 hover:bg-orange-100 dark:hover:bg-orange-900/60 transition-colors cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>{t('products.addVariant', 'Add Variant')}</span>
          </button>
        </div>
      </div>

      {/* Auto Generator Tool */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {t('products.autoGenerator', 'Generate Variants Automatically')}
          </span>
          <span className="text-[11px] text-slate-400">
            {t('products.fastAndEasy', 'Fast & Easy')}
          </span>
        </div>

        {/* Quick Presets Chips */}
        <div>
          <span className="text-[11px] text-slate-400 block mb-1.5">
            {t('products.popularPresets', 'Popular Presets (Click to load):')}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer shadow-2xs"
              >
                {t(p.labelKey, p.defaultLabel)}
              </button>
            ))}
          </div>
        </div>

        {/* Generator Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
              {t('products.attributeName', 'Attribute Name *')}
            </label>
            <input
              type="text"
              value={attrName}
              onChange={(e) => setAttrName(e.target.value)}
              placeholder={t('products.attributeNamePlaceholder', 'e.g. Size')}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
              {t('products.optionValues', 'Option Values (comma-separated) *')}
            </label>
            <input
              type="text"
              value={attrOptions}
              onChange={(e) => setAttrOptions(e.target.value)}
              placeholder={t('products.optionValuesPlaceholder', 'e.g. S, M, L, XL')}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={generateVariations}
          style={{
            backgroundColor: 'var(--btn-primary-hex, var(--primary-hex, #ec4899))',
          }}
          className="w-full h-9 px-4 rounded-lg hover:brightness-90 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99]"
        >
          <Zap className="size-3.5 fill-white text-white" />
          <span>
            {parsedCount > 0
              ? t('products.generateNow', `Generate ${parsedCount} Variants Now`, { count: parsedCount })
              : t('products.generateVariants', 'Generate Variants')}
          </span>
        </button>
      </div>

      {/* Empty State */}
      {variations.length === 0 && (
        <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-center">
          <Tag className="size-7 text-slate-300 dark:text-slate-600 mx-auto mb-1.5 stroke-1" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t('products.noVariantsYet', 'No variations added yet')}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {t('products.noVariantsDesc', 'Choose a preset above or type attribute and options, then click "Generate Variants".')}
          </p>
        </div>
      )}

      {/* List of Variations */}
      {variations.map((v, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-2xs"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="size-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-[10px] font-mono">
                #{idx + 1}
              </span>
              <span>
                {t('products.variantIndex', `Variant #${idx + 1}`, { index: idx + 1 })}
                {Object.keys(v.attrs || {}).length > 0 && (
                  <span className="text-orange-600 dark:text-orange-400 font-normal ml-1">
                    ({Object.entries(v.attrs || {})
                      .map(([k, val]) => `${k}: ${val}`)
                      .join(', ')})
                  </span>
                )}
              </span>
            </span>

            <button
              type="button"
              onClick={() => remove(idx)}
              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title={t('products.removeVariant', 'Remove variation')}
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>

          {/* Attributes row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {allAttrNames.map((attr) => (
              <div
                key={attr}
                className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 overflow-hidden"
              >
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-2.5 py-1.5 border-r border-slate-200 dark:border-slate-800 shrink-0">
                  {attr}:
                </span>
                <input
                  value={v.attrs?.[attr] || ''}
                  onChange={(e) => updateAttr(idx, attr, e.target.value)}
                  className="w-28 h-8 px-2.5 bg-transparent text-xs text-slate-900 dark:text-slate-100 outline-none"
                  placeholder="e.g. S"
                />
              </div>
            ))}
            {allAttrNames.length === 0 && (
              <button
                type="button"
                onClick={() => addNewVariationAttr(idx)}
                className="text-xs text-orange-600 dark:text-orange-400 font-semibold hover:underline cursor-pointer"
              >
                {t('products.addVariationAttr', '+ Add variation attribute')}
              </button>
            )}
          </div>

          {/* Pricing, Quantity, SKU grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                {t('products.price', 'Price ($)')}
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={v.price}
                  onChange={(e) => update(idx, 'price', e.target.value)}
                  className="w-full h-8 pl-6 pr-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-900 dark:text-slate-100 font-semibold outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                {t('products.stock', 'Stock Quantity')}
              </label>
              <input
                type="number"
                value={v.quantity}
                onChange={(e) => update(idx, 'quantity', e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-900 dark:text-slate-100 font-bold outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                {t('products.sku', 'SKU / Barcode')}
              </label>
              <input
                value={v.sku || ''}
                onChange={(e) => update(idx, 'sku', e.target.value)}
                placeholder="e.g. SKU-001"
                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
