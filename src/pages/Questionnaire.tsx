import React, { useEffect } from 'react';
import { Formik, Form } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useQuestionnaireStore, useFormProgress, useCurrentStep } from '../store/questionnaireStore';
import { useStudyAbroadAPI } from '../hooks/useStudyAbroadAPI';
import FormStep from '../components/FormStep';
import Loader from '../components/Loader';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as Yup from 'yup';

const Questionnaire: React.FC = () => {
  const navigate = useNavigate();
  const {
    steps,
    formData,
    currentStep,
    setCurrentStep,
    updateFormData,
    isLoading: storeLoading
  } = useQuestionnaireStore();

  const { current, total } = useFormProgress();
  const { initializeApp, isLoading, error } = useStudyAbroadAPI();

  useEffect(() => {
    if (steps.length === 0) {
      initializeApp();
    }
  }, [initializeApp, steps.length]);

  const currentStepData = useCurrentStep();
  const isLastStep = currentStep === steps.length - 1;

  // Generate validation schema for current step
  const getValidationSchema = () => {
    if (!currentStepData) return Yup.object({});

    const schemaFields: Record<string, any> = {};

    currentStepData.questions.forEach((question) => {
      if (question.is_required) {
        switch (question.question_type) {
          case 'text':
          case 'select':
          case 'radio':
            schemaFields[question.question_key] = Yup.string().required(`${question.question_text} is required`);
            break;
          case 'number':
          case 'range':
            schemaFields[question.question_key] = Yup.number().required(`${question.question_text} is required`);
            break;
          case 'checkbox':
            schemaFields[question.question_key] = Yup.array().min(1, `Please select at least one option for ${question.question_text}`);
            break;
        }
      }
    });

    return Yup.object(schemaFields);
  };

  const handleNext = async (values: any) => {
    try {
      // Save current step answers
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== '') {
          updateFormData(key, values[key]);
        }
      });

      if (isLastStep) {
        navigate('/review');
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (err) {
      console.error('Error proceeding to next step:', err);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Get initial values for the current step
  const getInitialValues = () => {
    if (!currentStepData) return {};

    const values: Record<string, any> = {};
    currentStepData.questions.forEach((question) => {
      values[question.question_key] = formData[question.question_key] || 
        (question.question_type === 'checkbox' ? [] : '');
    });
    return values;
  };

  if (isLoading || storeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader message="Loading questionnaire..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-lg font-medium mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentStepData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-600 mb-4">No questions available</div>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const validationSchema = getValidationSchema();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {current + 1} of {total}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(((current + 1) / total) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((current + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentStepData.title}</h1>
          <p className="text-gray-600">{currentStepData.description}</p>
        </div>

        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          onSubmit={handleNext}
          enableReinitialize
        >
          {({ values, isValid, setFieldValue }) => (
            <Form>
              <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
                {currentStepData.questions.map((question) => (
                  <FormStep 
                    key={question.question_key} 
                    question={question} 
                    values={values}
                    setFieldValue={setFieldValue}
                  />
                ))}
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentStep === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="submit"
                  disabled={!isValid}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    isValid
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>{isLastStep ? 'Review Answers' : 'Next'}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Questionnaire;