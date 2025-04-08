
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { likeItemForUser, isItemLiked } from '@/services/listingService';

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
  onLike?: (id: string, isLiked: boolean) => void;
  liked?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  className,
  onLike,
  liked: initialLiked = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Check if the item is liked when component mounts
  useEffect(() => {
    const checkLikedStatus = async () => {
      const likedStatus = await isItemLiked(item.id);
      setIsLiked(likedStatus);
    };
    
    checkLikedStatus();
  }, [item.id]);
  
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newLikedStatus = await likeItemForUser(item.id);
    setIsLiked(newLikedStatus);
    
    if (onLike) onLike(item.id, newLikedStatus);
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
          onClick={handleLike}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full z-10 transition-all duration-200",
            "bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm",
            isLiked ? "text-accent" : "text-muted-foreground"
          )}
          title={isLiked ? "Unlike" : "Like"}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-accent")} />
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
