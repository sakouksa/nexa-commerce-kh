import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

export type PaginationLinkProps = {
  isActive?: boolean
  disabled?: boolean
} & Pick<ButtonProps, "size"> &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: string
  }

const PaginationLink = ({
  className,
  isActive,
  disabled,
  size = "iconSm",
  href,
  ...props
}: PaginationLinkProps) => {
  const classes = cn(
    buttonVariants({
      variant: isActive ? "default" : "outline",
      size,
    }),
    "h-8 min-w-8 px-2 font-mono text-xs transition-all",
    isActive
      ? "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs border-indigo-600 dark:border-indigo-600 pointer-events-none"
      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800",
    disabled && "pointer-events-none opacity-40 cursor-not-allowed",
    className
  )

  if (href) {
    return (
      <a
        href={href}
        aria-current={isActive ? "page" : undefined}
        aria-disabled={disabled}
        className={classes}
        {...(props as any)}
      />
    )
  }

  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      disabled={disabled}
      className={classes}
      {...props}
    />
  )
}
PaginationLink.displayName = "PaginationLink"

export interface PaginationNavProps extends React.ComponentProps<typeof PaginationLink> {
  label?: React.ReactNode
}

const PaginationPrevious = ({
  className,
  label,
  size = "sm",
  ...props
}: PaginationNavProps) => (
  <PaginationLink
    aria-label="Go to previous page"
    size={size}
    className={cn("gap-1 pl-2 pr-2.5 font-sans font-medium", className)}
    {...props}
  >
    <ChevronLeft className="size-4" />
    {label && <span>{label}</span>}
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  label,
  size = "sm",
  ...props
}: PaginationNavProps) => (
  <PaginationLink
    aria-label="Go to next page"
    size={size}
    className={cn("gap-1 pl-2.5 pr-2 font-sans font-medium", className)}
    {...props}
  >
    {label && <span>{label}</span>}
    <ChevronRight className="size-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex size-8 items-center justify-center text-slate-400", className)}
    {...props}
  >
    <MoreHorizontal className="size-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}

