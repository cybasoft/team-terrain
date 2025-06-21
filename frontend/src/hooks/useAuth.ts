
import { useState, useEffect } from 'react';
import { User } from '../types/User';
import { validateUserSession } from '../lib/authentication';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isValidatingSession, setIsValidatingSession] = useState(false);

  // Validate session on app startup if user exists in localStorage
  useEffect(() => {
    const validateStoredSession = async () => {
      try {
        const storedUser = localStorage.getItem('current-user');
        if (storedUser) {
          const user: User = JSON.parse(storedUser);
          setIsValidatingSession(true);
          
          const isValid = await validateUserSession(user);
          if (isValid) {
            setCurrentUser(user);
          } else {
            localStorage.removeItem('current-user');
          }
        }
      } catch (error) {
        console.error('Session validation error:', error);
        localStorage.removeItem('current-user');
      } finally {
        setIsValidatingSession(false);
      }
    };

    validateStoredSession();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Store user session in localStorage for persistence
    localStorage.setItem('current-user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    // Clear stored session
    localStorage.removeItem('current-user');
  };

  return {
    currentUser,
    isValidatingSession,
    handleLogin,
    handleLogout
  };
};
