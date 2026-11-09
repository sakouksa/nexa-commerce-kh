/**
 * Shared utility functions for exporting datasets to CSV, Excel, and downloading Blobs/Files.
 */

// Global Intelligent Sample Value Dictionary for realistic sample records in Excel/CSV
export const GLOBAL_FIELD_SAMPLE_MAP: Record<string, string | number> = {
  // Identifiers & Codes
  sku: 'PRD-001',
  barcode: '885123456789',
  slug: 'wireless-gaming-mouse',
  code: 'CODE-001',
  employee_number: 'EMP-001',
  employee_code: 'EMP-001',
  nik: '010203040506',
  tracking_number: 'TRK-987654321',
  transaction_number: 'TRX-2026-001',
  account_number: 'ACC-100200300',
  tax_number: 'TAX-998877',

  // Names & People
  name: 'Wireless Gaming Mouse',
  full_name: 'John Doe',
  first_name: 'John',
  last_name: 'Doe',
  recipient_name: 'Sokha Chea',
  author: 'Admin Editor',
  email: 'john.doe@example.com',
  phone: '+855 12 345 678',
  phone_number: '+855 12 345 678',
  gender: 'male',
  birth_date: '1995-05-15',
  address: '#123, Street 271, Phnom Penh',
  destination: 'Phnom Penh, Cambodia',
  city: 'Phnom Penh',

  // Hierarchy & Categorization
  category: 'Electronics',
  brand: 'Logitech',
  unit: 'pcs',
  tax: 'VAT 10%',
  department: 'Information Technology',
  position: 'Senior Software Engineer',
  role: 'Manager',
  customer_group: 'VIP',
  carrier: 'DHL Express',
  expense_category: 'Office Supplies',
  account_name: 'Main Operating Account',
  account_type: 'bank',
  currency: 'USD',
  guard_name: 'web',
  module: 'products',
  action_type: 'view',
  risk_level: 'low',

  // Financial & Numerical
  cost_price: '25.00',
  selling_price: '45.00',
  compare_price: '50.00',
  basic_salary: '1200.00',
  net_salary: '1330.00',
  amount: '150.00',
  balance: '5000.00',
  opening_balance: '200.00',
  closing_balance: '1250.00',
  shipping_cost: '5.00',
  allowances: '100.00',
  deductions: '20.00',
  overtime_pay: '50.00',
  min_spend: '50.00',
  max_discount: '30.00',
  discount_value: '20',
  value: '15',
  working_days: '22',
  present_days: '22',
  low_stock_threshold: '10',
  weight: '0.35',
  length: '12.0',
  width: '8.0',
  height: '4.0',
  usage_limit: '100',

  // Booleans & Flags
  track_inventory: '1',
  featured: '1',
  digital: '0',
  status: 'active',
  type: 'percentage',
  discount_type: 'fixed',
  payment_method: 'cash',

  // Dates & Times
  date: '2026-08-20',
  join_date: '2024-01-15',
  start_date: '2026-08-01',
  end_date: '2026-08-31',
  starts_at: '2026-08-20 08:00:00',
  ends_at: '2026-08-20 22:00:00',
  check_in: '08:00:00',
  check_out: '17:30:00',
  period_month: '2026-08',

  // Content & Text
  title: 'Getting Started with Enterprise ERP',
  description: 'Enterprise ERP System Standard Catalog Item',
  content: 'Comprehensive standard documentation and system guide.',
  notes: 'Standard shift completion with on-time attendance.',
}

/**
 * Intelligent Sample Value Generator for any header key
 */
export const getIntelligentSampleValue = (headerKey: string, resourceContext?: string): string | number => {
  const key = headerKey.trim().toLowerCase()

  // Context-aware overrides
  if (key === 'name') {
    const ctx = (resourceContext || '').toLowerCase()
    if (ctx.includes('employee') || ctx.includes('user') || ctx.includes('customer') || ctx.includes('staff')) {
      return 'John Doe'
    }
    if (ctx.includes('position') || ctx.includes('job')) {
      return 'Senior Software Engineer'
    }
    if (ctx.includes('department') || ctx.includes('dept')) {
      return 'Information Technology'
    }
    if (ctx.includes('coupon') || ctx.includes('promo')) {
      return 'Special Discount 20%'
    }
    if (ctx.includes('supplier')) {
      return 'Logitech Global Supplies'
    }
    if (ctx.includes('category')) {
      return 'Electronics'
    }
    if (ctx.includes('brand')) {
      return 'Logitech'
    }
    if (ctx.includes('unit')) {
      return 'pcs'
    }
    return 'Wireless Gaming Mouse'
  }

  if (GLOBAL_FIELD_SAMPLE_MAP[key] !== undefined) {
    return GLOBAL_FIELD_SAMPLE_MAP[key]
  }

  // Fuzzy matches
  if (key.includes('email')) return 'user@example.com'
  if (key.includes('phone') || key.includes('tel') || key.includes('mobile')) return '+855 12 345 678'
  if (key.includes('date') || key.includes('dob')) return '2026-08-20'
  if (key.includes('price') || key.includes('cost') || key.includes('amount') || key.includes('salary') || key.includes('balance') || key.includes('fee')) return '100.00'
  if (key.includes('sku') || key.includes('code') || key.includes('barcode') || key.includes('ref')) return 'CODE-001'
  if (key.includes('status')) return 'active'
  if (key.includes('gender')) return 'male'
  if (key.includes('url') || key.includes('link')) return 'https://example.com'
  if (key.includes('qty') || key.includes('quantity') || key.includes('stock') || key.includes('count')) return '10'
  if (key.includes('desc') || key.includes('note') || key.includes('remark')) return 'Standard record description.'

  return 'Sample Value'
}

/**
 * Escapes a cell value for safe inclusion in CSV / Excel files.
 */
export const escapeCsvCell = (val: any): string => {
  if (val === null || val === undefined) return ''
  const str = String(val)
  // If the string contains comma, quote, or newline, escape and quote it
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Generates valid UTF-8 BOM CSV text from headers and row matrix.
 */
export const generateCsvContent = (
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): string => {
  const headerRow = headers.map(escapeCsvCell).join(',')
  const dataRows = rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n')
  return '\uFEFF' + headerRow + '\n' + dataRows
}

/**
 * Generates a clean sample CSV template with 1 realistic sample record.
 */
export const generateSampleCsvTemplate = (
  headers: string[],
  sampleRecord?: Record<string, string | number> | null,
  resourceContext?: string
): string => {
  if (headers.length === 0) return ''

  const headerRow = headers.map(escapeCsvCell).join(',')

  const sampleRowValues = headers.map((h) => {
    if (sampleRecord && sampleRecord[h] !== undefined) {
      return escapeCsvCell(sampleRecord[h])
    }
    const val = getIntelligentSampleValue(h, resourceContext)
    return escapeCsvCell(val)
  })

  const sampleRow = sampleRowValues.join(',')

  // UTF-8 BOM + Clean Header + 1 Realistic Sample Record Row
  return '\uFEFF' + headerRow + '\n' + sampleRow
}

/**
 * Triggers a native browser file download from a Blob.
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Formats data and triggers a CSV file download with date stamping.
 */
export const downloadCsv = (
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): void => {
  const csvContent = generateCsvContent(headers, rows)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const dateStamp = new Date().toISOString().split('T')[0]
  const finalFilename = filename.endsWith('.csv') ? filename : `${filename}_export_${dateStamp}.csv`
  downloadBlob(blob, finalFilename)
}

/**
 * Resolves standard date bounds from an ExportDateRange string ('1_day' | '7_days' | '1_month' | 'all').
 */
export const getDateRangeBounds = (
  range: string
): { startDate?: string; endDate?: string } => {
  const today = new Date()
  const formatDate = (d: Date) => d.toISOString().substring(0, 10)

  if (range === '1_day') {
    const todayStr = formatDate(today)
    return { startDate: todayStr, endDate: todayStr }
  }
  if (range === '7_days') {
    const past = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)
    return { startDate: formatDate(past), endDate: formatDate(today) }
  }
  if (range === '1_month') {
    // Current month start to today
    const past = new Date(today.getFullYear(), today.getMonth(), 1)
    return { startDate: formatDate(past), endDate: formatDate(today) }
  }
  return {}
}

/**
 * Downloads a clean sample template CSV with 1 realistic sample record for Excel.
 */
export const downloadSampleCsvTemplate = (
  resourceName: string,
  headers: string[],
  sampleRecord?: Record<string, string | number> | null
): void => {
  const csvContent = generateSampleCsvTemplate(headers, sampleRecord, resourceName)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const cleanName = resourceName ? resourceName.toLowerCase().replace(/[^a-z0-9]+/g, '_') : 'sample'
  const filename = `${cleanName}_import_template.csv`
  downloadBlob(blob, filename)
}
