"use client";
import React, { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import NotificationItem from "./NotificationItem";
import { Notification } from "./types";

const NotificationsMenu = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New course available",
      message: "Check out the latest React course",
      time: "5m ago",
      read: false,
    },
    {
      id: "2",
      title: "Weekly summary",
      message: "View your learning progress",
      time: "1h ago",
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <span className="relative">
            <Bell strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-foreground" />
            )}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-md p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="eyebrow">Notifications</p>
          {unreadCount > 0 && (
            <button
              type="button"
              className="text-xs tracking-tightish text-muted-foreground hover:text-foreground"
              onClick={() =>
                setNotifications((prev) =>
                  prev.map((n) => ({ ...n, read: true }))
                )
              }
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="p-1">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={(id) =>
                setNotifications((prev) =>
                  prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                )
              }
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsMenu;
