import React, { forwardRef, Ref, useImperativeHandle } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, TrendingUp, Library, History, Bookmark, Settings } from 'lucide-react';

type SidebarProps = {
  activeRoute: string;
  onNavigation: (path: string) => void;
};

const Sidebar = forwardRef<HTMLElement, SidebarProps>(({ activeRoute, onNavigation }, ref: Ref<HTMLElement>) => {
  const navigate = useNavigate();

  const handleMenuItemClick = (path: string) => {
    onNavigation(path);
    navigate(path);
  };

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: TrendingUp, label: 'Trending', path: '/trending' },
    { icon: Library, label: 'Library', path: '/library' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Bookmark, label: 'Saved', path: '/saved' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  return (
    <aside
      className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-44 z-0 bg-black/50 backdrop-blur-xl border-r border-white/5 focus:outline-none"
      tabIndex={0}
      ref={ref}
    >
      <div className="p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white/10 text-purple-400'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
              onClick={() => handleMenuItemClick(item.path)}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-700/20 border border-purple-500/20">
          <h3 className="text-sm font-medium text-white/90 mb-2">
            Pro Features
          </h3>
          <p className="text-xs text-white/50 mb-3">
            Unlock advanced learning tools and exclusive content
          </p>
          <button onClick={() => handleMenuItemClick('/plans')} className="w-full px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
});

export default Sidebar;