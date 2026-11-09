import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiBell,
  FiSearch,
  FiSettings,
  FiSun,
  FiMoon,
  FiUser,
  FiShoppingBag,
  FiCreditCard,
  FiLogOut,
  FiChevronRight,
  FiPlus,
  FiPackage,
  FiTag,
  FiUsers,
  FiChevronDown,
  FiMenu,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, LanguageSwitcher } from '../../i18n';
import { useThemeStore } from '../../stores/themeStore';
import { fullUrl } from '../../api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationDropdown } from './NotificationDropdown';
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
}

export const Header: React.FC<HeaderProps> = ({
  sidebarCollapsed = false,
  onToggleSidebar,
  onToggleMobileSidebar,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, shop, logout } = useAuth();
  const { t } = useLanguage();
  const { themeMode, updateThemeMode, navbar } = useThemeStore();

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
    navigate('/login');
  };

  const displayName = user?.full_name || user?.username || 'Merchant User';
  const displayEmail = user?.email || `${user?.username || 'merchant'}@ministorekh.com`;
  const roleName = user?.role === 'staff' ? 'Staff' : 'Admin';
  const initial = (user?.username || user?.full_name || 'M').charAt(0).toUpperCase();

  // Extract first name for concise SmartHR-style profile pill (e.g., "Avery" in reference image)
  const userFirstName = useMemo(() => {
    if (!displayName) return 'User';
    const parts = displayName.trim().split(/\s+/);
    return parts[0] || 'User';
  }, [displayName]);

  // Determine current page title and subtitle category for header matching SmartHR layout
  const pageTitle = useMemo(() => {
    const p = location.pathname;
    if (p.includes('/reports')) {
      return {
        main: t('nav.reports', 'Inventory Reports'),
        sub: t('nav.groupChannels', 'Reports'),
      };
    }
    if (p.includes('/products/new')) {
      return {
        main: t('products.newProduct', 'New Product'),
        sub: t('nav.products', 'Catalog & Products'),
      };
    }
    if (p.includes('/products')) {
      return {
        main: t('nav.products', 'Products'),
        sub: t('nav.groupCommerce', 'Catalog & Inventory'),
      };
    }
    if (p.includes('/categories') || p.includes('/menu/category')) {
      return {
        main: t('nav.categories', 'Categories'),
        sub: t('nav.groupCommerce', 'Catalog Classification'),
      };
    }
    if (p.includes('/orders')) {
      return {
        main: t('nav.orders', 'Orders'),
        sub: t('nav.groupCommerce', 'Sales & Fulfillment'),
      };
    }
    if (p.includes('/stock') || p.includes('/inventory')) {
      return {
        main: t('nav.stock', 'Inventory'),
        sub: t('nav.groupCommerce', 'Stock Management'),
      };
    }
    if (p.includes('/pos')) {
      return {
        main: t('nav.pos', 'POS Sale'),
        sub: t('nav.groupOverview', 'Point of Sale Terminal'),
      };
    }
    if (p.includes('/customers')) {
      return {
        main: t('nav.customers', 'Customers'),
        sub: t('nav.groupCommerce', 'Directory & History'),
      };
    }
    if (p.includes('/receipts')) {
      return {
        main: t('nav.receipts', 'Invoices & Receipts'),
        sub: t('nav.groupCommerce', 'Sales Documents'),
      };
    }
    if (p.includes('/backup')) {
      return {
        main: t('nav.backup', 'Backup & Restore'),
        sub: t('nav.groupSystem', 'Settings'),
      };
    }
    if (p.includes('/payment')) {
      return {
        main: t('nav.payment', 'Payment Settings'),
        sub: t('nav.groupChannels', 'Settings'),
      };
    }
    if (p.includes('/telegram')) {
      return {
        main: t('nav.telegram', 'Telegram Bot'),
        sub: t('nav.groupChannels', 'Channels'),
      };
    }
    if (p.includes('/upgrade')) {
      return {
        main: t('nav.upgrade', 'Upgrade Plan'),
        sub: t('nav.groupSystem', 'Billing & Subscription'),
      };
    }
    if (p.includes('/settings')) {
      return {
        main: t('nav.settings', 'Shop Settings'),
        sub: t('nav.groupSystem', 'Settings'),
      };
    }
    if (p.includes('/floor-plan')) {
      return {
        main: t('nav.floorPlan', 'Floor Plan'),
        sub: t('nav.groupOverview', 'Table Management'),
      };
    }
    if (p.includes('/kitchen-display')) {
      return {
        main: t('nav.kitchenDisplay', 'Kitchen Display'),
        sub: t('nav.groupOverview', 'Live Orders'),
      };
    }
    if (p.includes('/reservations')) {
      return {
        main: t('nav.reservations', 'Reservations'),
        sub: t('nav.groupOverview', 'Bookings'),
      };
    }
    if (p.includes('/profile') || p.includes('/pages/user-profile')) {
      return {
        main: t('nav.profile', 'My Profile'),
        sub: t('nav.groupSystem', 'Account & Security'),
      };
    }
    return {
      main: t('nav.dashboard', 'Dashboard'),
      sub: t('nav.groupOverview', 'Overview & Health'),
    };
  }, [location.pathname, t]);

  return (
    <header
      style={{
        backgroundColor: 'var(--navbar-bg, #ffffff)',
        color: 'var(--navbar-text, #142628)',
        borderColor: 'var(--navbar-border, #dfe7df)',
        boxShadow: 'var(--navbar-shadow, none)',
        height: 'var(--navbar-height, 64px)',
      }}
      className="border-b sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between transition-colors backdrop-blur-md font-sans"
    >
      {/* Left: Mobile Toggle (on < md) + Clean Page Title & Subtitle */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Menu (Only on small screens < 768px) */}
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            aria-label="Toggle Navigation Menu"
            className="md:hidden size-9 rounded-lg border border-border/80 bg-muted/40 hover:bg-muted text-inherit flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <FiMenu className="size-5" />
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
        {/* Search Workspace Input (Reference: 🔍 Search workspace ⌘K) */}
        <div
          onClick={() => navigate('/products')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f4f6f4] dark:bg-[#152a2c] border border-[#dfe6df] dark:border-[#223d40] text-xs text-[#526663] dark:text-[#9fb0ac] hover:border-[var(--primary-hex,#ec4899)] focus-within:border-[var(--primary-hex,#ec4899)] focus-within:ring-1 focus-within:ring-[var(--primary-hex,#ec4899)] w-44 lg:w-56 xl:w-64 cursor-pointer transition-all"
        >
          <FiSearch className="size-3.5 text-slate-400 shrink-0" />
          <span className="truncate">Search workspace</span>
          <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-[#0e1b1d] border border-[#dfe6df] dark:border-[#2a4245] text-[#718783] dark:text-[#8ea39f] shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Quick Add Button with Dropdown (Follows Active Theme Primary Setting) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              style={{
                backgroundColor: 'var(--btn-primary-hex, var(--primary-hex, var(--sidebar-active-bg, #ec4899)))',
              }}
              className="active:scale-95 text-white hover:brightness-110 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-[13px] font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
            >
              <FiPlus className="size-3.5 sm:size-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Quick Add</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-52 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl text-xs font-medium"
          >
            <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 py-1">
              Create New Action
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigate('/products/new')}
              className="gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100"
            >
              <FiPackage
                style={{ color: 'var(--primary-hex, var(--sidebar-active-bg, #ec4899))' }}
                className="size-4"
              />
              <span>New Product</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/pos')}
              className="gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100"
            >
              <FiCreditCard
                style={{ color: 'var(--primary-hex, var(--sidebar-active-bg, #ec4899))' }}
                className="size-4"
              />
              <span>POS Terminal Sale</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/orders')}
              className="gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100"
            >
              <FiShoppingBag
                style={{ color: 'var(--primary-hex, var(--sidebar-active-bg, #ec4899))' }}
                className="size-4"
              />
              <span>Record Order</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/menu/category')}
              className="gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100"
            >
              <FiTag
                style={{ color: 'var(--primary-hex, var(--sidebar-active-bg, #ec4899))' }}
                className="size-4"
              />
              <span>New Category</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/customers')}
              className="gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100"
            >
              <FiUsers
                style={{ color: 'var(--primary-hex, var(--sidebar-active-bg, #ec4899))' }}
                className="size-4"
              />
              <span>New Customer</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications Dropdown with Alert Badge */}
        <NotificationDropdown />

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={`size-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
            isNavbarDark
              ? 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground border border-slate-200/80 dark:border-slate-700'
          }`}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <FiSun className="size-4 text-amber-400 rotate-0 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <FiMoon
              className={`size-4 rotate-0 transition-transform duration-300 hover:rotate-12 ${
                isNavbarDark ? 'text-amber-300' : 'text-slate-700 dark:text-slate-300'
              }`}
            />
          )}
        </button>

        {/* Compact Dropdown Language Switcher (Doesn't crowd navbar) */}
        <LanguageSwitcher variant="dropdown" />

        {/* SmartHR User Profile Pill (Avatar + First Name + Chevron) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-[#162a2d] transition-all outline-none cursor-pointer text-left ml-0.5 sm:ml-1"
            >
              <Avatar className="size-8 ring-1 ring-slate-200 dark:ring-[#2a4245] shadow-2xs">
                <AvatarImage src={user?.avatar_url ? fullUrl(user.avatar_url) : ''} alt={displayName} />
                <AvatarFallback
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--primary-hex, #ec4899) 18%, transparent)',
                    color: 'var(--primary-hex, #ec4899)',
                  }}
                  className="font-bold text-xs uppercase"
                >
                  {initial}
                </AvatarFallback>
              </Avatar>

              <div className="hidden sm:flex items-center gap-1 min-w-0 pr-0.5">
                <span className="text-xs font-semibold text-[#142628] dark:text-[#f0f4f2] truncate max-w-[90px]">
                  {userFirstName}
                </span>
                <FiChevronDown className="size-3 text-slate-400 shrink-0" />
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-60 p-2 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 animate-in fade-in-0 zoom-in-95 text-xs font-sans"
          >
            {/* Header info - Click to view profile */}
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors cursor-pointer group mb-1"
              title={t('nav.viewProfile', 'View Profile')}
            >
              <Avatar className="size-9 ring-1 ring-slate-200 dark:ring-slate-700 group-hover:ring-[var(--primary-hex,#ec4899)] transition-all">
                <AvatarImage src={user?.avatar_url ? fullUrl(user.avatar_url) : ''} alt={displayName} />
                <AvatarFallback
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--primary-hex, #ec4899) 18%, transparent)',
                    color: 'var(--primary-hex, #ec4899)',
                  }}
                  className="font-bold text-xs"
                >
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-[var(--primary-hex,#ec4899)] transition-colors">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {displayEmail}
                </p>
              </div>
              <FiChevronRight className="size-3.5 text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors" />
            </div>

            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              {roleName} {user?.shop_id && `• Shop #${user.shop_id}`}
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="my-1 bg-slate-200 dark:bg-slate-700" />

            <DropdownMenuItem
              onClick={() => navigate('/profile')}
              style={{ color: 'var(--primary-hex, #ec4899)' }}
              className="gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <FiUser className="size-3.5" />
              <span>{t('nav.viewProfile', 'My Profile')}</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate('/settings')}
              className="gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <FiSettings className="size-3.5 text-slate-400" />
              <span>{t('nav.shopSettings', 'Shop Settings')}</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate('/pos')}
              className="gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <FiCreditCard className="size-3.5 text-slate-400" />
              <span>{t('nav.pos', 'POS Register')}</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate('/orders')}
              className="gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <FiShoppingBag className="size-3.5 text-slate-400" />
              <span>{t('nav.orders', 'Orders & Sales')}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-slate-200 dark:bg-slate-700" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2.5 px-2.5 py-2 text-xs rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
            >
              <FiLogOut className="size-3.5" />
              <span>{t('auth.logout', 'Sign Out')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
