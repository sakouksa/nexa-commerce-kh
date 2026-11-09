import React from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      richColors
      closeButton
      position="top-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: [
            "group toast",
            "flex items-start gap-3 rounded-xl px-4 py-3.5",
            "border border-slate-200 bg-white text-slate-900 shadow-lg",
            "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
            "font-sans text-sm leading-snug",
          ].join(" "),
          title: "font-semibold text-sm",
          description: "text-xs text-slate-500 dark:text-slate-400 mt-0.5",
          actionButton: [
            "rounded-lg px-2.5 py-1 text-xs font-semibold",
            "bg-slate-900 text-white hover:bg-slate-700",
            "dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200",
            "transition-colors",
          ].join(" "),
          cancelButton: [
            "rounded-lg px-2.5 py-1 text-xs font-medium",
            "bg-slate-100 text-slate-600 hover:bg-slate-200",
            "dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700",
            "transition-colors",
          ].join(" "),
          closeButton: [
            "rounded-md border-slate-200 bg-white text-slate-400",
            "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
            "hover:text-slate-700 dark:hover:text-slate-200",
          ].join(" "),
          success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-100",
          error: "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-100",
          warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100",
          info: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-100",
        },
      }}
      {...props}
    />
  )
}

export default Toaster
