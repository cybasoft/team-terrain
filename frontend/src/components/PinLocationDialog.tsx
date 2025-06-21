
import React, { useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import { User } from '../types/User';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface PinLocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  coordinates: [number, number] | null;
  onConfirm: (userId: string, coordinates: [number, number]) => void;
}

const PinLocationDialog: React.FC<PinLocationDialogProps> = ({
  isOpen,
  onClose,
  user,
  coordinates,
  onConfirm
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !coordinates) return;

    setIsLoading(true);
    onConfirm(user.id, coordinates);
    onClose();
    setIsLoading(false);
  };

  const handleClose = () => {
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
          <div className="text-center py-4">
            <p className="text-gray-600 mb-2">
              Are you sure you want to pin this location?
            </p>
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
              This will set <strong>{user?.name}</strong>'s location on the map.
            </div>
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
              disabled={isLoading}
            >
              {isLoading ? 'Pinning...' : 'Pin Location'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PinLocationDialog;
