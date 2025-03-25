import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  CreditCard, 
  Settings, 
  LogOut, 
  Bell, 
  Heart, 
  Clock, 
  Edit, 
  Upload,
  CheckCircle2,
  ChevronRight,
  Search,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  getUserProfile, 
  getUserStylePreferences, 
  getRecentActivity,
  updateStylePreferences,
  signOutUser,
  StyleScore,
  UserProfile,
  StylePreference,
  RecentActivity
} from '@/services/profileService';

// List of all style categories
const STYLE_CATEGORIES = [
  'Streetwear',
  'Minimalist',
  'Vintage',
  'Athleisure',
  'Skater',
  'Y2K',
  'Workwear',
  'Bohemian',
  'Business Casual',
  'Classic Preppy',
  'Formalwear',
  'Smart Casual',
  'Goth/Techwear',
  'Punk/Grunge',
  'Rockstar/Edgy',
  'Western/Cowboy',
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState('Profile');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stylePreferences, setStylePreferences] = useState<StylePreference | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [priceRange, setPriceRange] = useState<number>(100);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Form states
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [sizes, setSizes] = useState({
    tops: '',
    bottoms: '',
    shoes: '',
    outerwear: ''
  });
  
  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Load user data
    loadUserData();
  }, [user, navigate]);
  
  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load profile data
      const profileData = await getUserProfile();
      setProfile(profileData);
      
      if (profileData) {
        setName(profileData.name || '');
      }
      
      // Load style preferences
      const preferencesData = await getUserStylePreferences();
      setStylePreferences(preferencesData);
      
      if (preferencesData) {
        // Set selected styles (those with scores > 0)
        const selected = Object.entries(preferencesData.style_scores || {})
          .filter(([_, score]) => score > 0)
          .map(([style]) => style);
        setSelectedStyles(selected);
        
        // Set price range
        if (preferencesData.price_range) {
          setPriceRange(preferencesData.price_range.max);
        }
        
        // Set sizes
        if (preferencesData.sizes) {
          setSizes({
            tops: preferencesData.sizes.tops || '',
            bottoms: preferencesData.sizes.bottoms || '',
            shoes: preferencesData.sizes.shoes || '',
            outerwear: preferencesData.sizes.outerwear || '',
          });
        }
      }
      
      // Load recent activity
      const activityData = await getRecentActivity();
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    await signOutUser();
    navigate('/auth');
  };
  
  const handleSaveProfile = async () => {
    if (!profile) return;
    
    toast.success('Profile updated successfully');
    // Note: This is a placeholder - we would add profile update functionality here
  };
  
  const handleSavePreferences = async () => {
    if (!stylePreferences) return;
    
    // Create updated style scores object
    const styleScores: StyleScore = {};
    
    // Set scores for selected styles to 1, others to 0
    STYLE_CATEGORIES.forEach(style => {
      styleScores[style] = selectedStyles.includes(style) ? 1 : 0;
    });
    
    // Update preferences in database
    const success = await updateStylePreferences({
      style_scores: styleScores,
      price_range: {
        min: 0,
        max: priceRange
      },
      sizes: {
        tops: sizes.tops || null,
        bottoms: sizes.bottoms || null,
        shoes: sizes.shoes || null,
        outerwear: sizes.outerwear || null
      }
    });
    
    if (success) {
      // Refresh style preferences data
      const updatedPrefs = await getUserStylePreferences();
      setStylePreferences(updatedPrefs);
    }
  };
  
  const handleStyleSelect = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };
  
  // Get top styles based on scores
  const getTopStyles = () => {
    if (!stylePreferences?.style_scores) return [];
    
    return Object.entries(stylePreferences.style_scores)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([style, score]) => ({
        name: style,
        percentage: Math.min(100, Math.max(0, score * 100))
      }));
  };
  
  const topStyles = getTopStyles();
  
  const tabs = [
    { name: 'Profile', icon: User },
    { name: 'Preferences', icon: Settings },
    { name: 'Subscription', icon: CreditCard },
    { name: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 px-4 pb-20">
        <div className="container-custom max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
            {/* Sidebar */}
            <div className="md:sticky md:top-28 h-fit animate-fade-in">
              {/* Profile Card */}
              <div className="glass-card p-6 mb-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-muted rounded-full overflow-hidden flex items-center justify-center">
                    {profile?.profile_picture ? (
                      <img 
                        src={profile.profile_picture} 
                        alt={profile.name}
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <User className="h-12 w-12 text-muted-foreground/50" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full shadow-sm">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                <h2 className="text-xl font-bold mb-1">
                  {loading ? (
                    <div className="h-7 bg-muted animate-pulse rounded w-3/4 mx-auto"></div>
                  ) : (
                    profile?.name || "Thrift Enthusiast"
                  )}
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  {loading ? (
                    <div className="h-5 bg-muted animate-pulse rounded w-1/2 mx-auto"></div>
                  ) : (
                    user?.email || "user@example.com"
                  )}
                </p>
                
                <div className="bg-muted/50 rounded-md py-2 px-3 flex items-center justify-center gap-2 mb-4">
                  <span className="text-xs font-medium">Free Plan</span>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                    Upgrade
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full gap-2 text-muted-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
              
              {/* Navigation Tabs */}
              <div className="bg-muted/30 rounded-xl overflow-hidden">
                <nav>
                  {tabs.map(tab => (
                    <button
                      key={tab.name}
                      onClick={() => setActiveTab(tab.name)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors",
                        activeTab === tab.name
                          ? "bg-primary/10 text-primary border-l-2 border-primary"
                          : "hover:bg-muted border-l-2 border-transparent"
                      )}
                    >
                      <tab.icon className="h-5 w-5" />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              {loading && (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              
              {!loading && activeTab === 'Profile' && (
                <>
                  <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
                  
                  {/* Style Analysis Card */}
                  <div className="glass-card p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Your Style Analysis</h2>
                      <Button variant="ghost" size="sm" className="gap-1 text-xs">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload More</span>
                      </Button>
                    </div>
                    
                    {topStyles.length > 0 ? (
                      <div className="space-y-4">
                        {topStyles.map(style => (
                          <div key={style.name}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{style.name}</span>
                              <span className="text-sm text-muted-foreground">{style.percentage}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${style.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <div className="bg-muted/30 p-3 rounded-lg inline-block mb-3">
                          <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-base font-medium mb-1">Still learning your style</h3>
                        <p className="text-sm text-muted-foreground">
                          We're still learning your style preferences. Keep engaging with items to help us get to know your tastes better!
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-6 pt-4 border-t border-border">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 bg-primary/10 p-2 rounded-full">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">Style Match</h3>
                          <p className="text-sm text-muted-foreground">
                            We'll use this information to find thrift pieces that match your personal style.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Activity */}
                  <div className="glass-card p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                    
                    {recentActivity.length > 0 ? (
                      <div className="space-y-3">
                        {recentActivity.map((activity) => (
                          <div 
                            key={activity.id}
                            className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors"
                          >
                            <div className="shrink-0 bg-secondary p-2 rounded-full">
                              {activity.type === 'saved' && <Heart className="h-4 w-4 text-primary" />}
                              {activity.type === 'search' && <Search className="h-4 w-4 text-primary" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">{activity.text}</p>
                              <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <div className="bg-muted/30 p-3 rounded-lg inline-block mb-3">
                          <Clock className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-base font-medium mb-1">No activity yet</h3>
                        <p className="text-sm text-muted-foreground">
                          You haven't liked or saved anything yet. Start exploring to see your activity here!
                        </p>
                      </div>
                    )}
                    
                    <Button variant="ghost" size="sm" className="w-full mt-4">
                      View All Activity
                    </Button>
                  </div>
                  
                  {/* Account Settings */}
                  <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Name</label>
                          <Input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-border bg-background rounded-md px-3 py-2"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Email</label>
                          <Input 
                            type="email" 
                            value={user?.email || ''}
                            disabled
                            className="w-full border border-border bg-background rounded-md px-3 py-2 opacity-70"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Bio</label>
                        <Textarea 
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us about yourself and your style"
                          className="w-full border border-border bg-background rounded-md px-3 py-2 min-h-[100px]"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button onClick={handleSaveProfile}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </>
              )}
              
              {!loading && activeTab === 'Preferences' && (
                <>
                  <h1 className="text-2xl font-bold mb-6">Style Preferences</h1>
                  
                  {/* Preferences Content */}
                  <div className="glass-card p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Favorite Styles</h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                      {STYLE_CATEGORIES.map(style => (
                        <label key={style} className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={selectedStyles.includes(style)}
                            onChange={() => handleStyleSelect(style)}
                            className="rounded" 
                          />
                          <span>{style}</span>
                        </label>
                      ))}
                    </div>
                    
                    <h2 className="text-lg font-semibold mb-4">Sizes</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Tops</label>
                        <select 
                          className="w-full border border-border rounded-md p-2 bg-background"
                          value={sizes.tops}
                          onChange={(e) => setSizes({...sizes, tops: e.target.value})}
                        >
                          <option value="">Select Size</option>
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Bottoms</label>
                        <select 
                          className="w-full border border-border rounded-md p-2 bg-background"
                          value={sizes.bottoms}
                          onChange={(e) => setSizes({...sizes, bottoms: e.target.value})}
                        >
                          <option value="">Select Size</option>
                          <option value="26">26</option>
                          <option value="28">28</option>
                          <option value="30">30</option>
                          <option value="32">32</option>
                          <option value="34">34</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Shoes</label>
                        <select 
                          className="w-full border border-border rounded-md p-2 bg-background"
                          value={sizes.shoes}
                          onChange={(e) => setSizes({...sizes, shoes: e.target.value})}
                        >
                          <option value="">Select Size</option>
                          <option value="US 6">US 6</option>
                          <option value="US 7">US 7</option>
                          <option value="US 8">US 8</option>
                          <option value="US 9">US 9</option>
                          <option value="US 10">US 10</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Outerwear</label>
                        <select 
                          className="w-full border border-border rounded-md p-2 bg-background"
                          value={sizes.outerwear}
                          onChange={(e) => setSizes({...sizes, outerwear: e.target.value})}
                        >
                          <option value="">Select Size</option>
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                        </select>
                      </div>
                    </div>
                    
                    <h2 className="text-lg font-semibold mb-4">Price Range</h2>
                    
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span>$0</span>
                        <span>$200+</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="200" 
                        value={priceRange}
                        onChange={(e) => setPriceRange(parseInt(e.target.value))}
                        className="w-full" 
                      />
                      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        <span>Budget</span>
                        <span>Max: ${priceRange}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button onClick={handleSavePreferences}>
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                </>
              )}
              
              {!loading && activeTab === 'Subscription' && (
                <>
                  <h1 className="text-2xl font-bold mb-6">Your Subscription</h1>
                  
                  {/* Current Plan */}
                  <div className="glass-card p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Current Plan</h2>
                    
                    <div className="bg-muted/50 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Free Plan</h3>
                          <p className="text-sm text-muted-foreground">Basic thrifting features</p>
                        </div>
                        <div className="bg-primary/10 px-3 py-1 rounded-full">
                          <span className="text-sm text-primary font-medium">Current</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-border">
                        <h4 className="text-sm font-medium mb-2">Includes:</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                            <span>Up to 10 saved items</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                            <span>Basic outfit matching</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                            <span>Limited style analysis</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    {/* Premium Plan */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Premium Plan</h3>
                          <p className="text-sm text-muted-foreground">Enhanced thrifting experience</p>
                        </div>
                        <div>
                          <span className="text-xl font-bold">$7.99</span>
                          <span className="text-sm text-muted-foreground">/month</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-primary/10">
                        <h4 className="text-sm font-medium mb-2">Everything in Free, plus:</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                            <span>Unlimited saved items</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                            <span>Advanced outfit matching</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                            <span>Price drop alerts</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                            <span>Early access to new thrift listings</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="mt-6">
                        <Button className="w-full">
                          Upgrade to Premium
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {!loading && activeTab === 'Notifications' && (
                <>
                  <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
                  
                  <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold mb-4">Email Notifications</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">New Recommendations</h3>
                          <p className="text-sm text-muted-foreground">
                            Get notified when we find new items that match your style
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Price Drops</h3>
                          <p className="text-sm text-muted-foreground">
                            Alert when saved items drop in price
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">New Features</h3>
                          <p className="text-sm text-muted-foreground">
                            Stay updated with new Trove features
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Marketing Emails</h3>
                          <p className="text-sm text-muted-foreground">
                            Receive occasional promotions and newsletters
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-border">
                      <h2 className="text-lg font-semibold mb-4">Push Notifications</h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        Enable browser notifications to receive alerts even when you're not on the site.
                      </p>
                      <Button>
                        Enable Push Notifications
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
