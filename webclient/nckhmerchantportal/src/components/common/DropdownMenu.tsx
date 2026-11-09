import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
  HTMLAttributes,
  ButtonHTMLAttributes,
} from 'react';

interface DropdownMenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextType | null>(null);

export function useDropdownMenu() {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('useDropdownMenu must be used within a DropdownMenu');
  }
  return context;
}

export interface DropdownMenuProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function DropdownMenu({ children, open: controlledOpen, onOpenChange, className = '' }: DropdownMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const menuRef = useRef<HTMLDivElement>(null);

  const setOpen = (next: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  };

  const toggle = () => setOpen(!open);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, toggle }}>
      <div ref={menuRef} className={`relative inline-block text-left ${className}`}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export interface DropdownMenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: ReactNode;
}

export function DropdownMenuTrigger({
  asChild,
  children,
  className = '',
  onClick,
  ...props
}: DropdownMenuTriggerProps) {
  const { toggle, open } = useDropdownMenu();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClick?.(e);
    toggle();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-haspopup="menu"
      aria-expanded={open}
      className={`inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  children: ReactNode;
}

export function DropdownMenuContent({
  align = 'end',
  sideOffset = 4,
  children,
  className = '',
  ...props
}: DropdownMenuContentProps) {
  const { open } = useDropdownMenu();

  if (!open) return null;

  const alignClass = {
    start: 'left-0 origin-top-left',
    center: 'left-1/2 -translate-x-1/2 origin-top',
    end: 'right-0 origin-top-right',
  }[align];

  return (
    <div
      role="menu"
      style={{ marginTop: sideOffset }}
      className={`absolute z-50 min-w-[10rem] overflow-hidden rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 text-slate-950 dark:text-slate-50 shadow-xl transition-all animate-in fade-in-0 zoom-in-95 ${alignClass} ${className}`}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DropdownMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  destructive?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export function DropdownMenuItem({
  destructive = false,
  icon,
  children,
  className = '',
  onClick,
  disabled,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenu();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.stopPropagation();
    onClick?.(e);
    setOpen(false);
  };

  const colorClass = destructive
    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-300'
    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white';

  return (
    <button
      role="menuitem"
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium outline-none transition-colors disabled:pointer-events-none disabled:opacity-40 ${colorClass} ${className}`}
      {...props}
    >
      {icon && <span className="size-4 shrink-0 flex items-center justify-center">{icon}</span>}
      <span className="flex-1 text-left truncate">{children}</span>
    </button>
  );
}

export function DropdownMenuSeparator({ className = '' }: { className?: string }) {
  return <div className={`-mx-1 my-1 h-px bg-slate-100 dark:bg-slate-800 ${className}`} />;
}

export function DropdownMenuLabel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 ${className}`}>
      {children}
    </div>
  );
}
