
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ItemCard } from '@/components/ui/ItemCard';
import { Sparkles } from 'lucide-react';

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
  items: RecommendationItem[];
  onSaveItem?: (id: string) => void;
  className?: string;
}

export const RecommendationCarousel: React.FC<RecommendationCarouselProps> = ({
  title,
  description,
  items,
  onSaveItem,
  className,
}) => {
  if (items.length === 0) {
    return null;
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
                onSave={onSaveItem ? () => onSaveItem(item.id) : undefined}
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
