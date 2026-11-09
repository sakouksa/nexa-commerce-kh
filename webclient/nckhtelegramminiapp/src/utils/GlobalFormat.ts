/**
 * Unified Global Format Facade for Khmer POS Commerce Frontend
 * Matches enterprise backend format specifications across all 38 standards.
 */

import {
  formatCurrency,
  formatNumber,
  formatCompactNumber,
  formatPercent,
  formatShortDate,
  formatShortDateTime,
  formatDisplayDate,
  formatMonth,
  formatDayOfWeek,
  formatDateTimeLocal,
  formatDateTime,
  formatDate,
  formatPhoneNumber,
  formatJsonValue,
  CAMBODIA_TIMEZONE,
  type FormatCurrencyOptions,
  type FormatNumberOptions,
  type FormatDateOptions,
} from './formatters'

export interface BadgeInfo {
  label: string
  labelKh: string
  color: 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'secondary'
  badgeClass: string
}

export class GlobalFormat {
  // ─── 1. Currency & Money ───────────────────────────────────────────
  public static money(
    val?: number | string | null,
    currencyOrOptions?: string | FormatCurrencyOptions
  ): string {
    return formatCurrency(val, currencyOrOptions)
  }

  public static currency(
    val?: number | string | null,
    optionsOrCurr?: FormatCurrencyOptions | string
  ): string {
    return formatCurrency(val, optionsOrCurr)
  }

  // ─── 2. Numbers & Percentage ──────────────────────────────────────
  public static number(val?: number | string | null, options?: FormatNumberOptions): string {
    return formatNumber(val, options)
  }

  public static compactNumber(val?: number | string | null): string {
    return formatCompactNumber(val)
  }

  public static percent(val?: number | string | null, decimals: number = 1): string {
    return formatPercent(val, decimals)
  }

  // ─── 3. Date & Time (Asia/Phnom_Penh) ──────────────────────────────
  public static date(d?: string | Date | null, options?: FormatDateOptions): string {
    return formatShortDate(d, options)
  }

  public static dateTime(d?: string | Date | null, options?: FormatDateOptions): string {
    return formatShortDateTime(d, options)
  }

  public static displayDate(d?: string | Date | null, options?: FormatDateOptions): string {
    return formatDisplayDate(d, options)
  }

  public static month(d?: string | Date | null, options?: FormatDateOptions): string {
    return formatMonth(d, options)
  }

  public static dayOfWeek(d?: string | Date | null, options?: FormatDateOptions): string {
    return formatDayOfWeek(d, options)
  }

  public static dateInput(d?: string | Date | null): string {
    return formatDateTimeLocal(d)
  }

  public static get timezone(): string {
    return CAMBODIA_TIMEZONE
  }

  // ─── 4. Phone & Contact ───────────────────────────────────────────
  public static phone(val?: string | number | null): string {
    return formatPhoneNumber(val)
  }

  public static phoneLocal(val?: string | number | null): string {
    if (!val) return ''
    const digits = String(val).replace(/\D/g, '')
    if (digits.startsWith('855')) {
      const rest = '0' + digits.slice(3)
      return formatPhoneNumber(rest)
    }
    return formatPhoneNumber(digits)
  }

  public static phoneMask(val?: string | number | null): string {
    if (!val) return ''
    const formatted = formatPhoneNumber(val)
    if (formatted.length <= 6) return formatted
    const parts = formatted.split(' ')
    if (parts.length >= 3) {
      parts[parts.length - 2] = '•••'
      return parts.join(' ')
    }
    return formatted.slice(0, 3) + ' ••• ' + formatted.slice(-3)
  }

  public static email(val?: string | null): string {
    return val ? val.trim().toLowerCase() : ''
  }

  public static emailMask(val?: string | null): string {
    if (!val || !val.includes('@')) return val || ''
    const [name, domain] = val.trim().toLowerCase().split('@')
    if (name.length <= 2) return `${name}*@${domain}`
    const masked = name[0] + '•••' + name[name.length - 1]
    return `${masked}@${domain}`
  }

  // ─── 5. Identifiers ───────────────────────────────────────────────
  public static sku(val?: string | null): string {
    return val ? val.trim().toUpperCase() : ''
  }

  public static barcode(val?: string | null): string {
    return val ? val.replace(/\D/g, '') : ''
  }

  public static taxId(val?: string | null): string {
    return val ? val.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '') : ''
  }

  // ─── 6. Storage & Bytes ───────────────────────────────────────────
  public static bytes(bytes?: number | null): string {
    if (!bytes || bytes <= 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
    const size = bytes / Math.pow(1024, i)
    return `${size.toFixed(i === 0 ? 0 : 2)} ${units[i]}`
  }

  // ─── 7. Status Badges & JSON ──────────────────────────────────────
  public static statusBadge(status?: string | null): BadgeInfo {
    const s = (status || '').toLowerCase().trim()
    const colorMap: Record<string, { label: string; labelKh: string; color: BadgeInfo['color']; badgeClass: string }> = {
      completed: { label: 'Completed', labelKh: 'បានបញ្ចប់', color: 'success', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      paid: { label: 'Paid', labelKh: 'បានទូទាត់', color: 'success', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      delivered: { label: 'Delivered', labelKh: 'បានដឹកជញ្ជូន', color: 'success', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      active: { label: 'Active', labelKh: 'សកម្ម', color: 'success', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      approved: { label: 'Approved', labelKh: 'បានអនុម័ត', color: 'success', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },

      pending: { label: 'Pending', labelKh: 'រង់ចាំ', color: 'warning', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
      unpaid: { label: 'Unpaid', labelKh: 'មិនទាន់ទូទាត់', color: 'warning', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
      processing: { label: 'Processing', labelKh: 'កំពុងដំណើរការ', color: 'info', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
      shipped: { label: 'Shipped', labelKh: 'បានផ្ញើចេញ', color: 'info', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },

      cancelled: { label: 'Cancelled', labelKh: 'បានបោះបង់', color: 'danger', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
      rejected: { label: 'Rejected', labelKh: 'បានបដិសេធ', color: 'danger', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
      refunded: { label: 'Refunded', labelKh: 'បានសងប្រាក់វិញ', color: 'purple', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
      inactive: { label: 'Inactive', labelKh: 'អសកម្ម', color: 'secondary', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
    }

    if (colorMap[s]) {
      return colorMap[s]
    }

    const fallbackLabel = s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : 'Unknown'
    return {
      label: fallbackLabel,
      labelKh: fallbackLabel,
      color: 'secondary',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    }
  }

  public static json(val: any): string {
    return formatJsonValue(val)
  }
}

export default GlobalFormat
