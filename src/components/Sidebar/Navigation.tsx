import React from 'react';
import { NavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

type MenuItem = {
  icon: LucideIcon;
  label: string;
  path: string;
};

type NavigationProps = {
  menuItems: MenuItem[];
  onMenuItemClick: (path: string) => void;
};

const Navigation: React.FC<NavigationProps> = ({ menuItems, onMenuItemClick }) => {
  return (
    <nav className="space-y-4">
      {menuItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.path}
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
              isActive
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                : 'text-white/70 hover:bg-purple-500/20 hover:text-white'
            }`
          }
          onClick={() => onMenuItemClick(item.path)}
        >
          <item.icon className="w-4 h-4" />
          <span className="text-sm font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default Navigation;