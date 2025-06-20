
import { useState, useCallback } from 'react';
import { User } from '../types/User';
import { API_ENDPOINTS } from '../constants/api';
import { useToast } from './use-toast';
import { authenticatedFetch } from '../lib/auth';
import { formatCoordinates, reverseGeocode } from '../lib/coordinates';
import { canMovePinForUser, canPinForUser, canDeletePinForUser } from '../lib/permissions';

export const useMapInteractions = (
  users: User[], 
  setUsers: React.Dispatch<React.SetStateAction<User[]>>, 
  currentUser: User
) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pendingCoordinates, setPendingCoordinates] = useState<[number, number] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [moveConfirmDialogOpen, setMoveConfirmDialogOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState<{userId: string, coordinates: [number, number]} | null>(null);
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
    if (!user) {
      console.error(`handlePinConfirm: User with ID ${userId} not found`);
      return;
    }

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
      console.log(`Pinning user ${user.name} at coordinates: ${coordinates[0]}, ${coordinates[1]}`);
      
      // Get city, state and country information using reverse geocoding
      const locationInfo = await reverseGeocode(coordinates);
      console.log(`Pin confirm: Got location info:`, locationInfo);
      
      const response = await authenticatedFetch(API_ENDPOINTS.LOCATION_TRACKER, {
        method: 'POST',
        body: JSON.stringify({
          userId: userId,
          name: user.name,
          coordinates: formatCoordinates(coordinates), // Send as string
          city: locationInfo.city || '',
          state: locationInfo.state || '',
          country: locationInfo.country || '',
          timestamp: new Date().toISOString(),
          action: 'pin_location'
        }),
      });

      if (response.ok) {
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.map(user =>
            user.id === userId
              ? { 
                  ...user, 
                  coordinates: formatCoordinates(coordinates), 
                  location: coordinates, 
                  pinned: true,
                  city: locationInfo.city || '',
                  state: locationInfo.state || '',
                  country: locationInfo.country || ''
                }
              : user
          );
          return updatedUsers;
        });
        
        toast({
          title: "Location pinned successfully!",
          description: `${selectedUser?.name} has been added to the map`,
        });
      } else {
        // Get error details if available
        let errorDetails = '';
        try {
          const errorText = await response.text();
          errorDetails = errorText ? ` Details: ${errorText}` : '';
        } catch (e) {
          // Ignore errors parsing error details
        }
        
        console.error(`API error saving location: ${response.status}${errorDetails}`);
        throw new Error(`Failed to save to server: ${response.status}${errorDetails}`);
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

  // New method for handling pin move confirmation
  const confirmPinMove = useCallback(async () => {
    if (!pendingMove) return;
    
    const { userId, coordinates } = pendingMove;
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    try {
      // Store original values in case we need to revert
      const originalCoordinates = user.location;
      const originalCity = user.city;
      const originalState = user.state;
      const originalCountry = user.country;
      
      console.log(`Confirmed pin move for user ${user.name} to ${coordinates[0]}, ${coordinates[1]}`);

      // Get city, state and country information using reverse geocoding
      const locationInfo = await reverseGeocode(coordinates);
      console.log('Received location info from geocoding:', locationInfo);
      
      const response = await authenticatedFetch(API_ENDPOINTS.LOCATION_TRACKER, {
        method: 'POST',
        body: JSON.stringify({
          userId: userId,
          name: user.name,
          coordinates: formatCoordinates(coordinates), // Send as string
          city: locationInfo.city || '', 
          state: locationInfo.state || '',
          country: locationInfo.country || '',
          timestamp: new Date().toISOString(),
          action: 'update_location'
        }),
      });

      if (response.ok) {
        // Update the users array with new coordinates and location info
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.map(u =>
            u.id === userId
              ? { 
                  ...u, 
                  coordinates: formatCoordinates(coordinates), 
                  location: coordinates, 
                  pinned: true,
                  city: locationInfo.city || u.city || '',
                  state: locationInfo.state || u.state || '',
                  country: locationInfo.country || u.country || ''
                }
              : u
          );
          
          console.log(`User ${user.name} updated with new location:`, 
            `city=${locationInfo.city}, state=${locationInfo.state}, country=${locationInfo.country}`);
            
          return updatedUsers;
        });
        
        toast({
          title: "Location updated!",
          description: `${user.name}'s location has been updated.`,
        });
      } else {
        // Get error details if available
        let errorDetails = '';
        try {
          const errorText = await response.text();
          errorDetails = errorText ? ` Details: ${errorText}` : '';
        } catch (e) {
          // Ignore errors parsing error details
        }
        
        console.error(`API error updating location: ${response.status}${errorDetails}`);
        
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
    } finally {
      // Reset the pending move
      setPendingMove(null);
      setMoveConfirmDialogOpen(false);
    }
  }, [users, setPendingMove, setMoveConfirmDialogOpen, pendingMove, toast, setUsers]);
  
  // Handle initial drag event - now just captures the coordinates for confirmation
  const handlePinDrag = useCallback((userId: string, coordinates: [number, number]) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      console.error(`handlePinDrag: User with ID ${userId} not found`);
      return;
    }

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

    console.log(`Starting pin drag for user ${user.name} to ${coordinates[0]}, ${coordinates[1]}`);
    
    // Store the pending move and open confirmation dialog
    setPendingMove({ userId, coordinates });
    setMoveConfirmDialogOpen(true);
  }, [users, currentUser, toast, setUsers, setPendingMove, setMoveConfirmDialogOpen]);

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
      // Get city, state and country information using reverse geocoding
      const locationInfo = await reverseGeocode(coordinates);
      
      const response = await authenticatedFetch(API_ENDPOINTS.LOCATION_TRACKER, {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          name: user.name,
          coordinates: formatCoordinates(coordinates), // Send as string
          city: locationInfo.city,
          state: locationInfo.state,
          country: locationInfo.country,
          timestamp: new Date().toISOString(),
          action: 'pin_location'
        }),
      });

      if (response.ok) {
        // We've already called reverseGeocode earlier, so we use that same locationInfo here
        const locationInfo = await reverseGeocode(coordinates);
        console.log(`User drop: Got location info for ${user.name}:`, locationInfo);
        
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.map(u =>
            u.id === user.id
              ? { 
                  ...u, 
                  coordinates: formatCoordinates(coordinates), 
                  location: coordinates, 
                  pinned: true,
                  city: locationInfo.city || '',
                  state: locationInfo.state || '',
                  country: locationInfo.country || ''
                }
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

  const handlePinDelete = useCallback(async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Check permissions before allowing deletion
    if (!canDeletePinForUser(currentUser, user)) {
      toast({
        title: "Permission denied",
        description: "You can only delete your own pin or need admin permissions.",
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
          coordinates: "", // Empty string to delete the pin
          timestamp: new Date().toISOString(),
          action: 'delete_location'
        }),
      });

      if (response.ok) {
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.map(u =>
            u.id === userId
              ? { ...u, coordinates: "", location: undefined, pinned: false }
              : u
          );
          return updatedUsers;
        });
        
        toast({
          title: "Pin deleted successfully!",
          description: `${user.name}'s location has been removed from the map.`,
        });
      } else {
        throw new Error('Failed to delete from server');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      toast({
        title: "Error deleting location",
        description: "Failed to delete location from server. Please try again.",
        variant: "destructive"
      });
    }
  }, [users, currentUser, setUsers, toast]);

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

  const cancelPinMove = useCallback(() => {
    setPendingMove(null);
    setMoveConfirmDialogOpen(false);
    // Force re-render to revert marker position
    setUsers(prevUsers => [...prevUsers]);
  }, [setPendingMove, setMoveConfirmDialogOpen, setUsers]);

  return {
    sidebarOpen,
    setSidebarOpen,
    selectedUser,
    pendingCoordinates,
    dialogOpen,
    setDialogOpen,
    moveConfirmDialogOpen,
    setMoveConfirmDialogOpen,
    pendingMove,
    confirmPinMove,
    cancelPinMove,
    handleMapClick,
    handleUserSelect,
    handlePinConfirm,
    handlePinDrag,
    handleUserDropOnMap,
    handlePinDelete,
    hasAvailableUsers,
    resetInteractions
  };
};
