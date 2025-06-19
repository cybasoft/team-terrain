
import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '../types/User';

interface AppHeaderProps {
  currentUser: User;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ currentUser, onToggleSidebar, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
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
            onClick={onLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
