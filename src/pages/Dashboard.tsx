
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Upload, 
  Grid3x3, 
  Heart, 
  ArrowUpRight, 
  Bell, 
  TrendingUp,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/button';
import { ItemCard } from '@/components/ui/ItemCard';
import { cn } from '@/lib/utils';

// Sample data
const recentSearches = ["vintage denim jacket", "y2k tops", "leather boots size 9"];

const savedItems = [
  {
    id: '1',
    title: 'Vintage Levi\'s Denim Jacket',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1972&auto=format&fit=crop',
    price: '$78',
    platform: 'eBay',
    condition: 'Good'
  },
  {
    id: '2',
    title: 'Retro Graphic Tee',
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=2127&auto=format&fit=crop',
    price: '$25',
    platform: 'Depop',
    condition: 'Excellent'
  },
  {
    id: '3',
    title: 'Wool Oversized Blazer',
    image: 'https://images.unsplash.com/photo-1608744882201-52a7f7f3dd60?q=80&w=1974&auto=format&fit=crop',
    price: '$65',
    platform: 'ThredUp',
    condition: 'Like New'
  },
];

const recommendations = [
  {
    id: '4',
    title: 'Platform Doc Martens',
    image: 'https://images.unsplash.com/photo-1605812860427-4024433a70fd?q=80&w=1974&auto=format&fit=crop',
    price: '$120',
    platform: 'Poshmark',
    condition: 'Good'
  },
  {
    id: '5',
    title: 'Vintage Silk Scarf',
    image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?q=80&w=1974&auto=format&fit=crop',
    price: '$18',
    platform: 'Etsy',
    condition: 'Excellent'
  },
  {
    id: '6',
    title: 'High-Waisted Mom Jeans',
    image: 'https://images.unsplash.com/photo-1577900234203-28f3962ef521?q=80&w=1974&auto=format&fit=crop',
    price: '$45',
    platform: 'Depop',
    condition: 'Good'
  },
  {
    id: '7',
    title: 'Chunky Knit Sweater',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2072&auto=format&fit=crop',
    price: '$37',
    platform: 'ThredUp',
    condition: 'Like New'
  },
];

const trendingSearches = ["baggy cargo pants", "chunky loafers", "oversized cardigan", "90s sunglasses"];

const Dashboard = () => {
  const [greeting, setGreeting] = useState('Good day');
  const [animateCards, setAnimateCards] = useState(false);

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

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // This would navigate to search page with the query
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <main className="pt-24 px-4">
        <div className="container-custom">
          {/* Header Section */}
          <div className="mb-10 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {greeting}, <span className="text-primary">Thrifter</span>
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
            
            <Link to="/saved" className={cn(
              "glass-card p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-hover hover:-translate-y-1",
              animateCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
              "transition-all duration-500"
            )} style={{ transitionDelay: '300ms' }}>
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Heart className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Saved Items</h3>
              <p className="text-sm text-muted-foreground">
                View your favorited thrift finds
              </p>
            </Link>
          </div>
          
          {/* Saved Items Section */}
          {savedItems.length > 0 && (
            <section className={cn(
              "mb-12",
              animateCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
              "transition-all duration-500"
            )} style={{ transitionDelay: '350ms' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Recently Saved</h2>
                <Link to="/saved" className="text-primary flex items-center gap-1 text-sm hover:underline">
                  <span>View all</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedItems.map(item => (
                  <ItemCard key={item.id} item={item} saved={true} />
                ))}
              </div>
            </section>
          )}
          
          {/* Recommendations Section */}
          <section className={cn(
            "mb-12",
            animateCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
            "transition-all duration-500"
          )} style={{ transitionDelay: '400ms' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">Recommended For You</h2>
                <div className="bg-primary/10 px-2 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary">AI-powered</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-sm">
                Refresh
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
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
