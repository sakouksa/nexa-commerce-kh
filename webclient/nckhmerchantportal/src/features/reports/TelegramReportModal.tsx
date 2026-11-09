import React, { useState } from 'react';
import {
  Send,
  ExternalLink,
  Bot,
  Copy,
  Check,
} from 'lucide-react';
import { Modal, ModalFooter } from '../../components/ui';
import toast from '../../utils/toast';
import { telegramService } from '../../services/telegramService';
import { reportService } from '../../services/reportService';
import { useLanguage } from '../../i18n';

interface TelegramReportModalProps {
  language?: string;
  isOpen: boolean;
  onClose: () => void;
  shopId?: number | string;
  days?: number;
  reportHtml: string;
  reportPlainText: string;
  onShareLinkFallback: () => void;
}

export const TelegramReportModal: React.FC<TelegramReportModalProps> = ({
  language,
  isOpen,
  onClose,
  shopId,
  days = 1,
  reportHtml,
  reportPlainText,
  onShareLinkFallback,
}) => {
  const { t } = useLanguage();

  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSendViaBot = async () => {
    if (!shopId) return;
    setSending(true);

    try {
      const res = await reportService
        .dispatchTelegramReport(shopId, days, language)
        .catch((err) => {
          if (err?.response?.status === 404) {
            return telegramService.test({
              shop_id: shopId,
              message: reportPlainText,
            });
          }
          throw err;
        });

      if (res?.data?.success || res?.status === 200) {
        toast.success(
          t('reports.telegramSentSuccess', 'Summary report successfully delivered to your Telegram channel/group!')
        );
        onClose();
      } else {
        toast.error(
          res?.data?.message ||
            t('reports.telegramSentFailed', 'Failed to dispatch telegram notification. Please check your Bot connection.')
        );
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          t('reports.telegramError', 'Error connecting to Telegram. Falling back to direct app link.')
      );
    } finally {
      setSending(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(reportPlainText);
    setCopied(true);
    toast.success(t('reports.copiedToClipboard', 'Report text copied to clipboard!'));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      icon={<Bot className="size-5" />}
      iconVariant="sky"
      title={t('reports.telegramPreviewTitle', 'Telegram Dispatch Preview')}
      subtitle={t('reports.telegramPreviewDesc', 'Review formatted summary before broadcasting to your channel')}
      footer={
        <ModalFooter
          onCancel={onClose}
          cancelLabel={t('common.cancel', 'Cancel')}
          showSubmit={false}
          extraActions={
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={onShareLinkFallback}
                className="h-10 px-4 rounded-xl border border-border/80 dark:border-slate-700 bg-card dark:bg-slate-800 text-xs sm:text-[13px] font-bold text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <ExternalLink className="size-4" />
                <span>{t('reports.shareViaApp', 'Share via Telegram App')}</span>
              </button>

              <button
                type="button"
                disabled={sending}
                onClick={handleSendViaBot}
                className="h-10 px-5 rounded-xl text-xs sm:text-[13px] font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                <Send className="size-4" />
                <span>
                  {sending
                    ? t('reports.sending', 'Sending...')
                    : t('reports.sendToBot', 'Send to Telegram Bot')}
                </span>
              </button>
            </div>
          }
        />
      }
    >
      <div className="p-6 space-y-4">
        {/* HTML / Rich Preview Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t('reports.telegramCardPreview', 'Telegram Message Card')}
          </label>
          <div
            className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 text-xs text-slate-800 dark:text-slate-200 overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: reportHtml }}
          />
        </div>

        {/* Raw Plain Text Section (For manual copy) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('reports.rawFormat', 'Plaintext / Markdown Format')}
            </label>
            <button
              type="button"
              onClick={handleCopyText}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
              <span>{copied ? t('reports.copied', 'Copied') : t('reports.copyText', 'Copy Text')}</span>
            </button>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 max-h-48 overflow-y-auto leading-relaxed whitespace-pre-wrap select-all">
            {reportPlainText}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TelegramReportModal;
