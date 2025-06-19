
import { useState } from 'react';
import { User } from '../types/User';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    console.log('User logged in:', user.name);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    console.log('User logged out');
    setCurrentUser(null);
  };

  return {
    currentUser,
    handleLogin,
    handleLogout
  };
};
