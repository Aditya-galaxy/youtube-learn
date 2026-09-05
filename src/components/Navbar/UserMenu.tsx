"use client";

import React from "react";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const UserMenu = () => {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    return (
      <Button size="sm" onClick={() => signIn("google", { callbackUrl: "/" })}>
        Sign in
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="ml-1 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-secondary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 object-cover"
            />
          ) : (
            <UserRound className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-md">
        <div className="px-3 py-2.5">
          <p className="truncate text-sm tracking-tightish text-foreground">
            {session.user?.name}
          </p>
          <p className="truncate text-xs tracking-tightish text-muted-foreground">
            {session.user?.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="rounded-sm text-sm tracking-tightish"
          onClick={() => router.push("/profile")}
        >
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-sm text-sm tracking-tightish"
          onClick={() => router.push("/dashboard")}
        >
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="rounded-sm text-sm tracking-tightish"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
