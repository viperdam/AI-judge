
import React, { useState, useEffect, useCallback } from 'react';
import type { ClarificationAnswer, AIClarificationQuestionItem } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { useTranslations } from '../context/LanguageContext';

interface JudgeClarificationInputProps {
  questions: AIClarificationQuestionItem[]; // Direct list of questions for the current user
  introductoryText?: string; // Optional general intro for the set
  concludingText?: string; // Optional general conclusion for the set
  onSubmit: (answers: ClarificationAnswer[]) => void;
  isLoading: boolean;
  currentUserRole: 'userA' | 'partnerB'; // Still useful for generic titles if needed elsewhere
  userDisplayName: string; // For personalizing if needed, though AI question includes it
}

type AnswerOption = 'A' | 'B' | 'C' | 'D' | 'skipped';

export const JudgeClarificationInput: React.FC<JudgeClarificationInputProps> = ({ 
    questions, introductoryText, concludingText, onSubmit, isLoading, currentUserRole, userDisplayName 
}) => {
  const { t } = useTranslations();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allAnswers, setAllAnswers] = useState<ClarificationAnswer[]>([]);
  
  const [currentAnswerValue, setCurrentAnswerValue] = useState<AnswerOption | ''>('');
  const [currentCustomAnswer, setCurrentCustomAnswer] = useState('');

  const resetCurrentAnswerState = useCallback(() => {
    setCurrentAnswerValue('');
    setCurrentCustomAnswer('');
  }, []);

  useEffect(() => {
    setAllAnswers(questions.map(qItem => ({
        questionText: qItem.questionText, // This text now comes directly from AI, including user's name
        answerValue: 'skipped', 
        customAnswer: '',
        chosenAnswerText: '' 
    })));
    setCurrentQuestionIndex(0); 
    resetCurrentAnswerState();
  }, [questions, resetCurrentAnswerState]);


  const handleAnswerSelection = (value: AnswerOption) => {
    setCurrentAnswerValue(value);
    if (value !== 'D') {
        setCurrentCustomAnswer(''); 
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex >= questions.length) return; 

    const currentQuestionItem = questions[currentQuestionIndex];
    let answerToSave: AnswerOption = 'skipped';
    let customText = '';
    let chosenText = '';

    if (currentAnswerValue !== '') {
        answerToSave = currentAnswerValue;
        if (currentAnswerValue === 'D') {
            customText = currentCustomAnswer.trim();
        } else if (currentAnswerValue === 'A') {
            chosenText = currentQuestionItem.suggestedAnswers.a;
        } else if (currentAnswerValue === 'B') {
            chosenText = currentQuestionItem.suggestedAnswers.b;
        } else if (currentAnswerValue === 'C') {
            chosenText = currentQuestionItem.suggestedAnswers.c;
        }
    }

    const newAnswers = [...allAnswers];
    newAnswers[currentQuestionIndex] = {
        questionText: currentQuestionItem.questionText,
        answerValue: answerToSave,
        customAnswer: customText,
        chosenAnswerText: chosenText
    };
    setAllAnswers(newAnswers);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetCurrentAnswerState();
      const nextQAnswer = newAnswers[currentQuestionIndex + 1];
      if (nextQAnswer && nextQAnswer.answerValue !== 'skipped') {
          setCurrentAnswerValue(nextQAnswer.answerValue);
          setCurrentCustomAnswer(nextQAnswer.customAnswer || '');
      }
    } else {
      onSubmit(newAnswers); 
    }
  };
  
  const handleSkipQuestion = () => {
     const currentQuestionItem = questions[currentQuestionIndex];
     const newAnswers = [...allAnswers];
     newAnswers[currentQuestionIndex] = {
        questionText: currentQuestionItem.questionText,
        answerValue: 'skipped',
        customAnswer: '',
        chosenAnswerText: ''
     };
     setAllAnswers(newAnswers);

     if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        resetCurrentAnswerState();
        const nextQAnswer = newAnswers[currentQuestionIndex + 1];
        if (nextQAnswer && nextQAnswer.answerValue !== 'skipped') {
            setCurrentAnswerValue(nextQAnswer.answerValue);
            setCurrentCustomAnswer(nextQAnswer.customAnswer || '');
        }
     } else {
        onSubmit(newAnswers);
     }
  };


  const handleSubmitAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalAnswers = [...allAnswers];
    if (currentAnswerValue !== '' && currentQuestionIndex < questions.length) {
        const currentQuestionItem = questions[currentQuestionIndex];
        let chosenTextSubmit = '';
        if (currentAnswerValue === 'A') chosenTextSubmit = currentQuestionItem.suggestedAnswers.a;
        else if (currentAnswerValue === 'B') chosenTextSubmit = currentQuestionItem.suggestedAnswers.b;
        else if (currentAnswerValue === 'C') chosenTextSubmit = currentQuestionItem.suggestedAnswers.c;

        finalAnswers[currentQuestionIndex] = {
            questionText: currentQuestionItem.questionText,
            answerValue: currentAnswerValue,
            customAnswer: currentAnswerValue === 'D' ? currentCustomAnswer.trim() : '',
            chosenAnswerText: chosenTextSubmit
        };
    }
    onSubmit(finalAnswers);
  };
  
  const currentQuestionItem = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  if (isLoading && !introductoryText && questions.length === 0) { 
    return <LoadingSpinner loadingText={t('loadingProfile')} />;
  }

  if (questions.length === 0 && !isLoading) {
    return (
        <div className="w-full p-6 bg-slate-800 rounded-xl shadow-2xl text-slate-300 space-y-6 text-center">
            {introductoryText && <p className="text-slate-400 italic text-center my-4 p-3 bg-slate-700/50 rounded-md">{introductoryText}</p>}
            <p>{t('judgeClarificationNoQuestions')}</p>
            {concludingText && <p className="text-slate-400 italic text-center my-4 p-3 bg-slate-700/50 rounded-md">{concludingText}</p>}
            <button onClick={() => onSubmit([])} className="mt-4 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600">{t('proceedButton')}</button>
        </div>
    );
  }
  if (!currentQuestionItem && !isLoading && questions.length > 0) { 
    return (
      <div className="w-full p-6 bg-slate-800 rounded-xl shadow-2xl text-slate-300 space-y-6 text-center">
        <p>{t('judgeClarificationAllAnsweredPrompt')}</p>
        {isLastQuestion && concludingText && (
            <p className="text-slate-400 italic text-center my-4 p-3 bg-slate-700/50 rounded-md">{concludingText}</p>
        )}
        <button onClick={() => handleSubmitAll()} className="mt-4 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700">{t('submitTheseReflectionsButton')}</button>
      </div>
    ); 
  }
  if (!currentQuestionItem && !isLoading) return null; 


  return (
    <form onSubmit={handleSubmitAll} className="w-full p-6 bg-slate-800 rounded-xl shadow-2xl text-slate-300 space-y-6">
      <h2 className="text-2xl font-semibold text-pink-400 text-center">
        {currentUserRole === 'userA' ? t('judgeClarificationTitleUserA', { userName: userDisplayName }) : t('judgeClarificationTitlePartnerB', { userName: userDisplayName })}
      </h2>
      
      {currentQuestionIndex === 0 && introductoryText && (
        <p className="text-slate-400 italic text-center my-4 p-3 bg-slate-700/50 rounded-md">{introductoryText}</p>
      )}
      
      <p className="text-center text-sm text-slate-400">{t('judgeClarificationQuestionProgress', { current: currentQuestionIndex + 1, total: questions.length })}</p>

      {currentQuestionItem && (
        <div className="space-y-4 p-4 border border-purple-500/50 rounded-lg bg-slate-700/30">
          {/* The questionText from AI should now include the user's name */}
          <label className="block text-md font-medium text-slate-200 mb-3">{currentQuestionItem.questionText}</label>
          
          <div className="space-y-2">
            {(['A', 'B', 'C'] as const).map(optionVal => (
              <div key={optionVal} className="flex items-center">
                <input
                  type="radio"
                  id={`option-${optionVal}-${currentQuestionIndex}`}
                  name={`q-${currentQuestionIndex}-answer`}
                  value={optionVal}
                  checked={currentAnswerValue === optionVal}
                  onChange={() => handleAnswerSelection(optionVal)}
                  className="h-4 w-4 text-pink-600 border-slate-500 focus:ring-pink-500"
                  disabled={isLoading}
                />
                <label htmlFor={`option-${optionVal}-${currentQuestionIndex}`} className="ml-2 block text-sm text-slate-300">
                  {t(`judgeClarificationAnswerOption${optionVal}`)} {currentQuestionItem.suggestedAnswers[optionVal.toLowerCase() as 'a'|'b'|'c']}
                </label>
              </div>
            ))}
             <div key='D' className="flex items-center">
                <input
                  type="radio"
                  id={`option-D-${currentQuestionIndex}`}
                  name={`q-${currentQuestionIndex}-answer`}
                  value='D'
                  checked={currentAnswerValue === 'D'}
                  onChange={() => handleAnswerSelection('D')}
                  className="h-4 w-4 text-pink-600 border-slate-500 focus:ring-pink-500"
                  disabled={isLoading}
                />
                <label htmlFor={`option-D-${currentQuestionIndex}`} className="ml-2 block text-sm text-slate-300">
                  {t('judgeClarificationAnswerOptionD')} {t('judgeClarificationAnswerOptionDOther')}
                </label>
              </div>
          </div>

          {currentAnswerValue === 'D' && (
            <textarea
              value={currentCustomAnswer}
              onChange={(e) => setCurrentCustomAnswer(e.target.value)}
              rows={2}
              className="mt-2 block w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-slate-100 placeholder-slate-500"
              placeholder={t('judgeClarificationTextareaPlaceholderForD')}
              disabled={isLoading}
            />
          )}
        </div>
      )}
      
      {isLastQuestion && concludingText && (
        <p className="text-slate-400 italic text-center my-4 p-3 bg-slate-700/50 rounded-md">{concludingText}</p>
      )}

      <div className="flex justify-between items-center pt-4">
        <button
          type="button"
          onClick={handleSkipQuestion}
          disabled={isLoading}
          className="px-4 py-2 border border-slate-500 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700 disabled:opacity-50"
        >
          {t('skipQuestionButton')}
        </button>

        {isLastQuestion ? (
          <button
            type="submit" 
            disabled={isLoading || currentAnswerValue === '' || (currentAnswerValue === 'D' && currentCustomAnswer.trim() === '')}
            className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 disabled:opacity-50"
          >
            {isLoading ? t('submittingReflectionsButton') : t('submitTheseReflectionsButton')}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNextQuestion}
            disabled={isLoading || currentAnswerValue === '' || (currentAnswerValue === 'D' && currentCustomAnswer.trim() === '')}
            className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-pink-500 disabled:opacity-50"
          >
            {t('nextQuestionButton')}
          </button>
        )}
      </div>
    </form>
  );
};
