
import React, { useState, useEffect } from 'react';
import type { ComprehensiveProfileData, UserInfo, PartnerProfile, HomeRelationshipInfo, IntakeWizardStep } from '../../types';
import { useTranslations } from '../../context/LanguageContext';

import { StepUserA_Personal } from './StepUserA_Personal';
import { StepUserA_WorkLife } from './StepUserA_WorkLife';
import { StepPartnerB_Personal } from './StepPartnerB_Personal';
import { StepPartnerB_WorkLife } from './StepPartnerB_WorkLife';
import { StepHomeRelationshipInfo } from './StepHomeRelationshipInfo';
import { StepIntakeSummary } from './StepIntakeSummary';

interface ProfileIntakeWizardProps {
  onComplete: (data: ComprehensiveProfileData) => void;
  initialData?: ComprehensiveProfileData | null;
}

const initialUserAInfo: UserInfo = { name: '', gender: '', age: '', country: '', city: '', religion: '', occupation: '', workHours: '', stressLevel: '', financialSituation: '' };
const initialPartnerBInfo: PartnerProfile = { name: '', gender: '', age: '', country: '', city: '', religion: '', occupation: '', workHours: '', stressLevel: '', financialSituation: '' };
const initialHomeRelationshipInfo: HomeRelationshipInfo = { duration: '', recurringIssues: '', hasChildren: '', childrenDetails: '' };

export const ProfileIntakeWizard: React.FC<ProfileIntakeWizardProps> = ({ onComplete, initialData }) => {
  const { t } = useTranslations();
  const [currentStep, setCurrentStep] = useState<IntakeWizardStep>('userA_Personal');
  
  const [userA, setUserA] = useState<UserInfo>(initialData?.userA || initialUserAInfo);
  const [partnerB, setPartnerB] = useState<PartnerProfile>(initialData?.partnerB || initialPartnerBInfo);
  const [homeRelationship, setHomeRelationship] = useState<HomeRelationshipInfo>(initialData?.homeRelationship || initialHomeRelationshipInfo);

  useEffect(() => {
    if (initialData) {
      setUserA(initialData.userA || initialUserAInfo);
      setPartnerB(initialData.partnerB || initialPartnerBInfo);
      setHomeRelationship(initialData.homeRelationship || initialHomeRelationshipInfo);
      setCurrentStep('userA_Personal'); 
    }
  }, [initialData]);

  const handleNext = () => {
    switch (currentStep) {
      case 'userA_Personal': setCurrentStep('userA_WorkLife'); break;
      case 'userA_WorkLife': setCurrentStep('partnerB_Personal'); break;
      case 'partnerB_Personal': setCurrentStep('partnerB_WorkLife'); break;
      case 'partnerB_WorkLife': setCurrentStep('homeRelationshipInfo'); break;
      case 'homeRelationshipInfo': setCurrentStep('intakeSummary'); break;
    }
  };

  const handlePrevious = () => {
    switch (currentStep) {
      case 'intakeSummary': setCurrentStep('homeRelationshipInfo'); break;
      case 'homeRelationshipInfo': setCurrentStep('partnerB_WorkLife'); break;
      case 'partnerB_WorkLife': setCurrentStep('partnerB_Personal'); break;
      case 'partnerB_Personal': setCurrentStep('userA_WorkLife'); break;
      case 'userA_WorkLife': setCurrentStep('userA_Personal'); break;
    }
  };

  const handleSubmit = () => {
    const finalData: ComprehensiveProfileData = {
      userA,
      partnerB,
      homeRelationship,
      profileComplete: true,
    };
    onComplete(finalData);
  };
  
  const wizardTitle = initialData?.profileComplete ? t("editProfileWizardTitle") : t("profileIntakeWizardTitle");
  const wizardDescription = initialData?.profileComplete 
    ? t("editProfileWizardDescription")
    : t("profileIntakeWizardDescription");

  const stepTitles: Record<IntakeWizardStep, string> = {
    userA_Personal: t("stepUserAPersonal"),
    userA_WorkLife: t("stepUserAWorkLife"),
    partnerB_Personal: t("stepPartnerBPersonal"),
    partnerB_WorkLife: t("stepPartnerBWorkLife"),
    homeRelationshipInfo: t("stepHomeRelationship"),
    intakeSummary: t("stepIntakeSummary"),
  };

  const progressPercentage = {
    userA_Personal: 16,
    userA_WorkLife: 33,
    partnerB_Personal: 50,
    partnerB_WorkLife: 66,
    homeRelationshipInfo: 83,
    intakeSummary: 100,
  };


  return (
    <div className="w-full p-4 sm:p-6 bg-slate-800 rounded-xl shadow-2xl space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-pink-400">{wizardTitle}</h2>
        <p className="text-slate-400 mt-1 text-sm sm:text-base">{wizardDescription}</p>
      </div>

       <div className="w-full bg-slate-700 rounded-full h-2.5 mb-4">
        <div className="bg-pink-500 h-2.5 rounded-full" style={{ width: `${progressPercentage[currentStep]}%` }}></div>
      </div>
      <p className="text-center text-purple-300 font-semibold">{stepTitles[currentStep]}</p>

      {currentStep === 'userA_Personal' && <StepUserA_Personal data={userA} setData={setUserA} onNext={handleNext} />}
      {currentStep === 'userA_WorkLife' && <StepUserA_WorkLife data={userA} setData={setUserA} onNext={handleNext} onPrevious={handlePrevious} />}
      {currentStep === 'partnerB_Personal' && <StepPartnerB_Personal data={partnerB} setData={setPartnerB} onNext={handleNext} onPrevious={handlePrevious} />}
      {currentStep === 'partnerB_WorkLife' && <StepPartnerB_WorkLife data={partnerB} setData={setPartnerB} onNext={handleNext} onPrevious={handlePrevious} />}
      {currentStep === 'homeRelationshipInfo' && <StepHomeRelationshipInfo data={homeRelationship} setData={setHomeRelationship} onNext={handleNext} onPrevious={handlePrevious} />}
      {currentStep === 'intakeSummary' && <StepIntakeSummary profile={{ userA, partnerB, homeRelationship }} onSubmit={handleSubmit} onPrevious={handlePrevious} />}
    </div>
  );
};
