
import React from 'react';
import type { HomeRelationshipInfo } from '../../types';
import { FormSelect, FormInput, FormTextarea } from './FormControls';
import { useTranslations } from '../../context/LanguageContext';

interface StepHomeRelationshipInfoProps {
  data: HomeRelationshipInfo;
  setData: (data: HomeRelationshipInfo) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const StepHomeRelationshipInfo: React.FC<StepHomeRelationshipInfoProps> = ({ data, setData, onNext, onPrevious }) => {
  const { t } = useTranslations();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "hasChildren") {
        const valueTyped = value as 'Yes' | 'No' | ''; // Value from select will be 'Yes', 'No', or ''
        if (valueTyped === "No") {
            setData({ ...data, hasChildren: "No", childrenDetails: "N/A" });
        } else if (valueTyped === "Yes") {
            setData({ ...data, hasChildren: "Yes", childrenDetails: data.childrenDetails === "N/A" ? "" : data.childrenDetails });
        } else { // valueTyped is ''
             setData({ ...data, hasChildren: '' });
        }
    }
    else {
        setData({ ...data, [name]: value });
    }
  };
  
  const canProceed = data.duration.trim() !== '' && data.recurringIssues.trim() !== '' && data.hasChildren !== '';
  const showChildrenDetails = data.hasChildren === 'Yes'; // Corrected comparison

  // Options for the select. Values are 'Yes', 'No'. Labels use existing translation keys.
  const childrenOptions: Array<{ value: 'Yes' | 'No'; label: string }> = [
    { value: 'Yes', label: t('hasChildren.yes_hc') }, 
    { value: 'No', label: t('hasChildren.no_hc') },
  ];

  return (
    <div className="space-y-5">
      <FormInput label={t('form_home_rel_duration_label')} name="duration" value={data.duration} onChange={handleChange} placeholder={t('form_input_rel_duration_placeholder')} />
      
      <FormTextarea 
        label={t('form_home_rel_recurring_issues_label')}
        name="recurringIssues" 
        value={data.recurringIssues} 
        onChange={handleChange} 
        rows={4}
        placeholder={t('form_textarea_recurring_issues_placeholder')}
        helpText={t('form_textarea_recurring_issues_help')}
      />

      <FormSelect 
        label={t('form_home_rel_has_children_label')}
        name="hasChildren" 
        value={data.hasChildren} // This will be 'Yes', 'No', or ''
        onChange={handleChange} 
        options={childrenOptions} // Pass the corrected options
        firstOption={{value: "", label: t('form_select_has_children_default')}}
      />

      {showChildrenDetails && (
        <FormTextarea 
          label={t('form_home_rel_children_details_label_optional')}
          name="childrenDetails" 
          value={data.childrenDetails === "N/A" ? "" : data.childrenDetails} 
          onChange={handleChange} 
          rows={2}
          placeholder={t('form_textarea_children_details_placeholder')}
          helpText={t('form_textarea_children_details_help')}
        />
      )}
      
      <div className="flex justify-between pt-4">
        <button type="button" onClick={onPrevious} className="px-6 py-3 border border-slate-500 text-base font-medium rounded-md text-slate-300 hover:bg-slate-700">{t('form_button_previous')}</button>
        <button type="button" onClick={onNext} disabled={!canProceed} className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50">{t('form_button_next_to_summary')}</button>
      </div>
    </div>
  );
};
