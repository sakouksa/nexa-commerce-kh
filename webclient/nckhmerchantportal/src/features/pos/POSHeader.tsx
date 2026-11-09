import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiMaximize2,
  FiMinimize2,
  FiSun,
  FiMoon,
  FiUser,
  FiSettings,
  FiShoppingBag,
  FiLogOut,
} from 'react-icons/fi';
import {
  ClipboardList,
  CookingPot,
  CalendarDays,
  LayoutGrid,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, LanguageSwitcher } from '../../i18n';
import { fullUrl } from '../../api';
import { FinoraLogoEmblem } from '../../components/layout/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface POSHeaderProps {
  isFullscreen: boolean;
  toggleFullScreen: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const POSHeader: React.FC<POSHeaderProps> = ({
  isFullscreen,
  toggleFullScreen,
  isDark,
  toggleTheme,
}) => {
  const navigate = useNavigate();
  const { user, shop, logout } = useAuth();
  const { t } = useLanguage();

  const shopName =
    shop?.shop_name ||
    shop?.name ||
    user?.shop_name ||
    (user?.shop_id ? `${t('nav.shopNumber', 'ហាងលេខ #')}${user.shop_id}` : 'MiniStore KH');

  const displayName = user?.full_name || user?.username || 'Merchant User';
  const displayEmail = user?.email || `${user?.username || 'merchant'}@ministorekh.com`;
  const roleName = user?.role === 'staff' ? 'Staff Member' : 'Shop Owner';
  const initial = (user?.username || user?.full_name || 'M').charAt(0).toUpperCase();

  const handleNavigate = (path: string) => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    navigate(path);
  };

  const handleLogout = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-40">
      {/* Left: Store Logo + Name + Nav Tabs */}
      <div className="flex items-center gap-5 lg:gap-6">
        <div
          onClick={() => handleNavigate('/')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          title={t('pos.exitPOS', 'Dashboard')}
        >
          {shop?.logo && shop.logo.trim() ? (
            <img
              src={fullUrl(shop.logo)}
              alt={shopName}
              className="size-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-800 shadow-2xs"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <FinoraLogoEmblem className="size-8" />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
              {shopName}
            </span>
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 leading-none">
              {t('pos.title', 'POS Register')}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => handleNavigate('/floor-plan')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LayoutGrid className="size-3.5 text-slate-500 dark:text-slate-400" />
            <span>{t('restaurant.floorPlan', 'Floor Plan')}</span>
          </button>
          <button
            onClick={() => handleNavigate('/kitchen-display')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <CookingPot className="size-3.5 text-slate-500 dark:text-slate-400" />
            <span>{t('restaurant.kitchenDisplay', 'Kitchen')}</span>
          </button>
          <button
            onClick={() => handleNavigate('/orders')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ClipboardList className="size-3.5 text-slate-500 dark:text-slate-400" />
            <span>{t('restaurant.orders', 'Orders')}</span>
          </button>
          <button
            onClick={() => handleNavigate('/reservations')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <CalendarDays className="size-3.5 text-slate-500 dark:text-slate-400" />
            <span>{t('restaurant.reservations', 'Reservations')}</span>
          </button>
        </nav>
      </div>

      {/* Right: Fullscreen, Language, Dashboard Button, Theme, User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Fullscreen Button */}
        <button
          onClick={toggleFullScreen}
          className="size-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
          title={isFullscreen ? t('pos.exitFullscreen', 'Exit Fullscreen') : t('pos.fullscreen', 'Fullscreen')}
        >
          {isFullscreen ? <FiMinimize2 className="size-3.5" /> : <FiMaximize2 className="size-3.5" />}
        </button>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Dashboard Shortcut Button */}
        <button
          onClick={() => handleNavigate('/')}
          className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title={t('pos.exitPOS', 'Dashboard')}
        >
          <FiArrowLeft className="size-3.5" />
          <span className="hidden sm:inline">{t('pos.exitPOS', 'Dashboard')}</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="size-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <FiSun className="size-4 text-amber-400" /> : <FiMoon className="size-4" />}
        </button>

        {/* User Profile Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative p-0.5 rounded-full hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-700 transition-all outline-none cursor-pointer ml-1"
            >
              <Avatar className="size-8 ring-1 ring-slate-200 dark:ring-slate-800">
                <AvatarImage src={user?.avatar_url ? fullUrl(user.avatar_url) : ''} alt={displayName} />
                <AvatarFallback className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <span
                className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950"
                title="Online"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-60 p-2 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-in fade-in-0 zoom-in-95 z-50"
          >
            {/* Header info */}
            <div
              onClick={() => handleNavigate('/profile')}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 transition-colors cursor-pointer group mb-1"
              title={t('nav.viewProfile', 'View Profile')}
            >
              <Avatar className="size-9 ring-1 ring-slate-200 dark:ring-slate-700 group-hover:ring-emerald-500 transition-all">
                <AvatarImage src={user?.avatar_url ? fullUrl(user.avatar_url) : ''} alt={displayName} />
                <AvatarFallback className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {displayEmail}
                </p>
                <span className="inline-flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-medium group-hover:underline">
                  {t('nav.viewProfile', 'View Profile')} →
                </span>
              </div>
            </div>

            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              {roleName} {user?.shop_id && `• Shop #${user.shop_id}`}
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />

            <DropdownMenuItem
              onClick={() => handleNavigate('/')}
              className="gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer"
            >
              <FiArrowLeft className="size-3.5 text-slate-400" />
              <span>{t('nav.dashboard', 'Dashboard')}</span>
            </DropdownMenuItem>

            {/* Show Profile */}
            <DropdownMenuItem
              onClick={() => handleNavigate('/profile')}
              className="gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              <FiUser className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('nav.viewProfile', 'View Profile')}</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleNavigate('/settings')}
              className="gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer"
            >
              <FiSettings className="size-3.5 text-slate-400" />
              <span>{t('nav.shopSettings', 'Shop Settings')}</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleNavigate('/orders')}
              className="gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer"
            >
              <FiShoppingBag className="size-3.5 text-slate-400" />
              <span>{t('nav.orders', 'Orders & Sales')}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2.5 px-2.5 py-2 text-xs rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
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
