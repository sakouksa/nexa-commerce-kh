import React, { useEffect, useRef, useState } from 'react';
import { toast } from '../../utils';
import { FiDownload, FiUpload, FiFileText, FiImage } from 'react-icons/fi';
import { backupHistory, createSystemBackup, exportSystemBackup, getBackupDownload, importSystemBackup, fullUrl } from '../../api';
import { Table, GlobalCard, btnPrimary, btnGhost } from '../../components/ui';
import { useLanguage } from '../../i18n';

export default function Backup() {
  const { t } = useLanguage();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ active: false, percent: 0, label: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => backupHistory().then(setHistory).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const createBackup = async () => {
    setCreating(true);
    try {
      const result = await createSystemBackup('zip');
      toast.success(`Backup created: ${result.filename}`);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Backup failed');
    } finally {
      setCreating(false);
    }
  };

  const exportExcel = async () => {
    setExporting(true);
    setProgress({ active: true, percent: 0, label: 'Downloading Excel...' });
    try {
      const blob = await exportSystemBackup('xlsx', (e: any) => {
        if (e.total) setProgress((p) => ({ ...p, percent: Math.min(99, Math.round((e.loaded / e.total) * 100)) }));
      });
      downloadBlob(blob, `system_backup_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_')}.xlsx`);
      toast.success('Excel backup exported');
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Export failed');
    } finally {
      setExporting(false);
      setProgress({ active: false, percent: 0, label: '' });
    }
  };

  const downloadZip = async () => {
    setExporting(true);
    setProgress({ active: true, percent: 0, label: 'Preparing ZIP (data + images)...' });
    try {
      const blob = await exportSystemBackup('zip', (e: any) => {
        if (e.total) setProgress((p) => ({ ...p, percent: Math.min(99, Math.round((e.loaded / e.total) * 100)) }));
      });
      downloadBlob(blob, `system_backup_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_')}.zip`);
      toast.success('ZIP backup (with images) downloaded');
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Export failed');
    } finally {
      setExporting(false);
      setProgress({ active: false, percent: 0, label: '' });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    setProgress({ active: true, percent: 0, label: 'Uploading backup file...' });
    try {
      const res = await importSystemBackup(file, (ev: any) => {
        if (ev.total) setProgress((p) => ({ ...p, percent: Math.min(100, Math.round((ev.loaded / ev.total) * 100)) }));
      });
      setProgress({ active: true, percent: 100, label: 'Restoring data & images...' });
      const dup = res.duplicates_skipped > 0 ? ` · ${res.duplicates_skipped} duplicates skipped` : '';
      const img = res.images_restored > 0 ? ` · ${res.images_restored} images restored` : '';
      toast.success(`Backup imported! ${res.records_restored} records restored.${dup}${img}`);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Import failed');
    } finally {
      setProcessing(false);
      setProgress({ active: false, percent: 0, label: '' });
    }
    e.target.value = '';
  };

  const download = async (item: any) => {
    try {
      const res = await getBackupDownload(item.filename);
      window.open(fullUrl(res.url), '_blank');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Download failed');
    }
  };

  const columns = [
    {
      key: 'filename',
      title: 'Filename',
      render: (item: any) => (
        <span className="font-mono text-xs text-slate-800 dark:text-slate-200">{item.filename}</span>
      ),
    },
    {
      key: 'kind',
      title: 'Kind',
      render: (item: any) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.kind === 'system' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'}`}>
          {item.kind}
        </span>
      ),
    },
    {
      key: 'created_at',
      title: 'Created At',
      render: (item: any) => (
        <span className="text-slate-500 dark:text-slate-400 text-xs">
          {new Date(item.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right' as const,
      render: (item: any) => (
        <button onClick={() => download(item)} className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-semibold">
          Download
        </button>
      ),
    },
  ];

  const totalPages = Math.ceil(history.length / pageSize) || 1;
  const paginatedHistory = history.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('backup.title')}</h1>

      <GlobalCard
        cardType="container"
        title={<span className="font-bold text-lg text-slate-900 dark:text-white">{t('backup.title')}</span>}
        subtitle={
          <span>
            <b className="text-indigo-600 dark:text-indigo-400">ZIP backups include the real image files</b> — product photos,
            logos, banners, category images, slideshow, QR codes and receipts are bundled inside the
            <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded"> images/ </span>
            folder of the .zip. Import that same .zip on any other workspace and every image is restored
            automatically. (Admin only)
          </span>
        }
      >
        <div className="flex flex-wrap gap-3">
          <button onClick={downloadZip} disabled={exporting} className={btnPrimary}>
            <FiImage className="inline mr-1" /> {exporting ? t('backup.exporting') : t('backup.downloadZip')}
          </button>
          <button onClick={exportExcel} disabled={exporting} className={btnGhost}>
            <FiFileText className="inline mr-1" /> {t('backup.exportExcel')}
          </button>
          <button onClick={createBackup} disabled={creating} className={btnGhost}>
            <FiDownload className="inline mr-1" /> {creating ? t('backup.creating') : t('backup.createSnapshot')}
          </button>
          <button onClick={() => fileRef.current?.click()} className={btnGhost}>
            <FiUpload className="inline mr-1" /> {t('backup.restoreBackup')} (JSON / ZIP / XLSX)
          </button>
          <input ref={fileRef} type="file" accept=".json,.zip,.xlsx" className="hidden" onChange={handleImport} />
        </div>
        {progress.active && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-1">
              <span className="flex items-center gap-2">
                {(processing || exporting) && (
                  <span className="inline-block w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                )}
                {progress.label}
              </span>
              <span className="font-mono">{progress.percent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(4, progress.percent)}%` }}
              />
            </div>
            {processing && (
              <p className="text-xs text-gray-400 mt-2">
                Restoring the database and copying every image into the uploads folder — please wait…
              </p>
            )}
          </div>
        )}
      </GlobalCard>

      <div className="space-y-3">
        <h2 className="font-bold text-lg text-slate-900 dark:text-white">{t('backup.backupHistory')}</h2>
        <Table
          columns={columns}
          data={paginatedHistory}
          loading={loading}
          pagination={{
            currentPage: page,
            totalPages: totalPages,
            totalItems: history.length,
            pageSize: pageSize,
            onPageChange: (p) => setPage(p),
            onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
          }}
        />
      </div>
    </div>
  );
}
