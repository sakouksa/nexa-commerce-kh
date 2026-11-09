import React from 'react';
import { useLanguage } from '../../i18n';

export interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const { t } = useLanguage();

  return (
    <footer
      className={`pt-6 pb-2 text-center text-[11px] text-slate-400 dark:text-slate-500 transition-colors select-none ${className}`}
    >
      {t('common.footerNote', '© 2026 MiniStore KH. Made for better store management.')}
    </footer>
  );
};

export default Footer;
