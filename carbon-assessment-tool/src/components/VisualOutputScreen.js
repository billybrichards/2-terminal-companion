import React from 'react';
import { ArrowLeft, MapPin, Activity, Zap, AlertTriangle, Award, Check, TreePine, Smartphone, Leaf, Building, Users, Blocks, Calendar, Target, BarChart2, Globe, Shield } from 'lucide-react';

const VisualOutputScreen = ({ project, onBack }) => {
  // Function to render score gauge
  const renderGauge = (score, label, color, icon) => {
    const width = `${score * 10}%`;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex items-center mb-2">
          {icon}
          <h3 className="font-semibold ml-2">{label} Score</h3>
          <span className={`ml-auto font-bold text-xl ${color}`}>{score}/10</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div className={`${color} bg-opacity-70 h-4 rounded-full transition-all duration-500`} style={{ width }}></div>
        </div>
      </div>
    );
  };

  // Function to render a feature card
  const renderFeatureCard = (title, content, icon) => {
    return (
      <div className="bg-white p-5 rounded-lg shadow mb-4 hover-card">
        <div className="flex items-center mb-3">
          <div className="p-2 rounded-full bg-blue-100 mr-3">
            {icon}
          </div>
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        <p className="text-gray-700">{content}</p>
      </div>
    );
  };

  // Determine feature cards based on project methodology and type
  const getFeatureCards = () => {
    const methodology = project.methodology?.toLowerCase() || '';
    const title = project.title?.toLowerCase() || '';
    
    const cards = [];
    
    // Default cards based on common themes
    if (methodology.includes('community') || title.includes('community')) {
      cards.push({
        title: "Community Engagement",
        content: "Involves local communities in project implementation and decision-making processes.",
        icon: <Users size={20} className="text-blue-600" />
      });
    }
    
    if (methodology.includes('forest') || title.includes('forest') || methodology.includes('tree') || title.includes('tree')) {
      cards.push({
        title: "Forest Conservation",
        content: "Protects and enhances forest ecosystems to sequester carbon and preserve biodiversity.",
        icon: <TreePine size={20} className="text-green-600" />
      });
    }
    
    if (methodology.includes('app') || methodology.includes('digital') || methodology.includes('tracking')) {
      cards.push({
        title: "Digital Tracking",
        content: "Uses technology to monitor, verify and report environmental impacts and carbon benefits.",
        icon: <Smartphone size={20} className="text-blue-600" />
      });
    }
    
    if (methodology.includes('urban') || title.includes('urban') || title.includes('cities')) {
      cards.push({
        title: "Urban Sustainability",
        content: "Focuses on reducing emissions and improving sustainability in urban environments.",
        icon: <Building size={20} className="text-purple-600" />
      });
    }
    
    // Add more cards if we don't have enough
    if (cards.length < 2) {
      cards.push({
        title: "Environmental Impact",
        content: "Creates measurable positive outcomes for climate and ecosystem health.",
        icon: <Leaf size={20} className="text-green-600" />
      });
    }
    
    if (cards.length < 3) {
      cards.push({
        title: "Carbon Reduction",
        content: "Works to reduce greenhouse gas emissions through innovative approaches.",
        icon: <Target size={20} className="text-red-600" />
      });
    }
    
    if (cards.length < 4) {
      cards.push({
        title: "Sustainable Development",
        content: "Balances environmental benefits with social and economic development goals.",
        icon: <Globe size={20} className="text-blue-600" />
      });
    }
    
    return cards;
  };

  // Extract key details for display
  const featureCards = getFeatureCards();
  const sdgList = project.sdgs && project.sdgs.length > 0 
    ? project.sdgs 
    : ["Sustainable Development Goals information not specified"];
  
  const certificationsList = project.certifications && project.certifications.length > 0 
    ? project.certifications 
    : ["Certification standards not specified"];

  // Determine if we have credit data to show
  const hasCredits = project.annual_credit_potential > 0 || project.saleable_credits > 0;

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button 
          className="flex items-center text-blue-500 hover:text-blue-700 mb-4" 
          onClick={onBack}
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Input
        </button>
        
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-1">{project.title || "Untitled Project"}</h1>
          <div className="flex items-center flex-wrap gap-2">
            {project.location && (
              <div className="flex items-center">
                <MapPin size={16} className="mr-1" /> 
                <span>{project.location}</span>
              </div>
            )}
            
            {project.area && (
              <div className="flex items-center ml-4">
                <Target size={16} className="mr-1" /> 
                <span>{project.area}</span>
              </div>
            )}
            
            {project.status && (
              <span className="inline-block px-3 py-1 ml-auto rounded-full bg-white bg-opacity-20 text-sm">
                {project.status}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Score gauges */}
      <div className="mb-6">
        {renderGauge(
          project.feasibility_score || 5, 
          "Feasibility", 
          "text-green-600", 
          <Award size={20} className="text-green-600" />
        )}
        
        {renderGauge(
          project.difficulty_score || 5, 
          "Difficulty", 
          "text-blue-600", 
          <Zap size={20} className="text-blue-600" />
        )}
        
        {renderGauge(
          project.risk_score || 5, 
          "text-amber-600", 
          <AlertTriangle size={20} className="text-amber-600" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
          {/* Methodology */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-gray-800 flex items-center">
              <Activity size={20} className="mr-2 text-blue-600" />
              Project Methodology
            </h2>
            <div className="bg-white p-5 rounded-lg shadow">
              <p className="text-gray-700">{project.methodology || "Methodology not specified"}</p>
            </div>
          </div>

          {/* Project Details */}
          {(project.start_date || project.environmental_asset_id || hasCredits) && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3 text-gray-800 flex items-center">
                <BarChart2 size={20} className="mr-2 text-blue-600" />
                Project Details
              </h2>
              <div className="bg-white p-5 rounded-lg shadow">
                {project.start_date && (
                  <div className="flex items-center mb-3">
                    <Calendar size={18} className="text-gray-600 mr-2" />
                    <span className="text-gray-600">Start Date:</span>
                    <span className="ml-2 font-medium">{project.start_date}</span>
                  </div>
                )}
                
                {hasCredits && (
                  <div className="flex items-center mb-3">
                    <Leaf size={18} className="text-gray-600 mr-2" />
                    <span className="text-gray-600">Annual Credit Potential:</span>
                    <span className="ml-2 font-medium">
                      {project.annual_credit_potential?.toLocaleString() || 0} tCO₂e
                    </span>
                  </div>
                )}
                
                {project.buffer_allocation > 0 && (
                  <div className="flex items-center mb-3">
                    <Shield size={18} className="text-gray-600 mr-2" />
                    <span className="text-gray-600">Buffer Allocation:</span>
                    <span className="ml-2 font-medium">{project.buffer_allocation}%</span>
                  </div>
                )}
                
                {project.saleable_credits > 0 && (
                  <div className="flex items-center mb-3">
                    <Award size={18} className="text-gray-600 mr-2" />
                    <span className="text-gray-600">Saleable Credits:</span>
                    <span className="ml-2 font-medium">
                      {project.saleable_credits?.toLocaleString() || 0} tCO₂e
                    </span>
                  </div>
                )}
                
                {project.environmental_asset_id && (
                  <div className="flex items-center">
                    <Shield size={18} className="text-gray-600 mr-2" />
                    <span className="text-gray-600">Asset ID:</span>
                    <span className="ml-2 font-medium">{project.environmental_asset_id}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SDGs */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-gray-800 flex items-center">
              <Target size={20} className="mr-2 text-blue-600" />
              Sustainable Development Goals
            </h2>
            <div className="bg-white p-5 rounded-lg shadow">
              <ul className="space-y-2">
                {sdgList.map((sdg, index) => (
                  <li key={index} className="flex items-start">
                    <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>{sdg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Key Features */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-gray-800 flex items-center">
              <Check size={20} className="mr-2 text-blue-600" />
              Key Features
            </h2>
            
            <div className="space-y-4">
              {featureCards.map((card, index) => (
                renderFeatureCard(card.title, card.content, card.icon)
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-gray-800 flex items-center">
              <Award size={20} className="mr-2 text-blue-600" />
              Certifications
            </h2>
            <div className="bg-white p-5 rounded-lg shadow">
              <ul className="space-y-2">
                {certificationsList.map((cert, index) => (
                  <li key={index} className="flex items-start">
                    <Shield size={16} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-gray-800 flex items-center">
          <Activity size={20} className="mr-2 text-blue-600" />
          Expert Analysis
        </h2>
        <div className="bg-white p-5 rounded-lg shadow">
          <p className="text-gray-700 leading-relaxed">{project.analysis || "No analysis available"}</p>
          
          <div className="mt-5 p-4 bg-yellow-50 border-l-4 border-yellow-400 flex">
            <AlertTriangle size={20} className="text-yellow-600 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Absolute Minimum Requirements</h4>
              <p className="text-sm text-gray-700">
                For a complete assessment, ensure your project description includes:
              </p>
              <ul className="text-sm text-gray-700 mt-1 ml-4 list-disc">
                <li>Project Type – The category of carbon project</li>
                <li>Location – Country or region of the project</li>
                <li>Project Scale – Size metric (e.g., hectares for land projects)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
          <Check size={16} className="mr-1" /> Save Assessment
        </button>
        
        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center">
          <Award size={16} className="mr-1" /> Request Detailed Report
        </button>
        
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center" onClick={onBack}>
          <ArrowLeft size={16} className="mr-1" /> Assess Another Project
        </button>
      </div>
    </div>
  );
};

export default VisualOutputScreen;

