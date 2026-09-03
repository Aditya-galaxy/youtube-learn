"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/config/navigation";

type NavigationProps = {
  onNavigate?: () => void;
};

const Navigation = React.memo(({ onNavigate }: NavigationProps) => {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.path;

        return (
          <Link
            key={item.path}
            href={item.path}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors",
              isActive
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                : "text-muted-foreground hover:bg-purple-500/20 hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
});

Navigation.displayName = "Navigation";

export default Navigation;
