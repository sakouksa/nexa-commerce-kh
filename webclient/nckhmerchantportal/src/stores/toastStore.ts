import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastAction {
  label: string
  onClick: () => void
  icon?: string
}

export interface ToastOptions {
  id?: string
  type?: ToastType
  title?: string
  message: string
  description?: string
  details?: string | string[] | Record<string, any>
  code?: string | number
  action?: ToastAction
  duration?: number
  dismissible?: boolean
  copyable?: boolean
}

export interface Toast extends ToastOptions {
  id: string
  type: ToastType
  createdAt: number
}

interface ToastState {
  toasts: Toast[]
  addToast: (
    typeOrOptions: ToastType | ToastOptions,
    message?: string,
    duration?: number
  ) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (typeOrOptions, maybeMessage, maybeDuration) => {
    let newToast: Toast

    if (typeof typeOrOptions === 'string') {
      const type = typeOrOptions
      const message = maybeMessage || ''
      const duration = maybeDuration ?? (type === 'error' ? 5000 : 4000)
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      newToast = {
        id,
        type,
        message,
        duration,
        dismissible: true,
        copyable: type === 'error',
        createdAt: Date.now(),
      }
    } else {
      const opts = typeOrOptions
      const type = opts.type || 'info'
      const id = opts.id || `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      const duration = opts.duration ?? (type === 'error' ? 6000 : 4000)
      newToast = {
        ...opts,
        id,
        type,
        duration,
        dismissible: opts.dismissible !== false,
        copyable: opts.copyable ?? (type === 'error'),
        createdAt: Date.now(),
      }
    }

    set((state) => {
      // Deduplicate identical title+message combinations within 2 seconds
      const exists = state.toasts.some(
        (t) =>
          t.message === newToast.message &&
          t.title === newToast.title &&
          t.type === newToast.type &&
          Date.now() - t.createdAt < 2000
      )
      if (exists) {
        return state
      }
      // Maximum 5 simultaneous visible toasts on screen
      const trimmed = state.toasts.slice(-4)
      return { toasts: [...trimmed, newToast] }
    })

    return newToast.id
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}))

// Direct helper utility for calling outside React components
export const toast = {
  error: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) =>
    useToastStore.getState().addToast({ ...options, message, type: 'error' }),
  success: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) =>
    useToastStore.getState().addToast({ ...options, message, type: 'success' }),
  warning: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) =>
    useToastStore.getState().addToast({ ...options, message, type: 'warning' }),
  info: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) =>
    useToastStore.getState().addToast({ ...options, message, type: 'info' }),
  custom: (options: ToastOptions) => useToastStore.getState().addToast(options),
  dismiss: (id: string) => useToastStore.getState().removeToast(id),
  clear: () => useToastStore.getState().clearToasts(),
}
