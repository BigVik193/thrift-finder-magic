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
  Sparkles,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  getPopularItems, 
  getRecommendedItems,
  likeItemForUser 
} from '@/services/listingService';

const formatListingForDisplay = (listing: any) => ({
  id: listing.id,
  title: listing.title,
  price: `$${listing.price}`,
  image: listing.image,
  platform: listing.platform,
  condition: listing.condition,
  seller_username: listing.seller_username,
  size: '',
  url: listing.url
});

const Search = () => {
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [results, setResults] = useState<any[]>([]);
  const [animateIn, setAnimateIn] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  const [recommendedItems, setRecommendedItems] = useState<any[]>([]);
  const [popularItems, setPopularItems] = useState<any[]>([]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateIn(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingRecommended(true);
      setIsLoadingPopular(true);
      
      try {
        const recommended = await getRecommendedItems(5);
        setRecommendedItems(recommended.map(formatListingForDisplay));
        
        const popular = await getPopularItems(5);
        setPopularItems(popular.map(formatListingForDisplay));
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoadingRecommended(false);
        setIsLoadingPopular(false);
      }
    };
    
    loadInitialData();
  }, []);
  
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setAiRecommendations([]);
      setResults([]);
      setSubmittedQuery('');
      return;
    }

    setSubmittedQuery(query);
    setIsSearching(true);
    
    try {
      const userGender = session?.user?.user_metadata?.gender || 'unspecified';
      
      if (session?.user) {
        await supabase
          .from('user_searches')
          .insert({ user_id: session.user.id, query });
      }
      
      const { data, error } = await supabase.functions.invoke('thrift-search', {
        body: { userQuery: query, userGender }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.status === 'success' && data.recommended_searches && data.recommended_searches.length > 0) {
        setAiRecommendations(data.recommended_searches);
        
        await searchEbay(data.recommended_searches);
      } else {
        setAiRecommendations([]);
        setResults([]);
        console.log('No recommended searches found or invalid response format:', data);
      }
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      toast.error('Error getting search recommendations');
      setAiRecommendations([]);
    } finally {
      setIsSearching(false);
    }
  };

  const searchEbay = async (searchTerms: string[]) => {
    if (!searchTerms || searchTerms.length === 0) return;
    
    setIsLoadingResults(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ebay-search', {
        body: { searchTerms }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.items && Array.isArray(data.items)) {
        const transformedItems = data.items.map((item: any) => {
          return formatListingForDisplay({
            id: item.id,
            title: item.title,
            price: item.price,
            currency: item.currency,
            image: item.image,
            platform: item.platform,
            seller_username: item.seller_username || 'Unknown Seller',
            seller_feedback_percentage: item.seller_feedback_percentage || 'N/A',
            seller_feedback_score: item.seller_feedback_score || 0,
            condition: item.condition || 'Not specified',
            url: item.url || ''
          });
        });
        
        setResults(transformedItems);
        setHasMoreResults(data.items.length >= 10);
      } else {
        setResults([]);
        console.log('No eBay results found');
      }
    } catch (error) {
      console.error('Error searching eBay:', error);
      toast.error('Error fetching results from eBay');
    } finally {
      setIsLoadingResults(false);
    }
  };
  
  const useRecommendedSearch = (recommendedQuery: string) => {
    setSearchQuery(recommendedQuery);
    handleSearch(recommendedQuery);
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
  
  const handleLikeItem = async (id: string, isLiked: boolean) => {
    console.log(`Item ${id} is now ${isLiked ? 'liked' : 'unliked'}`);
    await likeItemForUser(id);
  };

  const loadMoreResults = () => {
    setPage(prev => prev + 1);
    setHasMoreResults(false);
  };

  const showSearchResults = submittedQuery.trim().length > 0;

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
          
          {submittedQuery && aiRecommendations.length > 0 && (
            <div className="mb-6 bg-primary/5 rounded-lg p-4 flex flex-col items-start gap-3 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <div className="flex items-start gap-3 w-full">
                <div className="bg-primary/10 p-1.5 rounded-full">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">AI Enhanced Search</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    We've optimized your search for better results. Try these specific queries:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {aiRecommendations.map((recommendation, index) => (
                      <button
                        key={index}
                        onClick={() => useRecommendedSearch(recommendation)}
                        className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm hover:bg-primary/20 transition-colors"
                      >
                        {recommendation}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {(isSearching || isLoadingResults) && submittedQuery && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <span className="ml-2 text-muted-foreground">
                {isSearching ? 'Optimizing your search...' : 'Finding thrift treasures...'}
              </span>
            </div>
          )}
          
          {!showSearchResults && (
            <div className="space-y-12 mb-12 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <RecommendationCarousel
                title="Recommended For You"
                description="Based on your style preferences and past saves"
                items={recommendedItems}
                onLike={handleLikeItem}
                isLoading={isLoadingRecommended}
                emptyMessage="Start saving items to get personalized recommendations!"
              />
              
              <RecommendationCarousel
                title="Popular Right Now"
                description="Trending items that match your style"
                items={popularItems}
                onLike={handleLikeItem}
                isLoading={isLoadingPopular}
                emptyMessage="No popular items to show yet. Check back soon!"
              />
            </div>
          )}
          
          {showSearchResults && !isSearching && !isLoadingResults && (
            <>
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
                        {["All Platforms", "Depop", "eBay", "ThredUp", "Etsy", "Poshmark", "Grailed"].map(platform => (
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
                        {["All Categories", "Tops", "Bottoms", "Outerwear", "Dresses", "Accessories", "Shoes"].map(category => (
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
                        {["Any Condition", "New", "Like New", "Good", "Fair"].map(condition => (
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
                        {["Any Price", "Under $25", "$25-$50", "$50-$100", "Over $100"].map(range => (
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
                  {results.length > 0 ? (
                    results.map((item, index) => (
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
                            onLike={handleLikeItem}
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
                              onClick={() => likeItemForUser(item.id)}
                              className="h-10 px-3"
                            >
                              Like
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-10">
                      <p className="text-muted-foreground">No items found. Try a different search.</p>
                    </div>
                  )}
                </div>
              </div>
              
              {results.length > 0 && (
                <div className="flex justify-center mt-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={loadMoreResults}
                    disabled={!hasMoreResults}
                  >
                    {hasMoreResults ? 'Load More Results' : 'No More Results'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Search;
