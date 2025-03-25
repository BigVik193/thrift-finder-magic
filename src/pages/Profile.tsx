
import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
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
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('Profile');
  
  const tabs = [
    { name: 'Profile', icon: User },
    { name: 'Preferences', icon: Settings },
    { name: 'Subscription', icon: CreditCard },
    { name: 'Notifications', icon: Bell },
  ];
  
  const stylePreferences = [
    { name: 'Minimalist', percentage: 80 },
    { name: 'Vintage', percentage: 65 },
    { name: 'Streetwear', percentage: 45 },
    { name: 'Bohemian', percentage: 20 },
  ];
  
  const recentActivity = [
    { type: 'saved', text: 'Saved "Vintage Levi\'s Denim Jacket"', time: '2 hours ago' },
    { type: 'search', text: 'Searched for "oversized sweaters"', time: '1 day ago' },
    { type: 'upload', text: 'Uploaded 3 outfit photos', time: '3 days ago' },
    { type: 'saved', text: 'Saved "Y2K Platform Boots"', time: '1 week ago' },
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
                    {/* Placeholder Avatar */}
                    <User className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full shadow-sm">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                <h2 className="text-xl font-bold mb-1">Thrift Enthusiast</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  user@example.com
                </p>
                
                <div className="bg-muted/50 rounded-md py-2 px-3 flex items-center justify-center gap-2 mb-4">
                  <span className="text-xs font-medium">Free Plan</span>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                    Upgrade
                  </Button>
                </div>
                
                <Button variant="outline" className="w-full gap-2 text-muted-foreground">
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
              {activeTab === 'Profile' && (
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
                    
                    <div className="space-y-4">
                      {stylePreferences.map(style => (
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
                    
                    <div className="space-y-3">
                      {recentActivity.map((activity, index) => (
                        <div 
                          key={index}
                          className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors"
                        >
                          <div className="shrink-0 bg-secondary p-2 rounded-full">
                            {activity.type === 'saved' && <Heart className="h-4 w-4 text-primary" />}
                            {activity.type === 'search' && <User className="h-4 w-4 text-primary" />}
                            {activity.type === 'upload' && <Upload className="h-4 w-4 text-primary" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{activity.text}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                    
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
                          <input 
                            type="text" 
                            defaultValue="Thrift Enthusiast" 
                            className="w-full border border-border bg-background rounded-md px-3 py-2"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Email</label>
                          <input 
                            type="email" 
                            defaultValue="user@example.com" 
                            className="w-full border border-border bg-background rounded-md px-3 py-2"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Bio</label>
                        <textarea 
                          defaultValue="Thrift enthusiast passionate about sustainable fashion and vintage finds." 
                          className="w-full border border-border bg-background rounded-md px-3 py-2 min-h-[100px]"
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === 'Preferences' && (
                <>
                  <h1 className="text-2xl font-bold mb-6">Style Preferences</h1>
                  
                  {/* Preferences Content */}
                  <div className="glass-card p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Favorite Styles</h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                      {['Minimalist', 'Vintage', 'Y2K', 'Streetwear', 'Bohemian', 'Preppy', 'Athleisure', 'Grunge'].map(style => (
                        <label key={style} className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span>{style}</span>
                        </label>
                      ))}
                    </div>
                    
                    <h2 className="text-lg font-semibold mb-4">Sizes</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Tops</label>
                        <select className="w-full border border-border rounded-md p-2 bg-background">
                          <option>Select Size</option>
                          <option>XS</option>
                          <option>S</option>
                          <option>M</option>
                          <option>L</option>
                          <option>XL</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Bottoms</label>
                        <select className="w-full border border-border rounded-md p-2 bg-background">
                          <option>Select Size</option>
                          <option>26</option>
                          <option>28</option>
                          <option>30</option>
                          <option>32</option>
                          <option>34</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Shoes</label>
                        <select className="w-full border border-border rounded-md p-2 bg-background">
                          <option>Select Size</option>
                          <option>US 6</option>
                          <option>US 7</option>
                          <option>US 8</option>
                          <option>US 9</option>
                          <option>US 10</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Outerwear</label>
                        <select className="w-full border border-border rounded-md p-2 bg-background">
                          <option>Select Size</option>
                          <option>XS</option>
                          <option>S</option>
                          <option>M</option>
                          <option>L</option>
                          <option>XL</option>
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
                        defaultValue="100"
                        className="w-full" 
                      />
                      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        <span>Budget</span>
                        <span>Max: $100</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button>
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === 'Subscription' && (
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
              
              {activeTab === 'Notifications' && (
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
