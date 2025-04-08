
import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ItemCard } from '@/components/ui/ItemCard';
import { Sparkles, Loader2 } from 'lucide-react';
import { Listing } from '@/services/listingService';

interface RecommendationItem {
  id: string;
  title: string;
  image: string;
  price: string;
  platform: string;
  size?: string;
  condition?: string;
}

interface RecommendationCarouselProps {
  title: string;
  description?: string;
  items?: RecommendationItem[];
  onLike?: (id: string, isLiked: boolean) => void;
  className?: string;
  isLoading?: boolean;
  fetchItems?: () => Promise<Listing[]>;
  emptyMessage?: string;
  // Add backward compatibility prop aliases
  onSaveItem?: (id: string, isSaved: boolean) => void;
}

// Helper function to convert Listing to RecommendationItem
const convertListingToRecommendationItem = (listing: Listing): RecommendationItem => {
  return {
    id: listing.id,
    title: listing.title,
    image: listing.image,
    price: `${listing.currency} ${listing.price}`,
    platform: listing.platform,
    condition: listing.condition
  };
};

export const RecommendationCarousel: React.FC<RecommendationCarouselProps> = ({
  title,
  description,
  items: initialItems,
  onLike,
  onSaveItem, // For backward compatibility
  className,
  isLoading: initialLoading = false,
  fetchItems,
  emptyMessage = "No items to show yet."
}) => {
  const [items, setItems] = useState<RecommendationItem[]>(initialItems || []);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Use onLike if provided, otherwise fall back to onSaveItem for compatibility
  const handleItemLike = onLike || onSaveItem || (() => {});

  useEffect(() => {
    if (initialItems) {
      setItems(initialItems);
      setHasLoadedData(true);
    } else if (fetchItems) {
      const loadItems = async () => {
        setIsLoading(true);
        try {
          const fetchedListings = await fetchItems();
          // Convert Listing objects to RecommendationItem objects
          const convertedItems = fetchedListings.map(convertListingToRecommendationItem);
          setItems(convertedItems);
          setHasLoadedData(true);
        } catch (error) {
          console.error(`Error fetching items for ${title}:`, error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadItems();
    }
  }, [initialItems, fetchItems, title]);

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-start gap-2 mb-4">
          <div className="bg-primary/10 p-1.5 rounded-full">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if ((items.length === 0) && hasLoadedData) {
    return (
      <div className={className}>
        <div className="flex items-start gap-2 mb-4">
          <div className="bg-primary/10 p-1.5 rounded-full">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        <div className="bg-muted/40 rounded-lg p-6 text-center">
          <p className="text-muted-foreground">
            {emptyMessage || "We're still learning your style. Like a few items to start seeing recommendations here!"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-start gap-2 mb-4">
        <div className="bg-primary/10 p-1.5 rounded-full">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>

      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {items.map((item) => (
            <CarouselItem key={item.id} className="pl-2 md:pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
              <ItemCard 
                item={item} 
                onLike={handleItemLike}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 lg:-left-12" />
        <CarouselNext className="right-0 lg:-right-12" />
      </Carousel>
    </div>
  );
};
