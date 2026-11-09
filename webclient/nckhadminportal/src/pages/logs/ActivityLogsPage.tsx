import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { getActivity } from '../../api';
import { Table, inputCls } from '../../components/ui';
import { UnifiedFilterToolbar, type ColumnOption } from '../../components/shared';
import { useLanguage } from '../../i18n';

export default function ActivityLogs() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    username: true,
    action: true,
    description: true,
    created_at: true,
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
    const header = ['ID', 'Username', 'Action', 'Description', 'Created At'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.username,
      l.action,
      `"${(l.description || '').replace(/"/g, '""')}"`,
      l.created_at,
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activity_logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.action).filter(Boolean)));
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (actionFilter !== 'all' && l.action !== actionFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchDesc = (l.description || '').toLowerCase().includes(q);
        const matchUser = (l.username || '').toLowerCase().includes(q);
        const matchAction = (l.action || '').toLowerCase().includes(q);
        if (!matchDesc && !matchUser && !matchAction) return false;
      }
      return true;
    });
  }, [logs, search, actionFilter]);

  const columns = [
    {
      key: 'username',
      title: 'User',
      render: (log: any) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {log.username || 'system'}
        </span>
      ),
    },
    {
      key: 'action',
      title: 'Action',
      render: (log: any) => (
        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
          {(log.action || '').replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      render: (log: any) => (
        <span className="text-slate-600 dark:text-slate-400 max-w-md block truncate">
          {log.description || '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      title: 'Time',
      align: 'right' as const,
      render: (log: any) => (
        <span className="text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
          {new Date(log.created_at).toLocaleString()}
        </span>
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
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('logs.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('logs.subtitle')}</p>
        </div>
      </div>

      {/* Unified SmartHR-Style Filter Toolbar */}
      <UnifiedFilterToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder={t('logs.searchPlaceholder', 'ស្វែងរកតាមការពិពណ៌នា, User ឬ Action...')}
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
        ]}
        onApply={() => setPage(1)}
        onReset={resetFilters}
        columns={[
          { key: 'username', label: 'User', disabled: true },
          { key: 'action', label: 'Action' },
          { key: 'description', label: 'Description' },
          { key: 'created_at', label: 'Time' },
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
    </div>
  );
}
