import React from 'react';
import { MapPin, DollarSign, GraduationCap, Award, CheckCircle, XCircle } from 'lucide-react';
import { University, CountryRecommendation } from '../utils/api';

interface RecommendationCardProps {
  country: CountryRecommendation;
  university: University;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  country, 
  university, 
  isExpanded = false, 
  onToggleExpand 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{university.name}</h3>
            <p className="text-blue-600 font-medium mb-2">{university.program}</p>
            
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{country.name}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {university.scholarship ? (
              <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <Award className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">Scholarship</span>
              </div>
            ) : (
              <div className="flex items-center text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                <XCircle className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">No Scholarship</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <DollarSign className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Annual Tuition</span>
            </div>
            <span className="font-bold text-gray-900">
              ${university.tuition.toLocaleString()}
            </span>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-1">Why this fits you:</p>
            <p className="text-sm text-blue-700">{country.reason}</p>
          </div>
        </div>

        {/* Reasoning section */}
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-medium text-gray-900 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
            Key Matches
          </h4>
          <div className="space-y-1">
            {university.reasoning.slice(0, isExpanded ? undefined : 2).map((reason, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <div className="w-1 h-1 bg-green-500 rounded-full mr-2"></div>
                {reason}
              </div>
            ))}
          </div>
          
          {university.reasoning.length > 2 && (
            <button
              onClick={onToggleExpand}
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              {isExpanded ? 'Show less' : `Show ${university.reasoning.length - 2} more reasons`}
            </button>
          )}
        </div>

        <div className="flex space-x-3">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
            <GraduationCap className="h-4 w-4 mr-1" />
            View Program
          </button>
          
          <button className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors">
            Save for Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;