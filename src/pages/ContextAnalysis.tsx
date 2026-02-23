import React from 'react';
import ContextDashboard from '../components/context/ContextDashboard';

const ContextAnalysis: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-secondary py-12 px-4 mb-6">
        <h1 className="text-3xl font-bold text-white text-center">
          情境感知系统
        </h1>
        <p className="text-white/90 text-center mt-3 max-w-2xl mx-auto">
          基于时间、地点、活动和情绪的智能感知，为你提供个性化的服务和建议
        </p>
      </div>
      
      <ContextDashboard />
    </div>
  );
};

export default ContextAnalysis;
