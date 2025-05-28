
import React from 'react';
import type { ComprehensiveProfileData, Gender } from '../../types';
import { useTranslations } from '../../context/LanguageContext';


interface StepIntakeSummaryProps {
  profile: Omit<ComprehensiveProfileData, 'profileComplete'>; 
  onSubmit: () => void;
  onPrevious: () => void;
}

const DetailItem: React.FC<{ labelKey: string; value?: string | null }> = ({ labelKey, value }) => {
  const { t } = useTranslations();
  return (
      <p><span className="font-semibold text-purple-300">{t(labelKey)}:</span> <span className="text-slate-200">{value || t('notSpecified')}</span></p>
  );
};

const GenderDetailItem: React.FC<{ labelKey: string; value?: Gender | null }> = ({ labelKey, value }) => {
    const { t } = useTranslations();
    const genderLabel = value ? t(`gender.${value}`) : t('notSpecified');
    return (
        <p><span className="font-semibold text-purple-300">{t(labelKey)}:</span> <span className="text-slate-200">{genderLabel}</span></p>
    );
};


export const StepIntakeSummary: React.FC<StepIntakeSummaryProps> = ({ profile, onSubmit, onPrevious }) => {
  const { t } = useTranslations();
  const { userA, partnerB, homeRelationship } = profile;

  const getDisplayValue = (valueKey: string | undefined, prefix: string) => {
    if (!valueKey) return t('notSpecified');
    if (valueKey === 'other_wh_custom' || (valueKey && !valueKey.endsWith('_wh') && !valueKey.endsWith('_sl') && !valueKey.endsWith('_fs') && !valueKey.endsWith('_religion'))) { // Custom text
        return valueKey; // Show the custom text directly
    }
    return t(`${prefix}.${valueKey}`, { defaultValue: t('notSpecified') });
  };


  return (
    <div className="space-y-6">
      <div className="p-4 bg-slate-700/70 rounded-lg space-y-4 text-sm text-slate-300 max-h-[60vh] overflow-y-auto">
        
        <section className="mb-4">
          <h4 className="text-lg font-semibold text-pink-400 border-b border-pink-500/50 pb-1 mb-2">{t('intakeSummaryTitleUserA')}</h4>
          <DetailItem labelKey="intakeSummaryName" value={userA.name} />
          <GenderDetailItem labelKey="intakeSummaryGender" value={userA.gender} />
          <DetailItem labelKey="intakeSummaryAge" value={userA.age} />
          <DetailItem labelKey="intakeSummaryLocation" value={userA.city && userA.country ? `${userA.city}, ${userA.country}` : (userA.city || userA.country || t('notSpecified'))} />
          <DetailItem labelKey="intakeSummaryReligion" value={getDisplayValue(userA.religion, 'religion')} />
          <DetailItem labelKey="intakeSummaryOccupation" value={userA.occupation} />
          <DetailItem labelKey="intakeSummaryWorkHours" value={getDisplayValue(userA.workHours, 'workHours')} />
          <DetailItem labelKey="intakeSummaryStress" value={getDisplayValue(userA.stressLevel, 'stressLevel')} />
          <DetailItem labelKey="intakeSummaryFinancial" value={getDisplayValue(userA.financialSituation, 'financialSituation')} />
        </section>

        <section className="mb-4">
          <h4 className="text-lg font-semibold text-pink-400 border-b border-pink-500/50 pb-1 mb-2">{t('intakeSummaryTitlePartnerB')}</h4>
          <DetailItem labelKey="intakeSummaryName" value={partnerB.name} />
          <GenderDetailItem labelKey="intakeSummaryGender" value={partnerB.gender} />
          <DetailItem labelKey="intakeSummaryAge" value={partnerB.age} />
          <DetailItem labelKey="intakeSummaryLocation" value={partnerB.city && partnerB.country ? `${partnerB.city}, ${partnerB.country}` : (partnerB.city || partnerB.country || t('notSpecified'))} />
          <DetailItem labelKey="intakeSummaryReligion" value={getDisplayValue(partnerB.religion, 'religion')} />
          <DetailItem labelKey="intakeSummaryOccupation" value={partnerB.occupation} />
          <DetailItem labelKey="intakeSummaryWorkHours" value={getDisplayValue(partnerB.workHours, 'workHours')} />
          <DetailItem labelKey="intakeSummaryStress" value={getDisplayValue(partnerB.stressLevel, 'stressLevel')} />
          <DetailItem labelKey="intakeSummaryFinancial" value={getDisplayValue(partnerB.financialSituation, 'financialSituation')} />
        </section>

        <section>
          <h4 className="text-lg font-semibold text-pink-400 border-b border-pink-500/50 pb-1 mb-2">{t('intakeSummaryTitleHomeRel')}</h4>
          <DetailItem labelKey="intakeSummaryRelDuration" value={homeRelationship.duration} />
          <DetailItem labelKey="intakeSummaryHasChildren" value={homeRelationship.hasChildren ? t(`hasChildren.${homeRelationship.hasChildren.toLowerCase()}_hc`) : t('notSpecified')} />
          {homeRelationship.hasChildren === 'Yes' && <DetailItem labelKey="intakeSummaryChildrenDetails" value={homeRelationship.childrenDetails} />}
          <div className="mt-1">
             <span className="font-semibold text-purple-300">{t('intakeSummaryRecurringIssues')}:</span>
             <p className="text-slate-200 whitespace-pre-wrap mt-1">{homeRelationship.recurringIssues || t('notSpecified')}</p>
          </div>
        </section>
      </div>
       <p className="text-xs text-center text-slate-400">
        {t('intakeSummaryReviewPrompt')}
      </p>
      <div className="flex justify-between pt-4">
        <button type="button" onClick={onPrevious} className="px-6 py-3 border border-slate-500 text-base font-medium rounded-md text-slate-300 hover:bg-slate-700">{t('form_button_previous')}</button>
        <button type="button" onClick={onSubmit} className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700">{t('intakeSummarySaveButton')}</button>
      </div>
    </div>
  );
};
