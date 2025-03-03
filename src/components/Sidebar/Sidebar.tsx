"use client"

import React, { useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, TrendingUp, Library, History, Bookmark, Settings } from 'lucide-react';
import Navigation from './Navigation';
import ProFeaturesBanner from './ProFeatures';
import BuyMeACoffee from './BuyMeACoffee';

const Sidebar = () => {
  const router = useRouter();

  const menuItems = useMemo(() => [
    { icon: Home, label: 'Home', path: '/' },
    { icon: TrendingUp, label: 'Trending', path: '/trending' },
    { icon: Library, label: 'Library', path: '/library' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Bookmark, label: 'Saved', path: '/saved' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ], []);

  const handleNavigation = (path: string) => {
    router.prefetch(path); // Prefetch the next route
    router.push(path);
  };

  return (
    <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-44 z-0 bg-black/50 backdrop-blur-xl border-r border-white/5 focus:outline-none">
      <div className="p-4">
        <Navigation 
          menuItems={menuItems} 
          onNavigate={handleNavigation}
        />
        <ProFeaturesBanner 
          onUpgradeClick={() => handleNavigation('/plans')} 
        />
        <BuyMeACoffee />
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);