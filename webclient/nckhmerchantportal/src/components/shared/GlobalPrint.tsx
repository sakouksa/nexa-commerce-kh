import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, FileText, ShieldCheck, MapPin, Phone, Mail, Store, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

/* ==========================================================================
   1. GLOBAL PRINT CONTAINER (MODAL PREVIEW & PRINT RUNTIME)
   ========================================================================== */

export interface GlobalPrintContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint?: () => void;
  modalTitle?: string;
  documentSubtitle?: string;
  children: React.ReactNode;
  width?: string;
  printButtonText?: string;
  closeButtonText?: string;
  extraActions?: React.ReactNode;
  icon?: React.ReactNode;
}

export const GlobalPrintContainer: React.FC<GlobalPrintContainerProps> = ({
  isOpen,
  onClose,
  onPrint,
  modalTitle,
  documentSubtitle,
  children,
  width = 'max-w-4xl',
  printButtonText,
  closeButtonText,
  extraActions,
  icon,
}) => {
  const { t } = useTranslation();

  const handlePrint = useCallback(() => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  }, [onPrint]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('has-print-modal');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('has-print-modal');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('has-print-modal');
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p' && isOpen) {
        e.preventDefault();
        handlePrint();
      }
    },
    [isOpen, onClose, handlePrint]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const printContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          id="global-print-active-canvas"
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:static print:block print:overflow-visible print:h-auto print:max-h-none"
        >
          {/* Print Dialog A4 Optimization */}
          <style>{`
            @media print {
              @page {
                size: A4 portrait !important;
                margin: 8mm 10mm !important;
              }
              body * {
                visibility: hidden;
              }
              #global-print-active-canvas, #global-print-active-canvas * {
                visibility: visible;
              }
              #global-print-active-canvas {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 0;
                background: white !important;
              }
            }
          `}</style>

          {/* Backdrop overlay */}
          <motion.div
            key="print-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity cursor-pointer print:hidden"
          />

          {/* Centered Modal Mode (Official Document Preview) */}
          <motion.div
            key="print-modal-panel"
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${width} bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] z-10 print:shadow-none print:w-full print:max-w-none print:rounded-none print:m-0 print:border-none print:h-auto print:max-h-none print:overflow-visible print:block print:static`}
          >
            {/* Top Toolbar Header (Hidden on print) */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-200 print:hidden select-none shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  {icon || <FileText className="h-4.5 w-4.5 text-orange-600" />}
                  <span className="font-bold text-sm text-slate-900">
                    {modalTitle || t('receipts.documentPreview', 'Official Document Preview')}
                  </span>
                </div>
                {documentSubtitle && (
                  <p className="text-[11px] text-slate-500 font-medium pl-6.5">
                    {documentSubtitle}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {extraActions}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer select-none"
                >
                  <Printer size={15} />
                  <span>{printButtonText || t('receipts.printOrPdf', 'Print / PDF')}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Document Canvas */}
            <div className="overflow-y-auto flex-1 p-6 sm:p-8 bg-white text-slate-900 print:p-0 print:m-0 print:overflow-visible print:h-auto print:max-h-none print:block [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
              {children}
            </div>

            {/* Bottom Footer Action Bar (Hidden on print) */}
            <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-200 print:hidden select-none shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer select-none"
              >
                {closeButtonText || t('common.close', 'Close')}
              </button>
              <div className="flex items-center gap-2">
                {extraActions}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer select-none"
                >
                  <Printer size={15} />
                  <span>{printButtonText || t('receipts.printOrPdf', 'Print / PDF')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return printContent;
  return createPortal(printContent, document.body);
};

/* ==========================================================================
   2. GLOBAL PRINT HEADER (ENTERPRISE LETTERHEAD & VOUCHER TITLE)
   ========================================================================== */

export interface GlobalPrintHeaderProps {
  title?: string;
  subtitleEnglish?: string;
  referenceNumber: string;
  referenceLabel?: string;
  date?: string | Date | null;
  dateLabel?: string;
  status?: string;
  branchName?: string;
  companyName?: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  extraMeta?: Array<{ label: string; value: string }>;
}

const formatDisplayDate = (d: string | Date | null | undefined, locale = 'km-KH'): string => {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return typeof d === 'string' ? d : '—';

  if (locale.startsWith('km')) {
    const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    return `ថ្ងៃទី ${date.getDate()} ខែ${khmerMonths[date.getMonth()]} ឆ្នាំ${date.getFullYear()}`;
  }

  return date.toLocaleDateString(locale, { dateStyle: 'medium' });
};

export const GlobalPrintHeader: React.FC<GlobalPrintHeaderProps> = ({
  title,
  subtitleEnglish,
  referenceNumber,
  referenceLabel,
  date,
  dateLabel,
  status,
  branchName,
  companyName,
  tagline,
  address,
  phone,
  email,
  logoUrl,
  extraMeta = [],
}) => {
  const { t, i18n } = useTranslation();
  const { shop } = useAuth();
  const currentLocale = i18n.language === 'kh' || i18n.language === 'km' ? 'km-KH' : i18n.language;

  const resolvedName = companyName || shop?.shop_name || 'NEXTECH CAMBODIA CO., LTD.';
  const resolvedTagline = tagline || shop?.bio || 'Next-Generation POS & Cloud Commerce';
  const resolvedBranch = branchName || 'សាខា A (Branch A)';
  const resolvedAddress = address || shop?.description || 'Phnom Penh, Cambodia';
  const resolvedPhone = phone || shop?.contact || '+855 (0) 23 999 888';
  const resolvedEmail = email || `${shop?.username || 'info'}@ministorekh.com`;
  const resolvedLogo = logoUrl || shop?.logo || '/logo.png';

  const refLabel = referenceLabel || t('receipts.receiptNo', 'Receipt / PO #');
  const dLabel = dateLabel || t('receipts.dateCol', 'Date');
  const docTitle = title || t('receipts.officialReceiptTitle', 'បង្កាន់ដៃទទួលប្រាក់ផ្លូវការ');
  const docSubtitle = subtitleEnglish || 'OFFICIAL RECEIPT VOUCHER';

  return (
    <div className="w-full select-none pb-3 mb-3 border-b border-slate-300 [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
      <div className="flex justify-between items-start gap-4">
        {/* Left Column: Brand Logo + Clean Store Identity */}
        <div className="flex items-start gap-3 max-w-[54%]">
          <div className="w-[48px] h-[48px] min-w-[48px] min-h-[48px] rounded-lg border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src={resolvedLogo}
              alt={resolvedName}
              className="w-full h-full object-contain block shrink-0"
              onError={(e) => {
                const target = e.target as HTMLElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.fallback-monogram')) {
                  const mono = document.createElement('div');
                  mono.className = 'fallback-monogram w-full h-full bg-slate-900 text-white rounded flex items-center justify-center font-black text-sm';
                  mono.innerText = resolvedName.charAt(0).toUpperCase() || 'M';
                  parent.appendChild(mono);
                }
              }}
            />
          </div>

          <div className="space-y-0.5 text-xs text-slate-800">
            <div>
              <h1 className="font-black text-sm sm:text-base tracking-tight text-slate-950 uppercase leading-none">
                {resolvedName}
              </h1>
              <p className="text-[9.5px] text-slate-500 font-medium tracking-normal mt-0.5">
                {resolvedTagline}
              </p>
            </div>

            {resolvedBranch && (
              <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700">
                <Store size={10} className="text-slate-500 shrink-0" />
                <span>{resolvedBranch}</span>
              </div>
            )}

            <div className="text-[9px] space-y-0.5 text-slate-500 leading-tight pt-0.5">
              <p className="flex items-center gap-1">
                <MapPin size={8.5} className="text-slate-400 shrink-0" />
                <span>{resolvedAddress}</span>
              </p>
              <div className="flex items-center gap-2 flex-wrap font-mono">
                <span className="flex items-center gap-1">
                  <Phone size={8.5} className="text-slate-400 shrink-0" />
                  <span>{resolvedPhone}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail size={8.5} className="text-slate-400 shrink-0" />
                  <span>{resolvedEmail}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Prominent Document Title & Clean Reference Details */}
        <div className="text-right space-y-1 min-w-[220px] max-w-[46%] shrink-0">
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-950 leading-tight">
              {docTitle}
            </h2>
            {docSubtitle && (
              <p className="text-[8.5px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
                {docSubtitle}
              </p>
            )}
          </div>

          <div className="space-y-0.5 pt-0.5 text-[10px]">
            <div className="flex justify-end items-baseline gap-1.5">
              <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider">
                {refLabel}:
              </span>
              <span className="font-mono font-bold text-xs text-slate-950">
                {referenceNumber}
              </span>
            </div>

            <div className="flex justify-end items-baseline gap-1.5 text-slate-600">
              <span className="text-[9px] uppercase font-medium text-slate-500 tracking-wider">{dLabel}:</span>
              <span className="font-medium text-slate-800 text-[9.5px]">{formatDisplayDate(date, currentLocale)}</span>
            </div>

            {status && (
              <div className="flex justify-end items-baseline gap-1.5 pt-0.5">
                <span className="text-[9px] uppercase font-medium text-slate-500 tracking-wider">{t('orders.status', 'Status')}:</span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8.5px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
                  {status}
                </span>
              </div>
            )}

            {extraMeta.map((meta, i) => (
              <div key={i} className="flex justify-end items-baseline gap-1.5 text-[9px]">
                <span className="text-slate-500">{meta.label}:</span>
                <span className="font-semibold text-slate-900">{meta.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   3. GLOBAL PRINT FOOTER (SIGNATURES, NOTICE & WATERMARK)
   ========================================================================== */

export interface PrintSignatureRole {
  titleKhmer?: string;
  titleEnglish?: string;
  titleLocalized?: string;
  name?: string;
  role?: string;
  date?: string;
}

export interface GlobalPrintFooterProps {
  signatures?: PrintSignatureRole[];
  noticeText?: string;
  showTimestamp?: boolean;
  customWatermark?: string;
  pageNumberText?: string;
}

const formatPrintDateTime = (d: Date = new Date()): string => {
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} ${hours}:${minutes}`;
};

export const GlobalPrintFooter: React.FC<GlobalPrintFooterProps> = ({
  signatures,
  noticeText,
  showTimestamp = true,
  customWatermark,
  pageNumberText,
}) => {
  const { t } = useTranslation();

  const defaultSigs: PrintSignatureRole[] = [
    {
      titleLocalized: t('receipts.payerSignature', 'អតិថិជន / អ្នកទូទាត់'),
      titleEnglish: 'Customer / Payer',
      name: 'Valued Customer',
      role: t('receipts.payerRole', 'Payer / Client'),
    },
    {
      titleLocalized: t('receipts.cashierSignature', 'អ្នកគិតលុយ / បេឡាធិការ'),
      titleEnglish: 'Cashier / Staff',
      name: 'Cashier Staff',
      role: t('receipts.cashierRole', 'Cashier / Accountant'),
    },
    {
      titleLocalized: t('receipts.authorizedSignature', 'អ្នកគ្រប់គ្រង / អនុម័ត'),
      titleEnglish: 'Manager / Approver',
      name: 'Store Manager',
      role: t('receipts.managerRole', 'Authorized Signatory'),
    },
  ];

  const activeSignatures = signatures && signatures.length > 0 ? signatures : defaultSigs;
  const currentDateTimeStr = formatPrintDateTime(new Date());
  const watermark = customWatermark || t('receipts.auditWatermark', 'Enterprise POS System • Certified Financial Audit Voucher');
  const pageText = pageNumberText || `${t('common.page', 'Page')} 1 / 1`;

  return (
    <div className="w-full pt-3 mt-4 border-t border-slate-300 select-none space-y-3 [print-color-adjust:exact] [-webkit-print-color-adjust:exact] print:break-inside-avoid">
      {/* Optional Legal / Notice */}
      {noticeText && (
        <div className="text-[9.5px] text-slate-600 leading-relaxed border-l-2 border-slate-400 pl-2.5 bg-slate-50 py-1 rounded-r font-normal">
          {noticeText}
        </div>
      )}

      {/* Dynamic Signatures Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${activeSignatures.length}, minmax(0, 1fr))`,
        }}
        className="gap-8 text-center text-xs pt-2"
      >
        {activeSignatures.map((sig, idx) => (
          <div key={idx} className="space-y-6 flex flex-col justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900 text-[10.5px] uppercase tracking-wider">
                {sig.titleLocalized || sig.titleKhmer || sig.titleEnglish}
              </p>
              {sig.titleEnglish && (
                <p className="text-[8.5px] text-slate-400 font-medium tracking-wide">
                  ({sig.titleEnglish})
                </p>
              )}
            </div>

            <div className="pt-2 text-[9.5px] text-slate-700 space-y-0.5">
              <div className="w-3/4 mx-auto border-b border-slate-300 mb-2"></div>
              <p className="font-bold text-slate-900 truncate">
                {sig.name || '__________________________'}
              </p>
              <p className="text-[8.5px] text-slate-500 font-medium">
                {sig.role || 'Authorized Signatory'}
              </p>
              {sig.date && (
                <p className="text-[8px] text-slate-400 font-mono pt-0.5">
                  Date: {sig.date}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* System Watermark / Footer Timestamp */}
      <div className="flex justify-between items-center text-[8.5px] text-slate-400 pt-2 border-t border-slate-200 font-mono">
        <div className="flex items-center gap-1">
          <ShieldCheck size={10} className="text-slate-400 shrink-0" />
          <span>{watermark}</span>
        </div>
        <div className="flex items-center gap-3">
          {showTimestamp && (
            <span>{t('receipts.printedOn', 'Generated on')}: {currentDateTimeStr}</span>
          )}
          <span>{pageText}</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalPrintContainer;
