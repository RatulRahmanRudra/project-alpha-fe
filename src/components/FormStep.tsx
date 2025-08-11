import React from 'react';
import { Field, ErrorMessage } from 'formik';
import { Question } from '../utils/api';

interface FormStepProps {
  question: Question;
  values: any;
  setFieldValue: (field: string, value: any) => void;
}

const FormStep: React.FC<FormStepProps> = ({ question, values, setFieldValue }) => {
  const renderField = () => {
    switch (question.question_type) {
      case 'text':
        return (
          <Field
            name={question.question_key}
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={question.placeholder || "Enter your answer..."}
          />
        );

      case 'number':
        return (
          <Field
            name={question.question_key}
            type="number"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={question.placeholder || "Enter a number..."}
          />
        );

      case 'select':
        return (
          <Field
            as="select"
            name={question.question_key}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">
              {question.placeholder || "Choose an option..."}
            </option>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Field>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <Field
                  type="radio"
                  name={question.question_key}
                  value={option.value}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <Field
                  type="checkbox"
                  name={question.question_key}
                  value={option.value}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const currentValues = values[question.question_key] || [];
                    if (e.target.checked) {
                      setFieldValue(question.question_key, [...currentValues, option.value]);
                    } else {
                      setFieldValue(question.question_key, currentValues.filter((v: string) => v !== option.value));
                    }
                  }}
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'range':
        return (
          <div className="space-y-4">
            <Field
              name={question.question_key}
              type="range"
              min={0}
              max={100}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFieldValue(question.question_key, parseInt(e.target.value));
              }}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>0</span>
              <span className="font-medium">{values[question.question_key] || 0}</span>
              <span>100</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-lg font-medium text-gray-900 mb-2">
          {question.question_text}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {question.help_text && (
          <p className="text-sm text-gray-500 mb-3">{question.help_text}</p>
        )}
        
        <div className="mb-4">
          {renderField()}
        </div>
        
        <ErrorMessage
          name={question.question_key}
          component="div"
          className="text-red-500 text-sm mt-1"
        />
      </div>
    </div>
  );
};

export default FormStep;