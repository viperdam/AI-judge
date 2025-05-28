
import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  helpText?: string;
}

export const FormInput: React.FC<FormInputProps> = ({ label, name, helpText, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
    <input
      id={name}
      name={name}
      {...props}
      className="mt-1 block w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-slate-100 placeholder-slate-500"
    />
    {helpText && <p className="mt-1 text-xs text-slate-400">{helpText}</p>}
  </div>
);

interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  options: FormSelectOption[];
  firstOption?: FormSelectOption; 
  helpText?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({ label, name, options, firstOption, helpText, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
    <select
      id={name}
      name={name}
      {...props}
      className="mt-1 block w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-slate-100"
    >
      {firstOption && <option value={firstOption.value}>{firstOption.label}</option>}
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    {helpText && <p className="mt-1 text-xs text-slate-400">{helpText}</p>}
  </div>
);

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  helpText?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({ label, name, helpText, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
    <textarea
      id={name}
      name={name}
      {...props}
      className="mt-1 block w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-slate-100 placeholder-slate-500"
    />
    {helpText && <p className="mt-1 text-xs text-slate-400">{helpText}</p>}
  </div>
);