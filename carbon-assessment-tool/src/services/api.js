// services/api.js

// Configuration for API endpoints
// This can be adjusted based on environment variables if needed
const API_CONFIG = {
    // In production, this would be your actual domain
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'https://climate-parser.vercel.app',
    endpoints: {
      parse: '/api/parse',
      health: '/api/health'
    },
    timeoutMs: 10000 // 10 second timeout
  };
  
  /**
   * Helper function to handle API requests with proper error handling
   * 
   * @param {string} endpoint - The API endpoint to call
   * @param {Object} options - Fetch options including method, headers, body
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} - The JSON response from the API
   */
  export const apiRequest = async (endpoint, options = {}, timeout = API_CONFIG.timeoutMs) => {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const headers = { 'Content-Type': 'application/json', ...options.headers };
      const response = await fetch(url, { ...options, headers, signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetail = '';
        try {
          const errorData = await response.json();
          errorDetail = errorData.error || errorData.message || '';
        } catch (e) {
          errorDetail = response.statusText;
        }
        throw new Error(`API error (${response.status}): ${errorDetail}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeout}ms`);
      }
      throw error;
    }
  };

  /**
   * Checks the health status of the API service
   * 
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} - Object containing health status information { checked: boolean, healthy: boolean }
   */
  export const checkApiHealth = async (timeout = API_CONFIG.timeoutMs) => {
    try {
      const response = await apiRequest(API_CONFIG.endpoints.health, {
        method: 'GET'
      }, timeout);
      
      return {
        checked: true,
        healthy: response.status === 'ok' || response.healthy === true,
        lastChecked: new Date(),
        details: response
      };
    } catch (error) {
      console.error('API health check failed:', error);
      return {
        checked: true,
        healthy: false,
        lastChecked: new Date(),
        error: error.message
      };
    }
  };

  export function parseProject(data) {
    // Minimal placeholder logic
    return data;
  }