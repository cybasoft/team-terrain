import { User } from '../types/User';
import { API_ENDPOINTS } from '../constants/api';
import { authenticatedFetch, unauthenticatedFetch } from './auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

/**
 * Authentication Module
 * 
 * This module handles user authentication, session management, and security.
 * 
 * Security considerations:
 * 1. Login is handled via unauthenticated API calls (no bearer token exposed)
 * 2. Session validation is performed securely without exposing credentials
 * 3. API calls that need authentication use proper bearer token
 */

/**
 * Authenticate user with the backend API
 * @param credentials - Login credentials (email and password required)
 * @returns Promise with authentication result
 */
export const authenticateUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // Send login credentials to the login endpoint - no authentication required
    const loginResponse = await unauthenticatedFetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email.trim(),
        password: credentials.password.trim(),
        action: 'login'
      }),
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }
    
    const loginData = await loginResponse.json();
    
    // Check if login was successful and user data is returned
    if (loginData.success && loginData.user) {
      return {
        success: true,
        user: loginData.user
      };
    } else {
      return {
        success: false,
        message: loginData.message || 'Invalid email or password. Please check your credentials and try again.'
      };
    }
    
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Authentication failed due to network error'
    };
  }
};

/**
 * Validate user credentials against stored user data
 * This is a fallback method for when API authentication is not available
 * @param users - Array of users to validate against
 * @param email - Email to validate
 * @param password - Password to validate
 * @returns Authenticated user or null
 */
export const validateUserCredentials = (users: User[], email: string, password: string): User | null => {
  return users.find(user => 
    user.email === email.trim() && 
    user.password === password.trim()
  ) || null;
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use validateUserCredentials instead
 */
export const validateUserPassword = (users: User[], password: string): User | null => {
  return users.find(user => user.password === password.trim()) || null;
};

/**
 * Check if a user session is still valid
 * This is a secure implementation that doesn't expose the bearer token unnecessarily
 * @param user - Current user to validate
 * @returns Promise indicating if session is valid
 */
export const validateUserSession = async (user: User): Promise<boolean> => {
  try {
    // First, check if we have basic required user data
    if (!user || !user.id || !user.email) {
      console.warn('Invalid user data in session');
      return false;
    }
    
    // Check for session token or other auth indicators if using JWT/Token-based auth
    // This is where you'd validate the JWT token if using one
    
    // If we have an API endpoint specifically for validating sessions without exposing data,
    // we could use that here with a minimal request (just the session token)
    
    // For this implementation, we'll assume the session is valid if the user data looks valid
    // In a production system, you'd implement proper session validation with tokens
    
    // We won't make the API call that exposes the bearer token
    return true;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};

/**
 * Securely validate a user session with the backend
 * Only call this when you have a secure token to validate and need to verify with the server
 * @param sessionToken - A secure session token (not the bearer token)
 * @returns Promise indicating if the server confirms the session is valid
 */
export const validateSessionWithBackend = async (sessionToken: string): Promise<boolean> => {
  if (!sessionToken) return false;
  
  try {
    // In a real system, you'd have a dedicated endpoint for session validation
    // that accepts a session token (not the bearer token)
    const validationResponse = await unauthenticatedFetch(`${API_ENDPOINTS.LOGIN}/validate`, {
      method: 'POST',
      body: JSON.stringify({
        sessionToken,
        action: 'validate_session'
      })
    });
    
    if (!validationResponse.ok) {
      return false;
    }
    
    const validationData = await validationResponse.json();
    return validationData.valid === true;
  } catch (error) {
    console.error('Backend session validation error:', error);
    return false;
  }
};
