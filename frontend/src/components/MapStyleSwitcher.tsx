import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { config } from '@/config/env';

// Generate image URL with dynamic access token
const getStyleImageUrl = (styleId: string): string => {
  // Extract style name from the full style URL (e.g., "mapbox/streets-v12" from "mapbox://styles/mapbox/streets-v12")
  const styleName = styleId.replace('mapbox://styles/', '');
  return `https://api.mapbox.com/styles/v1/${styleName}/static/-74.5,40,5,0/100x100@2x?access_token=${config.mapbox.accessToken}`;
};

// Helper function to get the friendly name of a style
const getStyleFriendlyName = (styleId: string): string => {
  const style = MAP_STYLES.find(s => s.id === styleId);
  return style ? style.name : 'Custom Style';
};

// Define all available Mapbox styles with friendly names
const MAP_STYLES = [
  { id: 'mapbox://styles/mapbox/streets-v12', name: 'Streets' },
  { id: 'mapbox://styles/mapbox/light-v11', name: 'Light' },
  { id: 'mapbox://styles/mapbox/dark-v11', name: 'Dark' },
  { id: 'mapbox://styles/mapbox/satellite-v9', name: 'Satellite' },
  { id: 'mapbox://styles/mapbox/satellite-streets-v12', name: 'Satellite Streets' },
  { id: 'mapbox://styles/mapbox/navigation-day-v1', name: 'Navigation Day' },
  { id: 'mapbox://styles/mapbox/navigation-night-v1', name: 'Navigation Night' },
];

interface MapStyleSwitcherProps {
  currentStyle: string;
  onStyleChange: (style: string) => void;
}

const MapStyleSwitcher: React.FC<MapStyleSwitcherProps> = ({ 
  currentStyle, 
  onStyleChange 
}) => {
  const [open, setOpen] = React.useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8"
          aria-label="Change map style"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Map Style</DialogTitle>
          <DialogDescription>
            Choose a map style that suits your preference
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-4">
          {MAP_STYLES.map((style) => (
            <div
              key={style.id}
              className={cn(
                "flex flex-col items-center p-2 border rounded-md cursor-pointer hover:bg-gray-100 transition-colors",
                currentStyle === style.id && "border-primary bg-primary/5"
              )}
              onClick={() => {
                onStyleChange(style.id);
                setOpen(false);
              }}
            >
              <div className="w-full h-20 mb-2 overflow-hidden rounded-md">
                <img 
                  src={getStyleImageUrl(style.id)} 
                  alt={style.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className={cn(
                "text-xs font-medium",
                currentStyle === style.id && "text-primary"
              )}>
                {style.name}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapStyleSwitcher;
