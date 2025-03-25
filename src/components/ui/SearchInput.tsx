
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  className,
  placeholder = "Search for vintage finds...",
  value: externalValue,
  onChange: externalOnChange,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  // Sync with external value if provided
  useEffect(() => {
    if (externalValue !== undefined) {
      setInternalValue(externalValue);
    }
  }, [externalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Update internal state
    setInternalValue(newValue);
    
    // Call external onChange if provided
    if (externalOnChange) {
      externalOnChange(e);
    }
  };

  const handleClear = () => {
    // Update internal state
    setInternalValue('');
    
    // Call external onChange if provided with a synthetic event
    if (externalOnChange) {
      const syntheticEvent = {
        target: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      externalOnChange(syntheticEvent);
    }
    
    // Call onSearch with empty string
    if (onSearch) onSearch('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(externalValue !== undefined ? externalValue : internalValue);
  };

  const currentValue = externalValue !== undefined ? externalValue : internalValue;

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "relative group flex items-center w-full transition-all duration-200",
        isFocused ? "scale-[1.01]" : "scale-100",
        className
      )}
    >
      <div className="absolute left-4 text-muted-foreground">
        <Search className="h-5 w-5" />
      </div>
      
      <input
        type="text"
        value={currentValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={cn(
          "w-full h-12 pl-11 pr-10 bg-background border border-border focus:border-primary/50",
          "rounded-full outline-none transition-all duration-200",
          "placeholder:text-muted-foreground/70",
          "focus:shadow-[0_0_0_3px_rgba(138,154,91,0.1)]",
          isFocused ? "shadow-medium" : "shadow-none"
        )}
        {...props}
      />
      
      {currentValue && (
        <button 
          type="button" 
          onClick={handleClear}
          className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
};
