
import React, { useState } from 'react';
import { Search, Users, MapPin, X } from 'lucide-react';
import { User } from '../types/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface UserSidebarProps {
  users: User[];
  isOpen: boolean;
  onToggle: () => void;
  onUserSelect: (user: User) => void;
}

const UserSidebar: React.FC<UserSidebarProps> = ({ users, isOpen, onToggle, onUserSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const unpinnedUsers = users.filter(user => !user.pinned);
  const filteredUsers = unpinnedUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                    {searchTerm ? 'No users found' : 'All users are pinned!'}
                  </p>
                </div>
              ) : (
                filteredUsers.map(user => (
                  <Card
                    key={user.id}
                    className="cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-blue-300"
                    onClick={() => onUserSelect(user)}
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
                          <p className="text-sm text-gray-500">Click to pin location</p>
                        </div>
                        <MapPin className="h-4 w-4 text-gray-400" />
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
                <span>Unpinned: {unpinnedUsers.length}</span>
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
