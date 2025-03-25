
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Upload, Heart, GridIcon, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { ItemCard } from '@/components/ui/ItemCard';
import { cn } from '@/lib/utils';

// Sample data
const featuredItems = [
  {
    id: '1',
    title: 'Vintage 90s Levi\'s 501 Jeans',
    image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?q=80&w=1974&auto=format&fit=crop',
    price: '$65',
    platform: 'Depop',
    condition: 'Excellent'
  },
  {
    id: '2',
    title: 'Oversized Wool Blazer',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1972&auto=format&fit=crop',
    price: '$48',
    platform: 'ThredUp',
    condition: 'Good'
  },
  {
    id: '3',
    title: 'Y2K Graphic Baby Tee',
    image: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=1974&auto=format&fit=crop',
    price: '$32',
    platform: 'eBay',
    condition: 'New'
  },
  {
    id: '4',
    title: 'Retro Nike Windbreaker',
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=2127&auto=format&fit=crop',
    price: '$78',
    platform: 'Grailed',
    condition: 'Good'
  },
];

const Index = () => {
  // Add scroll animation for sections
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-slide-up');
          entry.target.classList.remove('opacity-0', 'translate-y-8');
        }
      });
    }, { threshold: 0.1 });

    const sections = document.querySelectorAll('.animate-on-scroll');
    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative pt-24 pb-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-trove-sage/20 via-transparent to-trove-cream/30"></div>
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
        </div>
        
        <div className="container-custom relative z-10 flex flex-col lg:flex-row items-center lg:gap-12">
          <div className="w-full lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
            <h1 className="hero-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-balance mb-6">
              Discover your style.{' '}
              <span className="text-primary">Sustainably.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-8">
              Trove helps you find unique thrift fashion that matches your personal style from multiple platforms, all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/dashboard">
                <Button size="lg" className="gap-2 rounded-full px-6 py-6">
                  <span>Get Started</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              
              <Link to="/search">
                <Button size="lg" variant="outline" className="gap-2 rounded-full px-6 py-6">
                  <Search className="h-5 w-5" />
                  <span>Explore Thrift Finds</span>
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 relative">
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-trove-sage/20 to-trove-clay/20 rounded-3xl transform rotate-6"></div>
              <img 
                src="https://images.unsplash.com/photo-1505022610485-0249ba5b3675?q=80&w=2070&auto=format&fit=crop"
                alt="Sustainable Fashion" 
                className="relative z-10 rounded-3xl object-cover w-full h-full shadow-xl transform -rotate-3 transition-transform duration-500 hover:rotate-0"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="section bg-background relative">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-on-scroll opacity-0 translate-y-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              How Trove Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Finding your perfect thrift items has never been easier. Upload your style, search with AI, and discover sustainable fashion.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card p-8 animate-on-scroll opacity-0 translate-y-8">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload Your Style</h3>
              <p className="text-muted-foreground">
                Share photos of outfits you love so we can understand your unique style preferences and taste.
              </p>
            </div>
            
            <div className="glass-card p-8 animate-on-scroll opacity-0 translate-y-8" style={{ transitionDelay: '100ms' }}>
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Search className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Search</h3>
              <p className="text-muted-foreground">
                Use natural language to search for pieces across multiple thrift platforms in one place.
              </p>
            </div>
            
            <div className="glass-card p-8 animate-on-scroll opacity-0 translate-y-8" style={{ transitionDelay: '200ms' }}>
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Heart className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Save & Shop</h3>
              <p className="text-muted-foreground">
                Save items you love and be directed to the original listing when you're ready to purchase.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Discover Section */}
      <section className="section bg-muted/30 relative">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 animate-on-scroll opacity-0 translate-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Discover Unique Finds
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Browse through thousands of one-of-a-kind items from multiple secondhand platforms.
              </p>
            </div>
            
            <Link to="/search" className="mt-6 md:mt-0">
              <Button variant="outline" className="gap-2">
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-on-scroll opacity-0 translate-y-8">
            {featuredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Sustainable Fashion Section */}
      <section className="section bg-background relative">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="w-full lg:w-1/2 animate-on-scroll opacity-0 translate-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-trove-clay/20 to-trove-sage/20 rounded-3xl transform -rotate-6"></div>
                <img 
                  src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1972&auto=format&fit=crop"
                  alt="Sustainable Fashion" 
                  className="relative z-10 rounded-3xl object-cover w-full aspect-square shadow-xl transform rotate-3 transition-transform duration-500 hover:rotate-0"
                />
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 animate-on-scroll opacity-0 translate-y-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Shop Secondhand, <br />
                <span className="text-primary">Save the Planet</span>
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8">
                By choosing secondhand fashion, you're helping reduce textile waste and the environmental impact of fast fashion.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Tag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Unique Style</h3>
                    <p className="text-muted-foreground">
                      Find one-of-a-kind vintage and secondhand pieces that express your individual style.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <GridIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Sustainable Choices</h3>
                    <p className="text-muted-foreground">
                      Every secondhand purchase helps reduce the 11.3 million tons of textile waste generated each year.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10">
                <Link to="/dashboard">
                  <Button size="lg" className="gap-2 rounded-full">
                    <span>Start Thrifting</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="section bg-primary/10 relative">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto animate-on-scroll opacity-0 translate-y-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Find Your Perfect Thrift Pieces?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join Trove today and discover sustainable fashion that matches your unique style.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="gap-2 rounded-full px-6 py-6">
                <span>Get Started Now</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 px-4 bg-background border-t border-border">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <span className="h-8 w-8 rounded-full bg-trove-sage text-white font-bold text-lg flex items-center justify-center">
                T
              </span>
              <span className="font-display text-xl font-semibold">Trove</span>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact Us
              </a>
              <p>&copy; {new Date().getFullYear()} Trove. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
