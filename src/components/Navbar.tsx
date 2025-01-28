import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, Search, Bell, User, 
  Sparkles, Settings,
  LogOut, UserCircle, BookMarked
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAppContext } from '../Helper/Context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const Navbar = () => {
  const context = useAppContext();
  const { handleSearch, searchQuery, setSearchQuery } = context;
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Course Available',
      message: 'Check out our latest React course',
      time: '5m ago',
      read: false
    },
    {
      id: '2',
      title: 'Weekly Summary',
      message: 'View your learning progress',
      time: '1h ago',
      read: false
    }
  ]);

  const handleNotificationClick = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const handleLogout = () => {
    // Add your logout logic here
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 z-50 backdrop-blur-xl bg-black/50 border-b border-white/5">
      <div className="flex items-center justify-between h-full max-w-[2500px] mx-auto px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white/70 hover:text-white hover:bg-white/5"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white transform group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-lg font-semibold text-white">Learn</span>
          </Link>
        </div>

        {/* Center Section - Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearch} className="w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, tutorials, and more..."
                className="w-full pl-10 border-white/10 bg-white/5 focus:bg-white/10 hover:bg-white/8 text-white placeholder:text-white/40"
              />
            </div>
            <Button 
              type="submit"
              variant="secondary"
              className="bg-purple-500 hover:bg-purple-600 text-white border-0"
            >
              Search
            </Button>
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/5 relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-black/90 border-white/10">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <span className="text-sm font-medium text-white">Notifications</span>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-white/50 hover:text-white"
                    onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="px-4 py-3 focus:bg-white/5 cursor-pointer"
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${notification.read ? 'text-white/70' : 'text-white font-medium'}`}>
                        {notification.title}
                      </span>
                      <span className="text-xs text-white/50">{notification.time}</span>
                    </div>
                    <span className="text-xs text-white/50">{notification.message}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="h-8 w-[1px] bg-white/10 mx-2" />
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                className="bg-white/5 hover:bg-white/10 text-white border-0"
              >
                <User className="w-4 h-4 mr-2" />
                Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-black/90 border-white/10">
              <DropdownMenuItem
                className="focus:bg-white/5"
                onClick={() => navigate('/profile')}
              >
                <UserCircle className="w-4 h-4 mr-2" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="focus:bg-white/5"
                onClick={() => navigate('/saved')}
              >
                <BookMarked className="w-4 h-4 mr-2" />
                <span>Saved</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="focus:bg-white/5"
                onClick={() => navigate('/settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="focus:bg-white/5 text-red-400 focus:text-red-400"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;