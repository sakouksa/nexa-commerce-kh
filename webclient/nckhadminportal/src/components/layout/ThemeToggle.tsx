import React, { useEffect } from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useThemeStore, ThemeMode } from '../../stores/themeStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface ThemeToggleProps {
  className?: string;
  variant?: 'toggle' | 'dropdown';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'toggle',
}) => {
  const { themeMode, setThemeMode, toggleTheme } = useThemeStore();

  // Ensure initial theme class is applied on mount
  useEffect(() => {
    const isDark =
      themeMode === 'dark' ||
      (themeMode === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.classList.toggle('dark', isDark);
  }, [themeMode]);

  const isDarkActive =
    themeMode === 'dark' ||
    (themeMode === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="iconSm"
            className={`size-8 rounded-lg border-border/70 text-muted-foreground hover:text-foreground ${className}`}
          >
            {isDarkActive ? (
              <Moon className="size-4 transition-transform duration-200" />
            ) : (
              <Sun className="size-4 transition-transform duration-200" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
            onClick={() => setThemeMode('light')}
            className={`text-xs gap-2 py-1.5 ${themeMode === 'light' ? 'font-semibold text-primary' : ''}`}
          >
            <Sun className="size-3.5" />
            <span>Light</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setThemeMode('dark')}
            className={`text-xs gap-2 py-1.5 ${themeMode === 'dark' ? 'font-semibold text-primary' : ''}`}
          >
            <Moon className="size-3.5" />
            <span>Dark</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setThemeMode('system')}
            className={`text-xs gap-2 py-1.5 ${themeMode === 'system' ? 'font-semibold text-primary' : ''}`}
          >
            <Laptop className="size-3.5" />
            <span>System</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Direct 1-click toggle with tooltip
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={toggleTheme}
            aria-label={isDarkActive ? 'Switch to Light mode' : 'Switch to Dark mode'}
            className={`size-8 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
          >
            {isDarkActive ? (
              <Moon className="size-4 text-sky-400 rotate-0 transition-all duration-300 hover:rotate-12" />
            ) : (
              <Sun className="size-4 text-amber-500 rotate-0 transition-all duration-300 hover:rotate-45" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isDarkActive ? 'Switch to Light mode' : 'Switch to Dark mode'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ThemeToggle;

