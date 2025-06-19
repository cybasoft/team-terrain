import { User } from '../types/User';
import { config } from '../config/env';

/**
 * Check if a user is an admin (can move any pin)
 * @param user - The user to check
 * @returns true if user is admin, false otherwise
 */
export const isAdmin = (user: User): boolean => {
  return config.permissions.adminEmails.includes(user.email);
};

/**
 * Check if a user can move a specific pin
 * @param currentUser - The current logged-in user
 * @param targetUser - The user whose pin is being moved
 * @returns true if user can move the pin, false otherwise
 */
export const canMovePinForUser = (currentUser: User, targetUser: User): boolean => {
  // Admin users can move any pin
  if (isAdmin(currentUser)) {
    return true;
  }
  
  // Users can move their own pin
  if (currentUser.id === targetUser.id) {
    return true;
  }
  
  return false;
};

/**
 * Check if a user can move any pin (admin permission)
 * @param user - The user to check
 * @returns true if user can move any pin, false otherwise
 */
export const canMoveAnyPin = (user: User): boolean => {
  return isAdmin(user);
};

/**
 * Check if a user can pin a location for another user
 * @param currentUser - The current logged-in user
 * @param targetUser - The user to pin a location for
 * @returns true if user can pin for the target user, false otherwise
 */
export const canPinForUser = (currentUser: User, targetUser: User): boolean => {
  // Admin users can pin for any user
  if (isAdmin(currentUser)) {
    return true;
  }
  
  // Users can only pin their own location
  if (currentUser.id === targetUser.id) {
    return true;
  }
  
  return false;
};

/**
 * Get permission level for a user
 * @param user - The user to check
 * @returns permission level string
 */
export const getUserPermissionLevel = (user: User): 'admin' | 'user' => {
  return isAdmin(user) ? 'admin' : 'user';
};

/**
 * Check if a user can delete a pin
 * @param currentUser - The current logged-in user
 * @param targetUser - The user whose pin is being deleted
 * @returns true if user can delete the pin, false otherwise
 */
export const canDeletePinForUser = (currentUser: User, targetUser: User): boolean => {
  // Admin users can delete any pin
  if (isAdmin(currentUser)) {
    return true;
  }
  
  // Users can delete their own pin
  if (currentUser.id === targetUser.id) {
    return true;
  }
  
  return false;
};
