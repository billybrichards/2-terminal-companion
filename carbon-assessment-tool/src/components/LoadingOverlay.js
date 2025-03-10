import React from 'react';
import { TreePine, Leaf, BarChart2 } from 'lucide-react';

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center max-w-md">
        <div className="flex justify-center items-center mb-4">
          <div className="animate-pulse flex space-x-3">
            <Leaf size={24} className="text-green-500" />
            <BarChart2 size={24} className="text-blue-500" />
            <TreePine size={24} className="text-green-600" />
          </div>
        </div>
        
        <div className="w-64 h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-progress"></div>
        </div>
        
        <h3 className="text-lg font-medium text-gray-800 mb-2">Analyzing Your Project</h3>
        <p className="text-center text-gray-600 mb-3">
          We're assessing your project's feasibility, methodology fit, and potential environmental impact.
        </p>
        <div className="text-sm text-gray-500 animate-pulse">This may take a few moments...</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;