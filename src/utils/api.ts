import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication headers and handle errors
api.interceptors.request.use((config) => {
  const googleIdToken = localStorage.getItem('googleIdToken');
  
  if (googleIdToken) {
    config.headers.Authorization = `Bearer ${googleIdToken}`;
  }
  
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear tokens and redirect to login
      localStorage.removeItem('googleIdToken');
      localStorage.removeItem('guestToken');
      // Could dispatch a logout action here
    }
    return Promise.reject(error);
  }
);

// Types based on the API documentation
export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  question_key: string;
  question_text: string;
  question_type: 'text' | 'select' | 'radio' | 'checkbox' | 'number' | 'range';
  is_required: boolean;
  placeholder: string;
  help_text: string;
  options: QuestionOption[];
}

export interface QuestionnaireStep {
  step_number: number;
  title: string;
  description: string;
  questions: Question[];
}

export interface UserStatus {
  user_type: 'authenticated' | 'guest';
  credits?: number;
  email?: string;
  free_attempts_remaining?: number;
  guest_token?: string;
}

export interface AccessCheckResponse {
  access: 'granted' | 'ad_required' | 'denied';
  reason?: string;
}

export interface Advertisement {
  id: number;
  headline: string;
  image_url: string;
  cta_text: string;
  cta_url: string;
  display_seconds: number;
}

export interface University {
  name: string;
  program: string;
  tuition: number;
  scholarship: boolean;
  reasoning: string[];
}

export interface CountryRecommendation {
  name: string;
  reason: string;
  universities: University[];
}

export interface RecommendationsResponse {
  countries: CountryRecommendation[];
}

export interface PricingPlan {
  id: number;
  name: string;
  credits: number;
  price: string;
  description: string;
}

// API client with proper typing
export const apiClient = {
  // Get questionnaire
  getQuestionnaire: async (): Promise<{ steps: QuestionnaireStep[] }> => {
    const response = await api.get('/questionnaire/');
    return response.data;
  },

  // Get user status
  getUserStatus: async (guestToken?: string): Promise<UserStatus> => {
    const url = guestToken ? `/user-status/?guest_token=${guestToken}` : '/user-status/';
    const response = await api.get(url);
    return response.data;
  },

  // Check access permission
  checkAccess: async (guestToken: string | null, profileData: Record<string, any>): Promise<AccessCheckResponse> => {
    const response = await api.post('/check-access/', {
      guest_token: guestToken,
      profile_data: profileData,
    });
    return response.data;
  },

  // Get advertisement
  getAd: async (): Promise<Advertisement> => {
    const response = await api.get('/ad/');
    return response.data;
  },

  // Complete ad watching
  completeAd: async (guestToken: string): Promise<{ status: string }> => {
    const response = await api.post('/ad-complete/', {
      guest_token: guestToken,
    });
    return response.data;
  },

  // Get recommendations
  getRecommendations: async (
    guestToken: string | null, 
    profileData: Record<string, any>
  ): Promise<RecommendationsResponse> => {
    const response = await api.post('/recommendations/', {
      guest_token: guestToken,
      profile_data: profileData,
    });
    return response.data;
  },

  // Get pricing plans
  getPricing: async (): Promise<PricingPlan[]> => {
    const response = await api.get('/pricing/');
    return response.data;
  },
};

// Helper function for error handling
export const handleAPIError = (error: any) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        throw new Error(`Validation Error: ${data.error}`);
      case 401:
        throw new Error('Authentication required');
      case 402:
        if (data.error === 'Ad viewing required') {
          return { requiresAd: true };
        } else if (data.error === 'Insufficient credits') {
          return { requiresPayment: true };
        }
        throw new Error(data.error);
      case 404:
        throw new Error('Resource not found');
      default:
        throw new Error(data.error || 'An unexpected error occurred');
    }
  } else if (error.request) {
    throw new Error('Network error - please check your connection');
  } else {
    throw new Error('An unexpected error occurred');
  }
};

export default api;