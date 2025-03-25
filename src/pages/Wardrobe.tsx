import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { WardrobeGrid } from '@/components/ui/WardrobeGrid';
import { Button } from '@/components/ui/button';
import { AddItemModal } from '@/components/wardrobe/AddItemModal';
import { useAuth } from '@/hooks/useAuth';
import { 
  PlusCircle, 
  Filter, 
  ShirtIcon,
  Pants, 
  Footprints,
  Glasses,
  ChevronDown,
  LogOut,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getOrCreateWardrobe, getClothingItems, deleteClothingItem, ClothingItem } from '@/services/wardrobeService';

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
  
  // Get or create wardrobe
  const wardrobeQuery = useQuery({
    queryKey: ['wardrobe'],
    queryFn: getOrCreateWardrobe
  });
  
  // Get clothing items
  const itemsQuery = useQuery({
    queryKey: ['wardrobeItems', wardrobeQuery.data?.id],
    queryFn: () => getClothingItems(wardrobeQuery.data?.id || ''),
    enabled: !!wardrobeQuery.data?.id
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => deleteClothingItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wardrobeItems'] });
      toast.success('Item deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error deleting item');
    }
  });
  
  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id);
    }
  };
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter items by category
  const filteredItems = React.useMemo(() => {
    if (!itemsQuery.data) return [];
    
    return activeCategory === 'All'
      ? itemsQuery.data
      : itemsQuery.data.filter(item => item.type === activeCategory);
  }, [itemsQuery.data, activeCategory]);
  
  // Transform database items to wardrobe items
  const wardrobeItems = React.useMemo(() => {
    return filteredItems.map((item: ClothingItem) => ({
      id: item.id,
      title: `${item.color || ''} ${item.material || ''} ${item.type}`.trim(),
      image: item.image_url,
      category: item.type,
      tags: Object.keys(item.style_matches || {})
    }));
  }, [filteredItems]);
  
  // Count items by category
  const countByCategory = React.useMemo(() => {
    if (!itemsQuery.data) return { All: 0, Tops: 0, Bottoms: 0, Outerwear: 0, Footwear: 0, Accessories: 0 };
    
    const counts = {
      All: itemsQuery.data.length,
      Tops: 0,
      Bottoms: 0,
      Outerwear: 0,
      Footwear: 0,
      Accessories: 0
    };
    
    itemsQuery.data.forEach((item: ClothingItem) => {
      if (counts[item.type as keyof typeof counts] !== undefined) {
        counts[item.type as keyof typeof counts]++;
      }
    });
    
    return counts;
  }, [itemsQuery.data]);
  
  const handleAddItem = () => {
    setIsAddingItem(true);
  };
  
  const categories = [
    { icon: ShirtIcon, label: 'All', count: countByCategory.All },
    { icon: ShirtIcon, label: 'Tops', count: countByCategory.Tops },
    { icon: Pants, label: 'Bottoms', count: countByCategory.Bottoms },
    { icon: ShirtIcon, label: 'Outerwear', count: countByCategory.Outerwear },
    { icon: Footprints, label: 'Footwear', count: countByCategory.Footwear },
    { icon: Glasses, label: 'Accessories', count: countByCategory.Accessories },
  ];
  
  const isLoading = wardrobeQuery.isLoading || itemsQuery.isLoading;

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
              {/* Category Sidebar */}
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
              
              {/* Main Content */}
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
                  items={wardrobeItems} 
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
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Add Item Modal */}
      {isAddingItem && wardrobeQuery.data && (
        <AddItemModal 
          isOpen={isAddingItem} 
          onClose={() => setIsAddingItem(false)} 
          wardrobeId={wardrobeQuery.data.id}
        />
      )}
    </div>
  );
};

export default Wardrobe;
