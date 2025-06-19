import { config } from '../config/env';

// Utility function to create headers with authorization token
export const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (config.api.authToken) {
    headers['Authorization'] = `Bearer ${config.api.authToken}`;
  }

  return headers;
};

// Utility function for making authenticated API requests
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const authHeaders = getAuthHeaders();
  
  const requestOptions: RequestInit = {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  };

  return fetch(url, requestOptions);
};

// Helper function to check if authentication token is available
export const isAuthTokenAvailable = (): boolean => {
  return !!config.api.authToken && config.api.authToken !== 'your_api_auth_token_here';
};
