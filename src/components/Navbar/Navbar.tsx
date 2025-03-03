"use client"
import React from "react";
import { useSession } from "next-auth/react";
import Logo from './Logo';
import SearchBar from './SearchBar';
import NotificationsMenu from './NotificationsMenu';
import UserMenu from './UserMenu';
import { ModeToggle } from "../ModeToggle";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 z-50 bg-background/70 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full max-w-[2500px] mx-auto px-6">
        <Logo />
        <SearchBar />
        <div className="flex items-center gap-2">
          {/* <ModeToggle /> Light theme not setup yet */}
          {session && (
            <>
              <NotificationsMenu />
            </>
          )}
          <UserMenu />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;