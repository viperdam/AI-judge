
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { useTranslations } from '../context/LanguageContext';

interface PerspectiveDisplayProps {
  title: string; 
  text: string;
  onNext: () => void;
  nextButtonText: string; // This is now the actual button text, not a key
  isLoading: boolean;
}

export const PerspectiveDisplay: React.FC<PerspectiveDisplayProps> = ({ title, text, onNext, nextButtonText, isLoading }) => {
  const { t } = useTranslations();
  
  if (isLoading && !text) { // Show loading spinner if actively loading and no text yet
    return <LoadingSpinner loadingText={t('analyzingConcern')} />;
  }
  return (
    <div className="w-full p-6 bg-slate-800 rounded-xl shadow-2xl text-slate-300 space-y-6">
      <h2 className="text-2xl font-semibold text-pink-400">{title}</h2>
      <div className="p-4 bg-slate-700/50 rounded-lg whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto">
        {text || t('loadingPerspective')}
      </div>
      <button
        onClick={onNext}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-teal-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {isLoading ? t('loadingNextStep') : nextButtonText}
      </button>
    </div>
  );
};
