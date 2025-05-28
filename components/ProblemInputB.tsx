
import React from 'react';
import { useTranslations } from '../context/LanguageContext';

interface ProblemInputBProps {
  onSubmit: (problem: string) => void;
  isLoading: boolean;
  problem: string;
  setProblem: (problem: string) => void;
  userAName: string; // To reference User A in prompts
}

export const ProblemInputB: React.FC<ProblemInputBProps> = ({ onSubmit, isLoading, problem, setProblem, userAName }) => {
  const { t } = useTranslations();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(problem);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-6 bg-slate-800 rounded-xl shadow-2xl space-y-6">
      <div>
        <label htmlFor="problemB" className="block text-lg font-medium text-slate-300 mb-2">
          {t('problemInputBLabel', { userAName: userAName })}
        </label>
        <textarea
          id="problemB"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder={t('problemInputBPlaceholder')}
          rows={6}
          className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
          disabled={isLoading}
          aria-describedby="problem-description-help-B"
        />
        <p id="problem-description-help-B" className="mt-2 text-xs text-slate-500">
          {t('problemInputBHelpText')}
        </p>
      </div>
      <button
        type="submit"
        disabled={isLoading || !problem.trim()}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-teal-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        aria-label={isLoading ? t('submittingPartnerBStoryButtonLoading') : t('submitPartnerBStoryButton')}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="status" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('submittingPartnerBStoryButtonLoading')}
          </>
        ) : (
          t('submitPartnerBStoryButton')
        )}
      </button>
    </form>
  );
};
