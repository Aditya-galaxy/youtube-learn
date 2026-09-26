"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Logo from "./Logo";
import MobileNav from "./MobileNav";
import SearchBar from "./SearchBar";
import NotificationsMenu from "./NotificationsMenu";
import UserMenu from "./UserMenu";
import { ModeToggle } from "../ModeToggle";

const Navbar = () => {
  const { data: session } = useSession();
  // The rule under the header is only needed once content passes beneath it;
  // at rest the header and the page share a background and the line is noise.
  //
  // The colour is forced: globals.css sets `* { @apply border-border }`, which
  // in this build wins over a plain border-transparent utility.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 h-20 border-b bg-background/80 backdrop-blur-xl transition-colors duration-200 ${
        scrolled ? "!border-border" : "!border-transparent"
      }`}
    >
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
