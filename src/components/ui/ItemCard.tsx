
import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItemCardProps {
  item: {
    id: string;
    title: string;
    image: string;
    price: string;
    platform: string;
    size?: string;
    condition?: string;
  };
  className?: string;
  onSave?: (id: string) => void;
  saved?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  className,
  onSave,
  saved = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(saved);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    if (onSave) onSave(item.id);
  };

  return (
    <a 
      href="#" 
      className={cn(
        "block group relative hoverable-card overflow-hidden rounded-xl",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
        <div 
          className={cn(
            "absolute inset-0 w-full h-full",
            !imageLoaded ? "image-loading" : "hidden"
          )}
        />
        <img
          src={item.image}
          alt={item.title}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500",
            isHovered ? "scale-105" : "scale-100",
            !imageLoaded ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setImageLoaded(true)}
        />
        
        <button
          onClick={handleSave}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full z-10 transition-all duration-200",
            "bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm",
            isSaved ? "text-accent" : "text-muted-foreground"
          )}
        >
          <Heart className={cn("h-4 w-4", isSaved && "fill-accent")} />
        </button>
        
        <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium">
          {item.platform}
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        
        <div className="flex justify-between items-center mt-1">
          <p className="font-semibold text-md">{item.price}</p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {item.size && (
              <span className="bg-secondary px-2 py-0.5 rounded">
                {item.size}
              </span>
            )}
            {item.condition && (
              <span>{item.condition}</span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
};
