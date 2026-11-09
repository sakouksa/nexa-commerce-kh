import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBell,
  FiAlertTriangle,
  FiUsers,
  FiCalendar,
  FiCreditCard,
  FiCheck,
  FiArrowRight,
  FiClock,
  FiShoppingBag,
  FiPackage,
} from 'react-icons/fi';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';

export interface NotificationItem {
  id: string;
  type: 'sla' | 'attendance' | 'leave' | 'payroll' | 'order' | 'stock';
  title: string;
  description: string;
  time: string;
  isUnread: boolean;
  dotColor?: string;
  link: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'sla',
    title: 'SLA alert',
    description: '3 work orders are approaching SLA breach.',
    time: '8 min ago',
    isUnread: true,
    dotColor: '#c2543a', // Coral / Red dot
    link: '/orders',
    iconBg: 'bg-[#f8dfd6] dark:bg-[#c2543a]/20',
    iconColor: 'text-[#c2543a] dark:text-[#e79683]',
    icon: <FiAlertTriangle className="size-4" />,
  },
  {
    id: 'notif-2',
    type: 'attendance',
    title: 'Attendance',
    description: '5 employees have not checked in.',
    time: '24 min ago',
    isUnread: true,
    dotColor: '#d97706', // Amber dot
    link: '/reports',
    iconBg: 'bg-[#fef3c7] dark:bg-[#d97706]/20',
    iconColor: 'text-[#d97706] dark:text-[#fbbf24]',
    icon: <FiUsers className="size-4" />,
  },
  {
    id: 'notif-3',
    type: 'leave',
    title: 'Leave request',
    description: 'Adam King submitted a leave request.',
    time: '1 hr ago',
    isUnread: true,
    dotColor: '#ea580c', // Teal dot
    link: '/reports',
    iconBg: 'bg-[#ffedd5] dark:bg-[#ea580c]/25',
    iconColor: 'text-[#ea580c] dark:text-[#f97316]',
    icon: <FiCalendar className="size-4" />,
  },
  {
    id: 'notif-4',
    type: 'payroll',
    title: 'Payroll',
    description: 'September payroll is ready for review.',
    time: '2 hrs ago',
    isUnread: true,
    dotColor: '#64777c',
    link: '/reports',
    iconBg: 'bg-[#e7eee7] dark:bg-[#1d3134]',
    iconColor: 'text-[#496668] dark:text-[#9fb0ac]',
    icon: <FiCreditCard className="size-4" />,
  },
];

export const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const handleItemClick = (item: NotificationItem) => {
    // Mark this specific notification as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isUnread: false } : n))
    );
    setOpen(false);
    navigate(item.link);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Open notifications"
          style={
            open
              ? {
                  borderColor:
                    'color-mix(in srgb, var(--primary-hex, #ec4899) 45%, transparent)',
                  boxShadow:
                    '0 0 0 2px color-mix(in srgb, var(--primary-hex, #ec4899) 20%, transparent)',
                }
              : undefined
          }
          className={`size-8 rounded-lg flex items-center justify-center transition-all cursor-pointer relative ${
            open
              ? 'bg-[#f7f8f2] dark:bg-[#17282b] text-[#16292e] dark:text-white border'
              : 'hover:bg-slate-100 dark:hover:bg-[#1d3134] text-[#71817e] hover:text-[#16292e] dark:text-[#9fb0ac] dark:hover:text-white'
          }`}
          title="Notifications"
        >
          <FiBell className="size-4" />
          {unreadCount > 0 && (
            <span
              style={{ backgroundColor: 'var(--primary-hex, #ec4899)' }}
              className="absolute top-1.5 right-1.5 size-1.5 rounded-full ring-2 ring-white dark:ring-[#142629] animate-pulse"
            />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[350px] sm:w-[380px] p-0 rounded-2xl border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] shadow-2xl text-[#16292e] dark:text-[#e7ede9] font-sans overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
      >
        {/* 1. Header (Reference: Notifications  4 new  |  ✓ Mark All Read) */}
        <div className="p-3.5 px-4 flex items-center justify-between border-b border-[#dfe7df]/80 dark:border-[#2a4245]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#16292e] dark:text-[#e7ede9] tracking-tight">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span
                  style={{ backgroundColor: 'var(--primary-hex, #ec4899)' }}
                  className="text-white text-[10.5px] px-2 py-0.5 rounded-full font-semibold font-mono leading-none"
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#71817e] dark:text-[#9fb0ac] mt-0.5">
              {unreadCount > 0
                ? `You have ${unreadCount} unread update${unreadCount > 1 ? 's' : ''}`
                : 'All caught up. No new updates.'}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              style={{ color: 'var(--primary-hex, #ec4899)' }}
              className="text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
            >
              <FiCheck className="size-3.5 stroke-[2.5]" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>

        {/* 2. Notification Items List */}
        <div className="divide-y divide-[#dfe7df]/50 dark:divide-[#2a4245]/50 max-h-[360px] overflow-y-auto no-scrollbar">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`p-3.5 px-4 flex items-start gap-3 cursor-pointer transition-colors group relative ${
                item.isUnread
                  ? 'bg-transparent hover:bg-[#f7f8f2] dark:hover:bg-[#17282b]'
                  : 'bg-transparent hover:bg-[#f7f8f2]/60 dark:hover:bg-[#17282b]/60 opacity-80'
              }`}
            >
              {/* Left Category Icon Box */}
              <div
                className={`size-9 rounded-xl flex items-center justify-center shrink-0 border border-black/5 dark:border-white/5 ${item.iconBg} ${item.iconColor}`}
              >
                {item.icon}
              </div>

              {/* Center Content */}
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    style={{ color: item.isUnread ? 'var(--primary-hex, #ec4899)' : undefined }}
                    className="text-xs font-bold text-[#16292e] dark:text-[#e7ede9] truncate transition-colors"
                  >
                    {item.title}
                  </h4>
                  {/* Unread Color Dot */}
                  {item.isUnread && (
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.dotColor || '#ea580c' }}
                      title="Unread"
                    />
                  )}
                </div>

                <p className="text-[11.5px] text-[#71817e] dark:text-[#9fb0ac] mt-0.5 leading-snug line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center gap-1 text-[10px] text-[#a3aeab] dark:text-[#7fa59e] mt-1.5 font-mono">
                  <FiClock className="size-2.5" />
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Footer (Reference: View All Notifications →) */}
        <div className="p-2.5 text-center border-t border-[#dfe7df]/80 dark:border-[#2a4245] bg-[#fafbf9] dark:bg-[#102325]">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate('/orders');
            }}
            style={{ color: 'var(--primary-hex, #ec4899)' }}
            className="text-xs font-semibold hover:underline inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>View All Notifications</span>
            <FiArrowRight className="size-3.5" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;

