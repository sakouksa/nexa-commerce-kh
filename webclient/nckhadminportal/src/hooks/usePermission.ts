import { useAuth } from '../contexts/AuthContext'
import { normalizePermission } from '../utils/permissionUtils'

/**
 * Enterprise RBAC React Hook for MiniStore KH
 * Provides high-level, type-safe permission checks and user role status.
 */
export function usePermission() {
  const { user } = useAuth()

  const roles: string[] = Array.isArray(user?.roles)
    ? user.roles
    : user?.role
      ? [user.role]
      : []

  const permissions: string[] = Array.isArray(user?.permissions)
    ? user.permissions
    : []

  const hasRole = (role: string) => {
    if (!user) return false
    if (roles.includes('superadmin') || roles.includes('super_admin')) return true
    return roles.includes(role.toLowerCase())
  }

  const hasPermission = (permission: string) => {
    if (!user) return false
    if (roles.includes('superadmin') || roles.includes('super_admin')) return true
    const norm = normalizePermission(permission)
    return permissions.some((p) => normalizePermission(p) === norm)
  }

  const hasAnyPermission = (perms: string[]) => {
    if (!user) return false
    if (roles.includes('superadmin') || roles.includes('super_admin')) return true
    return perms.some((p) => hasPermission(p))
  }

  const hasAllPermissions = (perms: string[]) => {
    if (!user) return false
    if (roles.includes('superadmin') || roles.includes('super_admin')) return true
    return perms.every((p) => hasPermission(p))
  }

  const isSuperAdmin = Boolean(roles.includes('superadmin') || roles.includes('super_admin'))
  const isAdmin = Boolean(isSuperAdmin || roles.includes('admin'))
  const isMerchant = Boolean(roles.includes('merchant'))
  const isReseller = Boolean(roles.includes('reseller'))

  return {
    user,
    roles,
    permissions,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    isAdmin,
    isMerchant,
    isReseller,
    normalizePermission,
  }
}

export default usePermission
