
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isItemLiked, likeItemForUser } from '@/services/listingService';

interface ItemCardProps {
  item: {
    id: string;
    title: string;
    image: string;
    price: string;
    platform: string;
    size?: string;
    condition?: string;
    url?: string;
    currency?: string;
    seller_username?: string;
    seller_feedback_percentage?: string;
    seller_feedback_score?: number;
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
  const [isLikeInProgress, setIsLikeInProgress] = useState(false);
  
  // Check if the item is liked when component mounts
  useEffect(() => {
    const checkLikedStatus = async () => {
      const likedStatus = await isItemLiked(item.id);
      setIsLiked(likedStatus);
    };
    
    checkLikedStatus();
  }, [item.id]);
  
  // Also update state when initialLiked prop changes
  useEffect(() => {
    setIsLiked(initialLiked);
  }, [initialLiked]);
  
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple rapid clicks
    if (isLikeInProgress) return;
    
    try {
      setIsLikeInProgress(true);
      
      // Prepare full item data for liking
      const fullItemData = {
        id: item.id,
        title: item.title,
        image: item.image,
        price: parseFloat(item.price.replace(/[^0-9.]/g, '')),
        platform: item.platform as any,
        condition: item.condition || 'Not specified',
        url: item.url || `https://example.com/item/${item.id}`,
        currency: item.currency || 'USD',
        seller_username: item.seller_username || 'Unknown Seller',
        seller_feedback_percentage: item.seller_feedback_percentage || 'N/A',
        seller_feedback_score: item.seller_feedback_score || 0,
      };
      
      // Toggle like status - this will handle both liking and unliking
      const newLikedStatus = await likeItemForUser(item.id, fullItemData);
      setIsLiked(newLikedStatus);
      
      if (onLike) onLike(item.id, newLikedStatus);
    } catch (error) {
      console.error('Error toggling like status:', error);
    } finally {
      setIsLikeInProgress(false);
    }
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
          disabled={isLikeInProgress}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full z-10 transition-all duration-200",
            "bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm",
            isLikeInProgress ? "opacity-70" : "opacity-100",
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
