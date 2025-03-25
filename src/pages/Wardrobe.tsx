
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { WardrobeGrid } from '@/components/ui/WardrobeGrid';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  Filter, 
  Upload, 
  LucideIcon, 
  ShirtIcon,
  TrousersIcon, 
  Footprints,
  Glasses,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Sample data
const wardrobeItems = [
  {
    id: '1',
    title: 'Vintage Levi\'s Denim Jacket',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1972&auto=format&fit=crop',
    category: 'Outerwear',
    tags: ['Denim', 'Vintage', 'Casual']
  },
  {
    id: '2',
    title: 'White Button-Down Shirt',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1976&auto=format&fit=crop',
    category: 'Tops',
    tags: ['Basic', 'Formal', 'Work']
  },
  {
    id: '3',
    title: 'Black Slim Jeans',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=2070&auto=format&fit=crop',
    category: 'Bottoms',
    tags: ['Denim', 'Basic', 'Everyday']
  },
  {
    id: '4',
    title: 'Chunky Knit Sweater',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2072&auto=format&fit=crop',
    category: 'Tops',
    tags: ['Cozy', 'Winter', 'Casual']
  },
  {
    id: '5',
    title: 'Leather Chelsea Boots',
    image: 'https://images.unsplash.com/photo-1605812860427-4024433a70fd?q=80&w=1974&auto=format&fit=crop',
    category: 'Footwear',
    tags: ['Leather', 'Smart', 'Versatile']
  },
  {
    id: '6',
    title: 'Pleated Midi Skirt',
    image: 'https://images.unsplash.com/photo-1577900234203-28f3962ef521?q=80&w=1974&auto=format&fit=crop',
    category: 'Bottoms',
    tags: ['Elegant', 'Feminine', 'Work']
  },
  {
    id: '7',
    title: 'Oversized Blazer',
    image: 'https://images.unsplash.com/photo-1608744882201-52a7f7f3dd60?q=80&w=1974&auto=format&fit=crop',
    category: 'Outerwear',
    tags: ['Work', 'Structured', 'Versatile']
  },
];

interface CategoryTabProps {
  icon: LucideIcon;
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
  const [activeCategory, setActiveCategory] = useState('All');
  const [filteredItems, setFilteredItems] = useState(wardrobeItems);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredItems(wardrobeItems);
    } else {
      setFilteredItems(wardrobeItems.filter(item => item.category === activeCategory));
    }
  }, [activeCategory]);
  
  const handleAddItem = () => {
    setIsAddingItem(true);
  };
  
  const categories = [
    { icon: ShirtIcon, label: 'All', count: wardrobeItems.length },
    { icon: ShirtIcon, label: 'Tops', count: wardrobeItems.filter(i => i.category === 'Tops').length },
    { icon: TrousersIcon, label: 'Bottoms', count: wardrobeItems.filter(i => i.category === 'Bottoms').length },
    { icon: ShirtIcon, label: 'Outerwear', count: wardrobeItems.filter(i => i.category === 'Outerwear').length },
    { icon: Footprints, label: 'Footwear', count: wardrobeItems.filter(i => i.category === 'Footwear').length },
    { icon: Glasses, label: 'Accessories', count: wardrobeItems.filter(i => i.category === 'Accessories').length },
  ];

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
                
                <Button size="sm" className="gap-2" onClick={() => setIsAddingItem(true)}>
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Item</span>
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground text-lg mt-3">
              Keep track of your clothing items and use them for outfit planning.
            </p>
          </div>
          
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
                
                <div className="mt-6 pt-6 border-t border-border">
                  <Button variant="outline" className="w-full gap-2">
                    <Upload className="h-4 w-4" />
                    <span>Upload Multiple</span>
                  </Button>
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
                items={filteredItems} 
                onAddItem={handleAddItem}
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
        </div>
      </main>
      
      {/* Add Item Modal (would use Dialog component in real implementation) */}
      {isAddingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl p-6 max-w-md w-full animate-scale-in">
            <h2 className="text-xl font-semibold mb-4">Add New Item</h2>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  <span>Upload Photo</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                  <ShirtIcon className="h-5 w-5 text-primary" />
                  <span>Manual Entry</span>
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsAddingItem(false)}>
                Cancel
              </Button>
              <Button>
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wardrobe;
