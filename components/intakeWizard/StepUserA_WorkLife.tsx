
import React, {useState} from 'react';
import type { UserInfo } from '../../types';
import { FormSelect, FormInput } from './FormControls'; 
import { useTranslations } from '../../context/LanguageContext';
import { WORK_HOURS_KEYS_EXTENDED, STRESS_LEVEL_KEYS, FINANCIAL_SITUATION_KEYS } from '../../types';


interface StepUserA_WorkLifeProps {
  data: UserInfo;
  setData: (data: UserInfo) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const StepUserA_WorkLife: React.FC<StepUserA_WorkLifeProps> = ({ data, setData, onNext, onPrevious }) => {
  const { t } = useTranslations();
  const [showOtherWorkHours, setShowOtherWorkHours] = useState(
    data.workHours === "other_wh_custom" || (data.workHours !== '' && !WORK_HOURS_KEYS_EXTENDED.includes(data.workHours as any))
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "workHours") {
      if (value === "other_wh") { 
        setShowOtherWorkHours(true);
        setData({ ...data, workHours: "other_wh_custom" }); 
      } else {
        setShowOtherWorkHours(false);
        setData({ ...data, workHours: value });
      }
    } else {
      setData({ ...data, [name]: value });
    }
  };
  
  const handleWorkHoursTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setData({ ...data, workHours: e.target.value }); 
  }

  const canProceed = data.occupation.trim() !== '' && data.workHours.trim() !== '' && data.stressLevel.trim() !== '' && data.financialSituation.trim() !== '';

  const mapKeysToOptions = (keys: readonly string[], prefix: string) => {
    return keys.map(key => ({
        value: key,
        label: t(`${prefix}.${key}`)
    }));
  }

  const workHoursOptions = mapKeysToOptions(WORK_HOURS_KEYS_EXTENDED, 'workHours');
  const stressLevelOptions = mapKeysToOptions(STRESS_LEVEL_KEYS, 'stressLevel');
  const financialSituationOptions = mapKeysToOptions(FINANCIAL_SITUATION_KEYS, 'financialSituation');

  let workHoursSelectValue = data.workHours;
  if (showOtherWorkHours && data.workHours !== "other_wh_custom" && data.workHours !== '') { 
    workHoursSelectValue = "other_wh";
  } else if (showOtherWorkHours && data.workHours === "other_wh_custom") {
     workHoursSelectValue = "other_wh"; 
  }


  return (
    <div className="space-y-5">
      <FormInput label={t('form_user_a_work_occupation_label')} name="occupation" value={data.occupation} onChange={handleChange} placeholder={t('form_input_occupation_placeholder')} />
      
      <FormSelect 
        label={t('form_user_a_work_hours_label')} 
        name="workHours" 
        value={workHoursSelectValue} 
        onChange={handleChange} 
        options={workHoursOptions} 
        firstOption={{value: "", label: t('form_select_work_hours_default')}} 
      />
      {showOtherWorkHours && (
        <FormInput 
            label={t('form_user_a_work_hours_other_label')} 
            name="workHoursCustomInput" 
            value={data.workHours === "other_wh_custom" ? "" : data.workHours} 
            onChange={handleWorkHoursTextChange} 
            placeholder={t('form_input_other_work_hours_placeholder')} 
        />
      )}

      <FormSelect 
        label={t('form_user_a_work_stress_label')}
        name="stressLevel" 
        value={data.stressLevel} 
        onChange={handleChange} 
        options={stressLevelOptions} 
        firstOption={{value: "", label: t('form_select_stress_default')}} 
      />
      <FormSelect 
        label={t('form_user_a_work_financial_label')} 
        name="financialSituation" 
        value={data.financialSituation} 
        onChange={handleChange} 
        options={financialSituationOptions} 
        firstOption={{value: "", label: t('form_select_financial_default')}}
      />
      
      <div className="flex justify-between pt-4">
        <button type="button" onClick={onPrevious} className="px-6 py-3 border border-slate-500 text-base font-medium rounded-md text-slate-300 hover:bg-slate-700">{t('form_button_previous')}</button>
        <button type="button" onClick={onNext} disabled={!canProceed} className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50">{t('form_button_next')}</button>
      </div>
    </div>
  );
};
