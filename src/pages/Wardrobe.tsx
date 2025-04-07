
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { WardrobeGrid } from '@/components/ui/WardrobeGrid';
import { Button } from '@/components/ui/button';
import { AddItemModal } from '@/components/wardrobe/AddItemModal';
import { RecommendationCarousel } from '@/components/ui/RecommendationCarousel';
import { useAuth } from '@/hooks/useAuth';
import { 
  PlusCircle, 
  Filter, 
  ShirtIcon,
  Shirt,
  Footprints,
  Glasses,
  ChevronDown,
  LogOut,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getWardrobeItems, deleteWardrobeItem } from '@/services/wardrobeUploadService';
import { getRecommendedItems } from '@/services/listingService';

interface CategoryTabProps {
  icon: React.ElementType;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

const CategoryTab: React.FC<CategoryTabProps> = ({ 
  icon: Icon, 
  label, 
  count, 
  active, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
        active 
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted"
      )}
    >
      <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
      <span className="font-medium">{label}</span>
      <span className={cn(
        "ml-auto px-2 py-0.5 rounded-full text-xs",
        active ? "bg-primary/20" : "bg-muted-foreground/10 text-muted-foreground"
      )}>
        {count}
      </span>
    </button>
  );
};

const Wardrobe = () => {
  const { user, signOut } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: wardrobeItems = [], isLoading, error } = useQuery({
    queryKey: ['wardrobeItems'],
    queryFn: getWardrobeItems,
  });
  
  // Show error toast if the query fails
  useEffect(() => {
    if (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch wardrobe items');
    }
  }, [error]);
  
  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => deleteWardrobeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wardrobeItems'] });
      toast.success('Item deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error deleting item');
    }
  });
  
  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id);
    }
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  const filteredItems = React.useMemo(() => {
    if (!wardrobeItems) return [];
    
    return activeCategory === 'All'
      ? wardrobeItems
      : wardrobeItems.filter(item => item.type === activeCategory);
  }, [wardrobeItems, activeCategory]);
  
  const formattedItems = React.useMemo(() => {
    return filteredItems.map(item => ({
      id: item.id,
      title: item.type,
      image: item.image_url,
      category: item.type,
      tags: []
    }));
  }, [filteredItems]);
  
  const countByCategory = React.useMemo(() => {
    if (!wardrobeItems.length) return { All: 0, Tops: 0, Bottoms: 0, Outerwear: 0, Footwear: 0, Other: 0 };
    
    const counts = {
      All: wardrobeItems.length,
      Tops: 0,
      Bottoms: 0,
      Outerwear: 0,
      Footwear: 0,
      Other: 0
    };
    
    wardrobeItems.forEach(item => {
      if (counts[item.type as keyof typeof counts] !== undefined) {
        counts[item.type as keyof typeof counts]++;
      } else {
        counts.Other++;
      }
    });
    
    return counts;
  }, [wardrobeItems]);
  
  const handleAddItem = () => {
    setIsAddingItem(true);
  };

  const categories = [
    { icon: ShirtIcon, label: 'All', count: countByCategory.All },
    { icon: Shirt, label: 'Tops', count: countByCategory.Tops },
    { icon: ShirtIcon, label: 'Bottoms', count: countByCategory.Bottoms },
    { icon: ShirtIcon, label: 'Outerwear', count: countByCategory.Outerwear },
    { icon: Footprints, label: 'Footwear', count: countByCategory.Footwear },
    { icon: Glasses, label: 'Other', count: countByCategory.Other },
  ];
  
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4 container-custom text-center">
          <h2 className="text-xl font-semibold mb-4">Error Loading Wardrobe</h2>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['wardrobeItems'] })}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 px-4 pb-20">
        <div className="container-custom">
          <div className="mb-10 animate-fade-in">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl md:text-4xl font-bold">
                My Wardrobe
              </h1>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
                
                <Button size="sm" className="gap-2" onClick={handleAddItem}>
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Item</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 ml-2" 
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground text-lg mt-3">
              Keep track of your clothing items and use them for outfit planning.
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading your wardrobe...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 pb-8">
              <div className="w-full lg:w-64 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <div className="bg-muted/30 rounded-xl p-4 lg:sticky lg:top-28">
                  <h2 className="font-semibold mb-3">Categories</h2>
                  <div className="space-y-1">
                    {categories.map(category => (
                      <CategoryTab 
                        key={category.label}
                        icon={category.icon}
                        label={category.label}
                        count={category.count}
                        active={activeCategory === category.label}
                        onClick={() => setActiveCategory(category.label)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    {activeCategory === 'All' ? 'All Items' : activeCategory}
                    <span className="text-muted-foreground ml-2 text-sm">
                      ({filteredItems.length} items)
                    </span>
                  </h2>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    <div className="relative">
                      <select className="bg-muted/50 border border-border rounded px-2 py-1 text-sm appearance-none pr-8">
                        <option>Recently Added</option>
                        <option>Name (A-Z)</option>
                        <option>Category</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
                    </div>
                  </div>
                </div>
                
                <WardrobeGrid 
                  items={formattedItems} 
                  onAddItem={handleAddItem}
                  onDeleteItem={handleDeleteItem}
                  className={cn(
                    fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                    "transition-all duration-500"
                  )}
                />
                
                {filteredItems.length === 0 && (
                  <div className="text-center py-12 bg-muted/30 rounded-xl">
                    <h3 className="text-lg font-medium mb-2">No items in this category</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't added any items to this category yet.
                    </p>
                    <Button onClick={handleAddItem}>
                      Add Your First Item
                    </Button>
                  </div>
                )}
                
                {filteredItems.length > 0 && (
                  <div className="mt-16">
                    <RecommendationCarousel
                      title="Recommended For Your Wardrobe"
                      description="Items that would complement your current wardrobe"
                      fetchItems={() => getRecommendedItems(4)}
                      onSaveItem={(id, isSaved) => {
                        console.log("Saving recommended item:", id, isSaved);
                        toast.success(isSaved ? 'Item saved to your collection' : 'Item removed from your collection');
                      }}
                      emptyMessage="We're still learning your style. Save a few items to start seeing recommendations!"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      {isAddingItem && (
        <AddItemModal 
          isOpen={isAddingItem} 
          onClose={() => setIsAddingItem(false)} 
          wardrobeId="" 
        />
      )}
    </div>
  );
};

export default Wardrobe;
