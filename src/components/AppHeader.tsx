
import React from 'react';
import { Menu, LogOut, Shield, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from '../types/User';
import { getUserPermissionLevel } from '../lib/permissions';

interface AppHeaderProps {
  currentUser: User;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ currentUser, onToggleSidebar, onLogout }) => {
  const permissionLevel = getUserPermissionLevel(currentUser);
  
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
            Employee Locations
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Welcome, {currentUser.name}</span>
            <Badge 
              variant={permissionLevel === 'admin' ? 'default' : 'secondary'}
              className="flex items-center space-x-1"
            >
              {permissionLevel === 'admin' ? (
                <Shield className="h-3 w-3" />
              ) : (
                <UserIcon className="h-3 w-3" />
              )}
              <span className="capitalize">{permissionLevel}</span>
            </Badge>
          </div>
          <div className="text-sm text-gray-500">
            {permissionLevel === 'admin' ? 
              'Click map to pin any user • Drag any pin to move' : 
              'Click map to pin your location • Drag your pin to move'
            }
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
