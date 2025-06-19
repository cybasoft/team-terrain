import React from 'react';
import MapComponent from '../components/MapComponent';
import UserSidebar from '../components/UserSidebar';
import PinLocationDialog from '../components/PinLocationDialog';
import MapboxTokenInput from '../components/MapboxTokenInput';
import LoginForm from '../components/LoginForm';
import LoadingScreen from '../components/LoadingScreen';
import AppHeader from '../components/AppHeader';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../hooks/useAuth';
import { useMapInteractions } from '../hooks/useMapInteractions';
import { useMapboxToken } from '../hooks/useMapboxToken';
import { useMapStyle } from '../hooks/useMapStyle';

const Index = () => {
  const { users, setUsers, isLoadingUsers } = useUsers();
  const { currentUser, isValidatingSession, handleLogin, handleLogout } = useAuth();
  const { mapboxToken, handleMapboxTokenSubmit } = useMapboxToken();
  const { mapStyle, setMapStyle } = useMapStyle();
  const {
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
    handlePinDelete,
    hasAvailableUsers,
    resetInteractions
  } = useMapInteractions(users, setUsers, currentUser);

  const handleLogoutWithReset = () => {
    handleLogout();
    resetInteractions();
  };

  // Show loading screen while fetching users or validating session
  if (isLoadingUsers || isValidatingSession) {
    return <LoadingScreen message={isValidatingSession ? "Validating session..." : "Loading users..."} />;
  }

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
        currentUser={currentUser}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onUserSelect={handleUserSelect}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader
          currentUser={currentUser}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onLogout={handleLogoutWithReset}
          currentMapStyle={mapStyle}
          onMapStyleChange={setMapStyle}
        />

        <main className="flex-1 p-4">
          <MapComponent
            users={users}
            currentUser={currentUser}
            onMapClick={handleMapClick}
            onPinDrag={handlePinDrag}
            onPinDelete={handlePinDelete}
            onUserDropOnMap={handleUserDropOnMap}
            hasAvailableUsers={hasAvailableUsers}
            mapboxToken={mapboxToken}
            mapStyle={mapStyle}
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
