import { useState, useCallback } from 'react';
import api, { ApiResponse } from './api';

/**
 * Hook for handling API requests with loading and error states
 */
export function useApi<T, P extends unknown[]>(
  apiFunction: (...args: P) => Promise<ApiResponse<T>>
) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<number | undefined>(undefined);

  const execute = useCallback(async (...args: P) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const response = await apiFunction(...args);
      setStatus(response.status);
      
      if (response.error) {
        setError(response.error);
        setData(undefined);
        return { success: false, error: response.error, status: response.status };
      }
      
      setData(response.data);
      return { 
        success: true, 
        data: response.data, 
        status: response.status 
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setData(undefined);
      return { success: false, error: errorMessage, status: 0 };
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction]);

  return {
    execute,
    data,
    isLoading,
    error,
    status,
    reset: () => {
      setData(undefined);
      setError(undefined);
      setStatus(undefined);
    }
  };
}

/**
 * Custom hook for tab operations
 */
export function useTabApi() {
  const saveTab = useApi(api.tab.saveTab);
  const getTab = useApi(api.tab.getTab);
  const getTabs = useApi(api.tab.getTabs);
  const deleteTab = useApi(api.tab.deleteTab);
  const updateTab = useApi(api.tab.updateTab);
  const exportTab = useApi(api.tab.exportTab);

  return {
    saveTab,
    getTab,
    getTabs,
    deleteTab,
    updateTab,
    exportTab
  };
}

/**
 * Custom hook for authentication operations
 */
export function useAuthApi() {
  const login = useApi(api.auth.login);
  const register = useApi(api.auth.register);
  const logout = useApi(api.auth.logout);
  const validateToken = useApi(api.auth.validateToken);

  return {
    login,
    register,
    logout,
    validateToken
  };
}

export default useApi; 