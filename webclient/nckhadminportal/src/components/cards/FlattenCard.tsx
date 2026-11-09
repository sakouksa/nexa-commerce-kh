import React from 'react';
import {
  Download,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Check,
  PlusCircle,
  MinusCircle,
  ArrowRightLeft,
  Send,
  ArrowDownLeft,
  Upload,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

// ─── 1. Main Flatten Container Card ───────────────────────────────────────────
export interface FlattenCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  actionText?: string;
  onActionClick?: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  noPadding?: boolean;
}

export const FlattenCard: React.FC<FlattenCardProps> = ({
  title,
  subtitle,
  action,
  actionText,
  onActionClick,
  footer,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  noPadding = false,
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-2xs flex flex-col justify-between transition-all ${
        noPadding ? 'p-0' : 'p-5'
      } ${className}`}
    >
      {(title || action || actionText) && (
        <div
          className={`flex items-center justify-between mb-4 pb-0.5 ${
            noPadding ? 'px-5 pt-5' : ''
          } ${headerClassName}`}
        >
          <div>
            {title && (
              <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action ? (
            <div className="shrink-0">{action}</div>
          ) : actionText ? (
            <button
              type="button"
              onClick={onActionClick}
              className="text-xs font-semibold text-[#0e5a77] dark:text-cyan-400 hover:underline cursor-pointer flex items-center gap-1 shrink-0"
            >
              {actionText}
              <ChevronRight size={14} />
            </button>
          ) : null}
        </div>
      )}
      <div className={`space-y-3.5 flex-1 ${noPadding ? 'px-5 pb-5' : ''} ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div
          className={`mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 ${
            noPadding ? 'px-5 pb-4' : ''
          } ${footerClassName}`}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

// ─── 2. Flatten Task Item (Task List with Checkbox, Avatar, Status) ───────────
export interface FlattenTaskItemProps {
  id?: string | number;
  title: string;
  completed?: boolean;
  avatar?: string;
  initials?: string;
  status?: string;
  statusVariant?: 'emerald' | 'amber' | 'cyan' | 'purple' | 'rose' | 'slate';
  onToggle?: (completed: boolean) => void;
  onClick?: () => void;
  action?: React.ReactNode;
  className?: string;
}

const TASK_STATUS_STYLES: Record<string, string> = {
  emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/40',
  amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/40',
  cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200/60 dark:border-cyan-800/40',
  purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-800/40',
  rose: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-800/40',
  slate: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
};

export const FlattenTaskItem: React.FC<FlattenTaskItemProps> = ({
  title,
  completed = false,
  avatar,
  initials,
  status,
  statusVariant = 'cyan',
  onToggle,
  onClick,
  action,
  className = '',
}) => {
  const [checked, setChecked] = React.useState(completed);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !checked;
    setChecked(next);
    onToggle?.(next);
  };

  const badgeStyle = TASK_STATUS_STYLES[statusVariant] || TASK_STATUS_STYLES.cyan;

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between gap-3 py-1.5 transition-all group ${
        onClick ? 'cursor-pointer hover:opacity-90' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          aria-label={checked ? 'Uncheck task' : 'Check task'}
          className={`w-4 h-4 rounded border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
            checked
              ? 'bg-[#0e5a77] border-[#0e5a77] text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-[#0e5a77]'
          }`}
        >
          {checked && <Check size={11} strokeWidth={3} />}
        </button>

        {/* User Avatar */}
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
          />
        ) : initials ? (
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
            {initials}
          </div>
        ) : null}

        {/* Task Title */}
        <span
          className={`text-xs font-semibold text-slate-800 dark:text-slate-100 truncate flex-1 transition-all ${
            checked ? 'line-through text-slate-400 dark:text-slate-500' : ''
          }`}
        >
          {title}
        </span>
      </div>

      {/* Right Status Pill or Action */}
      <div className="shrink-0 flex items-center gap-2">
        {status && (
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeStyle}`}
          >
            {status}
          </span>
        )}
        {action}
      </div>
    </div>
  );
};

// ─── 3. Flatten Recent Transaction Item (Initial Circle, Name, Date, Amount) ──
export interface FlattenTransactionItemProps {
  initial?: string;
  avatar?: string;
  name: string;
  date: string;
  amount: number | string;
  prefix?: string;
  isPositive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const FlattenTransactionItem: React.FC<FlattenTransactionItemProps> = ({
  initial,
  avatar,
  name,
  date,
  amount,
  prefix = '$',
  isPositive,
  onClick,
  className = '',
}) => {
  const displayInitial = initial || name.charAt(0).toUpperCase();

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between gap-3 py-1.5 transition-all ${
        onClick ? 'cursor-pointer hover:opacity-90' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-100 dark:border-slate-800"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-700">
            {displayInitial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-semibold text-slate-800 dark:text-white truncate">{name}</h4>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight">
            {date}
          </p>
        </div>
      </div>
      <div
        className={`text-xs font-bold shrink-0 font-mono ${
          isPositive === true
            ? 'text-emerald-600 dark:text-emerald-400'
            : isPositive === false
            ? 'text-rose-600 dark:text-rose-400'
            : 'text-slate-700 dark:text-slate-200'
        }`}
      >
        {typeof amount === 'number'
          ? `${prefix}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
          : `${prefix}${amount}`}
      </div>
    </div>
  );
};

// ─── 4. Flatten Crypto Transaction Item (Bought/Sold/Transferred + USD) ───────
export interface FlattenCryptoTxItemProps {
  type?: 'buy' | 'sell' | 'transfer' | 'custom';
  title: string;
  subtitle: string;
  cryptoAmount: string;
  fiatAmount: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const FlattenCryptoTxItem: React.FC<FlattenCryptoTxItemProps> = ({
  type = 'buy',
  title,
  subtitle,
  cryptoAmount,
  fiatAmount,
  isPositive,
  icon,
  onClick,
  className = '',
}) => {
  const autoPositive = isPositive ?? (type === 'buy' || cryptoAmount.startsWith('+'));

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between gap-3 py-1.5 transition-all ${
        onClick ? 'cursor-pointer hover:opacity-90' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
          {icon ? (
            icon
          ) : type === 'buy' ? (
            <PlusCircle size={15} className="text-emerald-600 dark:text-emerald-400" />
          ) : type === 'sell' ? (
            <MinusCircle size={15} className="text-rose-600 dark:text-rose-400" />
          ) : (
            <ArrowRightLeft size={14} className="text-cyan-600 dark:text-cyan-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-semibold text-slate-800 dark:text-white truncate">{title}</h4>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-xs font-bold text-slate-800 dark:text-white font-mono">
          {cryptoAmount}
        </div>
        <div
          className={`text-[11px] font-semibold font-mono ${
            autoPositive
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {fiatAmount}
        </div>
      </div>
    </div>
  );
};

// ─── 5. Flatten Top Performance Item (Coin/Asset, Symbol, Price) ──────────────
export interface FlattenPerformanceItemProps {
  name: string;
  symbol: string;
  price: string | number;
  icon?: React.ReactNode;
  iconBg?: string;
  prefix?: string;
  trend?: string;
  isPositive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const FlattenPerformanceItem: React.FC<FlattenPerformanceItemProps> = ({
  name,
  symbol,
  price,
  icon,
  iconBg,
  prefix = '$',
  trend,
  isPositive,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between gap-3 py-1.5 transition-all ${
        onClick ? 'cursor-pointer hover:opacity-90' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white ${
            iconBg || 'bg-[#0e5a77]'
          }`}
        >
          {icon || symbol.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-semibold text-slate-800 dark:text-white truncate">{name}</h4>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
            {symbol}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-xs font-bold text-slate-800 dark:text-white font-mono">
          {typeof price === 'number'
            ? `${prefix}${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
            : typeof price === 'string' && !price.startsWith('$')
            ? `${prefix}${price}`
            : price}
        </div>
        {trend && (
          <div
            className={`text-[10px] font-semibold ${
              isPositive ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── 6. Flatten Activity History Item (Tinted Box, Action, Date, Amount) ──────
export interface FlattenActivityHistoryItemProps {
  type?: 'send' | 'receive' | 'upload' | 'download' | 'custom';
  title: string;
  date: string;
  amount: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const FlattenActivityHistoryItem: React.FC<FlattenActivityHistoryItemProps> = ({
  type = 'send',
  title,
  date,
  amount,
  icon,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between gap-3 py-1.5 transition-all ${
        onClick ? 'cursor-pointer hover:opacity-90' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-100 dark:border-cyan-900/40">
          {icon ? (
            icon
          ) : type === 'send' ? (
            <Send size={14} />
          ) : type === 'receive' ? (
            <ArrowDownLeft size={14} />
          ) : type === 'upload' ? (
            <Upload size={14} />
          ) : (
            <TrendingUp size={14} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-semibold text-slate-800 dark:text-white truncate">{title}</h4>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight">
            {date}
          </p>
        </div>
      </div>
      <div className="text-xs font-bold text-slate-800 dark:text-white font-mono shrink-0">
        {amount}
      </div>
    </div>
  );
};

// ─── 7. Flatten User / Candidate Item ─────────────────────────────────────────
export interface FlattenUserItemProps {
  name: string;
  subtitle?: React.ReactNode;
  avatar?: string;
  initials?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const FlattenUserItem: React.FC<FlattenUserItemProps> = ({
  name,
  subtitle,
  avatar,
  initials,
  action,
  onClick,
  className = '',
}) => {
  const isClickable = Boolean(onClick);
  const displayInitials =
    initials ||
    name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between gap-3 py-1 transition-all ${
        isClickable ? 'cursor-pointer hover:opacity-85' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-100 dark:border-slate-800 shadow-2xs"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs">
            {displayInitials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-semibold text-slate-800 dark:text-white truncate">
            {name}
          </h4>
          {subtitle && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

// ─── 8. Flatten File / Resume Item ────────────────────────────────────────────
export interface FlattenFileItemProps {
  title: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  onDownload?: () => void;
  onClick?: () => void;
  downloadTitle?: string;
  className?: string;
}

export const FlattenFileItem: React.FC<FlattenFileItemProps> = ({
  title,
  subtitle,
  icon,
  onDownload,
  onClick,
  downloadTitle = 'Download',
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between gap-3 py-1 transition-all ${
        onClick ? 'cursor-pointer hover:opacity-85' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-100 dark:border-cyan-900/40">
          {icon || <FileText size={16} />}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-semibold text-slate-800 dark:text-white truncate">
            {title}
          </h4>
          {subtitle && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {onDownload && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDownload();
          }}
          title={downloadTitle}
          aria-label={downloadTitle}
          className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer active:scale-90"
        >
          <Download size={14} />
        </button>
      )}
    </div>
  );
};

// ─── 9. Flatten Chat / Conversation Item ──────────────────────────────────────
export interface FlattenChatItemProps {
  name: string;
  message: string;
  avatar?: string;
  onChat?: () => void;
  className?: string;
}

export const FlattenChatItem: React.FC<FlattenChatItemProps> = ({
  name,
  message,
  avatar,
  onChat,
  className = '',
}) => {
  return (
    <div
      onClick={onChat}
      className={`flex items-center justify-between gap-3 py-1 transition-all ${
        onChat ? 'cursor-pointer hover:opacity-85' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-100 dark:border-slate-800 shadow-2xs"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
            {name.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-semibold text-slate-800 dark:text-white truncate">
            {name}
          </h4>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight">
            {message}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChat?.();
        }}
        className="w-7 h-7 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 flex items-center justify-center transition-all cursor-pointer active:scale-90"
      >
        <MessageSquare size={14} />
      </button>
    </div>
  );
};

// ─── 10. Flatten Application Item with Quick Contact ──────────────────────────
export interface FlattenApplicationItemProps {
  name: string;
  role: string;
  avatar?: string;
  onCall?: () => void;
  onEmail?: () => void;
  className?: string;
}

export const FlattenApplicationItem: React.FC<FlattenApplicationItemProps> = ({
  name,
  role,
  avatar,
  onCall,
  onEmail,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between gap-2.5 py-1 ${className}`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-100 dark:border-slate-800 shadow-2xs"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
            {name.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-semibold text-slate-800 dark:text-white truncate">
            {name}
          </h4>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight">
            {role}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {onCall && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCall();
            }}
            title="Call"
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-cyan-950/50 dark:hover:text-cyan-300 flex items-center justify-center transition-all cursor-pointer active:scale-90"
          >
            <Phone size={12} />
          </button>
        )}
        {onEmail && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEmail();
            }}
            title="Email"
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-cyan-950/50 dark:hover:text-cyan-300 flex items-center justify-center transition-all cursor-pointer active:scale-90"
          >
            <Mail size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

// ─── 11. Pre-assembled Flatten List Cards ─────────────────────────────────────

export interface FlattenTaskListCardProps {
  title?: React.ReactNode;
  tasks: Array<FlattenTaskItemProps>;
  action?: React.ReactNode;
  className?: string;
}

export const FlattenTaskListCard: React.FC<FlattenTaskListCardProps> = ({
  title = 'Task List',
  tasks,
  action,
  className = '',
}) => {
  return (
    <FlattenCard title={title} action={action} className={className}>
      {tasks.map((task, idx) => (
        <FlattenTaskItem key={task.id ?? idx} {...task} />
      ))}
    </FlattenCard>
  );
};

export interface FlattenRecentTransactionsCardProps {
  title?: React.ReactNode;
  transactions: Array<FlattenTransactionItemProps>;
  action?: React.ReactNode;
  className?: string;
}

export const FlattenRecentTransactionsCard: React.FC<FlattenRecentTransactionsCardProps> = ({
  title = 'Recent Transaction',
  transactions,
  action,
  className = '',
}) => {
  return (
    <FlattenCard title={title} action={action} className={className}>
      {transactions.map((tx, idx) => (
        <FlattenTransactionItem key={idx} {...tx} />
      ))}
    </FlattenCard>
  );
};

export interface FlattenLatestCryptoTxCardProps {
  title?: React.ReactNode;
  transactions: Array<FlattenCryptoTxItemProps>;
  action?: React.ReactNode;
  className?: string;
}

export const FlattenLatestCryptoTxCard: React.FC<FlattenLatestCryptoTxCardProps> = ({
  title = 'Latest Transactions',
  transactions,
  action,
  className = '',
}) => {
  return (
    <FlattenCard title={title} action={action} className={className}>
      {transactions.map((tx, idx) => (
        <FlattenCryptoTxItem key={idx} {...tx} />
      ))}
    </FlattenCard>
  );
};

export interface FlattenTopPerformanceCardProps {
  title?: React.ReactNode;
  assets: Array<FlattenPerformanceItemProps>;
  action?: React.ReactNode;
  className?: string;
}

export const FlattenTopPerformanceCard: React.FC<FlattenTopPerformanceCardProps> = ({
  title = 'Top Performance',
  assets,
  action,
  className = '',
}) => {
  return (
    <FlattenCard title={title} action={action} className={className}>
      {assets.map((asset, idx) => (
        <FlattenPerformanceItem key={idx} {...asset} />
      ))}
    </FlattenCard>
  );
};

export interface FlattenTransactionHistoryCardProps {
  title?: React.ReactNode;
  history: Array<FlattenActivityHistoryItemProps>;
  action?: React.ReactNode;
  className?: string;
}

export const FlattenTransactionHistoryCard: React.FC<FlattenTransactionHistoryCardProps> = ({
  title = 'Transaction History',
  history,
  action,
  className = '',
}) => {
  return (
    <FlattenCard title={title} action={action} className={className}>
      {history.map((item, idx) => (
        <FlattenActivityHistoryItem key={idx} {...item} />
      ))}
    </FlattenCard>
  );
};

export default FlattenCard;
