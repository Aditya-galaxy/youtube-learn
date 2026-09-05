"use client";

import React, { Suspense } from "react";
import { useSession } from "next-auth/react";
import Logo from "./Logo";
import MobileNav from "./MobileNav";
import SearchBar from "./SearchBar";
import NotificationsMenu from "./NotificationsMenu";
import UserMenu from "./UserMenu";
import { ModeToggle } from "../ModeToggle";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-20 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Logo />
        </div>
        <Suspense>
          <SearchBar />
        </Suspense>
        <div className="flex items-center gap-1">
          <ModeToggle />
          {session && <NotificationsMenu />}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
