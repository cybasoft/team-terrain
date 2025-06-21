import React from 'react';
import MapComponent from '../components/MapComponent';
import UserSidebar from '../components/UserSidebar';
import PinLocationDialog from '../components/PinLocationDialog';
import MapboxTokenInput from '../components/MapboxTokenInput';
import LoginForm from '../components/LoginForm';
import LoadingScreen from '../components/LoadingScreen';
import AppHeader from '../components/AppHeader';
import PinMoveConfirmDialog from '../components/PinMoveConfirmDialog';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../hooks/useAuth';
import { useMapInteractions } from '../hooks/useMapInteractions';
import { useMapboxToken } from '../hooks/useMapboxToken';
import { useMapStyle } from '../hooks/useMapStyle';

const Index = () => {
  const { currentUser, isValidatingSession, handleLogin, handleLogout } = useAuth();
  const { users, setUsers, isLoadingUsers } = useUsers(currentUser);
  const { mapboxToken, handleMapboxTokenSubmit } = useMapboxToken();
  const { mapStyle, setMapStyle } = useMapStyle();
  const {
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
    return <LoginForm onLogin={handleLogin} />;
  }

  // Show token input if no mapbox token
  if (!mapboxToken) {
    return <MapboxTokenInput onTokenSubmit={handleMapboxTokenSubmit} />;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile overlay when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
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
      
      {pendingMove && (
        <PinMoveConfirmDialog
          open={moveConfirmDialogOpen}
          onOpenChange={setMoveConfirmDialogOpen}
          user={users.find(u => u.id === pendingMove.userId) || null}
          onConfirm={confirmPinMove}
          onCancel={cancelPinMove}
        />
      )}
    </div>
  );
};

export default Index;
