
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ItemCard } from '@/components/ui/ItemCard';
import { Button } from '@/components/ui/button';
import { 
  Trash2, 
  ExternalLink, 
  Filter,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Sample data
const savedItems = [
  {
    id: '1',
    title: 'Vintage Levi\'s 501 Jeans',
    image: 'https://images.unsplash.com/photo-1604176424472-17cd740f74e9?q=80&w=2080&auto=format&fit=crop',
    price: '$65',
    platform: 'Depop',
    size: 'W32',
    condition: 'Excellent',
    dateAdded: '2023-10-15'
  },
  {
    id: '2',
    title: 'Retro Nike Windbreaker Jacket',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1972&auto=format&fit=crop',
    price: '$48',
    platform: 'ThredUp',
    size: 'M',
    condition: 'Good',
    dateAdded: '2023-10-18'
  },
  {
    id: '3',
    title: 'Y2K Graphic Baby Tee',
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=2127&auto=format&fit=crop',
    price: '$32',
    platform: 'eBay',
    size: 'S',
    condition: 'New',
    dateAdded: '2023-10-20'
  },
  {
    id: '4',
    title: 'Vintage High Waist Pleated Trousers',
    image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?q=80&w=1974&auto=format&fit=crop',
    price: '$38',
    platform: 'Poshmark',
    size: 'W28',
    condition: 'Good',
    dateAdded: '2023-10-22'
  },
  {
    id: '5',
    title: 'Vintage Silk Scarf Printed',
    image: 'https://images.unsplash.com/photo-1608744882201-52a7f7f3dd60?q=80&w=1974&auto=format&fit=crop',
    price: '$18',
    platform: 'Etsy',
    condition: 'Excellent',
    dateAdded: '2023-10-25'
  },
  {
    id: '6',
    title: '90s Chunky Platform Boots',
    image: 'https://images.unsplash.com/photo-1605812860427-4024433a70fd?q=80&w=1974&auto=format&fit=crop',
    price: '$85',
    platform: 'Grailed',
    size: 'US 8',
    condition: 'Good',
    dateAdded: '2023-10-28'
  },
];

const SavedItems = () => {
  const [items, setItems] = useState(savedItems);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };
  
  const handleDelete = () => {
    setItems(items.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    setIsSelecting(false);
  };
  
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 px-4 pb-20">
        <div className="container-custom">
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl md:text-4xl font-bold">
                Saved Items
              </h1>
              
              <div className="flex gap-2">
                {isSelecting ? (
                  <>
                    <Button 
                      variant="ghost" 
                      onClick={() => setIsSelecting(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDelete}
                      disabled={selectedItems.length === 0}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete ({selectedItems.length})</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filter</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsSelecting(true)}
                    >
                      Select Items
                    </Button>
                  </>
                )}
              </div>
            </div>
            <p className="text-muted-foreground text-lg mt-3">
              Browse and manage your saved thrift finds.
            </p>
          </div>
          
          {/* Filter Section */}
          {isFilterOpen && (
            <div className="bg-muted/30 rounded-lg p-6 mb-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Platform
                  </label>
                  <select className="w-full border border-border rounded-md p-2 bg-background">
                    <option>All Platforms</option>
                    <option>Depop</option>
                    <option>eBay</option>
                    <option>ThredUp</option>
                    <option>Poshmark</option>
                    <option>Grailed</option>
                    <option>Etsy</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price Range
                  </label>
                  <select className="w-full border border-border rounded-md p-2 bg-background">
                    <option>Any Price</option>
                    <option>Under $25</option>
                    <option>$25 - $50</option>
                    <option>$50 - $100</option>
                    <option>$100+</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Date Added
                  </label>
                  <select className="w-full border border-border rounded-md p-2 bg-background">
                    <option>Any Time</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button variant="outline" className="mr-2">
                  Reset
                </Button>
                <Button>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
          
          {/* Select All Option */}
          {isSelecting && (
            <div className="flex items-center mb-4 animate-fade-in">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={selectedItems.length === items.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-border"
                />
                <span>Select All ({items.length} items)</span>
              </label>
            </div>
          )}
          
          {/* Saved Items Section */}
          {items.length > 0 ? (
            <div className="mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-muted-foreground">
                  {items.length} {items.length === 1 ? 'item' : 'items'} saved
                </p>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <div className="relative">
                    <select className="bg-muted/50 border border-border rounded px-2 py-1 text-sm appearance-none pr-8">
                      <option>Date Added: Newest</option>
                      <option>Date Added: Oldest</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Platform</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item, index) => (
                  <div 
                    key={item.id}
                    className={cn(
                      fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                      "transition-all duration-500 relative"
                    )}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    {isSelecting && (
                      <div 
                        className="absolute top-3 left-3 z-20 bg-background/80 backdrop-blur-sm rounded-full p-1"
                        onClick={() => toggleSelectItem(item.id)}
                      >
                        <input 
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => {}}
                          className="h-5 w-5 rounded"
                        />
                      </div>
                    )}
                    
                    <ItemCard 
                      item={item} 
                      saved={true}
                      onSave={() => removeItem(item.id)}
                    />
                    
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Added on {new Date(item.dateAdded).toLocaleDateString()}
                      </span>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs h-8 px-2 gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>View on {item.platform}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-xl animate-fade-in">
              <h2 className="text-xl font-semibold mb-3">No saved items yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Items you save while browsing thrift finds will appear here for easy access.
              </p>
              <Button>
                Browse Thrift Finds
              </Button>
            </div>
          )}
          
          {/* Premium Upgrade Callout */}
          <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-semibold mb-1">
                  Running out of space?
                </h3>
                <p className="text-muted-foreground">
                  Upgrade to Trove Premium for unlimited saved items and price drop alerts.
                </p>
              </div>
              <Button variant="outline" className="shrink-0">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SavedItems;
