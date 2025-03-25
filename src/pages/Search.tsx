import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { ItemCard } from '@/components/ui/ItemCard';
import { Button } from '@/components/ui/button';
import { RecommendationCarousel } from '@/components/ui/RecommendationCarousel';
import { 
  Filter, 
  Grid, 
  List,
  ChevronDown,
  X,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const searchResults = [
  {
    id: '1',
    title: 'Vintage Levi\'s 501 Jeans',
    image: 'https://images.unsplash.com/photo-1604176424472-17cd740f74e9?q=80&w=2080&auto=format&fit=crop',
    price: '$65',
    platform: 'Depop',
    size: 'W32',
    condition: 'Excellent'
  },
  {
    id: '2',
    title: 'Retro Nike Windbreaker Jacket',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1972&auto=format&fit=crop',
    price: '$48',
    platform: 'ThredUp',
    size: 'M',
    condition: 'Good'
  },
  {
    id: '3',
    title: 'Y2K Graphic Baby Tee',
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=2127&auto=format&fit=crop',
    price: '$32',
    platform: 'eBay',
    size: 'S',
    condition: 'New'
  },
  {
    id: '4',
    title: 'Vintage High Waist Pleated Trousers',
    image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?q=80&w=1974&auto=format&fit=crop',
    price: '$38',
    platform: 'Poshmark',
    size: 'W28',
    condition: 'Good'
  },
  {
    id: '5',
    title: 'Vintage Silk Scarf Printed',
    image: 'https://images.unsplash.com/photo-1608744882201-52a7f7f3dd60?q=80&w=1974&auto=format&fit=crop',
    price: '$18',
    platform: 'Etsy',
    condition: 'Excellent'
  },
  {
    id: '6',
    title: '90s Chunky Platform Boots',
    image: 'https://images.unsplash.com/photo-1605812860427-4024433a70fd?q=80&w=1974&auto=format&fit=crop',
    price: '$85',
    platform: 'Grailed',
    size: 'US 8',
    condition: 'Good'
  },
  {
    id: '7',
    title: 'Vintage Corduroy Overshirt',
    image: 'https://images.unsplash.com/photo-1577900234203-28f3962ef521?q=80&w=1974&auto=format&fit=crop',
    price: '$42',
    platform: 'Depop',
    size: 'L',
    condition: 'Good'
  },
  {
    id: '8',
    title: 'Hand Knitted Wool Sweater',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2072&auto=format&fit=crop',
    price: '$55',
    platform: 'ThredUp',
    size: 'M',
    condition: 'Like New'
  },
];

const recommendedItems = [
  {
    id: 'r1',
    title: 'Vintage Denim Jacket',
    image: 'https://images.unsplash.com/photo-1601333144130-8cbb312386b6?q=80&w=1974&auto=format&fit=crop',
    price: '$78',
    platform: 'Depop',
    size: 'M',
    condition: 'Good'
  },
  {
    id: 'r2',
    title: 'Checkered Wool Blazer',
    image: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=1974&auto=format&fit=crop',
    price: '$95',
    platform: 'Etsy',
    size: 'L',
    condition: 'Excellent'
  },
  {
    id: 'r3',
    title: 'Floral Summer Dress',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1946&auto=format&fit=crop',
    price: '$45',
    platform: 'Poshmark',
    size: 'S',
    condition: 'Like New'
  },
  {
    id: 'r4',
    title: 'Leather Messenger Bag',
    image: 'https://images.unsplash.com/photo-1548863227-3af567fc3b27?q=80&w=1974&auto=format&fit=crop',
    price: '$120',
    platform: 'eBay',
    condition: 'Vintage'
  },
  {
    id: 'r5',
    title: 'Classic Wool Overcoat',
    image: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=1974&auto=format&fit=crop',
    price: '$150',
    platform: 'ThredUp',
    size: 'XL',
    condition: 'Good'
  },
];

const popularItems = [
  {
    id: 'p1',
    title: 'Y2K Platform Sandals',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1976&auto=format&fit=crop',
    price: '$55',
    platform: 'Depop',
    size: 'US 8',
    condition: 'Good'
  },
  {
    id: 'p2',
    title: 'Oversized Knit Sweater',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1964&auto=format&fit=crop',
    price: '$42',
    platform: 'ThredUp',
    size: 'One Size',
    condition: 'Excellent'
  },
  {
    id: 'p3',
    title: 'Retro Graphic T-shirt',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=2070&auto=format&fit=crop',
    price: '$28',
    platform: 'Etsy',
    size: 'M',
    condition: 'Vintage'
  },
  {
    id: 'p4',
    title: 'High Waist Mom Jeans',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1974&auto=format&fit=crop',
    price: '$58',
    platform: 'Poshmark',
    size: 'W30',
    condition: 'Good'
  },
  {
    id: 'p5',
    title: 'Mini Leather Backpack',
    image: 'https://images.unsplash.com/photo-1575844611406-0e769eb77fbe?q=80&w=2070&auto=format&fit=crop',
    price: '$65',
    platform: 'eBay',
    condition: 'New'
  },
];

const platforms = ["All Platforms", "Depop", "eBay", "ThredUp", "Etsy", "Poshmark", "Grailed"];
const categories = ["All Categories", "Tops", "Bottoms", "Outerwear", "Dresses", "Accessories", "Shoes"];
const conditions = ["Any Condition", "New", "Like New", "Good", "Fair"];
const priceRanges = ["Any Price", "Under $25", "$25-$50", "$50-$100", "Over $100"];

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [results, setResults] = useState(searchResults);
  const [animateIn, setAnimateIn] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateIn(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log("Searching for:", query);
  };
  
  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };
  
  const clearFilters = () => {
    setActiveFilters([]);
  };
  
  const saveItem = (id: string) => {
    console.log("Saving item:", id);
  };

  const showSearchResults = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 px-4 pb-20">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in">
              Discover Thrift Finds
            </h1>
            
            <div className="relative animate-fade-in" style={{ animationDelay: '100ms' }}>
              <SearchInput 
                placeholder="Try 'vintage leather jacket' or 'Y2K baggy jeans'..." 
                onSearch={handleSearch}
              />
              
              <div className="absolute right-3 top-3 flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="rounded-full h-6 w-6"
                >
                  {viewMode === 'grid' ? (
                    <List className="h-4 w-4" />
                  ) : (
                    <Grid className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {searchQuery && (
            <div className="mb-6 bg-primary/5 rounded-lg p-4 flex items-start gap-3 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">AI Enhanced Search</p>
                <p className="text-sm text-muted-foreground">
                  We're searching for "{searchQuery}" including similar styles, alternative terms, and related vintage eras.
                </p>
              </div>
            </div>
          )}
          
          {!showSearchResults && (
            <div className="space-y-12 mb-12 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <RecommendationCarousel
                title="Recommended For You"
                description="Based on your style preferences and past saves"
                items={recommendedItems}
                onSaveItem={saveItem}
              />
              
              <RecommendationCarousel
                title="Popular Right Now"
                description="Trending items that match your style"
                items={popularItems}
                onSaveItem={saveItem}
              />
            </div>
          )}
          
          {(showSearchResults || activeFilters.length > 0) && (
            <div className="mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    isFilterOpen ? "transform rotate-180" : ""
                  )} />
                </Button>
                
                {activeFilters.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground gap-1"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Clear filters</span>
                  </Button>
                )}
              </div>
              
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {activeFilters.map(filter => (
                    <div 
                      key={filter}
                      className="bg-secondary rounded-full px-3 py-1 text-sm flex items-center gap-1"
                    >
                      <span>{filter}</span>
                      <button onClick={() => toggleFilter(filter)}>
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {isFilterOpen && (
                <div className="bg-muted/30 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <h3 className="font-medium mb-2 text-sm">Platform</h3>
                    <div className="space-y-1">
                      {platforms.map(platform => (
                        <button 
                          key={platform}
                          onClick={() => toggleFilter(platform)}
                          className={cn(
                            "w-full text-left px-2 py-1.5 rounded text-sm transition-colors",
                            activeFilters.includes(platform) 
                              ? "bg-primary/10 text-primary" 
                              : "hover:bg-muted"
                          )}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2 text-sm">Category</h3>
                    <div className="space-y-1">
                      {categories.map(category => (
                        <button 
                          key={category}
                          onClick={() => toggleFilter(category)}
                          className={cn(
                            "w-full text-left px-2 py-1.5 rounded text-sm transition-colors",
                            activeFilters.includes(category) 
                              ? "bg-primary/10 text-primary" 
                              : "hover:bg-muted"
                          )}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2 text-sm">Condition</h3>
                    <div className="space-y-1">
                      {conditions.map(condition => (
                        <button 
                          key={condition}
                          onClick={() => toggleFilter(condition)}
                          className={cn(
                            "w-full text-left px-2 py-1.5 rounded text-sm transition-colors",
                            activeFilters.includes(condition) 
                              ? "bg-primary/10 text-primary" 
                              : "hover:bg-muted"
                          )}
                        >
                          {condition}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2 text-sm">Price Range</h3>
                    <div className="space-y-1">
                      {priceRanges.map(range => (
                        <button 
                          key={range}
                          onClick={() => toggleFilter(range)}
                          className={cn(
                            "w-full text-left px-2 py-1.5 rounded text-sm transition-colors",
                            activeFilters.includes(range) 
                              ? "bg-primary/10 text-primary" 
                              : "hover:bg-muted"
                          )}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {showSearchResults && (
            <>
              <div className="mb-6 animate-fade-in" style={{ animationDelay: '250ms' }}>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-muted-foreground">
                    {results.length} items found
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    <select className="bg-muted/50 border border-border rounded px-2 py-1 text-sm">
                      <option>Relevance</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Newest</option>
                    </select>
                  </div>
                </div>
                
                <div className={cn(
                  viewMode === 'grid' 
                    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" 
                    : "space-y-4"
                )}>
                  {results.map((item, index) => (
                    <div 
                      key={item.id}
                      className={cn(
                        animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                        "transition-all duration-500"
                      )}
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      {viewMode === 'grid' ? (
                        <ItemCard 
                          item={item} 
                          onSave={() => saveItem(item.id)}
                        />
                      ) : (
                        <div className="flex gap-4 p-4 border border-border rounded-lg">
                          <div className="w-24 h-24 bg-muted rounded-md overflow-hidden">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-muted-foreground text-sm mb-1">
                              {item.platform} • {item.condition} • {item.size || 'N/A'}
                            </p>
                            <p className="font-semibold">{item.price}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => saveItem(item.id)}
                            className="h-10 px-3"
                          >
                            Save
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center mt-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <Button variant="outline" size="lg">
                  Load More Results
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Search;
