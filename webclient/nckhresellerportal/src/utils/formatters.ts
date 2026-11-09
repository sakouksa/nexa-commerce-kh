/**
 * Shared utility functions for formatting dates, currency, numbers, percentages, and JSON.
 */

export interface FormatCurrencyOptions {
  currency?: string
  decimals?: number
  compact?: boolean
  locale?: string
  fallback?: string
}

export interface FormatNumberOptions {
  decimals?: number
  locale?: string
  fallback?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

export interface FormatDateOptions {
  locale?: string
  includeTime?: boolean
  timeZone?: string
  fallback?: string
}

/**
 * Formats numeric or string amounts into standardized currency strings.
 * Supports USD ($), KHR (៛), custom decimals, compact chart notation ($1.2k), and locale.
 */
export const formatCurrency = (
  val?: number | string | null,
  optionsOrCurr?: FormatCurrencyOptions | string
): string => {
  const defaultFallback = '$0.00'
  if (val === null || val === undefined || val === '') {
    return (typeof optionsOrCurr === 'object' && optionsOrCurr.fallback) ? optionsOrCurr.fallback : defaultFallback
  }

  const num = typeof val === 'number' ? val : parseFloat(String(val)) || 0
  if (isNaN(num)) {
    return (typeof optionsOrCurr === 'object' && optionsOrCurr.fallback) ? optionsOrCurr.fallback : defaultFallback
  }

  let curr = 'USD'
  let decimals = 2
  let compact = false
  let locale = 'en-US'

  if (typeof optionsOrCurr === 'string') {
    curr = optionsOrCurr
    if (curr === 'KHR') decimals = 0
  } else if (optionsOrCurr && typeof optionsOrCurr === 'object') {
    if (optionsOrCurr.currency) curr = optionsOrCurr.currency
    if (optionsOrCurr.compact) compact = optionsOrCurr.compact
    if (optionsOrCurr.locale) locale = optionsOrCurr.locale
    if (optionsOrCurr.decimals !== undefined) {
      decimals = optionsOrCurr.decimals
    } else if (curr === 'KHR') {
      decimals = 0
    }
  }

  // Compact notation (e.g. for chart axes: $1.2k, $3.5M)
  if (compact) {
    const abs = Math.abs(num)
    const sign = num < 0 ? '-' : ''
    const prefix = curr === 'KHR' ? '៛' : '$'
    if (abs >= 1_000_000) {
      return `${sign}${prefix}${(abs / 1_000_000).toFixed(1)}M`
    }
    if (abs >= 1_000) {
      return `${sign}${prefix}${(abs / 1_000).toFixed(1)}k`
    }
    return `${sign}${prefix}${abs.toFixed(decimals)}`
  }

  if (curr === 'KHR') {
    const formatted = Math.round(num).toLocaleString(locale === 'km-KH' ? 'km-KH' : 'en-US')
    return `៛${formatted}`
  }

  return `$${num.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

/**
 * Formats a number with standard thousand separators.
 */
export const formatNumber = (
  val?: number | string | null,
  options?: FormatNumberOptions
): string => {
  const fallback = options?.fallback ?? '0'
  if (val === null || val === undefined || val === '') return fallback
  const num = typeof val === 'number' ? val : parseFloat(String(val)) || 0
  if (isNaN(num)) return fallback

  const locale = options?.locale ?? 'en-US'

  if (options?.minimumFractionDigits !== undefined || options?.maximumFractionDigits !== undefined) {
    return num.toLocaleString(locale, {
      minimumFractionDigits: options.minimumFractionDigits,
      maximumFractionDigits: options.maximumFractionDigits,
    })
  }

  if (options?.decimals !== undefined) {
    return num.toLocaleString(locale, {
      minimumFractionDigits: options.decimals,
      maximumFractionDigits: options.decimals,
    })
  }
  return num.toLocaleString(locale)
}

/**
 * Formats compact numbers (e.g. 1.2k, 2.4M).
 */
export const formatCompactNumber = (val?: number | string | null): string => {
  if (val === null || val === undefined || val === '') return '0'
  const num = typeof val === 'number' ? val : parseFloat(String(val)) || 0
  if (isNaN(num)) return '0'

  const abs = Math.abs(num)
  const sign = num < 0 ? '-' : ''
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1)}M`
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(1)}k`
  }
  return `${sign}${abs}`
}

/**
 * Formats a percentage value (e.g., 84.5%).
 */
export const formatPercent = (val?: number | string | null, decimals: number = 1): string => {
  if (val === null || val === undefined || val === '') return '0%'
  const num = typeof val === 'number' ? val : parseFloat(String(val)) || 0
  if (isNaN(num)) return '0%'
  return `${num.toFixed(decimals)}%`
}

/**
 * Global default timezone for Cambodia.
 */
export const CAMBODIA_TIMEZONE = 'Asia/Phnom_Penh'

/**
 * Initializes global browser date formatting to default to Asia/Phnom_Penh timezone.
 * Any calls to Date.prototype.toLocaleDateString(), toLocaleTimeString(), toLocaleString(),
 * or Intl.DateTimeFormat without an explicit timeZone will automatically use Asia/Phnom_Penh.
 */
export function initCambodiaTimezoneGlobally(): void {
  if (typeof window === 'undefined' || !window.Intl) return

  const OrigDateTimeFormat = window.Intl.DateTimeFormat

  // Prevent double patching
  if ((OrigDateTimeFormat as any).__isCambodiaTimezonePatched) return

  const PatchedDateTimeFormat = new Proxy(OrigDateTimeFormat, {
    construct(target, args) {
      const [locales, options = {}] = args
      const resolvedOpts = { ...options }
      if (!resolvedOpts.timeZone) {
        resolvedOpts.timeZone = CAMBODIA_TIMEZONE
      }
      return new target(locales, resolvedOpts)
    },
    apply(target, thisArg, args) {
      const [locales, options = {}] = args
      const resolvedOpts = { ...options }
      if (!resolvedOpts.timeZone) {
        resolvedOpts.timeZone = CAMBODIA_TIMEZONE
      }
      return target(locales, resolvedOpts)
    },
  })

  PatchedDateTimeFormat.supportedLocalesOf = OrigDateTimeFormat.supportedLocalesOf
  ;(PatchedDateTimeFormat as any).__isCambodiaTimezonePatched = true

  window.Intl.DateTimeFormat = PatchedDateTimeFormat
}

/**
 * Formats a date or string into ISO short date format (YYYY-MM-DD) in Cambodia timezone.
 */
export const formatShortDate = (
  dateStr?: string | Date | null,
  options?: FormatDateOptions
): string => {
  const fallback = options?.fallback ?? '—'
  if (!dateStr) return fallback
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    return dateStr.trim()
  }
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  if (isNaN(date.getTime())) return fallback
  const tz = options?.timeZone || CAMBODIA_TIMEZONE
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/**
 * Formats a date or string into short date-time format (YYYY-MM-DD HH:mm) in Cambodia timezone.
 */
export const formatShortDateTime = (
  dateStr?: string | Date | null,
  options?: FormatDateOptions
): string => {
  const fallback = options?.fallback ?? '—'
  if (!dateStr) return fallback
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  if (isNaN(date.getTime())) return fallback
  const tz = options?.timeZone || CAMBODIA_TIMEZONE
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]))
  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}`
}

export const getCurrentLocale = (): string => {
  try {
    const lang = (typeof window !== 'undefined' && (
      localStorage.getItem('admin_language') ||
      localStorage.getItem('enterprise-pos-lang') ||
      localStorage.getItem('i18nextLng')
    )) || 'kh'
    return (lang.startsWith('km') || lang.startsWith('kh')) ? 'km-KH' : 'en-US'
  } catch {
    return 'km-KH'
  }
}

/**
 * Formats a date for display (e.g. 15 Sep 2026 or 15 កញ្ញា 2026) in Cambodia timezone.
 */
export const formatDisplayDate = (
  d?: string | Date | null,
  options?: FormatDateOptions
): string => {
  const fallback = options?.fallback ?? '—'
  if (!d) return fallback
  const date = typeof d === 'string' ? new Date(d) : d
  if (isNaN(date.getTime())) return fallback

  const locale = options?.locale || getCurrentLocale()
  const timeZone = options?.timeZone || CAMBODIA_TIMEZONE
  const dateOpts: Intl.DateTimeFormatOptions = {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(options?.includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }

  return date.toLocaleDateString(locale, dateOpts)
}

/**
 * Formats a month or period (e.g. "2026-09" -> "កញ្ញា 2026" or "Sep 2026") in Cambodia timezone.
 */
export const formatMonth = (
  d?: string | Date | null,
  options?: FormatDateOptions
): string => {
  const fallback = options?.fallback ?? '—'
  if (!d) return fallback
  let date: Date
  if (typeof d === 'string') {
    if (/^\d{4}-\d{2}$/.test(d.trim())) {
      date = new Date(`${d.trim()}-01T00:00:00`)
    } else {
      date = new Date(d)
    }
  } else {
    date = d
  }
  if (isNaN(date.getTime())) return fallback

  const locale = options?.locale || getCurrentLocale()
  const timeZone = options?.timeZone || CAMBODIA_TIMEZONE
  return date.toLocaleDateString(locale, {
    timeZone,
    year: 'numeric',
    month: 'short',
  })
}

/**
 * Formats the day of week (e.g. "Wednesday" or "ថ្ងៃពុធ") in Cambodia timezone.
 */
export const formatDayOfWeek = (
  d?: string | Date | null,
  options?: FormatDateOptions
): string => {
  const fallback = options?.fallback ?? ''
  if (!d) return fallback
  const date = typeof d === 'string' ? new Date(d) : d
  if (isNaN(date.getTime())) return fallback

  const locale = options?.locale || getCurrentLocale()
  const timeZone = options?.timeZone || CAMBODIA_TIMEZONE
  return date.toLocaleDateString(locale, {
    timeZone,
    weekday: 'long',
  })
}

/**
 * Standard date-time formatter (YYYY-MM-DD HH:mm).
 */
export const formatDateTime = (
  dateStr?: string | Date | null,
  options?: FormatDateOptions
): string => {
  return formatShortDateTime(dateStr, options)
}

/**
 * Standard date formatter (YYYY-MM-DD).
 */
export const formatDate = (
  dateStr?: string | Date | null,
  options?: FormatDateOptions
): string => {
  return formatShortDate(dateStr, options)
}

/**
 * Formats a date into HTML input `datetime-local` format (YYYY-MM-DDTHH:mm).
 */
export const formatDateTimeLocal = (dateStr?: string | Date | null): string => {
  if (!dateStr) return ''
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
    if (isNaN(d.getTime())) {
      if (typeof dateStr === 'string') {
        const clean = dateStr.replace(' ', 'T')
        return clean.length >= 16 ? clean.slice(0, 16) : clean
      }
      return ''
    }
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch {
    return ''
  }
}

/**
 * Formats JSON or object values to display strings.
 */
export const formatJsonValue = (val: any): string => {
  if (val === null || val === undefined) return ''
  if (typeof val === 'string') return val
  try {
    return JSON.stringify(val)
  } catch {
    return String(val)
  }
}

/**
 * Standard phone number formatter (Cambodia & International).
 * Automatically groups digits nicely:
 * - Local Cambodia: 012 345 678, 097 123 4567
 * - International: +855 12 345 678, +1 234 567 8900
 */
export const formatPhoneNumber = (value?: string | number | null): string => {
  if (value === undefined || value === null) return ''
  const trimmed = String(value).trim()
  if (!trimmed) return ''

  const isPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/\D/g, '')

  if (!digits) return isPlus ? '+' : ''

  if (isPlus) {
    if (digits.startsWith('855')) {
      const rest = digits.slice(3)
      if (rest.length <= 2) return `+855 ${rest}`
      if (rest.length <= 5) return `+855 ${rest.slice(0, 2)} ${rest.slice(2)}`
      if (rest.length <= 8) return `+855 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`
      return `+855 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 9)}`
    }
    if (digits.length <= 3) return `+${digits}`
    if (digits.length <= 6) return `+${digits.slice(0, 3)} ${digits.slice(3)}`
    if (digits.length <= 9) return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`
  }

  // Local phone numbers (012 345 678 or 097 123 4567)
  if (digits.startsWith('0')) {
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`
  }

  // Non-zero starting numbers
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`
}
