
import React, { useState } from 'react';
import { Plus, TagIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WardrobeItem {
  id: string;
  title: string;
  image: string;
  category: string;
  tags: string[];
}

interface WardrobeGridProps {
  items: WardrobeItem[];
  onAddItem?: () => void;
  className?: string;
}

export const WardrobeGrid: React.FC<WardrobeGridProps> = ({
  items,
  onAddItem,
  className,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4", className)}>
      {/* Add New Item Card */}
      <div 
        className="aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-all p-4 bg-muted/50 hover:bg-muted"
        onClick={onAddItem}
      >
        <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center shadow-sm mb-3">
          <Plus className="h-6 w-6 text-primary" />
        </div>
        <p className="text-center text-sm font-medium">Add New Item</p>
        <p className="text-center text-xs text-muted-foreground mt-1">Upload or manually add</p>
      </div>
      
      {/* Wardrobe Items */}
      {items.map(item => (
        <div 
          key={item.id}
          className="aspect-square hoverable-card relative rounded-xl overflow-hidden group"
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <img 
            src={item.image} 
            alt={item.title}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500",
              hoveredItem === item.id ? "scale-110" : "scale-100" 
            )}
          />
          
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-4 flex flex-col justify-end transition-opacity",
            hoveredItem === item.id ? "opacity-100" : "opacity-0"
          )}>
            <h3 className="text-white font-medium mb-1 line-clamp-1">
              {item.title}
            </h3>
            
            <div className="flex items-center gap-1 mb-1">
              <TagIcon className="h-3 w-3 text-white/70" />
              <p className="text-xs text-white/70">
                {item.category}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-1">
              {item.tags.map(tag => (
                <span 
                  key={tag} 
                  className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
