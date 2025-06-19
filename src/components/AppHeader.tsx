
import React, { useState } from 'react';
import { Menu, LogOut, Shield, User as UserIcon, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from '../types/User';
import { getUserPermissionLevel } from '../lib/permissions';
import MapStyleSwitcher from './MapStyleSwitcher';
import { useIsMobile } from '../hooks/use-mobile';

interface AppHeaderProps {
  currentUser: User;
  onToggleSidebar: () => void;
  onLogout: () => void;
  currentMapStyle?: string;
  onMapStyleChange?: (style: string) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  currentUser, 
  onToggleSidebar, 
  onLogout,
  currentMapStyle = 'mapbox://styles/mapbox/light-v11',
  onMapStyleChange
}) => {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const permissionLevel = getUserPermissionLevel(currentUser);
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 app-header-mobile-spacing">
      <div className="flex items-center justify-between">
        {/* Logo and toggle sidebar */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-800 hidden sm:block app-header-title">
            User Locations
          </h1>
          <h1 className="text-lg font-semibold text-gray-800 sm:hidden app-header-title">
            Locations
          </h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4 app-header-controls">
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
              'Click map. Drag any pin to move' : 
              'Click map to add • Drag pin to move'
            }
          </div>
          {onMapStyleChange && currentMapStyle && (
            <div className="mr-2 relative flex items-center">
              <MapStyleSwitcher 
                currentStyle={currentMapStyle} 
                onStyleChange={onMapStyleChange} 
              />
              {currentMapStyle !== import.meta.env.VITE_MAP_STYLE && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              )}
            </div>
          )}
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

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-2 app-header-controls">
          {/* User badge for mobile - always visible */}
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

          {/* Style switcher for mobile */}
          {onMapStyleChange && currentMapStyle && (
            <div className="relative flex items-center">
              <MapStyleSwitcher 
                currentStyle={currentMapStyle} 
                onStyleChange={onMapStyleChange} 
              />
              {currentMapStyle !== import.meta.env.VITE_MAP_STYLE && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              )}
            </div>
          )}

          {/* Toggle mobile menu */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 app-header-button"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu - Collapsible */}
      {mobileMenuOpen && (
        <div className="mt-3 pt-3 border-t border-gray-100 md:hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Welcome, {currentUser.name}</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            {permissionLevel === 'admin' ? 
              'Click map. Drag any pin to move' : 
              'Click map to add • Drag pin to move'
            }
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
