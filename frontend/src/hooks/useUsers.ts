
import { useState, useEffect } from 'react';
import { User } from '../types/User';
import { API_ENDPOINTS } from '../constants/api';
import { useToast } from './use-toast';
import { authenticatedFetch, isAuthTokenAvailable } from '../lib/auth';
import { parseCoordinates } from '../lib/coordinates';

// Type for raw user data from API
interface RawUserData {
  id: string;
  name: string;
  email: string;
  password: string;
  coordinates?: string;
  location?: [number, number] | string | null;
  city?: string;
  state?: string;
  country?: string;
}

export const useUsers = (currentUser?: User | null) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false); // Start as false to avoid initial loading
  const { toast } = useToast();

  useEffect(() => {
    // Only fetch users if we have a currentUser (authenticated)
    if (!currentUser) {
      return;
    }
    
    setIsLoadingUsers(true);
    
    const fetchUsers = async () => {
      try {
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
          const fetchedUsers = data.users || data;
          
          // Ensure we have an array of users
          if (!Array.isArray(fetchedUsers)) {
            console.error('API response is not an array:', fetchedUsers);
            throw new Error('Invalid user data format received from API');
          }
          
          // Set pinned status based on whether user has coordinates
          const processedUsers = fetchedUsers.map((user: RawUserData): User => {
            // Ensure user has required email field
            if (!user.email) {
              console.warn(`User ${user.name} missing email address`);
            }
            
            // Try to parse coordinates from both 'coordinates' and 'location' fields
            const parsedLocation = parseCoordinates(user.coordinates) || parseCoordinates(user.location);
            
            return {
              ...user,
              email: user.email || '', // Ensure email is not undefined
              coordinates: user.coordinates, // Keep original string
              location: parsedLocation, // Parsed array
              pinned: parsedLocation !== null,
              city: user.city || '', // Ensure city is always defined
              state: user.state || '', // Ensure state is always defined
              country: user.country || '' // Ensure country is always defined
            };
          });
          
          setUsers(processedUsers);
        } else {
          console.error('Failed to fetch users from API', response.status, response.statusText);
          
          // Try to get error message from response
          let errorMessage = `Failed to load users from server. Status: ${response.status}`;
          try {
            const errorData = await response.text();
            if (errorData) {
              errorMessage += ` - ${errorData}`;
            }
          } catch (e) {
            // Ignore error parsing error message
          }
          
          toast({
            title: "Error loading users",
            description: errorMessage,
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
  }, [toast, currentUser]);

  return { users, setUsers, isLoadingUsers };
};
