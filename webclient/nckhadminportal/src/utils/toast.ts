import { toast as sonnerToast, type ExternalToast } from 'sonner'
import type { ToastOptions } from '../stores/toastStore'

export type ToastParam = string | (Omit<ToastOptions, 'type'> & { message: string })

export type ToastExtraOptions = number | (ExternalToast & { duration?: number; [key: string]: any })

export function normalizeToastOptions(
  param: ToastParam,
  type: 'success' | 'error' | 'warning' | 'info',
  durationOrOptions?: ToastExtraOptions
): ToastOptions {
  const duration =
    typeof durationOrOptions === 'number'
      ? durationOrOptions
      : durationOrOptions && typeof durationOrOptions === 'object'
      ? durationOrOptions.duration
      : undefined

  if (typeof param === 'string') {
    return {
      type,
      message: param,
      duration,
    }
  }
  return {
    ...param,
    type,
    title: param.title,
    message: param.message,
    description: param.description,
    duration: param.duration ?? duration,
  }
}

function parseToastInput(
  param: ToastParam,
  durationOrOptions?: ToastExtraOptions
): { message: string; options: ExternalToast } {
  let message = ''
  const options: ExternalToast = {}

  if (typeof durationOrOptions === 'number') {
    options.duration = durationOrOptions
  } else if (durationOrOptions && typeof durationOrOptions === 'object') {
    Object.assign(options, durationOrOptions)
  }

  if (typeof param === 'string') {
    message = param
  } else {
    message = param.message
    if (param.description) {
      options.description = param.description
    }
    if (param.duration && !options.duration) {
      options.duration = param.duration
    }
  }

  return { message, options }
}

export const showToast = {
  success: (param: ToastParam, durationOrOptions?: ToastExtraOptions) => {
    const { message, options } = parseToastInput(param, durationOrOptions)
    return sonnerToast.success(message, options)
  },
  error: (param: ToastParam, durationOrOptions?: ToastExtraOptions) => {
    const { message, options } = parseToastInput(param, durationOrOptions)
    return sonnerToast.error(message, options)
  },
  warning: (param: ToastParam, durationOrOptions?: ToastExtraOptions) => {
    const { message, options } = parseToastInput(param, durationOrOptions)
    return sonnerToast.warning(message, options)
  },
  info: (param: ToastParam, durationOrOptions?: ToastExtraOptions) => {
    const { message, options } = parseToastInput(param, durationOrOptions)
    return sonnerToast.info(message, options)
  },
  custom: (jsxOrFn: any) => sonnerToast.custom(jsxOrFn),
  promise: sonnerToast.promise,
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  clear: () => sonnerToast.dismiss(),
}

// Universal callable toast object supporting toast('msg'), toast.success('msg'), and toast.promise(...)
export const toast = Object.assign(
  (param: ToastParam, durationOrOptions?: ToastExtraOptions) => {
    const { message, options } = parseToastInput(param, durationOrOptions)
    return sonnerToast(message, options)
  },
  showToast
)

export default toast
