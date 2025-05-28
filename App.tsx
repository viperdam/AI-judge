import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ProblemInput } from './components/ProblemInput';
import { ProblemInputB } from './components/ProblemInputB'; 
import { LoadingSpinner } from './components/LoadingSpinner';
import { Footer } from './components/Footer';
import { ProfileIntakeWizard } from './components/intakeWizard/ProfileIntakeWizard';
import { PerspectiveDisplay } from './components/PerspectiveDisplay';
import { JudgeClarificationInput } from './components/JudgeClarificationInput';
import { FinalAssessmentDisplay } from './components/FinalAssessmentDisplay';

import {
  getPerspectiveA_RolePlay,
  getPerspectiveB_RolePlay,
  getAIJudgeClarificationPrompts,
  getFinalAIJudgeRulingWithClarifications,
  summarizeInputText, 
  getTheUltimateFinalJudgeRuling, 
} from './services/geminiService';
import { loadProfileData, saveProfileData, clearProfileData } from './services/localStorageService';
import type { 
    ComprehensiveProfileData, AppStage, AIPerspective, 
    AIClarificationPrompts, ClarificationAnswer, UserClarificationAnswersBundle 
} from './types';
import { useTranslations } from './context/LanguageContext';

const App: React.FC = () => {
  const { t, language } = useTranslations(); 

  const [appStage, setAppStage] = useState<AppStage>('loadingProfile');
  const [profileData, setProfileData] = useState<ComprehensiveProfileData | null>(null);
  
  const [problemInputA, setProblemInputA] = useState<string>('');
  const [problemInputB, setProblemInputB] = useState<string>(''); 

  const [perspectiveA, setPerspectiveA] = useState<AIPerspective | null>(null);
  const [summaryAForB, setSummaryAForB] = useState<string | null>(null);
  const [perspectiveB, setPerspectiveB] = useState<AIPerspective | null>(null);
  
  const [clarificationPrompts, setClarificationPrompts] = useState<AIClarificationPrompts | null>(null);
  const [userAClarificationAnswers, setUserAClarificationAnswers] = useState<ClarificationAnswer[]>([]); 
  const [userBClarificationAnswers, setUserBClarificationAnswers] = useState<ClarificationAnswer[]>([]); 

  const [initialRulingText, setInitialRulingText] = useState<string>(''); 
  
  // Rebuttal flow state - simplified and flexible
  const [initialRulingAgreedByA, setInitialRulingAgreedByA] = useState<boolean | null>(null);
  const [initialRulingAgreedByB, setInitialRulingAgreedByB] = useState<boolean | null>(null); // Only relevant if A agreed
  const [activeRebuttalUser, setActiveRebuttalUser] = useState<'A' | 'B' | null>(null);
  const [activeRebuttalUserRaw, setActiveRebuttalUserRaw] = useState<string>('');
  const [activeRebuttalUserSummary, setActiveRebuttalUserSummary] = useState<string | null>(null);
  const [otherUserResponseToActiveRebuttal, setOtherUserResponseToActiveRebuttal] = useState<'agree' | 'disagree' | null>(null);
  const [otherUserCounterRebuttalRaw, setOtherUserCounterRebuttalRaw] = useState<string>('');
  const [otherUserCounterRebuttalSummary, setOtherUserCounterRebuttalSummary] = useState<string | null>(null);
  
  const [ultimateJudgeRuling, setUltimateJudgeRuling] = useState<string>('');


  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadedProfile = loadProfileData();
    if (loadedProfile && loadedProfile.profileComplete) {
      setProfileData(loadedProfile);
      setAppStage('problemInputA');
    } else {
      setAppStage('profileIntake');
    }
  }, []);

  const resetProblemAndRebuttalState = () => {
    setProblemInputA('');
    setProblemInputB('');
    setPerspectiveA(null);
    setSummaryAForB(null);
    setPerspectiveB(null);
    setClarificationPrompts(null);
    setUserAClarificationAnswers([]);
    setUserBClarificationAnswers([]);
    setInitialRulingText('');
    
    setInitialRulingAgreedByA(null);
    setInitialRulingAgreedByB(null);
    setActiveRebuttalUser(null);
    setActiveRebuttalUserRaw('');
    setActiveRebuttalUserSummary(null);
    setOtherUserResponseToActiveRebuttal(null);
    setOtherUserCounterRebuttalRaw('');
    setOtherUserCounterRebuttalSummary(null);

    setUltimateJudgeRuling('');
    setErrorMessage(null);
  };

  const handleIntakeComplete = useCallback((data: ComprehensiveProfileData) => {
    const completeData = { ...data, profileComplete: true };
    setProfileData(completeData);
    saveProfileData(completeData);
    setAppStage('problemInputA');
    resetProblemAndRebuttalState();
  }, []);

  const handleEditProfile = useCallback(() => {
    setAppStage('profileIntake');
    setErrorMessage(null);
  }, []);

  const handleResetProfile = useCallback(() => {
    clearProfileData();
    setProfileData(null);
    setAppStage('profileIntake');
    resetProblemAndRebuttalState();
  }, []);

  const handleApiError = (err: unknown, defaultMessageKey: string) => {
    console.error(t(defaultMessageKey), err);
    let msg = (err instanceof Error) ? err.message : t(defaultMessageKey);
    if (msg.includes("API_KEY_INVALID") || msg.includes("API key not valid")) {
      msg = t("errorApiKeyInvalid");
    }
    setErrorMessage(msg);
    setIsLoading(false); 
  };

  const handleProblemSubmitA = useCallback(async (currentProblemA: string) => {
    if (!currentProblemA.trim()) {
      setErrorMessage(t('problemInputHelpText'));
      return;
    }
    if (!profileData) {
      setErrorMessage(t('errorProfileMissing'));
      setAppStage('profileIntake');
      return;
    }
    resetProblemAndRebuttalState(); 
    setProblemInputA(currentProblemA);
    setIsLoading(true);
    setSummaryAForB(null);
    
    try {
      const pA_text = await getPerspectiveA_RolePlay(currentProblemA, profileData, language);
      setPerspectiveA({ title: t("perspectivePAGenericTitle"), perspectiveText: pA_text });
      
      if (pA_text) {
        const summaryText = await summarizeInputText(
          currentProblemA,
          language,
          `User A (${profileData.userA.name || 'User A'})'s initial problem description`,
          profileData,
          currentProblemA 
        );
        setSummaryAForB(summaryText);
      }
      
      setAppStage('perspectiveA');
    } catch (err) {
      handleApiError(err, "errorGetPerspectiveA");
    } finally {
      setIsLoading(false);
    }
  }, [profileData, language, t]);

  const handleProceedToProblemInputB = useCallback(() => {
    if (!problemInputA || !profileData || !summaryAForB) {
        setErrorMessage(t('errorMissingContext'));
        if (!summaryAForB) console.error("Summary for B not generated before proceeding.");
        return;
    }
    setAppStage('problemInputB');
  }, [problemInputA, profileData, summaryAForB, t]);

  const handleProblemSubmitB = useCallback(async (currentProblemB: string) => {
    if (!currentProblemB.trim()) {
        setErrorMessage(t('problemInputBHelpText'));
        return;
    }
    if (!problemInputA || !profileData || !perspectiveA || !summaryAForB) {
      setErrorMessage(t('errorMissingContext'));
      if (!summaryAForB) console.error("Summary for B is missing when submitting B's problem.");
      return;
    }
    setProblemInputB(currentProblemB);
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const pB = await getPerspectiveB_RolePlay(
        problemInputA, 
        currentProblemB, 
        profileData, 
        perspectiveA.perspectiveText, 
        summaryAForB,
        language
      );
      setPerspectiveB({ title: t("perspectivePBGenericTitle"), perspectiveText: pB });
      setAppStage('perspectiveB');
    } catch (err) {
      handleApiError(err, "errorGetPerspectiveB");
    } finally {
      setIsLoading(false);
    }
  }, [problemInputA, profileData, perspectiveA, summaryAForB, language, t]);


  const handleProceedToJudgeClarificationsA = useCallback(async () => {
    if (!problemInputA || !problemInputB || !profileData || !perspectiveA || !perspectiveB) {
      setErrorMessage(t('errorMissingContext'));
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const prompts = await getAIJudgeClarificationPrompts(problemInputA, problemInputB, profileData, perspectiveA.perspectiveText, perspectiveB.perspectiveText, language);
      setClarificationPrompts(prompts);
      setAppStage('judgeClarificationIntakeA');
    } catch (err) {
      handleApiError(err, "errorGetClarificationPrompts");
    } finally {
      setIsLoading(false);
    }
  }, [problemInputA, problemInputB, profileData, perspectiveA, perspectiveB, language, t]);

  const handleSubmitClarificationsA = useCallback(async (answersA: ClarificationAnswer[]) => {
    setUserAClarificationAnswers(answersA);
    setAppStage('judgeClarificationIntakeB'); 
  }, []);

  const handleSubmitClarificationsB = useCallback(async (answersB: ClarificationAnswer[]) => {
    setUserBClarificationAnswers(answersB);
    if (!problemInputA || !problemInputB || !profileData || !perspectiveA || !perspectiveB || !clarificationPrompts || userAClarificationAnswers.length === 0) {
      setErrorMessage(t('errorMissingContext'));
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    
    const finalAnswersBundle: UserClarificationAnswersBundle = {
        userAAnswers: userAClarificationAnswers, 
        partnerBAnswers: answersB
    };

    try {
      const assessment = await getFinalAIJudgeRulingWithClarifications(
        problemInputA, problemInputB, profileData,
        perspectiveA.perspectiveText, perspectiveB.perspectiveText,
        finalAnswersBundle, language
      );
      setInitialRulingText(assessment); 
      setAppStage('judgeFinalRulingDisplay'); 
    } catch (err) {
      handleApiError(err, "errorGetFinalAssessment");
    } finally {
      setIsLoading(false);
    }
  }, [problemInputA, problemInputB, profileData, perspectiveA, perspectiveB, clarificationPrompts, userAClarificationAnswers, language, t]);
  
  // --- REBUTTAL FLOW HANDLERS ---
  const handleInitialRulingResponseA = useCallback((agrees: boolean) => {
    setInitialRulingAgreedByA(agrees);
    if (agrees) {
      setAppStage('initialRulingFeedbackB'); // Ask B
    } else {
      setActiveRebuttalUser('A');
      setAppStage('rebuttalInputActiveUser');
    }
  }, []);

  const handleInitialRulingResponseB = useCallback((agrees: boolean) => { // Called only if A agreed
    setInitialRulingAgreedByB(agrees);
    if (agrees) { // Both A and B agree with initial ruling
      setUltimateJudgeRuling(initialRulingText); // Initial ruling becomes the final one
      setAppStage('judgeUltimateFinalRulingDisplay');
    } else { // A agreed, B disagrees
      setActiveRebuttalUser('B');
      setAppStage('rebuttalInputActiveUser');
    }
  }, [initialRulingText]);

  const handleSubmitActiveRebuttal = useCallback(async (rebuttalText: string) => {
    if (!rebuttalText.trim() || !profileData || !problemInputA || !activeRebuttalUser) {
      setErrorMessage(t('rebuttalInputHelpText'));
      return;
    }
    setActiveRebuttalUserRaw(rebuttalText);
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const contextLabel = activeRebuttalUser === 'A' ? "User A's Rebuttal Points" : "Partner B's Rebuttal Points";
      const summary = await summarizeInputText(rebuttalText, language, contextLabel, profileData, problemInputA, problemInputB);
      setActiveRebuttalUserSummary(summary);
      setAppStage('presentRebuttalToOtherUser');
    } catch (err) {
      handleApiError(err, "errorSummarizingRebuttal");
    } finally {
      setIsLoading(false);
    }
  }, [profileData, problemInputA, problemInputB, language, t, activeRebuttalUser]);

  const handleOtherUserResponseToActiveRebuttal = useCallback(async (response: 'agree' | 'disagree') => {
    setOtherUserResponseToActiveRebuttal(response);
    if (response === 'agree' || !activeRebuttalUserSummary) {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        if (!profileData || !problemInputA || !problemInputB || !perspectiveA || !perspectiveB || !userAClarificationAnswers || !userBClarificationAnswers || !initialRulingText) {
            handleApiError(new Error("Missing critical data for ultimate ruling."), "errorMissingContext"); return;
        }
        let finalRebuttalA = activeRebuttalUser === 'A' ? activeRebuttalUserSummary : null;
        let finalRebuttalB = activeRebuttalUser === 'B' ? activeRebuttalUserSummary : null;

        const ultimateRuling = await getTheUltimateFinalJudgeRuling(
          profileData, problemInputA, problemInputB, perspectiveA.perspectiveText, perspectiveB.perspectiveText,
          userAClarificationAnswers, userBClarificationAnswers, initialRulingText,
          finalRebuttalA, finalRebuttalB, language
        );
        setUltimateJudgeRuling(ultimateRuling);
        setAppStage('judgeUltimateFinalRulingDisplay');
      } catch (err) {
        handleApiError(err, "errorGetUltimateRuling");
      } finally {
        setIsLoading(false);
      }
    } else { // Other user disagrees with active user's rebuttal
      setAppStage('rebuttalInputOtherUserCounter');
    }
  }, [profileData, problemInputA, problemInputB, perspectiveA, perspectiveB, userAClarificationAnswers, userBClarificationAnswers, initialRulingText, activeRebuttalUser, activeRebuttalUserSummary, language, t]);
  
  const handleSubmitOtherUserCounterRebuttal = useCallback(async (counterRebuttalText: string) => {
    if (!counterRebuttalText.trim() || !profileData || !problemInputA || !problemInputB || !activeRebuttalUserSummary || !activeRebuttalUser) {
      setErrorMessage(t('rebuttalInputHelpText'));
      return;
    }
    setOtherUserCounterRebuttalRaw(counterRebuttalText);
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const otherUserName = activeRebuttalUser === 'A' ? (profileData.partnerB.name || "Partner B") : (profileData.userA.name || "User A");
      const contextLabel = `Counter-Rebuttal Points from ${otherUserName}`;
      const summaryCounter = await summarizeInputText(counterRebuttalText, language, contextLabel, profileData, problemInputA, problemInputB);
      setOtherUserCounterRebuttalSummary(summaryCounter);
      
      if (!perspectiveA || !perspectiveB || !userAClarificationAnswers || !userBClarificationAnswers || !initialRulingText) {
        handleApiError(new Error("Missing critical data for ultimate ruling."), "errorMissingContext"); return;
      }

      let finalRebuttalA = activeRebuttalUser === 'A' ? activeRebuttalUserSummary : summaryCounter;
      let finalRebuttalB = activeRebuttalUser === 'B' ? activeRebuttalUserSummary : summaryCounter;

      const ultimateRuling = await getTheUltimateFinalJudgeRuling(
        profileData, problemInputA, problemInputB, perspectiveA.perspectiveText, perspectiveB.perspectiveText,
        userAClarificationAnswers, userBClarificationAnswers, initialRulingText,
        finalRebuttalA, finalRebuttalB, language
      );
      setUltimateJudgeRuling(ultimateRuling);
      setAppStage('judgeUltimateFinalRulingDisplay');
    } catch (err) {
      handleApiError(err, "errorGetUltimateRuling");
    } finally {
      setIsLoading(false);
    }
  }, [profileData, problemInputA, problemInputB, perspectiveA, perspectiveB, userAClarificationAnswers, userBClarificationAnswers, initialRulingText, activeRebuttalUser, activeRebuttalUserSummary, language, t]);


  const handleStartNewProblemWithProfile = () => {
    setAppStage('problemInputA'); 
    resetProblemAndRebuttalState(); 
  };

  const renderContent = () => {
    if (isLoading && appStage !== 'loadingProfile') return <LoadingSpinner loadingText={t('analyzingConcern')} />;
    if (errorMessage) {
      return (
        <div role="alert" className="w-full mt-6 p-6 bg-red-700 bg-opacity-30 border border-red-500 rounded-xl shadow-lg text-red-300">
          <h3 className="text-xl font-semibold text-red-200">{t('errorTitle')}</h3>
          <p>{errorMessage}</p>
          <button onClick={() => setErrorMessage(null)} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">{t('dismissButton')}</button>
        </div>
      );
    }

    switch (appStage) {
      case 'loadingProfile':
        return <LoadingSpinner loadingText={t('loadingProfile')} />;
      case 'profileIntake':
        return <ProfileIntakeWizard onComplete={handleIntakeComplete} initialData={profileData} />;
      case 'problemInputA':
        return (
          <>
            {profileData && (
              <div className="mb-6 p-4 bg-slate-700/50 rounded-lg shadow w-full">
                <h2 className="text-xl font-semibold text-pink-400 mb-3">{t('profileContextActive')}</h2>
                <p className="text-sm text-slate-300">{t('userAProfileSummaryWithName', { name: profileData.userA.name, age: profileData.userA.age, occupation: profileData.userA.occupation, gender: t(`gender.${profileData.userA.gender}`) || profileData.userA.gender })}</p>
                <p className="text-sm text-slate-300">{t('partnerBProfileSummary', { name: profileData.partnerB.name, occupation: profileData.partnerB.occupation, gender: t(`gender.${profileData.partnerB.gender}`) || profileData.partnerB.gender })}</p>
                <p className="text-sm text-slate-300">
                  {t('childrenProfileSummary', { details: profileData.homeRelationship.hasChildren === 'Yes' ? profileData.homeRelationship.childrenDetails : t('childrenDetailsNo')})}
                </p>
                <button onClick={handleEditProfile} className="mt-2 mr-2 text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md">{t('editProfileButton')}</button>
                <button onClick={handleResetProfile} className="mt-2 text-xs bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md">{t('resetProfileButton')}</button>
              </div>
            )}
            <ProblemInput onSubmit={handleProblemSubmitA} isLoading={isLoading} problem={problemInputA} setProblem={setProblemInputA} userIdentifier="A" />
          </>
        );
      case 'problemInputB':
        return (
            <ProblemInputB onSubmit={handleProblemSubmitB} isLoading={isLoading} problem={problemInputB} setProblem={setProblemInputB} userAName={profileData?.userA.name || t('User A')} />
        );
      case 'perspectiveA':
        return perspectiveA && (
          <PerspectiveDisplay
            title={perspectiveA.title}
            text={perspectiveA.perspectiveText}
            onNext={handleProceedToProblemInputB} 
            nextButtonText={t('nextButtonToPartnerBProblemInput')}
            isLoading={isLoading}
          />
        );
      case 'perspectiveB':
        return perspectiveB && (
          <PerspectiveDisplay
            title={perspectiveB.title}
            text={perspectiveB.perspectiveText}
            onNext={handleProceedToJudgeClarificationsA}
            nextButtonText={t('nextButtonProceedToJudgeClarificationA')}
            isLoading={isLoading}
          />
        );
      case 'judgeClarificationIntakeA':
        return clarificationPrompts && profileData && (
          <JudgeClarificationInput
            questions={clarificationPrompts.questionsForUserA}
            introductoryText={clarificationPrompts.introductoryTextContent}
            // Concluding text will be handled by B's turn if it's a general one
            onSubmit={handleSubmitClarificationsA}
            isLoading={isLoading}
            currentUserRole="userA"
            userDisplayName={profileData.userA.name || t('User A')}
          />
        );
      case 'judgeClarificationIntakeB':
        return clarificationPrompts && profileData && (
          <JudgeClarificationInput
            questions={clarificationPrompts.questionsForPartnerB}
            // Introductory text might have been shown by A, or show again if it's short.
            // For now, assume intro is general and can be shown again if desired, or omit.
            // Let's show intro for B as well if it exists, and the concluding text.
            introductoryText={clarificationPrompts.introductoryTextContent}
            concludingText={clarificationPrompts.concludingTextContent}
            onSubmit={handleSubmitClarificationsB}
            isLoading={isLoading}
            currentUserRole="partnerB"
            userDisplayName={profileData.partnerB.name || t('Partner B')}
          />
        );
      case 'judgeFinalRulingDisplay': // Initial Ruling display, now leads to initialRulingFeedbackA
        return (
            <>
                <FinalAssessmentDisplay assessment={initialRulingText} onStartNewFullAnalysis={handleStartNewProblemWithProfile} isLoading={isLoading} isUltimate={false} />
                {!isLoading && initialRulingText && (
                    <div className="w-full max-w-md mt-6 p-4 bg-slate-700 rounded-lg shadow-md">
                        <p className="text-center text-slate-200 mb-3">{t('initialRulingFeedbackPromptA', { userName: profileData?.userA.name || t('User A')})}</p>
                        <div className="flex justify-around">
                            <button onClick={() => handleInitialRulingResponseA(true)} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">{t('agreeWithRulingButton')}</button>
                            <button onClick={() => handleInitialRulingResponseA(false)} className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md">{t('disagreeAndAddPointsButton')}</button>
                        </div>
                    </div>
                )}
            </>
        );
    case 'initialRulingFeedbackB': // New stage: Ask User B if A agreed
        return (
            <>
                <FinalAssessmentDisplay assessment={initialRulingText} onStartNewFullAnalysis={handleStartNewProblemWithProfile} isLoading={isLoading} isUltimate={false} />
                {!isLoading && initialRulingText && (
                    <div className="w-full max-w-md mt-6 p-4 bg-slate-700 rounded-lg shadow-md">
                         <p className="text-center text-slate-300 mb-2">{t('userAAgreedInfo', { userNameA: profileData?.userA.name || t('User A')})}</p>
                        <p className="text-center text-slate-200 mb-3">{t('initialRulingFeedbackPromptB', { userNameB: profileData?.partnerB.name || t('Partner B')})}</p>
                        <div className="flex justify-around">
                            <button onClick={() => handleInitialRulingResponseB(true)} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">{t('agreeWithRulingButton')}</button>
                            <button onClick={() => handleInitialRulingResponseB(false)} className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md">{t('disagreeAndAddPointsButton')}</button>
                        </div>
                    </div>
                )}
            </>
        );
    case 'rebuttalInputActiveUser':
        const activeUserName = activeRebuttalUser === 'A' ? (profileData?.userA.name || t('User A')) : (profileData?.partnerB.name || t('Partner B'));
        const placeholderKey = activeRebuttalUser === 'A' ? 'rebuttalInputPlaceholderA' : 'rebuttalInputPlaceholderB';
        return (
            <div className="w-full p-6 bg-slate-800 rounded-xl shadow-2xl space-y-6">
                <h2 className="text-2xl font-semibold text-pink-400 text-center">{t('rebuttalInputTitleActiveUser', { userName: activeUserName })}</h2>
                <textarea
                    value={activeRebuttalUserRaw}
                    onChange={(e) => setActiveRebuttalUserRaw(e.target.value)}
                    placeholder={t(placeholderKey)}
                    rows={6}
                    className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
                    disabled={isLoading}
                    aria-describedby="rebuttal-active-help"
                />
                <p id="rebuttal-active-help" className="mt-2 text-xs text-slate-500">{t('rebuttalInputHelpText')}</p>
                <button
                    onClick={() => handleSubmitActiveRebuttal(activeRebuttalUserRaw)}
                    disabled={isLoading || !activeRebuttalUserRaw.trim()}
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
                >
                    {isLoading ? t('submittingRebuttalButton') : t('submitRebuttalButton')}
                </button>
            </div>
        );
    case 'presentRebuttalToOtherUser':
        const presenterName = activeRebuttalUser === 'A' ? (profileData?.userA.name || t('User A')) : (profileData?.partnerB.name || t('Partner B'));
        const recipientName = activeRebuttalUser === 'A' ? (profileData?.partnerB.name || t('Partner B')) : (profileData?.userA.name || t('User A'));
        return activeRebuttalUserSummary && (
            <div className="w-full p-6 bg-slate-800 rounded-xl shadow-2xl space-y-6">
                <h2 className="text-2xl font-semibold text-pink-400 text-center">{t('presentRebuttalTitleToOtherUser', { presenterName, recipientName })}</h2>
                <div className="p-4 bg-slate-700/50 rounded-lg whitespace-pre-wrap leading-relaxed max-h-[40vh] overflow-y-auto">
                    <p className="font-semibold text-purple-300 mb-2">{t('activeUserRebuttalSummaryTitle', { userName: presenterName })}</p>
                    {activeRebuttalUserSummary}
                </div>
                <p className="text-center text-slate-200 mt-4 mb-3">{t('otherUserFeedbackPrompt', { userName: recipientName })}</p>
                <div className="flex justify-around">
                    <button onClick={() => handleOtherUserResponseToActiveRebuttal('agree')} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">{t('acceptPointsNoCommentButton')}</button>
                    <button onClick={() => handleOtherUserResponseToActiveRebuttal('disagree')} className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md">{t('disagreeAndAddMyPointsButton')}</button>
                </div>
            </div>
        );
    case 'rebuttalInputOtherUserCounter':
        const counterUserName = activeRebuttalUser === 'A' ? (profileData?.partnerB.name || t('Partner B')) : (profileData?.userA.name || t('User A'));
        const counterPlaceholderKey = activeRebuttalUser === 'A' ? 'rebuttalInputPlaceholderB' : 'rebuttalInputPlaceholderA'; // Use the opposite placeholder
         return (
            <div className="w-full p-6 bg-slate-800 rounded-xl shadow-2xl space-y-6">
                <h2 className="text-2xl font-semibold text-pink-400 text-center">{t('rebuttalCounterInputTitle', { userName: counterUserName })}</h2>
                <textarea
                    value={otherUserCounterRebuttalRaw}
                    onChange={(e) => setOtherUserCounterRebuttalRaw(e.target.value)}
                    placeholder={t(counterPlaceholderKey)}
                    rows={6}
                    className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
                    disabled={isLoading}
                    aria-describedby="rebuttal-counter-help"
                />
                <p id="rebuttal-counter-help" className="mt-2 text-xs text-slate-500">{t('rebuttalInputHelpText')}</p>
                <button
                    onClick={() => handleSubmitOtherUserCounterRebuttal(otherUserCounterRebuttalRaw)}
                    disabled={isLoading || !otherUserCounterRebuttalRaw.trim()}
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
                >
                    {isLoading ? t('submittingRebuttalButton') : t('submitRebuttalButton')}
                </button>
            </div>
        );
    case 'judgeUltimateFinalRulingDisplay':
        return <FinalAssessmentDisplay assessment={ultimateJudgeRuling} onStartNewFullAnalysis={handleStartNewProblemWithProfile} isLoading={isLoading} isUltimate={true} />;

      default:
        return <p>{t('unknownAppStage')} Current stage: {appStage}</p>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 text-slate-100">
      <Header />
      <main className="container mx-auto max-w-3xl w-full flex-grow flex flex-col items-center justify-center px-2 py-8 space-y-8">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
