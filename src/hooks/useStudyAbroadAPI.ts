import { useState, useCallback } from 'react';
import { 
  apiClient, 
  handleAPIError, 
  AccessCheckResponse,
  Advertisement,
  RecommendationsResponse,
  PricingPlan
} from '../utils/api';
import { useQuestionnaireStore } from '../store/questionnaireStore';
import { useAuthStore } from '../store/authStore';

export const useStudyAbroadAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    setSteps,
    setUserStatus,
    guestToken,
    setGuestToken,
    formData
  } = useQuestionnaireStore();
  
  const { refreshUserStatus } = useAuthStore();

  // Initialize the application
  const initializeApp = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch questionnaire and user status in parallel
      const [questionnaireData, userStatusData] = await Promise.all([
        apiClient.getQuestionnaire(),
        apiClient.getUserStatus(guestToken || undefined)
      ]);
      
      setSteps(questionnaireData.steps);
      setUserStatus(userStatusData);
      
      // Store guest token if received
      if (userStatusData.guest_token && !guestToken) {
        setGuestToken(userStatusData.guest_token);
      }
      
    } catch (err) {
      const errorMessage = handleAPIError(err);
      if (typeof errorMessage === 'string') {
        setError(errorMessage);
      } else {
        setError('Failed to initialize application');
      }
    } finally {
      setIsLoading(false);
    }
  }, [guestToken, setSteps, setUserStatus, setGuestToken]);

  // Check if user can access recommendations
  const checkAccess = useCallback(async (): Promise<AccessCheckResponse> => {
    try {
      setError(null);
      const profileData = formData;
      const response = await apiClient.checkAccess(guestToken, profileData);
      return response;
    } catch (err) {
      const errorResult = handleAPIError(err);
      if (typeof errorResult === 'object' && 'requiresAd' in errorResult) {
        // Convert error result to access response
        return {
          access: errorResult.requiresAd ? 'ad_required' : 'denied',
          reason: errorResult.requiresAd ? 'Ad viewing required' : 'Insufficient credits'
        };
      }
      throw new Error(typeof errorResult === 'string' ? errorResult : 'Access check failed');
    }
  }, [guestToken, formData]);

  // Get advertisement
  const getAdvertisement = useCallback(async (): Promise<Advertisement> => {
    try {
      setError(null);
      return await apiClient.getAd();
    } catch (err) {
      const errorMessage = handleAPIError(err);
      throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to load advertisement');
    }
  }, []);

  // Complete ad watching
  const completeAdWatching = useCallback(async (): Promise<void> => {
    if (!guestToken) {
      throw new Error('Guest token required for ad completion');
    }
    
    try {
      setError(null);
      await apiClient.completeAd(guestToken);
      // Refresh user status after ad completion
      await refreshUserStatus();
    } catch (err) {
      const errorMessage = handleAPIError(err);
      throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to complete ad watching');
    }
  }, [guestToken, refreshUserStatus]);

  // Get recommendations
  const getRecommendations = useCallback(async (): Promise<RecommendationsResponse> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const profileData = formData;
      const response = await apiClient.getRecommendations(guestToken, profileData);
      
      // Refresh user status after getting recommendations (credits may have changed)
      await refreshUserStatus();
      
      return response;
    } catch (err) {
      const errorResult = handleAPIError(err);
      if (typeof errorResult === 'object') {
        // Handle special cases like ad required or payment required
        if ('requiresAd' in errorResult && errorResult.requiresAd) {
          throw new Error('Ad viewing required');
        }
        if ('requiresPayment' in errorResult && errorResult.requiresPayment) {
          throw new Error('Insufficient credits');
        }
      }
      throw new Error(typeof errorResult === 'string' ? errorResult : 'Failed to get recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [guestToken, formData, refreshUserStatus]);

  // Get pricing plans
  const getPricingPlans = useCallback(async (): Promise<PricingPlan[]> => {
    try {
      setError(null);
      return await apiClient.getPricing();
    } catch (err) {
      const errorMessage = handleAPIError(err);
      throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to load pricing plans');
    }
  }, []);

  // Complete workflow for getting recommendations
  const submitQuestionnaire = useCallback(async (): Promise<RecommendationsResponse | null> => {
    try {
      setError(null);
      setIsLoading(true);

      // First check access
      const accessResult = await checkAccess();
      
      if (accessResult.access === 'granted') {
        // Direct access - get recommendations
        return await getRecommendations();
      } else if (accessResult.access === 'ad_required') {
        // Need to watch ad first
        throw new Error('Ad viewing required');
      } else if (accessResult.access === 'denied') {
        // No access - need to purchase credits
        throw new Error('Purchase credits required');
      }
      
      return null;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      }
      const errorMessage = 'Failed to submit questionnaire';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [checkAccess, getRecommendations]);

  // Handle the complete ad flow
  const handleAdFlow = useCallback(async (): Promise<RecommendationsResponse> => {
    try {
      setError(null);
      setIsLoading(true);

      // Get ad data
      const adData = await getAdvertisement();
      
      // Return ad data for display, actual completion handled separately
      return new Promise((resolve, reject) => {
        // This would be called by the ad component after display
        (window as any).__completeAdFlow = async () => {
          try {
            await completeAdWatching();
            const recommendations = await getRecommendations();
            resolve(recommendations);
          } catch (error) {
            reject(error);
          }
        };
        
        // Store ad data for component access
        (window as any).__currentAd = adData;
      });
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  }, [getAdvertisement, completeAdWatching, getRecommendations]);

  // Clear errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    
    // Actions
    initializeApp,
    checkAccess,
    getAdvertisement,
    completeAdWatching,
    getRecommendations,
    getPricingPlans,
    submitQuestionnaire,
    handleAdFlow,
    clearError,
  };
};

// Hook for ad management
export const useAdManagement = () => {
  const [adData, setAdData] = useState<Advertisement | null>(null);
  const [showAd, setShowAd] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const { getAdvertisement, completeAdWatching } = useStudyAbroadAPI();

  const startAdFlow = useCallback(async () => {
    try {
      const ad = await getAdvertisement();
      setAdData(ad);
      setShowAd(true);
      setTimeRemaining(ad.display_seconds);
      setAdCompleted(false);

      // Start countdown
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setAdCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error starting ad flow:', error);
      throw error;
    }
  }, [getAdvertisement]);

  const completeAd = useCallback(async () => {
    if (!adCompleted) {
      throw new Error('Ad not fully watched yet');
    }
    
    try {
      await completeAdWatching();
      setShowAd(false);
      setAdData(null);
      return true;
    } catch (error) {
      console.error('Error completing ad:', error);
      throw error;
    }
  }, [adCompleted, completeAdWatching]);

  const closeAd = useCallback(() => {
    if (adCompleted) {
      setShowAd(false);
      setAdData(null);
    }
  }, [adCompleted]);

  return {
    adData,
    showAd,
    adCompleted,
    timeRemaining,
    startAdFlow,
    completeAd,
    closeAd,
  };
};
