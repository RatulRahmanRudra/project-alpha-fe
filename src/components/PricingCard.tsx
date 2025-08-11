import React from 'react';
import { Check, Zap } from 'lucide-react';
import { PricingPlan } from '../utils/api';

interface PricingCardProps {
  plan: PricingPlan;
  isLoggedIn: boolean;
  onPurchase: (planId: number) => void;
  isPopular?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  plan, 
  isLoggedIn, 
  onPurchase, 
  isPopular = false 
}) => {
  const pricePerCredit = (parseFloat(plan.price) / plan.credits).toFixed(2);

  return (
    <div className={`bg-white rounded-xl shadow-lg p-8 relative transition-all duration-300 hover:shadow-xl ${
      isPopular ? 'border-2 border-blue-500 transform scale-105' : 'border border-gray-200'
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
            <Zap className="h-3 w-3 mr-1" />
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
        </div>
        <p className="text-gray-500 text-sm mt-1">
          ${pricePerCredit} per credit
        </p>
      </div>

      <div className="mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{plan.credits}</div>
          <div className="text-sm text-blue-800 font-medium">Recommendation Credits</div>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-gray-600 text-sm leading-relaxed">{plan.description}</p>
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex items-center">
          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
          <span className="text-gray-600">Personalized recommendations</span>
        </div>
        <div className="flex items-center">
          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
          <span className="text-gray-600">University & program matches</span>
        </div>
        <div className="flex items-center">
          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
          <span className="text-gray-600">Scholarship opportunities</span>
        </div>
        <div className="flex items-center">
          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
          <span className="text-gray-600">No expiration date</span>
        </div>
      </div>

      <button
        onClick={() => onPurchase(plan.id)}
        disabled={!isLoggedIn}
        className={`w-full py-3 rounded-lg font-medium transition-colors ${
          isPopular
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        } ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {!isLoggedIn ? 'Sign In to Purchase' : 'Get Started'}
      </button>
    </div>
  );
};

export default PricingCard;