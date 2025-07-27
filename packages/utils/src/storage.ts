/**
 * Local storage utilities with error handling
 */

/**
 * Set item in localStorage
 */
export const setLocalStorage = (key: string, value: any): boolean => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }
  } catch (error) {
    console.warn('Failed to set localStorage item:', error);
  }
  return false;
};

/**
 * Get item from localStorage
 */
export const getLocalStorage = <T = any>(key: string, defaultValue?: T): T | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    }
  } catch (error) {
    console.warn('Failed to get localStorage item:', error);
  }
  return defaultValue || null;
};

/**
 * Remove item from localStorage
 */
export const removeLocalStorage = (key: string): boolean => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
      return true;
    }
  } catch (error) {
    console.warn('Failed to remove localStorage item:', error);
  }
  return false;
};

/**
 * Clear all localStorage
 */
export const clearLocalStorage = (): boolean => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
      return true;
    }
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
  return false;
};

/**
 * Set item in sessionStorage
 */
export const setSessionStorage = (key: string, value: any): boolean => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    }
  } catch (error) {
    console.warn('Failed to set sessionStorage item:', error);
  }
  return false;
};

/**
 * Get item from sessionStorage
 */
export const getSessionStorage = <T = any>(key: string, defaultValue?: T): T | null => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    }
  } catch (error) {
    console.warn('Failed to get sessionStorage item:', error);
  }
  return defaultValue || null;
};

/**
 * Remove item from sessionStorage
 */
export const removeSessionStorage = (key: string): boolean => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(key);
      return true;
    }
  } catch (error) {
    console.warn('Failed to remove sessionStorage item:', error);
  }
  return false;
};

/**
 * Check if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const test = '__localStorage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
};

/**
 * Check if sessionStorage is available
 */
export const isSessionStorageAvailable = (): boolean => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, 'test');
      sessionStorage.removeItem(test);
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
};
