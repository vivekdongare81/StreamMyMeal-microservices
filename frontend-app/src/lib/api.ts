// API utility for making authenticated requests
const API_BASE = '/api/v1';

interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
  params?: Record<string, string>;
}

class ApiClient {
  private async makeRequest(endpoint: string, options: ApiRequestOptions = {}): Promise<Response> {
    const { requiresAuth = true, params, ...fetchOptions } = options;
    
    let url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    
    // Add query parameters if provided
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value);
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    // Add Authorization header if authentication is required
    if (requiresAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('token');
        window.location.href = '/auth';
        throw new Error('Authentication required');
      }
      if (response.status === 403) {
        throw new Error('Access forbidden. You may not have permission to perform this action.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  async get(endpoint: string, options: ApiRequestOptions = {}): Promise<any> {
    const response = await this.makeRequest(endpoint, { ...options, method: 'GET' });
    return response.json();
  }

  async post(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<any> {
    const response = await this.makeRequest(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  }

  async put(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<any> {
    const response = await this.makeRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  }

  async delete(endpoint: string, options: ApiRequestOptions = {}): Promise<any> {
    const response = await this.makeRequest(endpoint, { ...options, method: 'DELETE' });
    if (response.status === 204) return; // No Content
    const text = await response.text();
    return text ? JSON.parse(text) : undefined;
  }

  async upload(endpoint: string, formData: FormData, options: ApiRequestOptions = {}): Promise<any> {
    const { requiresAuth = true, params, ...fetchOptions } = options;
    
    let url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    
    // Add query parameters if provided
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value);
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    
    const headers: HeadersInit = {
      ...fetchOptions.headers,
    };

    // Add Authorization header if authentication is required
    if (requiresAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      ...fetchOptions,
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/auth';
        throw new Error('Authentication required');
      }
      if (response.status === 403) {
        throw new Error('Access forbidden. You may not have permission to perform this action.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(); 