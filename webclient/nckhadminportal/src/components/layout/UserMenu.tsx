import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Activity, ShieldCheck, Database } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentLang } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/sign-in-admin');
  };

  const username = user?.username || 'admin';
  const fullName = user?.full_name || username;
  const email = user?.email || `${username}@ministorekh.com`;
  const roleName = user?.role ? user.role.toUpperCase() : 'SUPER ADMIN';
  const initial = username.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-accent/80 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="User account menu"
        >
          <div className="relative shrink-0">
            <Avatar className="size-8 border border-slate-200 dark:border-slate-800">
              <AvatarImage src="" alt={username} />
              <AvatarFallback className="bg-slate-900 text-white font-semibold text-xs">
                {initial}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
          </div>
          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-xs font-semibold text-foreground truncate max-w-[110px]">
              {fullName}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              {roleName}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl border-border/80">
        {/* User Info Header */}
        <div className="px-2.5 py-2">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-foreground truncate">{fullName}</p>
            <Badge variant="secondary" className="text-[9px] h-4 px-1 uppercase tracking-wide bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {roleName}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{email}</p>
        </div>

        <DropdownMenuSeparator />

        {/* Navigation Items */}
        <DropdownMenuItem
          onClick={() => navigate('/settings')}
          className="gap-2.5 text-xs py-2 cursor-pointer"
        >
          <Settings className="size-4 text-muted-foreground" />
          <span>{currentLang === 'kh' ? 'ការកំណត់ប្រព័ន្ធ' : 'Platform Settings'}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate('/activity')}
          className="gap-2.5 text-xs py-2 cursor-pointer"
        >
          <Activity className="size-4 text-muted-foreground" />
          <span>{currentLang === 'kh' ? 'កំណត់ហេតុសកម្មភាព' : 'Activity Logs'}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate('/backup')}
          className="gap-2.5 text-xs py-2 cursor-pointer"
        >
          <Database className="size-4 text-muted-foreground" />
          <span>{currentLang === 'kh' ? 'ទិន្នន័យបម្រុង' : 'Database Backups'}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="gap-2.5 text-xs py-2 text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/40 focus:text-rose-600 cursor-pointer"
        >
          <LogOut className="size-4" />
          <span>{currentLang === 'kh' ? 'ចាកចេញពីប្រព័ន្ធ' : 'Sign Out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;

