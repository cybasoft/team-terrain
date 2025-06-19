
import React, { useState } from 'react';
import { MapPin, Lock, AlertCircle } from 'lucide-react';
import { User } from '../types/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface PinLocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  coordinates: [number, number] | null;
  onConfirm: (userId: string, password: string, coordinates: [number, number]) => void;
}

const PinLocationDialog: React.FC<PinLocationDialogProps> = ({
  isOpen,
  onClose,
  user,
  coordinates,
  onConfirm
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !coordinates) return;

    setIsLoading(true);
    setError('');

    // Verify password matches the user's password
    if (password === user.password) {
      onConfirm(user.id, password, coordinates);
      setPassword('');
      setError('');
      onClose();
    } else {
      setError('Incorrect password. Please try again.');
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>Pin Your Location</span>
          </DialogTitle>
          <DialogDescription>
            {user && (
              <>
                Confirm location for <strong>{user.name}</strong>
                <br />
                <span className="text-xs text-gray-500 mt-1 block">
                  Coordinates: {coordinates?.[1].toFixed(6)}, {coordinates?.[0].toFixed(6)}
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Password</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className={error ? 'border-red-300' : ''}
            />
            {error && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || !password}
            >
              {isLoading ? 'Confirming...' : 'Pin Location'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PinLocationDialog;
