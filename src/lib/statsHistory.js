// statsHistory.js
// Utility functions for handling historical stats

/**
 * Saves daily stats to localStorage
 * @param {Object} dailyStats - The stats object for the day
 */
export const saveDailyStats = (dailyStats) => {
  try {
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get existing history or initialize empty object
    const existingHistory = JSON.parse(localStorage.getItem('statsHistory') || '{}');
    
    // Add today's stats
    existingHistory[today] = {
      ...dailyStats,
      date: today,
    };
    
    // Save back to localStorage
    localStorage.setItem('statsHistory', JSON.stringify(existingHistory));
    
    return true;
  } catch (error) {
    console.error('Failed to save stats history:', error);
    return false;
  }
};

/**
 * Retrieves stats history from localStorage
 * @param {number} days - Number of days to retrieve (default: 30)
 * @returns {Array} Array of daily stats objects
 */
export const getStatsHistory = (days = 30) => {
  try {
    const history = JSON.parse(localStorage.getItem('statsHistory') || '{}');
    
    // Convert to array and sort by date (newest first)
    const historyArray = Object.values(history)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, days); // Limit to specified number of days
      
    return historyArray;
  } catch (error) {
    console.error('Failed to retrieve stats history:', error);
    return [];
  }
};

/**
 * Clears all saved stats history
 */
export const clearStatsHistory = () => {
  localStorage.removeItem('statsHistory');
};

/**
 * Exports stats history as JSON
 * @returns {string} JSON string of stats history
 */
export const exportStatsHistory = () => {
  try {
    const history = localStorage.getItem('statsHistory') || '{}';
    return history;
  } catch (error) {
    console.error('Failed to export stats history:', error);
    return '{}';
  }
};

/**
 * Imports stats history from JSON
 * @param {string} jsonData - JSON string of stats history
 * @returns {boolean} Success status
 */
export const importStatsHistory = (jsonData) => {
  try {
    // Validate JSON format
    const parsed = JSON.parse(jsonData);
    if (typeof parsed !== 'object') {
      throw new Error('Invalid stats history format');
    }
    
    localStorage.setItem('statsHistory', jsonData);
    return true;
  } catch (error) {
    console.error('Failed to import stats history:', error);
    return false;
  }
}; 