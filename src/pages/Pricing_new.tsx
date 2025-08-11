import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useAuthStatus } from '../store/authStore';
import { useStudyAbroadAPI } from '../hooks/useStudyAbroadAPI';
import { PricingPlan } from '../utils/api';
import PricingCard from '../components/PricingCard';
import Loader from '../components/Loader';
import { ArrowLeft, CreditCard, Users, Star, CheckCircle } from 'lucide-react';

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuthStore();
  const { isAuthenticated, credits } = useAuthStatus();
  const { getPricingPlans, isLoading: apiLoading, error: apiError } = useStudyAbroadAPI();

  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const loadPricing = async () => {
      try {
        setIsLoading(true);
        const pricingPlans = await getPricingPlans();
        setPlans(pricingPlans);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pricing information.');
        console.error('Error loading pricing:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPricing();
  }, [getPricingPlans]);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in error:', err);
      alert('Failed to sign in. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handlePurchase = (planId: number) => {
    if (!isAuthenticated) {
      alert('Please sign in to purchase a plan.');
      return;
    }

    // This would typically integrate with Stripe or another payment processor
    console.log(`Starting purchase flow for plan ${planId}`);
    
    // Mock purchase flow - in a real app, this would redirect to payment processor
    alert(`Purchase flow for plan ${planId} would be implemented here with Stripe/PayPal integration.`);
  };

  const getMostPopularPlanIndex = () => {
    // Typically the middle plan or the one with best value
    return plans.length > 1 ? 1 : 0;
  };

  if (isLoading || apiLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader message="Loading pricing plans..." />
      </div>
    );
  }

  if (error || apiError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-lg font-medium mb-4">{error || apiError}</div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-4 top-8 flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Study Abroad Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get personalized university recommendations tailored to your academic profile, 
            preferences, and goals. Start your journey to studying abroad today.
          </p>

          {/* Current User Status */}
          {isAuthenticated && (
            <div className="bg-blue-50 rounded-lg p-4 mb-8 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="text-blue-900 font-medium">
                  Signed in as {user?.email}
                </span>
              </div>
              {credits && (
                <p className="text-blue-700 text-sm mt-1">
                  You currently have {credits} credits remaining
                </p>
              )}
            </div>
          )}

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Matches</h3>
              <p className="text-gray-600">AI-powered recommendations based on your academic profile and preferences</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Guidance</h3>
              <p className="text-gray-600">Recommendations from education consultants with years of experience</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Scholarship Opportunities</h3>
              <p className="text-gray-600">Discover available scholarships and funding options for your studies</p>
            </div>
          </div>
        </div>

        {/* Sign In Prompt */}
        {!isAuthenticated && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In to Get Started</h2>
            <p className="text-gray-600 mb-6">
              Sign in with Google to purchase credits and access personalized study abroad recommendations.
            </p>
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningIn ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In with Google'
              )}
            </button>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isLoggedIn={isAuthenticated}
              onPurchase={handlePurchase}
              isPopular={index === getMostPopularPlanIndex()}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How do credits work?</h3>
              <p className="text-gray-600 mb-4">
                Each recommendation requires 1 credit. Credits never expire and can be used whenever you need 
                new recommendations or want to explore different study options.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What's included in a recommendation?</h3>
              <p className="text-gray-600">
                Each recommendation includes personalized university matches, program details, tuition costs, 
                scholarship opportunities, and reasoning for why each option fits your profile.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I get a refund?</h3>
              <p className="text-gray-600 mb-4">
                We offer a 30-day money-back guarantee if you're not satisfied with your recommendations. 
                Contact our support team for assistance.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate are the recommendations?</h3>
              <p className="text-gray-600">
                Our AI-powered system analyzes your academic profile, preferences, and goals to provide 
                highly accurate matches. We continuously improve our algorithm based on user feedback.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
