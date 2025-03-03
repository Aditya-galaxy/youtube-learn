import { Home, TrendingUp, Library, History, Bookmark, Settings } from 'lucide-react';

export const navigationConfig = {
  menuItems: [
    { icon: Home, label: 'Home', path: '/' },
    { icon: TrendingUp, label: 'Trending', path: '/trending' },
    { icon: Library, label: 'Library', path: '/library' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Bookmark, label: 'Saved', path: '/saved' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ]
} as const;