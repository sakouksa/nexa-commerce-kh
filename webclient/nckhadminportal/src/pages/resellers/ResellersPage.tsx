import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../utils';
import { FiCopy, FiDollarSign, FiEdit2, FiEye, FiPercent, FiPlus, FiShoppingBag, FiTrash2, FiUsers } from 'react-icons/fi';
import { createReseller, deleteReseller, listResellers, resellerCustomers, updateReseller } from '../../api';
import { Empty, GlobalCard, Loading, Pagination, btnGhost, btnPrimary, inputCls } from '../../components/ui';
import { ConfirmModal, UnifiedFilterToolbar, Modal } from '../../components/shared';
import { useLanguage } from '../../i18n';

const STORE_URL = process.env.REACT_APP_STORE_URL || 'http://localhost:3000';

const empty = { username: '', email: '', password: '', referral_code: '', commission_rate: '10', discount_max: '1', status: 'active' };

export default function Resellers() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [rows, setRows] = useState<any[] | null>(null);
  const [search, setSearch] = useState('');
  const [paidFilter, setPaidFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [customers, setCustomers] = useState<Record<string | number, { loading: boolean; data: any[] }>>({});
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(empty);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(() => {
    listResellers().then(setRows).catch(() => setRows([]));
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = (k: string) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing) {
        await updateReseller(editing.id, {
          email: form.email, referral_code: form.referral_code,
          commission_rate: Number(form.commission_rate), discount_max: Number(form.discount_max),
          status: form.status, password: form.password || undefined,
        });
        toast.success(`Reseller ${editing.username} updated`);
      } else {
        if (!form.username || !form.password) { toast.error('Username and password are required'); return; }
        await createReseller(form);
        toast.success('Reseller created');
      }
      setModal(false); setEditing(null); setForm(empty);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to save reseller');
    } finally {
      setBusy(false);
    }
  };

  const openEdit = (r: any) => {
    setEditing(r);
    setForm({ username: r.username, email: r.email || '', password: '',
              referral_code: r.referral_code || '', commission_rate: String(r.commission_rate || 10),
              discount_max: String(r.discount_max ?? 1), status: r.status || 'active' });
    setModal(true);
  };

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true); };

  const remove = (r: any) => {
    setDeleteTarget(r);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteReseller(deleteTarget.id);
      toast.success('Reseller deleted');
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleCustomers = async (r: any) => {
    if (customers[r.id]) { setCustomers((c) => { const n = { ...c }; delete n[r.id]; return n; }); return; }
    setCustomers((c) => ({ ...c, [r.id]: { loading: true, data: [] } }));
    try {
      const data = await resellerCustomers(r.id);
      setCustomers((c) => ({ ...c, [r.id]: { loading: false, data: data.customers || [] } }));
    } catch {
      setCustomers((c) => ({ ...c, [r.id]: { loading: false, data: [] } }));
    }
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => toast.success('Copied')).catch(() => {});
  };

  const setPaid = async (r: any, value: string) => {
    try {
      await updateReseller(r.id, { commission_paid: value });
      toast.success(`${r.username} commission marked ${value === 'paid' ? 'PAID' : 'NOT YET'}`);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Update failed');
    }
  };

  const filteredRows = (rows || []).filter((r: any) => {
    if (paidFilter !== 'all' && (r.commission_paid || 'not_yet') !== paidFilter) return false;
    if (statusFilter !== 'all' && (r.status || 'active') !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchUser = (r.username || '').toLowerCase().includes(q);
      const matchEmail = (r.email || '').toLowerCase().includes(q);
      const matchRef = (r.referral_code || '').toLowerCase().includes(q);
      if (!matchUser && !matchEmail && !matchRef) return false;
    }
    return true;
  });

  const resetFilters = () => {
    setSearch('');
    setPaidFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  const totals = (rows || []).reduce(
    (acc, r: any) => ({
      resellers: acc.resellers + 1,
      shops: acc.shops + (r.shop_count || 0),
      customers: acc.customers + (r.customer_count || 0),
      commission: acc.commission + (r.commission || 0),
      sales: acc.sales + (r.sales || 0),
      paid: acc.paid + ((r.commission_paid || 'not_yet') === 'paid' ? 1 : 0),
    }),
    { resellers: 0, shops: 0, customers: 0, commission: 0, sales: 0, paid: 0 }
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center"><FiPercent /></span>
          {t('resellers.title')}
        </h1>
        <button onClick={openCreate} className={btnPrimary + ' flex items-center gap-2'}><FiPlus /> {t('resellers.createReseller')}</button>
      </div>

      {rows && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <GlobalCard
            cardType="stats"
            title={t('resellers.reseller')}
            value={totals.resellers}
            variant="indigo"
            icon={<FiUsers className="size-5" />}
          />
          <GlobalCard
            cardType="stats"
            title={t('shops.shop')}
            value={totals.shops}
            variant="blue"
            icon={<FiShoppingBag className="size-5" />}
          />
          <GlobalCard
            cardType="stats"
            title={t('dashboard.customers')}
            value={totals.customers}
            variant="purple"
            icon={<FiUsers className="size-5" />}
          />
          <GlobalCard
            cardType="stats"
            title={t('dashboard.totalRevenue')}
            value={totals.sales}
            prefix="$"
            decimals={2}
            variant="amber"
            icon={<FiDollarSign className="size-5" />}
          />
          <GlobalCard
            cardType="stats"
            title={t('dashboard.commission')}
            value={totals.commission}
            prefix="$"
            decimals={2}
            subtitle={`${totals.paid}/${totals.resellers} ${t('common.paid')}`}
            variant="emerald"
            icon={<FiPercent className="size-5" />}
          />
        </div>
      )}

      {/* Unified SmartHR-Style Filter Toolbar */}
      <div className="mb-6">
        <UnifiedFilterToolbar
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          searchPlaceholder={t('resellers.searchPlaceholder', 'ស្វែងរកតាម Username, អ៊ីមែល ឬ Referral Code...')}
          filters={[
            {
              id: 'payout',
              value: paidFilter,
              onChange: (val) => {
                setPaidFilter(val || 'all');
                setPage(1);
              },
              options: [
                { value: 'all', label: t('resellers.allPayouts', 'ការទូទាត់ទាំងអស់') },
                { value: 'not_yet', label: t('resellers.onlyUnpaid', 'មិនទាន់ទូទាត់') },
                { value: 'paid', label: t('resellers.onlyPaid', 'បានទូទាត់រួច') },
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
                { value: 'all', label: t('common.allStatus', 'ស្ថានភាពទាំងអស់') },
                { value: 'active', label: t('common.active', 'សកម្ម') },
                { value: 'inactive', label: t('common.inactive', 'អសកម្ម') },
              ],
            },
          ]}
          onApply={() => setPage(1)}
          onReset={resetFilters}
        />
      </div>

      {!rows ? (
        <Loading />
      ) : filteredRows.length === 0 ? (
        <Empty
          title={t('resellers.noResellersFound', 'មិនមាន Reseller ត្រូវនឹងលក្ខខណ្ឌស្វែងរក')}
          description={t('resellers.noResellersDesc', 'សាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬសម្អាតតម្រង Payout/Status')}
          action={
            (search || paidFilter !== 'all' || statusFilter !== 'all') ? (
              <button
                type="button"
                onClick={resetFilters}
                className="h-9 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-card hover:bg-muted text-xs font-semibold cursor-pointer shadow-2xs"
              >
                {t('common.reset', 'កំណត់ឡើងវិញ')}
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredRows.slice((page - 1) * pageSize, page * pageSize).map((r: any) => (
              <GlobalCard
                key={r.id}
                cardType="container"
                className="hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                title={
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                      <FiUsers className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{r.username}</p>
                      <p className="text-xs text-slate-400 truncate">{r.email || '—'}</p>
                    </div>
                  </div>
                }
                action={
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        r.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                      }`}
                    >
                      {r.status}
                    </span>
                    <button
                      onClick={() => openEdit(r)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 className="size-4" />
                    </button>
                    <button
                      onClick={() => remove(r)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="size-4" />
                    </button>
                  </div>
                }
                footer={
                  <div className="space-y-3 pt-1">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/resellers/${r.id}`)}
                        className={`${btnPrimary} flex-1 flex items-center justify-center gap-1.5 text-xs py-2`}
                      >
                        <FiEye /> View all shops & details
                      </button>
                      <button
                        onClick={() => toggleCustomers(r)}
                        className={`${btnGhost} flex-1 flex items-center justify-center gap-1.5 text-xs py-2 border border-slate-200 dark:border-slate-800`}
                      >
                        <FiUsers /> Customers ({r.customer_count})
                      </button>
                    </div>

                    {customers[r.id] && (
                      <div className="mt-3 max-h-56 overflow-y-auto bg-slate-50 dark:bg-slate-800/40 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800">
                        {customers[r.id].loading ? (
                          <p className="text-xs text-slate-400 text-center py-3">Loading...</p>
                        ) : customers[r.id].data.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-3">No customers yet.</p>
                        ) : (
                          <table className="w-full text-xs">
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                              {customers[r.id].data.map((c: any) => (
                                <tr key={c.id || c.phone || c.name}>
                                  <td className="py-1.5 pr-2">
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{c.name || '—'}</p>
                                    <p className="text-[10px] text-slate-400">{c.phone || c.telegram || c.email || ''}</p>
                                  </td>
                                  <td className="text-right text-slate-400 py-1.5">@{c.shop_username}</td>
                                  <td className="text-right py-1.5 pl-2">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${c.type === 'registered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                      {c.type === 'registered' ? 'Account' : 'Guest'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                }
              >
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => copy(`${STORE_URL}/create-shop?ref=${r.referral_code}`)}
                    className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-xs font-mono hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">REF: {r.referral_code}</span>
                    <FiCopy className="text-slate-400" />
                  </button>
                  <p className="text-[11px] text-slate-400 text-center font-mono truncate">
                    {STORE_URL}/create-shop?ref={r.referral_code}
                  </p>

                  {/* Commission payment status */}
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2.5 border border-slate-100 dark:border-slate-800/60">
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Commission ${(r.commission || 0).toFixed(2)}</p>
                      <p className="text-[10px] text-slate-400">
                        {r.commission_paid === 'paid' && r.commission_paid_at ? `Paid on ${new Date(r.commission_paid_at).toLocaleDateString()}` : 'Payment status'}
                      </p>
                    </div>
                    <select
                      value={r.commission_paid || 'not_yet'}
                      onChange={(e) => setPaid(r, e.target.value)}
                      className={`text-xs font-bold rounded-lg px-2 py-1.5 border cursor-pointer ${
                        r.commission_paid === 'paid'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      <option value="not_yet">Not yet</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl py-2 border border-slate-100 dark:border-slate-800/60">
                      <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{r.shop_count}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Shops</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl py-2 border border-slate-100 dark:border-slate-800/60">
                      <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{r.customer_count}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Customers</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-xl py-2 border border-emerald-100 dark:border-emerald-900/40">
                      <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">${(r.commission || 0).toFixed(2)}</p>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase font-semibold">{r.commission_rate}%</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className="bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 rounded-full px-2.5 py-0.5 text-[11px] font-medium border border-sky-100 dark:border-sky-900/40">
                      Max disc ${Number(r.discount_max || 1).toFixed(2)}
                    </span>
                    <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-full px-2.5 py-0.5 text-[11px] font-medium border border-amber-100 dark:border-amber-900/40">
                      Promo ${Number(r.promo_discount || 0).toFixed(2)}
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full px-2.5 py-0.5 text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                      Sales ${(r.sales || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </GlobalCard>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 px-4 py-1">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(filteredRows.length / pageSize) || 1}
              totalItems={filteredRows.length}
              pageSize={pageSize}
              pageSizeOptions={[6, 9, 18, 30]}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            />
          </div>
        </div>
      )}

      {/* Add / Edit Reseller Modal (Global Unified) */}
      <Modal
        open={modal}
        onClose={() => {
          setModal(false);
          setEditing(null);
        }}
        title={editing ? `Edit ${editing.username}` : 'Add Reseller'}
        subtitle={
          editing
            ? 'Update reseller commission rates, referral codes, and credentials'
            : 'Register a new reseller partner on the platform'
        }
        icon={<FiPercent className="size-5" />}
        iconVariant="primary"
        size="md"
        onSubmit={submit}
        submitLabel={editing ? 'Save changes' : 'Create Reseller'}
        isSubmitting={busy}
        cancelLabel="Cancel"
      >
        <div className="space-y-3.5">
          {!editing && (
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Username <span className="text-rose-500">*</span>
              </label>
              <input
                value={form.username}
                onChange={set('username')}
                placeholder="Username (login)"
                className={inputCls}
                required
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Email
            </label>
            <input
              value={form.email}
              onChange={set('email')}
              type="email"
              placeholder="Email (optional)"
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {editing ? 'New Password' : 'Password'} {!editing && <span className="text-rose-500">*</span>}
            </label>
            <input
              value={form.password}
              onChange={set('password')}
              type="password"
              placeholder={editing ? 'New password (blank = keep)' : 'Password'}
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Referral Code
            </label>
            <input
              value={form.referral_code}
              onChange={set('referral_code')}
              placeholder="Referral code (auto if blank)"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Commission %
              </label>
              <input
                value={form.commission_rate}
                onChange={set('commission_rate')}
                type="number"
                step="0.1"
                min="0"
                max="100"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Max discount $
              </label>
              <input
                value={form.discount_max}
                onChange={set('discount_max')}
                type="number"
                step="0.1"
                min="0"
                className={inputCls}
              />
            </div>
          </div>

          {editing && (
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Account Status
              </label>
              <select value={form.status} onChange={set('status')} className={inputCls}>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        title={t('resellers.deleteResellerTitle', 'លុប Reseller')}
        message={t('resellers.deleteResellerConfirm', { username: deleteTarget?.username })}
        itemName={deleteTarget ? `${deleteTarget.username} (${deleteTarget.email || deleteTarget.referral_code})` : undefined}
        confirmText={t('buttons.delete', 'លុប')}
        cancelText={t('buttons.cancel', 'បោះបង់')}
        variant="destructive"
        isLoading={isDeleting}
        onClose={() => { if (!isDeleting) setDeleteTarget(null); }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
