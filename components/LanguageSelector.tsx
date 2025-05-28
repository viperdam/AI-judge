
import React from 'react';
import { useTranslations, SUPPORTED_LANGUAGES, LanguageCode } from '../context/LanguageContext';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useTranslations();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value as LanguageCode);
  };

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="language-select" className="text-sm text-slate-300">
        {t('selectLanguage')}
      </label>
      <select
        id="language-select"
        value={language}
        onChange={handleChange}
        className="bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-md p-1.5 focus:ring-pink-500 focus:border-pink-500"
        aria-label={t('selectLanguage')}
      >
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};
