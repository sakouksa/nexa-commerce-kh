/**
 * Centralized RBAC Permission Utilities & Risk Classification
 */

// Legacy/plural aliases mapped to canonical singular Spatie permission names
const PERMISSION_ALIASES: Record<string, string> = {
  'products.view': 'product.view',
  'products.create': 'product.create',
  'products.edit': 'product.update',
  'products.update': 'product.update',
  'products.delete': 'product.delete',
  'products.manage': 'product.update',

  'categories.view': 'category.view',
  'categories.create': 'category.create',
  'categories.edit': 'category.update',
  'categories.update': 'category.update',
  'categories.delete': 'category.delete',

  'brands.view': 'brand.view',
  'brands.create': 'brand.create',
  'brands.update': 'brand.update',
  'brands.delete': 'brand.delete',

  'units.view': 'unit.view',
  'taxes.view': 'tax.view',
  'attributes.view': 'attribute.view',

  'purchases.view': 'purchase.view',
  'purchases.create': 'purchase.create',
  'purchases.edit': 'purchase.update',
  'purchases.update': 'purchase.update',
  'purchases.delete': 'purchase.delete',
  'purchases.approve': 'purchase.approve',

  'suppliers.view': 'supplier.view',
  'suppliers.create': 'supplier.create',
  'suppliers.edit': 'supplier.update',
  'suppliers.update': 'supplier.update',
  'suppliers.delete': 'supplier.delete',

  'customers.view': 'customer.view',
  'customers.create': 'customer.create',
  'customers.edit': 'customer.update',
  'customers.update': 'customer.update',
  'customers.delete': 'customer.delete',

  'employees.view': 'employee.view',
  'employees.create': 'employee.create',
  'employees.edit': 'employee.update',
  'employees.update': 'employee.update',
  'employees.delete': 'employee.delete',

  'promotions.view': 'promotion.view',
  'promotions.create': 'promotion.create',
  'promotions.update': 'promotion.update',
  'promotions.delete': 'promotion.delete',

  'coupons.view': 'coupon.view',
  'coupons.create': 'coupon.create',
  'coupons.update': 'coupon.update',
  'coupons.delete': 'coupon.delete',

  'flash_sales.view': 'flash_sale.view',
  'flash_sales.create': 'flash_sale.create',

  'banners.view': 'banner.view',
  'banners.create': 'banner.create',
  'banners.update': 'banner.update',
  'banners.delete': 'banner.delete',

  'shipping.view': 'shipment.view',
  'finance.view': 'expense.view',
  'reports.view': 'report.view',
  'settings.view': 'setting.view',
  'activity.view': 'activity_log.view',
}

/**
 * Normalizes any permission name to its canonical {module}.{action} representation
 */
export function normalizePermission(permission: string): string {
  if (!permission) return ''
  const trimmed = permission.trim().toLowerCase()
  return PERMISSION_ALIASES[trimmed] || trimmed
}

/**
 * Extracts the module name from a permission string
 */
export function getPermissionModule(permission: string): string {
  const norm = normalizePermission(permission)
  const parts = norm.split('.')
  return parts[0] || 'general'
}

/**
 * Extracts the action name from a permission string
 */
export function getPermissionAction(permission: string): string {
  const norm = normalizePermission(permission)
  const parts = norm.split('.')
  return parts.length > 1 ? parts.slice(1).join('.') : 'view'
}

/**
 * Centralized Enterprise Risk Classification
 * - Low Risk: *.view
 * - Medium Risk: *.create, *.update, *.export, *.adjust, *.transfer, *.opname
 * - High Risk: *.delete, *.approve, *.refund, *.return, company.*, role.*, user.*, permission.*, setting.*, audit_log.*
 */
export function getPermissionRiskLevel(permission: string): 'low' | 'medium' | 'high' {
  const norm = normalizePermission(permission)
  const module = getPermissionModule(norm)
  const action = getPermissionAction(norm)

  const highRiskActions = ['delete', 'force_delete', 'restore', 'approve', 'refund', 'return']
  const highRiskModules = ['company', 'role', 'user', 'permission', 'setting', 'audit_log']

  if (highRiskActions.includes(action) || highRiskModules.includes(module)) {
    return 'high'
  }

  const mediumRiskActions = [
    'create', 'update', 'edit', 'export', 'import',
    'manage', 'process', 'adjust', 'transfer', 'opname', 'assign'
  ]
  if (mediumRiskActions.includes(action)) {
    return 'medium'
  }

  return 'low'
}

/**
 * Formats a clean human-readable title for a permission
 */
export function formatPermissionLabel(permission: string): string {
  const module = getPermissionModule(permission)
  const action = getPermissionAction(permission)

  const formatWord = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).replace(/_/g, ' ')

  return `${formatWord(action)} ${formatWord(module)}`
}
