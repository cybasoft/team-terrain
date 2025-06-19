
import { useState } from 'react';
import { User } from '../types/User';
import { API_ENDPOINTS } from '../constants/api';
import { useToast } from './use-toast';
import { authenticatedFetch } from '../lib/auth';
import { formatCoordinates } from '../lib/coordinates';

export const useMapInteractions = (users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>>) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pendingCoordinates, setPendingCoordinates] = useState<[number, number] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleMapClick = (coordinates: [number, number]) => {
    // Only allow pinning if there are users without locations
    if (users.filter(u => !u.location).length === 0) {
      toast({
        title: "No users available",
        description: "All users already have locations assigned.",
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
          coordinates: formatCoordinates(coordinates), // Send as string
          timestamp: new Date().toISOString(),
          action: 'pin_location'
        }),
      });

      if (response.ok) {
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.map(user =>
            user.id === userId
              ? { ...user, coordinates: formatCoordinates(coordinates), location: coordinates, pinned: true }
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
    setDialogOpen(false);
  };

  const handlePinDrag = async (userId: string, coordinates: [number, number]) => {
    console.log('Pin dragged for user:', userId, 'to coordinates:', coordinates);
    
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      const response = await authenticatedFetch(API_ENDPOINTS.LOCATION_TRACKER, {
        method: 'POST',
        body: JSON.stringify({
          userId: userId,
          name: user.name,
          coordinates: formatCoordinates(coordinates), // Send as string
          timestamp: new Date().toISOString(),
          action: 'update_location'
        }),
      });

      if (response.ok) {
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.map(u =>
            u.id === userId
              ? { ...u, coordinates: formatCoordinates(coordinates), location: coordinates, pinned: true }
              : u
          );
          return updatedUsers;
        });
        
        toast({
          title: "Location updated!",
          description: `${user.name}'s location has been updated.`,
        });
      } else {
        // Revert the marker position on failure
        toast({
          title: "Error updating location",
          description: "Failed to save new location to server. Position reverted.",
          variant: "destructive"
        });
        // Force re-render to revert marker position
        setUsers(prevUsers => [...prevUsers]);
      }
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Error updating location",
        description: "Failed to save new location to server. Position reverted.",
        variant: "destructive"
      });
      // Force re-render to revert marker position
      setUsers(prevUsers => [...prevUsers]);
    }
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
    handlePinDrag,
    resetInteractions
  };
};
