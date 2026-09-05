"use client";
import React from "react";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { Notification } from "./types";

interface NotificationItemProps {
  notification: Notification;
  onClick: (id: string) => void;
}

const NotificationItem = ({ notification, onClick }: NotificationItemProps) => (
  <DropdownMenuItem
    className="cursor-pointer flex-col items-start gap-1 rounded-sm px-3 py-3"
    onClick={() => onClick(notification.id)}
  >
    <div className="flex w-full items-baseline justify-between gap-3">
      <span
        className={`text-sm tracking-tightish ${
          notification.read ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {notification.title}
      </span>
      <span className="shrink-0 text-xs tracking-tightish text-muted-foreground">
        {notification.time}
      </span>
    </div>
    <span className="text-xs tracking-tightish text-muted-foreground">
      {notification.message}
    </span>
  </DropdownMenuItem>
);

export default NotificationItem;
