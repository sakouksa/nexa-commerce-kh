import React, { useEffect, useMemo, useState } from 'react';
import { toast } from '../../utils';
import {
  Users as UsersIcon,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Store,
  Shield,
  ShieldCheck,
  User as UserIcon,
  KeyRound,
  Edit,
  Trash2,
  RefreshCw,
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Ban,
  ArrowUpDown,
  Building2,
  Loader2,
  Sparkles,
  MoreVertical,
} from 'lucide-react';
import { createUser, deleteUser, listShops, listUsers, updateUser, fullUrl } from '../../api';
import { Card } from '../../components/ui/card';
import { AccentStatCard, AccentStatGrid } from '../../components/cards/AccentStatCard';
import { Table, Column } from '../../components/common/Table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { ConfirmModal, UnifiedFilterToolbar, type ColumnOption, Modal } from '../../components/shared';
import { Shop, User } from '../../types';
import { useLanguage } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';

const emptyForm = { username: '', email: '', password: '', role: 'shop_owner', shop_id: '' };

export default function Users() {
  const { t, language } = useLanguage();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [shopFilter, setShopFilter] = useState('all');
  type UserSortField = 'username' | 'role' | 'created_at';
  const [sortBy, setSortBy] = useState<UserSortField>('username');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    username: true,
    role: true,
    assigned_shop: true,
    status: true,
    created_at: true,
  });

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Action Modals
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [statusTarget, setStatusTarget] = useState<User | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Load Data
  const load = async () => {
    setLoading(true);

    try {
      const [u, s] = await Promise.all([listUsers(), listShops()]);
      setUsers(Array.isArray(u) ? u : []);
      setShops(Array.isArray(s) ? s : []);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('common.loadFailed', 'បរាជ័យក្នុងការទាញយកទិន្នន័យ'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Compute KPI Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === 'admin' || u.role === 'superadmin').length;
    const shopOwners = users.filter((u) => u.role === 'shop_owner' || u.role === 'staff' || u.role === 'merchant').length;
    const active = users.filter((u) => (u.status || 'active') === 'active').length;
    const suspended = total - active;

    return { total, admins, shopOwners, active, suspended };
  }, [users]);

  // Filtering & Sorting
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchUsername = (u.username || '').toLowerCase().includes(q);
        const matchEmail = (u.email || '').toLowerCase().includes(q);
        const matchShop = (u.shop_name || '').toLowerCase().includes(q);
        if (!matchUsername && !matchEmail && !matchShop) return false;
      }

      // Role filter
      if (roleFilter !== 'all') {
        if (roleFilter === 'admin' && u.role !== 'admin' && u.role !== 'superadmin') return false;
        if (roleFilter === 'shop_owner' && u.role !== 'shop_owner' && u.role !== 'merchant') return false;
        if (roleFilter === 'staff' && u.role !== 'staff') return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const userStatus = u.status || 'active';
        if (userStatus !== statusFilter) return false;
      }

      // Shop filter
      if (shopFilter !== 'all') {
        if (shopFilter === 'none' && u.shop_id) return false;
        if (shopFilter !== 'none' && String(u.shop_id) !== String(shopFilter)) return false;
      }

      return true;
    }).sort((a, b) => {
      let valA: any = a[sortBy] || '';
      let valB: any = b[sortBy] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, search, roleFilter, statusFilter, shopFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  // Reset Filters
  const resetFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setShopFilter('all');
    setPage(1);
  };

  // Form Handlers
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowPassword(false);
    setModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({
      username: u.username,
      email: u.email || '',
      password: '',
      role: u.role || 'shop_owner',
      shop_id: u.shop_id !== null && u.shop_id !== undefined ? String(u.shop_id) : '',
    });
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing && (!form.username.trim() || !form.password.trim())) {
      toast.error(t('users.requiredFields', 'Username and password are required'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        username: form.username.trim(),
        email: form.email.trim(),
        role: form.role,
        shop_id: form.shop_id === '' ? null : Number(form.shop_id),
      };

      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      if (editing) {
        await updateUser(editing.id, payload);
        toast.success(t('users.userSaved', 'User saved successfully'));
      } else {
        await createUser(payload);
        toast.success(t('users.userSaved', 'User created successfully'));
      }

      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('users.saveFailed', 'Failed to save user'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action
  const handleRemove = (user: User) => {
    if (user.id === currentUser?.id || user.username === 'admin') {
      toast.error(t('users.cannotDeleteSelf', 'You cannot delete your own account'));
      return;
    }
    setDeleteTarget(user);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      toast.success(t('users.userDeleted', 'User deleted successfully'));
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('users.deleteFailed', 'Failed to delete user'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Status Toggle
  const handleToggleStatus = (user: User) => {
    if (user.id === currentUser?.id || user.username === 'admin') {
      toast.error(t('users.cannotSuspendSelf', 'You cannot suspend your own account'));
      return;
    }
    setStatusTarget(user);
  };

  const handleConfirmStatusToggle = async () => {
    if (!statusTarget) return;
    setIsTogglingStatus(true);
    const nextStatus = (statusTarget.status || 'active') === 'active' ? 'suspended' : 'active';
    try {
      await updateUser(statusTarget.id, { status: nextStatus });
      toast.success(t('users.statusUpdated', 'User status updated successfully'));
      setStatusTarget(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('users.statusFailed', 'Failed to update status'));
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Reset Password Action
  const openResetPassword = (user: User) => {
    setResetTarget(user);
    setNewPassword('');
    setShowResetPassword(false);
  };

  const handleConfirmResetPassword = async () => {
    if (!resetTarget || !newPassword.trim()) return;
    setIsResetting(true);
    try {
      await updateUser(resetTarget.id, { password: newPassword.trim() });
      toast.success(t('users.passwordResetSuccess', 'Password reset successfully'));
      setResetTarget(null);
      setNewPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('users.resetPasswordFailed', 'Failed to reset password'));
    } finally {
      setIsResetting(false);
    }
  };

  // Role Badge Styling
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
      case 'superadmin':
        return (
          <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60 font-semibold gap-1.5 px-2.5 py-0.5">
            <Shield className="size-3 text-purple-500" />
            <span>{t('users.roles.admin', 'Admin')}</span>
          </Badge>
        );
      case 'staff':
        return (
          <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60 font-semibold gap-1.5 px-2.5 py-0.5">
            <UserIcon className="size-3 text-amber-500" />
            <span>{t('users.roles.staff', 'Staff')}</span>
          </Badge>
        );
      case 'shop_owner':
      case 'merchant':
      default:
        return (
          <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60 font-semibold gap-1.5 px-2.5 py-0.5">
            <Store className="size-3 text-indigo-500" />
            <span>{t('users.roles.shop_owner', 'Shop Owner')}</span>
          </Badge>
        );
    }
  };

  // Format Date Helper
  const KH_MONTHS = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
  const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate();
      const monthIdx = d.getMonth();
      const year = d.getFullYear();
      if (language === 'kh') {
        return `${day} ${KH_MONTHS[monthIdx]} ${year}`;
      }
      return `${EN_MONTHS[monthIdx]} ${day}, ${year}`;
    } catch {
      return dateStr;
    }
  };

  // Table Columns Definition
  const columns = useMemo<Column<User>[]>(
    () => [
      {
        key: 'username',
        title: t('users.user', 'អ្នកប្រើប្រាស់'),
        sortable: true,
        width: 280,
        render: (u) => {
          const isSelf = u.id === currentUser?.id || u.username === currentUser?.username;
          const initials = (u.username || 'U').slice(0, 2).toUpperCase();
          const isActive = (u.status || 'active') === 'active';

          const roleGradient =
            u.role === 'admin' || u.role === 'superadmin'
              ? 'bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-700'
              : u.role === 'staff'
              ? 'bg-gradient-to-br from-amber-500 to-orange-600'
              : 'bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-700';

          return (
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <Avatar className="size-11 rounded-full border border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-sm ring-2 ring-white/90 dark:ring-slate-900">
                  {u.avatar || u.avatar_url || u.photo ? (
                    <AvatarImage
                      src={fullUrl(u.avatar || u.avatar_url || u.photo)}
                      alt={u.username}
                      className="size-full object-cover"
                    />
                  ) : null}
                  <AvatarFallback className={`size-full font-bold text-sm tracking-wider text-white shadow-inner ${roleGradient}`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                    isActive ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  title={isActive ? t('users.active', 'សកម្ម') : t('users.suspended', 'ផ្អាក')}
                />
              </div>

              <div className="min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span
                    onClick={() => openEdit(u)}
                    className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer truncate"
                  >
                    {u.username}
                  </span>
                  {isSelf && (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold border border-indigo-200/60 dark:border-indigo-800/60 shrink-0">
                      {t('users.currentUser', 'អ្នក')}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-1 font-normal">
                  <Mail className="size-3 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[200px]" title={u.email || ''}>
                    {u.email || '—'}
                  </span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        key: 'role',
        title: t('users.role', 'តួនាទី'),
        sortable: true,
        width: 160,
        render: (u) => renderRoleBadge(u.role),
      },
      {
        key: 'assigned_shop',
        title: t('users.assignedShop', 'ហាងដែលបានចាត់តាំង'),
        width: 220,
        render: (u) =>
          u.shop_name ? (
            <div className="flex items-center gap-2">
              <Store className="size-3.5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                {u.shop_name}
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
              <Building2 className="size-3 text-slate-400" />
              {t('users.platformLevel', 'កម្រិត Platform')}
            </span>
          ),
      },
      {
        key: 'status',
        title: t('users.status', 'ស្ថានភាព'),
        width: 130,
        render: (u) => {
          const isActive = (u.status || 'active') === 'active';
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60'
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              {isActive ? t('users.active', 'សកម្ម') : t('users.suspended', 'ផ្អាក')}
            </span>
          );
        },
      },
      {
        key: 'created_at',
        title: t('users.created', 'កាលបរិច្ឆេទបង្កើត'),
        sortable: true,
        width: 140,
        render: (u) => (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatDate(u.created_at)}
          </span>
        ),
      },
      {
        key: 'actions',
        title: t('users.actions', 'សកម្មភាព'),
        align: 'right',
        width: 70,
        render: (u) => {
          const isSelf = u.id === currentUser?.id || u.username === currentUser?.username;
          const isRootAdmin = u.username === 'admin';
          const isActive = (u.status || 'active') === 'active';

          return (
            <div className="flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    className="size-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <MoreVertical className="size-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="text-xs font-semibold text-slate-400 truncate">
                    {u.username}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => openEdit(u)}
                    className="gap-2.5 cursor-pointer text-xs"
                  >
                    <Edit className="size-3.5 text-slate-500" />
                    <span>{t('users.editUser', 'កែសម្រួលព័ត៌មាន')}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => openResetPassword(u)}
                    className="gap-2.5 cursor-pointer text-xs"
                  >
                    <KeyRound className="size-3.5 text-amber-500" />
                    <span>{t('users.resetPassword', 'ប្តូរពាក្យសម្ងាត់')}</span>
                  </DropdownMenuItem>

                  {!isSelf && !isRootAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(u)}
                        className="gap-2.5 cursor-pointer text-xs"
                      >
                        {isActive ? (
                          <>
                            <Ban className="size-3.5 text-amber-500" />
                            <span>{t('users.suspend', 'ផ្អាកដំណើរការ')}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="size-3.5 text-emerald-500" />
                            <span>{t('users.activate', 'បើកដំណើរការ')}</span>
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleRemove(u)}
                        className="gap-2.5 cursor-pointer text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40"
                      >
                        <Trash2 className="size-3.5 text-rose-500" />
                        <span>{t('buttons.delete', 'លុបគណនី')}</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [currentUser, language, t]
  );

  const displayedColumns = useMemo(() => {
    return columns.filter((c) => c.key === 'actions' || visibleColumns[c.key] !== false);
  }, [columns, visibleColumns]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t('users.title', 'គ្រប់គ្រង Users')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t('users.subtitle', 'គ្រប់គ្រង Platform Admins, Shop Owners, Staff និងគណនីក្នុងប្រព័ន្ធ')}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => load()}
              disabled={loading}
              className="h-9 px-4 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm gap-2 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{t('buttons.refresh', 'ផ្ទុកឡើងវិញ')}</span>
            </Button>

            <Button
              onClick={openCreate}
              className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm gap-2 shadow-xs cursor-pointer transition-all"
            >
              <Plus className="size-4" />
              <span>{t('users.createUser', 'បន្ថែម User ថ្មី')}</span>
            </Button>
          </div>
        </div>

        {/* Accent KPI Stats Cards (Non-clickable static display) */}
        <AccentStatGrid columns={4} className="mb-0">
          <AccentStatCard
            variant="indigo"
            label={t('users.stats.totalUsers', 'អ្នកប្រើប្រាស់សរុប')}
            value={stats.total}
            useCounter={true}
            icon={<UsersIcon className="size-5" />}
            subtitle={t('users.stats.totalDesc', 'គណនីទាំងអស់ក្នុងប្រព័ន្ធ')}
          />

          <AccentStatCard
            variant="purple"
            label={t('users.stats.admins', 'Platform Admins')}
            value={stats.admins}
            useCounter={true}
            icon={<ShieldCheck className="size-5" />}
            subtitle={t('users.stats.adminsDesc', 'សិទ្ធិគ្រប់គ្រងខ្ពស់បំផុត')}
          />

          <AccentStatCard
            variant="sky"
            label={t('users.stats.shopOwners', 'ម្ចាស់ហាង និងបុគ្គលិក')}
            value={stats.shopOwners}
            useCounter={true}
            icon={<Store className="size-5" />}
            subtitle={t('users.stats.shopOwnersDesc', 'គ្រប់គ្រងដំណើរការតាមហាង')}
          />

          <AccentStatCard
            variant="emerald"
            label={t('users.stats.activeUsers', 'គណនីសកម្ម')}
            value={stats.active}
            useCounter={true}
            icon={<CheckCircle2 className="size-5" />}
            subtitle={t('users.stats.activeDesc', {
              active: stats.active,
              suspended: stats.suspended,
              defaultValue: `${stats.active} សកម្ម • ${stats.suspended} ផ្អាក`,
            })}
          />
        </AccentStatGrid>

        {/* Unified SmartHR-Style Filter Toolbar */}
        <UnifiedFilterToolbar
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          searchPlaceholder={t('users.searchPlaceholder', 'ស្វែងរកតាម Username, អ៊ីមែល ឬហាង...')}
          filters={[
            {
              id: 'role',
              value: roleFilter,
              onChange: (val) => {
                setRoleFilter(val || 'all');
                setPage(1);
              },
              options: [
                { value: 'all', label: `${t('users.allRoles', 'តួនាទីទាំងអស់')} (${users.length})` },
                { value: 'admin', label: `${t('users.roles.admin', 'Admin')} (${stats.admins})` },
                { value: 'shop_owner', label: `${t('users.roles.shop_owner', 'ម្ចាស់ហាង')} (${stats.shopOwners})` },
                { value: 'staff', label: t('users.roles.staff', 'Staff') },
              ],
            },
            {
              id: 'status',
              value: statusFilter,
              onChange: (val) => {
                setStatusFilter(val || 'all');
                setPage(1);
              },
              options: [
                { value: 'all', label: t('users.allStatus', 'ស្ថានភាពទាំងអស់') },
                { value: 'active', label: `${t('users.active', 'សកម្ម')} (${stats.active})` },
                { value: 'suspended', label: `${t('users.suspended', 'ផ្អាក')} (${stats.suspended})` },
              ],
            },
            ...(shops.length > 0
              ? [
                  {
                    id: 'shop',
                    value: shopFilter,
                    onChange: (val: string) => {
                      setShopFilter(val || 'all');
                      setPage(1);
                    },
                    options: [
                      { value: 'all', label: t('users.allShops', 'ហាងទាំងអស់') },
                      { value: 'none', label: t('users.noShop', 'មិនបានចាត់តាំងហាង') },
                      ...shops.map((s) => ({
                        value: String(s.id),
                        label: `${s.shop_name} (@${s.username})`,
                      })),
                    ],
                  },
                ]
              : []),
          ]}
          onApply={() => setPage(1)}
          onReset={resetFilters}
          columns={[
            { key: 'username', label: t('users.user', 'User'), disabled: true },
            { key: 'role', label: t('users.role', 'Role') },
            { key: 'assigned_shop', label: t('users.assignedShop', 'Assigned Shop') },
            { key: 'status', label: t('users.status', 'Status') },
            { key: 'created_at', label: t('users.created', 'Created Date') },
          ]}
          visibleColumns={visibleColumns}
          onColumnChange={setVisibleColumns}
          columnSettingsTitle={t('users.manageColumns', 'គ្រប់គ្រងជួរឈរ')}
        />

        {/* Global Reusable Table */}
        <Table<User>
          columns={displayedColumns}
          data={paginatedUsers}
          loading={loading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(key, order) => {
            setSortBy(key as UserSortField);
            setSortOrder(order);
          }}
          pagination={{
            currentPage: page,
            pageSize,
            totalItems: filteredUsers.length,
            totalPages,
            onPageChange: setPage,
            onPageSizeChange: (newSize) => {
              setPageSize(newSize);
              setPage(1);
            },
            itemLabel: language === 'kh' ? 'គណនី' : 'users',
          }}
          emptyState={{
            icon: <UsersIcon className="size-6" />,
            title: t('users.notFound', 'រកមិនឃើញ User ទេ'),
            description: t('users.noMatchingUsers', 'គ្មានគណនីត្រូវគ្នានឹងការស្វែងរក ឬលក្ខខណ្ឌចម្រាញ់របស់អ្នកឡើយ។'),
            onReset:
              search || roleFilter !== 'all' || statusFilter !== 'all' || shopFilter !== 'all'
                ? resetFilters
                : undefined,
            resetLabel: t('users.resetFilters', 'កំណត់ឡើងវិញ'),
          }}
        />

        {/* Create / Edit User Modal (Global Unified) */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editing ? `${t('users.editUser', 'កែសម្រួល User')} (${editing.username})` : t('users.createUser', 'បន្ថែម User ថ្មី')}
          subtitle={
            editing
              ? t('users.editUserDesc', 'កែប្រែព័ត៌មានគណនី តួនាទី និងហាងដែលត្រូវគ្រប់គ្រង')
              : t('users.createUserDesc', 'បង្កើតគណនីអ្នកប្រើប្រាស់ថ្មីសម្រាប់ Admin, ម្ចាស់ហាង ឬបុគ្គលិក')
          }
          icon={editing ? <Edit className="size-4.5" /> : <Plus className="size-4.5" />}
          iconVariant="primary"
          size="lg"
          onSubmit={handleSubmit}
          submitLabel={editing ? t('buttons.save', 'រក្សាទុក') : t('buttons.create', 'បង្កើត User')}
          isSubmitting={isSubmitting}
          cancelLabel={t('buttons.cancel', 'បោះបង់')}
        >
          <div className="space-y-4">
            {/* Username Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('users.username', 'ឈ្មោះគណនី (Username)')} <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <Input
                  required
                  disabled={!!editing}
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="e.g. john_store"
                  className="pl-9 h-10 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('users.email', 'អ៊ីមែល (Email)')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="user@example.com"
                  className="pl-9 h-10 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {editing ? t('users.newPassword', 'Password ថ្មី') : t('forms.password', 'ពាក្យសម្ងាត់ (Password)')} {!editing && <span className="text-rose-500">*</span>}
                </Label>
                {editing && (
                  <span className="text-[11px] text-slate-400">
                    {t('users.passwordHelp', 'ទុកទទេប្រសិនបើមិនចង់ប្តូរ Password')}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required={!editing}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editing ? '••••••••' : t('users.passwordPlaceholder', 'បញ្ចូលពាក្យសម្ងាត់យ៉ាងតិច ៦ ខ្ទង់')}
                  className="pl-9 pr-10 h-10 rounded-xl text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Role Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('users.role', 'តួនាទី (Role)')}
              </Label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              >
                <option value="shop_owner">{t('users.roles.shop_owner', 'ម្ចាស់ហាង (Shop Owner)')}</option>
                <option value="staff">{t('users.roles.staff', 'បុគ្គលិក (Staff)')}</option>
                <option value="admin">{t('users.roles.admin', 'Admin (Platform Administrator)')}</option>
              </select>
            </div>

            {/* Associated Shop Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('users.assignedShop', 'ហាងដែលបានចាត់តាំង (Assigned Shop)')}
              </Label>
              <select
                value={form.shop_id}
                onChange={(e) => setForm({ ...form, shop_id: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              >
                <option value="">{t('users.noShop', 'មិនបានចាត់តាំងហាង (Platform Level)')}</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shop_name} (@{s.username})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Modal>

        {/* Reset Password Modal (Global Unified) */}
        <Modal
          open={!!resetTarget}
          onClose={() => setResetTarget(null)}
          title={t('users.resetPassword', 'Reset Password')}
          subtitle={t('users.resetPasswordPrompt', { username: resetTarget?.username })}
          icon={<KeyRound className="size-4.5" />}
          iconVariant="amber"
          size="md"
          onSubmit={(e) => {
            e.preventDefault();
            handleConfirmResetPassword();
          }}
          submitLabel={t('buttons.save', 'រក្សាទុក')}
          isSubmitting={isResetting}
          disabled={!newPassword.trim()}
          cancelLabel={t('buttons.cancel', 'បោះបង់')}
        >
          <div className="space-y-3 py-1">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <Input
                type={showResetPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 pr-10 h-10 rounded-xl text-sm"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowResetPassword(!showResetPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
              >
                {showResetPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          open={!!deleteTarget}
          title={t('users.deleteUserTitle', 'លុប User')}
          message={t('users.deleteUserConfirm', { username: deleteTarget?.username })}
          itemName={deleteTarget ? `${deleteTarget.username} (${deleteTarget.email || deleteTarget.role})` : undefined}
          confirmText={t('buttons.delete', 'លុប')}
          cancelText={t('buttons.cancel', 'បោះបង់')}
          variant="destructive"
          isLoading={isDeleting}
          onClose={() => { if (!isDeleting) setDeleteTarget(null); }}
          onConfirm={handleConfirmDelete}
        />

        {/* Status Toggle Confirmation Modal */}
        <ConfirmModal
          open={!!statusTarget}
          title={
            (statusTarget?.status || 'active') === 'active'
              ? t('users.suspendUserTitle', 'ផ្អាកគណនី User')
              : t('users.activateUserTitle', 'បើកដំណើរការគណនីឡើងវិញ')
          }
          message={
            (statusTarget?.status || 'active') === 'active'
              ? t('users.suspendUserConfirm', { username: statusTarget?.username })
              : t('users.activateUserConfirm', { username: statusTarget?.username })
          }
          itemName={statusTarget ? `${statusTarget.username} (${statusTarget.role})` : undefined}
          confirmText={
            (statusTarget?.status || 'active') === 'active'
              ? t('users.suspend', 'ផ្អាក')
              : t('users.activate', 'បើកដំណើរការ')
          }
          cancelText={t('buttons.cancel', 'បោះបង់')}
          variant={(statusTarget?.status || 'active') === 'active' ? 'destructive' : 'primary'}
          isLoading={isTogglingStatus}
          onClose={() => { if (!isTogglingStatus) setStatusTarget(null); }}
          onConfirm={handleConfirmStatusToggle}
        />
      </div>
    </TooltipProvider>
  );
}
