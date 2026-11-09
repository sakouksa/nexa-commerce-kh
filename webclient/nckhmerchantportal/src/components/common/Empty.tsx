import React, { ReactNode } from 'react';
import { FiInbox } from 'react-icons/fi';
import { useLanguage } from '../../i18n';

export interface EmptyProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  message?: ReactNode; // Backward compatibility
  action?: ReactNode;
  children?: ReactNode;
}

export interface EmptyHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface EmptyMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'icon' | 'default';
  children?: ReactNode;
}

export interface EmptyTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
}

export interface EmptyDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
}

export interface EmptyActionProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface EmptyContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/**
 * Shadcn-style Empty Container
 */
export const Empty: React.FC<EmptyProps> & {
  Header: React.FC<EmptyHeaderProps>;
  Media: React.FC<EmptyMediaProps>;
  Icon: React.FC<EmptyMediaProps>;
  Title: React.FC<EmptyTitleProps>;
  Description: React.FC<EmptyDescriptionProps>;
  Action: React.FC<EmptyActionProps>;
  Actions: React.FC<EmptyActionProps>;
  Content: React.FC<EmptyContentProps>;
} = ({
  icon,
  title,
  description,
  message,
  action,
  children,
  className = '',
  ...props
}) => {
  const { t, translateString } = useLanguage();

  // If compound children are provided, render as container
  if (children) {
    return (
      <div
        className={`flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200/90 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-8 text-center animate-in fade-in-50 ${className}`}
        {...props}
      >
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          {children}
        </div>
      </div>
    );
  }

  // Convenience prop-driven render
  const resolvedTitle = title
    ? (typeof title === 'string' ? translateString(title) : title)
    : message && !description
    ? (typeof message === 'string' ? translateString(message) : message)
    : t('common.noData', 'No Data Found');

  const resolvedDesc = description
    ? (typeof description === 'string' ? translateString(description) : description)
    : message && title
    ? (typeof message === 'string' ? translateString(message) : message)
    : undefined;

  return (
    <div
      className={`flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200/90 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-8 text-center ${className}`}
      {...props}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        {/* Media / Icon */}
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 mb-4 shadow-2xs border border-slate-200/60 dark:border-slate-700/60">
          {icon || <FiInbox className="size-6" />}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold tracking-tight text-slate-800 dark:text-slate-100 mb-1">
          {resolvedTitle}
        </h3>

        {/* Description */}
        {resolvedDesc && (
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 max-w-sm">
            {resolvedDesc}
          </p>
        )}

        {/* Action Button/Link */}
        {action && (
          <div className="mt-2 flex items-center justify-center gap-2">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export const EmptyHeader: React.FC<EmptyHeaderProps> = ({ className = '', children, ...props }) => (
  <div className={`flex flex-col items-center gap-1.5 text-center ${className}`} {...props}>
    {children}
  </div>
);

export const EmptyMedia: React.FC<EmptyMediaProps> = ({ variant = 'icon', className = '', children, ...props }) => {
  if (variant === 'icon') {
    return (
      <div
        className={`flex size-14 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 mb-3 shadow-2xs border border-slate-200/60 dark:border-slate-700/60 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
  return (
    <div className={`mb-4 flex items-center justify-center ${className}`} {...props}>
      {children}
    </div>
  );
};

export const EmptyTitle: React.FC<EmptyTitleProps> = ({ className = '', children, ...props }) => (
  <h3 className={`text-base font-semibold tracking-tight text-slate-800 dark:text-slate-100 ${className}`} {...props}>
    {children}
  </h3>
);

export const EmptyDescription: React.FC<EmptyDescriptionProps> = ({ className = '', children, ...props }) => (
  <p className={`text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm ${className}`} {...props}>
    {children}
  </p>
);

export const EmptyAction: React.FC<EmptyActionProps> = ({ className = '', children, ...props }) => (
  <div className={`mt-4 flex items-center justify-center gap-2 ${className}`} {...props}>
    {children}
  </div>
);

export const EmptyContent: React.FC<EmptyContentProps> = ({ className = '', children, ...props }) => (
  <div className={`flex flex-col items-center justify-center text-center ${className}`} {...props}>
    {children}
  </div>
);

// Attach compound subcomponents
Empty.Header = EmptyHeader;
Empty.Media = EmptyMedia;
Empty.Icon = EmptyMedia;
Empty.Title = EmptyTitle;
Empty.Description = EmptyDescription;
Empty.Action = EmptyAction;
Empty.Actions = EmptyAction;
Empty.Content = EmptyContent;

export { Empty as EmptyState };
export default Empty;
