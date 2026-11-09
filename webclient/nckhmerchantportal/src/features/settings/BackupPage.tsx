import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from '../../utils/toast';
import { useTranslation } from 'react-i18next';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  Upload,
  Database,
  Archive,
  FileSpreadsheet,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Calendar,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  FolderArchive,
  FileText,
  Filter,
} from 'lucide-react';
import { backupService } from '../../services/backupService';
import { fullUrl } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '../../components/ui';
import { Breadcrumbs } from '../../components/common';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface BackupItem {
  id?: number | string;
  filename: string;
  created_at: string;
  size?: number | string;
  [key: string]: any;
}

export default function BackupPage() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [history, setHistory] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [downloadingName, setDownloadingName] = useState<string | null>(null);

  // Search, Filter & Pagination
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'zip' | 'xlsx'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting
  const [sortAsc, setSortAsc] = useState(false);
  const [sortField, setSortField] = useState<'index' | 'filename' | 'date'>('date');

  const fileRef = useRef<HTMLInputElement | null>(null);

  const load = async (isManual = false) => {
    if (!user?.shop_id) return;
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await backupService.backupHistory(user.shop_id);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          t('backup.toast.syncFailed', { defaultValue: 'Failed to load backup history' })
      );
    } finally {
      if (isManual) {
        setTimeout(() => {
          setRefreshing(false);
        }, 400);
      } else {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    load();
  }, [user?.shop_id]);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize, typeFilter]);

  const createZipBackup = async () => {
    if (!user?.shop_id) return;
    setCreating(true);
    try {
      const result = await backupService.createShopBackup(user.shop_id, 'zip');
      toast.success(
        t('backup.toast.zipSuccess', {
          filename: result.filename,
          defaultValue: `Full ZIP backup created: ${result.filename}`,
        })
      );
      load();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          t('backup.toast.backupFailed', 'Backup failed')
      );
    } finally {
      setCreating(false);
    }
  };

  const exportExcel = async () => {
    if (!user?.shop_id) return;
    setExporting(true);
    try {
      const blob = await backupService.exportShopBackup(user.shop_id, 'xlsx');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shop_backup_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_')}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(
        t('backup.toast.excelSuccess', 'Shop data exported to Excel successfully.')
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          t('backup.toast.exportFailed', 'Export failed')
      );
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.shop_id) return;
    setImporting(true);
    try {
      const res = await backupService.importShopBackup(user.shop_id, file);
      const dup =
        res.duplicates_skipped > 0
          ? ` · ${res.duplicates_skipped} duplicates skipped`
          : '';
      toast.success(
        t('backup.toast.importSuccess', {
          count: res.records_restored || 0,
          dup,
          defaultValue: `Backup imported! ${res.records_restored} records restored.${dup}`,
        })
      );
      load();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          t('backup.toast.importFailed', 'Import failed')
      );
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const download = async (item: BackupItem) => {
    setDownloadingName(item.filename);
    try {
      const res = await backupService.getBackupDownload(item.filename);
      window.open(fullUrl(res.url), '_blank');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          t('backup.toast.downloadFailed', 'Download failed')
      );
    } finally {
      setDownloadingName(null);
    }
  };

  // Filter & Sort
  const filteredHistory = useMemo(() => {
    let list = history.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || item.filename.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      if (typeFilter === 'zip') return item.filename.toLowerCase().endsWith('.zip');
      if (typeFilter === 'xlsx') return item.filename.toLowerCase().endsWith('.xlsx');
      return true;
    });

    list.sort((a, b) => {
      if (sortField === 'filename') {
        return sortAsc
          ? a.filename.localeCompare(b.filename)
          : b.filename.localeCompare(a.filename);
      }
      if (sortField === 'date') {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return sortAsc ? dateA - dateB : dateB - dateA;
      }
      return sortAsc ? 1 : -1;
    });

    return list;
  }, [history, search, typeFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredHistory.length / pageSize) || 1;
  const paginatedHistory = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, page, pageSize]);

  const isKhmer = i18n.language === 'kh';

  if (loading && history.length === 0) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 px-2 sm:px-4">
      {/* Top Breadcrumb & Page Header */}
      <div className="space-y-2">
        <Breadcrumbs />
        <div className="space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('backup.badge', 'Data Safety & Disaster Recovery')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('backup.title', 'Backup & Restore System')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            {t(
              'backup.subtitle',
              'Create full snapshots of your products, orders, categories, customers, and shop settings.'
            )}
          </p>
        </div>
      </div>

      {/* 3 Core Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Full ZIP Backup */}
        <Card className="relative flex flex-col justify-between border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-panel rounded-2xl hover:border-primary/40 transition-all">
          <CardHeader className="p-5 sm:p-6 pb-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                <Archive className="w-5 h-5" />
              </div>
              <Badge
                variant="outline"
                className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 text-[11px] font-bold"
              >
                {t('backup.cards.zipBadge', 'Recommended')}
              </Badge>
            </div>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t('backup.cards.zipTitle', 'Full System Backup')}
            </CardTitle>
            <div className="text-[11px] font-mono font-semibold text-primary">
              {t('backup.cards.zipFormat', '.ZIP Archive')}
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
              {t(
                'backup.cards.zipDesc',
                'Complete shop snapshot including all products, high-res images, categories, orders, and customer records in a portable ZIP file.'
              )}
            </CardDescription>
          </CardHeader>

          <CardFooter className="p-5 sm:p-6 pt-0">
            <Button
              onClick={createZipBackup}
              disabled={creating}
              className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-xs transition-all"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('backup.cards.zipCreating', 'Creating Backup...')}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-1.5" />
                  {t('backup.cards.zipBtn', 'Create ZIP Backup')}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Card 2: Excel Export */}
        <Card className="relative flex flex-col justify-between border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-panel rounded-2xl hover:border-emerald-500/40 transition-all">
          <CardHeader className="p-5 sm:p-6 pb-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 text-[11px] font-bold"
              >
                {t('backup.cards.excelFormat', '.XLSX Spreadsheet')}
              </Badge>
            </div>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t('backup.cards.excelTitle', 'Excel Spreadsheet Export')}
            </CardTitle>
            <div className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              Microsoft Excel
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
              {t(
                'backup.cards.excelDesc',
                'Export clean spreadsheet tables of your store catalog and customer orders for accounting, inventory auditing, or manual review.'
              )}
            </CardDescription>
          </CardHeader>

          <CardFooter className="p-5 sm:p-6 pt-0">
            <Button
              onClick={exportExcel}
              disabled={exporting}
              variant="outline"
              className="w-full h-10 rounded-xl font-bold border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('backup.cards.excelExporting', 'Exporting...')}
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                  {t('backup.cards.excelBtn', 'Export to Excel')}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Card 3: Restore / Import */}
        <Card className="relative flex flex-col justify-between border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-panel rounded-2xl hover:border-sky-500/40 transition-all">
          <CardHeader className="p-5 sm:p-6 pb-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <Badge
                variant="outline"
                className="bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 text-[11px] font-bold"
              >
                .ZIP / .XLSX
              </Badge>
            </div>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t('backup.cards.importTitle', 'Restore & Import Data')}
            </CardTitle>
            <div className="text-[11px] font-mono font-semibold text-sky-600 dark:text-sky-400">
              {t('backup.cards.importFormat', 'Supports .ZIP, .XLSX, .JSON')}
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
              {t(
                'backup.cards.importDesc',
                'Restore your store data from a previously created ZIP or Excel backup file. Existing records are safely preserved.'
              )}
            </CardDescription>
          </CardHeader>

          <CardFooter className="p-5 sm:p-6 pt-0">
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              variant="outline"
              className="w-full h-10 rounded-xl font-bold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-all"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
                  {t('backup.cards.importing', 'Restoring Data...')}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-1.5 text-slate-500" />
                  {t('backup.cards.importBtn', 'Select File to Restore')}
                </>
              )}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".zip,.xlsx,.json"
              className="hidden"
              onChange={handleImport}
            />
          </CardFooter>
        </Card>
      </div>

      {/* Backup Snapshots History Table Card */}
      <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-panel rounded-2xl overflow-hidden">
        {/* Card Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              <span>{t('backup.history.title', 'Backup History')}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('backup.history.subtitle', 'Download previously created store snapshots anytime.')}
            </p>
          </div>

          <Badge
            variant="outline"
            className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 shrink-0"
          >
            {t('backup.history.countBadge', {
              count: filteredHistory.length,
              defaultValue: `${filteredHistory.length} files`,
            })}
          </Badge>
        </div>

        {/* Dedicated Filter & Search Toolbar */}
        <div className="px-5 sm:px-6 py-3 border-t border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('backup.history.searchPlaceholder', 'Search backup filename...')}
              className="h-9 pl-8 pr-3 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
            />
          </div>

          {/* Right: Filter Tabs + Refresh Button */}
          <div className="flex items-center gap-2">
            {/* Filter Pills */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={cn(
                  'px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer',
                  typeFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                )}
              >
                {t('backup.history.filterAll', 'All')}
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('zip')}
                className={cn(
                  'px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer',
                  typeFilter === 'zip'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                )}
              >
                {t('backup.history.filterZip', 'ZIP')}
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('xlsx')}
                className={cn(
                  'px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer',
                  typeFilter === 'xlsx'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                )}
              >
                {t('backup.history.filterExcel', 'Excel')}
              </button>
            </div>

            {/* Refresh Sync Button */}
            <Button
              variant="outline"
              size="sm"
              disabled={refreshing}
              onClick={() => load(true)}
              className="h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 shadow-2xs shrink-0"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin text-primary')} />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/60 dark:bg-slate-800/40">
              <TableRow className="border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                <TableHead
                  onClick={() => {
                    if (sortField === 'index') setSortAsc(!sortAsc);
                    else {
                      setSortField('index');
                      setSortAsc(true);
                    }
                  }}
                  className="w-14 cursor-pointer select-none py-3.5 px-4 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{t('backup.history.colIndex', '#')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </TableHead>

                <TableHead
                  onClick={() => {
                    if (sortField === 'filename') setSortAsc(!sortAsc);
                    else {
                      setSortField('filename');
                      setSortAsc(true);
                    }
                  }}
                  className="cursor-pointer select-none py-3.5 px-4 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{t('backup.history.colFilename', 'Filename')}</span>
                    {sortField === 'filename' && <ArrowUpDown className="w-3 h-3 text-primary" />}
                  </div>
                </TableHead>

                <TableHead
                  onClick={() => {
                    if (sortField === 'date') setSortAsc(!sortAsc);
                    else {
                      setSortField('date');
                      setSortAsc(true);
                    }
                  }}
                  className="w-56 cursor-pointer select-none py-3.5 px-4 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{t('backup.history.colCreatedAt', 'Created Date')}</span>
                    {sortField === 'date' && <ArrowUpDown className="w-3 h-3 text-primary" />}
                  </div>
                </TableHead>

                <TableHead className="w-28 text-right py-3.5 px-4">
                  {t('backup.history.colActions', 'Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
              {refreshing ? (
                Array.from({ length: Math.min(pageSize, 5) }).map((_, idx) => (
                  <TableRow key={idx} className="animate-pulse">
                    <TableCell className="py-4 px-4">
                      <div className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-800" />
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
                        <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-800" />
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-800" />
                    </TableCell>
                    <TableCell className="py-4 px-4 text-right">
                      <div className="h-8 w-20 rounded-lg bg-slate-200 dark:bg-slate-800 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                paginatedHistory.map((item, idx) => {
                const rowNum = (page - 1) * pageSize + idx + 1;
                const isDownloading = downloadingName === item.filename;
                const isZip = item.filename.toLowerCase().endsWith('.zip');
                const isExcel = item.filename.toLowerCase().endsWith('.xlsx');

                return (
                  <TableRow
                    key={item.id || item.filename || idx}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Index */}
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      {rowNum}
                    </TableCell>

                    {/* Filename & Type Badge */}
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                            isZip
                              ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                              : isExcel
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          )}
                        >
                          {isZip ? (
                            <Archive className="w-4 h-4" />
                          ) : isExcel ? (
                            <FileSpreadsheet className="w-4 h-4" />
                          ) : (
                            <Database className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {item.filename}
                          </span>
                          {isZip ? (
                            <Badge
                              variant="outline"
                              className="px-1.5 py-0 text-[10px] font-extrabold bg-orange-50/80 text-orange-600 border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800 shrink-0"
                            >
                              ZIP
                            </Badge>
                          ) : isExcel ? (
                            <Badge
                              variant="outline"
                              className="px-1.5 py-0 text-[10px] font-extrabold bg-emerald-50/80 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 shrink-0"
                            >
                              XLSX
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>

                    {/* Created Date */}
                    <TableCell className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString(
                            isKhmer ? 'km-KH' : 'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : '—'}
                    </TableCell>

                    {/* Download Action */}
                    <TableCell className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isDownloading}
                        onClick={() => download(item)}
                        className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                            <span>{t('backup.history.downloading', 'Downloading...')}</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5 text-slate-500" />
                            <span>{t('backup.history.downloadBtn', 'Download')}</span>
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }))}

              {paginatedHistory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400">
                        <FolderArchive className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {search
                          ? t(
                              'backup.history.emptySearch',
                              'No backup files match your search query.'
                            )
                          : t(
                              'backup.history.emptyHistory',
                              'No backup snapshots created yet.'
                            )}
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {t(
                          'backup.history.emptyHistorySub',
                          'Click "Create ZIP Backup" above to generate your first backup point.'
                        )}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              {t('backup.history.showingRange', {
                from: filteredHistory.length > 0 ? (page - 1) * pageSize + 1 : 0,
                to: Math.min(page * pageSize, filteredHistory.length),
                total: filteredHistory.length,
                defaultValue: `Showing ${
                  filteredHistory.length > 0 ? (page - 1) * pageSize + 1 : 0
                } to ${Math.min(page * pageSize, filteredHistory.length)} of ${
                  filteredHistory.length
                } entries`,
              })}
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-slate-400">Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="h-7 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {totalPages <= 7
              ? Array.from({ length: totalPages }).map((_, idx) => (
                  <Button
                    key={idx}
                    variant={page === idx + 1 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(idx + 1)}
                    className={cn(
                      'h-8 w-8 p-0 rounded-lg text-xs font-bold',
                      page === idx + 1
                        ? 'bg-primary text-white shadow-2xs hover:bg-primary/90'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                    )}
                  >
                    {idx + 1}
                  </Button>
                ))
              : Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => (
                  <Button
                    key={idx}
                    variant={page === idx + 1 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(idx + 1)}
                    className={cn(
                      'h-8 w-8 p-0 rounded-lg text-xs font-bold',
                      page === idx + 1
                        ? 'bg-primary text-white shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                    )}
                  >
                    {idx + 1}
                  </Button>
                ))}

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Pro Tip / Best Practice Strip */}
      <div className="rounded-2xl border border-sky-200/80 dark:border-sky-900/40 bg-sky-50/50 dark:bg-sky-950/20 p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
        <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            {t('backup.tips.title', 'Merchant Data Safety Best Practices')}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t(
              'backup.tips.desc',
              'We recommend exporting a full ZIP backup before making major inventory edits and at the end of every business month to keep your records safe.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
