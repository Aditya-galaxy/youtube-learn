"use client"

import React from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { UserCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import SignInButton from '../auth/SignInButton';

const UserMenu = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  if (!session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="secondary"
            className="bg-purple-500 hover:bg-purple-600 text-white border-0"
          >
            Sign in
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-80 p-4 bg-black/90 border-white/10"
        >
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">Welcome to YTLearn</h3>
              <p className="text-sm text-white/60">Sign in to continue learning</p>
            </div>
            <SignInButton />
            <div className="text-center text-sm">
              <span className="text-white/40">Don't have an account? </span>
              <button 
                className="text-purple-400 hover:text-purple-300"
                onClick={() => signIn('google', { callbackUrl: '/' })}
              >
                Sign up
              </button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary" 
          className="bg-white/5 hover:bg-white/10 text-white border-0"
        >
          <img 
            src={session.user?.image ?? ''}
            alt="Profile"
            className="h-5 w-5 rounded-full"
          />
          {session.user?.name || 'Account'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-black/90 border-white/10">
        <DropdownMenuItem
          className="focus:bg-white/5"
          onClick={() => router.push('/profile')}
        >
          <UserCircle className="w-4 h-4 mr-2" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          className="focus:bg-white/5 text-purple-400 focus:text-purple-500"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;