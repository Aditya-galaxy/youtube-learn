"use client"
import React,{ useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';
import NotificationItem from './NotificationItem';
import { Notification } from './types';

const NotificationsMenu = () => {
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
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
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={handleNotificationClick}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsMenu;