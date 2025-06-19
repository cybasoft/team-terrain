
import { useState, useCallback } from 'react';
import { User } from '../types/User';
import { API_ENDPOINTS } from '../constants/api';
import { useToast } from './use-toast';
import { authenticatedFetch } from '../lib/auth';
import { formatCoordinates } from '../lib/coordinates';
import { canMovePinForUser, canPinForUser } from '../lib/permissions';

export const useMapInteractions = (
  users: User[], 
  setUsers: React.Dispatch<React.SetStateAction<User[]>>, 
  currentUser: User
) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pendingCoordinates, setPendingCoordinates] = useState<[number, number] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleMapClick = useCallback((coordinates: [number, number]) => {
    // Check if there are any users the current user can pin for
    const availableUsers = users.filter(u => !u.location && canPinForUser(currentUser, u));
    
    if (availableUsers.length === 0) {
      // Check if it's because all users have locations or permission issue
      const totalUnpinnedUsers = users.filter(u => !u.location);
      
      if (totalUnpinnedUsers.length === 0) {
        toast({
          title: "No users available",
          description: "All users already have locations assigned.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Permission denied",
          description: "No available users to add to map",
          variant: "destructive"
        });
      }
      return;
    }
    
    // If there's only one user they can pin (typically themselves), open dialog directly
    if (availableUsers.length === 1) {
      setSelectedUser(availableUsers[0]);
      setPendingCoordinates(coordinates);
      setDialogOpen(true);
    } else {
      // Multiple users available (admin case), show sidebar to select
      setPendingCoordinates(coordinates);
      setSidebarOpen(true);
    }
  }, [users, currentUser, toast]);

  const handleUserSelect = (user: User) => {
    // Double-check permissions before allowing selection
    if (!canPinForUser(currentUser, user)) {
      toast({
        title: "Permission denied",
        description: "You can only pin your own location.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedUser(user);
    setDialogOpen(true);
    setSidebarOpen(false);
  };

  const handlePinConfirm = async (userId: string, coordinates: [number, number]) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Final permission check before pinning
    if (!canPinForUser(currentUser, user)) {
      toast({
        title: "Permission denied",
        description: "You can only pin your own location.",
        variant: "destructive"
      });
      return;
    }

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
          description: `${selectedUser?.name} has been added to the map`,
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

  const handlePinDrag = useCallback(async (userId: string, coordinates: [number, number]) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Check permissions before allowing drag
    if (!canMovePinForUser(currentUser, user)) {
      toast({
        title: "Permission denied",
        description: "You can only move your own pin or you need admin permissions.",
        variant: "destructive"
      });
      // Force re-render to revert marker position
      setUsers(prevUsers => [...prevUsers]);
      return;
    }

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
  }, [users, currentUser, toast, setUsers]);

  const handleUserDropOnMap = async (user: User, coordinates: [number, number]) => {
    // Check permissions - only admins can drag users to map
    if (!canPinForUser(currentUser, user)) {
      toast({
        title: "Permission denied",
        description: "You can only pin your own location or need admin permissions.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await authenticatedFetch(API_ENDPOINTS.LOCATION_TRACKER, {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          name: user.name,
          coordinates: formatCoordinates(coordinates), // Send as string
          timestamp: new Date().toISOString(),
          action: 'pin_location'
        }),
      });

      if (response.ok) {
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.map(u =>
            u.id === user.id
              ? { ...u, coordinates: formatCoordinates(coordinates), location: coordinates, pinned: true }
              : u
          );
          return updatedUsers;
        });
        
        toast({
          title: "Location pinned successfully!",
          description: `${user.name} has been added to the map via drag & drop`,
        });
      } else {
        throw new Error('Failed to save to server');
      }
    } catch (error) {
      console.error('Error saving location via drag & drop:', error);
      toast({
        title: "Error saving location",
        description: "Failed to save location to server. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetInteractions = () => {
    setSidebarOpen(false);
    setSelectedUser(null);
    setPendingCoordinates(null);
    setDialogOpen(false);
  };

  // Check if there are users available to pin
  const hasAvailableUsers = () => {
    const availableUsers = users.filter(u => !u.location && canPinForUser(currentUser, u));
    return availableUsers.length > 0;
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
    handleUserDropOnMap,
    hasAvailableUsers,
    resetInteractions
  };
};
