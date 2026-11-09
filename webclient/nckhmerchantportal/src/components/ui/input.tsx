import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] px-3 py-1.5 text-sm text-[#16292e] dark:text-[#e7ede9] shadow-2xs transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#71817e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c]/25 focus-visible:border-[#ea580c] disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive focus-visible:border-destructive text-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
