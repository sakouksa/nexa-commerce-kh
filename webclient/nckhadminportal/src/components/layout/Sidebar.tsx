import React, { useEffect, useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Users,
  BadgePercent,
  Database,
  Activity,
  Settings,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  LogOut,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import defaultLogo from '../../assets/logo.png';

export interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  // Backward compatibility
  isMobile?: boolean;
  onCloseMobile?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminPlatformEmblem: React.FC<{ className?: string }> = ({
  className = 'size-9',
}) => (
  <div
    style={{
      background:
        'linear-gradient(135deg, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 0%, color-mix(in srgb, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 65%, black) 100%)',
      borderColor:
        'color-mix(in srgb, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 35%, transparent)',
      boxShadow:
        '0 4px 14px color-mix(in srgb, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 25%, transparent)',
    }}
    className={`${className} rounded-xl flex items-center justify-center text-white shrink-0 border relative overflow-hidden`}
  >
    <ShieldCheck className="size-4.5 sm:size-5 text-white" />
  </div>
);

interface NavItemConfig {
  to: string;
  labelKey: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
  badge?: string | number;
  isExternal?: boolean;
}

interface NavGroupConfig {
  id: string;
  groupKey: string;
  groupLabel: string;
  items: NavItemConfig[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onMobileClose,
  isMobile = false,
  onCloseMobile,
  isOpen,
  onClose,
}) => {
  const { user, logout } = useAuth();
  const { t, isKhmer } = useLanguage();
  const navigate = useNavigate();

  const isMobileOpen = mobileOpen || Boolean(isOpen) || (isMobile && Boolean(isOpen));
  const handleCloseMobile = onMobileClose || onCloseMobile || onClose;

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
    navigate('/sign-in-admin');
    if (handleCloseMobile) handleCloseMobile();
  };

  const handleNavClick = () => {
    if (handleCloseMobile) handleCloseMobile();
  };

  const username = user?.username || 'admin';
  const displayName = user?.full_name || username;
  const roleName = user?.role ? user.role.toUpperCase() : 'SUPER ADMIN';

  // Compute initials for user avatar
  const userInitials = useMemo(() => {
    if (user?.full_name) {
      const parts = user.full_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.full_name.substring(0, 2).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  }, [user?.full_name, username]);

  // Clean Navigation Structure
  const navGroups: NavGroupConfig[] = [
    {
      id: 'platform',
      groupKey: 'nav.groupOverview',
      groupLabel: isKhmer ? 'គ្រប់គ្រងទូទៅ' : 'Platform Operations',
      items: [
        {
          to: '/dashboard',
          labelKey: 'nav.dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="size-4.5" />,
          end: true,
        },
        {
          to: '/shops',
          labelKey: 'nav.shops',
          label: 'Shops & Outlets',
          icon: <Store className="size-4.5" />,
        },
        {
          to: '/users',
          labelKey: 'nav.users',
          label: 'Users',
          icon: <Users className="size-4.5" />,
        },
        {
          to: '/resellers',
          labelKey: 'nav.resellers',
          label: 'Resellers & Affiliates',
          icon: <BadgePercent className="size-4.5" />,
        },
        {
          to: '/activity',
          labelKey: 'nav.activity',
          label: 'Analytics & Logs',
          icon: <Activity className="size-4.5" />,
        },
      ],
    },
    {
      id: 'system',
      groupKey: 'nav.groupSystem',
      groupLabel: isKhmer ? 'ប្រព័ន្ធ & ឧបករណ៍' : 'System & Tools',
      items: [
        {
          to: '/backup',
          labelKey: 'nav.backup',
          label: 'Database Backup',
          icon: <Database className="size-4.5" />,
        },
        {
          to: '/settings',
          labelKey: 'nav.settings',
          label: 'Settings',
          icon: <Settings className="size-4.5" />,
        },
        {
          to: 'http://localhost:3000',
          labelKey: 'common.storefront',
          label: 'Customer Storefront',
          icon: <ExternalLink className="size-4.5" />,
          isExternal: true,
        },
      ],
    },
  ];

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
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header: Logo, Name & Circular Toggle */}
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
            {defaultLogo ? (
              <img
                src={defaultLogo}
                alt="Nexa Commerce KH"
                style={{
                  borderColor:
                    'color-mix(in srgb, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 45%, transparent)',
                  boxShadow:
                    '0 4px 14px color-mix(in srgb, var(--sidebar-active-bg, var(--primary-hex, #ec4899)) 20%, transparent)',
                }}
                className="size-9 rounded-xl object-contain ring-1 shrink-0 bg-slate-900/60 p-1"
              />
            ) : (
              <AdminPlatformEmblem className="size-9" />
            )}

            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[14.5px] text-white tracking-tight leading-tight truncate">
                    Nexa Commerce KH
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
                    ADMIN
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#678b86] tracking-[0.14em] uppercase leading-none mt-1 truncate">
                  PLATFORM CONTROL
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

          {/* Circular Collapse/Expand Toggle Button on the edge (Visible on md and larger) */}
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              style={{
                backgroundColor: 'var(--sidebar-bg, #0b1329)',
                borderColor: 'var(--sidebar-border, #1e293b)',
              }}
              className="hidden md:flex absolute -right-3 top-5 z-40 size-6 rounded-full border items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none hover:border-[var(--sidebar-active-bg,var(--primary-hex,#ec4899))] hover:text-white"
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
            <Tooltip delayDuration={80}>
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
                className="text-white border shadow-xl px-2.5 py-1.5"
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
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-3.5 no-scrollbar">
          {navGroups.map((group) => (
            <div key={group.id} className="space-y-1">
              {!collapsed ? (
                <p
                  style={{
                    color: 'color-mix(in srgb, var(--sidebar-text, #94a3b8) 60%, transparent)',
                  }}
                  className="px-3 pt-2 pb-1 text-[10.5px] font-semibold uppercase tracking-wider select-none"
                >
                  {group.groupLabel}
                </p>
              ) : (
                <div
                  style={{ backgroundColor: 'var(--sidebar-border, #1e293b)' }}
                  className="h-px my-2 mx-2"
                />
              )}

              {group.items.map((item) => {
                if (item.isExternal) {
                  const extContent = (
                    <a
                      key={item.to}
                      href={item.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleNavClick}
                      style={{ color: 'var(--sidebar-text, #94a3b8)' }}
                      className={`flex items-center rounded-xl text-[13px] font-medium transition-all select-none outline-none group relative hover:text-white hover:bg-white/[0.05] ${
                        collapsed ? 'justify-center size-10 mx-auto' : 'gap-3 px-3 py-2'
                      }`}
                    >
                      <span className="shrink-0 flex items-center justify-center text-[#8ea39f] group-hover:text-white">
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <>
                          <span className="truncate flex-1 tracking-tight">
                            {item.labelKey ? t(item.labelKey, item.label) : item.label}
                          </span>
                          <ExternalLink className="size-3.5 text-[#678b86] group-hover:text-[var(--sidebar-active-bg,var(--primary-hex,#ec4899))] transition-colors shrink-0" />
                        </>
                      )}
                    </a>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.to} delayDuration={80}>
                        <TooltipTrigger asChild>{extContent}</TooltipTrigger>
                        <TooltipContent
                          side="right"
                          sideOffset={12}
                          style={{
                            backgroundColor: 'var(--sidebar-bg, #0b1329)',
                            borderColor: 'var(--sidebar-border, #1e293b)',
                          }}
                          className="text-white border shadow-xl text-xs py-1 px-2.5 rounded-md"
                        >
                          {item.labelKey ? t(item.labelKey, item.label) : item.label} ↗
                        </TooltipContent>
                      </Tooltip>
                    );
                  }
                  return extContent;
                }

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
                        </span>

                        {!collapsed && (
                          <span className="truncate flex-1 tracking-tight">
                            {item.labelKey ? t(item.labelKey, item.label) : item.label}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.to} delayDuration={80}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent
                        side="right"
                        sideOffset={12}
                        style={{
                          backgroundColor: 'var(--sidebar-bg, #0b1329)',
                          borderColor: 'var(--sidebar-border, #1e293b)',
                        }}
                        className="text-white border shadow-xl text-xs py-1 px-2.5 rounded-md"
                      >
                        {item.labelKey ? t(item.labelKey, item.label) : item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return linkContent;
              })}
            </div>
          ))}
        </nav>

        {/* User Profile & Logout Footer */}
        <div
          style={{ borderColor: 'var(--sidebar-border, #1e293b)' }}
          className="p-3 border-t bg-black/25 shrink-0"
        >
          {collapsed ? (
            <Tooltip delayDuration={80}>
              <TooltipTrigger asChild>
                <div
                  onClick={() => {
                    navigate('/settings');
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
                <p className="font-semibold text-white">{username}</p>
                <p
                  style={{ color: 'var(--sidebar-active-bg, var(--primary-hex, #ec4899))' }}
                  className="text-[10px] uppercase font-medium"
                >
                  {roleName}
                </p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center justify-between gap-2.5 p-1.5 rounded-xl hover:bg-white/[0.04] transition-colors">
              <div
                onClick={() => {
                  navigate('/settings');
                  handleNavClick();
                }}
                className="min-w-0 flex items-center gap-2.5 flex-1 cursor-pointer group transition-all select-none"
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
                    {displayName}
                  </p>
                  <p className="text-[11px] text-[#678b86] uppercase font-medium truncate">
                    {roleName} • Platform
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
