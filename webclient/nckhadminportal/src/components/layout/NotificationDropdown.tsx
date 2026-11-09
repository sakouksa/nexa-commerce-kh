import React, { useState } from 'react';
import { Bell, CheckCheck, AlertTriangle, Store, Database, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '../../i18n';

interface NotificationItem {
  id: string;
  title: string;
  titleKh: string;
  description: string;
  descriptionKh: string;
  time: string;
  read: boolean;
  type: 'alert' | 'shop' | 'system';
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Low stock alert',
    titleKh: 'ការដាស់តឿនស្តុកទាប',
    description: '3 items below reorder threshold in Demo Store',
    descriptionKh: 'ទំនិញ 3 មុខទាបជាងកម្រិតស្តុកកំណត់ក្នុងហាង Demo',
    time: '5m ago',
    read: false,
    type: 'alert',
    link: '/activity',
  },
  {
    id: '2',
    title: 'New shop registration',
    titleKh: 'ការចុះឈ្មោះហាងថ្មី',
    description: 'Angkor Coffee Roasters opened a trial store',
    descriptionKh: 'Angkor Coffee Roasters បានបង្កើតហាងសាកល្បង',
    time: '42m ago',
    read: false,
    type: 'shop',
    link: '/shops',
  },
  {
    id: '3',
    title: 'Automated backup ready',
    titleKh: 'ទិន្នន័យបម្រុងស្វ័យប្រវត្តិរួចរាល់',
    description: 'Nightly database snapshot verified (12.4 MB)',
    descriptionKh: 'ការថតចម្លងមូលដ្ឋានទិន្នន័យយប់មិញបានជោគជ័យ (12.4 MB)',
    time: '2h ago',
    read: false,
    type: 'system',
    link: '/backup',
  },
];

export interface NotificationDropdownProps {
  isNavbarDark?: boolean;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isNavbarDark = false,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const { currentLang } = useLanguage();
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleItemClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    if (item.link) {
      navigate(item.link);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="size-4 text-amber-500" />;
      case 'shop':
        return <Store className="size-4 text-sky-500" />;
      case 'system':
        return <Database className="size-4 text-emerald-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="iconSm"
          className={`relative size-8 rounded-lg cursor-pointer transition-all shadow-2xs ${
            isNavbarDark
              ? 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 shadow-xl border-border/80">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">
              {currentLang === 'kh' ? 'ការជូនដំណឹង' : 'Notifications'}
            </span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                {unreadCount} {currentLang === 'kh' ? 'ថ្មី' : 'new'}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <CheckCheck className="size-3" />
              <span>{currentLang === 'kh' ? 'សម្គាល់ថាបានអាន' : 'Mark all read'}</span>
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/40 p-1">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              {currentLang === 'kh' ? 'គ្មានការជូនដំណឹងថ្មីទេ' : 'No notifications'}
            </div>
          ) : (
            notifications.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-3 rounded-lg flex items-start gap-3 cursor-pointer transition-colors ${
                  !item.read ? 'bg-primary/5 dark:bg-primary/10' : ''
                }`}
              >
                <div className="size-8 rounded-lg bg-background border border-border/60 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs truncate ${!item.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                      {currentLang === 'kh' ? item.titleKh : item.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground/80 shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                    {currentLang === 'kh' ? item.descriptionKh : item.description}
                  </p>
                </div>
                {!item.read && (
                  <span className="size-1.5 rounded-full bg-indigo-600 shrink-0 mt-2" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-border/60 bg-muted/10 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/activity')}
            className="w-full text-xs h-7 text-muted-foreground hover:text-foreground font-medium gap-1.5"
          >
            <span>{currentLang === 'kh' ? 'មើលកំណត់ហេតុទាំងអស់' : 'View all activity logs'}</span>
            <ExternalLink className="size-3" />
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
