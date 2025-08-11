import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestionnaireStore } from '../store/questionnaireStore';
import { useAuthStore, useAuthStatus } from '../store/authStore';
import { useStudyAbroadAPI, useAdManagement } from '../hooks/useStudyAbroadAPI';
import AdModal from '../components/AdModal';
import Loader from '../components/Loader';
import { CheckCircle, Edit3, User, Mail, MapPin, GraduationCap, DollarSign, Globe } from 'lucide-react';

const Review: React.FC = () => {
  const navigate = useNavigate();
  const { steps, formData, setCurrentStep } = useQuestionnaireStore();
  const { user } = useAuthStore();
  const { isAuthenticated, hasCredits, freeAttemptsRemaining, userType } = useAuthStatus();

  const { submitQuestionnaire, isLoading, error, clearError } = useStudyAbroadAPI();
  const {
    adData,
    showAd,
    adCompleted,
    timeRemaining,
    startAdFlow,
    completeAd,
    closeAd,
  } = useAdManagement();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get a summary of user's answers organized by step
  const getAnswersSummary = () => {
    const summary: Array<{
      stepTitle: string;
      answers: Array<{ question: string; answer: string | string[] }>;
    }> = [];

    steps.forEach((step) => {
      const stepAnswers: Array<{ question: string; answer: string | string[] }> = [];
      
      step.questions.forEach((question) => {
        const answer = formData[question.question_key];
        if (answer !== undefined && answer !== '' && answer !== null) {
          let displayAnswer: string | string[];
          
          if (question.question_type === 'select' || question.question_type === 'radio') {
            // Find the label for the selected value
            const selectedOption = question.options?.find(opt => opt.value === answer);
            displayAnswer = selectedOption ? selectedOption.label : answer;
          } else if (question.question_type === 'checkbox' && Array.isArray(answer)) {
            // Find labels for selected values
            displayAnswer = answer.map(val => {
              const option = question.options?.find(opt => opt.value === val);
              return option ? option.label : val;
            });
          } else {
            displayAnswer = answer.toString();
          }
          
          stepAnswers.push({
            question: question.question_text,
            answer: displayAnswer,
          });
        }
      });

      if (stepAnswers.length > 0) {
        summary.push({
          stepTitle: step.title,
          answers: stepAnswers,
        });
      }
    });

    return summary;
  };

  const handleEditStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    navigate('/questionnaire');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    clearError();

    try {
      const result = await submitQuestionnaire();
      if (result) {
        // Direct access - got recommendations
        navigate('/results');
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'Ad viewing required') {
          // Start ad flow
          await startAdFlow();
        } else if (err.message === 'Purchase credits required') {
          // Redirect to pricing
          navigate('/pricing');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdComplete = async () => {
    try {
      await completeAd();
      closeAd();
      // Now get recommendations
      navigate('/results');
    } catch (err) {
      console.error('Error completing ad:', err);
    }
  };

  const answersSummary = getAnswersSummary();

  const getIcon = (stepTitle: string) => {
    const title = stepTitle.toLowerCase();
    if (title.includes('personal')) return <User className="h-5 w-5" />;
    if (title.includes('education')) return <GraduationCap className="h-5 w-5" />;
    if (title.includes('location') || title.includes('country')) return <MapPin className="h-5 w-5" />;
    if (title.includes('financial') || title.includes('budget')) return <DollarSign className="h-5 w-5" />;
    if (title.includes('preference')) return <Globe className="h-5 w-5" />;
    return <CheckCircle className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Review Your Information</h1>
          <p className="text-gray-600 mb-6">
            Please review your answers below. You can edit any section if needed.
          </p>

          {/* User Status Display */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isAuthenticated ? (
                  <>
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Signed in as {user?.email}</p>
                      <p className="text-sm text-blue-700">
                        {hasCredits ? `${hasCredits} credits remaining` : 'No credits remaining'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Guest User</p>
                      <p className="text-sm text-blue-700">
                        {freeAttemptsRemaining > 0 
                          ? `${freeAttemptsRemaining} free attempts remaining`
                          : 'No free attempts remaining - watch an ad to continue'
                        }
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/pricing')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Sign In for Credits
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Answers Summary */}
        <div className="space-y-6 mb-8">
          {answersSummary.map((step, stepIndex) => (
            <div key={stepIndex} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-600">
                      {getIcon(step.stepTitle)}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{step.stepTitle}</h3>
                  </div>
                  <button
                    onClick={() => handleEditStep(stepIndex)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {step.answers.map((answer, answerIndex) => (
                    <div key={answerIndex} className="border-l-2 border-blue-200 pl-4">
                      <p className="font-medium text-gray-900 mb-1">{answer.question}</p>
                      <div className="text-gray-700">
                        {Array.isArray(answer.answer) ? (
                          <ul className="list-disc list-inside space-y-1">
                            {answer.answer.map((item, itemIndex) => (
                              <li key={itemIndex}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>{answer.answer}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Ready to Get Your Recommendations?
            </h3>
            <p className="text-gray-600 mb-6">
              Based on your answers, we'll provide personalized study abroad recommendations 
              tailored specifically for you.
            </p>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
            >
              {isSubmitting || isLoading ? (
                <Loader message="Processing..." />
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Get My Recommendations</span>
                </>
              )}
            </button>

            <p className="text-sm text-gray-500 mt-4">
              {userType === 'guest' && freeAttemptsRemaining === 0 && (
                'You\'ll need to watch a short advertisement to continue.'
              )}
              {userType === 'authenticated' && !hasCredits && (
                'You\'ll need to purchase credits to get recommendations.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Ad Modal */}
      {showAd && adData && (
        <AdModal
          isOpen={showAd}
          onClose={closeAd}
          adData={adData}
          onComplete={handleAdComplete}
        />
      )}
    </div>
  );
};

export default Review;
      navigate('/results');
    } catch (err) {
      setError('Failed to confirm ad completion. Please try again.');
      console.error('Error confirming ad completion:', err);
    }
    setShowAdModal(false);
  };

  const getAnswerDisplay = (questionId: string, answer: any) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return String(answer);

    if (Array.isArray(answer)) {
      return answer.join(', ');
    }

    return String(answer);
  };

  const answeredQuestions = questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">Review Your Answers</h1>
            <p className="text-blue-100">
              Please review your responses before getting your personalized recommendations.
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {answeredQuestions.map((question) => (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {question.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <p className="text-gray-700">
                          {getAnswerDisplay(question.id, answers[question.id])}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/questionnaire')}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors ml-4"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span className="text-sm">Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/questionnaire')}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Back to Questions
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || answeredQuestions.length === 0}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Get My Recommendations'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAdModal && adData && (
        <AdModal
          isOpen={showAdModal}
          onClose={() => setShowAdModal(false)}
          adData={adData}
          onComplete={handleAdComplete}
        />
      )}
    </div>
  );
};

export default Review;