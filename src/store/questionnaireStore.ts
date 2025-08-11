import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuestionnaireStep, UserStatus } from '../utils/api';

interface QuestionnaireState {
  steps: QuestionnaireStep[];
  formData: Record<string, any>;
  currentStep: number;
  guestToken: string | null;
  userStatus: UserStatus | null;
  isLoading: boolean;
  
  // Actions
  setSteps: (steps: QuestionnaireStep[]) => void;
  setFormData: (data: Record<string, any>) => void;
  updateFormData: (key: string, value: any) => void;
  setCurrentStep: (step: number) => void;
  setGuestToken: (token: string) => void;
  setUserStatus: (status: UserStatus) => void;
  setLoading: (loading: boolean) => void;
  resetForm: () => void;
}

export const useQuestionnaireStore = create<QuestionnaireState>()(
  persist(
    (set, get) => ({
      steps: [],
      formData: {},
      currentStep: 0,
      guestToken: localStorage.getItem('guestToken'),
      userStatus: null,
      isLoading: false,

      // Actions
      setSteps: (steps) => set({ steps }),
      
      setFormData: (data) => set({ formData: data }),
      
      updateFormData: (key, value) =>
        set((state) => ({
          formData: { ...state.formData, [key]: value },
        })),
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      setGuestToken: (token) => {
        localStorage.setItem('guestToken', token);
        set({ guestToken: token });
      },
      
      setUserStatus: (status) => {
        set({ userStatus: status });
        // If we get a guest token from the API, store it
        if (status.guest_token && !get().guestToken) {
          get().setGuestToken(status.guest_token);
        }
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      resetForm: () => set({ 
        formData: {}, 
        currentStep: 0 
      }),
    }),
    {
      name: 'questionnaire-storage',
      partialize: (state) => ({ 
        formData: state.formData, 
        currentStep: state.currentStep,
        guestToken: state.guestToken 
      }),
    }
  )
);

// Selectors for easier access
export const useCurrentStep = () => {
  const steps = useQuestionnaireStore(state => state.steps);
  const currentStep = useQuestionnaireStore(state => state.currentStep);
  
  return steps.find(step => step.step_number === currentStep + 1) || null;
};

export const useFormProgress = () => {
  const steps = useQuestionnaireStore(state => state.steps);
  const formData = useQuestionnaireStore(state => state.formData);
  const currentStep = useQuestionnaireStore(state => state.currentStep);
  
  const currentStepData = steps.find(step => step.step_number === currentStep + 1);
  
  let isValid = false;
  if (currentStepData) {
    // Check if all required questions in current step are answered
    isValid = currentStepData.questions.every(question => {
      if (!question.is_required) return true;
      const value = formData[question.question_key];
      
      if (question.question_type === 'checkbox') {
        return Array.isArray(value) && value.length > 0;
      }
      
      return value !== undefined && value !== null && value !== '';
    });
  }
  
  return {
    current: currentStep,
    total: steps.length,
    isValid,
  };
};