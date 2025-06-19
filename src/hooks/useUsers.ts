
import { useState, useEffect } from 'react';
import { User } from '../types/User';
import { API_ENDPOINTS } from '../constants/api';
import { useToast } from './use-toast';
import { authenticatedFetch, isAuthTokenAvailable } from '../lib/auth';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users from API...');
        
        // Check if auth token is available
        if (!isAuthTokenAvailable()) {
          console.warn('API authorization token not configured');
          toast({
            title: "Authentication Warning",
            description: "API authorization token not configured. Some features may not work properly.",
            variant: "destructive"
          });
        }
        
        const response = await authenticatedFetch(API_ENDPOINTS.USERS);
        if (response.ok) {
          const data = await response.json();
          console.log('Users fetched from API:', data);
          setUsers(data.users || data);
        } else {
          console.error('Failed to fetch users from API', response.status, response.statusText);
          toast({
            title: "Error loading users",
            description: `Failed to load users from server. Status: ${response.status}`,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error loading users",
          description: "Failed to load users from server. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [toast]);

  return { users, setUsers, isLoadingUsers };
};
