import { useMemo } from 'react'
import { toast, type ToastParam, normalizeToastOptions } from '../utils/toast'
import type { ToastOptions } from '../stores/toastStore'

export type { ToastParam }
export { normalizeToastOptions }

export function useToast() {
  return useMemo(
    () => ({
      success: (param: ToastParam, duration?: number) => toast.success(param, duration),
      error: (param: ToastParam, duration?: number) => toast.error(param, duration),
      warning: (param: ToastParam, duration?: number) => toast.warning(param, duration),
      info: (param: ToastParam, duration?: number) => toast.info(param, duration),
      custom: (options: ToastOptions | any) => toast.custom(options),
      remove: (id: string) => toast.dismiss(id),
      dismiss: (id?: string) => toast.dismiss(id),
      clear: () => toast.clear(),
    }),
    []
  )
}

export default useToast
