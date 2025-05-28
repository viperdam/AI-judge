
import React from 'react';
import type { PartnerProfile } from '../../types';
import { FormSelect, FormInput } from './FormControls';
import { useTranslations } from '../../context/LanguageContext';

interface StepPartnerB_PersonalProps {
  data: PartnerProfile;
  setData: (data: PartnerProfile) => void;
  onNext: () => void;
  onPrevious: () => void;
}

// Use the same religion value keys as in StepUserA_Personal for consistency
const religionValueKeys = ['prefer_not_to_say', 'agnostic', 'atheist', 'bahai_faith', 'buddhism', 'christianity', 'hinduism', 'islam', 'jainism', 'judaism', 'shinto', 'sikhism', 'spiritual_but_not_religious', 'taoism', 'zoroastrianism', 'other'];


export const StepPartnerB_Personal: React.FC<StepPartnerB_PersonalProps> = ({ data, setData, onNext, onPrevious }) => {
  const { t } = useTranslations();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const canProceed = data.name.trim() !== '' && data.age.trim() !== '' && data.country.trim() !== '' && data.city.trim() !== '';

  const religionOptions = religionValueKeys.map(key => ({
    value: key,
    label: t(`religion.${key}`, { defaultValue: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })
  }));

  return (
    <div className="space-y-5">
      <FormInput label={t('form_partner_b_personal_name_label')} name="name" value={data.name} onChange={handleChange} placeholder={t('form_input_partner_name_placeholder')} />
      <FormInput label={t('form_partner_b_personal_age_label')} name="age" value={data.age} onChange={handleChange} placeholder={t('form_input_partner_age_placeholder')} />
      <FormInput label={t('form_partner_b_personal_country_label')} name="country" value={data.country} onChange={handleChange} placeholder={t('form_input_partner_country_placeholder')} />
      <FormInput label={t('form_partner_b_personal_city_label')} name="city" value={data.city} onChange={handleChange} placeholder={t('form_input_partner_city_placeholder')} />
      <FormSelect
        label={t('form_partner_b_personal_religion_label_optional')}
        name="religion"
        value={data.religion}
        onChange={handleChange}
        options={religionOptions}
        firstOption={{value: "", label: t('form_select_religion_default')}}
      />
      
      <div className="flex justify-between pt-4">
        <button type="button" onClick={onPrevious} className="px-6 py-3 border border-slate-500 text-base font-medium rounded-md text-slate-300 hover:bg-slate-700">{t('form_button_previous')}</button>
        <button type="button" onClick={onNext} disabled={!canProceed} className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50">{t('form_button_next')}</button>
      </div>
    </div>
  );
};