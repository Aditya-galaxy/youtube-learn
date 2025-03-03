"use client"
import React from 'react';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { Notification } from './types';

interface NotificationItemProps {
  notification: Notification;
  onClick: (id: string) => void;
}

const NotificationItem = ({ notification, onClick }: NotificationItemProps) => {
  return (
    <DropdownMenuItem
      className="px-4 py-3 focus:bg-white/5 cursor-pointer"
      onClick={() => onClick(notification.id)}
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
  );
};

export default NotificationItem;