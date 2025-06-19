
import React, { useState } from 'react';
import { Search, Users, MapPin, X, Move } from 'lucide-react';
import { User } from '../types/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { canPinForUser, isAdmin } from '../lib/permissions';

interface UserSidebarProps {
  users: User[];
  currentUser: User;
  isOpen: boolean;
  onToggle: () => void;
  onUserSelect: (user: User) => void;
}

const UserSidebar: React.FC<UserSidebarProps> = ({ users, currentUser, isOpen, onToggle, onUserSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedUser, setDraggedUser] = useState<User | null>(null);

  // Filter to only users without locations that the current user can pin for
  const unpinnedUsers = users.filter(user => !user.location && canPinForUser(currentUser, user));
  const filteredUsers = unpinnedUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isCurrentUserAdmin = isAdmin(currentUser);

  const handleDragStart = (e: React.DragEvent, user: User) => {
    if (!isCurrentUserAdmin) return;
    
    setDraggedUser(user);
    e.dataTransfer.setData('application/json', JSON.stringify(user));
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a drag image
    const dragImage = document.createElement('div');
    dragImage.textContent = `📍 ${user.name}`;
    dragImage.className = 'drag-preview';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.background = 'linear-gradient(135deg, #3B82F6, #1D4ED8)';
    dragImage.style.color = 'white';
    dragImage.style.padding = '8px 12px';
    dragImage.style.borderRadius = '6px';
    dragImage.style.fontSize = '14px';
    dragImage.style.fontWeight = '500';
    dragImage.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 60, 20);
    
    // Clean up drag image after a delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const handleDragEnd = () => {
    setDraggedUser(null);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Users</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {searchTerm ? 'No users found' : 'No users available to pin!'}
                  </p>
                  {!searchTerm && unpinnedUsers.length === 0 && (
                    <p className="text-sm text-gray-400 mt-2">
                      You can only pin your own location{!canPinForUser(currentUser, currentUser) ? '' : ', or all users already have locations.'}
                    </p>
                  )}
                </div>
              ) : (
                filteredUsers.map(user => (
                  <Card
                    key={user.id}
                    className={`cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300 ${
                      isCurrentUserAdmin ? 'select-none' : ''
                    } ${draggedUser?.id === user.id ? 'opacity-50 scale-95 dragging-user-card' : ''}`}
                    onClick={() => !draggedUser && onUserSelect(user)}
                    draggable={isCurrentUserAdmin}
                    onDragStart={(e) => handleDragStart(e, user)}
                    onDragEnd={handleDragEnd}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500">
                            {isCurrentUserAdmin ? 'Drag to map or click to pin' : 'Click to pin location'}
                          </p>
                        </div>
                        {isCurrentUserAdmin ? (
                          <Move className="h-4 w-4 text-blue-500" />
                        ) : (
                          <MapPin className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Footer Stats */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600 text-center">
              <div className="flex justify-between">
                <span>No Location: {unpinnedUsers.length}</span>
                <span>Total: {users.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserSidebar;
