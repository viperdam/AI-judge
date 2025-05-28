
import React from 'react';
import { useTranslations } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 text-center mt-12">
      <p className="text-sm text-slate-500">
        {t('footerText', { year: currentYear })}
      </p>
      <p className="text-xs text-slate-600 mt-1">
        {t('footerDisclaimer')}
      </p>
    </footer>
  );
};
