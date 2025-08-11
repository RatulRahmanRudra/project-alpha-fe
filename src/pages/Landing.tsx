import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, useAuthStatus } from '../store/authStore';
import { GraduationCap, Globe, BookOpen, Award } from 'lucide-react';

const Landing: React.FC = () => {
  const { user } = useAuthStore();
  const { isAuthenticated, credits, freeAttemptsRemaining } = useAuthStatus();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {' '}Study Abroad{' '}
              </span>
              Program
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Get personalized recommendations for universities and programs worldwide based on your preferences, budget, and academic goals.
            </p>

            {/* Status Cards */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 max-w-2xl mx-auto">
              {user ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex-1">
                  <div className="text-2xl font-bold">{credits || 0}</div>
                  <div className="text-sm text-blue-200">Credits Available</div>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex-1">
                  <div className="text-2xl font-bold">{freeAttemptsRemaining}</div>
                  <div className="text-sm text-blue-200">Free Tries Left</div>
                </div>
              )}
              <Link
                to="/pricing"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg p-4 flex-1 transition-colors"
              >
                <div className="text-lg font-semibold">View Plans</div>
                <div className="text-sm text-blue-200">Starting at $5</div>
              </Link>
            </div>

            <Link
              to="/questionnaire"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Your Journey
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose StudyAbroad?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered recommendation engine analyzes thousands of programs to find your perfect match.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Matching</h3>
              <p className="text-gray-600">Advanced algorithms match you with programs based on your unique profile.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Global Database</h3>
              <p className="text-gray-600">Access to thousands of programs across 50+ countries worldwide.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-violet-100">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Detailed Insights</h3>
              <p className="text-gray-600">Get comprehensive information about costs, requirements, and outcomes.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-amber-100">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Proven Results</h3>
              <p className="text-gray-600">Join thousands of students who found their perfect study abroad program.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Discover Your Future?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Take our comprehensive questionnaire and get personalized recommendations in minutes.
          </p>
          <Link
            to="/questionnaire"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;