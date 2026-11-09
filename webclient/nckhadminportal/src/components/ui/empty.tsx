import * as React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n';

/* ==========================================================================
   1. Empty Container
   ========================================================================== */

export interface EmptyProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Convenience prop: leading icon or visual */
  icon?: React.ReactNode;
  /** Convenience prop: headline title */
  title?: React.ReactNode;
  /** Convenience prop: descriptive message */
  description?: React.ReactNode;
  /** Alias for description / title for backward compatibility */
  message?: React.ReactNode;
  /** Convenience prop: action button or controls */
  action?: React.ReactNode;
  /** Whether to render with a dashed border (default: true) */
  bordered?: boolean;
}

export interface EmptyHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface EmptyMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'icon' | 'default';
}

export interface EmptyTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export interface EmptyDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export interface EmptyContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface EmptyActionProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Shadcn-style Empty Container
 * Flexible component that supports both compound subcomponents:
 * <Empty>
 *   <EmptyHeader>
 *     <EmptyMedia variant="icon"><IconFolderCode /></EmptyMedia>
 *     <EmptyTitle>No Projects Yet</EmptyTitle>
 *     <EmptyDescription>You haven't created any projects yet.</EmptyDescription>
 *   </EmptyHeader>
 *   <EmptyContent>
 *     <Button>Create Project</Button>
 *   </EmptyContent>
 * </Empty>
 *
 * And prop-driven 1-line syntax:
 * <Empty icon={<Inbox />} title="No data" description="..." action={<Button>Add</Button>} />
 */
export const Empty: React.FC<EmptyProps> & {
  Header: typeof EmptyHeader;
  Media: typeof EmptyMedia;
  Icon: typeof EmptyMedia;
  Title: typeof EmptyTitle;
  Description: typeof EmptyDescription;
  Content: typeof EmptyContent;
  Action: typeof EmptyAction;
} = ({
  icon,
  title,
  description,
  message,
  action,
  bordered = true,
  className,
  children,
  ...props
}) => {
  const { t, translateString } = useLanguage();

  // Compound syntax: children provided
  if (children) {
    return (
      <div
        className={cn(
          'flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl p-8 text-center transition-all animate-in fade-in-50 duration-200',
          bordered
            ? 'border border-dashed border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30'
            : 'bg-transparent',
          className
        )}
        {...props}
      >
        <div className="mx-auto flex max-w-[440px] w-full flex-col items-center justify-center text-center">
          {children}
        </div>
      </div>
    );
  }

  // Convenience prop-driven syntax
  const resolvedTitle = title
    ? typeof title === 'string'
      ? translateString(title)
      : title
    : message && !description
    ? typeof message === 'string'
      ? translateString(message)
      : message
    : t('common.noData', 'គ្មានទិន្នន័យ');

  const resolvedDesc = description
    ? typeof description === 'string'
      ? translateString(description)
      : description
    : message && title
    ? typeof message === 'string'
      ? translateString(message)
      : message
    : undefined;

  return (
    <div
      className={cn(
        'flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl p-8 text-center transition-all animate-in fade-in-50 duration-200',
        bordered
          ? 'border border-dashed border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30'
          : 'bg-transparent',
        className
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-[440px] w-full flex-col items-center justify-center text-center">
        <EmptyHeader>
          <EmptyMedia variant="icon">{icon || <Inbox className="size-6" />}</EmptyMedia>
          <EmptyTitle>{resolvedTitle}</EmptyTitle>
          {resolvedDesc && <EmptyDescription>{resolvedDesc}</EmptyDescription>}
        </EmptyHeader>

        {action && <EmptyContent className="mt-4">{action}</EmptyContent>}
      </div>
    </div>
  );
};

/* ==========================================================================
   2. Subcomponents
   ========================================================================== */

export const EmptyHeader: React.FC<EmptyHeaderProps> = ({ className, children, ...props }) => (
  <div className={cn('flex flex-col items-center gap-1.5 text-center w-full', className)} {...props}>
    {children}
  </div>
);

export const EmptyMedia: React.FC<EmptyMediaProps> = ({
  variant = 'icon',
  className,
  children,
  ...props
}) => {
  if (variant === 'icon') {
    return (
      <div
        className={cn(
          'flex size-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 mb-3 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs [&>svg]:size-6',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={cn('mb-4 flex items-center justify-center', className)} {...props}>
      {children}
    </div>
  );
};

export const EmptyTitle: React.FC<EmptyTitleProps> = ({ className, children, ...props }) => (
  <h3
    className={cn(
      'text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100',
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

export const EmptyDescription: React.FC<EmptyDescriptionProps> = ({
  className,
  children,
  ...props
}) => (
  <p
    className={cn(
      'text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto mt-0.5',
      className
    )}
    {...props}
  >
    {children}
  </p>
);

export const EmptyContent: React.FC<EmptyContentProps> = ({ className, children, ...props }) => (
  <div
    className={cn(
      'mt-4 flex flex-wrap items-center justify-center gap-2 text-center w-full',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const EmptyAction: React.FC<EmptyActionProps> = EmptyContent;

// Attach compound subcomponents
Empty.Header = EmptyHeader;
Empty.Media = EmptyMedia;
Empty.Icon = EmptyMedia;
Empty.Title = EmptyTitle;
Empty.Description = EmptyDescription;
Empty.Content = EmptyContent;
Empty.Action = EmptyAction;

export { Empty as EmptyState };
export default Empty;

