import React, { useState } from 'react';
import { FileText, ArrowRight, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

const SimplifiedInputScreen = ({ onSubmit, error, apiStatus }) => {
  const [projectDescription, setProjectDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (projectDescription.trim() && !isSubmitting) {
      setIsSubmitting(true);
      await onSubmit(projectDescription);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md my-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Carbon Project Assessment</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Describe your carbon or sustainability project to receive an instant assessment of its feasibility, potential impact, and implementation insights.
        </p>
        
        {/* API Status Indicator */}
        {apiStatus?.checked && apiStatus.healthy && (
          <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
            <CheckCircle size={14} className="mr-1" />
            Assessment service is online
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <div className="flex items-center">
            <AlertTriangle size={18} className="mr-2" />
            <span className="font-medium">Error</span>
          </div>
          <p className="mt-1 text-sm">{error}</p>
          <p className="mt-2 text-sm">Please try again or contact support if the problem persists.</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label 
            htmlFor="projectDescription" 
            className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
          >
            <FileText size={18} className="text-blue-500 mr-2" />
            Describe Your Project
          </label>
          <textarea
            id="projectDescription"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Describe your project in a few sentences (e.g., 'An urban sustainability initiative in Serbia that uses an app to reward eco-friendly actions and plants trees based on user participation metrics')."
            className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={6}
            required
          ></textarea>
          <p className="text-xs text-gray-500 mt-1">
            Include details like project location, type, scale, and innovative elements for a more accurate assessment.
          </p>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center mx-auto ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={!projectDescription.trim() || isSubmitting}
          >
            Generate Assessment
            <ArrowRight className="ml-2" size={18} />
          </button>
        </div>
      </form>
      
      <div className="mt-8 flex items-center justify-center">
        <div className="flex items-center px-4 py-2 bg-blue-50 rounded-full">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          <span className="text-sm text-blue-700">Powered by Scrutineer AI</span>
        </div>
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Tip: For best results, include project type, location, scale, and key features.</p>
        <p className="mt-1">Example: "Reforestation project covering 500 hectares of degraded land in Kenya using native species and community involvement."</p>
      </div>
    </div>
  );
};

export default SimplifiedInputScreen;