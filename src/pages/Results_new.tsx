import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestionnaireStore } from '../store/questionnaireStore';
import { useStudyAbroadAPI } from '../hooks/useStudyAbroadAPI';
import { CountryRecommendation, University } from '../utils/api';
import RecommendationCard from '../components/RecommendationCard';
import Loader from '../components/Loader';
import { Filter, MapPin, GraduationCap, ArrowLeft, Download, Share } from 'lucide-react';

const Results: React.FC = () => {
  const navigate = useNavigate();
  const { formData } = useQuestionnaireStore();
  const { getRecommendations, isLoading: apiLoading, error: apiError } = useStudyAbroadAPI();

  const [recommendations, setRecommendations] = useState<CountryRecommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<CountryRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    country: '',
    maxTuition: '',
    scholarshipAvailable: false,
  });
  const [sortBy, setSortBy] = useState<'tuition' | 'country' | 'scholarship'>('tuition');

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        if (Object.keys(formData).length === 0) {
          navigate('/questionnaire');
          return;
        }

        setIsLoading(true);
        const response = await getRecommendations();
        setRecommendations(response.countries || []);
        setFilteredRecommendations(response.countries || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recommendations. Please try again.');
        console.error('Error loading recommendations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [formData, navigate, getRecommendations]);

  useEffect(() => {
    let filtered = [...recommendations];

    // Apply filters
    if (filters.country) {
      filtered = filtered.filter(rec => 
        rec.name.toLowerCase().includes(filters.country.toLowerCase())
      );
    }

    if (filters.maxTuition) {
      const maxTuition = parseInt(filters.maxTuition);
      filtered = filtered.map(country => ({
        ...country,
        universities: country.universities.filter(uni => uni.tuition <= maxTuition)
      })).filter(country => country.universities.length > 0);
    }

    if (filters.scholarshipAvailable) {
      filtered = filtered.map(country => ({
        ...country,
        universities: country.universities.filter(uni => uni.scholarship)
      })).filter(country => country.universities.length > 0);
    }

    // Apply sorting
    filtered = filtered.map(country => ({
      ...country,
      universities: [...country.universities].sort((a, b) => {
        switch (sortBy) {
          case 'tuition':
            return a.tuition - b.tuition;
          case 'scholarship':
            return (b.scholarship ? 1 : 0) - (a.scholarship ? 1 : 0);
          case 'country':
          default:
            return country.name.localeCompare(country.name);
        }
      })
    }));

    setFilteredRecommendations(filtered);
  }, [recommendations, filters, sortBy]);

  const toggleCardExpansion = (countryName: string, universityName: string) => {
    const cardId = `${countryName}-${universityName}`;
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const getAllUniversities = (): Array<{ country: CountryRecommendation; university: University }> => {
    const allUniversities: Array<{ country: CountryRecommendation; university: University }> = [];
    filteredRecommendations.forEach(country => {
      country.universities.forEach(university => {
        allUniversities.push({ country, university });
      });
    });
    return allUniversities;
  };

  const getUniqueCountries = () => {
    return [...new Set(recommendations.map(rec => rec.name))];
  };

  const handleExport = () => {
    // Simple export functionality - could be enhanced
    const exportData = {
      timestamp: new Date().toISOString(),
      userProfile: formData,
      recommendations: filteredRecommendations,
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'study-abroad-recommendations.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (isLoading || apiLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader message="Generating your personalized recommendations..." />
      </div>
    );
  }

  if (error || apiError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-lg font-medium mb-4">{error || apiError}</div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/review')}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Review
            </button>
            <button
              onClick={() => navigate('/questionnaire')}
              className="w-full bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allUniversities = getAllUniversities();
  const uniqueCountries = getUniqueCountries();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/review')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Review</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'My Study Abroad Recommendations',
                      text: `Found ${allUniversities.length} universities across ${uniqueCountries.length} countries!`,
                      url: window.location.href,
                    });
                  }
                }}
                className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Share className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Study Abroad Recommendations</h1>
          <p className="text-gray-600 mb-4">
            Based on your preferences, we found {allUniversities.length} universities across {uniqueCountries.length} countries that match your profile.
          </p>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">{uniqueCountries.length} Countries</span>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">{allUniversities.length} Universities</span>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">
                  {allUniversities.filter(({ university }) => university.scholarship).length} With Scholarships
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Country</label>
              <select
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Countries</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Tuition (USD)</label>
              <input
                type="number"
                value={filters.maxTuition}
                onChange={(e) => setFilters({ ...filters, maxTuition: e.target.value })}
                placeholder="e.g., 50000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scholarship Required</label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.scholarshipAvailable}
                  onChange={(e) => setFilters({ ...filters, scholarshipAvailable: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Only show universities with scholarships</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'tuition' | 'country' | 'scholarship')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="tuition">Tuition (Low to High)</option>
                <option value="scholarship">Scholarship Availability</option>
                <option value="country">Country Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredRecommendations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">No recommendations match your current filters.</p>
            <button
              onClick={() => setFilters({ country: '', maxTuition: '', scholarshipAvailable: false })}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredRecommendations.map((country, countryIndex) => (
              <div key={countryIndex} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <h2 className="text-2xl font-bold text-white mb-1">{country.name}</h2>
                  <p className="text-blue-100">{country.reason}</p>
                </div>
                
                <div className="p-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {country.universities.map((university) => (
                      <RecommendationCard
                        key={`${country.name}-${university.name}`}
                        country={country}
                        university={university}
                        isExpanded={expandedCards.has(`${country.name}-${university.name}`)}
                        onToggleExpand={() => toggleCardExpansion(country.name, university.name)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
