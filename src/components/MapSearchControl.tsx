import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, Loader2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { User } from '../types/User';
import { config } from '../config/env';

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
  context?: Array<{ id: string; text: string }>;
}

interface MapSearchControlProps {
  mapboxToken: string;
  onLocationSelect: (coordinates: [number, number], placeName: string) => void;
  currentUser?: User;
  hasAvailableUsers?: boolean;
  className?: string;
}

const MapSearchControl: React.FC<MapSearchControlProps> = ({
  mapboxToken,
  onLocationSelect,
  currentUser,
  hasAvailableUsers = true,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (searchQuery: string) => {
    if (!searchQuery.trim() || !mapboxToken) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${mapboxToken}&limit=5&types=place,locality,neighborhood,address,poi`
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data.features || []);
        setShowResults(true);
      } else {
        console.error('Search failed:', response.statusText);
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(value);
    }, 300);
  };

  const handleResultSelect = (result: SearchResult) => {
    if (!hasAvailableUsers) {
      // Show a message that no users are available to pin
      return;
    }
    
    onLocationSelect(result.center, result.place_name);
    setQuery(result.place_name);
    setShowResults(false);
    setResults([]);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
  };

  const formatResultText = (result: SearchResult) => {
    // Extract location context for better display
    const parts = result.place_name.split(', ');
    const main = parts[0];
    const context = parts.slice(1).join(', ');
    
    return { main, context };
  };

  return (
    <TooltipProvider>
      <div className={`relative ${className}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={hasAvailableUsers ? "Search for a location..." : "Search for a location (no users available to pin)"}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={!hasAvailableUsers}
            className={`pl-10 pr-24 shadow-lg border-gray-200 ${
              !hasAvailableUsers ? 'bg-gray-50 text-gray-500' : 'bg-white'
            }`}
            onFocus={() => results.length > 0 && setShowResults(true)}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {hasAvailableUsers && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-gray-100"
                  >
                    <HelpCircle className="h-3 w-3 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="text-xs space-y-1">
                    <div className="font-medium">Search Tips:</div>
                    <div>• Use ↑↓ arrows to navigate</div>
                    <div>• Press Enter to select</div>
                    <div>• Press Esc to close</div>
                    <div>• Click "Pin Here" to add location</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
            {isLoading && (
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
            )}
            {query && !isLoading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <Card 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto shadow-xl border-gray-200"
        >
          <CardContent className="p-0">
            {results.map((result, index) => {
              const { main, context } = formatResultText(result);
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={result.id}
                  className={`flex items-center p-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-200' 
                      : hasAvailableUsers 
                        ? 'hover:bg-gray-50' 
                        : 'hover:bg-red-50'
                  } ${!hasAvailableUsers ? 'opacity-60' : ''}`}
                  onClick={() => handleResultSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <MapPin className={`h-4 w-4 mr-3 flex-shrink-0 ${
                    isSelected ? 'text-blue-600' : hasAvailableUsers ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {main}
                    </div>
                    {context && (
                      <div className={`text-sm truncate ${
                        isSelected ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {context}
                      </div>
                    )}
                  </div>
                  <div className={`text-xs ml-2 ${
                    isSelected ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {result.place_type[0]}
                  </div>
                  {!hasAvailableUsers && (
                    <div className="text-xs text-red-500 ml-2">
                      No users to pin
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* No Results Message */}
      {showResults && !isLoading && query && results.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-xl border-gray-200">
          <CardContent className="p-4 text-center text-gray-500">
            <MapPin className="h-6 w-6 mx-auto mb-2 text-gray-300" />
            <div className="text-sm">No locations found</div>
            <div className="text-xs text-gray-400 mt-1">
              Try a different search term
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </TooltipProvider>
  );
};

export default MapSearchControl;
