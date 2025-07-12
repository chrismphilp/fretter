// API client for interacting with the Go backend
import {Tab} from '../display/GuitarTabEditor';

// API configuration
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api` || 'https://backend-dot-fretter.ew.r.appspot.com/api';

// Define API response interfaces
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

interface SaveTabResponse {
  _id: string;
  savedAt: string;
}

interface UserAuthResponse {
  token: string;
  expiresAt: string;
  userId: string;
}

export interface TabListItem {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Generic request handler with error handling and response processing
 */
async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle different status codes
    if (response.status === 204) {
      // No content but successful
      return { status: response.status };
    }
    
    // Parse the JSON response
    let data;
    try {
      data = await response.json();
    } catch {
      // If we can't parse JSON, use text
      const text = await response.text();
      return {
        error: text || 'Invalid response format',
        status: response.status
      };
    }
    
    // Check for error responses
    if (!response.ok) {
      const errorMessage = data.error || data.message || 'Unknown error';
      return {
        error: errorMessage,
        status: response.status
      };
    }
    
    return {
      data,
      status: response.status
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0 // 0 indicates network error
    };
  }
}

/**
 * API client for tab-related operations
 */
export const tabApi = {
  /**
   * Saves a tab to the server
   */
  async saveTab(tab: Tab, title?: string): Promise<ApiResponse<SaveTabResponse>> {
    return fetchApi<SaveTabResponse>('/tabs', {
      method: 'POST',
      body: JSON.stringify({
        tab,
        title: title || 'Untitled Tab'
      })
    });
  },
  
  /**
   * Gets a tab by ID
   */
  async getTab(id: string): Promise<ApiResponse<Tab>> {
    return fetchApi<Tab>(`/tabs/${id}`);
  },
  
  /**
   * Gets all tabs for the current user
   */
  async getTabs(): Promise<ApiResponse<TabListItem[]>> {
    return fetchApi<TabListItem[]>('/tabs');
  },
  
  /**
   * Deletes a tab
   */
  async deleteTab(id: string): Promise<ApiResponse<void>> {
    return fetchApi<void>(`/tabs/${id}`, {
      method: 'DELETE'
    });
  },
  
  /**
   * Updates an existing tab
   */
  async updateTab(id: string, tab: Tab, title?: string): Promise<ApiResponse<SaveTabResponse>> {
    return fetchApi<SaveTabResponse>(`/tabs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        tab,
        title: title || 'Untitled Tab'
      })
    });
  },
  
  /**
   * Exports a tab to a specific format
   */
  async exportTab(id: string, format: 'txt' | 'pdf' | 'gp'): Promise<ApiResponse<Blob>> {
    const response = await fetch(`${API_BASE_URL}/tabs/${id}/export?format=${format}`, {
      method: 'GET',
      headers: {}
    });
    
    if (!response.ok) {
      return {
        error: 'Failed to export tab',
        status: response.status
      };
    }
    
    const blob = await response.blob();
    return {
      data: blob,
      status: response.status
    };
  }
};

/**
 * API client for user authentication
 */
export const authApi = {
  /**
   * Logs in a user
   */
  async login(email: string, password: string): Promise<ApiResponse<UserAuthResponse>> {
    return fetchApi<UserAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  
  /**
   * Registers a new user
   */
  async register(email: string, password: string, name: string): Promise<ApiResponse<UserAuthResponse>> {
    return fetchApi<UserAuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });
  },
  
  /**
   * Logs out the current user
   */
  async logout(): Promise<ApiResponse<void>> {
    return fetchApi<void>('/auth/logout', {
      method: 'POST'
    });
  },
  
  /**
   * Check if the current authentication token is valid
   */
  async validateToken(): Promise<ApiResponse<{ valid: boolean }>> {
    return fetchApi<{ valid: boolean }>('/auth/validate');
  }
};

const api = {
  tab: tabApi,
  auth: authApi
};

export default api; 
