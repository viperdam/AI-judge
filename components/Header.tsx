
import React from 'react';
import { useTranslations } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

export const Header: React.FC = () => {
  const { t } = useTranslations();

  return (
    <header className="w-full py-6 text-center">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="flex items-center justify-center space-x-3 mt-8 sm:mt-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-pink-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
          {t('appTitle')}
        </h1>
      </div>
      <p className="text-slate-400 mt-2 text-lg">
        {t('appSubtitle')}
      </p>
    </header>
  );
};
