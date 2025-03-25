
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Heart, Upload, GridIcon, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NavLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: <GridIcon className="h-5 w-5" /> },
  { name: 'Search', path: '/search', icon: <Search className="h-5 w-5" /> },
  { name: 'Upload', path: '/upload', icon: <Upload className="h-5 w-5" /> },
  { name: 'Wardrobe', path: '/wardrobe', icon: <GridIcon className="h-5 w-5" /> },
  { name: 'Saved', path: '/saved', icon: <Heart className="h-5 w-5" /> },
];

export const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isRootPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-6',
        {
          'py-3 bg-background/80 backdrop-blur-md shadow-sm': isScrolled,
          'py-6': !isScrolled,
          'bg-transparent': !isScrolled && isRootPage,
          'bg-background/80 backdrop-blur-md': !isScrolled && !isRootPage
        }
      )}
    >
      <div className="container-custom flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 relative z-50"
          aria-label="Trove Home"
        >
          <span 
            className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center bg-trove-sage text-white font-bold text-xl transition-all duration-300",
              { "bg-opacity-90": isScrolled && isRootPage }
            )}
          >
            T
          </span>
          <span 
            className={cn(
              "font-display text-xl font-semibold transition-all duration-300",
              { 
                "text-white": !isScrolled && isRootPage,
                "text-foreground": isScrolled || !isRootPage 
              }
            )}
          >
            Trove
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {!isRootPage && (
            <ul className="flex items-center space-x-1">
              {NavLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-md transition-all",
                      {
                        "bg-primary/10 text-primary font-medium": location.pathname === link.path,
                        "hover:bg-muted": location.pathname !== link.path,
                        "text-white hover:bg-white/10": !isScrolled && isRootPage,
                        "text-foreground/80 hover:text-foreground": isScrolled || !isRootPage
                      }
                    )}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link to={isRootPage ? "/dashboard" : "/profile"}>
            <Button 
              size="sm" 
              variant={isRootPage ? "default" : "outline"}
              className={cn(
                "ml-4 font-medium", 
                {
                  "bg-white text-primary hover:bg-white/90": !isScrolled && isRootPage,
                }
              )}
            >
              {isRootPage ? "Get Started" : (
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </div>
              )}
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden relative z-50 p-2"
          onClick={handleMobileMenuToggle}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X 
              className={cn(
                "h-6 w-6 transition-all", 
                { "text-white": !isScrolled && isRootPage && !mobileMenuOpen, 
                  "text-foreground": isScrolled || !isRootPage || mobileMenuOpen 
                }
              )} 
            />
          ) : (
            <Menu 
              className={cn(
                "h-6 w-6 transition-all", 
                { "text-white": !isScrolled && isRootPage, 
                  "text-foreground": isScrolled || !isRootPage 
                }
              )} 
            />
          )}
        </button>

        {/* Mobile Menu */}
        <div 
          className={cn(
            "fixed inset-0 bg-background flex flex-col md:hidden transition-all duration-300 ease-in-out",
            {
              "opacity-100 translate-x-0": mobileMenuOpen,
              "opacity-0 translate-x-full pointer-events-none": !mobileMenuOpen
            }
          )}
        >
          <div className="pt-20 px-6 flex flex-col gap-2">
            {NavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg transition-all",
                  {
                    "bg-primary/10 text-primary font-medium": location.pathname === link.path,
                    "hover:bg-muted": location.pathname !== link.path
                  }
                )}
              >
                {link.icon}
                <span className="text-lg">{link.name}</span>
              </Link>
            ))}
            <Link to="/profile" className="mt-4">
              <Button 
                variant="outline" 
                className="w-full justify-start text-lg gap-3 p-4 h-auto"
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
