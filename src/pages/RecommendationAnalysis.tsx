import React from 'react';
import RecommendationDashboard from '../components/recommendation/RecommendationDashboard';

const RecommendationAnalysis: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-secondary py-12 px-4 mb-6">
        <h1 className="text-3xl font-bold text-white text-center">
          个性化功能推荐
        </h1>
        <p className="text-white/90 text-center mt-3 max-w-2xl mx-auto">
          基于你的使用习惯和用户级别，为你推荐最适合的功能和使用方式
        </p>
      </div>
      
      <RecommendationDashboard />
    </div>
  );
};

export default RecommendationAnalysis;
