
import React from 'react';
import type { UserInfo, Gender } from '../../types';
import { FormSelect, FormInput } from './FormControls';
import { useTranslations } from '../../context/LanguageContext';
import { RELIGION_VALUE_KEYS, GENDER_KEYS } from '../../types';

interface StepUserA_PersonalProps {
  data: UserInfo;
  setData: (data: UserInfo) => void;
  onNext: () => void;
}

export const StepUserA_Personal: React.FC<StepUserA_PersonalProps> = ({ data, setData, onNext }) => {
  const { t } = useTranslations();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "gender") {
        setData({ ...data, gender: value as Gender });
    } else {
        setData({ ...data, [name]: value });
    }
  };

  const canProceed = data.name.trim() !== '' && data.age.trim() !== '' && data.country.trim() !== '' && data.city.trim() !== '' && data.gender !== '';

  const religionOptions = RELIGION_VALUE_KEYS.map(key => ({
    value: key,
    label: t(`religion.${key}`, { defaultValue: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })
  }));

  const genderOptions = GENDER_KEYS.map(key => ({
    value: key,
    label: t(`gender.${key}`, { defaultValue: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })
  }));

  return (
    <div className="space-y-5">
      <FormInput 
        label={t('form_user_a_personal_name_label')} 
        name="name" 
        value={data.name} 
        onChange={handleChange} 
        placeholder={t('form_input_user_a_name_placeholder')} 
        type="text" 
      />
      <FormSelect
        label={t('form_user_a_personal_gender_label')}
        name="gender"
        value={data.gender}
        onChange={handleChange}
        options={genderOptions}
        firstOption={{ value: "", label: t('form_select_gender_default') }}
      />
      <FormInput 
        label={t('form_user_a_personal_age_label')} 
        name="age" 
        value={data.age} 
        onChange={handleChange} 
        placeholder={t('form_input_age_placeholder')} 
        type="text" 
      />
      <FormInput 
        label={t('form_user_a_personal_country_label')} 
        name="country" 
        value={data.country} 
        onChange={handleChange} 
        placeholder={t('form_input_country_placeholder')} 
      />
      <FormInput 
        label={t('form_user_a_personal_city_label')} 
        name="city" 
        value={data.city} 
        onChange={handleChange} 
        placeholder={t('form_input_city_placeholder')} 
      />
      <FormSelect
        label={t('form_user_a_personal_religion_label_optional')}
        name="religion"
        value={data.religion}
        onChange={handleChange}
        options={religionOptions}
        firstOption={{ value: "", label: t('form_select_religion_default') }}
      />
      
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('form_button_next')}
        </button>
      </div>
    </div>
  );
};
