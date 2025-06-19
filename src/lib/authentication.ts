import { User } from '../types/User';
import { API_ENDPOINTS } from '../constants/api';
import { authenticatedFetch } from './auth';

export interface LoginCredentials {
  username?: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

/**
 * Authenticate user with the backend API
 * @param credentials - Login credentials (username optional, password required)
 * @returns Promise with authentication result
 */
export const authenticateUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    console.log('Attempting to authenticate user...');
    
    // First, fetch all users from the API
    const usersResponse = await authenticatedFetch(API_ENDPOINTS.USERS);
    
    if (!usersResponse.ok) {
      throw new Error(`Failed to fetch users: ${usersResponse.status} ${usersResponse.statusText}`);
    }
    
    const userData = await usersResponse.json();
    const users: User[] = userData.users || userData;
    
    console.log('Fetched users for authentication:', users.length);
    
    // Find user by password (current simple authentication)
    // In a real system, you'd send credentials to a login endpoint
    const authenticatedUser = users.find(user => 
      user.password === credentials.password.trim()
    );
    
    if (authenticatedUser) {
      console.log('Authentication successful for user:', authenticatedUser.name);
      return {
        success: true,
        user: authenticatedUser
      };
    } else {
      console.log('Authentication failed: Invalid password');
      return {
        success: false,
        message: 'Invalid password. Please check your credentials and try again.'
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
 * Validate user password against stored user data
 * This is a fallback method for when API authentication is not available
 * @param users - Array of users to validate against
 * @param password - Password to validate
 * @returns Authenticated user or null
 */
export const validateUserPassword = (users: User[], password: string): User | null => {
  return users.find(user => user.password === password.trim()) || null;
};

/**
 * Check if a user session is still valid
 * In a real system, this would validate JWT tokens or session cookies
 * @param user - Current user to validate
 * @returns Promise indicating if session is valid
 */
export const validateUserSession = async (user: User): Promise<boolean> => {
  try {
    // In a real system, you'd validate the user's token/session here
    // For now, we'll just check if the user still exists in the system
    const usersResponse = await authenticatedFetch(API_ENDPOINTS.USERS);
    
    if (!usersResponse.ok) {
      return false;
    }
    
    const userData = await usersResponse.json();
    const users: User[] = userData.users || userData;
    
    return users.some(u => u.id === user.id);
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};
