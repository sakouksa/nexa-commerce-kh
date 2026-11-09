import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Plus,
  Sun,
  Moon,
  ChevronDown,
  Store,
  Users,
  BadgePercent,
  Database,
  Settings,
  Palette,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, LanguageSwitcher } from '../../i18n';
import { useThemeStore } from '../../stores/themeStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationDropdown } from './NotificationDropdown';
import { GlobalSearchDialog } from './GlobalSearchDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface HeaderProps {
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onToggleMobileSidebar?: () => void;
  // Backwards compatibility with AdminLayout
  onOpenMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarCollapsed = false,
  onToggleSidebar,
  onToggleMobileSidebar,
  onOpenMobileSidebar,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t, isKhmer } = useLanguage();
  const { themeMode, updateThemeMode, navbar } = useThemeStore();

  const handleMobileMenu = onToggleMobileSidebar || onOpenMobileSidebar;

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const isNavbarDark = useMemo(() => {
    const bg = navbar?.bgColor;
    if (!bg) return isDark;
    const hex = bg.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      return lum < 0.65;
    }
    return isDark;
  }, [navbar?.bgColor, isDark]);

  const toggleTheme = () => {
    updateThemeMode(isDark ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/sign-in-admin');
  };

  const username = user?.username || 'admin';
  const displayName = user?.full_name || username;
  const roleName = user?.role ? user.role.toUpperCase() : 'SUPER ADMIN';
  const initial = username.charAt(0).toUpperCase();

  // Extract first name for concise profile pill
  const userFirstName = useMemo(() => {
    if (!displayName) return 'Admin';
    const parts = displayName.trim().split(/\s+/);
    return parts[0] || 'Admin';
  }, [displayName]);

  // Clean page title & category subtitle matching merchant portal & SmartHR
  const pageTitle = useMemo(() => {
    const p = location.pathname;
    if (p.includes('/shops')) {
      return {
        main: isKhmer ? 'ហាងទាំងអស់' : 'Shops & Outlets',
        sub: isKhmer ? 'គ្រប់គ្រងហាង & សាខា' : 'Shop Management',
      };
    }
    if (p.includes('/users')) {
      return {
        main: isKhmer ? 'អ្នកប្រើប្រាស់' : 'Users & Access',
        sub: isKhmer ? 'គណនី & សិទ្ធិគ្រប់គ្រង' : 'Role Management',
      };
    }
    if (p.includes('/resellers')) {
      return {
        main: isKhmer ? 'តំណាងចែកចាយ' : 'Resellers & Affiliates',
        sub: isKhmer ? 'ដៃគូពាណិជ្ជកម្ម & កម្រៃជើងសារ' : 'Partners & Commissions',
      };
    }
    if (p.includes('/activity')) {
      return {
        main: isKhmer ? 'កំណត់ត្រាសកម្មភាព' : 'Analytics & Logs',
        sub: isKhmer ? 'សន្តិសុខ & ប្រព័ន្ធ' : 'Audit Trail',
      };
    }
    if (p.includes('/backup')) {
      return {
        main: isKhmer ? 'ទិន្នន័យបម្រុង' : 'Database Backup',
        sub: isKhmer ? 'ប្រព័ន្ធ & ឧបករណ៍' : 'Disaster Recovery',
      };
    }
    if (p.includes('/settings')) {
      return {
        main: isKhmer ? 'ការកំណត់' : 'Settings',
        sub: isKhmer ? 'ប្រព័ន្ធ & រូបរាង' : 'Platform & Appearance',
      };
    }
    return {
      main: isKhmer ? 'ផ្ទាំងគ្រប់គ្រង' : 'Dashboard',
      sub: isKhmer ? 'គ្រប់គ្រងទូទៅ & ការវិភាគ' : 'Overview & Health',
    };
  }, [location.pathname, isKhmer]);

  return (
    <header
      style={{
        backgroundColor: 'var(--navbar-bg, #ffffff)',
        color: 'var(--navbar-text, #142628)',
        borderColor: 'var(--navbar-border, #dfe7df)',
        boxShadow: 'var(--navbar-shadow, none)',
        height: 'var(--navbar-height, 64px)',
      }}
      className="border-b sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between transition-colors backdrop-blur-md font-sans shrink-0"
    >
      {/* Left: Mobile Toggle (on < md) + Clean Page Title & Subtitle */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Menu (Only on small screens < 768px) */}
        {handleMobileMenu && (
          <button
            type="button"
            onClick={handleMobileMenu}
            aria-label="Toggle Navigation Menu"
            className="md:hidden size-9 rounded-lg border border-border/80 bg-muted/40 hover:bg-muted text-inherit flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <Menu className="size-5" />
          </button>
        )}

        {/* Clean SmartHR-Style Page Title & Category Header */}
        <div className="flex flex-col min-w-0">
          <h1 className="text-[14.5px] sm:text-base font-bold text-inherit leading-tight truncate tracking-tight">
            {pageTitle.main}
          </h1>
          <span className="text-[11px] opacity-70 leading-none mt-0.5 truncate font-medium text-inherit">
            {pageTitle.sub}
          </span>
        </div>
      </div>

      {/* Right: Search, Quick Add, Notifications, Theme, Language, Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Global Search Dialog (Clean SmartHR / Merchant Style: Search workspace ⌘K) */}
        <GlobalSearchDialog isNavbarDark={isNavbarDark} />

        {/* Quick Add Button with Dropdown (Follows Active Theme Primary Setting) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              style={{
                backgroundColor:
                  'var(--btn-primary-hex, var(--primary-hex, var(--sidebar-active-bg, #ec4899)))',
              }}
              className="active:scale-95 text-white hover:brightness-110 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-[13px] font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Plus className="size-3.5 sm:size-4 stroke-[2.5]" />
              <span className="hidden xs:inline">
                {isKhmer ? 'បង្កើតថ្មី' : 'Quick Add'}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-52 p-1.5 rounded-xl border border-border bg-card shadow-xl text-xs font-medium"
          >
            <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1">
              {isKhmer ? 'សកម្មភាពរហ័ស' : 'Quick Actions'}
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigate('/shops')}
              className="gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-muted text-foreground"
            >
              <Store
                style={{ color: 'var(--primary-hex, var(--sidebar-active-bg, #ec4899))' }}
                className="size-4"
              />
              <span>{isKhmer ? 'បង្កើតហាងថ្មី' : 'New Shop'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/users')}
              className="gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-muted text-foreground"
            >
              <Users
                style={{ color: 'var(--primary-hex, var(--sidebar-active-bg, #ec4899))' }}
                className="size-4"
              />
              <span>{isKhmer ? 'បន្ថែមអ្នកប្រើប្រាស់' : 'New User'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/resellers')}
              className="gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-muted text-foreground"
            >
              <BadgePercent
                style={{ color: 'var(--primary-hex, var(--sidebar-active-bg, #ec4899))' }}
                className="size-4"
              />
              <span>{isKhmer ? 'តំណាងចែកចាយថ្មី' : 'New Reseller'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/backup')}
              className="gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-muted text-foreground"
            >
              <Database
                style={{ color: 'var(--primary-hex, var(--sidebar-active-bg, #ec4899))' }}
                className="size-4"
              />
              <span>{isKhmer ? 'ទិន្នន័យបម្រុង' : 'Database Backup'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications Dropdown with Alert Badge */}
        <NotificationDropdown isNavbarDark={isNavbarDark} />

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={`size-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
            isNavbarDark
              ? 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
              : 'bg-muted/60 hover:bg-muted text-foreground border border-border/80'
          }`}
          title={
            isDark
              ? isKhmer
                ? 'ប្តូរទៅពន្លឺថ្ងៃ'
                : 'Switch to light mode'
              : isKhmer
              ? 'ប្តូរទៅប្រឡប់ងងឹត'
              : 'Switch to dark mode'
          }
        >
          {isDark ? (
            <Sun className="size-4 text-amber-400 rotate-0 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon
              className={`size-4 rotate-0 transition-transform duration-300 hover:rotate-12 ${
                isNavbarDark ? 'text-amber-300' : 'text-slate-700 dark:text-slate-300'
              }`}
            />
          )}
        </button>

        {/* Compact Dropdown Language Switcher */}
        <LanguageSwitcher variant="dropdown" isNavbarDark={isNavbarDark} />

        {/* SmartHR User Profile Pill (Avatar + First Name + Chevron) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-xl hover:bg-muted/70 transition-all outline-none cursor-pointer text-left ml-0.5 sm:ml-1"
            >
              <Avatar className="size-8 ring-1 ring-border shadow-2xs">
                <AvatarImage src="" alt={displayName} />
                <AvatarFallback
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--primary-hex, #ec4899) 18%, transparent)',
                    color: 'var(--primary-hex, #ec4899)',
                  }}
                  className="font-bold text-xs uppercase"
                >
                  {initial}
                </AvatarFallback>
              </Avatar>

              <div className="hidden sm:flex items-center gap-1 min-w-0 pr-0.5">
                <span className="text-xs font-semibold text-inherit truncate max-w-[90px]">
                  {userFirstName}
                </span>
                <ChevronDown className="size-3 text-muted-foreground shrink-0" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-56 p-1.5 rounded-xl border border-border bg-card shadow-xl text-xs font-medium"
          >
            <DropdownMenuLabel className="p-2">
              <div className="flex items-center gap-2.5">
                <Avatar className="size-9 ring-1 ring-border">
                  <AvatarFallback
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--primary-hex, #ec4899) 18%, transparent)',
                      color: 'var(--primary-hex, #ec4899)',
                    }}
                    className="font-bold text-sm uppercase"
                  >
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="font-bold text-foreground truncate">{displayName}</p>
                  <p className="text-[10.5px] text-muted-foreground font-mono truncate mt-0.5">
                    {roleName}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate('/settings')}
              className="gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-muted"
            >
              <Settings className="size-4 text-muted-foreground" />
              <span>{isKhmer ? 'ការកំណត់ប្រព័ន្ធ' : 'Platform Settings'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/settings?tab=appearance')}
              className="gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-muted"
            >
              <Palette
                style={{ color: 'var(--primary-hex, var(--sidebar-active-bg, #ec4899))' }}
                className="size-4"
              />
              <span>{isKhmer ? 'រូបរាងប្រព័ន្ធ & ពណ៌ Theme' : 'Appearance & Themes'}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-rose-500/10 text-rose-500 focus:text-rose-500"
            >
              <LogOut className="size-4" />
              <span>{t('auth.logout', 'Sign Out')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
