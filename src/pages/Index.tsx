
import React, { useState, useEffect } from 'react';
import { Menu, LogOut } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import UserSidebar from '../components/UserSidebar';
import PinLocationDialog from '../components/PinLocationDialog';
import MapboxTokenInput from '../components/MapboxTokenInput';
import LoginForm from '../components/LoginForm';
import { User } from '../types/User';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import usersData from '../data/users.json';

const Index = () => {
  const [users, setUsers] = useState<User[]>(usersData.users);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pendingCoordinates, setPendingCoordinates] = useState<[number, number] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const { toast } = useToast();

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox-token');
    if (savedToken) {
      setMapboxToken(savedToken);
    }
  }, []);

  const handleLogin = (user: User) => {
    console.log('User logged in:', user.name);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    console.log('User logged out');
    setCurrentUser(null);
    setSidebarOpen(false);
    setSelectedUser(null);
    setPendingCoordinates(null);
    setDialogOpen(false);
  };

  const handleMapboxTokenSubmit = (token: string) => {
    setMapboxToken(token);
    localStorage.setItem('mapbox-token', token);
  };

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

  const handlePinConfirm = (userId: string, password: string, coordinates: [number, number]) => {
    console.log('Attempting to pin user:', userId, 'at coordinates:', coordinates);
    
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user =>
        user.id === userId
          ? { ...user, location: coordinates, pinned: true }
          : user
      );
      console.log('Updated users state:', updatedUsers);
      return updatedUsers;
    });
    
    toast({
      title: "Location pinned successfully!",
      description: `${selectedUser?.name} has been pinned to the map.`,
    });
    
    setPendingCoordinates(null);
    setSelectedUser(null);
  };

  // Show login form if no user is logged in
  if (!currentUser) {
    return <LoginForm users={users} onLogin={handleLogin} />;
  }

  // Show token input if no mapbox token
  if (!mapboxToken) {
    return <MapboxTokenInput onTokenSubmit={handleMapboxTokenSubmit} />;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <UserSidebar
        users={users}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onUserSelect={handleUserSelect}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-800">
                Nairobi Location Tracker
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {currentUser.name}</span>
              <div className="text-sm text-gray-500">
                Click on the map to pin a user location
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Map */}
        <main className="flex-1 p-4">
          <MapComponent
            users={users}
            onMapClick={handleMapClick}
            mapboxToken={mapboxToken}
          />
        </main>
      </div>

      <PinLocationDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        user={selectedUser}
        coordinates={pendingCoordinates}
        onConfirm={handlePinConfirm}
      />
    </div>
  );
};

export default Index;
