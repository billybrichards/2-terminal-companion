import React, { useState, useEffect } from 'react';
import SimplifiedInputScreen from './components/SimplifiedInputScreen';
import VisualOutputScreen from './components/VisualOutputScreen';
import LoadingOverlay from './components/LoadingOverlay';
import { parseProject, checkApiHealth } from './services/api';

function App() {
  const [currentScreen, setCurrentScreen] = useState('input');
  const [isLoading, setIsLoading] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState({ checked: false, healthy: false });
  
  // Check API health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const healthData = await checkApiHealth();
        setApiStatus({ 
          checked: true, 
          healthy: healthData.status === 'OK' 
        });
      } catch (err) {
        console.warn('API health check failed:', err);
        setApiStatus({ checked: true, healthy: false });
      }
    };
    
    checkHealth();
  }, []);
  
  // Function to handle form submission
  const handleSubmit = async (projectDescription) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the Climate Parser API through our service
      const data = await parseProject(projectDescription);
      setProjectData(data);
      setCurrentScreen('output');
    } catch (err) {
      console.error('Error parsing project:', err);
      let errorMessage = err.message || 'An error occurred while analyzing your project';
      
      // Add more context if we know the API is unhealthy
      if (apiStatus.checked && !apiStatus.healthy) {
        errorMessage = 'The analysis service is currently unavailable. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to go back to input screen
  const handleBackToInput = () => {
    setCurrentScreen('input');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading && <LoadingOverlay />}
      
      {currentScreen === 'input' && (
        <SimplifiedInputScreen 
          onSubmit={handleSubmit} 
          error={error}
          apiStatus={apiStatus}
        />
      )}
      
      {currentScreen === 'output' && projectData && (
        <VisualOutputScreen 
          project={projectData} 
          onBack={handleBackToInput} 
        />
      )}
    </div>
  );
}

export default App;

