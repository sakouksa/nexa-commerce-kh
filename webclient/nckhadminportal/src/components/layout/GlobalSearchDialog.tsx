import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Store,
  Users,
  BadgePercent,
  Database,
  Activity,
  Settings,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '../../i18n';
import { ADMIN_NAV_ITEMS } from '../../config/navConfig';

interface SearchOption {
  title: string;
  titleKh: string;
  to: string;
  category: string;
  categoryKh: string;
  icon: React.ReactNode;
  keywords: string[];
}

export interface GlobalSearchDialogProps {
  isNavbarDark?: boolean;
}

export const GlobalSearchDialog: React.FC<GlobalSearchDialogProps> = ({
  isNavbarDark = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { currentLang } = useLanguage();
  const navigate = useNavigate();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchOptions: SearchOption[] = useMemo(
    () => [
      {
        title: 'Dashboard Overview',
        titleKh: 'ផ្ទាំងគ្រប់គ្រងទូទៅ',
        to: '/',
        category: 'Navigation',
        categoryKh: 'ការរុករក',
        icon: <LayoutDashboard className="size-4 text-indigo-500" />,
        keywords: ['home', 'stats', 'analytics', 'revenue', 'overview'],
      },
      {
        title: 'Manage Shops & Tenants',
        titleKh: 'គ្រប់គ្រងហាង និងអតិថិជន',
        to: '/shops',
        category: 'Management',
        categoryKh: 'ការគ្រប់គ្រង',
        icon: <Store className="size-4 text-sky-500" />,
        keywords: ['stores', 'merchants', 'shops', 'outlets', 'pos'],
      },
      {
        title: 'Users & Permissions',
        titleKh: 'អ្នកប្រើប្រាស់ និងសិទ្ធិ',
        to: '/users',
        category: 'Management',
        categoryKh: 'ការគ្រប់គ្រង',
        icon: <Users className="size-4 text-emerald-500" />,
        keywords: ['accounts', 'staff', 'admin', 'password', 'roles'],
      },
      {
        title: 'Resellers & Partners',
        titleKh: 'តំណាងចែកចាយ និងដៃគូ',
        to: '/resellers',
        category: 'Management',
        categoryKh: 'ការគ្រប់គ្រង',
        icon: <BadgePercent className="size-4 text-purple-500" />,
        keywords: ['affiliate', 'commission', 'agents', 'referrals'],
      },
      {
        title: 'Database Backup & Restore',
        titleKh: 'ទិន្នន័យបម្រុង និងការស្ដារ',
        to: '/backup',
        category: 'System',
        categoryKh: 'ប្រព័ន្ធ',
        icon: <Database className="size-4 text-amber-500" />,
        keywords: ['backup', 'snapshot', 'sql', 'recovery', 'database'],
      },
      {
        title: 'Activity & Audit Logs',
        titleKh: 'កំណត់ហេតុសកម្មភាពប្រព័ន្ធ',
        to: '/activity',
        category: 'System',
        categoryKh: 'ប្រព័ន្ធ',
        icon: <Activity className="size-4 text-rose-500" />,
        keywords: ['logs', 'history', 'audit', 'security', 'events'],
      },
      {
        title: 'Platform Settings',
        titleKh: 'ការកំណត់ប្រព័ន្ធទូទៅ',
        to: '/settings',
        category: 'System',
        categoryKh: 'ប្រព័ន្ធ',
        icon: <Settings className="size-4 text-slate-500" />,
        keywords: ['configuration', 'theme', 'general', 'options'],
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return searchOptions;
    return searchOptions.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.titleKh.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q))
    );
  }, [query, searchOptions]);

  const handleSelect = (to: string) => {
    setOpen(false);
    setQuery('');
    navigate(to);
  };

  return (
    <>
      {/* Trigger Button in Header (Clean SmartHR / Merchant Style) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border w-44 lg:w-56 xl:w-64 cursor-pointer transition-all shadow-2xs ${
          isNavbarDark
            ? 'bg-white/10 border-white/20 text-white/90 placeholder:text-white/50 hover:border-white/40 hover:bg-white/15'
            : 'bg-[#f4f6f4] dark:bg-[#152a2c] border-[#dfe6df] dark:border-[#223d40] text-[#526663] dark:text-[#9fb0ac] hover:border-[var(--primary-hex,#ec4899)]'
        }`}
        aria-label="Search workspace"
      >
        <Search className={`size-3.5 shrink-0 ${isNavbarDark ? 'text-white/80' : 'text-slate-400'}`} />
        <span className="truncate">
          {currentLang === 'kh' ? 'ស្វែងរក workspace' : 'Search workspace'}
        </span>
        <kbd
          className={`ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded border shadow-2xs ${
            isNavbarDark
              ? 'bg-white/15 text-white border-white/25'
              : 'bg-white dark:bg-[#0e1b1d] border-[#dfe6df] dark:border-[#2a4245] text-[#718783] dark:text-[#8ea39f]'
          }`}
        >
          ⌘K
        </kbd>
      </button>

      {/* Search Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden border-border/80 shadow-2xl">
          <DialogTitle className="sr-only">
            {currentLang === 'kh' ? 'ស្វែងរកប្រព័ន្ធ' : 'Search Platform'}
          </DialogTitle>

          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-border/60 bg-background">
            <Search className="size-4.5 text-muted-foreground mr-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                currentLang === 'kh'
                  ? 'វាយឈ្មោះទំព័រ ឬសកម្មភាពដែលចង់ស្វែងរក...'
                  : 'Type a page, setting, or command...'
              }
              autoFocus
              className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/70 outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-muted cursor-pointer"
              >
                ESC
              </button>
            )}
          </div>

          {/* Quick Results */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {currentLang === 'kh' ? 'លទ្ធផលរហ័ស' : 'Jump to Navigation'}
            </div>
            {filtered.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Sparkles className="size-6 text-muted-foreground/40" />
                <p>
                  {currentLang === 'kh'
                    ? 'រកមិនឃើញទិន្នន័យដែលផ្គូផ្គងនឹងពាក្យស្វែងរកទេ'
                    : 'No matching destinations found'}
                </p>
              </div>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => handleSelect(item.to)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left text-xs font-medium text-foreground hover:bg-accent transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-7 rounded-md bg-muted/60 border border-border/60 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {currentLang === 'kh' ? item.titleKh : item.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.to} • {currentLang === 'kh' ? item.categoryKh : item.category}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border/60 bg-muted/30 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>
                <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border/60">↵</kbd> select
              </span>
              <span>
                <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border/60">↑↓</kbd> navigate
              </span>
            </div>
            <span>
              <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border/60">esc</kbd> close
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlobalSearchDialog;
