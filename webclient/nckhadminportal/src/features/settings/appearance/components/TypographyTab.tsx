import React from 'react';
import { Type } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { sound } from '@/utils/sound';

interface TypographyTabProps {
  customizer: any;
}

const fontFamilies = [
  'Default',
  'Inter',
  'Kantumruy Pro',
  'Battambang',
  'Poppins',
  'Roboto',
  'Montserrat',
  'Nunito',
  'system-ui',
  'monospace',
  'sans-serif',
];

const fontSizes = ['12px', '13px', '14px', '15px', '16px', '18px'];
const fontWeights = ['300', '400', '500', '600', '700'];
const lineHeights = ['1.2', '1.3', '1.4', '1.5', '1.6', '1.7'];
const letterSpacings = ['-0.05em', '0px', '0.025em', '0.05em', '0.1em'];

export const TypographyTab: React.FC<TypographyTabProps> = ({ customizer }) => {
  const { t } = useLanguage();
  const currentFont = customizer.font || {};

  const handleUpdate = (updates: Partial<typeof currentFont>) => {
    customizer.updateFont(updates);
    sound.playClick();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Type size={18} className="text-primary" />
          <span>{t('settings.tabTypography', 'Typography & Text Styling')}</span>
        </h3>
        <p className="text-muted-foreground text-xs mt-0.5">
          Configure font family, sizes, weights, and letter spacing across the dashboard UI.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
            Font Family
          </label>
          <select
            value={currentFont.family || 'Default'}
            onChange={(e) => handleUpdate({ family: e.target.value })}
            className="w-full h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {fontFamilies.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
            Base Font Size
          </label>
          <select
            value={currentFont.size || '14px'}
            onChange={(e) => handleUpdate({ size: e.target.value })}
            className="w-full h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {fontSizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
            Default Font Weight
          </label>
          <select
            value={currentFont.weight || '400'}
            onChange={(e) => handleUpdate({ weight: e.target.value })}
            className="w-full h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {fontWeights.map((w) => (
              <option key={w} value={w}>
                {w} ({w === '300' ? 'Light' : w === '400' ? 'Normal' : w === '500' ? 'Medium' : w === '600' ? 'Semibold' : 'Bold'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
            Line Height
          </label>
          <select
            value={currentFont.lineHeight || '1.5'}
            onChange={(e) => handleUpdate({ lineHeight: e.target.value })}
            className="w-full h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {lineHeights.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
            Letter Spacing
          </label>
          <select
            value={currentFont.letterSpacing || '0px'}
            onChange={(e) => handleUpdate({ letterSpacing: e.target.value })}
            className="w-full h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {letterSpacings.map((l) => (
              <option key={l} value={l}>
                {l} ({l === '-0.05em' ? 'Tight' : l === '0px' ? 'Normal' : l === '0.025em' ? 'Wide' : l === '0.05em' ? 'Wider' : 'Widest'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Typography Live Preview */}
      <div className="border border-border p-5 rounded-2xl bg-card/60 shadow-xs space-y-3">
        <span className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground">
          Typography Live Preview
        </span>
        <h4 className="text-xl font-bold text-foreground">
          The quick brown fox jumps over the lazy dog.
        </h4>
        <p className="text-sm text-foreground/90 leading-relaxed font-sans">
          អក្សរខ្មែរ កម្ពុជា ព័ត៌មានលម្អិត និងទិន្នន័យប្រព័ន្ធគ្រប់គ្រង Enterprise E-Commerce POS System.
        </p>
        <div className="pt-2 flex items-center gap-3 text-xs text-muted-foreground font-mono">
          <span>Family: {currentFont.family || 'Default'}</span>
          <span>•</span>
          <span>Size: {currentFont.size || '14px'}</span>
          <span>•</span>
          <span>Weight: {currentFont.weight || '400'}</span>
        </div>
      </div>
    </div>
  );
};

export default TypographyTab;

