
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
  onSaveItem?: (id: string, isSaved: boolean) => void;
  className?: string;
  isLoading?: boolean;
  fetchItems?: () => Promise<RecommendationItem[]>;
  emptyMessage?: string;
}

export const RecommendationCarousel: React.FC<RecommendationCarouselProps> = ({
  title,
  description,
  items: initialItems,
  onSaveItem,
  className,
  isLoading: initialLoading = false,
  fetchItems,
  emptyMessage = "No items to show yet."
}) => {
  const [items, setItems] = useState<RecommendationItem[]>(initialItems || []);
  const [isLoading, setIsLoading] = useState(initialLoading);

  useEffect(() => {
    if (initialItems) {
      setItems(initialItems);
    } else if (fetchItems) {
      const loadItems = async () => {
        setIsLoading(true);
        try {
          const fetchedItems = await fetchItems();
          setItems(fetchedItems);
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

  if (items.length === 0) {
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
          <p className="text-muted-foreground">{emptyMessage}</p>
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
                onSave={onSaveItem}
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
