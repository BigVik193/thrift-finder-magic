
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  Filter, 
  X, 
  Loader2, 
  ChevronRight, 
  ChevronDown, 
  Sparkles,
  BookX
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ItemCard } from '@/components/ui/ItemCard';
import { RecommendationCarousel } from '@/components/ui/RecommendationCarousel';
import { cn } from '@/lib/utils';
import { searchListings, getRecommendedItems, getPopularItems, likeItemForUser } from '@/services/listingService';

// Platforms for filtering
const platforms = [
  { id: 'ebay', name: 'eBay' },
  { id: 'depop', name: 'Depop' },
  { id: 'etsy', name: 'Etsy' },
  { id: 'thredup', name: 'ThredUp' },
  { id: 'grailed', name: 'Grailed' }
];

// Sorting options
const sortOptions = [
  { id: 'relevance', name: 'Relevance' },
  { id: 'price-asc', name: 'Price: Low to High' },
  { id: 'price-desc', name: 'Price: High to Low' },
  { id: 'newest', name: 'Newest First' }
];

// Conditions for filtering
const conditions = [
  { id: 'new', name: 'New' },
  { id: 'likenew', name: 'Like New' },
  { id: 'good', name: 'Good' },
  { id: 'fair', name: 'Fair' }
];

// Types of clothing items
const itemTypes = [
  { id: 'tops', name: 'Tops' },
  { id: 'bottoms', name: 'Bottoms' },
  { id: 'dresses', name: 'Dresses' },
  { id: 'outerwear', name: 'Outerwear' },
  { id: 'shoes', name: 'Shoes' },
  { id: 'accessories', name: 'Accessories' }
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sortBy, setSortBy] = useState('relevance');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  const [recommendedItems, setRecommendedItems] = useState<any[]>([]);
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 300);
    
    if (initialQuery) {
      handleSearch(initialQuery);
    } else {
      loadRecommendedItems();
      loadPopularItems();
    }
    
    return () => clearTimeout(timer);
  }, [initialQuery]);
  
  const loadRecommendedItems = async () => {
    setIsLoadingRecommended(true);
    try {
      const items = await getRecommendedItems(8);
      
      // Format items for display
      const formattedItems = items.map(item => ({
        id: item.id,
        title: item.title,
        image: item.image,
        price: `${item.currency} ${item.price}`,
        platform: item.platform,
        condition: item.condition
      }));
      
      setRecommendedItems(formattedItems);
    } catch (error) {
      console.error('Error loading recommended items:', error);
    } finally {
      setIsLoadingRecommended(false);
    }
  };
  
  const loadPopularItems = async () => {
    setIsLoadingPopular(true);
    try {
      const items = await getPopularItems(8);
      
      // Format items for display
      const formattedItems = items.map(item => ({
        id: item.id,
        title: item.title,
        image: item.image,
        price: `${item.currency} ${item.price}`,
        platform: item.platform,
        condition: item.condition
      }));
      
      setPopularItems(formattedItems);
    } catch (error) {
      console.error('Error loading popular items:', error);
    } finally {
      setIsLoadingPopular(false);
    }
  };
  
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      setSearchParams({ q: query });
      
      const searchResults = await searchListings(query, 20);
      
      // Format results for display
      const formattedResults = searchResults.map(item => ({
        id: item.id,
        title: item.title,
        image: item.image,
        price: `${item.currency} ${item.price}`,
        platform: item.platform,
        condition: item.condition
      }));
      
      setResults(formattedResults);
    } catch (error) {
      console.error('Error searching listings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetFilters = () => {
    setSelectedPlatforms([]);
    setSelectedConditions([]);
    setSelectedTypes([]);
    setPriceRange([0, 200]);
    setSortBy('relevance');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };
  
  const togglePlatform = (platformId: string) => {
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter(id => id !== platformId));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId]);
    }
  };
  
  const toggleCondition = (conditionId: string) => {
    if (selectedConditions.includes(conditionId)) {
      setSelectedConditions(selectedConditions.filter(id => id !== conditionId));
    } else {
      setSelectedConditions([...selectedConditions, conditionId]);
    }
  };
  
  const toggleType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      setSelectedTypes(selectedTypes.filter(id => id !== typeId));
    } else {
      setSelectedTypes([...selectedTypes, typeId]);
    }
  };
  
  const handleLikeItem = async (id: string, isLiked: boolean) => {
    // This function handles when a user likes/unlikes an item
    console.log(`Item ${id} ${isLiked ? 'liked' : 'unliked'}`);
  };
  
  // Filter section markup
  const filterSection = (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-3">Price Range</h4>
        <div className="px-2">
          <Slider 
            defaultValue={priceRange}
            max={200}
            step={1}
            minStepsBetweenThumbs={1}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="mb-6"
          />
          <div className="flex justify-between">
            <span className="text-sm">${priceRange[0]}</span>
            <span className="text-sm">${priceRange[1]}</span>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-3">Platforms</h4>
        <div className="space-y-2">
          {platforms.map((platform) => (
            <div key={platform.id} className="flex items-center">
              <Checkbox 
                id={`platform-${platform.id}`}
                checked={selectedPlatforms.includes(platform.id)}
                onCheckedChange={() => togglePlatform(platform.id)}
                className="mr-2"
              />
              <label htmlFor={`platform-${platform.id}`} className="text-sm">
                {platform.name}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-3">Condition</h4>
        <div className="space-y-2">
          {conditions.map((condition) => (
            <div key={condition.id} className="flex items-center">
              <Checkbox 
                id={`condition-${condition.id}`}
                checked={selectedConditions.includes(condition.id)}
                onCheckedChange={() => toggleCondition(condition.id)}
                className="mr-2"
              />
              <label htmlFor={`condition-${condition.id}`} className="text-sm">
                {condition.name}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-3">Item Type</h4>
        <div className="space-y-2">
          {itemTypes.map((type) => (
            <div key={type.id} className="flex items-center">
              <Checkbox 
                id={`type-${type.id}`}
                checked={selectedTypes.includes(type.id)}
                onCheckedChange={() => toggleType(type.id)}
                className="mr-2"
              />
              <label htmlFor={`type-${type.id}`} className="text-sm">
                {type.name}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="pt-4">
        <Button 
          onClick={resetFilters}
          variant="outline" 
          className="w-full mb-2"
        >
          Reset Filters
        </Button>
        <Button className="w-full">
          Apply Filters
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 px-4 pb-20">
        <div className="container-custom">
          {/* Search Bar */}
          <div className="mb-8 animate-fade-in">
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <Input 
                  type="text"
                  placeholder="Search for vintage tees, Y2K jeans, retro jackets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="pr-24 h-12"
                />
                {searchQuery && (
                  <button 
                    className="absolute right-20 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <Button 
                  className="absolute right-0 top-0 h-full rounded-l-none gap-2"
                  onClick={() => handleSearch(searchQuery)}
                >
                  <SearchIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                <span className="text-sm text-muted-foreground">Try:</span>
                {['vintage denim jacket', 'y2k tops', 'leather boots'].map((suggestion, index) => (
                  <button 
                    key={index}
                    className="text-sm px-3 py-1 rounded-full bg-secondary hover:bg-secondary/70 transition-colors"
                    onClick={() => {
                      setSearchQuery(suggestion);
                      handleSearch(suggestion);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {hasSearched ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden">
                <Button 
                  variant="outline" 
                  className="w-full mb-4 gap-2"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="h-4 w-4" />
                  <span>{isFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    isFilterOpen ? "rotate-180" : ""
                  )} />
                </Button>
                
                {/* Mobile Filters */}
                {isFilterOpen && (
                  <div className="bg-muted/30 p-4 rounded-lg mb-6">
                    {filterSection}
                  </div>
                )}
              </div>
              
              {/* Desktop Filters */}
              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                      <Filter className="h-5 w-5 mr-2" />
                      <span>Filters</span>
                    </h3>
                    
                    {filterSection}
                  </div>
                </div>
              </div>
              
              {/* Search Results */}
              <div className="lg:col-span-3">
                {initialQuery && (
                  <h2 className="text-2xl font-bold mb-4">
                    Search results for "{initialQuery}"
                  </h2>
                )}
                
                {/* Results Sorting */}
                <div className="flex justify-between items-center mb-6">
                  <div className="text-sm text-muted-foreground">
                    {isLoading ? 'Searching...' : results.length > 0 ? `${results.length} items found` : 'No items found'}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    <select 
                      className="bg-muted/50 border border-border rounded px-2 py-1 text-sm appearance-none pr-8"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      {sortOptions.map(option => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="h-4 w-4 -ml-6 pointer-events-none text-muted-foreground" />
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">Searching for thrift finds...</p>
                    </div>
                  </div>
                ) : results.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {results.map((item, index) => (
                      <div 
                        key={item.id}
                        className={cn(
                          fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                          "transition-all duration-500"
                        )}
                        style={{ transitionDelay: `${index * 50}ms` }}
                      >
                        <ItemCard 
                          item={item} 
                          onLike={handleLikeItem}
                        />
                      </div>
                    ))}
                  </div>
                ) : !isLoading && hasSearched ? (
                  <div className="text-center py-12 bg-muted/30 rounded-xl">
                    <BookX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No items found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      We couldn't find any items matching your search. Try broadening your search terms or exploring our recommendations below.
                    </p>
                    <Button onClick={() => {
                      setHasSearched(false);
                      setSearchQuery('');
                      setSearchParams({});
                    }}>
                      View Recommendations
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className={cn(
              "animate-in fade-in-50",
              "space-y-12"
            )}>
              {/* Recommended Items */}
              <RecommendationCarousel
                title="Recommended For You"
                description="Items we think you'll love based on your style"
                items={recommendedItems}
                onLikeItem={handleLikeItem}
                isLoading={isLoadingRecommended}
                emptyMessage="Like a few items to get personalized recommendations!"
              />
              
              {/* Popular Items */}
              <RecommendationCarousel
                title="Popular Items"
                description="Trending thrift finds that others are loving"
                items={popularItems}
                onLikeItem={handleLikeItem}
                isLoading={isLoadingPopular}
                emptyMessage="Come back soon to see what's trending!"
              />
              
              {/* Browse by Category */}
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  Browse by Category
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {itemTypes.map((type) => (
                    <button
                      key={type.id}
                      className="glass-card p-4 h-32 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-hover hover:-translate-y-1"
                      onClick={() => {
                        setSearchQuery(type.name);
                        handleSearch(type.name);
                      }}
                    >
                      <h3 className="text-lg font-semibold">{type.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Explore {type.name.toLowerCase()}
                      </p>
                      <ChevronRight className="h-4 w-4 mt-2 text-primary" />
                    </button>
                  ))}
                </div>
              </section>
              
              {/* Trending Searches */}
              <section className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Trending Searches
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {[
                    "vintage denim jacket",
                    "y2k tops",
                    "chunky loafers",
                    "baggy cargo pants",
                    "90s band tees",
                    "leather blazers",
                    "pleated skirts",
                    "platform boots"
                  ].map((term, index) => (
                    <button 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                      onClick={() => {
                        setSearchQuery(term);
                        handleSearch(term);
                      }}
                    >
                      <span>{term}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Search;
