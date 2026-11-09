import React, { useEffect, useMemo, useState } from 'react';
import {
  FileSpreadsheet,
  Eye,
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Globe,
  Laptop,
  Smartphone,
  Activity,
  ArrowRight,
  Clock,
  User as UserIcon,
} from 'lucide-react';
import { getActivity } from '../../api';
import { Table } from '../../components/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import { UnifiedFilterToolbar } from '../../components/shared';
import { useLanguage } from '../../i18n';
import type { ActivityLog } from '../../types';

function parseUserAgent(ua?: string): { os: string; browser: string; isMobile: boolean } {
  if (!ua) return { os: 'Unknown', browser: 'Unknown', isMobile: false };

  let os = 'Unknown OS';
  if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Unknown Browser';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome|CriOS/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';

  const isMobile = /Mobi|Android|iPhone/i.test(ua);

  return { os, browser, isMobile };
}

function getActionBadgeStyle(action: string): string {
  const a = (action || '').toLowerCase();
  if (a.includes('failed') || a.includes('lock') || a.includes('blocked') || a.includes('suspend')) {
    return 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800/60';
  }
  if (a.includes('delete') || a.includes('destroy')) {
    return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60';
  }
  if (a.includes('create') || a.includes('signup')) {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60';
  }
  if (a.includes('update') || a.includes('edit')) {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60';
  }
  if (a.includes('expiry') || a.includes('plan')) {
    return 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60';
  }
  return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60';
}

export default function ActivityLogs() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    username: true,
    action: true,
    description: true,
    ip_address: true,
    status: true,
    created_at: true,
    actions: true,
  });

  const load = () => {
    setLoading(true);
    getActivity({})
      .then(setLogs)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const exportCsv = () => {
    const header = ['ID', 'Username', 'Action', 'Description', 'IP Address', 'Device', 'Status', 'Created At'];
    const rows = filteredLogs.map((l) => {
      const dev = parseUserAgent(l.user_agent);
      const devLabel = l.user_agent ? `${dev.browser} (${dev.os})` : '—';
      return [
        l.id,
        l.username || 'system',
        l.action,
        `"${(l.description || '').replace(/"/g, '""')}"`,
        l.ip_address || '—',
        `"${devLabel}"`,
        l.status || 'success',
        l.created_at || '',
      ];
    });
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.action).filter(Boolean)));
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (actionFilter !== 'all' && l.action !== actionFilter) return false;
      if (statusFilter !== 'all') {
        const logStatus = (l.status || 'success').toLowerCase();
        if (statusFilter === 'success' && logStatus !== 'success') return false;
        if (statusFilter === 'failed' && logStatus === 'success') return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchDesc = (l.description || '').toLowerCase().includes(q);
        const matchUser = (l.username || '').toLowerCase().includes(q);
        const matchAction = (l.action || '').toLowerCase().includes(q);
        const matchIp = (l.ip_address || '').toLowerCase().includes(q);
        if (!matchDesc && !matchUser && !matchAction && !matchIp) return false;
      }
      return true;
    });
  }, [logs, search, actionFilter, statusFilter]);

  const columns = [
    {
      key: 'username',
      title: t('logs.user', 'User'),
      render: (log: ActivityLog) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs uppercase shrink-0">
            {(log.username || 'S').slice(0, 2)}
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm block">
              {log.username || 'system'}
            </span>
            {log.shop_id && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Shop #{log.shop_id}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      title: t('logs.action', 'Action'),
      render: (log: ActivityLog) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide capitalize shadow-2xs ${getActionBadgeStyle(
            log.action
          )}`}
        >
          {(log.action || '').replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'description',
      title: t('logs.description', 'Description'),
      render: (log: ActivityLog) => (
        <span className="text-slate-700 dark:text-slate-300 max-w-sm xl:max-w-md block truncate text-xs sm:text-sm">
          {log.description || '—'}
        </span>
      ),
    },
    {
      key: 'ip_address',
      title: t('logs.ipAddress', 'IP & Device'),
      render: (log: ActivityLog) => {
        const { os, browser, isMobile } = parseUserAgent(log.user_agent);
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-700 dark:text-slate-300">
              <Globe size={13} className="text-slate-400 shrink-0" />
              <span>{log.ip_address || '—'}</span>
            </div>
            {log.user_agent && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                {isMobile ? <Smartphone size={11} /> : <Laptop size={11} />}
                <span>
                  {browser} • {os}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      title: t('logs.status', 'Status'),
      render: (log: ActivityLog) => {
        const isSuccess = (log.status || 'success').toLowerCase() === 'success';
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
              isSuccess
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}
          >
            {isSuccess ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            {isSuccess ? t('logs.success', 'Success') : t('logs.failed', 'Failed')}
          </span>
        );
      },
    },
    {
      key: 'created_at',
      title: t('logs.timestamp', 'Time'),
      align: 'right' as const,
      render: (log: ActivityLog) => (
        <span className="text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
          {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '',
      align: 'right' as const,
      render: (log: ActivityLog) => (
        <button
          type="button"
          onClick={() => setSelectedLog(log)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={t('logs.viewDetails', 'View Details')}
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  const displayedColumns = useMemo(() => {
    return columns.filter((c) => visibleColumns[c.key] !== false);
  }, [columns, visibleColumns]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

  const resetFilters = () => {
    setSearch('');
    setActionFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  const selectedDev = selectedLog ? parseUserAgent(selectedLog.user_agent) : null;
  const beforeDiff = selectedLog?.properties?.before;
  const afterDiff = selectedLog?.properties?.after;
  const hasDiff = beforeDiff && afterDiff;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="text-blue-600 dark:text-blue-400" size={24} />
            {t('logs.title', 'Activity Logs')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('logs.subtitle', 'Audit trail of platform security, tenant actions, and administrative operations')}
          </p>
        </div>
      </div>

      {/* Unified Filter Toolbar */}
      <UnifiedFilterToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder={t('logs.searchPlaceholder', 'ស្វែងរកតាមការពិពណ៌នា, User, IP ឬ Action...')}
        filters={[
          ...(uniqueActions.length > 0
            ? [
                {
                  id: 'action',
                  value: actionFilter,
                  onChange: (val: string) => {
                    setActionFilter(val || 'all');
                    setPage(1);
                  },
                  options: [
                    { value: 'all', label: t('logs.allActions', 'Actions ទាំងអស់') },
                    ...uniqueActions.map((act) => ({
                      value: act,
                      label: act.replace(/_/g, ' '),
                    })),
                  ],
                },
              ]
            : []),
          {
            id: 'status',
            value: statusFilter,
            onChange: (val: string) => {
              setStatusFilter(val || 'all');
              setPage(1);
            },
            options: [
              { value: 'all', label: t('logs.allStatuses', 'Status ទាំងអស់') },
              { value: 'success', label: `✓ ${t('logs.success', 'Success')}` },
              { value: 'failed', label: `✕ ${t('logs.failed', 'Failed')}` },
            ],
          },
        ]}
        onApply={() => setPage(1)}
        onReset={resetFilters}
        columns={[
          { key: 'username', label: t('logs.user', 'User'), disabled: true },
          { key: 'action', label: t('logs.action', 'Action') },
          { key: 'description', label: t('logs.description', 'Description') },
          { key: 'ip_address', label: t('logs.ipAddress', 'IP & Device') },
          { key: 'status', label: t('logs.status', 'Status') },
          { key: 'created_at', label: t('logs.timestamp', 'Time') },
          { key: 'actions', label: t('logs.viewDetails', 'Action') },
        ]}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
        extraActions={
          <button
            type="button"
            onClick={exportCsv}
            className="h-10 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-card hover:bg-muted text-foreground text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            title={t('logs.exportCsv', 'Export CSV')}
          >
            <FileSpreadsheet size={15} />
            <span>{t('logs.exportCsv', 'Export CSV')}</span>
          </button>
        }
      />

      {/* Main Table */}
      <Table
        columns={displayedColumns}
        data={paginatedLogs}
        loading={loading}
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          totalItems: filteredLogs.length,
          pageSize: pageSize,
          onPageChange: (p) => setPage(p),
          onPageSizeChange: (s) => {
            setPageSize(s);
            setPage(1);
          },
        }}
      />

      {/* Security Audit Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${getActionBadgeStyle(
                    selectedLog?.action || ''
                  )}`}
                >
                  {(selectedLog?.action || '').replace(/_/g, ' ')}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                    (selectedLog?.status || 'success').toLowerCase() === 'success'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                  }`}
                >
                  {(selectedLog?.status || 'success').toLowerCase() === 'success' ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <XCircle size={12} />
                  )}
                  {selectedLog?.status || 'success'}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock size={12} />
                {selectedLog?.created_at ? new Date(selectedLog.created_at).toLocaleString() : '—'}
              </span>
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white mt-2">
              {t('logs.details', 'Activity Audit Details')} #{selectedLog?.id}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              {selectedLog?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-5 pt-2">
              {/* Metadata Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    {t('logs.user', 'User')}
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                    <UserIcon size={14} className="text-slate-400" />
                    <span>{selectedLog.username || 'system'}</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    {t('logs.ipAddress', 'IP Address')}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                    <Globe size={14} className="text-slate-400" />
                    <span>{selectedLog.ip_address || '—'}</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    {t('logs.device', 'Device / OS')}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium truncate">
                    {selectedDev?.isMobile ? <Smartphone size={14} /> : <Laptop size={14} />}
                    <span className="truncate">
                      {selectedDev?.browser} ({selectedDev?.os})
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    {t('logs.methodRoute', 'Method & Route')}
                  </span>
                  <div className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate">
                    {selectedLog.method ? (
                      <span className="font-bold text-blue-600 dark:text-blue-400 mr-1">
                        {selectedLog.method}
                      </span>
                    ) : null}
                    <span className="text-slate-600 dark:text-slate-400">
                      {selectedLog.url ? new URL(selectedLog.url, 'http://localhost').pathname : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Diff (Before vs After) */}
              {hasDiff && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {t('logs.dataChanges', 'Data Changes (Diff)')}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {Object.keys(afterDiff).length} field(s) modified
                    </span>
                  </div>
                  <div className="p-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {Object.keys(afterDiff).map((key) => {
                      const beforeVal = beforeDiff[key] !== undefined ? String(beforeDiff[key]) : '—';
                      const afterVal = String(afterDiff[key]);
                      return (
                        <div key={key} className="py-2 flex items-center justify-between gap-3">
                          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 w-1/3 truncate">
                            {key}
                          </span>
                          <div className="flex items-center gap-2 w-2/3">
                            <span className="text-rose-600 dark:text-rose-400 line-through bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded font-mono truncate max-w-[45%]">
                              {beforeVal}
                            </span>
                            <ArrowRight size={12} className="text-slate-400 shrink-0" />
                            <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-mono font-semibold truncate max-w-[45%]">
                              {afterVal}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Raw User-Agent tooltip/info */}
              {selectedLog.user_agent && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 break-all">
                  <span className="font-bold text-slate-600 dark:text-slate-300">User-Agent: </span>
                  {selectedLog.user_agent}
                </div>
              )}

              {/* Raw JSON Properties */}
              {selectedLog.properties && Object.keys(selectedLog.properties).length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {t('logs.rawProperties', 'Raw Event Metadata')}
                  </span>
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl text-xs font-mono overflow-x-auto max-h-48">
                    {JSON.stringify(selectedLog.properties, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
