import React from 'react';
import { Layout, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { sound } from '@/utils/sound';

interface LayoutTabProps {
  customizer: any;
  soundMuted: boolean;
  setSoundMuted: (val: boolean) => void;
}

const shadowOptions = [
  { value: 'none', label: 'No Shadow' },
  { value: 'sm', label: 'Small Shadow' },
  { value: 'md', label: 'Medium Shadow' },
  { value: 'lg', label: 'Large Shadow' },
];

const densityOptions = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
];

const radiusPresets = [
  { value: '0px', label: 'Sharp (0px)' },
  { value: '0.25rem', label: 'Small (4px)' },
  { value: '0.5rem', label: 'Medium (8px)' },
  { value: '0.75rem', label: 'Large (12px)' },
  { value: '1rem', label: 'Extra Large (16px)' },
];

const paddingPresets = [
  { value: '0.75rem', label: 'Compact (12px)' },
  { value: '1rem', label: 'Normal (16px)' },
  { value: '1.5rem', label: 'Relaxed (24px)' },
  { value: '2rem', label: 'Spacious (32px)' },
];

export const LayoutTab: React.FC<LayoutTabProps> = ({
  customizer,
  soundMuted,
  setSoundMuted,
}) => {
  const { t } = useLanguage();
  const currentLayout = customizer.layout || {};

  const toggleSoundMute = () => {
    const isMuted = sound.toggleMute();
    setSoundMuted(isMuted);
    if (!isMuted) sound.playClick();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Layout size={18} className="text-primary" />
          <span>{t('settings.tabComponents', 'UI Components & Layout Density')}</span>
        </h3>
        <p className="text-muted-foreground text-xs mt-0.5">
          Configure border radius, padding presets, shadows, and system audio feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
            Card Border Radius
          </label>
          <select
            value={currentLayout.cardRadius || '0.75rem'}
            onChange={(e) => {
              customizer.updateLayout({ cardRadius: e.target.value });
              sound.playClick();
            }}
            className="w-full h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {radiusPresets.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
            Card Padding
          </label>
          <select
            value={currentLayout.padding || '1.5rem'}
            onChange={(e) => {
              customizer.updateLayout({ padding: e.target.value });
              sound.playClick();
            }}
            className="w-full h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {paddingPresets.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
            Table & List Density
          </label>
          <select
            value={customizer.table?.density || 'comfortable'}
            onChange={(e) => {
              customizer.updateTable({ density: e.target.value as any });
              sound.playClick();
            }}
            className="w-full h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {densityOptions.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
            Card Shadow Level
          </label>
          <select
            value={customizer.card?.shadow || 'sm'}
            onChange={(e) => {
              customizer.updateCard({ shadow: e.target.value as any });
              sound.playClick();
            }}
            className="w-full h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {shadowOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audio Effects Toggle */}
      <div className="border border-border p-5 rounded-2xl bg-card flex items-center justify-between shadow-xs">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
            {soundMuted ? (
              <VolumeX size={16} className="text-muted-foreground" />
            ) : (
              <Volume2 size={16} className="text-primary" />
            )}
            <span>{t('settings.soundPrefTitle', 'System Audio & Click Sound Effects')}</span>
          </h4>
          <p className="text-[11px] text-muted-foreground">
            {t(
              'settings.soundPrefSub',
              'Play subtle click sounds on buttons, notifications, and interaction events.'
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleSoundMute}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
            soundMuted
              ? 'bg-muted text-muted-foreground border-border'
              : 'bg-primary/10 text-primary border-primary/20'
          }`}
        >
          {soundMuted
            ? t('settings.soundMuted', 'Muted')
            : t('settings.soundEnabled', 'Sound Enabled')}
        </button>
      </div>
    </div>
  );
};

export default LayoutTab;

