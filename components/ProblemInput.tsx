
import React from 'react';
import { useTranslations } from '../context/LanguageContext';

interface ProblemInputProps {
  onSubmit: (problem: string) => void;
  isLoading: boolean;
  problem: string;
  setProblem: (problem: string) => void;
  userIdentifier: "A"; // To distinguish if needed, though labels are specific now
}

export const ProblemInput: React.FC<ProblemInputProps> = ({ onSubmit, isLoading, problem, setProblem }) => {
  const { t } = useTranslations();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(problem);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-6 bg-slate-800 rounded-xl shadow-2xl space-y-6">
      <div>
        <label htmlFor="problemA" className="block text-lg font-medium text-slate-300 mb-2">
          {t('problemInputALabel')}
        </label>
        <textarea
          id="problemA"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder={t('problemInputAPlaceholder')}
          rows={6}
          className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
          disabled={isLoading}
          aria-describedby="problem-description-help-A"
        />
        <p id="problem-description-help-A" className="mt-2 text-xs text-slate-500">
          {t('problemInputAHelpText')}
        </p>
      </div>
      <button
        type="submit"
        disabled={isLoading || !problem.trim()}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-pink-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        aria-label={isLoading ? t('seekingWisdomButton') : t('getAIAdviceButton')}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="status" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('seekingWisdomButton')}
          </>
        ) : (
          t('submitProblemAButton') 
        )}
      </button>
    </form>
  );
};
