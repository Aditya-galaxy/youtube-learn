"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type MenuItem = {
  icon: LucideIcon;
  label: string;
  path: string;
};

type NavigationProps = {
  menuItems: MenuItem[];
};

const Navigation = React.memo(({ menuItems }: NavigationProps) => {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {menuItems.map((item) => {
        const isActive = pathname === item.path;
        
        return (
          <Link
            key={item.label}
            href={item.path}
            prefetch={true}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
              isActive
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                : "text-white/70 hover:bg-purple-500/20 hover:text-white"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;