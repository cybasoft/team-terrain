
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
            console.log('Session restored for user:', user.name);
            setCurrentUser(user);
          } else {
            console.log('Stored session is invalid, clearing...');
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
    console.log('User logged in:', user.name);
    setCurrentUser(user);
    // Store user session in localStorage for persistence
    localStorage.setItem('current-user', JSON.stringify(user));
  };

  const handleLogout = () => {
    console.log('User logged out');
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
