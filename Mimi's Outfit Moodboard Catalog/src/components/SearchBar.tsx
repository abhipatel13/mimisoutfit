/**
 * SearchBar Component
 * Reusable search input with debouncing, clear functionality, and fuzzy search hint
 */

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { hasPotentialTypos } from '@/lib/fuzzy-search.utils';

interface SearchBarProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  showClearButton?: boolean;
  showFuzzyHint?: boolean; // Show hint when fuzzy search is active
}

export default function SearchBar({
  value = '',
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
  showClearButton = true,
  showFuzzyHint = true,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const [showHint, setShowHint] = useState(false);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Check for potential typos and show hint
  useEffect(() => {
    if (showFuzzyHint && localValue.length >= 3) {
      const hasTypos = hasPotentialTypos(localValue);
      setShowHint(hasTypos);
    } else {
      setShowHint(false);
    }
  }, [localValue, showFuzzyHint]);

  // Debounce the onChange callback
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [localValue, debounceMs, onChange, value]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');
    setShowHint(false);
  }, [onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  return (
    <div className={cn('relative flex-1', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
        <Input
          type="text"
          placeholder={placeholder}
          value={localValue}
          onChange={handleInputChange}
          className={cn(
            "pl-10 pr-10 h-11 touch-target",
            showHint && "border-primary/50"
          )}
          aria-label="Search input"
        />
        {showClearButton && localValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted rounded-full touch-target"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {showHint && (
        <div className="absolute top-full left-0 right-0 mt-1 px-3 py-2 bg-primary/5 border border-primary/20 rounded-md text-xs text-muted-foreground flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>Using smart search to find similar matches</span>
        </div>
      )}
    </div>
  );
}
