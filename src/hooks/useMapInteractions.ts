
import { useState } from 'react';
import { User } from '../types/User';
import { API_ENDPOINTS } from '../constants/api';
import { useToast } from './use-toast';
import { authenticatedFetch } from '../lib/auth';

export const useMapInteractions = (users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>>) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pendingCoordinates, setPendingCoordinates] = useState<[number, number] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleMapClick = (coordinates: [number, number]) => {
    if (users.filter(u => !u.pinned).length === 0) {
      toast({
        title: "No users available",
        description: "All users have already been pinned to locations.",
        variant: "destructive"
      });
      return;
    }
    setPendingCoordinates(coordinates);
    setSidebarOpen(true);
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
    setSidebarOpen(false);
  };

  const handlePinConfirm = async (userId: string, password: string, coordinates: [number, number]) => {
    console.log('Attempting to pin user:', userId, 'at coordinates:', coordinates);
    
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      const response = await authenticatedFetch(API_ENDPOINTS.LOCATION_TRACKER, {
        method: 'POST',
        body: JSON.stringify({
          userId: userId,
          name: user.name,
          coordinates: coordinates,
          timestamp: new Date().toISOString(),
          action: 'pin_location'
        }),
      });

      if (response.ok) {
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.map(user =>
            user.id === userId
              ? { ...user, location: coordinates, pinned: true }
              : user
          );
          return updatedUsers;
        });
        
        toast({
          title: "Location pinned successfully!",
          description: `${selectedUser?.name} has been pinned to the map and saved to the server.`,
        });
      } else {
        throw new Error('Failed to save to server');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      toast({
        title: "Error saving location",
        description: "Failed to save location to server. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setPendingCoordinates(null);
    setSelectedUser(null);
  };

  const resetInteractions = () => {
    setSidebarOpen(false);
    setSelectedUser(null);
    setPendingCoordinates(null);
    setDialogOpen(false);
  };

  return {
    sidebarOpen,
    setSidebarOpen,
    selectedUser,
    pendingCoordinates,
    dialogOpen,
    setDialogOpen,
    handleMapClick,
    handleUserSelect,
    handlePinConfirm,
    resetInteractions
  };
};
