import React, { useEffect, useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  ExternalLink,
  Store,
  X,
} from 'lucide-react';
import { MERCHANT_NAV_GROUPS } from '../../config/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n';
import { fullUrl } from '../../api';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  // Backward compatibility with AppLayout
  isOpen?: boolean;
  onClose?: () => void;
}

// StaffStream EMS Brand Emblem (Dynamically adapted to Active Theme / Primary Setting)
export const StaffStreamLogoEmblem: React.FC<{ className?: string }> = ({ className = 'size-9' }) => (
  <div
    style={{
      background:
        'linear-gradient(135deg, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 0%, color-mix(in srgb, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 65%, black) 100%)',
      borderColor: 'color-mix(in srgb, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 35%, transparent)',
      boxShadow: '0 4px 14px color-mix(in srgb, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 25%, transparent)',
    }}
    className={`${className} rounded-xl flex items-center justify-center text-white shrink-0 border relative overflow-hidden`}
  >
    <Store className="size-4.5 sm:size-5 text-white" />
  </div>
);

export const ShopLogoEmblem = StaffStreamLogoEmblem;
export const SmartHREmblem = StaffStreamLogoEmblem;
export const ApexLogoEmblem = StaffStreamLogoEmblem;
export const FinoraLogoEmblem = StaffStreamLogoEmblem;

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onMobileClose,
  isOpen,
  onClose,
}) => {
  const { user, shop, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const isMobileOpen = mobileOpen !== undefined ? mobileOpen : Boolean(isOpen);
  const handleCloseMobile = onMobileClose || onClose;

  // Live real-time clock for the "Network Stable" status bar
  const [currentTime, setCurrentTime] = useState(() => {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut: Cmd+B / Ctrl+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (onToggle) onToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (handleCloseMobile) handleCloseMobile();
  };

  const handleNavClick = () => {
    if (handleCloseMobile) handleCloseMobile();
  };

  const storefrontUrl = `http://localhost:3000/${user?.username || ''}`;

  const shopName =
    shop?.shop_name ||
    shop?.name ||
    user?.shop_name ||
    'MiniStore';

  const shopSubtitle = 'MERCHANT';

  // Compute initials for user profile badge
  const userInitials = useMemo(() => {
    if (user?.full_name) {
      const parts = user.full_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.full_name.substring(0, 2).toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'MS';
  }, [user]);

  const userDisplayName = user?.full_name || user?.username || 'Merchant User';
  const userRole = user?.role === 'staff' ? 'Staff' : 'Shop Owner';

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        style={{
          backgroundColor: 'var(--sidebar-bg, #0b1329)',
          color: 'var(--sidebar-text, #94a3b8)',
          borderColor: 'var(--sidebar-border, #1e293b)',
          width: collapsed ? 70 : 'var(--sidebar-width, 260px)',
        }}
        className={`border-r flex flex-col fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out select-none font-sans ${
          isMobileOpen
            ? 'translate-x-0 shadow-2xl'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header: Logo, Name & Collapse/Expand Toggle */}
        <div
          style={{ borderColor: 'var(--sidebar-border, #1e293b)' }}
          className={`h-16 px-4 flex items-center border-b relative shrink-0 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div
            onClick={() => {
              navigate('/dashboard');
              handleNavClick();
            }}
            className={`flex items-center gap-3 cursor-pointer min-w-0 ${
              collapsed ? 'justify-center' : 'flex-1'
            }`}
          >
            {shop?.logo && shop.logo.trim() ? (
              <img
                src={fullUrl(shop.logo)}
                alt={shopName}
                style={{
                  borderColor:
                    'color-mix(in srgb, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 45%, transparent)',
                  boxShadow:
                    '0 4px 14px color-mix(in srgb, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 20%, transparent)',
                }}
                className="size-9 rounded-xl object-cover ring-1 shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <ShopLogoEmblem className="size-9" />
            )}

            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[14.5px] text-white tracking-tight leading-tight truncate">
                    {shopName}
                  </span>
                  <span
                    style={{
                      color: 'var(--sidebar-active-bg, var(--primary-hex, #ec4899))',
                      backgroundColor:
                        'color-mix(in srgb, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 16%, transparent)',
                      borderColor:
                        'color-mix(in srgb, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 35%, transparent)',
                    }}
                    className="text-[9px] font-bold border px-1 py-0.2 rounded tracking-wider uppercase leading-none"
                  >
                    STORE
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#678b86] tracking-[0.14em] uppercase leading-none mt-1 truncate">
                  {shopSubtitle}
                </span>
              </div>
            )}
          </div>

          {/* Close button for Mobile Drawer (visible on < md) */}
          {isMobileOpen && (
            <button
              type="button"
              onClick={handleCloseMobile}
              className="md:hidden size-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close Sidebar"
            >
              <X className="size-5 text-slate-300" />
            </button>
          )}

          {/* Circular Collapse/Expand Toggle Button (Visible on md and larger) */}
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              style={{
                backgroundColor: 'var(--sidebar-bg, #0b1329)',
                borderColor: 'var(--sidebar-border, #1e293b)',
                color: 'var(--sidebar-text, #94a3b8)',
              }}
              className="hidden md:flex absolute -right-3 top-5 z-40 size-6 rounded-full items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none hover:border-[var(--sidebar-active-bg,var(--primary-hex,#ec4899))] hover:text-white"
              title={collapsed ? 'Expand sidebar (⌘B)' : 'Collapse sidebar (⌘B)'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight
                  style={{ color: 'var(--sidebar-active-bg, var(--primary-hex, #ec4899))' }}
                  className="size-3.5"
                />
              ) : (
                <ChevronLeft
                  style={{ color: 'var(--sidebar-active-bg, var(--primary-hex, #ec4899))' }}
                  className="size-3.5"
                />
              )}
            </button>
          )}
        </div>

        {/* Live Network Status Bar */}
        <div
          style={{ borderColor: 'var(--sidebar-border, #1e293b)' }}
          className={`px-4 py-2 border-b flex items-center select-none text-[11px] font-mono shrink-0 bg-black/20 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="relative flex h-2.5 w-2.5 cursor-pointer">
                  <span
                    style={{
                      backgroundColor: 'var(--sidebar-active-bg, var(--primary-hex, #ec4899))',
                    }}
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  />
                  <span
                    style={{
                      backgroundColor: 'var(--sidebar-active-bg, var(--primary-hex, #ec4899))',
                    }}
                    className="relative inline-flex rounded-full h-2.5 w-2.5"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                style={{
                  backgroundColor: 'var(--sidebar-bg, #0b1329)',
                  borderColor: 'var(--sidebar-border, #1e293b)',
                }}
                className="text-white border shadow-xl"
              >
                <p className="font-sans font-medium text-xs">Network Stable</p>
                <p
                  style={{ color: 'var(--sidebar-active-bg, var(--primary-hex, #ec4899))' }}
                  className="font-mono text-[10px]"
                >
                  {currentTime}
                </p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span
                    style={{
                      backgroundColor: 'var(--sidebar-active-bg, var(--primary-hex, #ec4899))',
                    }}
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  />
                  <span
                    style={{
                      backgroundColor: 'var(--sidebar-active-bg, var(--primary-hex, #ec4899))',
                    }}
                    className="relative inline-flex rounded-full h-2 w-2"
                  />
                </span>
                <span className="font-sans text-[11px] font-medium tracking-tight text-slate-300">
                  Network Stable
                </span>
              </div>
              <span
                style={{
                  color: 'color-mix(in srgb, var(--sidebar-text, #94a3b8) 75%, transparent)',
                }}
                className="text-[11px] font-mono tabular-nums"
              >
                {currentTime}
              </span>
            </>
          )}
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-3.5 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {MERCHANT_NAV_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!collapsed ? (
                <p
                  style={{
                    color: 'color-mix(in srgb, var(--sidebar-text, #94a3b8) 60%, transparent)',
                  }}
                  className="px-3 pt-2 pb-1 text-[10.5px] font-semibold uppercase tracking-wider select-none"
                >
                  {t(group.groupKey, group.groupLabel)}
                </p>
              ) : (
                <div
                  style={{ backgroundColor: 'var(--sidebar-border, #1e293b)' }}
                  className="h-px my-2 mx-2"
                />
              )}

              {group.items.map((item) => {
                const badgeText = item.badge;

                const linkContent = (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={handleNavClick}
                    style={({ isActive }) =>
                      isActive
                        ? {
                            borderLeft: collapsed
                              ? 'none'
                              : '3px solid var(--sidebar-active-bg, var(--primary-hex, #ec4899))',
                            backgroundColor:
                              'color-mix(in srgb, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 14%, transparent)',
                            color: 'var(--sidebar-active-text, #ffffff)',
                          }
                        : {
                            color: 'var(--sidebar-text, #94a3b8)',
                          }
                    }
                    className={({ isActive }) =>
                      `flex items-center rounded-xl text-[13px] font-medium transition-all select-none outline-none group relative focus-visible:ring-2 focus-visible:ring-[var(--sidebar-active-bg,var(--primary-hex,#ec4899))] ${
                        collapsed ? 'justify-center size-10 mx-auto' : 'gap-3 px-3 py-2'
                      } ${
                        isActive
                          ? 'font-semibold shadow-2xs'
                          : 'hover:text-white hover:bg-white/[0.05]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Collapsed Active Indicator Dot with Glow */}
                        {collapsed && isActive && (
                          <span
                            style={{
                              backgroundColor:
                                'var(--sidebar-active-bg, var(--primary-hex, #ec4899))',
                              boxShadow:
                                '0 0 10px var(--sidebar-active-bg, var(--primary-hex, #ec4899))',
                            }}
                            className="absolute left-1 size-1.5 rounded-full animate-pulse"
                          />
                        )}

                        <span
                          style={
                            isActive
                              ? {
                                  color:
                                    'var(--sidebar-active-bg, var(--primary-hex, #ec4899))',
                                }
                              : undefined
                          }
                          className={`shrink-0 transition-colors relative flex items-center justify-center ${
                            isActive ? '' : 'text-[#8ea39f] group-hover:text-white'
                          }`}
                        >
                          {item.icon}

                          {/* Collapsed Badge Bubble */}
                          {collapsed && badgeText && (
                            <span
                              style={{
                                backgroundColor:
                                  'var(--sidebar-active-bg, var(--primary-hex, #ec4899))',
                                color: 'var(--sidebar-active-text, #ffffff)',
                              }}
                              className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-[#0a1e1d]"
                            >
                              {badgeText}
                            </span>
                          )}
                        </span>

                        {!collapsed && (
                          <>
                            <span className="truncate flex-1 tracking-tight">
                              {item.labelKey ? t(item.labelKey, item.label) : item.label}
                            </span>

                            {/* Expanded Badge Pill */}
                            {badgeText && (
                              <span
                                style={{
                                  color:
                                    'var(--sidebar-active-bg, var(--primary-hex, #ec4899))',
                                  backgroundColor:
                                    'color-mix(in srgb, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 18%, transparent)',
                                  borderColor:
                                    'color-mix(in srgb, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 35%, transparent)',
                                }}
                                className="ml-auto border text-[10.5px] font-semibold px-2 py-0.5 rounded-full leading-none shrink-0 font-mono"
                              >
                                {badgeText}
                              </span>
                            )}

                            {/* Submenu Indicator Chevron */}
                            {item.children && item.children.length > 0 && (
                              <ChevronDown className="size-3.5 text-[#678b86] ml-1 shrink-0 group-hover:text-white transition-colors" />
                            )}
                          </>
                        )}
                      </>
                    )}
                  </NavLink>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.to}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent
                        side="right"
                        sideOffset={12}
                        style={{
                          backgroundColor: 'var(--sidebar-bg, #0b1329)',
                          borderColor: 'var(--sidebar-border, #1e293b)',
                        }}
                        className="text-white border shadow-xl text-xs py-1 px-2.5 rounded-md flex items-center gap-1.5"
                      >
                        <span>{item.labelKey ? t(item.labelKey, item.label) : item.label}</span>
                        {badgeText && (
                          <span
                            style={{
                              backgroundColor:
                                'var(--sidebar-active-bg, var(--primary-hex, #ec4899))',
                              color: 'var(--sidebar-active-text, #ffffff)',
                            }}
                            className="text-[10px] font-bold px-1.5 py-0.2 rounded-full"
                          >
                            {badgeText}
                          </span>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return linkContent;
              })}

              {/* External Storefront Link in Channels Group */}
              {group.groupKey === 'nav.groupChannels' && (
                <>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={storefrontUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center size-10 mx-auto rounded-xl text-[#8ea39f] hover:text-[var(--sidebar-active-bg,var(--primary-hex,#ec4899))] hover:bg-white/[0.05] transition-colors"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        sideOffset={12}
                        style={{
                          backgroundColor: 'var(--sidebar-bg, #0b1329)',
                          borderColor: 'var(--sidebar-border, #1e293b)',
                        }}
                        className="text-white border shadow-xl text-xs py-1 px-2.5 rounded-md"
                      >
                        {t('nav.storefront', 'Storefront')} ↗
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <a
                      href={storefrontUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-[#8ea39f] hover:text-white hover:bg-white/[0.05] transition-colors select-none group"
                    >
                      <span className="truncate">{t('nav.storefront', 'Storefront')}</span>
                      <ExternalLink className="size-3.5 text-[#678b86] group-hover:text-[var(--sidebar-active-bg,var(--primary-hex,#ec4899))] transition-colors" />
                    </a>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile & Logout Footer */}
        <div
          style={{ borderColor: 'var(--sidebar-border, #1e293b)' }}
          className="p-3 border-t bg-black/25 shrink-0"
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  onClick={() => {
                    navigate('/profile');
                    handleNavClick();
                  }}
                  style={{
                    background:
                      'linear-gradient(135deg, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 0%, color-mix(in srgb, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 60%, black) 100%)',
                    boxShadow:
                      '0 4px 12px color-mix(in srgb, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 30%, transparent)',
                  }}
                  className="size-9 rounded-full text-white font-bold text-xs flex items-center justify-center mx-auto cursor-pointer hover:ring-2 hover:ring-[var(--sidebar-active-bg,var(--primary-hex,#ec4899))] transition-all"
                >
                  {userInitials}
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={12}
                style={{
                  backgroundColor: 'var(--sidebar-bg, #0b1329)',
                  borderColor: 'var(--sidebar-border, #1e293b)',
                }}
                className="text-white border shadow-xl text-xs py-1.5 px-3 rounded-md"
              >
                <p className="font-semibold text-white">{userDisplayName}</p>
                <p
                  style={{ color: 'var(--sidebar-active-bg, var(--primary-hex, #ec4899))' }}
                  className="text-[10px] uppercase font-medium"
                >
                  {userRole}
                </p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center justify-between gap-2.5 p-1.5 rounded-xl hover:bg-white/[0.04] transition-colors">
              <div
                onClick={() => {
                  navigate('/profile');
                  handleNavClick();
                }}
                className="min-w-0 flex items-center gap-2.5 flex-1 cursor-pointer group transition-all select-none"
                title={t('nav.viewProfile', 'Show Profile')}
              >
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 0%, color-mix(in srgb, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 60%, black) 100%)',
                    borderColor:
                      'color-mix(in srgb, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 40%, transparent)',
                  }}
                  className="size-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm border"
                >
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-white truncate group-hover:text-[var(--sidebar-active-bg,var(--primary-hex,#ec4899))] transition-colors">
                    {userDisplayName}
                  </p>
                  <p className="text-[11px] text-[#678b86] uppercase font-medium truncate">
                    {userRole} • Store
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="size-7 rounded-lg text-[#8ea39f] hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                title={t('auth.logout', 'Logout')}
                aria-label={t('auth.logout', 'Logout')}
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
