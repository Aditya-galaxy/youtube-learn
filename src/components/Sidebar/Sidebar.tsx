import React, { forwardRef, Ref } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, TrendingUp, Library, History, Bookmark, Settings } from 'lucide-react';

import SidebarNavigation from './Navigation';
import ProFeaturesBanner from './ProFeatures';
import BuyMeACoffee from './BuyMeACoffee';

type SidebarProps = {
  activeRoute: string;
  onNavigation: (path: string) => void;
};

const menuItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: TrendingUp, label: 'Trending', path: '/trending' },
  { icon: Library, label: 'Library', path: '/library' },
  { icon: History, label: 'History', path: '/history' },
  { icon: Bookmark, label: 'Saved', path: '/saved' },
  { icon: Settings, label: 'Settings', path: '/settings' }
];

const Sidebar = forwardRef<HTMLElement, SidebarProps>(({ activeRoute, onNavigation }, ref: Ref<HTMLElement>) => {
  const navigate = useNavigate();

  const handleMenuItemClick = (path: string) => {
    onNavigation(path);
    navigate(path);
  };

  return (
    <aside
      className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-44 z-0 bg-black/50 backdrop-blur-xl border-r border-white/5 focus:outline-none"
      tabIndex={0}
      ref={ref}
    >
      <div className="p-4">
        <SidebarNavigation 
          menuItems={menuItems} 
          onMenuItemClick={handleMenuItemClick}
        />
        
        <ProFeaturesBanner onUpgradeClick={() => handleMenuItemClick('/plans')} />
        
        <BuyMeACoffee />
      </div>
    </aside>
  );
});

export default Sidebar;