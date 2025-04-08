
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Upload, 
  Grid3x3, 
  Heart, 
  ArrowUpRight, 
  TrendingUp,
  Sparkles,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/button';
import { ItemCard } from '@/components/ui/ItemCard';
import { RecommendationCarousel } from '@/components/ui/RecommendationCarousel';
import { cn } from '@/lib/utils';
import { getUserLikedItems, getRecommendedItems, likeItemForUser } from '@/services/listingService';
import { useAuth } from '@/hooks/useAuth';

// Sample data for trending searches 
const trendingSearches = ["baggy cargo pants", "chunky loafers", "oversized cardigan", "90s sunglasses"];

const Dashboard = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('Good day');
  const [animateCards, setAnimateCards] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoadingLiked, setIsLoadingLiked] = useState(false);
  const [likedItems, setLikedItems] = useState<any[]>([]);

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Trigger animation after a short delay
    const timer = setTimeout(() => {
      setAnimateCards(true);
    }, 300);

    // Load the user's recent searches (placeholder for now)
    setRecentSearches(["vintage denim jacket", "y2k tops", "leather boots size 9"]);

    // Load the user's liked items
    if (user) {
      loadLikedItems();
    }

    return () => clearTimeout(timer);
  }, [user]);

  const loadLikedItems = async () => {
    setIsLoadingLiked(true);
    try {
      const items = await getUserLikedItems(3); // Get most recent 3 liked items
      
      // Format the items for display
      const formattedItems = items.map(item => ({
        id: item.id,
        title: item.title,
        image: item.image,
        price: `${item.currency} ${item.price}`,
        platform: item.platform,
        condition: item.condition
      }));
      
      setLikedItems(formattedItems);
    } catch (error) {
      console.error('Error loading liked items:', error);
    } finally {
      setIsLoadingLiked(false);
    }
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // This would navigate to search page with the query
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  const handleLikeItem = async (id: string, isLiked: boolean) => {
    if (!isLiked) {
      // Remove the item from the likedItems array
      setLikedItems(prev => prev.filter(item => item.id !== id));
    } else {
      // Refresh the liked items list
      loadLikedItems();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <main className="pt-24 px-4">
        <div className="container-custom">
          {/* Header Section */}
          <div className="mb-10 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {greeting}, <span className="text-primary">{user?.user_metadata?.name || 'Thrifter'}</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Let's help you discover your perfect sustainable style today.
            </p>
          </div>
          
          {/* Search Section */}
          <div className="mb-12 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <SearchInput 
              placeholder="Search for vintage tees, Y2K jeans, retro jackets..." 
              onSearch={handleSearch}
              className="max-w-3xl mx-auto"
            />
            
            {recentSearches.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                <span className="text-sm text-muted-foreground">Recent:</span>
                {recentSearches.map((search, index) => (
                  <button 
                    key={index}
                    className="text-sm px-3 py-1 rounded-full bg-secondary hover:bg-secondary/70 transition-colors"
                    onClick={() => handleSearch(search)}
                  >
                    {search}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <Link to="/upload" className={cn(
              "glass-card p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-hover hover:-translate-y-1",
              animateCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
              "transition-all duration-500"
            )} style={{ transitionDelay: '150ms' }}>
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Outfit</h3>
              <p className="text-sm text-muted-foreground">
                Help us learn your style preferences
              </p>
            </Link>
            
            <Link to="/search" className={cn(
              "glass-card p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-hover hover:-translate-y-1",
              animateCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
              "transition-all duration-500"
            )} style={{ transitionDelay: '200ms' }}>
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Search className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Thrift Search</h3>
              <p className="text-sm text-muted-foreground">
                Find unique pieces across platforms
              </p>
            </Link>
            
            <Link to="/wardrobe" className={cn(
              "glass-card p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-hover hover:-translate-y-1",
              animateCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
              "transition-all duration-500"
            )} style={{ transitionDelay: '250ms' }}>
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Grid3x3 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">My Wardrobe</h3>
              <p className="text-sm text-muted-foreground">
                Browse and manage your collection
              </p>
            </Link>
            
            <Link to="/liked" className={cn(
              "glass-card p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-hover hover:-translate-y-1",
              animateCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
              "transition-all duration-500"
            )} style={{ transitionDelay: '300ms' }}>
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Heart className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Liked Items</h3>
              <p className="text-sm text-muted-foreground">
                View your favorited thrift finds
              </p>
            </Link>
          </div>
          
          {/* Liked Items Section */}
          <section className={cn(
            "mb-12",
            animateCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
            "transition-all duration-500"
          )} style={{ transitionDelay: '350ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recently Liked</h2>
              <Link to="/liked" className="text-primary flex items-center gap-1 text-sm hover:underline">
                <span>View all</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            
            {isLoadingLiked ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : likedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {likedItems.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    liked={true} 
                    onLike={handleLikeItem} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-muted/40 rounded-lg p-6 text-center">
                <p className="text-muted-foreground">
                  You haven't liked any items yet. Start exploring to find thrift treasures!
                </p>
                <Button className="mt-4" onClick={() => window.location.href = "/search"}>
                  Explore Listings
                </Button>
              </div>
            )}
          </section>
          
          {/* Recommendations Section */}
          <section className={cn(
            "mb-12",
            animateCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
            "transition-all duration-500"
          )} style={{ transitionDelay: '400ms' }}>
            <RecommendationCarousel
              title="Recommended For You"
              description="Items we think you'll love based on your style"
              fetchItems={() => getRecommendedItems(4)}
              onLikeItem={handleLikeItem}
              emptyMessage="We're still learning your style preferences. Like a few items to get personalized recommendations!"
            />
          </section>
          
          {/* Trending Searches */}
          <section className={cn(
            "glass-card p-6",
            animateCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
            "transition-all duration-500"
          )} style={{ transitionDelay: '450ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Trending Searches</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {trendingSearches.map((search, index) => (
                <button 
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <span>{search}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </section>
          
          {/* Upgrade Banner */}
          <section className={cn(
            "rounded-xl overflow-hidden relative",
            animateCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
            "transition-all duration-500"
          )} style={{ transitionDelay: '500ms' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-trove-sage to-trove-clay/80 opacity-90"></div>
            <div className="relative z-10 p-8 flex flex-col md:flex-row items-center justify-between">
              <div className="text-white mb-6 md:mb-0">
                <h2 className="text-2xl font-bold mb-2">Upgrade to Trove Premium</h2>
                <p className="opacity-90 max-w-md">
                  Get unlimited recommendations, advanced outfit matching, and exclusive early access to new thrift listings.
                </p>
              </div>
              <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
                Upgrade Now
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
